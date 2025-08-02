import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl!, supabaseKey!);

interface WebhookPayload {
  form_id: string;
  submission_id: string;
  submitted_at: string;
  form_title: string;
  data: Record<string, any>;
}

// Security validation functions
function validateWebhookUrl(url: string): boolean {
  if (!url) return false;

  try {
    const parsedUrl = new URL(url);
    
    // Only allow HTTPS for security
    if (parsedUrl.protocol !== 'https:') {
      return false;
    }

    // Prevent localhost and private IP ranges
    const hostname = parsedUrl.hostname.toLowerCase();
    
    // Block localhost variations
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
      return false;
    }

    // Block private IP ranges (basic check)
    if (hostname.startsWith('192.168.') || 
        hostname.startsWith('10.') || 
        hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)) {
      return false;
    }

    // Block metadata endpoints
    if (hostname.includes('metadata.google') || 
        hostname.includes('169.254.169.254') ||
        hostname.includes('metadata.azure') ||
        hostname.includes('metadata.ec2')) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

function sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
  const sanitized: Record<string, string> = {};
  const maxHeaderValue = 1000; // Limit header value length
  
  for (const [key, value] of Object.entries(headers)) {
    // Skip dangerous headers
    const lowerKey = key.toLowerCase();
    if (lowerKey === 'host' || lowerKey.startsWith('x-forwarded') || lowerKey === 'via') {
      continue;
    }
    
    // Sanitize value
    const sanitizedValue = typeof value === 'string' 
      ? value.substring(0, maxHeaderValue).replace(/[\r\n]/g, '') 
      : '';
      
    sanitized[key] = sanitizedValue;
  }
  
  return sanitized;
}

async function deliverWebhook(
  webhookUrl: string,
  method: string,
  headers: Record<string, string>,
  payload: WebhookPayload,
  submissionId: string,
  formId: string
) {
  console.log(`[WEBHOOK-DELIVERY] Attempting delivery to ${webhookUrl}`);
  
  let attempt = 1;
  const maxAttempts = 3;
  const baseDelay = 1000; // 1 second

  while (attempt <= maxAttempts) {
    try {
      // Log delivery attempt
      const { error: logError } = await supabase
        .from('webhook_deliveries')
        .insert({
          form_id: formId,
          submission_id: submissionId,
          webhook_url: webhookUrl,
          status: 'pending',
          attempt_count: attempt
        });

      if (logError) {
        console.error(`[WEBHOOK-DELIVERY] Failed to log attempt ${attempt}:`, logError);
      }

      const response = await fetch(webhookUrl, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        body: JSON.stringify(payload)
      });

      const responseText = await response.text();

      if (response.ok) {
        // Success - update log
        await supabase
          .from('webhook_deliveries')
          .update({
            status: 'success',
            response_code: response.status,
            response_body: responseText.substring(0, 1000), // Limit response body size
            delivered_at: new Date().toISOString()
          })
          .eq('submission_id', submissionId)
          .eq('attempt_count', attempt);

        console.log(`[WEBHOOK-DELIVERY] Success on attempt ${attempt} to ${webhookUrl}: ${response.status}`);
        return { success: true, status: response.status };
      } else {
        // HTTP error
        if (attempt === maxAttempts) {
          await supabase
            .from('webhook_deliveries')
            .update({
              status: 'failed',
              response_code: response.status,
              response_body: responseText.substring(0, 1000),
              error_message: `HTTP ${response.status}: ${response.statusText}`
            })
            .eq('submission_id', submissionId)
            .eq('attempt_count', attempt);
        }
        
        console.log(`[WEBHOOK-DELIVERY] HTTP error on attempt ${attempt}: ${response.status}`);
        
        if (attempt < maxAttempts) {
          const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
          console.log(`[WEBHOOK-DELIVERY] Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          attempt++;
          continue;
        }
      }
    } catch (error) {
      console.error(`[WEBHOOK-DELIVERY] Network error on attempt ${attempt}:`, error);
      
      if (attempt === maxAttempts) {
        await supabase
          .from('webhook_deliveries')
          .update({
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown network error'
          })
          .eq('submission_id', submissionId)
          .eq('attempt_count', attempt);
      }
      
      if (attempt < maxAttempts) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`[WEBHOOK-DELIVERY] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        attempt++;
        continue;
      }
    }
    
    break;
  }

  return { success: false, error: `Failed after ${maxAttempts} attempts` };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { submission_id, form_id } = await req.json();

    if (!submission_id || !form_id) {
      return new Response(
        JSON.stringify({ error: 'Missing submission_id or form_id' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`[WEBHOOK-DELIVERY] Processing submission ${submission_id} for form ${form_id}`);

    // Get form configuration with fields for field mapping
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('title, webhook_enabled, webhook_url, webhook_method, webhook_headers, fields')
      .eq('id', form_id)
      .single();

    if (formError || !form) {
      console.error('[WEBHOOK-DELIVERY] Form not found:', formError);
      return new Response(
        JSON.stringify({ error: 'Form not found' }), 
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!form.webhook_enabled || !form.webhook_url) {
      console.log('[WEBHOOK-DELIVERY] Webhooks not enabled for this form');
      return new Response(
        JSON.stringify({ message: 'Webhooks not enabled' }), 
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Security validation for webhook URL
    if (!validateWebhookUrl(form.webhook_url)) {
      console.error('[WEBHOOK-DELIVERY] Invalid or unsafe webhook URL:', form.webhook_url);
      return new Response(
        JSON.stringify({ error: 'Invalid webhook URL - security policy violation' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get submission data
    const { data: submission, error: submissionError } = await supabase
      .from('form_submissions')
      .select('submission_data, submitted_at')
      .eq('id', submission_id)
      .single();

    if (submissionError || !submission) {
      console.error('[WEBHOOK-DELIVERY] Submission not found:', submissionError);
      return new Response(
        JSON.stringify({ error: 'Submission not found' }), 
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Transform field IDs to readable labels
    const transformedData: Record<string, any> = {};
    const formFields = Array.isArray(form.fields) ? form.fields : [];
    
    for (const [fieldId, value] of Object.entries(submission.submission_data)) {
      const field = formFields.find((f: any) => f.id === fieldId);
      const fieldLabel = field?.label || fieldId;
      transformedData[fieldLabel] = value;
    }

    // Prepare webhook payload
    const payload: WebhookPayload = {
      form_id: form_id,
      submission_id: submission_id,
      submitted_at: submission.submitted_at,
      form_title: form.title,
      data: transformedData
    };

    // Sanitize headers for security
    const sanitizedHeaders = sanitizeHeaders(form.webhook_headers || {});

    // Deliver webhook
    const result = await deliverWebhook(
      form.webhook_url,
      form.webhook_method || 'POST',
      sanitizedHeaders,
      payload,
      submission_id,
      form_id
    );

    if (result.success) {
      return new Response(
        JSON.stringify({ message: 'Webhook delivered successfully', status: result.status }), 
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'Webhook delivery failed', details: result.error }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    console.error('[WEBHOOK-DELIVERY] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});