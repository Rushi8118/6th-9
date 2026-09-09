    -- Shared public media bucket for admin-managed images and files.
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
    'media',
    'media',
    true,
    20971520,
    ARRAY[
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'image/avif',
        'image/svg+xml',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'video/mp4',
        'video/webm',
        'video/ogg'
    ]
    )
    ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

    DROP POLICY IF EXISTS "Public can read media" ON storage.objects;
    CREATE POLICY "Public can read media"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'media');

    DROP POLICY IF EXISTS "Admins can upload media" ON storage.objects;
    CREATE POLICY "Admins can upload media"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (
    bucket_id = 'media'
    AND public.user_has_permission(ARRAY['users.create', 'settings.manage'])
    );

    DROP POLICY IF EXISTS "Admins can update media" ON storage.objects;
    CREATE POLICY "Admins can update media"
    ON storage.objects FOR UPDATE TO authenticated
    USING (
    bucket_id = 'media'
    AND public.user_has_permission(ARRAY['users.update', 'settings.manage'])
    )
    WITH CHECK (
    bucket_id = 'media'
    AND public.user_has_permission(ARRAY['users.update', 'settings.manage'])
    );

    DROP POLICY IF EXISTS "Admins can delete media" ON storage.objects;
    CREATE POLICY "Admins can delete media"
    ON storage.objects FOR DELETE TO authenticated
    USING (
    bucket_id = 'media'
    AND public.user_has_permission(ARRAY['users.delete', 'settings.manage'])
    );
