-- Add Google OAuth tokens to profiles table
ALTER TABLE public.profiles 
ADD COLUMN google_access_token TEXT,
ADD COLUMN google_refresh_token TEXT,
ADD COLUMN google_token_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN google_connected_at TIMESTAMP WITH TIME ZONE;