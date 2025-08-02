-- Fix critical security issue: Remove the overly permissive RLS policy
-- that allows anyone to see published forms in the dashboard

-- Drop the problematic policy
DROP POLICY IF EXISTS "Published forms are viewable by everyone" ON public.forms;

-- Create a new policy specifically for public form access (only for the public form page, not dashboard)
-- This will be used when someone visits the public form URL to fill it out
CREATE POLICY "Public access to published forms for form filling" 
ON public.forms 
FOR SELECT 
USING (is_published = true AND current_setting('request.jwt.claims', true)::json->>'role' IS NULL);

-- Keep the existing policy for users to view their own forms in dashboard
-- This policy already exists: "Users can view their own forms"