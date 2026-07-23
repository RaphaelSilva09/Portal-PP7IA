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
 *
 * A navegação do Chromium para /api/proxy-html usa loopback (127.0.0.1),
 * não o domínio público: o domínio público passa pelo Cloudflare, que
 * reconhece o fingerprint de um navegador headless (navigator.webdriver,
 * ausência de sinais normais de browser) como bot e devolve a página de
 * verificação de segurança em vez do conteúdo — o Chromium então captura
 * essa página de desafio no PDF em vez do artigo. Como o Next roda como
 * servidor persistente no mesmo container (Railway, não serverless),
 * `puppeteer` e o servidor HTTP convivem no mesmo processo/host, e o
 * loopback nunca passa pelo edge/CDN.
 */
import type { Browser } from "puppeteer-core";
import { NextRequest, NextResponse } from "next/server";
import { resolveContentFilePath } from "@/lib/contentStorage";

export const maxDuration = 60;

function needsBundledChromium(): boolean {
    return process.env.NODE_ENV === "production";
}

function resolveInternalContentUrl(type: string, slug: string): string {
    const port = process.env.PORT ?? "3000";
    return `http://127.0.0.1:${port}/api/proxy-html/${type}/${slug}`;
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

export async function GET(_request: NextRequest, { params }: { params: Promise<{ type: string; slug: string }> }) {
    const { type, slug } = await params;

    const resolved = await resolveContentFilePath(type, slug);
    if (!resolved.ok) {
        return NextResponse.json({ error: resolved.error }, { status: resolved.status });
    }

    const contentUrl = resolveInternalContentUrl(type, slug);

    let browser: Browser | null = null;
    try {
        browser = await launchBrowser();
        const page = await browser.newPage();
        await page.goto(contentUrl, { waitUntil: "networkidle0" });

        // O conteúdo usa animação de "revelar ao rolar" (algo como
        // IntersectionObserver, tipicamente opacity 0→1 quando a seção entra
        // na tela). page.pdf() nunca rola a página de verdade — só a seção
        // já visível no primeiro carregamento dispara a revelação, então
        // tudo abaixo da primeira tela ficava preso no estado inicial
        // (baixa/zero opacidade), piorando a cada página seguinte do PDF
        // (mais longe do topo, menos seções tinham "entrado em tela"). Rolar
        // a página inteira antes de imprimir dispara essas revelações uma a
        // uma, como um leitor real rolando a tela.
        await page.evaluate(async () => {
            const stepPx = window.innerHeight;
            const delayMs = 120;
            const maxSteps = 200; // teto de segurança, bem acima de qualquer conteúdo real
            for (let i = 0; i < maxSteps && window.scrollY + window.innerHeight < document.body.scrollHeight; i++) {
                window.scrollBy(0, stepPx);
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
            window.scrollTo(0, 0);
            await new Promise(resolve => setTimeout(resolve, delayMs));
        });

        // Garante que fundos coloridos do conteúdo (definidos em CSS) apareçam
        // no PDF em vez de serem descartados pelas configurações padrão de
        // impressão, e evita que seções sejam cortadas ao meio entre páginas.
        //
        // Duas camadas: regras genéricas por tag semântica (cobrem qualquer
        // conteúdo, seja qual for o template) + classes do "PP7+IAS Design
        // System" observado nos HTMLs de mini-livro (.card, .hero, .manifesto
        // etc. — blocos de conteúdo, não containers gigantes como .section,
        // que podem ser mais altos que uma página e forçariam um vão em
        // branco se travados inteiros). Um seletor que não casa com nada no
        // documento é inofensivo, então é seguro manter os dois grupos juntos
        // mesmo quando um tipo de conteúdo não usa essas classes.
        await page.addStyleTag({
            content: `
                * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

                h1, h2, h3, h4, h5, h6, p, li, blockquote, img, figure, tr, pre {
                    break-inside: avoid;
                    page-break-inside: avoid;
                }
                h1, h2, h3, h4, h5, h6 {
                    break-after: avoid;
                    page-break-after: avoid;
                }

                .card, .hero, .manifesto, .cit, .test-box, .prompt-box,
                .list-item, .tb-item, .num-item, .nums {
                    break-inside: avoid;
                    page-break-inside: avoid;
                }
            `,
        });

        const pdfBuffer = await page.pdf({
            format: "a4",
            printBackground: true,
            margin: { top: "8mm", bottom: "8mm", left: "8mm", right: "8mm" },
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
