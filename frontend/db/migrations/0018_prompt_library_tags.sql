-- Tags de uso para a biblioteca de prompts, agora embutida dentro do tema
-- "Prompts" do bloco Biblioteca (não mais uma página dedicada) — permite
-- filtrar prompts por caso de uso, além do filtro existente por IA.
alter table public.prompt_library add column if not exists tags text[] not null default '{}';

create index if not exists prompt_library_tags_idx on public.prompt_library using gin (tags);
