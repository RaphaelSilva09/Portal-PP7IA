CREATE TABLE IF NOT EXISTS public.axioma_usage (
    ip_address text NOT NULL,
    usage_date date NOT NULL DEFAULT current_date,
    count      int  NOT NULL DEFAULT 0,
    PRIMARY KEY (ip_address, usage_date)
);
