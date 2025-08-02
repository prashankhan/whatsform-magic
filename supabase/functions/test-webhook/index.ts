import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { webhook_url, webhook_method = 'POST', webhook_headers = {} } = await req.json();

    if (!webhook_url) {
      return new Response(
        JSON.stringify({ error: 'webhook_url is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Test payload
    const testPayload = {
      test: true,
      timestamp: new Date().toISOString(),
      sample_data: {
        field_1: "Sample value",
        field_2: "Another sample"
      }
    };

    console.log(`[TEST-WEBHOOK] Testing webhook: ${webhook_url}`);

    // Make the webhook request
    const webhookResponse = await fetch(webhook_url, {
      method: webhook_method,
      headers: {
        'Content-Type': 'application/json',
        ...webhook_headers
      },
      body: JSON.stringify(testPayload)
    });

    const responseText = await webhookResponse.text();
    
    console.log(`[TEST-WEBHOOK] Response: ${webhookResponse.status} ${webhookResponse.statusText}`);

    return new Response(
      JSON.stringify({
        success: webhookResponse.ok,
        status: webhookResponse.status,
        statusText: webhookResponse.statusText,
        response: responseText
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[TEST-WEBHOOK] Error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})