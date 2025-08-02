-- Fix security issue: Remove policy that allows authenticated users to view other users' forms
-- This policy was causing cross-account form visibility in the dashboard
DROP POLICY IF EXISTS "Authenticated users can view others' published forms" ON public.forms;

-- Keep only the anonymous access policy for public form filling
-- Users can only see their own forms in dashboard due to existing "Users can view their own forms" policy
-- Anonymous users can still access published forms directly for form filling