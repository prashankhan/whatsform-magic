-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Users can create form submissions for their own forms" ON public.form_submissions;

-- Create a new policy that allows both authenticated users to submit to their own forms
-- and anonymous users to submit to published forms
CREATE POLICY "Allow form submissions" 
ON public.form_submissions 
FOR INSERT 
WITH CHECK (
  -- Allow authenticated users to submit to their own forms
  (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
  -- Allow anonymous users to submit to published forms
  (auth.uid() IS NULL AND user_id IS NULL AND EXISTS (
    SELECT 1 FROM forms 
    WHERE forms.id = form_submissions.form_id 
    AND forms.is_published = true
  ))
);