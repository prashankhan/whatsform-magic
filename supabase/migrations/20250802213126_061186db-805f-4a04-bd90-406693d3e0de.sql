-- Update the RLS policy for form submissions to handle iframe/cross-origin contexts better
-- Drop the existing INSERT policy and create a more robust one
DROP POLICY IF EXISTS "Allow anonymous submissions to published forms" ON public.form_submissions;

-- Create a new policy that works better in iframe contexts
CREATE POLICY "Enable anonymous submissions to published forms" 
ON public.form_submissions 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM public.forms 
    WHERE forms.id = form_submissions.form_id 
    AND forms.is_published = true
  )
);

-- Update the is_form_published function to be more robust for iframe contexts
CREATE OR REPLACE FUNCTION public.is_form_published(form_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  form_published boolean := false;
BEGIN
  -- Use explicit table reference to avoid any RLS confusion
  SELECT is_published INTO form_published
  FROM public.forms 
  WHERE id = form_uuid
  AND is_published = true;
  
  -- Return true only if form exists and is published
  RETURN COALESCE(form_published, false);
EXCEPTION
  WHEN OTHERS THEN
    -- Return false on any error to be safe
    RETURN false;
END;
$function$;