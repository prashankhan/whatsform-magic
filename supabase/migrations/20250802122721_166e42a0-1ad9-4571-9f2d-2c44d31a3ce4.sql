-- Add webhook configuration to forms table
ALTER TABLE public.forms 
ADD COLUMN webhook_url TEXT,
ADD COLUMN webhook_method TEXT DEFAULT 'POST',
ADD COLUMN webhook_headers JSONB DEFAULT '{}',
ADD COLUMN webhook_enabled BOOLEAN DEFAULT false;

-- Create webhook deliveries table for logging
CREATE TABLE public.webhook_deliveries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL,
  submission_id UUID NOT NULL,
  webhook_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, success, failed
  response_code INTEGER,
  response_body TEXT,
  error_message TEXT,
  attempt_count INTEGER DEFAULT 1,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on webhook_deliveries
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- Create policies for webhook_deliveries
CREATE POLICY "Form owners can view webhook deliveries for their forms"
ON public.webhook_deliveries
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM forms 
  WHERE forms.id = webhook_deliveries.form_id 
  AND forms.user_id = auth.uid()
));

-- Add trigger for webhook_deliveries updated_at
CREATE TRIGGER update_webhook_deliveries_updated_at
BEFORE UPDATE ON public.webhook_deliveries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();