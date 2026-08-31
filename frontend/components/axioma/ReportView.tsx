"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Download, CheckCircle2, AlertCircle, Sparkles, Loader2, ArrowUpRight } from "lucide-react";
import type { AnalyzeResult } from "@/lib/axioma/analyze.client";
import { generateReportPDF } from "@/lib/axioma/pdf-utils";
import type { Question } from "@/lib/axioma/questions";
import { generateChallenge } from "@/lib/axioma/challenge.client";

type Props = {
  result: AnalyzeResult;
  tipo: "perfil" | "tecnico";
  studentName?: string;
  questions?: (Question & { correct?: string })[];
  answers?: Record<string, string>;
};

export function ReportView({ result, tipo, studentName, questions, answers }: Props) {
  const [generating, setGenerating] = useState(false);
  const router = useRouter();

  function handleDownload() {
    const doc = generateReportPDF(result, tipo, studentName);
    doc.save(`relatorio-${tipo}-${(studentName || "anonimo").replace(/\s+/g, "-").toLowerCase()}.pdf`);
  }

  async function handleGenerateChallenge() {
    if (!questions || !answers) return;
    setGenerating(true);
    try {
      const triageAnswers = questions.map((q) => {
        const a = answers[q.id] ?? "";
        if (q.type === "choice") {
          const opt = q.options.find((o) => o.key === a);
          return {
            questionId: q.id,
            prompt: q.prompt,
            type: "choice" as const,
            answer: a,
            optionLabel: opt?.label,
          };
        }
        return { questionId: q.id, prompt: q.prompt, type: "open" as const, answer: a };
      });
      const generated = await generateChallenge({
        studentName: studentName || undefined,
        profileTitle: result.profileTitle,
        profileSummary: result.summary,
        triageAnswers,
      });
      sessionStorage.setItem("axioma:challenge", JSON.stringify(generated));
      toast.success("Prova personalizada pronta! Bora começar.");
      router.push("/axioma/desafio");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erro ao gerar prova personalizada");
    } finally {
      setGenerating(false);
    }
  }

  const dateStr = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="flex flex-col gap-12 md:flex-row">
        <div className="flex-1 animate-in">
          {/* Eyebrow — traço na cor do bloco + código + data */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="h-[2px] w-6" style={{ backgroundColor: "var(--block-estudar)" }} aria-hidden="true" />
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Relatório
            </span>
            <span className="text-xs text-muted-foreground">{dateStr}</span>
          </div>

          <h1 className="mt-4 font-serif text-4xl leading-[1.1] tracking-[-0.02em] text-ink md:text-5xl">
            {result.profileTitle}
          </h1>
          <p className="mt-5 mb-8 text-lg leading-relaxed text-muted-foreground">{result.summary}</p>

          <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border border-border bg-background">
              <div className="h-1.5 w-full" style={{ backgroundColor: "var(--block-estudar)" }} aria-hidden="true" />
              <div className="p-6">
                <span className="mb-2 block text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                  {result.scoreLabel}
                </span>
                <div className="font-serif text-4xl tracking-tight" style={{ color: "var(--block-estudar)" }}>
                  {result.scoreValue}
                </div>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-border bg-background">
              <div className="h-1.5 w-full bg-border" aria-hidden="true" />
              <div className="p-6">
                <span className="mb-2 block text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                  Tipo
                </span>
                <div className="font-serif text-3xl tracking-tight text-ink">
                  {tipo === "perfil" ? "Triagem" : "Prova Personalizada"}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-10">
            <section>
              <div className="mb-4 flex items-center gap-4">
                <h4 className="flex shrink-0 items-center gap-2 font-serif text-xl text-ink">
                  <CheckCircle2 className="size-5 text-brand-green" /> Pontos Fortes
                </h4>
                <div className="h-px flex-1 bg-border" />
              </div>
              <ul className="space-y-3">
                {result.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-green" />
                    {s}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <div className="mb-4 flex items-center gap-4">
                <h4 className="flex shrink-0 items-center gap-2 font-serif text-xl text-ink">
                  <AlertCircle className="size-5 text-brand-yellow" /> Pontos de Atenção
                </h4>
                <div className="h-px flex-1 bg-border" />
              </div>
              <ul className="space-y-3">
                {result.gaps.map((g, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-yellow" />
                    {g}
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <div className="mb-4 flex items-center gap-4">
                <h4 className="flex shrink-0 items-center gap-2 font-serif text-xl text-ink">
                  <Sparkles className="size-5" style={{ color: "var(--block-estudar)" }} /> Recomendações Personalizadas
                </h4>
                <div className="h-px flex-1 bg-border" />
              </div>
              <ul className="space-y-4">
                {result.recommendations.map((r, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span
                      className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full font-serif text-xs"
                      style={{ backgroundColor: "var(--block-estudar-soft)", color: "var(--block-estudar)" }}
                    >
                      {i + 1}
                    </span>
                    <div>
                      <p className="mb-1 font-serif text-base text-ink">{r.title}</p>
                      <p className="text-sm leading-relaxed text-muted-foreground">{r.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <div className="mb-4 flex items-center gap-4">
                <h4 className="shrink-0 font-serif text-xl text-ink">Distribuição de Competências</h4>
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="space-y-6 rounded-2xl border border-border bg-card p-8">
                {result.competencies.map((c, i) => (
                  <div key={i}>
                    <div className="mb-2 flex justify-between text-[11px] font-medium uppercase tracking-[0.18em]">
                      <span className="text-foreground">{c.label}</span>
                      <span className="font-mono" style={{ color: "var(--block-estudar)" }}>{c.value}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${c.value}%`, backgroundColor: "var(--block-estudar)" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="flex flex-wrap gap-3 border-t border-border pt-8">
              <button
                onClick={handleDownload}
                className="group flex cursor-pointer items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-background transition-colors hover:bg-[var(--block-estudar)]"
              >
                <Download className="size-4" /> Baixar Relatório (PDF)
              </button>
              <Link
                href="/axioma"
                className="flex items-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-foreground/40"
              >
                Voltar ao Início
              </Link>
            </div>
          </div>
        </div>

        <aside className="w-full animate-in md:w-1/3">
          {tipo === "perfil" && questions && answers ? (
            <div className="sticky top-32 overflow-hidden rounded-2xl bg-ink p-8 text-background shadow-[var(--shadow-elevated)]">
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full select-none"
                viewBox="0 0 400 560"
                preserveAspectRatio="xMidYMid slice"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="390" cy="-30" r="170" fill="none" stroke="white" strokeWidth="1" opacity="0.12" />
                <circle cx="-20" cy="570" r="150" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="4 3" opacity="0.10" />
                <line x1="0" y1="150" x2="80" y2="150" stroke="white" strokeWidth="0.5" opacity="0.09" />
                <line x1="170" y1="0" x2="290" y2="560" stroke="white" strokeWidth="0.5" opacity="0.07" />
                <line x1="330" y1="490" x2="346" y2="490" stroke="white" strokeWidth="1" opacity="0.16" />
                <line x1="338" y1="482" x2="338" y2="498" stroke="white" strokeWidth="1" opacity="0.16" />
              </svg>

              <div className="relative">
                <span className="mb-3 block text-[10px] uppercase tracking-[0.22em] text-background/50">
                  Próxima Etapa · Prova Personalizada
                </span>
                <h3 className="mb-3 font-serif text-2xl leading-snug tracking-tight text-background md:text-3xl">
                  A IA vai montar uma prova{" "}
                  <em className="italic" style={{ color: "var(--block-estudar)" }}>só pra você</em>
                </h3>
                <p className="mb-6 text-sm leading-relaxed text-background/70">
                  Com base no seu perfil e nas lacunas identificadas na triagem, a IA vai gerar uma
                  prova de 10 questões (7 múltipla escolha + 3 abertas) calibrada para o seu nível.
                  Ao final você recebe correção e feedback personalizados.
                </p>
                <button
                  onClick={handleGenerateChallenge}
                  disabled={generating}
                  className={`group flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-background px-6 py-3.5 text-sm font-semibold text-ink transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 ${generating ? "" : "animate-attention"}`}
                >
                  {generating ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Gerando sua prova...
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" style={{ color: "var(--block-estudar)" }} /> Gerar prova personalizada
                      <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                    </>
                  )}
                </button>
                <blockquote className="mt-8 border-t border-background/10 pt-6 text-center">
                  <p className="font-serif text-xs italic leading-relaxed text-background/60">
                    &ldquo;A IA não substituirá humanos, mas humanos que usam IA substituirão aqueles que não usam.&rdquo;
                  </p>
                </blockquote>
              </div>
            </div>
          ) : (
            <div className="sticky top-32 overflow-hidden rounded-2xl bg-ink p-8 text-background shadow-[var(--shadow-elevated)]">
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full select-none"
                viewBox="0 0 400 400"
                preserveAspectRatio="xMidYMid slice"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="390" cy="-30" r="170" fill="none" stroke="white" strokeWidth="1" opacity="0.12" />
                <line x1="0" y1="150" x2="80" y2="150" stroke="white" strokeWidth="0.5" opacity="0.09" />
                <line x1="330" y1="330" x2="346" y2="330" stroke="white" strokeWidth="1" opacity="0.16" />
                <line x1="338" y1="322" x2="338" y2="338" stroke="white" strokeWidth="1" opacity="0.16" />
              </svg>
              <div className="relative">
                <h4 className="mb-6 text-[10px] uppercase tracking-[0.22em] text-background/50">Resumo</h4>
                <p className="mb-8 text-sm leading-relaxed text-background/80">{result.summary}</p>
                <blockquote className="border-t border-background/10 pt-6 text-center">
                  <p className="font-serif text-xs italic leading-relaxed text-background/60">
                    &ldquo;A IA não substituirá humanos, mas humanos que usam IA substituirão aqueles que não usam.&rdquo;
                  </p>
                </blockquote>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
