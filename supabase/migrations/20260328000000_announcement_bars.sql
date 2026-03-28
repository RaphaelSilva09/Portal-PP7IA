-- Tabela de barras de aviso (idempotente)
create table if not exists public.announcement_bars (
  id          uuid primary key default gen_random_uuid(),
  message     text not null,
  link_url    text,
  link_label  text,
  bg_color    text not null default '#1a1a1a',
  text_color  text not null default '#ffffff',
  is_active   boolean not null default true,
  priority    integer not null default 0,
  starts_at   timestamptz,
  ends_at     timestamptz,
  is_closable boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- RLS
alter table public.announcement_bars enable row level security;

-- Políticas (drop + recreate para idempotência)
drop policy if exists "Leitura pública" on public.announcement_bars;
create policy "Leitura pública"
  on public.announcement_bars for select using (true);

drop policy if exists "Escrita restrita a autenticados" on public.announcement_bars;
create policy "Escrita restrita a autenticados"
  on public.announcement_bars for all
  using (auth.role() = 'authenticated');

-- Função updated_at
create or replace function public.update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Trigger updated_at
drop trigger if exists set_updated_at on public.announcement_bars;
create trigger set_updated_at
  before update on public.announcement_bars
  for each row execute procedure public.update_updated_at();
