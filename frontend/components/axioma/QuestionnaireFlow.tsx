"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, ArrowUpRight, Loader2 } from "lucide-react";
import type { Question } from "@/lib/axioma/questions";
import { analyzeAnswers, type AnalyzeResult } from "@/lib/axioma/analyze.client";
import { ReportView } from "./ReportView";
import { AudioAnswerButton } from "./AudioAnswerButton";

type Props = {
  tipo: "perfil" | "tecnico";
  title: string;
  questions: (Question & { correct?: string })[];
  intro?: string;
  initialStarted?: boolean;
  startHref?: string;
};

function shouldStartFromUrl() {
  if (typeof window === "undefined") return false;
  return window.location.hash === "#pergunta-1" || window.location.search.includes("start=1");
}

function shuffle<T>(arr: T[], seedText: string): T[] {
  const a = [...arr];
  let seed = 0;
  for (let i = 0; i < seedText.length; i++) seed = (seed * 31 + seedText.charCodeAt(i)) >>> 0;
  for (let i = a.length - 1; i > 0; i--) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function QuestionnaireFlow({ tipo, title, questions: rawQuestions, intro, initialStarted = false, startHref }: Props) {
  // Embaralha alternativas a cada carregamento, remapeando o "correct" para a nova letra
  const questions = useMemo(() => {
    const LETTERS = ["A", "B", "C", "D", "E", "F"];
    return rawQuestions.map((q) => {
      if (q.type !== "choice") return q;
      const shuffled = shuffle(q.options, q.id);
      const newOptions = shuffled.map((o, i) => ({ key: LETTERS[i], label: o.label }));
      let newCorrect = q.correct;
      if (q.correct) {
        const idx = shuffled.findIndex((o) => o.key === q.correct);
        if (idx >= 0) newCorrect = LETTERS[idx];
      }
      return { ...q, options: newOptions, correct: newCorrect };
    });
  }, [rawQuestions]);

  const [studentName, setStudentName] = useState("");
  const [started, setStarted] = useState(() => initialStarted || shouldStartFromUrl());
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AnalyzeResult | null>(null);

  useEffect(() => {
    if (initialStarted || shouldStartFromUrl()) setStarted(true);
  }, [initialStarted]);

  const total = questions.length;
  const q = questions[step];
  const progress = ((step + 1) / total) * 100;
  const currentAnswer = q ? answers[q.id] ?? "" : "";
  const canAdvance = currentAnswer.trim().length > 0;

  const score = useMemo(() => {
    if (tipo !== "tecnico") return undefined;
    let correct = 0;
    let totalScored = 0;
    questions.forEach((qq) => {
      if (qq.type === "choice" && qq.correct) {
        totalScored++;
        if (answers[qq.id] === qq.correct) correct++;
      }
    });
    return { correct, total: totalScored };
  }, [answers, questions, tipo]);

  async function handleSubmit() {
    setLoading(true);
    try {
      const payload = {
        tipo,
        studentName: studentName || undefined,
        technicalScore: score,
        answers: questions.map((qq) => {
          const a = answers[qq.id] ?? "";
          if (qq.type === "choice") {
            const opt = qq.options.find((o) => o.key === a);
            return {
              questionId: qq.id,
              prompt: qq.prompt,
              type: "choice" as const,
              answer: a,
              optionLabel: opt?.label,
            };
          }
          return {
            questionId: qq.id,
            prompt: qq.prompt,
            type: "open" as const,
            answer: a,
          };
        }),
      };
      const result = await analyzeAnswers(payload);
      setReport(result);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erro ao gerar relatório");
    } finally {
      setLoading(false);
    }
  }

  if (report) {
    return (
      <ReportView
        result={report}
        tipo={tipo}
        studentName={studentName}
        questions={questions}
        answers={answers}
      />
    );
  }

  if (!started) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 animate-in">
        {/* Eyebrow — traço na cor do bloco + etapa + hairline */}
        <div className="flex items-center gap-3">
          <span className="h-[2px] w-6" style={{ backgroundColor: "var(--block-estudar)" }} aria-hidden="true" />
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            {tipo === "perfil" ? "Etapa 1 · Triagem" : "Etapa 2 · Prova de IA"}
          </span>
          <div className="hidden flex-1 sm:flex">
            <div className="h-px flex-1 bg-border" />
          </div>
        </div>

        <h1 className="mt-6 font-serif text-4xl leading-[1.1] tracking-[-0.02em] text-ink md:text-5xl">{title}</h1>
        <p className="mt-4 mb-10 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {intro ??
            (tipo === "perfil"
              ? "10 perguntas rápidas para entender se você já tem (ou não) conhecimento sobre IA. Sem certo ou errado — responda com sinceridade para que a gente saiba por onde começar com você."
              : "Prova com 10 questões sobre fundamentos de IA. Você pode responder agora, online, ou baixar o PDF, responder offline e enviar depois para correção e feedback gerados por IA.")}
        </p>

        <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="h-1.5 w-full" style={{ backgroundColor: "var(--block-estudar)" }} aria-hidden="true" />
          <div className="p-6">
            <label className="mb-3 block text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              Seu nome (opcional)
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value.slice(0, 120))}
              placeholder="Como podemos te chamar?"
              className="w-full rounded-xl border border-border bg-background p-3 outline-none transition-colors focus:border-[var(--block-estudar)] focus:ring-1 focus:ring-[var(--block-estudar)]"
            />
          </div>
        </div>

        <a
          href={startHref ?? "#pergunta-1"}
          onClick={(event) => {
            event.preventDefault();
            setStarted(true);
            if (typeof window !== "undefined") {
              if (startHref) window.history.replaceState(null, "", startHref);
              window.scrollTo(0, 0);
            }
          }}
          className="group inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-medium text-background transition-colors hover:bg-[var(--block-estudar)] cursor-pointer"
        >
          Começar — {total} {total === 1 ? "pergunta" : "perguntas"}
          <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
        </a>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-32 text-center animate-in">
        <Loader2 className="mx-auto mb-6 size-12 animate-spin" style={{ color: "var(--block-estudar)" }} />
        <h2 className="mb-2 font-serif text-3xl tracking-tight text-ink">Gerando seu relatório...</h2>
        <p className="text-muted-foreground">A IA está analisando suas respostas. Isso leva alguns segundos.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      {/* Cabeçalho de progresso */}
      <div className="mb-12 flex items-end justify-between gap-6">
        <div>
          <span className="font-mono text-xs uppercase tracking-[0.22em]" style={{ color: "var(--block-estudar)" }}>
            Passo {String(step + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
          <h2 className="mt-2 font-serif text-3xl leading-tight tracking-[-0.02em] text-ink md:text-4xl">{q.section}</h2>
        </div>
        <div className="mb-1.5 h-1 w-32 shrink-0 overflow-hidden rounded-full bg-border md:w-48">
          <div
            className="h-full transition-all duration-200"
            style={{ width: `${progress}%`, backgroundColor: "var(--block-estudar)" }}
          />
        </div>
      </div>

      <div key={q.id} className="space-y-8 animate-in">
        <h3 className="font-serif text-xl leading-[1.35] text-pretty text-ink md:text-2xl">{q.prompt}</h3>

        {q.type === "choice" ? (
          <div className="grid gap-3">
            {q.options.map((opt) => {
              const selected = currentAnswer === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => {
                    setAnswers((p) => ({ ...p, [q.id]: opt.key }));
                  }}
                  className="group flex cursor-pointer items-start gap-4 rounded-2xl border border-border bg-card p-5 text-left transition-colors duration-100 hover:border-[var(--block-estudar)]"
                  style={
                    selected
                      ? { borderColor: "var(--block-estudar)", backgroundColor: "var(--block-estudar-soft)" }
                      : undefined
                  }
                >
                  <span
                    className={`flex size-6 shrink-0 items-center justify-center rounded-full font-serif text-xs ${
                      selected ? "" : "border border-border bg-background text-muted-foreground"
                    }`}
                    style={selected ? { backgroundColor: "var(--block-estudar)", color: "var(--block-estudar-on)" } : undefined}
                  >
                    {opt.key}
                  </span>
                  <p className={`text-sm leading-relaxed ${selected ? "font-medium text-foreground" : "text-foreground/90"}`}>
                    {opt.label}
                  </p>
                </button>
              );
            })}
          </div>
        ) : (
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <label className="block text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                Resposta (texto ou áudio)
              </label>
              <AudioAnswerButton
                onTranscript={(text) =>
                  setAnswers((p) => {
                    const prev = p[q.id] ?? "";
                    const next = (prev ? prev + " " : "") + text;
                    return { ...p, [q.id]: next.slice(0, 2000) };
                  })
                }
              />
            </div>
            <textarea
              value={currentAnswer}
              onChange={(e) => setAnswers((p) => ({ ...p, [q.id]: e.target.value.slice(0, 2000) }))}
              placeholder={q.placeholder ?? "Escreva sua resposta ou grave por áudio..."}
              className="h-40 w-full rounded-2xl border border-border bg-card p-4 text-sm outline-none transition-colors placeholder:text-muted-foreground/50 focus:border-[var(--block-estudar)] focus:ring-1 focus:ring-[var(--block-estudar)]"
            />
            <p className="mt-2 font-mono text-[10px] text-muted-foreground">{currentAnswer.length}/2000</p>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-border pt-8">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="flex cursor-pointer items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
          >
            <ArrowLeft className="size-4" /> Anterior
          </button>
          {step === total - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={!canAdvance}
              className="group flex cursor-pointer items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all hover:opacity-90 disabled:opacity-30"
              style={{ backgroundColor: "var(--block-estudar)", color: "var(--block-estudar-on)" }}
            >
              Gerar Relatório
              <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
            </button>
          ) : (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canAdvance}
              className="group flex cursor-pointer items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-[var(--block-estudar)] disabled:opacity-30"
            >
              Próxima
              <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
