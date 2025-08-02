-- Create storage bucket for form file uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('form-uploads', 'form-uploads', false);

-- Create policies for form file uploads
CREATE POLICY "Users can upload files to their own folder" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'form-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view files they uploaded" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'form-uploads' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Public access to form submission files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'form-uploads');

-- Add thank_you_page field to forms table
ALTER TABLE public.forms 
ADD COLUMN thank_you_page JSONB DEFAULT NULL;