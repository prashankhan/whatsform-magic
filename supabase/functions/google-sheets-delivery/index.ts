import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { submissionId } = await req.json();
    
    if (!submissionId) {
      throw new Error('Submission ID is required');
    }

    console.log(`[GOOGLE-SHEETS] Processing submission ${submissionId}`);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get submission details with form owner info
    const { data: submission, error: submissionError } = await supabase
      .from('form_submissions')
      .select(`
        *,
        forms!inner(
          title,
          user_id,
          google_sheets_enabled,
          google_sheets_spreadsheet_id,
          google_sheets_worksheet_name,
          fields
        )
      `)
      .eq('id', submissionId)
      .single();

    if (submissionError) {
      throw new Error(`Failed to fetch submission: ${submissionError.message}`);
    }

    if (!submission.forms.google_sheets_enabled) {
      console.log(`[GOOGLE-SHEETS] Google Sheets not enabled for form`);
      return new Response(
        JSON.stringify({ success: true, message: 'Google Sheets not enabled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const spreadsheetId = submission.forms.google_sheets_spreadsheet_id;
    const worksheetName = submission.forms.google_sheets_worksheet_name || 'Sheet1';

    if (!spreadsheetId) {
      throw new Error('Google Sheets spreadsheet ID not configured');
    }

    // Get form owner's Google tokens
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('google_access_token, google_refresh_token, google_token_expires_at')
      .eq('user_id', submission.forms.user_id)
      .single();

    if (profileError || !profile) {
      throw new Error('Failed to fetch form owner profile');
    }

    if (!profile.google_access_token) {
      throw new Error('Form owner has not connected their Google account');
    }

    // Check if token needs refresh
    let accessToken = profile.google_access_token;
    const tokenExpiry = new Date(profile.google_token_expires_at);
    const now = new Date();
    
    if (now >= tokenExpiry && profile.google_refresh_token) {
      console.log(`[GOOGLE-SHEETS] Refreshing expired access token`);
      
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: Deno.env.get('GOOGLE_CLIENT_ID')!,
          client_secret: Deno.env.get('GOOGLE_CLIENT_SECRET')!,
          refresh_token: profile.google_refresh_token,
          grant_type: 'refresh_token',
        }),
      });

      const refreshData = await refreshResponse.json();
      
      if (!refreshResponse.ok) {
        throw new Error(`Token refresh failed: ${refreshData.error_description || refreshData.error}`);
      }

      accessToken = refreshData.access_token;
      
      // Update the access token in the database
      const newExpiry = new Date(Date.now() + (refreshData.expires_in * 1000));
      await supabase
        .from('profiles')
        .update({
          google_access_token: accessToken,
          google_token_expires_at: newExpiry.toISOString(),
        })
        .eq('user_id', submission.forms.user_id);
    }

    console.log(`[GOOGLE-SHEETS] Attempting delivery to spreadsheet ${spreadsheetId}, worksheet ${worksheetName}`);

    // Prepare the row data
    const formFields = submission.forms.fields || [];
    const responses = submission.responses || {};
    
    // Create header row if needed (for first submission)
    const headers = ['Timestamp', 'Submission ID', ...formFields.map((field: any) => field.label || field.id)];
    
    // Create data row
    const rowData = [
      new Date(submission.created_at).toLocaleString(),
      submission.id,
      ...formFields.map((field: any) => {
        const response = responses[field.id];
        if (Array.isArray(response)) {
          return response.join(', ');
        }
        return response || '';
      })
    ];

    // Get current sheet data to check if headers exist
    const sheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${worksheetName}!A1:Z1`;
    
    const existingDataResponse = await fetch(sheetsUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    const existingData = await existingDataResponse.json();
    
    let needsHeaders = false;
    if (!existingData.values || existingData.values.length === 0) {
      needsHeaders = true;
    }

    // Append data to the sheet
    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${worksheetName}:append?valueInputOption=RAW`;
    
    const valuesToAppend = needsHeaders ? [headers, rowData] : [rowData];
    
    const appendResponse = await fetch(appendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        values: valuesToAppend
      }),
    });

    if (!appendResponse.ok) {
      const errorText = await appendResponse.text();
      throw new Error(`Google Sheets API error: ${appendResponse.status} - ${errorText}`);
    }

    const result = await appendResponse.json();
    console.log(`[GOOGLE-SHEETS] Success: Added ${result.updates?.updatedRows || 0} rows to spreadsheet`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully added data to Google Sheets`,
        updatedRows: result.updates?.updatedRows || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[GOOGLE-SHEETS] Error:', error.message);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});