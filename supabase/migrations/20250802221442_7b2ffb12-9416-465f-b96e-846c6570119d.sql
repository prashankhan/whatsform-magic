-- Fix database function search paths for security
-- Update handle_new_user function with secure search path
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'first_name', NEW.raw_user_meta_data ->> 'last_name');
  RETURN NEW;
END;
$function$;

-- Update update_updated_at_column function with secure search path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update is_form_published function with secure search path (already has it but ensuring consistency)
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

-- Add rate limiting table for form submissions
CREATE TABLE IF NOT EXISTS public.submission_rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address INET NOT NULL,
  form_id UUID NOT NULL,
  submission_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on rate limiting table
ALTER TABLE public.submission_rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage rate limits
CREATE POLICY "Service role can manage rate limits"
ON public.submission_rate_limits
FOR ALL
USING (true)
WITH CHECK (true);

-- Create function to check submission rate limits
CREATE OR REPLACE FUNCTION public.check_submission_rate_limit(
  client_ip INET,
  target_form_id UUID,
  max_submissions INTEGER DEFAULT 10,
  window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  current_count INTEGER := 0;
  window_start_time TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate window start time
  window_start_time := now() - (window_minutes * INTERVAL '1 minute');
  
  -- Clean up old entries
  DELETE FROM public.submission_rate_limits 
  WHERE window_start < window_start_time;
  
  -- Get current submission count for this IP and form in the window
  SELECT COALESCE(SUM(submission_count), 0) INTO current_count
  FROM public.submission_rate_limits
  WHERE ip_address = client_ip
    AND form_id = target_form_id
    AND window_start >= window_start_time;
  
  -- If under limit, allow and record
  IF current_count < max_submissions THEN
    -- Insert or update rate limit record
    INSERT INTO public.submission_rate_limits (ip_address, form_id, submission_count, window_start)
    VALUES (client_ip, target_form_id, 1, now())
    ON CONFLICT (ip_address, form_id) 
    DO UPDATE SET 
      submission_count = submission_rate_limits.submission_count + 1,
      window_start = CASE 
        WHEN submission_rate_limits.window_start < window_start_time 
        THEN now() 
        ELSE submission_rate_limits.window_start 
      END;
    
    RETURN TRUE;
  END IF;
  
  -- Over limit, deny
  RETURN FALSE;
END;
$function$;

-- Add unique constraint for rate limiting
CREATE UNIQUE INDEX IF NOT EXISTS idx_rate_limits_ip_form 
ON public.submission_rate_limits (ip_address, form_id);