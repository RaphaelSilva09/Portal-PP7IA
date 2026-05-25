import Footer from "@/components/Footer";
import Navbar from "@/components/Header";
import { portalContentClass } from "@/lib/layout";
import { ArrowLeft, Award, Target } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "O Autor · PP7+IAS",
    description: "Paulo Periquito — mentor, investidor-anjo e advisor com 40+ anos de liderança executiva.",
};

export default function AutorPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className={`${portalContentClass} py-8`}>

                {/* Back */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="size-3.5" />
                    Portal
                </Link>

                {/* Header */}
                <div className="mt-8 mb-10">
                    <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                        PP7+IAS
                    </p>
                    <h1 className="mt-2 font-serif text-3xl tracking-tight text-ink md:text-4xl">
                        Paulo Periquito.
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Mentor, Investidor Anjo e Advisor
                    </p>
                </div>

                {/* Content cards */}
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

                    {/* Trajetória */}
                    <div className="rounded-2xl border border-border bg-card p-6">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-accent">
                                <Award className="size-4 text-muted-foreground" />
                            </div>
                            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                                Trajetória
                            </p>
                        </div>
                        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                            <p>
                                Engenheiro com formação em TI e{" "}
                                <span className="font-medium text-foreground">4+ décadas</span> de carreira{" "}
                                <span className="font-medium text-foreground">C-Level</span> em RH, PE, CFO,
                                operações, varejo e inovação.
                            </p>
                            <p>
                                <span className="font-medium text-foreground">Presidente</span> da{" "}
                                <em>Alcoa</em> México e{" "}
                                <span className="font-medium text-foreground">COO</span> da empresa na América
                                Latina.
                            </p>
                            <p>
                                <span className="font-medium text-foreground">Presidente</span> da{" "}
                                <em>Whirlpool</em> na América Latina, e depois{" "}
                                <span className="font-medium text-foreground">Presidente Internacional</span>{" "}
                                — LatAm, Ásia, Europa.
                            </p>
                        </div>
                    </div>

                    {/* Foco Atual */}
                    <div className="rounded-2xl border border-border bg-card p-6">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-accent">
                                <Target className="size-4 text-muted-foreground" />
                            </div>
                            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                                Foco Atual
                            </p>
                        </div>
                        <p className="mb-3 font-serif text-2xl tracking-tight text-ink">
                            Família, Saúde e Legado.
                        </p>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Formando{" "}
                            <span className="font-medium text-foreground">líderes</span> e{" "}
                            <span className="font-medium text-foreground">profissionais</span> unindo
                            gestão humana ao potencial da IA.
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
