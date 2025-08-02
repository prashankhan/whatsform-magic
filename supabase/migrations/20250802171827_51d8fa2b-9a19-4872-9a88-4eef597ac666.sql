-- Drop the current policy that's causing issues
DROP POLICY IF EXISTS "Allow submissions to published forms" ON public.form_submissions;
DROP POLICY IF EXISTS "Allow anonymous submissions to published forms" ON public.form_submissions;

-- Grant SELECT permission to anonymous users for published forms only
CREATE POLICY "Anonymous users can view published forms" 
ON public.forms 
FOR SELECT 
TO anon
USING (is_published = true);

-- Create a new policy that properly allows anonymous submissions to published forms
CREATE POLICY "Allow anonymous submissions to published forms" 
ON public.form_submissions 
FOR INSERT 
TO anon, authenticated
WITH CHECK (
  form_id IN (
    SELECT id 
    FROM public.forms 
    WHERE is_published = true
  )
);