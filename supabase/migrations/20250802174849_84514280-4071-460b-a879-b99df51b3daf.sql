-- Grant explicit EXECUTE permissions to the is_form_published function for anonymous users
GRANT EXECUTE ON FUNCTION public.is_form_published(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.is_form_published(uuid) TO authenticated;

-- Also ensure the function is publicly accessible
REVOKE ALL ON FUNCTION public.is_form_published(uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.is_form_published(uuid) TO anon, authenticated;