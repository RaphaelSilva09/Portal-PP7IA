"use client";

import { useState } from "react";
import { HelpCircle } from "lucide-react";
import FaqClient from "@/components/FaqClient";
import ReaderQuestionForm from "@/components/ReaderQuestionForm";

export default function HomeFaqSection() {
    const [showForm, setShowForm] = useState(false);

    return (
        <section id="faq" className="relative border-t border-border bg-background py-24">
            <div className="mx-auto max-w-3xl px-6">
                <div className="text-sm uppercase tracking-[0.22em] text-muted-foreground">Ajuda</div>
                <h2 className="mt-4 font-serif text-5xl leading-[1.05] tracking-tight text-ink md:text-6xl">
                    Perguntas <em className="italic text-primary">frequentes</em>.
                </h2>
                <p className="mt-5 max-w-xl text-muted-foreground text-md">
                    Dúvidas comuns sobre como o portal funciona: os blocos, a IA contextual, o mini-livro e o sistema de indicações.
                </p>

                <div className="mt-12">
                    <FaqClient />
                </div>

                <div className="mt-8">
                    {showForm ? (
                        <ReaderQuestionForm />
                    ) : (
                        <button
                            type="button"
                            onClick={() => setShowForm(true)}
                            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-foreground/40"
                        >
                            <HelpCircle className="size-4" aria-hidden="true" />
                            Não encontrei minha resposta
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
}
