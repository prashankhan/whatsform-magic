-- Allow public access to published forms
CREATE POLICY "Published forms are viewable by everyone" 
ON public.forms 
FOR SELECT 
USING (is_published = true);

-- Allow anyone to create form submissions for published forms
CREATE POLICY "Anyone can submit to published forms" 
ON public.form_submissions 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.forms 
    WHERE forms.id = form_submissions.form_id 
    AND forms.is_published = true
  )
);