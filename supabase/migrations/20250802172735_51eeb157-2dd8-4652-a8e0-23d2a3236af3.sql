-- Drop the problematic policy
DROP POLICY IF EXISTS "Allow anonymous submissions to published forms" ON public.form_submissions;

-- Create a security definer function to check if a form is published
-- This function runs with elevated privileges to avoid RLS evaluation issues
CREATE OR REPLACE FUNCTION public.is_form_published(form_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.forms 
    WHERE id = form_uuid AND is_published = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a new policy using the security definer function
CREATE POLICY "Allow anonymous submissions to published forms" 
ON public.form_submissions 
FOR INSERT 
TO anon, authenticated
WITH CHECK (public.is_form_published(form_id));