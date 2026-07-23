// Client-side PDF utilities (jsPDF generation + pdfjs text extraction)
import jsPDF from "jspdf";
import type { Question } from "./questions";
import type { AnalyzeResult } from "./analyze.client";

const MARGIN = 18;
const PAGE_WIDTH = 210;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

function addText(doc: jsPDF, text: string, y: number, opts: { size?: number; bold?: boolean; color?: [number, number, number] } = {}) {
  doc.setFontSize(opts.size ?? 11);
  doc.setFont("helvetica", opts.bold ? "bold" : "normal");
  if (opts.color) doc.setTextColor(...opts.color);
  else doc.setTextColor(20, 20, 30);
  const lines = doc.splitTextToSize(text, CONTENT_WIDTH);
  doc.text(lines, MARGIN, y);
  return y + lines.length * (opts.size ?? 11) * 0.45 + 2;
}

function checkPage(doc: jsPDF, y: number, needed = 20): number {
  if (y + needed > 280) {
    doc.addPage();
    return MARGIN;
  }
  return y;
}

export function generateBlankQuestionnairePDF(title: string, subtitle: string, questions: Question[]) {
  const doc = new jsPDF();
  let y = MARGIN;

  // Header
  doc.setFillColor(34, 56, 153);
  doc.rect(0, 0, PAGE_WIDTH, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("AXIOMA IA", MARGIN, 12);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Diagnóstico Educacional", MARGIN, 19);
  y = 38;

  y = addText(doc, title, y, { size: 20, bold: true });
  y = addText(doc, subtitle, y + 2, { size: 11, color: [100, 100, 110] });
  y += 6;

  // Student info fields
  y = addText(doc, "Nome do aluno: ____________________________________________", y, { size: 11 });
  y = addText(doc, "Data: ____ / ____ / ______", y + 2, { size: 11 });
  y += 6;

  let currentSection = "";
  questions.forEach((q, idx) => {
    y = checkPage(doc, y, 40);
    if (q.section !== currentSection) {
      currentSection = q.section;
      y += 4;
      y = addText(doc, currentSection.toUpperCase(), y, { size: 10, bold: true, color: [34, 56, 153] });
    }
    y = addText(doc, `${idx + 1}. ${q.prompt}`, y, { size: 11, bold: true });
    if (q.type === "choice") {
      q.options.forEach((opt) => {
        y = checkPage(doc, y);
        y = addText(doc, `( ) ${opt.key}) ${opt.label}`, y, { size: 10 });
      });
    } else {
      y += 2;
      for (let i = 0; i < 4; i++) {
        y = checkPage(doc, y);
        doc.setDrawColor(200, 200, 210);
        doc.line(MARGIN, y, MARGIN + CONTENT_WIDTH, y);
        y += 7;
      }
    }
    y += 4;
  });

  return doc;
}

export function generateReportPDF(result: AnalyzeResult, tipo: "perfil" | "tecnico", studentName?: string) {
  const doc = new jsPDF();
  let y = MARGIN;

  // Header
  doc.setFillColor(34, 56, 153);
  doc.rect(0, 0, PAGE_WIDTH, 32, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("AXIOMA IA · DIAGNÓSTICO", MARGIN, 11);
  doc.setFontSize(20);
  doc.text(
    tipo === "perfil" ? "Relatório de Perfil" : "Relatório Técnico",
    MARGIN,
    22,
  );
  y = 42;

  if (studentName) {
    y = addText(doc, `Aluno: ${studentName}`, y, { size: 10, color: [100, 100, 110] });
  }
  y = addText(doc, `Gerado em ${new Date().toLocaleDateString("pt-BR")}`, y, { size: 10, color: [100, 100, 110] });
  y += 4;

  // Profile title
  y = addText(doc, result.profileTitle, y, { size: 22, bold: true });
  y += 2;

  // Score
  doc.setFillColor(245, 243, 238);
  doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 18, 2, 2, "F");
  doc.setTextColor(100, 100, 110);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(result.scoreLabel.toUpperCase(), MARGIN + 4, y + 6);
  doc.setTextColor(34, 56, 153);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(result.scoreValue, MARGIN + 4, y + 14);
  y += 24;

  // Summary
  y = checkPage(doc, y, 30);
  y = addText(doc, "RESUMO", y, { size: 10, bold: true, color: [34, 56, 153] });
  y = addText(doc, result.summary, y, { size: 11 });
  y += 4;

  // Strengths
  y = checkPage(doc, y, 30);
  y = addText(doc, "PONTOS FORTES", y, { size: 10, bold: true, color: [40, 120, 70] });
  result.strengths.forEach((s) => {
    y = checkPage(doc, y);
    y = addText(doc, `✓ ${s}`, y, { size: 10 });
  });
  y += 3;

  // Gaps
  y = checkPage(doc, y, 30);
  y = addText(doc, "PONTOS DE ATENÇÃO", y, { size: 10, bold: true, color: [180, 100, 30] });
  result.gaps.forEach((g) => {
    y = checkPage(doc, y);
    y = addText(doc, `→ ${g}`, y, { size: 10 });
  });
  y += 3;

  // Competencies
  y = checkPage(doc, y, 50);
  y = addText(doc, "DISTRIBUIÇÃO DE COMPETÊNCIAS", y, { size: 10, bold: true, color: [34, 56, 153] });
  y += 2;
  result.competencies.forEach((c) => {
    y = checkPage(doc, y, 12);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(20, 20, 30);
    doc.text(c.label, MARGIN, y);
    doc.text(`${c.value}%`, MARGIN + CONTENT_WIDTH - 12, y);
    y += 2;
    doc.setFillColor(230, 230, 235);
    doc.roundedRect(MARGIN, y, CONTENT_WIDTH, 2, 1, 1, "F");
    doc.setFillColor(34, 56, 153);
    doc.roundedRect(MARGIN, y, (CONTENT_WIDTH * c.value) / 100, 2, 1, 1, "F");
    y += 7;
  });
  y += 4;

  // Recommendations
  y = checkPage(doc, y, 40);
  y = addText(doc, "RECOMENDAÇÕES PERSONALIZADAS", y, { size: 10, bold: true, color: [34, 56, 153] });
  y += 2;
  result.recommendations.forEach((r, idx) => {
    y = checkPage(doc, y, 20);
    y = addText(doc, `${idx + 1}. ${r.title}`, y, { size: 11, bold: true });
    y = addText(doc, r.description, y, { size: 10, color: [80, 80, 90] });
    y += 3;
  });

  return doc;
}

// Extract text from a PDF file (browser)
export async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((it: any) => it.str).join(" ") + "\n";
  }
  return text;
}
