"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Upload, Loader2, FileText, ArrowUpRight } from "lucide-react";
import { Nav } from "@/components/axioma/Nav";
import Footer from "@/components/Footer";
import { extractPdfText } from "@/lib/axioma/pdf-utils";
import { analyzeAnswers, type AnalyzeResult } from "@/lib/axioma/analyze.client";
import { ReportView } from "@/components/axioma/ReportView";

export default function UploadPage() {
  const tipo = "tecnico" as const;
  const [studentName, setStudentName] = useState("");
  const [fileName, setFileName] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<AnalyzeResult | null>(null);

  async function handleFile(file: File) {
    if (file.type !== "application/pdf") {
      toast.error("Por favor envie um arquivo PDF.");
      return;
    }
    setFileName(file.name);
    setLoading(true);
    try {
      const text = await extractPdfText(file);
      setExtractedText(text);
      toast.success("PDF lido com sucesso. Revise e gere o relatório.");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "";
      toast.error("Erro ao ler PDF: " + message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAnalyze() {
    if (!extractedText.trim()) {
      toast.error("Nenhum texto extraído do PDF.");
      return;
    }
    setLoading(true);
    try {
      const result = await analyzeAnswers({
        tipo,
        studentName: studentName || undefined,
        answers: [
          {
            questionId: "pdf_full",
            prompt:
              "Conteúdo completo da prova técnica de IA preenchida (extraído do PDF). Analise as respostas e gere o relatório falando diretamente com a pessoa (use 'você').",
            type: "open" as const,
            answer: extractedText.slice(0, 12000),
          },
        ],
      });
      setReport(result);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erro ao gerar relatório");
    } finally {
      setLoading(false);
    }
  }

  if (report) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Nav />
        <main className="flex-1">
          <ReportView result={report} tipo={tipo} studentName={studentName} />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Nav />
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-20 animate-in">
        {/* Eyebrow — traço na cor do bloco + código + hairline */}
        <div className="flex items-center gap-3">
          <span className="h-[2px] w-6" style={{ backgroundColor: "var(--block-estudar)" }} aria-hidden="true" />
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Análise de PDF
          </span>
          <div className="hidden flex-1 sm:flex">
            <div className="h-px flex-1 bg-border" />
          </div>
        </div>

        <h1 className="mt-6 font-serif text-4xl leading-[1.1] tracking-[-0.02em] text-ink md:text-5xl">
          Envie sua prova técnica respondida
        </h1>
        <p className="mt-4 mb-10 text-base leading-relaxed text-muted-foreground sm:text-lg">
          Baixou o PDF da prova técnica (geral ou personalizada) e respondeu offline? Envie aqui
          que a IA lê, corrige e devolve um relatório com pontos fortes, lacunas e recomendações
          falando diretamente com você.
        </p>

        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="h-1.5 w-full" style={{ backgroundColor: "var(--block-estudar)" }} aria-hidden="true" />
          <div className="space-y-6 p-6 md:p-8">
            <blockquote
              className="rounded-r-xl border-l-2 p-4 text-sm"
              style={{ borderColor: "var(--block-estudar)", backgroundColor: "var(--block-estudar-soft)" }}
            >
              <p className="mb-1 font-serif text-base text-ink">Apenas prova técnica</p>
              <p className="leading-relaxed text-muted-foreground">
                A triagem comportamental é respondida diretamente no site, então não há PDF para
                enviar. Este upload é exclusivo para a prova técnica de conhecimento em IA.
              </p>
            </blockquote>

            <div>
              <label className="mb-3 block text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                Seu nome (opcional)
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value.slice(0, 120))}
                placeholder="Seu nome"
                className="w-full rounded-xl border border-border bg-background p-3 outline-none transition-colors focus:border-[var(--block-estudar)] focus:ring-1 focus:ring-[var(--block-estudar)]"
              />
            </div>

            <div>
              <label className="mb-3 block text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                Arquivo PDF
              </label>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-background p-8 transition-colors hover:border-[var(--block-estudar)]">
                {fileName ? (
                  <>
                    <FileText className="size-8" style={{ color: "var(--block-estudar)" }} />
                    <p className="font-serif text-base text-ink">{fileName}</p>
                    <p className="text-xs text-muted-foreground">Clique para trocar</p>
                  </>
                ) : (
                  <>
                    <Upload className="size-8 text-muted-foreground" />
                    <p className="font-serif text-base text-ink">Clique para enviar PDF</p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Máx. 20 MB</p>
                  </>
                )}
                <input
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
              </label>
            </div>

            {extractedText && (
              <div>
                <label className="mb-3 block text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                  Texto extraído (revisar/editar antes de analisar)
                </label>
                <textarea
                  value={extractedText}
                  onChange={(e) => setExtractedText(e.target.value)}
                  className="h-48 w-full rounded-xl border border-border bg-background p-4 font-mono text-xs outline-none transition-colors focus:border-[var(--block-estudar)] focus:ring-1 focus:ring-[var(--block-estudar)]"
                />
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={loading || !extractedText.trim()}
              className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold transition-all hover:opacity-90 disabled:opacity-40"
              style={{ backgroundColor: "var(--block-estudar)", color: "var(--block-estudar-on)" }}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Processando...
                </>
              ) : (
                <>
                  Gerar Relatório com IA
                  <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
