import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const googleClientId = Deno.env.get('GOOGLE_CLIENT_ID');
const googleClientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');

console.log('[GOOGLE-OAUTH] Environment check:', {
  hasClientId: !!googleClientId,
  hasClientSecret: !!googleClientSecret,
  clientIdLength: googleClientId?.length || 0
});

serve(async (req) => {
  console.log('[GOOGLE-OAUTH] Request received:', {
    method: req.method,
    url: req.url
  });

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    
    // Try to get action from query params first (for callback), then from request body
    let action = url.searchParams.get('action');
    
    if (!action && req.method === 'POST') {
      try {
        const body = await req.json();
        action = body.action;
        console.log('[GOOGLE-OAUTH] Action from body:', action);
      } catch (e) {
        console.log('[GOOGLE-OAUTH] Failed to parse request body:', e);
      }
    }

    console.log('[GOOGLE-OAUTH] Action determined:', action);

    if (!googleClientId || !googleClientSecret) {
      console.log('[GOOGLE-OAUTH] Missing credentials');
      throw new Error('Google OAuth credentials not configured');
    }

    if (action === 'authorize') {
      // Generate OAuth authorization URL - hardcode HTTPS redirect URI
      const redirectUri = 'https://euayjiyowktjcxbjrugn.supabase.co/functions/v1/google-oauth?action=callback';
      const scope = 'https://www.googleapis.com/auth/spreadsheets';
      const state = url.searchParams.get('state') || crypto.randomUUID();
      
      console.log('[GOOGLE-OAUTH] Generated redirect URI:', redirectUri);
      
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('client_id', googleClientId);
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', scope);
      authUrl.searchParams.set('state', state);
      authUrl.searchParams.set('access_type', 'offline');
      authUrl.searchParams.set('prompt', 'consent');

      console.log('[GOOGLE-OAUTH] Generated auth URL:', authUrl.toString());

      return new Response(
        JSON.stringify({ authUrl: authUrl.toString() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'callback') {
      // Handle OAuth callback
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      
      if (!code) {
        throw new Error('Authorization code not provided');
      }

      // Exchange code for tokens - use hardcoded HTTPS redirect URI
      const tokenUrl = 'https://oauth2.googleapis.com/token';
      const redirectUri = 'https://euayjiyowktjcxbjrugn.supabase.co/functions/v1/google-oauth?action=callback';
      
      console.log('[GOOGLE-OAUTH] Token exchange redirect URI:', redirectUri);
      
      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: googleClientId,
          client_secret: googleClientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      const tokenData = await tokenResponse.json();
      
      if (!tokenResponse.ok) {
        throw new Error(`Token exchange failed: ${tokenData.error_description || tokenData.error}`);
      }

      // Redirect back to the app with tokens (for security, we'll store them server-side)
      const callbackUrl = new URL(`${url.origin}/`);
      callbackUrl.searchParams.set('google_auth', 'success');
      callbackUrl.searchParams.set('state', state || '');
      
      // Store tokens temporarily (in a real app, you'd store these securely)
      // For now, we'll return them in the response for the frontend to handle
      return new Response(
        `
        <html>
          <body>
            <script>
              const tokens = ${JSON.stringify(tokenData)};
              window.opener.postMessage({ 
                type: 'GOOGLE_OAUTH_SUCCESS', 
                tokens: tokens 
              }, '*');
              window.close();
            </script>
          </body>
        </html>
        `,
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'text/html' 
          } 
        }
      );
    }

    if (action === 'store-tokens') {
      // Store tokens for authenticated user
      const { tokens } = await req.json();
      const authHeader = req.headers.get('Authorization');
      
      if (!authHeader) {
        throw new Error('No authorization header');
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Verify the user token and get user ID
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      
      if (userError || !user) {
        throw new Error('Invalid user token');
      }

      // Calculate expiry time
      const expiresAt = new Date(Date.now() + (tokens.expires_in * 1000));

      // Update user profile with Google tokens
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          google_access_token: tokens.access_token,
          google_refresh_token: tokens.refresh_token,
          google_token_expires_at: expiresAt.toISOString(),
          google_connected_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) {
        throw new Error(`Failed to store tokens: ${updateError.message}`);
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Google account connected successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'disconnect') {
      // Disconnect Google account
      const authHeader = req.headers.get('Authorization');
      
      if (!authHeader) {
        throw new Error('No authorization header');
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      
      if (userError || !user) {
        throw new Error('Invalid user token');
      }

      // Clear Google tokens from profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          google_access_token: null,
          google_refresh_token: null,
          google_token_expires_at: null,
          google_connected_at: null,
        })
        .eq('user_id', user.id);

      if (updateError) {
        throw new Error(`Failed to disconnect: ${updateError.message}`);
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Google account disconnected successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('[GOOGLE-OAUTH] Error:', error.message);
    
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