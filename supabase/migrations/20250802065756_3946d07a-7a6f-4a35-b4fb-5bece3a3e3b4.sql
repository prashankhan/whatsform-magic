-- Create storage policies for public file uploads
-- Allow public users to upload files to form-uploads bucket
CREATE POLICY "Allow public file uploads" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'form-uploads');

-- Allow public users to view files in form-uploads bucket
CREATE POLICY "Allow public file viewing" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'form-uploads');

-- Allow public users to delete their own files (optional)
CREATE POLICY "Allow file deletion" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'form-uploads');