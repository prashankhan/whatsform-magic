-- Drop the current policy that's causing issues
DROP POLICY IF EXISTS "Allow submissions to published forms" ON public.form_submissions;

-- Create a new policy that properly allows anonymous submissions to published forms
CREATE POLICY "Allow anonymous submissions to published forms" 
ON public.form_submissions 
FOR INSERT 
WITH CHECK (
  form_id IN (
    SELECT id 
    FROM public.forms 
    WHERE is_published = true
  )
);