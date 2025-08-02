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
  airtable_enabled: boolean;
  airtable_base_id: string;
  airtable_table_name: string;
  airtable_api_key: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { submissionId } = await req.json();
    console.log('[AIRTABLE] Processing submission', submissionId);

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
          airtable_enabled,
          airtable_base_id,
          airtable_table_name,
          airtable_api_key
        )
      `)
      .eq('id', submissionId)
      .single();

    if (submissionError || !submission) {
      console.error('[AIRTABLE] Failed to fetch submission:', submissionError);
      return new Response(
        JSON.stringify({ error: 'Submission not found' }),
        { status: 404, headers: corsHeaders }
      );
    }

    const form = submission.forms as unknown as Form;
    
    if (!form.airtable_enabled || !form.airtable_base_id || !form.airtable_table_name || !form.airtable_api_key) {
      console.log('[AIRTABLE] Airtable not properly configured for this form');
      return new Response(
        JSON.stringify({ message: 'Airtable not enabled or configured' }),
        { status: 200, headers: corsHeaders }
      );
    }

    console.log(`[AIRTABLE] Attempting delivery to base ${form.airtable_base_id}, table ${form.airtable_table_name}`);

    // Prepare the record data
    const recordFields: Record<string, any> = {};
    
    form.fields.forEach(field => {
      const value = submission.submission_data[field.id];
      if (value !== undefined && value !== null && value !== '') {
        const fieldName = field.label || field.id;
        
        // Handle different field types appropriately for Airtable
        switch (field.type) {
          case 'multiple-choice':
          case 'checkbox':
            recordFields[fieldName] = Array.isArray(value) ? value.join(', ') : String(value);
            break;
          case 'phone':
          case 'email':
          case 'text':
          case 'textarea':
            recordFields[fieldName] = String(value);
            break;
          case 'date':
            // Airtable expects dates in ISO format
            recordFields[fieldName] = value;
            break;
          case 'file-upload':
            // For file uploads, store the URL as text
            if (Array.isArray(value)) {
              recordFields[fieldName] = value.map(file => file.url || file).join(', ');
            } else {
              recordFields[fieldName] = value.url || String(value);
            }
            break;
          default:
            recordFields[fieldName] = String(value);
        }
      }
    });

    // Add submission metadata
    recordFields['Submission ID'] = submission.id;
    recordFields['Submitted At'] = submission.submitted_at;
    recordFields['Form Title'] = form.title;

    // Create record in Airtable
    const airtableUrl = `https://api.airtable.com/v0/${form.airtable_base_id}/${encodeURIComponent(form.airtable_table_name)}`;
    
    const airtableResponse = await fetch(airtableUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${form.airtable_api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fields: recordFields,
      }),
    });

    if (!airtableResponse.ok) {
      const errorText = await airtableResponse.text();
      console.error('[AIRTABLE] Error:', airtableResponse.status, '-', errorText);
      
      // Try to parse error details
      let errorMessage = `Airtable API error: ${airtableResponse.status}`;
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error && errorData.error.message) {
          errorMessage += ` - ${errorData.error.message}`;
        }
      } catch (e) {
        errorMessage += ` - ${errorText}`;
      }
      
      throw new Error(errorMessage);
    }

    const result = await airtableResponse.json();
    console.log('[AIRTABLE] Successfully created record:', result.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Record successfully created in Airtable',
        recordId: result.id
      }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('[AIRTABLE] Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});