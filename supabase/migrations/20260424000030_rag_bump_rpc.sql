-- Atomic per-user-per-day rate-limit increment.
CREATE OR REPLACE FUNCTION public.bump_rag_usage(
    p_user_id    uuid,
    p_usage_date date
) RETURNS void
LANGUAGE sql AS $$
    INSERT INTO public.rag_usage (user_id, usage_date, count)
    VALUES (p_user_id, p_usage_date, 1)
    ON CONFLICT (user_id, usage_date)
    DO UPDATE SET count = public.rag_usage.count + 1;
$$;

GRANT EXECUTE ON FUNCTION public.bump_rag_usage(uuid, date)
    TO authenticated, service_role;
