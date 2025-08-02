import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FormSubmission {
  id: string;
  form_id: string;
  submission_data: Record<string, any>;
  submitted_at: string;
}

interface Form {
  id: string;
  title: string;
  fields: Array<{
    id: string;
    label: string;
    type: string;
  }>;
  google_sheets_enabled: boolean;
  google_sheets_spreadsheet_id: string;
  google_sheets_worksheet_name: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const googleServiceAccountKey = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_KEY');

    if (!googleServiceAccountKey) {
      console.error('[GOOGLE-SHEETS] Missing Google Service Account Key');
      return new Response(
        JSON.stringify({ error: 'Google Service Account not configured' }),
        { status: 500, headers: corsHeaders }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { submissionId } = await req.json();
    console.log('[GOOGLE-SHEETS] Processing submission', submissionId);

    // Fetch submission and form data
    const { data: submission, error: submissionError } = await supabase
      .from('form_submissions')
      .select(`
        id,
        form_id,
        submission_data,
        submitted_at,
        forms!inner(
          id,
          title,
          fields,
          google_sheets_enabled,
          google_sheets_spreadsheet_id,
          google_sheets_worksheet_name
        )
      `)
      .eq('id', submissionId)
      .single();

    if (submissionError || !submission) {
      console.error('[GOOGLE-SHEETS] Failed to fetch submission:', submissionError);
      return new Response(
        JSON.stringify({ error: 'Submission not found' }),
        { status: 404, headers: corsHeaders }
      );
    }

    const form = submission.forms as unknown as Form;
    
    if (!form.google_sheets_enabled || !form.google_sheets_spreadsheet_id) {
      console.log('[GOOGLE-SHEETS] Google Sheets not enabled for this form');
      return new Response(
        JSON.stringify({ message: 'Google Sheets not enabled' }),
        { status: 200, headers: corsHeaders }
      );
    }

    console.log(`[GOOGLE-SHEETS] Attempting delivery to spreadsheet ${form.google_sheets_spreadsheet_id}, worksheet ${form.google_sheets_worksheet_name}`);

    // Parse service account credentials
    const serviceAccount = JSON.parse(googleServiceAccountKey);
    
    // Get access token using service account
    const accessToken = await getServiceAccountAccessToken(serviceAccount);
    
    // Check if sheet exists and get its properties
    const sheetId = await getOrCreateWorksheet(
      form.google_sheets_spreadsheet_id,
      form.google_sheets_worksheet_name || 'Sheet1',
      accessToken
    );

    // Prepare the data row
    const headers = form.fields.map(field => field.label || field.id);
    const values = form.fields.map(field => {
      const value = submission.submission_data[field.id];
      return Array.isArray(value) ? value.join(', ') : String(value || '');
    });

    // Check if headers exist, if not add them
    await ensureHeaders(
      form.google_sheets_spreadsheet_id,
      form.google_sheets_worksheet_name || 'Sheet1',
      headers,
      accessToken
    );

    // Append the data
    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${form.google_sheets_spreadsheet_id}/values/${form.google_sheets_worksheet_name || 'Sheet1'}:append?valueInputOption=RAW`;
    
    const appendResponse = await fetch(appendUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [values],
      }),
    });

    if (!appendResponse.ok) {
      const errorText = await appendResponse.text();
      console.error('[GOOGLE-SHEETS] Error:', appendResponse.status, '-', errorText);
      throw new Error(`Google Sheets API error: ${appendResponse.status} - ${errorText}`);
    }

    const result = await appendResponse.json();
    console.log('[GOOGLE-SHEETS] Successfully appended data:', result);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Data successfully added to Google Sheets',
        updatedRange: result.updates?.updatedRange
      }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('[GOOGLE-SHEETS] Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});

async function getServiceAccountAccessToken(serviceAccount: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const expiry = now + 3600; // 1 hour

  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    exp: expiry,
    iat: now,
  };

  // Create JWT token (simplified - in production, use a proper JWT library)
  const jwtToken = await createJWT(header, payload, serviceAccount.private_key);

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwtToken}`,
  });

  if (!tokenResponse.ok) {
    throw new Error(`Token request failed: ${tokenResponse.status}`);
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

async function createJWT(header: any, payload: any, privateKey: string): Promise<string> {
  // Import the crypto library for JWT creation
  const encoder = new TextEncoder();
  
  const headerB64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payloadB64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  const data = `${headerB64}.${payloadB64}`;
  
  // Import the private key
  const keyData = privateKey
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');
  
  const keyBuffer = Uint8Array.from(atob(keyData), c => c.charCodeAt(0));
  
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyBuffer,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    encoder.encode(data)
  );
  
  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  
  return `${data}.${signatureB64}`;
}

async function getOrCreateWorksheet(spreadsheetId: string, worksheetName: string, accessToken: string): Promise<number> {
  const sheetUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`;
  
  const response = await fetch(sheetUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get spreadsheet info: ${response.status}`);
  }

  const spreadsheet = await response.json();
  const sheet = spreadsheet.sheets?.find((s: any) => s.properties.title === worksheetName);
  
  if (sheet) {
    return sheet.properties.sheetId;
  }

  // Create the worksheet if it doesn't exist
  const createResponse = await fetch(`${sheetUrl}:batchUpdate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [{
        addSheet: {
          properties: {
            title: worksheetName,
          },
        },
      }],
    }),
  });

  if (!createResponse.ok) {
    throw new Error(`Failed to create worksheet: ${createResponse.status}`);
  }

  const createResult = await createResponse.json();
  return createResult.replies[0].addSheet.properties.sheetId;
}

async function ensureHeaders(spreadsheetId: string, worksheetName: string, headers: string[], accessToken: string): Promise<void> {
  // Check if the first row has data
  const checkUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${worksheetName}!A1:Z1`;
  
  const checkResponse = await fetch(checkUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });

  if (checkResponse.ok) {
    const data = await checkResponse.json();
    if (data.values && data.values.length > 0 && data.values[0].length > 0) {
      // Headers already exist
      return;
    }
  }

  // Add headers
  const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${worksheetName}!A1:append?valueInputOption=RAW`;
  
  await fetch(updateUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [headers],
    }),
  });
}