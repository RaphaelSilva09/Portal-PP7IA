begin;

create table if not exists public.home_recomendacoes_paulo (
  slug text primary key,
  title text not null,
  description text not null,
  html_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_trigger tg
    join pg_class tbl on tbl.oid = tg.tgrelid
    join pg_namespace ns on ns.oid = tbl.relnamespace
    where tg.tgname = 'trg_home_recomendacoes_paulo_set_updated_at'
      and ns.nspname = 'public'
      and tbl.relname = 'home_recomendacoes_paulo'
      and not tg.tgisinternal
  ) then
    create trigger trg_home_recomendacoes_paulo_set_updated_at
      before update on public.home_recomendacoes_paulo
      for each row execute procedure public.set_updated_at();
  end if;
end
$$;

alter table public.home_recomendacoes_paulo enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'home_recomendacoes_paulo'
      and policyname = 'home_recomendacoes_paulo_public_read'
  ) then
    create policy "home_recomendacoes_paulo_public_read"
      on public.home_recomendacoes_paulo for select
      using (true);
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'home_recomendacoes_paulo'
      and policyname = 'home_recomendacoes_paulo_insert_admin'
  ) then
    create policy "home_recomendacoes_paulo_insert_admin"
      on public.home_recomendacoes_paulo for insert
      with check (public.is_admin());
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'home_recomendacoes_paulo'
      and policyname = 'home_recomendacoes_paulo_update_admin'
  ) then
    create policy "home_recomendacoes_paulo_update_admin"
      on public.home_recomendacoes_paulo for update
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
      and tablename = 'home_recomendacoes_paulo'
      and policyname = 'home_recomendacoes_paulo_delete_admin'
  ) then
    create policy "home_recomendacoes_paulo_delete_admin"
      on public.home_recomendacoes_paulo for delete
      using (public.is_admin());
  end if;
end
$$;

grant select on table public.home_recomendacoes_paulo to anon;
grant select, insert, update, delete on table public.home_recomendacoes_paulo to authenticated;
grant all on table public.home_recomendacoes_paulo to service_role;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'storage_home_recomendacoes_insert_admin'
  ) then
    create policy "storage_home_recomendacoes_insert_admin"
      on storage.objects for insert
      with check (
        bucket_id = 'materiais'
        and name like 'home/recomendacoes/%'
        and public.is_admin()
      );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'storage_home_recomendacoes_update_admin'
  ) then
    create policy "storage_home_recomendacoes_update_admin"
      on storage.objects for update
      using (
        bucket_id = 'materiais'
        and name like 'home/recomendacoes/%'
        and public.is_admin()
      )
      with check (
        bucket_id = 'materiais'
        and name like 'home/recomendacoes/%'
        and public.is_admin()
      );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'storage_home_recomendacoes_delete_admin'
  ) then
    create policy "storage_home_recomendacoes_delete_admin"
      on storage.objects for delete
      using (
        bucket_id = 'materiais'
        and name like 'home/recomendacoes/%'
        and public.is_admin()
      );
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'storage_home_recomendacoes_public_read'
  ) then
    create policy "storage_home_recomendacoes_public_read"
      on storage.objects for select
      using (
        bucket_id = 'materiais'
        and name like 'home/recomendacoes/%'
      );
  end if;
end
$$;

insert into public.home_recomendacoes_paulo (slug, title, description, html_path)
values (
  'recomendacoes-paulo',
  'Recomendacoes do Paulo',
  'Curadoria pessoal com leituras, links e reflexoes que aprofundam o tema da semana.',
  '/materiais/home/recomendacoes/recomendacoes-paulo.html'
)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  html_path = excluded.html_path,
  updated_at = now();

commit;
