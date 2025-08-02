-- Create error_logs table for error monitoring
CREATE TABLE IF NOT EXISTS public.error_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for error logs
CREATE POLICY "Users can view their own error logs" 
ON public.error_logs 
FOR SELECT 
USING (
  auth.uid() = user_id 
  OR auth.jwt() ->> 'role' = 'admin'
);

CREATE POLICY "Users can insert their own error logs" 
ON public.error_logs 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id 
  OR user_id IS NULL
);

-- Create policy for service role to manage all error logs
CREATE POLICY "Service role can manage error logs" 
ON public.error_logs 
FOR ALL 
USING (auth.jwt() ->> 'role' = 'service_role');

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON public.error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON public.error_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_error_logs_error_type ON public.error_logs(error_type);

-- Create function to clean up old error logs (older than 30 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_error_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.error_logs 
  WHERE created_at < now() - interval '30 days';
END;
$$;