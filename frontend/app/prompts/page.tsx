import Footer from "@/components/Footer";
import Navbar from "@/components/Header";
import { portalContentClass } from "@/lib/layout";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import PromptsClient from "./PromptsClient";

export const metadata: Metadata = {
    title: "Biblioteca de Prompts · PP7+IAS",
    description: "Prompts prontos para as 7 IAs do portal, com casos de uso breves e diretos.",
};

export default function PromptsPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className={`${portalContentClass} py-8`}>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="size-3.5" />
                    Portal
                </Link>

                <div className="mt-8 mb-10">
                    <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                        7 IAs
                    </p>
                    <h1 className="mt-2 font-serif text-3xl tracking-tight text-ink md:text-4xl">
                        Biblioteca de prompts.
                    </h1>
                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                        Prompts prontos para as 7 IAs do portal, cada um com um caso de uso breve e direto.
                    </p>
                </div>

                <PromptsClient />
            </main>

            <Footer />
        </div>
    );
}
