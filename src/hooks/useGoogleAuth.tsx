import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GoogleAuthStatus {
  isConnected: boolean;
  connectedAt: string | null;
  loading: boolean;
}

export const useGoogleAuth = () => {
  const [status, setStatus] = useState<GoogleAuthStatus>({
    isConnected: false,
    connectedAt: null,
    loading: true,
  });
  const { toast } = useToast();

  const checkGoogleConnection = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setStatus({ isConnected: false, connectedAt: null, loading: false });
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('google_connected_at')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setStatus({ isConnected: false, connectedAt: null, loading: false });
        return;
      }

      setStatus({
        isConnected: !!profile?.google_connected_at,
        connectedAt: profile?.google_connected_at || null,
        loading: false,
      });
    } catch (error) {
      console.error('Error checking Google connection:', error);
      setStatus({ isConnected: false, connectedAt: null, loading: false });
    }
  };

  const connectGoogle = async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true }));

      // Get authorization URL from edge function
      const { data, error } = await supabase.functions.invoke('google-oauth', {
        body: { action: 'authorize' },
      });

      if (error) {
        throw new Error(error.message);
      }

      // Open popup window for OAuth
      const popup = window.open(
        data.authUrl,
        'google-oauth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      // Listen for OAuth completion
      const handleMessage = async (event: MessageEvent) => {
        if (event.data.type === 'GOOGLE_OAUTH_SUCCESS') {
          popup?.close();
          
          // Store tokens via edge function
          const { data: { session } } = await supabase.auth.getSession();
          
          const { error: storeError } = await supabase.functions.invoke('google-oauth', {
            body: { 
              action: 'store-tokens',
              tokens: event.data.tokens 
            },
            headers: {
              Authorization: `Bearer ${session?.access_token}`,
            },
          });

          if (storeError) {
            throw new Error(storeError.message);
          }

          toast({
            title: "Google Account Connected",
            description: "You can now integrate with Google Sheets",
          });

          await checkGoogleConnection();
          window.removeEventListener('message', handleMessage);
        }
      };

      window.addEventListener('message', handleMessage);

      // Handle popup being closed manually
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed);
          window.removeEventListener('message', handleMessage);
          setStatus(prev => ({ ...prev, loading: false }));
        }
      }, 1000);

    } catch (error) {
      console.error('Error connecting Google account:', error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect Google account",
        variant: "destructive",
      });
      setStatus(prev => ({ ...prev, loading: false }));
    }
  };

  const disconnectGoogle = async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true }));

      const { data: { session } } = await supabase.auth.getSession();
      
      const { error } = await supabase.functions.invoke('google-oauth', {
        body: { action: 'disconnect' },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Google Account Disconnected",
        description: "Your Google Sheets integration has been disabled",
      });

      await checkGoogleConnection();
    } catch (error) {
      console.error('Error disconnecting Google account:', error);
      toast({
        title: "Disconnection Failed",
        description: error instanceof Error ? error.message : "Failed to disconnect Google account",
        variant: "destructive",
      });
      setStatus(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    checkGoogleConnection();
  }, []);

  return {
    ...status,
    connectGoogle,
    disconnectGoogle,
    refreshStatus: checkGoogleConnection,
  };
};