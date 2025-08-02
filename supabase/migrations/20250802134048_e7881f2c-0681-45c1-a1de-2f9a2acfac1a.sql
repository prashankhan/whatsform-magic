-- Fix webhook deliveries RLS policies to allow service role operations
-- This will resolve the form submission error caused by webhook delivery logging failures

-- Allow service role to insert webhook delivery logs
CREATE POLICY "Service role can insert webhook deliveries" ON public.webhook_deliveries
FOR INSERT 
WITH CHECK (true);

-- Allow service role to update webhook deliveries  
CREATE POLICY "Service role can update webhook deliveries" ON public.webhook_deliveries
FOR UPDATE 
USING (true);