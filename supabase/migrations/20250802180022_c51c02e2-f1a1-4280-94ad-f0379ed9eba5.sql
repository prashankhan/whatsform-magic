-- Drop the existing problematic policy that uses the function
DROP POLICY IF EXISTS "Allow anonymous submissions to published forms" ON public.form_submissions;

-- Create a new policy that uses direct EXISTS check instead of function call
CREATE POLICY "Allow anonymous submissions to published forms" 
ON public.form_submissions 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.forms 
    WHERE forms.id = form_id 
    AND forms.is_published = true
  )
);