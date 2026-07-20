import { promises as fs } from "node:fs";
import { createHash } from "node:crypto";
import * as cheerio from "cheerio";
import { safeJoin } from "@/infrastructure/chat/contentSourceUtils";

const WORDS_PER_MINUTE = 200;

export interface ReadingTimeResult {
    minutes: number;
    contentHash: string;
    wordCount: number;
}

/**
 * Extrai texto de HTML, remove tags de navegação/estilo,
 * calcula tempo de leitura e hash SHA-256 do conteúdo textual.
 */
export function calculateReadingTime(html: string): ReadingTimeResult {
    const $ = cheerio.load(html);

    $("nav, header, footer, aside, script, style, noscript").remove();
    $('[class*="breadcrumb" i], [class*="toc" i], [class*="nav" i], [class*="menu" i]').remove();
    $('[id*="breadcrumb" i], [id*="toc" i], [id*="nav" i]').remove();
    $(".tabs, .tab").remove();

    const text = $.text().replace(/\s+/g, " ").trim();
    const words = text.split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
    const contentHash = createHash("sha256").update(text).digest("hex");

    return { minutes, contentHash, wordCount: words };
}

/**
 * Lê um arquivo HTML do filesystem de storage e calcula tempo de leitura.
 */
export async function calculateFromFile(htmlPath: string): Promise<ReadingTimeResult> {
    const absPath = safeJoin(htmlPath);
    const html = await fs.readFile(absPath, "utf8");
    return calculateReadingTime(html);
}
