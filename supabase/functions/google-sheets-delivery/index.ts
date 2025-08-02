import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const googleSheetsApiKey = Deno.env.get('GOOGLE_SHEETS_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { submissionId } = await req.json();
    
    if (!submissionId) {
      throw new Error('Submission ID is required');
    }

    if (!googleSheetsApiKey) {
      throw new Error('Google Sheets API key not configured');
    }

    console.log(`[GOOGLE-SHEETS] Processing submission ${submissionId}`);

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Get submission details
    const { data: submission, error: submissionError } = await supabase
      .from('form_submissions')
      .select(`
        *,
        forms!inner(
          title,
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
    const sheetsUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${worksheetName}!A1:Z1?key=${googleSheetsApiKey}`;
    
    const existingDataResponse = await fetch(sheetsUrl);
    const existingData = await existingDataResponse.json();
    
    let needsHeaders = false;
    if (!existingData.values || existingData.values.length === 0) {
      needsHeaders = true;
    }

    // Append data to the sheet
    const appendUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${worksheetName}:append?valueInputOption=RAW&key=${googleSheetsApiKey}`;
    
    const valuesToAppend = needsHeaders ? [headers, rowData] : [rowData];
    
    const appendResponse = await fetch(appendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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