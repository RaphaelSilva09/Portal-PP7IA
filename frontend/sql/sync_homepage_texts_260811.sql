-- Sincroniza textos da homepage armazenados no banco (overrides do admin)
-- com as mudanças de copy do documento PP7I-260811-1800 (itens 1.1, 1.2, 1.3):
--   btn1 (hero):               "Explorar os 7 blocos" → "Índice do conteúdo publicado"
--   btn2 (hero):                "Receber a newsletter" → "Assinar o portal"
--   newsletterCard_cta (hero):  "Assinar →" / "Acessar →" → "Ler →"
--
-- Cada correção só se aplica se o valor armazenado ainda é um dos textos
-- antigos conhecidos — personalizações diferentes feitas pelo admin são
-- preservadas. newsletterCard_cta tem 2 valores antigos possíveis porque os
-- dois fallbacks de código (app/page.tsx e HomepageConfig.ts) já divergiam
-- entre si antes desta correção (ver docs/sdd/12-botao-curadoria-semanal.md).
--
-- Execução manual (mesmo fluxo de frontend/sql/sync_homepage_texts.sql).

begin;

do $$
declare
    fix record;
begin
    for fix in
        select * from (values
            -- (seção, chave,               valor antigo,            valor novo)
            ('hero', 'btn1',                'Explorar os 7 blocos',  'Índice do conteúdo publicado'),
            ('hero', 'btn2',                'Receber a newsletter',  'Assinar o portal'),
            ('hero', 'newsletterCard_cta',  'Assinar →',             'Ler →'),
            ('hero', 'newsletterCard_cta',  'Acessar →',             'Ler →')
        ) as f(sec, key, old_value, new_value)
    loop
        update public.homepage_config
        set sections = (
            select jsonb_agg(
                case
                    when s->>'id' = fix.sec and s->'texts'->>fix.key = fix.old_value
                        then jsonb_set(s, array['texts', fix.key], to_jsonb(fix.new_value))
                    else s
                end
                order by ord
            )
            from jsonb_array_elements(sections) with ordinality as t(s, ord)
        )
        where id = 1;
    end loop;
end $$;

commit;
