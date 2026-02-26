-- Migration: Add RLS policies for radar_oportunidades, estudar, and ebooks tables
-- Created: 2026-02-26
-- Description: Enable Row Level Security and create policies for public read access
--              and admin write access to new content type tables

-- ============================================================================
-- RADAR DE OPORTUNIDADES TABLE
-- ============================================================================

-- Enable RLS
ALTER TABLE radar_oportunidades ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public SELECT access
CREATE POLICY select_public_radar_oportunidades
    ON radar_oportunidades
    FOR SELECT
    USING (true);

-- Policy: Allow admin INSERT
CREATE POLICY insert_admin_radar_oportunidades
    ON radar_oportunidades
    FOR INSERT
    WITH CHECK (
        auth.jwt() ->> 'role' = 'admin'
        OR auth.jwt() ->> 'email' IN (
            SELECT email FROM auth.users 
            WHERE raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Policy: Allow admin UPDATE
CREATE POLICY update_admin_radar_oportunidades
    ON radar_oportunidades
    FOR UPDATE
    USING (
        auth.jwt() ->> 'role' = 'admin'
        OR auth.jwt() ->> 'email' IN (
            SELECT email FROM auth.users 
            WHERE raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Policy: Allow admin DELETE
CREATE POLICY delete_admin_radar_oportunidades
    ON radar_oportunidades
    FOR DELETE
    USING (
        auth.jwt() ->> 'role' = 'admin'
        OR auth.jwt() ->> 'email' IN (
            SELECT email FROM auth.users 
            WHERE raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Grant SELECT to anon and authenticated roles
GRANT SELECT ON radar_oportunidades TO anon, authenticated;

-- Grant sequence usage (needed for inserts with auto-incrementing IDs)
GRANT USAGE, SELECT ON SEQUENCE radar_oportunidades_id_seq TO authenticated;

-- ============================================================================
-- ESTUDAR TABLE
-- ============================================================================

-- Enable RLS
ALTER TABLE estudar ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public SELECT access
CREATE POLICY select_public_estudar
    ON estudar
    FOR SELECT
    USING (true);

-- Policy: Allow admin INSERT
CREATE POLICY insert_admin_estudar
    ON estudar
    FOR INSERT
    WITH CHECK (
        auth.jwt() ->> 'role' = 'admin'
        OR auth.jwt() ->> 'email' IN (
            SELECT email FROM auth.users 
            WHERE raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Policy: Allow admin UPDATE
CREATE POLICY update_admin_estudar
    ON estudar
    FOR UPDATE
    USING (
        auth.jwt() ->> 'role' = 'admin'
        OR auth.jwt() ->> 'email' IN (
            SELECT email FROM auth.users 
            WHERE raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Policy: Allow admin DELETE
CREATE POLICY delete_admin_estudar
    ON estudar
    FOR DELETE
    USING (
        auth.jwt() ->> 'role' = 'admin'
        OR auth.jwt() ->> 'email' IN (
            SELECT email FROM auth.users 
            WHERE raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Grant SELECT to anon and authenticated roles
GRANT SELECT ON estudar TO anon, authenticated;

-- Grant sequence usage
GRANT USAGE, SELECT ON SEQUENCE estudar_id_seq TO authenticated;

-- ============================================================================
-- EBOOKS TABLE
-- ============================================================================

-- Enable RLS
ALTER TABLE ebooks ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public SELECT access
CREATE POLICY select_public_ebooks
    ON ebooks
    FOR SELECT
    USING (true);

-- Policy: Allow admin INSERT
CREATE POLICY insert_admin_ebooks
    ON ebooks
    FOR INSERT
    WITH CHECK (
        auth.jwt() ->> 'role' = 'admin'
        OR auth.jwt() ->> 'email' IN (
            SELECT email FROM auth.users 
            WHERE raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Policy: Allow admin UPDATE
CREATE POLICY update_admin_ebooks
    ON ebooks
    FOR UPDATE
    USING (
        auth.jwt() ->> 'role' = 'admin'
        OR auth.jwt() ->> 'email' IN (
            SELECT email FROM auth.users 
            WHERE raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Policy: Allow admin DELETE
CREATE POLICY delete_admin_ebooks
    ON ebooks
    FOR DELETE
    USING (
        auth.jwt() ->> 'role' = 'admin'
        OR auth.jwt() ->> 'email' IN (
            SELECT email FROM auth.users 
            WHERE raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Grant SELECT to anon and authenticated roles
GRANT SELECT ON ebooks TO anon, authenticated;

-- Grant sequence usage
GRANT USAGE, SELECT ON SEQUENCE ebooks_id_seq TO authenticated;
