import ChatBubble from "@/components/chat/ChatBubble";
import Navbar from "@/components/Header";
import HeroAnimatedWord from "@/components/home/HeroAnimatedWord";
import HeroStats from "@/components/home/HeroStats";
import HomeEditorialSection from "@/components/home/HomeEditorialSection";
import NewsletterForm from "@/components/home/NewsletterForm";
import HomeRecomendacoesPaulo from "@/components/HomeRecomendacoesPaulo";
import DIContainer from "@/infrastructure/di/container";
import { DEFAULT_HOMEPAGE_CONFIG } from "@/domain/entities/HomepageConfig";
import type { SectionConfig } from "@/domain/entities/HomepageConfig";
import { parseManifestoQuote } from "@/lib/parseManifestoQuote";

async function getConfig(): Promise<SectionConfig[]> {
    try {
        const uc = DIContainer.getHomepageConfigUseCase();
        const config = await uc.execute();
        return [...config.sections].sort((a, b) => a.order - b.order);
    } catch {
        return [...DEFAULT_HOMEPAGE_CONFIG.sections].sort((a, b) => a.order - b.order);
    }
}

function t(section: SectionConfig, key: string, fallback: string): string {
    return section.texts[key] ?? fallback;
}

function HeroSection({ s }: { s: SectionConfig }) {
    return (
        <section className="relative overflow-hidden bg-background">
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div
                    className="absolute inset-0 transition-colors duration-700"
                    style={{
                        background:
                            "radial-gradient(60% 50% at 80% 0%, var(--block-newsletter-soft) 0%, transparent 60%), radial-gradient(50% 40% at 0% 100%, var(--primary-soft) 0%, transparent 60%)",
                    }}
                />
                <svg className="absolute inset-0 size-full opacity-[0.18]" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
                            <circle cx="1" cy="1" r="1" fill="currentColor" className="text-ink" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                </svg>
            </div>
            <div className="mx-auto max-w-7xl px-6 pb-24">
                <div className="relative mt-12">
                    <h1 className="font-serif text-[clamp(3.5rem,11vw,11rem)] leading-[0.95] tracking-[-0.025em] text-ink">
                        <span className="block">{t(s, "line1", "Menos ruído.")}</span>
                        <span className="block">
                            Mais{" "}
                            <HeroAnimatedWord />
                            .
                        </span>
                        <span className="block text-foreground/30">{t(s, "line3", "Sete blocos. Sete IAs.")}</span>
                    </h1>
                </div>
                <div className="mt-16 grid gap-12 md:grid-cols-2 md:items-center">
                    <div>
                        <p className="text-lg leading-relaxed text-muted-foreground">
                            {t(s, "description", "Curadoria editorial independente sobre ")}
                        </p>
                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            <a href="/explorar" className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-background transition-all hover:bg-primary">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-book-open size-4" aria-hidden="true">
                                    <path d="M12 7v14" /><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
                                </svg>
                                {t(s, "btn1", "Explorar os 7 blocos")}
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-up-right size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true">
                                    <path d="M7 7h10v10" /><path d="M7 17 17 7" />
                                </svg>
                            </a>
                            <a href="#newsletter" className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-foreground/40">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail size-4" aria-hidden="true">
                                    <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" /><rect x="2" y="4" width="20" height="16" rx="2" />
                                </svg>
                                {t(s, "btn2", "Receber a newsletter")}
                            </a>
                        </div>
                    </div>
                    <HeroStats />
                </div>
            </div>
        </section>
    );
}

const BLOCK_COLORS = [
    "var(--block-newsletter)",
    "var(--block-reportagem)",
    "var(--block-radar)",
    "var(--block-livro)",
    "var(--block-biblioteca)",
    "var(--block-estudar)",
    "var(--block-ensinar)",
];

function SetesCoresSection({ s }: { s: SectionConfig }) {
    const blocks = BLOCK_COLORS.map((color, i) => ({
        color,
        num: String(i + 1).padStart(2, "0"),
        href: t(s, `block${i + 1}_href`, ""),
        label: t(s, `block${i + 1}_label`, ""),
        desc: t(s, `block${i + 1}_desc`, ""),
        cadence: t(s, `block${i + 1}_cadence`, ""),
    }));

    return (
        <section className="relative overflow-hidden border-t border-border bg-ink py-24 text-background">
            <div
                className="pointer-events-none absolute inset-x-0 -bottom-10 select-none text-center font-serif italic leading-none tracking-tighter text-background/[0.04]"
                style={{ fontSize: "clamp(8rem, 24vw, 22rem)" }}
                aria-hidden="true"
            >
                clareza
            </div>
            <div className="relative mx-auto max-w-7xl px-6">
                <div className="grid items-center gap-12 lg:grid-cols-12">
                    <div className="lg:col-span-5">
                        <div className="text-[11px] uppercase tracking-[0.22em] text-background/50">{t(s, "label", "Sistema cromático")}</div>
                        <h2 className="mt-4 font-serif text-5xl leading-[1.02] tracking-tight md:text-6xl">
                            {t(s, "title", "Cada cor é um caminho.")}
                        </h2>
                        <p className="mt-6 max-w-md text-background/70">
                            {t(s, "description", "")}
                        </p>
                        <div className="mt-10 space-y-3">
                            <blockquote
                                className="relative rounded-2xl border-l-2 p-5 text-background/90"
                                style={{ borderColor: "var(--block-livro)", background: "color-mix(in oklab, var(--block-livro) 14%, transparent)" }}
                            >
                                <span className="absolute -left-[7px] top-5 size-3 rounded-full" style={{ backgroundColor: "var(--block-livro)" }} />
                                <p className="font-serif text-lg italic leading-snug">"{t(s, "quote", "Suceder é o teste final da liderança.")}"</p>
                                <footer className="mt-2 text-[10px] uppercase tracking-[0.22em] text-background/50">{t(s, "quoteAuthor", "ML-20 · Enquanto é Tempo")}</footer>
                            </blockquote>
                        </div>
                    </div>
                    <div className="lg:col-span-7">
                        <div className="space-y-2">
                            {blocks.map((b) => (
                                <a key={b.num} href={b.href} className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-background/10 bg-background/5 transition-colors hover:bg-background/[0.08]">
                                    <div className="relative h-20 w-28 shrink-0 overflow-hidden transition-all duration-500 group-hover:w-40" style={{ backgroundColor: b.color }}>
                                        <span className="absolute bottom-2 left-3 font-serif text-3xl text-background/80">{b.num}</span>
                                    </div>
                                    <div className="flex flex-1 items-center justify-between gap-4 pr-5">
                                        <div>
                                            <div className="font-serif text-2xl text-background">{b.label}</div>
                                            <div className="mt-0.5 text-xs text-background/50">{b.desc}</div>
                                        </div>
                                        <div className="hidden text-right md:block">
                                            <div className="text-[10px] uppercase tracking-[0.22em] text-background/40">cadência</div>
                                            <div className="font-mono text-xs text-background/70">{b.cadence}</div>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function EditorialSection({ s }: { s: SectionConfig }) {
    return (
        <HomeEditorialSection
            label={t(s, "label", "Editorial")}
            titleBefore={t(s, "title_before", "Por onde ")}
            titleEm={t(s, "title_em", "começar")}
            description={t(s, "description", "")}
        />
    );
}

function IAsSection({ s }: { s: SectionConfig }) {
    const ias = Array.from({ length: 7 }, (_, i) => ({
        n: String(i + 1).padStart(2, "0"),
        name: t(s, `ia${i + 1}_name`, ""),
        role: t(s, `ia${i + 1}_role`, ""),
    }));

    return (
        <section id="ias" className="border-t border-border bg-ink py-24 text-background">
            <div className="mx-auto max-w-7xl px-6">
                <div className="grid gap-12 lg:grid-cols-12">
                    <div className="lg:col-span-5">
                        <div className="text-[11px] uppercase tracking-[0.22em] text-background/50">{t(s, "label", "As 7 IAs parceiras")}</div>
                        <h2 className="mt-4 font-serif text-5xl leading-[1.05] tracking-tight md:text-6xl">
                            {t(s, "title_before", "A IA ")}
                            <em className="italic" style={{ color: "var(--block-newsletter)" }}>
                                {t(s, "title_em", "amplifica")}
                            </em>
                            .<br />{t(s, "title_line2", "O julgamento é humano.")}
                        </h2>
                        <p className="mt-6 max-w-md text-background/70">{t(s, "description", "")}</p>
                    </div>
                    <div className="lg:col-span-7">
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                            {ias.map((ia) => (
                                <div key={ia.n} className="group relative flex aspect-square flex-col justify-between overflow-hidden rounded-2xl border border-background/10 bg-background/[0.04] p-4 transition-all hover:-translate-y-1 hover:border-background/30 hover:bg-background/[0.09]">
                                    <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-60" style={{ backgroundColor: "var(--block-newsletter)" }} />
                                    <div className="flex items-start justify-between">
                                        <div className="text-[10px] uppercase tracking-[0.22em] text-background/40">IA · {ia.n}</div>
                                        <span className="size-1.5 rounded-full bg-background/30 transition-colors group-hover:bg-[var(--block-newsletter)]" />
                                    </div>
                                    <div>
                                        <div className="font-serif text-3xl leading-none">{ia.name}</div>
                                        <div className="mt-2 text-[11px] text-background/60">{ia.role}</div>
                                    </div>
                                </div>
                            ))}
                            <div className="relative flex aspect-square flex-col justify-between overflow-hidden rounded-2xl p-4 text-ink" style={{ backgroundColor: "var(--block-newsletter)" }}>
                                <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ background: "radial-gradient(120% 80% at 100% 0%, white, transparent 60%)" }} />
                                <div className="relative text-[10px] uppercase tracking-[0.22em] opacity-70">Curadoria</div>
                                <div className="relative">
                                    <div className="font-serif text-3xl leading-none">+ Humano</div>
                                    <div className="mt-2 text-[11px] opacity-70">Decisão final, sempre</div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            <a href="/view/biblioteca/009" className="group inline-flex items-center gap-2 rounded-full bg-background px-5 py-3 text-sm font-medium text-ink transition-transform hover:-translate-y-0.5">
                                Conhecer mais
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-up-right size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true">
                                    <path d="M7 7h10v10" /><path d="M7 17 17 7" />
                                </svg>
                            </a>
                            <span className="text-xs text-background/50">Como cada IA entra no fluxo editorial</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function ManifestoSection({ s }: { s: SectionConfig }) {
    const segments = parseManifestoQuote(
        t(s, "quote", '"Liderar é servir. Formar pessoas. Deixar legado."'),
    );
    return (
        <section id="manifesto" className="border-t border-border bg-background py-32">
            <div className="mx-auto max-w-4xl px-6 text-center">
                <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">{t(s, "label", "Manifesto")}</div>
                <p className="mt-8 font-serif text-4xl leading-tight tracking-tight text-ink md:text-6xl">
                    {segments.map((seg, i) => {
                        if (seg.type === "linebreak") return <br key={i} />;
                        if (seg.type === "highlight")
                            return (
                                <span key={i} style={{ color: "var(--block-livro)" }}>
                                    {seg.text}
                                </span>
                            );
                        return <span key={i}>{seg.text}</span>;
                    })}
                </p>
                <div className="mt-10 inline-flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="h-px w-10 bg-border" />
                    {t(s, "author", "Paulo Pacheco · Editor")}
                    <span className="h-px w-10 bg-border" />
                </div>
            </div>
        </section>
    );
}

function NewsletterSection({ s }: { s: SectionConfig }) {
    return (
        <section id="newsletter" className="border-t border-border bg-ink py-24 text-background">
            <div className="mx-auto max-w-5xl px-6">
                <div className="grid gap-10 md:grid-cols-2 md:items-end">
                    <div>
                        <div className="text-[11px] uppercase tracking-[0.22em] text-background/50">{t(s, "label", "Newsletter PP7+IAS")}</div>
                        <h2 className="mt-4 font-serif text-5xl leading-[1.05] tracking-tight md:text-6xl">
                            {t(s, "title_before", "Toda ")}
                            <em className="italic" style={{ color: "var(--block-newsletter)" }}>
                                {t(s, "title_em", "quarta")}
                            </em>
                            .<br />{t(s, "title_line2", "Direto no inbox.")}
                        </h2>
                        <p className="mt-6 max-w-md text-background/70">{t(s, "description", "")}</p>
                    </div>
                    <NewsletterForm />
                </div>
            </div>
        </section>
    );
}

function renderSection(s: SectionConfig) {
    if (!s.visible) return null;
    switch (s.id) {
        case "hero":        return <HeroSection key={s.id} s={s} />;
        case "sete-cores":  return <SetesCoresSection key={s.id} s={s} />;
        case "editorial":   return <EditorialSection key={s.id} s={s} />;
        case "ias":         return <IAsSection key={s.id} s={s} />;
        case "manifesto":   return <ManifestoSection key={s.id} s={s} />;
        case "newsletter":  return <NewsletterSection key={s.id} s={s} />;
        default:            return null;
    }
}

export default async function Home() {
    const sections = await getConfig();

    return (
        <main className="min-h-screen bg-background text-foreground">
            <Navbar />

            {sections.map(renderSection)}

            <HomeRecomendacoesPaulo />

            <footer className="border-t border-border bg-background py-16">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="grid gap-12 md:grid-cols-12">
                        <div className="md:col-span-5">
                            <div className="flex items-center gap-3">
                                <div className="flex size-10 items-center justify-center rounded-xl bg-ink text-background font-serif text-xl">7</div>
                                <div className="leading-tight">
                                    <div className="text-base font-semibold tracking-tight text-ink">PP7<span className="text-primary">+</span>IAS</div>
                                    <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Portal Editorial · desde 2022</div>
                                </div>
                            </div>
                            <p className="mt-6 max-w-sm text-sm text-muted-foreground">Curadoria editorial independente. Liderança, gestão de pessoas e inteligência artificial — para quem decide.</p>
                        </div>
                        <div className="md:col-span-4">
                            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Os 7 blocos</div>
                            <ul className="mt-4 grid grid-cols-2 gap-2 text-sm">
                                {[
                                    { href: "/newsletter", color: "var(--block-newsletter)", label: "Newsletter" },
                                    { href: "/especial-semana", color: "var(--block-reportagem)", label: "Reportagem da Semana" },
                                    { href: "/radar-oportunidades", color: "var(--block-radar)", label: "Radar" },
                                    { href: "/mini-livros", color: "var(--block-livro)", label: "Enquanto é Tempo" },
                                    { href: "/biblioteca", color: "var(--block-biblioteca)", label: "Biblioteca" },
                                    { href: "/estudar", color: "var(--block-estudar)", label: "Estudar" },
                                    { href: "#newsletter", color: "var(--block-ensinar)", label: "Ensinar" },
                                ].map((b) => (
                                    <li key={b.label}>
                                        <a href={b.href} className="group inline-flex items-center gap-2 text-foreground/80 transition-colors hover:text-foreground">
                                            <span className="size-2 rounded-full" style={{ backgroundColor: b.color }} />
                                            {b.label}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="md:col-span-3">
                            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Portal</div>
                            <ul className="mt-4 space-y-2 text-sm text-foreground/80">
                                <li><a href="/user" className="hover:text-foreground">Entrar</a></li>
                                <li><a href="/user" className="hover:text-foreground">Cadastrar</a></li>
                                <li><a href="/quem-somos" className="hover:text-foreground">Indicar</a></li>
                                <li><a href="#manifesto" className="hover:text-foreground">Manifesto</a></li>
                                <li><a href="/quem-somos" className="hover:text-foreground">Contato</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row md:items-center">
                        <div>© 2026 PP7+IAS. Todos os direitos reservados.</div>
                        <div className="font-serif italic">menos ruído, mais clareza.</div>
                    </div>
                </div>
            </footer>

            {process.env.NEXT_PUBLIC_CHAT_ENABLED !== "false" && <ChatBubble />}
        </main>
    );
}
