-- Storage policies for public uploads to form-uploads/public/* and public read
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public read access to form-uploads (anon)'
  ) THEN
    CREATE POLICY "Public read access to form-uploads (anon)"
    ON storage.objects
    FOR SELECT
    TO anon
    USING (bucket_id = 'form-uploads');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Public read access to form-uploads (authenticated)'
  ) THEN
    CREATE POLICY "Public read access to form-uploads (authenticated)"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (bucket_id = 'form-uploads');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Anon can upload to form-uploads/public'
  ) THEN
    CREATE POLICY "Anon can upload to form-uploads/public"
    ON storage.objects
    FOR INSERT
    TO anon
    WITH CHECK (
      bucket_id = 'form-uploads'
      AND name LIKE 'public/%'
    );
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated can upload to form-uploads/public'
  ) THEN
    CREATE POLICY "Authenticated can upload to form-uploads/public"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'form-uploads'
      AND name LIKE 'public/%'
    );
  END IF;
END$$;

-- Grant execute on rate limit function to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.check_submission_rate_limit(inet, uuid, integer, integer) TO anon, authenticated;