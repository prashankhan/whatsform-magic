-- Drop the current policy
DROP POLICY IF EXISTS "Allow submissions to published forms" ON public.form_submissions;

-- Create the correct policy that properly references the NEW row
CREATE POLICY "Allow submissions to published forms" 
ON public.form_submissions 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.forms 
    WHERE forms.id = NEW.form_id 
    AND forms.is_published = true
  )
);