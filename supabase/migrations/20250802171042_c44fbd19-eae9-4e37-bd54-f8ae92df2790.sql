-- Drop the current policy
DROP POLICY IF EXISTS "Allow submissions to published forms" ON public.form_submissions;

-- Create the correct policy for anonymous submissions
CREATE POLICY "Allow submissions to published forms" 
ON public.form_submissions 
FOR INSERT 
WITH CHECK (
  form_id IN (
    SELECT id 
    FROM public.forms 
    WHERE is_published = true
  )
);