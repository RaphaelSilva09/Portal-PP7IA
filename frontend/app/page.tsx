import ChatBubbleLazy from "@/components/chat/ChatBubbleLazy";
import Navbar from "@/components/Header";
import capaLivro from "@/assets/capa-livro.jpeg";
import Image from "next/image";
import ContinueReadingLink from "@/components/home/ContinueReadingLink";
import HeroAnimatedWord from "@/components/home/HeroAnimatedWord";
import HomeCarousel from "@/components/home/HomeCarousel";
import type { HomeCarouselSlide } from "@/components/home/HomeCarousel";
import HomeEditorialSection from "@/components/home/HomeEditorialSection";
import HomeFaqSection from "@/components/home/HomeFaqSection";
import HomeTrilhasSection from "@/components/home/HomeTrilhasSection";
import NewsletterForm from "@/components/home/NewsletterForm";
import HomeRecomendacoesPaulo from "@/components/HomeRecomendacoesPaulo";
import DIContainer from "@/infrastructure/di/container";
import { DEFAULT_HOMEPAGE_CONFIG } from "@/domain/entities/HomepageConfig";
import type { SectionConfig } from "@/domain/entities/HomepageConfig";
import type { Book } from "@/domain/entities/Book";
import type { Newsletter } from "@/domain/entities/Newsletter";
import { DEFAULT_SITE_BG } from "@/domain/entities/SiteBg";
import { parseManifestoQuote } from "@/lib/parseManifestoQuote";
import Link from "next/link";

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

function HeroSection({ s, book, totalChapters, bookChaptersTotal }: {
    s: SectionConfig;
    book: Book | null;
    totalChapters: number;
    bookChaptersTotal: number;
}) {
    return (
        <section className="border-b border-border bg-background">
            <div className="mx-auto max-w-7xl px-6 py-14 lg:py-20">
                <div className="grid gap-10 lg:grid-cols-[1fr_420px] lg:gap-14 xl:grid-cols-[1fr_460px]">

                    {/* ── Left column ── */}
                    <div className="flex flex-col lg:justify-center">

                        {/* Eyebrow */}
                        <div className="flex items-center gap-3">
                            <span className="h-[2px] w-6 bg-border border-black opacity-100" />
                            <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                                {t(s, "eyebrow1", "Livro")}
                                <span className="mx-2 opacity-40">·</span>
                                {t(s, "eyebrow2", "IAs")}
                                <span className="mx-2 opacity-40">·</span>
                                {t(s, "eyebrow2", "Liderança")}
                            </span>
                            <div className="hidden flex-1 lg:flex">
                                <div className="h-px flex-1 bg-border" />
                            </div>
                        </div>

                        {/* Heading */}
                        <h1
                            className="mt-8 leading-[0.95] tracking-[-0.025em] text-ink text-[clamp(3.2rem,6.5vw,5.8rem)]"
                            style={{ fontFamily: '"Instrument Serif", serif' }}
                        >
                            <span className="block text-[3.2rem] sm:text-[4.5rem] lg:text-[7.5rem]">{t(s, "line1", "Menos ruído.")}</span>
                            <span className="block text-[3.2rem] sm:text-[4.5rem] lg:text-[7.5rem]">
                                Mais{" "}
                                <HeroAnimatedWord />
                                .
                            </span>
                            <span className="block text-foreground/70 text-[2.4rem] sm:text-[3rem] lg:text-[5rem] mt-3">{t(s, "line3", "Leia Enquanto é Tempo.")}</span>
                        </h1>

                        {/* Description */}
                        <p className="mt-7 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
                            {t(s, "description", "Um livro sobre liderança, escrito devagar e publicado capítulo a capítulo. Em paralelo, uma curadoria semanal sobre inteligência artificial — sem ruído.")}
                        </p>

                        {/* CTAs */}
                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            <a href="/explorar" className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-medium text-background transition-colors hover:bg-primary">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden="true">
                                    <path d="M12 7v14" /><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
                                </svg>
                                {t(s, "btn1", "Índice do conteúdo publicado")}
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true">
                                    <path d="M7 7h10v10" /><path d="M7 17 17 7" />
                                </svg>
                            </a>
                            <a href="#newsletter" className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-3 text-sm font-medium text-foreground transition-colors hover:border-foreground/40">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden="true">
                                    <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" /><rect x="2" y="4" width="20" height="16" rx="2" />
                                </svg>
                                {t(s, "btn2", "Assinar o portal")}
                            </a>
                        </div>
                    </div>

                    {/* ── Right column: cards ── */}
                    <div className="flex flex-col gap-5">

                        {/* Book card */}
                        <a
                            href="/mini-livros"
                            className="group relative flex min-h-[180px] gap-5 overflow-hidden rounded-2xl p-5 transition-opacity hover:opacity-90 lg:min-h-[220px]"
                            style={{ background: "var(--hero-book-card-bg)" }}
                        >
                            <svg className="pointer-events-none absolute inset-0 h-full w-full select-none" viewBox="0 0 460 220" preserveAspectRatio="xMidYMid slice" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="450" cy="230" r="195" fill="none" stroke="white" strokeWidth="1" opacity="0.13" />
                                <circle cx="38" cy="28" r="52" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="4 3" opacity="0.10" />
                                <line x1="0" y1="55" x2="460" y2="175" stroke="white" strokeWidth="0.5" opacity="0.08" />
                                <line x1="376" y1="38" x2="392" y2="38" stroke="white" strokeWidth="1" opacity="0.16" />
                                <line x1="384" y1="30" x2="384" y2="46" stroke="white" strokeWidth="1" opacity="0.16" />
                            </svg>
                            <Image
                                src={capaLivro}
                                alt={book?.title ?? "Enquanto é Tempo"}
                                width={120}
                                height={180}
                                sizes="120px"
                                loading="eager"
                                className="w-[100px] shrink-0 self-stretch rounded-lg object-cover shadow-xl lg:w-[120px]"
                            />
                            <div className="flex flex-1 flex-col justify-between py-1">
                                <div className="flex flex-col">
                                    <p className="text-xs font-medium uppercase tracking-[0.2em]"
                                        style={{ color: "var(--hero-book-card-label)" }}>
                                        {t(s, "bookCard_label", "O Livro")} · {book?.badgeText ?? "Novo Capítulo"}
                                    </p>
                                    <p className="font-serif italic text-xl leading-snug lg:text-4xl mt-3"
                                        style={{ color: "var(--hero-book-card-title)" }}>
                                        {book?.title ?? "Enquanto é Tempo"}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between">
                                    {totalChapters > 0 && (
                                        <span className="text-sm italic" style={{ color: "var(--hero-book-card-label)" }}>
                                            {totalChapters} de {bookChaptersTotal} cap.
                                        </span>
                                    )}
                                    <span className="ml-auto text-sm font-medium transition-opacity group-hover:opacity-80"
                                        style={{ color: "var(--hero-book-card-cta)" }}>
                                        {t(s, "bookCard_cta", "Ler →")}
                                    </span>
                                </div>
                            </div>
                        </a>

                        <ContinueReadingLink />

                        {/* Newsletter card */}
                        <a
                            href="/explorar?b=newsletter"
                            className="group relative flex min-h-[180px] overflow-hidden rounded-2xl p-5 transition-opacity hover:opacity-90 lg:min-h-[220px]"
                            style={{ background: "var(--hero-newsletter-card-bg)" }}
                        >
                            <svg className="pointer-events-none absolute inset-0 h-full w-full select-none" viewBox="0 0 460 220" preserveAspectRatio="xMidYMid slice" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="450" cy="-10" r="195" fill="none" stroke="white" strokeWidth="1" opacity="0.13" />
                                <circle cx="0" cy="230" r="125" fill="none" stroke="white" strokeWidth="0.5" opacity="0.09" />
                                <line x1="0" y1="98" x2="85" y2="98" stroke="white" strokeWidth="0.5" opacity="0.09" />
                                <line x1="0" y1="126" x2="52" y2="126" stroke="white" strokeWidth="0.5" opacity="0.07" />
                                <line x1="195" y1="0" x2="345" y2="220" stroke="white" strokeWidth="0.5" opacity="0.07" />
                                <line x1="58" y1="178" x2="74" y2="178" stroke="white" strokeWidth="1" opacity="0.15" />
                                <line x1="66" y1="170" x2="66" y2="186" stroke="white" strokeWidth="1" opacity="0.15" />
                            </svg>
                            <div className="flex flex-1 flex-col justify-between">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-[0.2em]"
                                        style={{ color: "var(--hero-newsletter-sidebar-label)" }}>
                                        {t(s, "newsletterCard_label", "Curadoria Semanal")}
                                    </p>
                                    <p className="mt-3 font-serif italic text-xl leading-tight lg:text-4xl"
                                        style={{ color: "var(--hero-newsletter-sidebar-number)" }}>
                                        {t(s, "newsletterCard_headline1", "O melhor da IA,")}
                                        <br />
                                        {t(s, "newsletterCard_headline2", "segunda e quarta.")}
                                    </p>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className="text-sm"
                                        style={{ color: "var(--hero-newsletter-sidebar-label)" }}>
                                        {t(s, "newsletterCard_tagline", "Gratuito · Recomendado")}
                                    </span>
                                    <span className="self-center text-sm font-medium transition-opacity group-hover:opacity-80"
                                        style={{ color: "var(--hero-newsletter-sidebar-number)" }}>
                                        {t(s, "newsletterCard_cta", "Ler →")}
                                    </span>
                                </div>
                            </div>
                        </a>
                    </div>
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

// Texto sólido sobre o preenchimento do bloco (dígito grande no card colorido).
// `text-background/80` media 1.7-2.7:1 nas 7 cores (axe color-contrast,
// achados C05-C10) — o branco/azul claro translúcido nunca alcança 3:1 em
// texto grande sobre laranja/âmbar/ciano/turquesa/rosa. `-on` é preto puro,
// validado ≥4.5:1 nas 7 cores em todos os temas (app/globals.css).
const BLOCK_ON_COLORS = [
    "var(--block-newsletter-on)",
    "var(--block-reportagem-on)",
    "var(--block-radar-on)",
    "var(--block-livro-on)",
    "var(--block-biblioteca-on)",
    "var(--block-estudar-on)",
    "var(--block-ensinar-on)",
];

function SetesCoresSection({ s }: { s: SectionConfig }) {
    const blocks = BLOCK_COLORS.map((color, i) => ({
        color,
        onColor: BLOCK_ON_COLORS[i],
        num: String(i + 1).padStart(2, "0"),
        href: t(s, `block${i + 1}_href`, ""),
        label: t(s, `block${i + 1}_label`, ""),
        desc: t(s, `block${i + 1}_desc`, ""),
        cadence: t(s, `block${i + 1}_cadence`, ""),
    }));

    return (
        <section className="relative overflow-hidden border-t border-border bg-ink py-24 text-background">
            <svg
                className="pointer-events-none absolute inset-0 h-full w-full select-none"
                viewBox="0 0 1440 600"
                preserveAspectRatio="xMidYMid slice"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Large circles — structural anchors */}
                <circle cx="-60" cy="70" r="420" fill="none" stroke="white" strokeWidth="1" opacity="0.1" />
                <circle cx="1510" cy="540" r="340" fill="none" stroke="white" strokeWidth="1" opacity="0.08" />
                <circle cx="760" cy="620" r="160" fill="none" stroke="white" strokeWidth="0.5" opacity="0.06" />

                {/* Dashed medium circle — mid section */}
                <circle cx="1050" cy="120" r="110" fill="none" stroke="white" strokeWidth="0.75" strokeDasharray="6 5" opacity="0.09" />

                {/* Diagonal lines */}
                <line x1="140" y1="0" x2="520" y2="600" stroke="white" strokeWidth="0.75" opacity="0.08" />
                <line x1="880" y1="0" x2="1180" y2="600" stroke="white" strokeWidth="0.5" opacity="0.05" />

                {/* Horizontal rules */}
                <line x1="0" y1="190" x2="220" y2="190" stroke="white" strokeWidth="0.5" opacity="0.08" />
                <line x1="1180" y1="390" x2="1440" y2="390" stroke="white" strokeWidth="0.5" opacity="0.07" />

                {/* Cross marks — editorial detail */}
                <line x1="950" y1="88" x2="974" y2="88" stroke="white" strokeWidth="1.2" opacity="0.18" />
                <line x1="962" y1="76" x2="962" y2="100" stroke="white" strokeWidth="1.2" opacity="0.18" />

                <line x1="330" y1="468" x2="350" y2="468" stroke="white" strokeWidth="1" opacity="0.14" />
                <line x1="340" y1="458" x2="340" y2="478" stroke="white" strokeWidth="1" opacity="0.14" />

                <line x1="1310" y1="160" x2="1326" y2="160" stroke="white" strokeWidth="1" opacity="0.12" />
                <line x1="1318" y1="152" x2="1318" y2="168" stroke="white" strokeWidth="1" opacity="0.12" />

            </svg>
            <div className="relative mx-auto max-w-7xl px-6">
                <div className="grid items-center gap-12 lg:grid-cols-12">
                    <div className="lg:col-span-5">
                        <div className="text-sm uppercase tracking-[0.22em] text-background/50">{t(s, "label", "Sistema cromático")}</div>
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
                                <p className="font-serif text-lg italic leading-snug">&ldquo;{t(s, "quote", "Suceder é o teste final da liderança.")}&rdquo;</p>
                                <footer className="mt-2 text-[10px] uppercase tracking-[0.22em] text-background/50">{t(s, "quoteAuthor", "ML-20 · Enquanto é Tempo")}</footer>
                            </blockquote>
                        </div>
                    </div>
                    <div className="lg:col-span-7">
                        <div className="space-y-2">
                            {blocks.map((b) => (
                                <a key={b.num} href={b.href} className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-background/10 bg-background/5 transition-colors hover:bg-background/[0.08]">
                                    <div className="relative h-20 w-28 shrink-0 overflow-hidden transition-all duration-500 group-hover:w-40" style={{ backgroundColor: b.color }}>
                                        <span className="absolute bottom-2 left-3 font-serif text-3xl" style={{ color: b.onColor }}>{b.num}</span>
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

function IAsSection({ s }: { s: SectionConfig }) {
    const ias = Array.from({ length: 7 }, (_, i) => ({
        n: String(i + 1).padStart(2, "0"),
        name: t(s, `ia${i + 1}_name`, ""),
        role: t(s, `ia${i + 1}_role`, ""),
    }));

    return (
        <section id="ias" className="relative overflow-hidden border-t border-border bg-ink py-24 text-background">
            <svg className="pointer-events-none absolute inset-0 h-full w-full select-none" viewBox="0 0 1440 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                {/* Circles */}
                <circle cx="-40" cy="580" r="380" fill="none" stroke="white" strokeWidth="1" opacity="0.09" />
                <circle cx="1490" cy="60" r="300" fill="none" stroke="white" strokeWidth="1" opacity="0.08" />
                <circle cx="860" cy="300" r="90" fill="none" stroke="white" strokeWidth="0.75" strokeDasharray="4 4" opacity="0.08" />
                {/* Grid-like horizontal lines — technical feel */}
                <line x1="0" y1="110" x2="260" y2="110" stroke="white" strokeWidth="0.5" opacity="0.07" />
                <line x1="0" y1="300" x2="160" y2="300" stroke="white" strokeWidth="0.5" opacity="0.06" />
                <line x1="0" y1="490" x2="220" y2="490" stroke="white" strokeWidth="0.5" opacity="0.05" />
                <line x1="1200" y1="0" x2="1200" y2="600" stroke="white" strokeWidth="0.5" opacity="0.05" />
                <line x1="380" y1="0" x2="660" y2="600" stroke="white" strokeWidth="0.5" opacity="0.05" />
                {/* Crosses */}
                <line x1="1310" y1="240" x2="1330" y2="240" stroke="white" strokeWidth="1.2" opacity="0.16" />
                <line x1="1320" y1="230" x2="1320" y2="250" stroke="white" strokeWidth="1.2" opacity="0.16" />
                <line x1="190" y1="78" x2="206" y2="78" stroke="white" strokeWidth="1" opacity="0.14" />
                <line x1="198" y1="70" x2="198" y2="86" stroke="white" strokeWidth="1" opacity="0.14" />
                <line x1="700" y1="520" x2="714" y2="520" stroke="white" strokeWidth="1" opacity="0.12" />
                <line x1="707" y1="513" x2="707" y2="527" stroke="white" strokeWidth="1" opacity="0.12" />
            </svg>
            <div className="relative mx-auto max-w-7xl px-6">
                <div className="grid gap-12 lg:grid-cols-12">
                    <div className="lg:col-span-5">
                        <div className="text-sm uppercase tracking-[0.22em] text-background/50">{t(s, "label", "As 7 IAs parceiras")}</div>
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
                                <div key={ia.n} className="group relative flex aspect-square flex-col justify-between overflow-hidden rounded-2xl border border-background/10 bg-background/[0.04] p-4 transition hover:-translate-y-1 hover:border-background/30 hover:bg-background/[0.09]">
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
                            <div className="relative flex aspect-square flex-col justify-between overflow-hidden rounded-2xl p-4" style={{ backgroundColor: "var(--block-newsletter)", color: "var(--block-newsletter-on)" }}>
                                <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ background: "radial-gradient(120% 80% at 100% 0%, white, transparent 60%)" }} />
                                <div className="relative text-[10px] uppercase tracking-[0.22em] opacity-70">Curadoria</div>
                                <div className="relative">
                                    <div className="font-serif text-3xl leading-none">+ Humano</div>
                                    <div className="mt-2 text-[11px] opacity-70">Decisão final, sempre</div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            <Link href="/view/biblioteca/009" className="group inline-flex items-center gap-2 rounded-full bg-background px-5 py-3 text-sm font-medium text-ink transition-transform hover:-translate-y-0.5">
                                Conhecer mais
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-up-right size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true">
                                    <path d="M7 7h10v10" /><path d="M7 17 17 7" />
                                </svg>
                            </Link>
                            <span className="text-sm text-background/50">Como cada IA entra no fluxo editorial</span>
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
        <section id="manifesto" className="relative overflow-hidden border-t border-border bg-background py-32">
            <svg className="pointer-events-none absolute inset-0 h-full w-full select-none" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                {/* Concentric arcs centered behind the quote */}
                <circle cx="720" cy="400" r="200" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.05" />
                <circle cx="720" cy="400" r="360" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.04" />
                <circle cx="720" cy="400" r="520" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.03" />
                {/* Corner anchors */}
                <circle cx="-120" cy="-80" r="460" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.05" />
                <circle cx="1560" cy="880" r="400" fill="none" stroke="currentColor" strokeWidth="0.75" opacity="0.04" />
                {/* Horizontal rules — like paper lines */}
                <line x1="160" y1="620" x2="1280" y2="620" stroke="currentColor" strokeWidth="0.5" opacity="0.06" />
                <line x1="320" y1="660" x2="1120" y2="660" stroke="currentColor" strokeWidth="0.5" opacity="0.04" />
                {/* Crosses */}
                <line x1="170" y1="200" x2="186" y2="200" stroke="currentColor" strokeWidth="1" opacity="0.12" />
                <line x1="178" y1="192" x2="178" y2="208" stroke="currentColor" strokeWidth="1" opacity="0.12" />
                <line x1="1254" y1="500" x2="1270" y2="500" stroke="currentColor" strokeWidth="1" opacity="0.12" />
                <line x1="1262" y1="492" x2="1262" y2="508" stroke="currentColor" strokeWidth="1" opacity="0.12" />
            </svg>
            <div className="relative mx-auto max-w-4xl px-6 text-center">
                <div className="text-sm uppercase tracking-[0.22em] text-muted-foreground">{t(s, "label", "Manifesto")}</div>
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
                <div className="mt-10 inline-flex items-center gap-3 text-md text-muted-foreground">
                    <span className="h-px w-10 bg-border" />
                    {t(s, "author", "Paulo Periquito · Editor")}
                    <span className="h-px w-10 bg-border" />
                </div>
            </div>
        </section>
    );
}

function NewsletterSection({ s }: { s: SectionConfig }) {
    return (
        <section id="newsletter" className="relative overflow-hidden border-t border-border bg-ink py-24 text-background">
            <svg className="pointer-events-none absolute inset-0 h-full w-full select-none" viewBox="0 0 1440 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                {/* Circles */}
                <circle cx="1420" cy="300" r="380" fill="none" stroke="white" strokeWidth="1" opacity="0.09" />
                <circle cx="120" cy="-50" r="250" fill="none" stroke="white" strokeWidth="1" opacity="0.08" />
                <circle cx="480" cy="720" r="200" fill="none" stroke="white" strokeWidth="0.75" strokeDasharray="8 6" opacity="0.08" />
                {/* Stacked short horizontals — rhythm/pulse feel */}
                <line x1="0" y1="160" x2="130" y2="160" stroke="white" strokeWidth="0.5" opacity="0.08" />
                <line x1="0" y1="210" x2="80" y2="210" stroke="white" strokeWidth="0.5" opacity="0.06" />
                <line x1="0" y1="260" x2="110" y2="260" stroke="white" strokeWidth="0.5" opacity="0.07" />
                <line x1="680" y1="0" x2="920" y2="600" stroke="white" strokeWidth="0.5" opacity="0.05" />
                {/* Crosses */}
                <line x1="570" y1="88" x2="590" y2="88" stroke="white" strokeWidth="1.2" opacity="0.17" />
                <line x1="580" y1="78" x2="580" y2="98" stroke="white" strokeWidth="1.2" opacity="0.17" />
                <line x1="1090" y1="450" x2="1108" y2="450" stroke="white" strokeWidth="1" opacity="0.14" />
                <line x1="1099" y1="441" x2="1099" y2="459" stroke="white" strokeWidth="1" opacity="0.14" />
                <line x1="300" y1="520" x2="314" y2="520" stroke="white" strokeWidth="1" opacity="0.11" />
                <line x1="307" y1="513" x2="307" y2="527" stroke="white" strokeWidth="1" opacity="0.11" />
            </svg>
            <div className="relative mx-auto max-w-5xl px-6">
                <div className="grid gap-10 md:grid-cols-2 md:items-end">
                    <div>
                        <div className="text-sm uppercase tracking-[0.22em] text-background/50">{t(s, "label", "Newsletter PP7+IAS")}</div>
                        <h2 className="mt-4 font-serif text-5xl leading-[1.05] tracking-tight md:text-6xl">
                            {t(s, "title_before", "Toda ")}
                            <em className="italic" style={{ color: "var(--block-newsletter)" }}>
                                {t(s, "title_em", "segunda e quarta")}
                            </em>
                            .<br />{t(s, "title_line2", "Direto no inbox.")}
                        </h2>
                        <p className="mt-6 max-w-md text-background/70 text-md">{t(s, "description", "")}</p>
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
        case "sete-cores":  return (
            <div key={s.id}>
                <SetesCoresSection s={s} />
                <HomeEditorialSection />
            </div>
        );
        // Seção "Editoriais e Artigos" desabilitada — a curadoria pessoal do
        // Paulo ocupa esse mesmo lugar na ordem de seções da home agora.
        case "editorial":   return <HomeRecomendacoesPaulo key={s.id} />;
        case "ias":         return (
            <div key={s.id}>
                <IAsSection s={s} />
                <HomeTrilhasSection />
            </div>
        );
        // FAQ não é uma seção configurável no HomepageConfig — fica sempre
        // colada logo abaixo do Manifesto, na ordem em que ele for renderizado.
        case "manifesto":   return (
            <div key={s.id}>
                <ManifestoSection s={s} />
                <HomeFaqSection />
            </div>
        );
        case "newsletter":  return <NewsletterSection key={s.id} s={s} />;
        default:            return null;
    }
}

export default async function Home() {
    const [sections, activeBook, { latest: latestNewsletter, older: olderNewsletters }, { all: allChapters }, siteBg] = await Promise.all([
        getConfig(),
        DIContainer.getActiveBookUseCase().execute().catch(() => null),
        DIContainer.getNewslettersUseCase().execute().catch(() => ({ latest: null, older: [] as never[] })),
        DIContainer.getMiniLivrosUseCase().execute().catch(() => ({ latest: null, older: [], all: [] as never[] })),
        DIContainer.getSiteBgUseCase().execute().catch(() => ({ ...DEFAULT_SITE_BG })),
    ]);

    const totalChapters = allChapters.length;
    const bookChaptersTotal = siteBg.bookChaptersTotal;

    // Carrossel de destaques (PDF 3.7.2): livro, guia de Lisboa,
    // 2 últimas newsletters e itens fixos.
    const latestTwoNewsletters = [latestNewsletter, ...(olderNewsletters ?? [])]
        .filter((n): n is Newsletter => n !== null)
        .slice(0, 2);

    const carouselSlides: HomeCarouselSlide[] = [
        {
            key: "livro",
            eyebrow: "O Livro",
            title: activeBook?.title ?? "Enquanto é Tempo",
            description: "Um livro sobre liderança, publicado capítulo a capítulo.",
            href: "/mini-livros",
            color: "var(--block-livro)",
        },
        {
            key: "guia-lisboa",
            eyebrow: "Biblioteca · Viagens",
            title: "Guia de restaurantes de Lisboa",
            description: "Curadoria de viagens e restaurantes da Biblioteca.",
            href: "/explorar?b=biblioteca&tema=viagens-restaurantes",
            color: "var(--block-biblioteca)",
        },
        ...latestTwoNewsletters.map((n, i) => ({
            key: `newsletter-${n.id}`,
            eyebrow: i === 0 ? "Newsletter · Última edição" : "Newsletter",
            title: n.title,
            description: n.formattedDate,
            href: n.htmlPath ?? "/explorar?b=newsletter",
            color: "var(--block-newsletter)",
        })),
        {
            key: "explorar",
            eyebrow: "Portal",
            title: "Índice do conteúdo publicado",
            description: "Todo o conteúdo, organizado por cor.",
            href: "/explorar",
            color: "var(--block-radar)",
        },
        {
            key: "quem-somos",
            eyebrow: "PP7+IAS",
            title: "Quem somos",
            description: "40+ anos de liderança executiva com 7 IAs.",
            href: "/quem-somos",
            color: "var(--block-ensinar)",
        },
    ];

    return (
        <main id="conteudo" className="min-h-screen bg-background text-foreground">
            <Navbar />

            {sections.map(s => {
                if (!s.visible) return null;
                if (s.id === "hero") return (
                    <div key={s.id}>
                        <HeroSection
                            s={s}
                            book={activeBook}
                            totalChapters={totalChapters}
                            bookChaptersTotal={bookChaptersTotal}
                        />
                        <HomeCarousel slides={carouselSlides} />
                    </div>
                );
                return renderSection(s);
            })}

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
                                    { href: "/explorar?b=inteligencia-artificial", color: "var(--block-reportagem)", label: "Inteligência Artificial" },
                                    { href: "/explorar?b=editoriais-artigos", color: "var(--block-radar)", label: "Editoriais e Artigos" },
                                    { href: "/mini-livros", color: "var(--block-livro)", label: "Enquanto é Tempo" },
                                    { href: "/biblioteca", color: "var(--block-biblioteca)", label: "Biblioteca" },
                                    { href: "/estudar", color: "var(--block-estudar)", label: "Estudar" },
                                    { href: "/explorar?b=ensinar", color: "var(--block-ensinar)", label: "Ensinar" },
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
                                <li><a href="/explorar?b=biblioteca&tema=prompts" className="hover:text-foreground">Biblioteca de Prompts</a></li>
                                <li><a href="/faq" className="hover:text-foreground">Perguntas Frequentes</a></li>
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

            {process.env.NEXT_PUBLIC_CHAT_ENABLED !== "false" && <ChatBubbleLazy />}
        </main>
    );
}
