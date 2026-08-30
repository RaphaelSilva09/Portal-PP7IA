import DIContainer from "@/infrastructure/di/container";
import type { ContentViewNavigationLink, ContentViewNavigationType } from "@/application/usecases/GetContentViewNavigationUseCase";
import type { AccessRuleView } from "@/domain/access-rules/AccessRuleView";
import { findTrailStepNavigation, type TrailStepNavigation } from "@/domain/entities/ReadingTrail";
import { getUser } from "@/infrastructure/auth/getUser";
import ViewContentFrame from "@/components/ViewContentFrame";
import { Metadata } from "next";
import { notFound } from "next/navigation";

/** Tipos com bloqueio de acesso configurável pelo admin — os mesmos 6 com listagem pública (ver app/api/content/[type]/route.ts). */
const LOCKABLE_TYPES = new Set(["newsletter", "mini-livro", "biblioteca", "especial-semana", "radar_oportunidades", "estudar"]);

interface Props {
    params: Promise<{ type: string; slug: string }>;
    searchParams: Promise<{ trilha?: string }>;
}

const typeConfig: Record<string, { folder: string; title: string; sectionLabel: string; backHref: string }> = {
    newsletter: { folder: "newsletters", title: "Newsletter", sectionLabel: "Newsletter", backHref: "/explorar?b=newsletter" },
    "mini-livro": { folder: "mini-livros", title: "Mini-Livro", sectionLabel: "Enquanto é Tempo", backHref: "/explorar?b=livro" },
    biblioteca: { folder: "biblioteca", title: "Biblioteca", sectionLabel: "Biblioteca", backHref: "/explorar?b=biblioteca" },
    editorial: { folder: "editoriais", title: "Editorial", sectionLabel: "Editoriais e Artigos", backHref: "/explorar?b=editoriais-artigos" },
    "especial-semana": { folder: "especial-semana", title: "Inteligência Artificial", sectionLabel: "Inteligência Artificial", backHref: "/explorar?b=inteligencia-artificial" },
    radar_oportunidades: { folder: "radar-de-oportunidades", title: "Editoriais e Artigos", sectionLabel: "Editoriais e Artigos", backHref: "/explorar?b=editoriais-artigos" },
    estudar: { folder: "estudar", title: "Estudar", sectionLabel: "Estudar", backHref: "/explorar?b=estudar" },
    "home-recomendacoes": { folder: "home/recomendacoes", title: "Recomendacoes do Paulo", sectionLabel: "Início", backHref: "/" },
    ebook: { folder: "mini-livros/intros", title: "E-book", sectionLabel: "Enquanto é Tempo", backHref: "/explorar?b=livro" },
    book: { folder: "mini-livros/livro", title: "Livro", sectionLabel: "Enquanto é Tempo", backHref: "/explorar?b=livro" },
    "mini-livro-section": { folder: "mini-livros/sections", title: "Seção de Mini-livro", sectionLabel: "Enquanto é Tempo", backHref: "/explorar?b=livro" },
};

const NAVIGABLE_TYPES: readonly ContentViewNavigationType[] = [
    "newsletter",
    "mini-livro",
    "biblioteca",
    "especial-semana",
    "radar_oportunidades",
    "estudar",
    "ebook",
    "book",
    "mini-livro-section",
];

function isNavigableType(type: string): type is ContentViewNavigationType {
    return NAVIGABLE_TYPES.includes(type as ContentViewNavigationType);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { type, slug } = await params;
    const config = typeConfig[type];

    if (!config) {
        return { title: "Página não encontrada · PP7+IAS" };
    }

    const pageUrl = `/view/${type}/${slug}`;

    if (type === "mini-livro-section") {
        const sectionId = Number(slug);

        if (Number.isInteger(sectionId) && sectionId > 0) {
            const section = await DIContainer.getMiniLivroSectionRepository().getById(sectionId);

            if (section) {
                const title = `${section.title} | Portal PP7+IA`;
                const description = section.description || `Visualização de ${config.title} do Portal PP7+IA`;
                return {
                    title,
                    description,
                    openGraph: { title, description, url: pageUrl, type: "article" },
                };
            }
        }
    }

    const title = `${config.title} #${slug} | Portal PP7+IA`;
    const description = `Visualização de ${config.title} do Portal PP7+IA`;

    return {
        title,
        description,
        openGraph: { title, description, url: pageUrl, type: "article" },
    };
}

export default async function ViewPage({ params, searchParams }: Props) {
    const { type, slug } = await params;
    const { trilha } = await searchParams;

    const config = typeConfig[type];
    if (!config) {
        notFound();
    }

    // Usa API route proxy para servir HTML do storage de arquivos
    // Isso resolve problemas de X-Frame-Options e CORS
    const htmlPath = `/api/proxy-html/${type}/${slug}`;
    let previous: ContentViewNavigationLink | null = null;
    let next: ContentViewNavigationLink | null = null;
    let pageTitle = `${config.title} - ${slug}`;
    let trailNavigation: TrailStepNavigation | null = null;
    let initialLockInfo: AccessRuleView | null = null;

    // getUser() é lido uma vez e reaproveitado tanto pela navegação de
    // trilha quanto pela checagem de acesso abaixo.
    const user = trilha || LOCKABLE_TYPES.has(type) ? await getUser() : null;

    if (trilha) {
        const trail = await DIContainer.getReadingTrailUseCase().execute(trilha, user?.id ?? null).catch(() => null);
        if (trail) {
            trailNavigation = findTrailStepNavigation(trail, type, slug);
        }
    }

    // Checagem de UX (mostra a tela de bloqueio já no primeiro render, sem
    // esperar o probe HEAD do client) — a checagem que realmente impede o
    // HTML de ser servido está em /api/proxy-html, não aqui.
    if (LOCKABLE_TYPES.has(type)) {
        const access = await DIContainer.getEvaluateContentAccessUseCase().execute({
            contentType: type,
            slug,
            userId: user?.id ?? null,
            role: user?.role ?? null,
        });
        if (!access.allowed) {
            initialLockInfo = access.view;
        }
    }

    if (type === "mini-livro-section") {
        const sectionId = Number(slug);

        if (Number.isInteger(sectionId) && sectionId > 0) {
            const section = await DIContainer.getMiniLivroSectionRepository().getById(sectionId);

            if (section) {
                pageTitle = section.title;
            }
        }
    }

    if (isNavigableType(type)) {
        try {
            const navigation = await DIContainer.getContentViewNavigationUseCase().execute({ type, slug });
            previous = navigation.previous;
            next = navigation.next;
        } catch {
            previous = null;
            next = null;
        }
    }

    return (
        <ViewContentFrame
            htmlPath={htmlPath}
            title={pageTitle}
            previous={previous}
            next={next}
            contentType={type}
            slug={slug}
            sectionLabel={config.sectionLabel}
            backHref={config.backHref}
            trailNavigation={trailNavigation}
            initialLockInfo={initialLockInfo}
        />
    );
}
