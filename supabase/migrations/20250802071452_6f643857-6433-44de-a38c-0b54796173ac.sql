-- Update the form-uploads bucket to be public so files can be accessed via direct URLs
UPDATE storage.buckets 
SET public = true 
WHERE id = 'form-uploads';

-- Clean up storage policies since public bucket doesn't need complex access control
-- Keep only basic policies for organization
DROP POLICY IF EXISTS "Anyone can view uploaded files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete files" ON storage.objects;

-- Create simple policies for the public bucket
CREATE POLICY "Public bucket allows all operations" ON storage.objects
FOR ALL USING (bucket_id = 'form-uploads');