create table if not exists public.mini_livro_sections (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('prefacio', 'encerramento')),
  title text not null,
  description text,
  html_path text,
  "index" integer not null default 0 check ("index" >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if exists (
    select 1
    from public.mini_livro_sections
    where kind = 'prefacio'
    group by kind
    having count(*) > 1
  ) then
    raise exception 'A tabela mini_livro_sections já possui mais de um prefácio. Corrija manualmente antes de aplicar esta migration.';
  end if;
end
$$;

create unique index if not exists mini_livro_sections_unique_prefacio
  on public.mini_livro_sections (kind)
  where kind = 'prefacio';

create index if not exists idx_mini_livro_sections_kind_index
  on public.mini_livro_sections (kind, "index");

alter table public.mini_livro_sections enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'mini_livro_sections'
      and policyname = 'mini_livro_sections_public_read'
  ) then
    create policy "mini_livro_sections_public_read"
      on public.mini_livro_sections for select
      using (true);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'mini_livro_sections'
      and policyname = 'mini_livro_sections_insert_admin'
  ) then
    create policy "mini_livro_sections_insert_admin"
      on public.mini_livro_sections for insert
      with check (public.is_admin());
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'mini_livro_sections'
      and policyname = 'mini_livro_sections_update_admin'
  ) then
    create policy "mini_livro_sections_update_admin"
      on public.mini_livro_sections for update
      using (public.is_admin())
      with check (public.is_admin());
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'mini_livro_sections'
      and policyname = 'mini_livro_sections_delete_admin'
  ) then
    create policy "mini_livro_sections_delete_admin"
      on public.mini_livro_sections for delete
      using (public.is_admin());
  end if;
end
$$;

grant select on table public.mini_livro_sections to anon;
grant select, insert, update, delete on table public.mini_livro_sections to authenticated;
grant all on table public.mini_livro_sections to service_role;

grant usage, select on sequence public.mini_livro_sections_id_seq to authenticated;
grant all on sequence public.mini_livro_sections_id_seq to service_role;

do $$
begin
  if not exists (
    select 1
    from pg_trigger tg
    join pg_class tbl on tbl.oid = tg.tgrelid
    join pg_namespace ns on ns.oid = tbl.relnamespace
    where tg.tgname = 'trg_mini_livro_sections_set_updated_at'
      and ns.nspname = 'public'
      and tbl.relname = 'mini_livro_sections'
      and not tg.tgisinternal
  ) then
    create trigger trg_mini_livro_sections_set_updated_at
      before update on public.mini_livro_sections
      for each row execute procedure public.set_updated_at();
  end if;
end
$$;
