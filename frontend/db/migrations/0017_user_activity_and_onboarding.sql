-- Atividade do usuário no portal (distinta de login: qualquer abertura do
-- portal já autenticado) e estado do onboarding de funcionalidades.
--
-- last_seen_at: atualizado por /api/user/activity a cada nova sessão de aba
-- (não a cada clique) — ver components/UserActivityTracker.tsx. Alimenta os
-- filtros "ativo nos últimos N dias" do painel admin.
--
-- onboarding_completed_at: marcado quando o usuário conclui ou pula o tour de
-- onboarding pela primeira vez — ver context/OnboardingContext.tsx. Repetir o
-- onboarding pelo perfil NÃO reseta esta coluna (é uma ação manual, não uma
-- "primeira vez" de novo).
alter table "user" add column if not exists "last_seen_at" timestamptz;
alter table "user" add column if not exists "onboarding_completed_at" timestamptz;

create index if not exists "user_last_seen_at_idx" on "user" ("last_seen_at");

-- Grandfather in everyone who already has an account: onboarding is meant
-- for genuinely new signups going forward, not a surprise popup for people
-- who've used the portal for months. Only rows created by THIS statement's
-- NULL default (i.e. new signups after this migration) should ever see it.
update "user" set "onboarding_completed_at" = now() where "onboarding_completed_at" is null;
