-- Drop the conflicting INSERT policies on form_submissions
DROP POLICY IF EXISTS "Allow form submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Anyone can submit to published forms" ON public.form_submissions;

-- Create a single comprehensive INSERT policy
CREATE POLICY "Users can submit to published forms" ON public.form_submissions
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.forms 
    WHERE forms.id = form_submissions.form_id 
    AND forms.is_published = true
  )
);