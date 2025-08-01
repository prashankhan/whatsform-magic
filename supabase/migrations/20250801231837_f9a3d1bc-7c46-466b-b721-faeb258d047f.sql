-- Drop the existing restrictive policy for viewing form submissions
DROP POLICY IF EXISTS "Users can view their own form submissions" ON public.form_submissions;

-- Create a new policy that allows form owners to view all submissions to their forms
CREATE POLICY "Form owners can view all submissions to their forms" 
ON public.form_submissions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 
    FROM forms 
    WHERE forms.id = form_submissions.form_id 
    AND forms.user_id = auth.uid()
  )
);