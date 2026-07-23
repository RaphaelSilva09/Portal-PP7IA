-- Sincroniza textos da homepage armazenados no banco (overrides do admin)
-- que ficaram para trás quando as seções foram renomeadas (PDF 3.1 / auditoria UX-005):
--   bloco 2: "Reportagem da Semana" → "Inteligência Artificial"
--   bloco 3: "Radar"                → "Editoriais e Artigos"
--   cadência da newsletter: "Toda quarta" → "Segunda e quarta"
--
-- Cada correção só se aplica se o valor armazenado ainda é o texto antigo
-- conhecido — personalizações diferentes feitas pelo admin são preservadas.
--
-- Execução manual (mesmo fluxo de frontend/sql/home_block_descriptions.sql).

begin;

do $$
declare
    fix record;
begin
    for fix in
        select * from (values
            -- (seção,        chave,                        valor antigo,                          valor novo)
            ('sete-cores', 'block1_cadence',            'Toda quarta',                         'Segunda e quarta'),
            ('sete-cores', 'block2_label',              'Reportagem da Semana',                'Inteligência Artificial'),
            ('sete-cores', 'block2_desc',               'Análises e destaques editoriais',     'Notícias e análises de IA importantes para o Brasil'),
            ('sete-cores', 'block2_cadence',            'Semanal',                             'Atualização contínua'),
            ('sete-cores', 'block2_href',               '/explorar?b=reportagem',              '/explorar?b=inteligencia-artificial'),
            ('sete-cores', 'block3_label',              'Radar',                               'Editoriais e Artigos'),
            ('sete-cores', 'block3_label',              'Radar de Oportunidades',              'Editoriais e Artigos'),
            ('sete-cores', 'block3_desc',               'Ferramentas, startups e tendências',  'Textos curtos e opinião editorial'),
            ('sete-cores', 'block3_cadence',            'Contínuo',                            '3 a 4 por publicação'),
            ('sete-cores', 'block3_href',               '/explorar?b=radar',                   '/explorar?b=editoriais-artigos'),
            ('sete-cores', 'block7_href',               '#newsletter',                         '/explorar?b=ensinar'),
            ('newsletter', 'title_em',                  'quarta',                              'segunda e quarta'),
            ('hero',       'newsletterCard_headline2',  'toda quarta.',                        'segunda e quarta.')
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
