-- Drop the existing INSERT policy for form_submissions
DROP POLICY IF EXISTS "Users can submit to published forms" ON public.form_submissions;

-- Create a new INSERT policy that properly handles anonymous submissions
CREATE POLICY "Allow submissions to published forms" 
ON public.form_submissions 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.forms 
    WHERE forms.id = form_submissions.form_id 
    AND forms.is_published = true
  )
);