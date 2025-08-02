-- Fix the conflicting RLS policies on forms table to allow anonymous form submission
-- Drop the current "Anonymous can view published forms" policy
DROP POLICY IF EXISTS "Anonymous can view published forms" ON public.forms;

-- Create a new policy that allows anyone to view published forms (not just anonymous users)
CREATE POLICY "Anyone can view published forms" ON public.forms
FOR SELECT 
USING (is_published = true);