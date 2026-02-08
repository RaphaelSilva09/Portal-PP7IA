-- =====================================================
-- Migration 005: Storage Bucket RLS Policies
-- =====================================================
-- Policies para storage.objects nos buckets:
-- Newsletters, MiniLivros, Biblioteca.
--
-- SELECT: publico (leitura de arquivos para todos)
-- INSERT/UPDATE/DELETE: apenas admins
-- UPDATE necessario por causa do upsert:true no StorageRepository
--
-- NOTA: Os buckets devem existir previamente no Supabase Dashboard.
--
-- Dependencias: 003_admin_table.sql (is_admin())
-- =====================================================

-- =====================================================
-- SELECT (leitura publica por bucket)
-- =====================================================

DROP POLICY IF EXISTS "storage_select_newsletters" ON storage.objects;
CREATE POLICY "storage_select_newsletters"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'Newsletters');

DROP POLICY IF EXISTS "storage_select_minilivros" ON storage.objects;
CREATE POLICY "storage_select_minilivros"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'MiniLivros');

DROP POLICY IF EXISTS "storage_select_biblioteca" ON storage.objects;
CREATE POLICY "storage_select_biblioteca"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'Biblioteca');

-- =====================================================
-- INSERT (upload - admins apenas)
-- =====================================================

DROP POLICY IF EXISTS "storage_insert_newsletters" ON storage.objects;
CREATE POLICY "storage_insert_newsletters"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'Newsletters'
        AND public.is_admin()
    );

DROP POLICY IF EXISTS "storage_insert_minilivros" ON storage.objects;
CREATE POLICY "storage_insert_minilivros"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'MiniLivros'
        AND public.is_admin()
    );

DROP POLICY IF EXISTS "storage_insert_biblioteca" ON storage.objects;
CREATE POLICY "storage_insert_biblioteca"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'Biblioteca'
        AND public.is_admin()
    );

-- =====================================================
-- UPDATE (upsert - admins apenas)
-- =====================================================

DROP POLICY IF EXISTS "storage_update_newsletters" ON storage.objects;
CREATE POLICY "storage_update_newsletters"
    ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'Newsletters'
        AND public.is_admin()
    )
    WITH CHECK (
        bucket_id = 'Newsletters'
        AND public.is_admin()
    );

DROP POLICY IF EXISTS "storage_update_minilivros" ON storage.objects;
CREATE POLICY "storage_update_minilivros"
    ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'MiniLivros'
        AND public.is_admin()
    )
    WITH CHECK (
        bucket_id = 'MiniLivros'
        AND public.is_admin()
    );

DROP POLICY IF EXISTS "storage_update_biblioteca" ON storage.objects;
CREATE POLICY "storage_update_biblioteca"
    ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'Biblioteca'
        AND public.is_admin()
    )
    WITH CHECK (
        bucket_id = 'Biblioteca'
        AND public.is_admin()
    );

-- =====================================================
-- DELETE (remocao - admins apenas)
-- =====================================================

DROP POLICY IF EXISTS "storage_delete_newsletters" ON storage.objects;
CREATE POLICY "storage_delete_newsletters"
    ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'Newsletters'
        AND public.is_admin()
    );

DROP POLICY IF EXISTS "storage_delete_minilivros" ON storage.objects;
CREATE POLICY "storage_delete_minilivros"
    ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'MiniLivros'
        AND public.is_admin()
    );

DROP POLICY IF EXISTS "storage_delete_biblioteca" ON storage.objects;
CREATE POLICY "storage_delete_biblioteca"
    ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'Biblioteca'
        AND public.is_admin()
    );
