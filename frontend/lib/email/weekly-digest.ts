import type { PoolClient } from "pg";

import { pool as defaultPool } from "../db";
import { EMAIL_FROM, resend as defaultResend } from "./resend";

const DEFAULT_SITE_URL = "https://pp7ias-portal.com.br";
const DIGEST_TIME_ZONE = "America/Sao_Paulo";
const DIGEST_HOUR = 10;
const DIGEST_MINUTE = 0;
const DIGEST_CRON_UTC = "0 13 * * 3";

const TABLE_CONFIG: Record<string, { label: string; viewType: string; fallbackPath: string }> = {
    newsletters: { label: "Newsletter", viewType: "newsletter", fallbackPath: "/explorar?b=newsletter" },
    mini_livros: { label: "Mini-livros", viewType: "mini-livro", fallbackPath: "/explorar?b=livro" },
    biblioteca: { label: "Biblioteca", viewType: "biblioteca", fallbackPath: "/explorar?b=biblioteca" },
    especial_semana: { label: "Especial da Semana", viewType: "especial-semana", fallbackPath: "/explorar?b=reportagem" },
    estudar: { label: "Estudar", viewType: "estudar", fallbackPath: "/explorar?b=estudar" },
    radar_oportunidades: { label: "Radar de Oportunidades", viewType: "radar_oportunidades", fallbackPath: "/explorar?b=radar" },
    ebooks: { label: "E-books", viewType: "ebook", fallbackPath: "/mini-livros" },
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
}: {
    items: DigestItem[];
    siteUrl?: string;
}): WeeklyDigestEmail {
    const grouped = groupByTable(items);
    const sectionsHtml = Array.from(grouped.entries())
        .map(([tableName, groupItems]) => {
            const label = TABLE_CONFIG[tableName]?.label ?? tableName;
            const rows = groupItems
                .map((item) => {
                    const meta = item.readTime ? `${item.readTime} min de leitura` : "Novo conteúdo";
                    const title = escapeHtml(item.title);
                    const href = item.href ?? absoluteUrl("/", siteUrl);
                    return `
                      <tr>
                        <td style="padding:14px 0;border-bottom:1px solid #2a2a2a;">
                          <a href="${escapeAttribute(href)}" style="color:#ffffff;text-decoration:none;font-size:17px;font-weight:bold;">${title}</a>
                          <div style="color:#9ca3af;font-size:13px;margin-top:4px;">${escapeHtml(meta)}</div>
                        </td>
                      </tr>`;
                })
                .join("");

            return `
              <tr>
                <td style="padding-top:24px;">
                  <div style="color:#3b9eff;font-size:12px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;">${escapeHtml(label)}</div>
                  <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
                </td>
              </tr>`;
        })
        .join("");

    const textLines = items.map((item) => {
        const suffix = item.href ? ` - ${item.href}` : "";
        return `- ${item.title}${suffix}`;
    });

    return {
        subject: "PP7+IAS: novidades da semana",
        html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>PP7+IAS: novidades da semana</title>
</head>
<body style="margin:0;padding:0;background-color:#111111;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#111111;padding:24px 0;">
    <tr>
      <td align="center">
        <table width="640" cellpadding="0" cellspacing="0" style="background-color:#1a1a1a;border-radius:10px;padding:28px;">
          <tr>
            <td style="color:#ffffff;font-size:24px;font-weight:bold;">Novidades da semana</td>
          </tr>
          <tr>
            <td style="color:#dadada;font-size:16px;line-height:1.6;padding-top:12px;">
              Uma curadoria direta do Portal PP7+IAS para você acompanhar o que entrou de novo.
            </td>
          </tr>
          ${sectionsHtml}
          <tr>
            <td style="padding-top:30px;color:#9ca3af;font-size:13px;line-height:1.6;">
              Você recebeu este email porque optou por receber atualizações do Portal PP7+IAS.
              Para alterar suas preferências, acesse
              <a href="${escapeAttribute(absoluteUrl("/user", siteUrl))}" style="color:#3b9eff;">seu perfil</a>.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
        text: [
            "PP7+IAS: novidades da semana",
            "",
            "Uma curadoria direta do Portal PP7+IAS para você acompanhar o que entrou de novo.",
            "",
            ...textLines,
            "",
            `Preferências: ${absoluteUrl("/user", siteUrl)}`,
        ].join("\n"),
    };
}

export async function sendWeeklyDigest(options: WeeklyDigestOptions = {}): Promise<WeeklyDigestResult> {
    const now = options.now ?? new Date();
    const siteUrl = resolveSiteUrl(options.siteUrl);
    const logger = options.logger ?? console;
    const dbPool = options.pool ?? defaultPool;
    const resendClient = options.resendClient ?? defaultResend;
    const digestKey = getDigestKey(now);

    if (!shouldRunWeeklyDigest(now, { force: options.force })) {
        logger.log(`[weekly-digest] skipped: ${digestKey} is not Wednesday in ${DIGEST_TIME_ZONE}`);
        return { status: "skipped", digestKey, contentCount: 0, recipientCount: 0, sentCount: 0, failedCount: 0 };
    }

    const client = await dbPool.connect();
    try {
        if (options.dryRun) {
            const rows = await loadPendingDigestRows(client);
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

        const runId = await createOrResumeRun(client, digestKey, now);
        if (!runId) {
            logger.log(`[weekly-digest] skipped: ${digestKey} already completed`);
            return { status: "skipped", digestKey, contentCount: 0, recipientCount: 0, sentCount: 0, failedCount: 0 };
        }

        const rows = await loadPendingDigestRows(client);
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
        const email = buildWeeklyDigestEmail({ items, siteUrl });

        let sentCount = 0;
        let failedCount = 0;

        for (const recipient of pendingRecipients) {
            try {
                const { data, error } = await resendClient.emails.send({
                    from: EMAIL_FROM,
                    to: recipient.email,
                    subject: email.subject,
                    html: email.html,
                    text: email.text,
                });
                if (error) throw new Error(error.message ?? String(error));
                await markDeliverySent(client, runId, recipient.id, stringValue((data as { id?: unknown } | null)?.id));
                sentCount += 1;
            } catch (error) {
                failedCount += 1;
                await markDeliveryFailed(client, runId, recipient.id, errorMessage(error));
                logger.error(`[weekly-digest] failed for ${recipient.email}: ${errorMessage(error)}`);
            }
        }

        if (failedCount === 0) {
            await markQueueSent(client, items.map((item) => item.queueId));
        }

        const status = failedCount === 0 ? "completed" : "partial";
        await finishRun(client, runId, status, sentCount, failedCount, failedCount ? "Some recipients failed" : null);

        return { status, digestKey, contentCount: items.length, recipientCount: recipients.length, sentCount, failedCount };
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
    const existing = await client.query<{ id: string; status: string; started_at: Date }>(
        `SELECT id, status, started_at FROM public.email_digest_runs WHERE digest_key = $1`,
        [digestKey],
    );
    const row = existing.rows[0];
    if (row?.status === "completed") return null;
    if (row) {
        await client.query(
            `UPDATE public.email_digest_runs
             SET status = 'running', started_at = $2, error = NULL
             WHERE id = $1`,
            [row.id, now],
        );
        return row.id;
    }

    const inserted = await client.query<{ id: string }>(
        `INSERT INTO public.email_digest_runs (digest_key, status, started_at)
         VALUES ($1, 'running', $2)
         RETURNING id`,
        [digestKey, now],
    );
    return inserted.rows[0].id;
}

async function loadPendingDigestRows(client: PoolClient): Promise<DigestQueueRow[]> {
    const { rows } = await client.query<DigestQueueRow>(
        `SELECT id::text, table_name, record_id, record_data, created_at
         FROM public.content_digest_queue
         WHERE sent_at IS NULL
         ORDER BY created_at ASC
         LIMIT 20`,
    );
    return rows.filter((row) => Boolean(TABLE_CONFIG[row.table_name]));
}

async function loadRecipients(client: PoolClient): Promise<DigestRecipient[]> {
    const { rows } = await client.query<DigestRecipient>(
        `SELECT id::text, email, nome
         FROM "user"
         WHERE COALESCE(accept_email_updates, false) = true
           AND "emailVerified" = true
         ORDER BY "createdAt" ASC`,
    );
    return rows;
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
    for (const recipient of recipients) {
        await client.query(
            `INSERT INTO public.email_digest_deliveries (run_id, user_id, email, status)
             VALUES ($1, $2, $3, 'pending')
             ON CONFLICT (run_id, user_id) DO NOTHING`,
            [runId, recipient.id, recipient.email],
        );
    }
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

async function markQueueSent(client: PoolClient, queueIds: string[]): Promise<void> {
    if (queueIds.length === 0) return;
    await client.query(
        `UPDATE public.content_digest_queue
         SET sent_at = now()
         WHERE id = ANY($1::uuid[])`,
        [queueIds],
    );
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
