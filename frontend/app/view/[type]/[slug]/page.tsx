import type { ContentType } from "@/domain/entities/ContentItem";
import DIContainer from "@/infrastructure/di/container";
import type { ContentViewNavigationLink } from "@/application/usecases/GetContentViewNavigationUseCase";
import ViewContentFrame from "@/components/ViewContentFrame";
import { Metadata } from "next";
import { notFound } from "next/navigation";

interface Props {
    params: Promise<{ type: string; slug: string }>;
}

const typeConfig: Record<string, { folder: string; title: string }> = {
    newsletter: { folder: "newsletters", title: "Newsletter" },
    "mini-livro": { folder: "mini-livros", title: "Mini-Livro" },
    biblioteca: { folder: "biblioteca", title: "Biblioteca" },
    "especial-semana": { folder: "especial-semana", title: "Especial da Semana" },
    radar_oportunidades: { folder: "radar-de-oportunidades", title: "Radar de Oportunidades" },
    estudar: { folder: "estudar", title: "Estudar" },
    ebook: { folder: "mini-livros/intros", title: "E-book" },
    book: { folder: "mini-livros/livro", title: "Livro" },
};

const NAVIGABLE_TYPES: readonly ContentType[] = [
    "newsletter",
    "mini-livro",
    "biblioteca",
    "especial-semana",
    "radar_oportunidades",
    "estudar",
    "ebook",
];

function isNavigableType(type: string): type is ContentType {
    return NAVIGABLE_TYPES.includes(type as ContentType);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { type, slug } = await params;
    const config = typeConfig[type];

    if (!config) {
        return { title: "Não encontrado" };
    }

    return {
        title: `${config.title} #${slug} | Portal PP7+IA`,
        description: `Visualização de ${config.title} do Portal PP7+IA`,
    };
}

export default async function ViewPage({ params }: Props) {
    const { type, slug } = await params;

    const config = typeConfig[type];
    if (!config) {
        notFound();
    }

    // Usa API route proxy para servir HTML do Supabase Storage
    // Isso resolve problemas de X-Frame-Options e CORS
    const htmlPath = `/api/proxy-html/${type}/${slug}`;
    let previous: ContentViewNavigationLink | null = null;
    let next: ContentViewNavigationLink | null = null;

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

    return <ViewContentFrame htmlPath={htmlPath} title={`${config.title} - ${slug}`} previous={previous} next={next} />;
}
