-- Fix the RLS circular dependency issue by improving the security definer function
-- Drop the existing function and policy to recreate them properly
DROP POLICY IF EXISTS "Allow anonymous submissions to published forms" ON public.form_submissions;
DROP FUNCTION IF EXISTS public.is_form_published(uuid);

-- Create an improved security definer function that completely bypasses RLS
CREATE OR REPLACE FUNCTION public.is_form_published(form_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  form_published boolean := false;
BEGIN
  -- Use a simple SELECT with explicit schema to avoid any RLS issues
  SELECT is_published INTO form_published
  FROM public.forms 
  WHERE id = form_uuid;
  
  -- Return false if form not found or not published
  RETURN COALESCE(form_published, false);
END;
$$;

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION public.is_form_published(uuid) TO anon, authenticated;

-- Create the policy using the improved function
CREATE POLICY "Allow anonymous submissions to published forms" 
ON public.form_submissions 
FOR INSERT 
TO anon, authenticated
WITH CHECK (public.is_form_published(form_id));