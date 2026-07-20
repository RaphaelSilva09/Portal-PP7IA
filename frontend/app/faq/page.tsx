import Footer from "@/components/Footer";
import Navbar from "@/components/Header";
import ReaderQuestionForm from "@/components/ReaderQuestionForm";
import { portalContentClass } from "@/lib/layout";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import FaqClient from "./FaqClient";

export const metadata: Metadata = {
    title: "Perguntas Frequentes · PP7+IAS",
    description: "Respostas para as dúvidas mais comuns sobre o portal PP7+IAS.",
};

export default function FaqPage() {
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
                        Ajuda
                    </p>
                    <h1 className="mt-2 font-serif text-3xl tracking-tight text-ink md:text-4xl">
                        Perguntas frequentes.
                    </h1>
                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                        Dúvidas comuns sobre como o portal funciona: os blocos, a IA contextual, o mini-livro e o sistema de indicações.
                    </p>
                </div>

                <div className="max-w-3xl">
                    <FaqClient />
                    <ReaderQuestionForm />
                </div>
            </main>

            <Footer />
        </div>
    );
}
