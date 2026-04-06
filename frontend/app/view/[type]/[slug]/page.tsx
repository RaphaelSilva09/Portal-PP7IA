import ViewIframe from "@/components/ViewIframe";
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

    return (
        <div className="w-full h-screen bg-[var(--background)]">
            <ViewIframe htmlPath={htmlPath} title={`${config.title} - ${slug}`} />
        </div>
    );
}
