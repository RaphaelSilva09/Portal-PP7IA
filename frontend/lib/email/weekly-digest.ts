import type { PoolClient } from "pg";

import { pool as defaultPool } from "../db";
import { EMAIL_FROM, assertEmailConfigured, resend as defaultResend } from "./resend";

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

const TABLE_CONFIG: Record<string, { label: string; viewType: string; fallbackPath: string; accentLight: string; accentDark: string }> = {
    newsletters: { label: "Newsletter", viewType: "newsletter", fallbackPath: "/explorar?b=newsletter", accentLight: "#3b82f6", accentDark: "#60a5fa" },
    mini_livros: { label: "Mini-livros", viewType: "mini-livro", fallbackPath: "/explorar?b=livro", accentLight: "#f59e0b", accentDark: "#fbbf24" },
    biblioteca: { label: "Biblioteca", viewType: "biblioteca", fallbackPath: "/explorar?b=biblioteca", accentLight: "#14b8a6", accentDark: "#2dd4bf" },
    especial_semana: { label: "Especial da Semana", viewType: "especial-semana", fallbackPath: "/explorar?b=reportagem", accentLight: "#f97316", accentDark: "#fb923c" },
    estudar: { label: "Estudar", viewType: "estudar", fallbackPath: "/explorar?b=estudar", accentLight: "#6366f1", accentDark: "#818cf8" },
    radar_oportunidades: { label: "Radar de Oportunidades", viewType: "radar_oportunidades", fallbackPath: "/explorar?b=radar", accentLight: "#06b6d4", accentDark: "#22d3ee" },
    ebooks: { label: "E-books", viewType: "ebook", fallbackPath: "/mini-livros", accentLight: "#ec4899", accentDark: "#f472b6" },
};
const SUPPORTED_TABLE_NAMES = Object.keys(TABLE_CONFIG);

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
}: {
    items: DigestItem[];
    siteUrl?: string;
}): WeeklyDigestEmail {
    const grouped = groupByTable(items);
    const usedTableNames = Array.from(grouped.keys());
    const sectionDarkRules = usedTableNames
        .map((tableName) => {
            const accentDark = TABLE_CONFIG[tableName]?.accentDark ?? "#60a5fa";
            return `.eb-sec-${tableName}{color:${accentDark} !important}.eb-dot-${tableName}{background-color:${accentDark} !important}`;
        })
        .join("");

    const sectionsHtml = Array.from(grouped.entries())
        .map(([tableName, groupItems]) => {
            const config = TABLE_CONFIG[tableName];
            const label = config?.label ?? tableName;
            const accentLight = config?.accentLight ?? "#3b82f6";
            const rows = groupItems
                .map((item) => {
                    const meta = item.readTime ? `${item.readTime} min de leitura` : "Novo conteúdo";
                    const title = escapeHtml(item.title);
                    const href = item.href ?? absoluteUrl("/", siteUrl);
                    return `
                      <tr>
                        <td class="eb-row" style="padding:16px 0;border-bottom:1px solid rgba(99,132,181,0.2);">
                          <a href="${escapeAttribute(href)}" class="eb-title" style="color:#162338;text-decoration:none;font-size:16px;font-weight:600;font-family:'Inter',-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">${title}</a>
                          <div class="eb-muted" style="color:#56657b;font-size:13px;margin-top:4px;font-family:'Inter',-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">${escapeHtml(meta)}</div>
                        </td>
                      </tr>`;
                })
                .join("");

            return `
              <tr>
                <td style="padding-top:28px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" style="padding-bottom:10px;">
                    <tr>
                      <td class="eb-dot-${tableName}" style="width:8px;height:8px;border-radius:9999px;background-color:${accentLight};font-size:0;line-height:0;">&nbsp;</td>
                      <td style="width:8px;"></td>
                      <td class="eb-sec-${tableName}" style="color:${accentLight};font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;font-family:'Inter',-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">${escapeHtml(label)}</td>
                    </tr>
                  </table>
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
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
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>PP7+IAS: novidades da semana</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif&family=Inter:wght@400;500;600;700&display=swap');
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    @media (prefers-color-scheme: dark) {
      .eb-body { background-color: #111111 !important; }
      .eb-card { background-color: #1a1a1a !important; border-color: rgba(255,255,255,0.1) !important; }
      .eb-title { color: #dadada !important; }
      .eb-text { color: #acacac !important; }
      .eb-muted { color: #acacac !important; }
      .eb-row { border-color: rgba(255,255,255,0.08) !important; }
      .eb-link { color: #3b9eff !important; }
      .eb-plus { color: #3b9eff !important; }
      .eb-bar-ias { background-color: #3b9eff !important; }
      ${sectionDarkRules}
    }
  </style>
</head>
<body class="eb-body" style="margin:0;padding:0;background-color:#eef4ff;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="eb-body" style="background-color:#eef4ff;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" class="eb-card" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid rgba(99,132,181,0.2);border-radius:20px;padding:36px 32px;">

          <tr>
            <td style="padding-bottom:26px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="eb-title" style="color:#162338;font-family:'Instrument Serif',Georgia,'Times New Roman',serif;font-size:28px;font-weight:600;letter-spacing:-0.02em;">PP7</td>
                  <td class="eb-plus" style="color:#1d4ed8;font-family:'Inter',sans-serif;font-size:22px;font-weight:700;padding:0 4px;">+</td>
                  <td class="eb-title" style="color:#162338;font-family:'Instrument Serif',Georgia,'Times New Roman',serif;font-size:28px;font-weight:600;letter-spacing:0.04em;">IAS</td>
                </tr>
                <tr>
                  <td style="height:3px;background-color:#d97706;border-radius:9999px;line-height:3px;font-size:0;">&nbsp;</td>
                  <td></td>
                  <td class="eb-bar-ias" style="height:3px;background-color:#1d4ed8;border-radius:9999px;line-height:3px;font-size:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="eb-title" style="color:#162338;font-size:24px;font-weight:700;font-family:'Inter',sans-serif;padding-bottom:8px;">Novidades da semana</td>
          </tr>
          <tr>
            <td class="eb-text" style="color:#334155;font-size:15px;line-height:1.6;font-family:'Inter',sans-serif;">
              Uma curadoria direta do Portal PP7+IAS para você acompanhar o que entrou de novo.
            </td>
          </tr>

          ${sectionsHtml}

          <tr>
            <td style="padding-top:32px;">
              <div class="eb-row" style="height:1px;background-color:rgba(99,132,181,0.2);margin:0 0 20px;font-size:0;line-height:0;">&nbsp;</div>
            </td>
          </tr>
          <tr>
            <td class="eb-muted" style="color:#56657b;font-size:12px;line-height:1.6;font-family:'Inter',sans-serif;">
              Você recebeu este email porque optou por receber atualizações do Portal PP7+IAS.
              Para alterar suas preferências, acesse
              <a href="${escapeAttribute(absoluteUrl("/user", siteUrl))}" class="eb-link" style="color:#1d4ed8;text-decoration:none;font-weight:600;">seu perfil</a>.
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
        const email = buildWeeklyDigestEmail({ items, siteUrl });

        for (const recipient of pendingRecipients) {
            try {
                const providerMessageId = await sendDigestEmail({
                    resendClient,
                    recipient,
                    email,
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

async function loadDeliveryTotals(client: PoolClient, runId: string): Promise<{ sentCount: number; failedCount: number }> {
    const { rows } = await client.query<{ sent_count: string; failed_count: string }>(
        `SELECT
           COUNT(*) FILTER (WHERE status = 'sent')::text AS sent_count,
           COUNT(*) FILTER (WHERE status = 'failed')::text AS failed_count
         FROM public.email_digest_deliveries
         WHERE run_id = $1`,
        [runId],
    );
    return {
        sentCount: Number(rows[0]?.sent_count ?? 0),
        failedCount: Number(rows[0]?.failed_count ?? 0),
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
    paceProviderSend,
    rateLimitRetryDelayMs,
    logger,
}: {
    resendClient: typeof defaultResend;
    recipient: DigestRecipient;
    email: WeeklyDigestEmail;
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
