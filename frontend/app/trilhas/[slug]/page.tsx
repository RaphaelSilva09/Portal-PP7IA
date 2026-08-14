import Footer from "@/components/Footer";
import Navbar from "@/components/Header";
import TrilhaDetailClient from "@/components/TrilhaDetailClient";
import DIContainer from "@/infrastructure/di/container";
import { portalContentClass } from "@/lib/layout";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const trail = await DIContainer.getReadingTrailRepository().getBySlug(slug).catch(() => null);
    const title = trail ? `${trail.title} · Trilha · PP7+IAS` : "Trilha de Leitura · PP7+IAS";
    const description = trail?.description || "Roteiro editorial guiado do portal PP7+IAS.";
    return { title, description };
}

export default async function TrilhaDetailPage({ params }: Props) {
    const { slug } = await params;
    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className={`${portalContentClass} py-8`}>
                <Link
                    href="/trilhas"
                    className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="size-3.5" />
                    Trilhas
                </Link>

                <div className="mt-8 mb-8 max-w-2xl">
                    <TrilhaDetailClient slug={slug} />
                </div>
            </main>

            <Footer />
        </div>
    );
}
