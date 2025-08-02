-- Remove the previous attempt and create a simpler, correct policy for public form access
DROP POLICY IF EXISTS "Public access to published forms for form filling" ON public.forms;

-- Create policy for anonymous/public access to published forms (for when people fill out forms)
CREATE POLICY "Anonymous can view published forms" 
ON public.forms 
FOR SELECT 
USING (is_published = true AND auth.uid() IS NULL);

-- Create policy for authenticated users to view published forms from other users (for form filling)
CREATE POLICY "Authenticated users can view others' published forms" 
ON public.forms 
FOR SELECT 
USING (is_published = true AND auth.uid() != user_id);