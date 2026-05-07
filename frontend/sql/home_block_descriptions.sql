begin;

create table if not exists public.home_block_descriptions (
    slug text primary key,
    description text not null,
    updated_at timestamptz not null default now()
);

create or replace function public.set_home_block_descriptions_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

do $$
begin
    if not exists (
        select 1
        from pg_trigger
        where tgname = 'trg_home_block_descriptions_updated_at'
    ) then
        create trigger trg_home_block_descriptions_updated_at
        before update on public.home_block_descriptions
        for each row
        execute procedure public.set_home_block_descriptions_updated_at();
    end if;
end;
$$;

alter table public.home_block_descriptions enable row level security;

do $$
begin
    if not exists (
        select 1
        from pg_policies
        where schemaname = 'public'
          and tablename = 'home_block_descriptions'
          and policyname = 'home_block_descriptions_select'
    ) then
        create policy home_block_descriptions_select
        on public.home_block_descriptions
        for select
        using (true);
    end if;

    if not exists (
        select 1
        from pg_policies
        where schemaname = 'public'
          and tablename = 'home_block_descriptions'
          and policyname = 'home_block_descriptions_insert'
    ) then
        create policy home_block_descriptions_insert
        on public.home_block_descriptions
        for insert
        with check (auth.role() = 'authenticated');
    end if;

    if not exists (
        select 1
        from pg_policies
        where schemaname = 'public'
          and tablename = 'home_block_descriptions'
          and policyname = 'home_block_descriptions_update'
    ) then
        create policy home_block_descriptions_update
        on public.home_block_descriptions
        for update
        using (auth.role() = 'authenticated')
        with check (auth.role() = 'authenticated');
    end if;

    if not exists (
        select 1
        from pg_policies
        where schemaname = 'public'
          and tablename = 'home_block_descriptions'
          and policyname = 'home_block_descriptions_delete'
    ) then
        create policy home_block_descriptions_delete
        on public.home_block_descriptions
        for delete
        using (auth.role() = 'authenticated');
    end if;
end;
$$;

insert into public.home_block_descriptions (slug, description)
values
    ('newsletter', 'Publicacao semanal com 7 itens
Noticias de IA e startups. O que realmente importa.'),
    ('especial-semana', 'Reportagem curada da semana
Analises e destaques editoriais.'),
    ('radar', '7 itens mensais
Ferramentas, startups e tendencias.'),
    ('mini-livros', '1 Livro, 3 Ebooks, 21 Mini-livros
Leitura de 7 a 21 minutos.'),
    ('biblioteca', '7 categorias com 7 itens cada
Prompts, ferramentas, guias e dicas.'),
    ('estudar', 'Guias, tutoriais e aulas
IA, tech, saude, startups, financas.'),
    ('ensinar', 'A ser implementado
Estamos construindo este bloco com cuidado para lançar em breve.')
on conflict (slug) do update set
    description = excluded.description,
    updated_at = now();

commit;
