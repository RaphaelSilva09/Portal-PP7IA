import type { PoolClient } from "pg";

import { pool as defaultPool } from "../db";
import { EMAIL_FROM, assertEmailConfigured, resend as defaultResend } from "./resend";
import { signUnsubscribeToken } from "./unsubscribeToken";

const DEFAULT_SITE_URL = "https://pp7ias-portal.com.br";
const DIGEST_TIME_ZONE = "America/Sao_Paulo";
const DIGEST_HOUR = 10;
const DIGEST_MINUTE = 0;
const DIGEST_CRON_UTC = "0 13 * * 3";
const DEFAULT_DIGEST_MAX_ITEMS = 20;
const DEFAULT_DIGEST_SEND_INTERVAL_MS = 125;
const DEFAULT_DIGEST_RATE_LIMIT_RETRY_MS = 1_200;
const MAX_DIGEST_RATE_LIMIT_RETRIES = 3;
const PRODUCTION_ENVIRONMENT_NAMES = new Set(["production", "prod"]);
const PRODUCTION_BRANCH_NAMES = new Set(["main", "master"]);

/**
 * A recipient who unsubscribes between run-start and their own send-time
 * (caught by isStillSubscribed's recheck) is not an operational failure —
 * it's the feature working as intended, and far more likely now that every
 * digest carries a one-click unsubscribe link. It's recorded as `status =
 * 'failed'` (the schema has no separate terminal status for this — see
 * docs/setup/WEEKLY_NEWS_UNSUBSCRIBE.md) but must be excluded from
 * failedCount: counting it as a real failure would block markQueueSent and
 * cause this week's already-sent content to be resent to everyone next week.
 */
const CANCELLED_BEFORE_SEND_ERROR = "Cancelado antes do envio";

const TABLE_CONFIG: Record<string, { label: string; viewType: string; fallbackPath: string; accentLight: string; accentDark: string }> = {
    newsletters: { label: "Newsletter", viewType: "newsletter", fallbackPath: "/explorar?b=newsletter", accentLight: "#3b82f6", accentDark: "#60a5fa" },
    mini_livros: { label: "Mini-livros", viewType: "mini-livro", fallbackPath: "/explorar?b=livro", accentLight: "#f59e0b", accentDark: "#fbbf24" },
    biblioteca: { label: "Biblioteca", viewType: "biblioteca", fallbackPath: "/explorar?b=biblioteca", accentLight: "#14b8a6", accentDark: "#2dd4bf" },
    especial_semana: { label: "Especial da Semana", viewType: "especial-semana", fallbackPath: "/explorar?b=inteligencia-artificial", accentLight: "#f97316", accentDark: "#fb923c" },
    estudar: { label: "Estudar", viewType: "estudar", fallbackPath: "/explorar?b=estudar", accentLight: "#6366f1", accentDark: "#818cf8" },
    radar_oportunidades: { label: "Radar de Oportunidades", viewType: "radar_oportunidades", fallbackPath: "/explorar?b=editoriais-artigos", accentLight: "#06b6d4", accentDark: "#22d3ee" },
    ebooks: { label: "E-books", viewType: "ebook", fallbackPath: "/mini-livros", accentLight: "#ec4899", accentDark: "#f472b6" },
};
const SUPPORTED_TABLE_NAMES = Object.keys(TABLE_CONFIG);

const MONTHS_PT_ABBR = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const MUTED_TEXT_COLOR = "#AA955E";
const MUTED_BAR_COLOR = "#D9C793";
const ENSINAR_ACCENT = "#A84A62";

interface DigestBlockDef {
    number: string;
    heading: string;
    tagline: string;
    color: string;
    path: string;
    tables: string[];
    kickerSingular: string;
    kickerPlural: string;
    preheaderLabel: string;
}

const DIGEST_BLOCK_DEFS: DigestBlockDef[] = [
    { number: "01", heading: "Newsletter", tagline: "Segunda e quarta", color: "#3b82f6", path: "/explorar?b=newsletter", tables: ["newsletters"], kickerSingular: "nova edição", kickerPlural: "novas edições", preheaderLabel: "no Newsletter" },
    { number: "02", heading: "Inteligência Artificial", tagline: "Atualização contínua", color: "#f97316", path: "/explorar?b=inteligencia-artificial", tables: ["especial_semana"], kickerSingular: "nova análise", kickerPlural: "novas análises", preheaderLabel: "em Inteligência Artificial" },
    { number: "03", heading: "Editoriais e Artigos", tagline: "3 a 4 por publicação", color: "#06b6d4", path: "/explorar?b=editoriais-artigos", tables: ["radar_oportunidades"], kickerSingular: "novo texto", kickerPlural: "novos textos", preheaderLabel: "em Editoriais e Artigos" },
    { number: "04", heading: "Enquanto é Tempo", tagline: "Novos capítulos", color: "#f59e0b", path: "/explorar?b=livro", tables: ["mini_livros", "ebooks"], kickerSingular: "novo capítulo", kickerPlural: "novos capítulos", preheaderLabel: "em Enquanto é Tempo" },
    { number: "05", heading: "Biblioteca", tagline: "Atualizada toda semana", color: "#14b8a6", path: "/explorar?b=biblioteca", tables: ["biblioteca"], kickerSingular: "novo item", kickerPlural: "novos itens", preheaderLabel: "na Biblioteca" },
    { number: "06", heading: "Estudar", tagline: "Em curadoria", color: "#6366f1", path: "/explorar?b=estudar", tables: ["estudar"], kickerSingular: "nova trilha", kickerPlural: "novas trilhas", preheaderLabel: "em Estudar" },
];

const ENSINAR_BLOCK = {
    number: "07",
    heading: "Ensinar",
    tagline: "Em construção",
    path: "/explorar?b=ensinar",
};

type Logger = Pick<Console, "log" | "warn" | "error">;

export interface DigestQueueRow {
    id: string;
    table_name: string;
    record_id: string;
    record_data: Record<string, unknown>;
    created_at: Date | string;
}

export interface DigestRecipient {
    id: string;
    email: string;
    nome: string | null;
}

export interface DigestItem {
    queueId: string;
    tableName: string;
    recordId: string;
    title: string;
    readTime: number | null;
    href: string | null;
    createdAt: Date;
}

export interface WeeklyDigestEmail {
    subject: string;
    html: string;
    text: string;
}

export interface WeeklyDigestResult {
    status: "skipped" | "empty" | "completed" | "partial";
    digestKey: string;
    contentCount: number;
    recipientCount: number;
    sentCount: number;
    failedCount: number;
}

interface WeeklyDigestOptions {
    now?: Date;
    force?: boolean;
    dryRun?: boolean;
    siteUrl?: string;
    maxItems?: number;
    sendIntervalMs?: number;
    rateLimitRetryDelayMs?: number;
    logger?: Logger;
    pool?: typeof defaultPool;
    resendClient?: typeof defaultResend;
}

interface TimeParts {
    weekday: string;
    year: string;
    month: string;
    day: string;
}

export function getWeeklyDigestSchedule() {
    return {
        dayOfWeek: "wednesday",
        hour: DIGEST_HOUR,
        minute: DIGEST_MINUTE,
        timeZone: DIGEST_TIME_ZONE,
        railwayCronUtc: DIGEST_CRON_UTC,
    };
}

export function shouldRunWeeklyDigest(now = new Date(), options: { force?: boolean } = {}): boolean {
    if (options.force) return true;
    return getTimeParts(now).weekday.toLowerCase() === "wednesday";
}

export function getDigestKey(now = new Date()): string {
    const parts = getTimeParts(now);
    return `${parts.year}-${parts.month}-${parts.day}`;
}

export function normalizeDigestItem(row: DigestQueueRow, siteUrl = DEFAULT_SITE_URL): DigestItem {
    const data = row.record_data ?? {};
    const config = TABLE_CONFIG[row.table_name];
    const title = stringValue(data.title).trim() || `${config?.label ?? "Conteúdo"} #${row.record_id}`;
    const htmlPath = stringValue(data.html_path) || stringValue(data.intro_html_path);
    const readTime = numberValue(data.read_time);
    const slug = slugFromPath(htmlPath);
    const href = config
        ? absoluteUrl(slug ? `/view/${config.viewType}/${slug}` : config.fallbackPath, siteUrl)
        : null;

    return {
        queueId: row.id,
        tableName: row.table_name,
        recordId: row.record_id,
        title,
        readTime,
        href,
        createdAt: new Date(row.created_at),
    };
}

export function buildWeeklyDigestEmail({
    items,
    siteUrl = DEFAULT_SITE_URL,
    unsubscribeUrl,
    now = new Date(),
}: {
    items: DigestItem[];
    siteUrl?: string;
    unsubscribeUrl: string;
    now?: Date;
}): WeeklyDigestEmail {
    const grouped = groupByTable(items);
    const blocks: Array<DigestBlockDef & { items: DigestItem[]; count: number }> = DIGEST_BLOCK_DEFS.map((def) => {
        const blockItems = def.tables
            .flatMap((table) => grouped.get(table) ?? [])
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        return { ...def, items: blockItems, count: blockItems.length };
    });

    const totalCount = items.length;
    const totalBlocksCount = blocks.length + 1;
    const activeBlocks = blocks.filter((block) => block.count > 0);

    const dateParts = getTimeParts(now);
    const dateLabel = `${dateParts.day} ${MONTHS_PT_ABBR[Number(dateParts.month) - 1]} ${dateParts.year}`;

    const subject = `PP7+IAS · ${totalCount} novidade${totalCount === 1 ? "" : "s"} nos blocos`;
    const preheader = buildDigestPreheader(totalCount, activeBlocks);

    const summaryHtml = [...blocks, { ...ENSINAR_BLOCK, color: MUTED_BAR_COLOR, count: 0 }]
        .map((block) => renderSummaryTile(block, siteUrl))
        .join("");

    const detailRowsHtml =
        blocks.map((block, index) => renderBlockRow(block, index, siteUrl)).join("") +
        renderEnsinarRow(blocks.length, siteUrl);

    const explorarUrl = escapeAttribute(absoluteUrl("/explorar", siteUrl));
    const preferencesUrl = escapeAttribute(absoluteUrl("/user", siteUrl));
    const miniLivrosUrl = escapeAttribute(absoluteUrl("/mini-livros", siteUrl));
    const trilhasUrl = escapeAttribute(absoluteUrl("/trilhas", siteUrl));
    const quemSomosUrl = escapeAttribute(absoluteUrl("/quem-somos", siteUrl));
    const faqUrl = escapeAttribute(absoluteUrl("/faq", siteUrl));

    const textLines = blocks
        .filter((block) => block.count > 0)
        .flatMap((block) => [
            `${block.heading} (${block.count})`,
            ...block.items.map((item) => `- ${item.title}${item.href ? ` - ${item.href}` : ""}`),
            "",
        ]);

    return {
        subject,
        html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${escapeHtml(subject)}</title>
<style>
@media only screen and (max-width:620px){
 .wrap{width:100%!important}
 .pad{padding-left:0!important;padding-right:20px!important}
 .stack{display:block!important;width:100%!important;box-sizing:border-box!important}
 .stack2{padding-left:22px!important;padding-right:22px!important}
 .huge{font-size:70px!important;line-height:64px!important}
}
</style>
</head>
<body style="margin:0; padding:0; background-color:#E9DAB0;">
<span style="display:none; font-size:1px; color:#E9DAB0; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">${escapeHtml(preheader)}</span>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#E9DAB0;">
<tr><td align="center" style="padding:28px 0 46px 0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" class="wrap" style="width:600px; max-width:600px;">

 <tr><td bgcolor="#F7EDC9" class="stack2" style="background-color:#F7EDC9; padding:38px 40px 34px 40px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
   <tr>
    <td align="left" style="font-family:Georgia,'Times New Roman',serif; font-size:22px; line-height:26px; mso-line-height-rule:exactly; color:#31260F; letter-spacing:-0.5px;"><span style="border-bottom:2px solid #DE9500; padding-bottom:3px;">PP7</span><span style="color:#8E6F33; padding:0 4px;">+</span><span style="border-bottom:2px solid #BE6C18; padding-bottom:3px;">IAS</span></td>
    <td align="right" style="font-family:'Courier New',Courier,monospace; font-size:10px; line-height:16px; mso-line-height-rule:exactly; letter-spacing:1.4px; text-transform:uppercase; color:#AA955E;">${escapeHtml(dateLabel)}</td>
   </tr>
   <tr><td height="32" style="height:32px; line-height:32px; font-size:0;">&nbsp;</td></tr>
   <tr><td colspan="2" class="huge" style="font-family:Arial,Helvetica,sans-serif; font-size:88px; line-height:78px; mso-line-height-rule:exactly; font-weight:bold; color:#31260F; letter-spacing:-5px;">${totalCount}</td></tr>
   <tr><td height="12" style="height:12px; line-height:12px; font-size:0;">&nbsp;</td></tr>
   <tr><td colspan="2" style="font-family:Georgia,'Times New Roman',serif; font-size:23px; line-height:31px; mso-line-height-rule:exactly; color:#8B4A0F;">publicaç${totalCount === 1 ? "ão nova" : "ões novas"} em ${activeBlocks.length} dos ${totalBlocksCount} blocos.</td></tr>
   <tr><td height="30" style="height:30px; line-height:30px; font-size:0;">&nbsp;</td></tr>
   <tr><td colspan="2" style="font-family:Arial,Helvetica,sans-serif; font-size:10px; line-height:14px; mso-line-height-rule:exactly; letter-spacing:1.6px; text-transform:uppercase; color:#AA955E; padding-bottom:12px; border-bottom:1px solid #D9C793;">Quantidade por bloco &nbsp;·&nbsp; toque para ir direto</td></tr>
   <tr><td height="16" style="height:16px; line-height:16px; font-size:0;">&nbsp;</td></tr>
   <tr><td colspan="2"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>${summaryHtml}</tr></table></td></tr>
  </table></td></tr>

${detailRowsHtml}

 <tr><td bgcolor="#F7EDC9" class="stack2" style="background-color:#F7EDC9; padding:30px 40px 34px 40px; border-top:1px solid #D9C793;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
   <tr><td style="font-family:Georgia,'Times New Roman',serif; font-size:17px; line-height:26px; mso-line-height-rule:exactly; color:#605021;">Quer ver tudo de uma vez, com filtro por bloco e por data?</td></tr>
   <tr><td height="18" style="height:18px; line-height:18px; font-size:0;">&nbsp;</td></tr>
   <tr><td><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#31260F" style="background-color:#31260F; border-radius:2px; padding:15px 30px;">
    <a href="${explorarUrl}" style="display:block; font-family:Arial,Helvetica,sans-serif; font-size:12px; line-height:16px; mso-line-height-rule:exactly; letter-spacing:1.4px; text-transform:uppercase; font-weight:bold; color:#F8EDC0; text-decoration:none;">Abrir Explorar &nbsp;&rarr;</a>
   </td></tr></table></td></tr>
  </table></td></tr>

 <tr><td bgcolor="#E9DAB0" class="stack2" style="background-color:#E9DAB0; padding:28px 40px 30px 40px;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
   <tr><td style="font-family:'Courier New',Courier,monospace; font-size:11px; line-height:20px; mso-line-height-rule:exactly; letter-spacing:0.8px; color:#6F5E31;"><a href="${explorarUrl}" style="color:#8B4A0F; text-decoration:none;">Explorar</a> &nbsp;·&nbsp; <a href="${miniLivrosUrl}" style="color:#8B4A0F; text-decoration:none;">Mini-livros</a> &nbsp;·&nbsp; <a href="${trilhasUrl}" style="color:#8B4A0F; text-decoration:none;">Trilhas</a> &nbsp;·&nbsp; <a href="${quemSomosUrl}" style="color:#8B4A0F; text-decoration:none;">Quem somos</a> &nbsp;·&nbsp; <a href="${faqUrl}" style="color:#8B4A0F; text-decoration:none;">FAQ</a></td></tr>
   <tr><td height="18" style="height:18px; line-height:18px; font-size:0;">&nbsp;</td></tr>
   <tr><td style="font-family:Arial,Helvetica,sans-serif; font-size:12px; line-height:20px; mso-line-height-rule:exactly; color:#6F5E31; border-top:1px solid #D9C793; padding-top:16px;">
    Você recebeu este e-mail porque optou por receber atualizações do Portal PP7+IAS.<br>
    <a href="${preferencesUrl}" style="color:#8B4A0F; text-decoration:underline;">Gerenciar preferências</a> &nbsp;·&nbsp; <a href="${escapeAttribute(unsubscribeUrl)}" style="color:#8B4A0F; text-decoration:underline;">Cancelar inscrição</a>
   </td></tr>
  </table></td></tr>

</table>
</td></tr></table>
</body>
</html>`,
        text: [
            subject,
            "",
            preheader,
            "",
            ...textLines,
            `Preferências: ${absoluteUrl("/user", siteUrl)}`,
            `Não quer mais receber as Novidades da semana? Cancelar inscrição: ${unsubscribeUrl}`,
        ].join("\n"),
    };
}

function buildDigestPreheader(
    totalCount: number,
    activeBlocks: Array<{ count: number; preheaderLabel: string }>,
): string {
    const top = [...activeBlocks].sort((a, b) => b.count - a.count).slice(0, 3);
    const parts = top.map((block) => `${block.count} ${block.preheaderLabel}`);
    const suffix = activeBlocks.length > top.length ? " e mais" : "";
    const noun = totalCount === 1 ? "publicação nova" : "publicações novas";
    return `${totalCount} ${noun}: ${parts.join(", ")}${suffix}.`;
}

function renderSummaryTile(
    block: { number: string; color: string; path: string; count: number },
    siteUrl: string,
): string {
    const active = block.count > 0;
    const barColor = active ? block.color : MUTED_BAR_COLOR;
    const valueColor = active ? block.color : MUTED_TEXT_COLOR;
    const value = active ? String(block.count) : "—";
    const href = escapeAttribute(absoluteUrl(block.path, siteUrl));
    return `<td width="14.28%" align="center" style="padding:0 2px;">
 <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td bgcolor="${barColor}" height="4" style="height:4px; font-size:0; line-height:4px;">&nbsp;</td></tr></table>
 <div style="font-family:Arial,Helvetica,sans-serif; font-size:19px; line-height:22px; mso-line-height-rule:exactly; font-weight:bold; color:${valueColor}; padding-top:9px;"><a href="${href}" style="color:${valueColor}; text-decoration:none;">${value}</a></div>
 <div style="font-family:'Courier New',Courier,monospace; font-size:10px; line-height:14px; mso-line-height-rule:exactly; letter-spacing:0.8px; color:${MUTED_TEXT_COLOR}; padding-top:3px;">${block.number}</div>
</td>`;
}

function renderItemList(blockItems: DigestItem[], color: string, siteUrl: string): string {
    const CAP = 4;
    const PREVIEW = 2;
    const visible = blockItems.length <= CAP ? blockItems : blockItems.slice(0, PREVIEW);
    const rows = visible
        .map((item) => {
            const title = escapeHtml(item.title);
            const href = escapeAttribute(item.href ?? absoluteUrl("/", siteUrl));
            return `<tr><td valign="top" width="16" style="width:16px; font-family:Arial,Helvetica,sans-serif; font-size:14px; line-height:23px; mso-line-height-rule:exactly; color:${color}; padding-bottom:8px;">&bull;</td><td valign="top" style="font-family:Georgia,'Times New Roman',serif; font-size:16px; line-height:23px; mso-line-height-rule:exactly; color:#605021; padding-bottom:8px;"><a href="${href}" style="color:#605021; text-decoration:none;">${title}</a></td></tr>`;
        })
        .join("");
    const overflow =
        blockItems.length > CAP
            ? `<tr><td></td><td style="font-family:Arial,Helvetica,sans-serif; font-size:13px; line-height:22px; mso-line-height-rule:exactly; color:${MUTED_TEXT_COLOR};">+ ${blockItems.length - PREVIEW} outros itens</td></tr>`
            : "";
    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:16px;">${rows}${overflow}</table>`;
}

function renderCta(href: string, label: string, color: string): string {
    return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top:18px;"><tr><td bgcolor="${color}" style="background-color:${color}; border-radius:2px; padding:13px 22px;">
        <a href="${href}" style="display:block; font-family:Arial,Helvetica,sans-serif; font-size:12px; line-height:16px; mso-line-height-rule:exactly; letter-spacing:1.2px; text-transform:uppercase; font-weight:bold; color:#FFFBE4; text-decoration:none;">${escapeHtml(label)} &nbsp;&rarr;</a>
       </td></tr></table>`;
}

function renderBlockRow(
    block: DigestBlockDef & { items: DigestItem[]; count: number },
    index: number,
    siteUrl: string,
): string {
    const bg = index % 2 === 0 ? "#F7EDC9" : "#EFE2BA";
    const active = block.count > 0;
    const href = escapeAttribute(absoluteUrl(block.path, siteUrl));
    const kicker = !active ? "nenhum novo" : block.count === 1 ? block.kickerSingular : block.kickerPlural;
    const statColor = active ? block.color : MUTED_TEXT_COLOR;
    const statValue = active ? String(block.count) : "—";
    const statFontSize = active ? "52px" : "36px";
    const statLineHeight = active ? "52px" : "44px";
    const body = active
        ? `${renderItemList(block.items, block.color, siteUrl)}
       ${renderCta(href, `Abrir bloco ${block.number}`, block.color)}`
        : `<div style="font-family:Georgia,'Times New Roman',serif; font-size:16px; line-height:24px; mso-line-height-rule:exactly; color:#605021; padding-top:6px;">Nenhuma novidade nesta edição.</div>
       ${renderCta(href, `Abrir bloco ${block.number}`, block.color)}`;

    return `<tr><td bgcolor="${bg}" class="pad" style="background-color:${bg}; padding:0 40px 0 0; border-top:1px solid #D9C793;">
   <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
     <td width="8" bgcolor="${block.color}" style="width:8px; background-color:${block.color}; font-size:0; line-height:0;">&nbsp;</td>
     <td width="130" class="stack" valign="top" style="width:130px; padding:28px 18px 28px 26px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${block.color}" style="background-color:${block.color}; padding:5px 9px;"><span style="font-family:'Courier New',Courier,monospace; font-size:11px; line-height:14px; mso-line-height-rule:exactly; letter-spacing:1.4px; color:#FFFBE4; font-weight:bold;">${block.number}</span></td></tr></table>
      <div style="font-family:Arial,Helvetica,sans-serif; font-size:${statFontSize}; line-height:${statLineHeight}; mso-line-height-rule:exactly; font-weight:bold; color:${statColor}; letter-spacing:-2.5px; padding-top:12px;">${statValue}</div>
      <div style="font-family:Arial,Helvetica,sans-serif; font-size:11px; line-height:16px; mso-line-height-rule:exactly; letter-spacing:0.8px; text-transform:uppercase; color:#6F5E31; padding-top:6px;">${escapeHtml(kicker)}</div>
     </td>
     <td class="stack" valign="top" style="padding:30px 0 28px 0;">
      <div style="font-family:Georgia,'Times New Roman',serif; font-size:25px; line-height:30px; mso-line-height-rule:exactly; color:#31260F; letter-spacing:-0.5px;"><a href="${href}" style="color:#31260F; text-decoration:none;">${escapeHtml(block.heading)}</a></div>
      <div style="font-family:Arial,Helvetica,sans-serif; font-size:11px; line-height:16px; mso-line-height-rule:exactly; letter-spacing:0.8px; text-transform:uppercase; color:${MUTED_TEXT_COLOR}; padding-top:7px;">${escapeHtml(block.tagline)}</div>
      ${body}
     </td>
    </tr>
   </table></td></tr>`;
}

function renderEnsinarRow(index: number, siteUrl: string): string {
    const bg = index % 2 === 0 ? "#F7EDC9" : "#EFE2BA";
    const href = escapeAttribute(absoluteUrl(ENSINAR_BLOCK.path, siteUrl));
    return `<tr><td bgcolor="${bg}" class="pad" style="background-color:${bg}; padding:0 40px 0 0; border-top:1px solid #D9C793;">
   <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
     <td width="8" bgcolor="${ENSINAR_ACCENT}" style="width:8px; background-color:${ENSINAR_ACCENT}; font-size:0; line-height:0;">&nbsp;</td>
     <td width="130" class="stack" valign="top" style="width:130px; padding:28px 18px 28px 26px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="${ENSINAR_ACCENT}" style="background-color:${ENSINAR_ACCENT}; padding:5px 9px;"><span style="font-family:'Courier New',Courier,monospace; font-size:11px; line-height:14px; mso-line-height-rule:exactly; letter-spacing:1.4px; color:#FFFBE4; font-weight:bold;">${ENSINAR_BLOCK.number}</span></td></tr></table>
      <div style="font-family:Arial,Helvetica,sans-serif; font-size:36px; line-height:44px; mso-line-height-rule:exactly; font-weight:bold; color:${MUTED_TEXT_COLOR}; letter-spacing:-2.5px; padding-top:12px;">—</div>
      <div style="font-family:Arial,Helvetica,sans-serif; font-size:11px; line-height:16px; mso-line-height-rule:exactly; letter-spacing:0.8px; text-transform:uppercase; color:#6F5E31; padding-top:6px;">nenhum novo</div>
     </td>
     <td class="stack" valign="top" style="padding:30px 0 28px 0;">
      <div style="font-family:Georgia,'Times New Roman',serif; font-size:25px; line-height:30px; mso-line-height-rule:exactly; color:#31260F; letter-spacing:-0.5px;"><a href="${href}" style="color:#31260F; text-decoration:none;">${ENSINAR_BLOCK.heading}</a></div>
      <div style="font-family:Arial,Helvetica,sans-serif; font-size:11px; line-height:16px; mso-line-height-rule:exactly; letter-spacing:0.8px; text-transform:uppercase; color:${MUTED_TEXT_COLOR}; padding-top:7px;">${ENSINAR_BLOCK.tagline}</div>
      <div style="font-family:Georgia,'Times New Roman',serif; font-size:17px; line-height:25px; mso-line-height-rule:exactly; color:#31260F; padding-top:14px;">Nenhum conteúdo novo nesta edição.</div>
      <div style="font-family:Georgia,'Times New Roman',serif; font-size:16px; line-height:24px; mso-line-height-rule:exactly; color:#605021; padding-top:8px;">O bloco segue em construção — mas o que já existe no portal sobre ensinar continua no ar: as trilhas de Estudar e o acervo da Biblioteca são o caminho natural até aqui.</div>
        ${renderCta(href, "Ver conteúdo relacionado", ENSINAR_ACCENT)}
      <div style="font-family:Arial,Helvetica,sans-serif; font-size:13px; line-height:21px; mso-line-height-rule:exactly; color:#6F5E31; padding-top:14px;"><a href="${href}" style="color:#8B4A0F; text-decoration:underline;">Avise-me quando o bloco 07 abrir</a></div>
     </td>
    </tr>
   </table></td></tr>`;
}

export async function sendWeeklyDigest(options: WeeklyDigestOptions = {}): Promise<WeeklyDigestResult> {
    const now = options.now ?? new Date();
    const siteUrl = resolveSiteUrl(options.siteUrl);
    const logger = options.logger ?? console;
    const dbPool = options.pool ?? defaultPool;
    const resendClient = options.resendClient ?? defaultResend;
    const digestKey = getDigestKey(now);
    const maxItems = resolveDigestMaxItems(options.maxItems);
    const sendIntervalMs = resolveNonNegativeNumber(options.sendIntervalMs, "DIGEST_SEND_INTERVAL_MS", DEFAULT_DIGEST_SEND_INTERVAL_MS);
    const rateLimitRetryDelayMs = resolveNonNegativeNumber(
        options.rateLimitRetryDelayMs,
        "DIGEST_RATE_LIMIT_RETRY_MS",
        DEFAULT_DIGEST_RATE_LIMIT_RETRY_MS,
    );
    const paceProviderSend = createProviderSendPacer(sendIntervalMs);

    if (!shouldRunWeeklyDigest(now, { force: options.force })) {
        logger.log(`[weekly-digest] skipped: ${digestKey} is not Wednesday in ${DIGEST_TIME_ZONE}`);
        return { status: "skipped", digestKey, contentCount: 0, recipientCount: 0, sentCount: 0, failedCount: 0 };
    }

    if (!options.dryRun && isExplicitlyNonProductionRuntimeTarget()) {
        logger.log(`[weekly-digest] skipped: delivery is disabled outside main/production`);
        return { status: "skipped", digestKey, contentCount: 0, recipientCount: 0, sentCount: 0, failedCount: 0 };
    }

    if (!options.force && !isProductionRuntimeTarget()) {
        logger.log(`[weekly-digest] skipped: automatic runs are only enabled on main/production`);
        return { status: "skipped", digestKey, contentCount: 0, recipientCount: 0, sentCount: 0, failedCount: 0 };
    }

    if (!options.dryRun && !options.resendClient) {
        assertEmailConfigured();
    }

    if (!options.dryRun && !process.env.UNSUBSCRIBE_TOKEN_SECRET?.trim()) {
        throw new Error("UNSUBSCRIBE_TOKEN_SECRET não configurado");
    }

    const client = await dbPool.connect();
    let runId: string | null = null;
    try {
        if (options.dryRun) {
            const rows = await loadPendingDigestRows(client, maxItems);
            const items = rows.map((row) => normalizeDigestItem(row, siteUrl));
            const recipients = await loadRecipients(client);
            for (const recipient of recipients) {
                logger.log(`[weekly-digest] dry-run: would send to ${recipient.email}`);
            }
            return {
                status: "skipped",
                digestKey,
                contentCount: items.length,
                recipientCount: recipients.length,
                sentCount: 0,
                failedCount: 0,
            };
        }

        runId = await createOrResumeRun(client, digestKey, now);
        if (!runId) {
            logger.log(`[weekly-digest] skipped: ${digestKey} already completed`);
            return { status: "skipped", digestKey, contentCount: 0, recipientCount: 0, sentCount: 0, failedCount: 0 };
        }

        const rows = await loadPendingDigestRows(client, maxItems);
        const items = rows.map((row) => normalizeDigestItem(row, siteUrl));
        const recipients = await loadRecipients(client);

        await updateRunCounts(client, runId, items.length, recipients.length);

        if (items.length === 0 || recipients.length === 0) {
            await finishRun(client, runId, items.length === 0 ? "empty" : "skipped", 0, 0, null);
            return {
                status: items.length === 0 ? "empty" : "skipped",
                digestKey,
                contentCount: items.length,
                recipientCount: recipients.length,
                sentCount: 0,
                failedCount: 0,
            };
        }

        await ensureDeliveries(client, runId, recipients);
        const pendingRecipients = await loadPendingRecipients(client, runId);

        for (const recipient of pendingRecipients) {
            try {
                if (!(await isStillSubscribed(client, recipient.id))) {
                    await markDeliveryFailed(client, runId, recipient.id, CANCELLED_BEFORE_SEND_ERROR);
                    continue;
                }

                const token = signUnsubscribeToken(recipient.id, "weekly_news");
                const email = buildWeeklyDigestEmail({
                    items,
                    siteUrl,
                    unsubscribeUrl: absoluteUrl(`/unsubscribe/weekly-news?token=${encodeURIComponent(token)}`, siteUrl),
                });
                const headerUnsubscribeUrl = absoluteUrl(
                    `/api/email/unsubscribe/weekly-news?token=${encodeURIComponent(token)}`,
                    siteUrl,
                );

                const providerMessageId = await sendDigestEmail({
                    resendClient,
                    recipient,
                    email,
                    unsubscribeUrl: headerUnsubscribeUrl,
                    paceProviderSend,
                    rateLimitRetryDelayMs,
                    logger,
                });
                await markDeliverySent(client, runId, recipient.id, providerMessageId);
            } catch (error) {
                await markDeliveryFailed(client, runId, recipient.id, errorMessage(error));
                logger.error(`[weekly-digest] failed for ${recipient.email}: ${errorMessage(error)}`);
            }
        }

        const { sentCount, failedCount } = await loadDeliveryTotals(client, runId);

        if (failedCount === 0) {
            await markQueueSent(client, items.map((item) => item.queueId));
        }

        const status = failedCount === 0 ? "completed" : "partial";
        await finishRun(client, runId, status, sentCount, failedCount, failedCount ? "Some recipients failed" : null);

        return { status, digestKey, contentCount: items.length, recipientCount: recipients.length, sentCount, failedCount };
    } catch (error) {
        if (runId) {
            try {
                const { sentCount, failedCount } = await loadDeliveryTotals(client, runId);
                await finishRun(client, runId, "failed", sentCount, failedCount, errorMessage(error));
            } catch (markError) {
                logger.error(`[weekly-digest] failed to mark run as failed: ${errorMessage(markError)}`);
            }
        }
        throw error;
    } finally {
        client.release();
    }
}

function getTimeParts(date: Date): TimeParts {
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: DIGEST_TIME_ZONE,
        weekday: "long",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    });
    const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));
    return {
        weekday: parts.weekday,
        year: parts.year,
        month: parts.month,
        day: parts.day,
    };
}

function groupByTable(items: DigestItem[]): Map<string, DigestItem[]> {
    const grouped = new Map<string, DigestItem[]>();
    for (const item of items) {
        grouped.set(item.tableName, [...(grouped.get(item.tableName) ?? []), item]);
    }
    return grouped;
}

function resolveSiteUrl(siteUrl?: string): string {
    return (siteUrl ?? process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? DEFAULT_SITE_URL).replace(/\/+$/, "");
}

function resolveDigestMaxItems(maxItems?: number): number {
    const value = maxItems ?? Number(process.env.DIGEST_MAX_ITEMS ?? DEFAULT_DIGEST_MAX_ITEMS);
    return Number.isInteger(value) && value > 0 ? value : DEFAULT_DIGEST_MAX_ITEMS;
}

function resolveNonNegativeNumber(value: number | undefined, envName: string, fallback: number): number {
    const resolved = value ?? Number(process.env[envName] ?? fallback);
    return Number.isFinite(resolved) && resolved >= 0 ? resolved : fallback;
}

function isProductionRuntimeTarget(): boolean {
    const environmentName = stringValue(process.env.RAILWAY_ENVIRONMENT_NAME).trim().toLowerCase();
    if (environmentName) return PRODUCTION_ENVIRONMENT_NAMES.has(environmentName);

    const gitBranch = stringValue(process.env.RAILWAY_GIT_BRANCH).trim().toLowerCase();
    return PRODUCTION_BRANCH_NAMES.has(gitBranch);
}

function isExplicitlyNonProductionRuntimeTarget(): boolean {
    const environmentName = stringValue(process.env.RAILWAY_ENVIRONMENT_NAME).trim().toLowerCase();
    const gitBranch = stringValue(process.env.RAILWAY_GIT_BRANCH).trim().toLowerCase();
    return Boolean(environmentName || gitBranch) && !isProductionRuntimeTarget();
}

function createProviderSendPacer(intervalMs: number): () => Promise<void> {
    let lastSendStartedAt = 0;
    return async () => {
        if (intervalMs <= 0) return;
        const waitMs = Math.max(0, lastSendStartedAt + intervalMs - Date.now());
        if (waitMs > 0) await sleep(waitMs);
        lastSendStartedAt = Date.now();
    };
}

function absoluteUrl(path: string, siteUrl: string): string {
    if (/^https?:\/\//.test(path)) return path;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${siteUrl.replace(/\/+$/, "")}${cleanPath}`;
}

function slugFromPath(path: string): string | null {
    const clean = path.trim();
    if (!clean) return null;
    const match = clean.match(/\/?([^/.]+)\.html$/);
    return match?.[1] ?? null;
}

function stringValue(value: unknown): string {
    return typeof value === "string" ? value : value == null ? "" : String(value);
}

function numberValue(value: unknown): number | null {
    const n = typeof value === "number" ? value : Number(value);
    return Number.isFinite(n) && n > 0 ? n : null;
}

function escapeHtml(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function escapeAttribute(value: string): string {
    return escapeHtml(value);
}

async function createOrResumeRun(client: PoolClient, digestKey: string, now: Date): Promise<string | null> {
    const result = await client.query<{ id: string }>(
        `INSERT INTO public.email_digest_runs (digest_key, status, started_at)
         VALUES ($1, 'running', $2)
         ON CONFLICT (digest_key) DO UPDATE
         SET status = 'running',
             started_at = EXCLUDED.started_at,
             finished_at = NULL,
             error = NULL
         WHERE public.email_digest_runs.status <> 'completed'
         RETURNING id`,
        [digestKey, now],
    );
    return result.rows[0]?.id ?? null;
}

async function loadPendingDigestRows(client: PoolClient, maxItems: number): Promise<DigestQueueRow[]> {
    const { rows } = await client.query<DigestQueueRow>(
        `SELECT id::text, table_name, record_id, record_data, created_at
         FROM public.content_digest_queue
         WHERE sent_at IS NULL
           AND table_name = ANY($1::text[])
         ORDER BY created_at ASC
         LIMIT $2`,
        [SUPPORTED_TABLE_NAMES, maxItems],
    );
    return rows;
}

async function loadRecipients(client: PoolClient): Promise<DigestRecipient[]> {
    const { rows } = await client.query<DigestRecipient>(
        `SELECT u.id::text, u.email, u.nome
         FROM "user" u
         JOIN public.communication_preferences cp
           ON cp.user_id = u.id AND cp.communication_type = 'weekly_news' AND cp.enabled = true
         WHERE u."emailVerified" = true
         ORDER BY u."createdAt" ASC`,
    );
    return rows;
}

/** Re-checks the preference right before actually sending — narrows the window for a just-cancelled user to still receive the email. */
async function isStillSubscribed(client: PoolClient, userId: string): Promise<boolean> {
    const { rows } = await client.query<{ enabled: boolean }>(
        `SELECT enabled FROM public.communication_preferences
         WHERE user_id = $1 AND communication_type = 'weekly_news'`,
        [userId],
    );
    return rows[0]?.enabled === true;
}

async function updateRunCounts(client: PoolClient, runId: string, contentCount: number, recipientCount: number): Promise<void> {
    await client.query(
        `UPDATE public.email_digest_runs
         SET content_count = $2, recipient_count = $3
         WHERE id = $1`,
        [runId, contentCount, recipientCount],
    );
}

async function ensureDeliveries(client: PoolClient, runId: string, recipients: DigestRecipient[]): Promise<void> {
    if (recipients.length === 0) return;
    await client.query(
        `INSERT INTO public.email_digest_deliveries (run_id, user_id, email, status)
         SELECT $1::uuid, recipient.user_id, recipient.email, 'pending'
         FROM unnest($2::uuid[], $3::text[]) AS recipient(user_id, email)
         ON CONFLICT (run_id, user_id) DO NOTHING`,
        [runId, recipients.map((recipient) => recipient.id), recipients.map((recipient) => recipient.email)],
    );
}

async function loadPendingRecipients(client: PoolClient, runId: string): Promise<DigestRecipient[]> {
    const { rows } = await client.query<DigestRecipient>(
        `SELECT user_id::text AS id, email, NULL::text AS nome
         FROM public.email_digest_deliveries
         WHERE run_id = $1
           AND status IN ('pending', 'failed')
         ORDER BY created_at ASC`,
        [runId],
    );
    return rows;
}

async function markDeliverySent(client: PoolClient, runId: string, userId: string, providerMessageId: string): Promise<void> {
    await client.query(
        `UPDATE public.email_digest_deliveries
         SET status = 'sent', sent_at = now(), provider_message_id = NULLIF($3, ''), error = NULL
         WHERE run_id = $1 AND user_id = $2`,
        [runId, userId, providerMessageId],
    );
}

async function markDeliveryFailed(client: PoolClient, runId: string, userId: string, error: string): Promise<void> {
    await client.query(
        `UPDATE public.email_digest_deliveries
         SET status = 'failed', error = $3
         WHERE run_id = $1 AND user_id = $2`,
        [runId, userId, error.slice(0, 1000)],
    );
}

async function loadDeliveryTotals(
    client: PoolClient,
    runId: string,
): Promise<{ sentCount: number; failedCount: number; cancelledCount: number }> {
    const { rows } = await client.query<{ sent_count: string; failed_count: string; cancelled_count: string }>(
        `SELECT
           COUNT(*) FILTER (WHERE status = 'sent')::text AS sent_count,
           COUNT(*) FILTER (WHERE status = 'failed' AND error IS DISTINCT FROM $2)::text AS failed_count,
           COUNT(*) FILTER (WHERE status = 'failed' AND error = $2)::text AS cancelled_count
         FROM public.email_digest_deliveries
         WHERE run_id = $1`,
        [runId, CANCELLED_BEFORE_SEND_ERROR],
    );
    return {
        sentCount: Number(rows[0]?.sent_count ?? 0),
        failedCount: Number(rows[0]?.failed_count ?? 0),
        cancelledCount: Number(rows[0]?.cancelled_count ?? 0),
    };
}

async function markQueueSent(client: PoolClient, queueIds: string[]): Promise<void> {
    if (queueIds.length === 0) return;
    await client.query(
        `UPDATE public.content_digest_queue
         SET sent_at = now()
         WHERE id = ANY($1::uuid[])`,
        [queueIds],
    );
}

async function sendDigestEmail({
    resendClient,
    recipient,
    email,
    unsubscribeUrl,
    paceProviderSend,
    rateLimitRetryDelayMs,
    logger,
}: {
    resendClient: typeof defaultResend;
    recipient: DigestRecipient;
    email: WeeklyDigestEmail;
    unsubscribeUrl: string;
    paceProviderSend: () => Promise<void>;
    rateLimitRetryDelayMs: number;
    logger: Logger;
}): Promise<string> {
    for (let attempt = 0; attempt <= MAX_DIGEST_RATE_LIMIT_RETRIES; attempt += 1) {
        await paceProviderSend();
        const { data, error } = await resendClient.emails.send({
            from: EMAIL_FROM,
            to: recipient.email,
            subject: email.subject,
            html: email.html,
            text: email.text,
            headers: {
                "List-Unsubscribe": `<${unsubscribeUrl}>`,
                "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
            },
        });

        if (!error) return stringValue((data as { id?: unknown } | null)?.id);

        const message = error.message ?? String(error);
        if (!isRateLimitError(message) || attempt === MAX_DIGEST_RATE_LIMIT_RETRIES) {
            throw new Error(message);
        }

        logger.warn(`[weekly-digest] rate limited for ${recipient.email}; retrying in ${rateLimitRetryDelayMs}ms`);
        if (rateLimitRetryDelayMs > 0) await sleep(rateLimitRetryDelayMs);
    }

    throw new Error("Unable to send digest email");
}

function isRateLimitError(message: string): boolean {
    return /rate limit|too many requests/i.test(message);
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function finishRun(
    client: PoolClient,
    runId: string,
    status: string,
    sentCount: number,
    failedCount: number,
    error: string | null,
): Promise<void> {
    await client.query(
        `UPDATE public.email_digest_runs
         SET status = $2,
             finished_at = now(),
             sent_count = $3,
             failed_count = $4,
             error = $5
         WHERE id = $1`,
        [runId, status, sentCount, failedCount, error],
    );
}

function errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
}
