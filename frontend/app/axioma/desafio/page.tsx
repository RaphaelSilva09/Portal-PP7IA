"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Nav } from "@/components/axioma/Nav";
import Footer from "@/components/Footer";
import { QuestionnaireFlow } from "@/components/axioma/QuestionnaireFlow";
import type { GenerateChallengeResult } from "@/lib/axioma/challenge.client";

const STORAGE_KEY = "axioma:challenge";

export default function DesafioPage() {
  const [challenge, setChallenge] = useState<GenerateChallengeResult | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setChallenge(JSON.parse(raw) as GenerateChallengeResult);
    } catch {}
    setReady(true);
  }, []);

  if (!ready) return null;

  if (!challenge) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Nav />
        <div className="mx-auto max-w-2xl flex-1 px-6 py-32 text-center">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Prova Personalizada
          </span>
          <h1 className="mt-4 mb-4 font-serif text-4xl leading-[1.1] tracking-[-0.02em] text-ink">
            Prova ainda não gerada
          </h1>
          <p className="mb-8 leading-relaxed text-muted-foreground">
            Você precisa primeiro responder a triagem para que a IA gere uma prova personalizada para
            o seu nível.
          </p>
          <Link
            href="/axioma/perfil"
            className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-medium text-background transition-colors hover:bg-[var(--block-estudar)]"
          >
            Iniciar triagem
            <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Nav />
      <main className="flex-1">
        <QuestionnaireFlow
          tipo="tecnico"
          title={challenge.title || "Prova Personalizada"}
          questions={challenge.questions}
          intro={challenge.introduction}
        />
      </main>
      <Footer />
    </div>
  );
}
