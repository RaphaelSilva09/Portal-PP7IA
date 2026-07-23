/**
 * Builder do e-mail semanal de quarta (PDF 3.5.1).
 *
 * Consolida o que subiu no portal nos últimos 7 dias, agrupado por seção.
 * Função pura — sem I/O — para ser testável isoladamente.
 */

export interface DigestItem {
    section: string;
    title: string;
    url: string | null;
    createdAt: Date;
}

export interface WeeklyDigest {
    subject: string;
    html: string;
    itemCount: number;
}

const SECTION_ORDER = [
    "Newsletter",
    "Inteligência Artificial",
    "Editoriais e Artigos",
    "Enquanto é Tempo",
    "Biblioteca",
    "Estudar",
];

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

export function filterLastDays(items: DigestItem[], now: Date, days = 7): DigestItem[] {
    const cutoff = now.getTime() - days * 24 * 60 * 60 * 1000;
    return items.filter(item => {
        const time = item.createdAt?.getTime?.();
        return typeof time === "number" && !isNaN(time) && time >= cutoff && time <= now.getTime();
    });
}

export function buildWeeklyDigest(items: DigestItem[], now: Date, baseUrl: string): WeeklyDigest | null {
    const recent = filterLastDays(items, now);
    if (recent.length === 0) return null;

    const bySection = new Map<string, DigestItem[]>();
    for (const item of recent) {
        const list = bySection.get(item.section) ?? [];
        list.push(item);
        bySection.set(item.section, list);
    }

    const orderedSections = [
        ...SECTION_ORDER.filter(section => bySection.has(section)),
        ...[...bySection.keys()].filter(section => !SECTION_ORDER.includes(section)),
    ];

    const dateLabel = now.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

    const sectionsHtml = orderedSections
        .map(section => {
            const rows = (bySection.get(section) ?? [])
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                .map(item => {
                    const title = escapeHtml(item.title);
                    const link = item.url
                        ? `<a href="${escapeHtml(new URL(item.url, baseUrl).href)}" style="color:#1d4ed8;text-decoration:none;">${title}</a>`
                        : title;
                    const date = item.createdAt.toLocaleDateString("pt-BR");
                    return `<li style="margin:0 0 8px;">${link} <span style="color:#64748b;font-size:12px;">· ${date}</span></li>`;
                })
                .join("\n");

            return `<h2 style="font-size:15px;margin:24px 0 8px;color:#162338;">${escapeHtml(section)}</h2>\n<ul style="margin:0;padding-left:18px;">${rows}</ul>`;
        })
        .join("\n");

    const html = `<!doctype html>
<html lang="pt-BR">
<body style="margin:0;padding:24px;background:#eef4ff;font-family:Arial,Helvetica,sans-serif;color:#162338;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;padding:32px;">
    <p style="margin:0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#64748b;">PP7+IAS · Resumo semanal</p>
    <h1 style="margin:8px 0 4px;font-size:22px;">O que subiu no portal esta semana</h1>
    <p style="margin:0 0 8px;font-size:13px;color:#64748b;">${recent.length} publicaç${recent.length === 1 ? "ão" : "ões"} nos últimos 7 dias · ${dateLabel}</p>
    ${sectionsHtml}
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0 16px;" />
    <p style="margin:0;font-size:12px;color:#64748b;">Você recebe este aviso porque faz parte da equipe do Portal PP7+IAS. Conteúdo completo em <a href="${escapeHtml(baseUrl)}" style="color:#1d4ed8;">${escapeHtml(baseUrl)}</a>.</p>
  </div>
</body>
</html>`;

    return {
        subject: `PP7+IAS · ${recent.length} novidade${recent.length === 1 ? "" : "s"} da semana (${dateLabel})`,
        html,
        itemCount: recent.length,
    };
}
