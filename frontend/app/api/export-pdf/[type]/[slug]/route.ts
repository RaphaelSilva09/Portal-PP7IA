/**
 * API Route: Exportar conteúdo para PDF
 *
 * Renderiza a mesma página que o leitor já vê no iframe (/api/proxy-html)
 * num navegador headless e devolve como PDF — garante fidelidade visual
 * exata em vez de reimplementar a formatação editorial numa segunda vez.
 *
 * Ambientes:
 * - Produção (qualquer build de produção — Railway, Vercel, etc.):
 *   puppeteer-core + @sparticuz/chromium, um binário estático que roda sem
 *   as bibliotecas de sistema (libnss3, libgbm, fontconfig...) que um
 *   container mínimo normalmente não tem instaladas.
 * - Dev local: puppeteer completo (baixa seu próprio Chromium), devDependency
 *   — não existe em builds de produção, e mesmo que existisse, o Chromium
 *   completo que ele baixa não roda nesses containers mínimos.
 *
 * Detectar isso via `VERCEL`/`AWS_LAMBDA_FUNCTION_NAME` deixava a Railway de
 * fora (nenhuma das duas env vars existe lá) — caía no branch de dev e
 * quebrava com 500 em produção. `NODE_ENV === "production"` é o sinal que o
 * próprio Next.js seta em `next build`/`next start` independente da
 * plataforma de hospedagem.
 */
import type { Browser } from "puppeteer-core";
import { NextRequest, NextResponse } from "next/server";
import { resolveBaseUrl } from "@/lib/baseUrl";
import { resolveContentFilePath } from "@/lib/contentStorage";

export const maxDuration = 60;

function needsBundledChromium(): boolean {
    return process.env.NODE_ENV === "production";
}

async function launchBrowser(): Promise<Browser> {
    if (needsBundledChromium()) {
        const [{ default: chromium }, { default: puppeteer }] = await Promise.all([
            import("@sparticuz/chromium"),
            import("puppeteer-core"),
        ]);
        return puppeteer.launch({
            args: chromium.args,
            defaultViewport: { width: 1240, height: 1754 },
            executablePath: await chromium.executablePath(),
            headless: "shell",
        });
    }

    const { default: puppeteer } = await import("puppeteer");
    return puppeteer.launch({ headless: true }) as unknown as Promise<Browser>;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ type: string; slug: string }> }) {
    const { type, slug } = await params;

    const resolved = await resolveContentFilePath(type, slug);
    if (!resolved.ok) {
        return NextResponse.json({ error: resolved.error }, { status: resolved.status });
    }

    const baseUrl = resolveBaseUrl(request);
    const contentUrl = `${baseUrl}/api/proxy-html/${type}/${slug}`;

    let browser: Browser | null = null;
    try {
        browser = await launchBrowser();
        const page = await browser.newPage();
        await page.goto(contentUrl, { waitUntil: "networkidle0" });
        // Garante que fundos coloridos do conteúdo (definidos em CSS) apareçam
        // no PDF em vez de serem descartados pelas configurações padrão de impressão.
        await page.addStyleTag({ content: "* { -webkit-print-color-adjust: exact; print-color-adjust: exact; }" });

        const pdfBuffer = await page.pdf({
            format: "a4",
            printBackground: true,
            margin: { top: "16mm", bottom: "16mm", left: "14mm", right: "14mm" },
        });

        return new NextResponse(Buffer.from(pdfBuffer), {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="pp7ias-${type}-${slug}.pdf"`,
                "Cache-Control": "no-store",
            },
        });
    } catch (error) {
        console.error("Erro ao exportar PDF:", error);
        return NextResponse.json({ error: "Não foi possível gerar o PDF" }, { status: 500 });
    } finally {
        await browser?.close();
    }
}
