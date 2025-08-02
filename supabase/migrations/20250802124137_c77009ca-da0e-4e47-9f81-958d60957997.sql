-- Allow anonymous form submissions by making user_id nullable
ALTER TABLE public.form_submissions 
ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS policy to allow anonymous submissions to published forms
DROP POLICY IF EXISTS "Anyone can submit to published forms" ON public.form_submissions;

CREATE POLICY "Anyone can submit to published forms" 
ON public.form_submissions 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM forms 
    WHERE forms.id = form_submissions.form_id 
    AND forms.is_published = true
  )
);