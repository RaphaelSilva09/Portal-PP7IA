"use client";

import { useEffect, useRef, useState } from "react";
import {
    ArrowRight,
    BookOpen,
    Check,
    ChevronDown,
    LayoutGrid,
    Menu,
    MessageCircle,
    MoonStar,
    Sparkles,
    SunMedium,
    Type,
    User,
    X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ONBOARDING_BLOCKS, ONBOARDING_STEPS } from "@/constants/onboarding";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useDialogA11y } from "@/hooks/useDialogA11y";
import { useOnboarding } from "@/context/OnboardingContext";
import Portal from "@/components/Portal";

/** Ícone grande por passo — a âncora visual principal de cada tela, com a legenda só reforçando. */
const ICON_BY_STEP: Record<string, LucideIcon> = {
    welcome: Sparkles,
    blocks: LayoutGrid,
    reading: Type,
    assistant: MessageCircle,
    community: BookOpen,
    theme: SunMedium,
    finish: User,
};

/** Marcador "é aqui" — um ponto que pulsa, para elementos sem forma de botão própria (ex.: um link de texto no menu). */
function PingDot({ color, className }: { color: string; className: string }) {
    return (
        <span className={`absolute flex ${className}`} aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ backgroundColor: color }} />
            <span className="relative inline-flex h-full w-full rounded-full border border-background" style={{ backgroundColor: color }} />
        </span>
    );
}

/** Réplica em miniatura do botão flutuante real (ReadingPrefsControl): círculo com borda, sem preenchimento de cor. */
function FabButtonPreview({ icon: PreviewIcon, className }: { icon: LucideIcon; className: string }) {
    return (
        <span className={`absolute flex size-7 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm ${className}`}>
            <PreviewIcon className="size-3.5" />
            <PingDot color="var(--primary)" className="-right-1 -top-1 size-2.5" />
        </span>
    );
}

/** Liga/desliga sozinho num intervalo — base dos mini-dropdowns que se abrem e fecham em loop. */
function useAutoToggle(intervalMs: number, initial = true): boolean {
    const [isOn, setIsOn] = useState(initial);
    useEffect(() => {
        const interval = window.setInterval(() => setIsOn(v => !v), intervalMs);
        return () => window.clearInterval(interval);
    }, [intervalMs]);
    return isOn;
}

/**
 * O botão de perfil tem forma diferente por tamanho de tela real (ver
 * Header.tsx): abaixo de 960px é um chip retangular (rounded-lg, menor);
 * a partir de 960px é uma pílula (rounded-full). Renderiza os dois e deixa
 * o CSS mostrar o certo pro viewport atual — o mesmo breakpoint do header
 * de verdade, então o mock já nasce coerente com o dispositivo do usuário.
 */
function ProfileTriggerChip({ isOpen }: { isOpen: boolean }) {
    const chevron = (
        <ChevronDown className={`size-2 text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
    );
    return (
        <>
            <span className="inline-flex items-center gap-1 rounded-lg border border-border px-1.5 py-1 min-[960px]:hidden">
                <span className="flex size-2.5 items-center justify-center rounded-[2px] bg-ink font-serif text-[6px] text-background">A</span>
                <span className="h-1 w-5 rounded-full bg-border" />
                {chevron}
            </span>
            <span className="hidden items-center gap-1 rounded-full border border-border px-1.5 py-1 min-[960px]:inline-flex">
                <span className="flex size-2.5 items-center justify-center rounded-[3px] bg-ink font-serif text-[6px] text-background">A</span>
                <span className="h-1 w-5 rounded-full bg-border" />
                {chevron}
            </span>
        </>
    );
}

/**
 * Réplica do botão de perfil real abrindo o dropdown real — cicla sozinho
 * fechado/aberto, com "Meu Perfil" (primeira linha real) destacado quando
 * aberto.
 */
function ProfileMenuPreview() {
    const isOpen = useAutoToggle(1600);

    return (
        <div className="relative mx-auto w-full max-w-[240px] overflow-hidden rounded-xl border border-border bg-card" aria-hidden="true">
            <div className="flex h-9 items-center justify-end border-b border-border/60 bg-background px-2.5">
                <ProfileTriggerChip isOpen={isOpen} />
            </div>
            <div className="relative h-24">
                <div
                    className={`absolute right-2.5 top-1.5 w-32 origin-top-right overflow-hidden rounded-lg border border-border bg-background shadow-sm transition-all duration-300 ease-out ${
                        isOpen ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
                    }`}
                >
                    <div className={`flex items-center gap-1.5 px-2 py-1.5 transition-colors duration-300 ${isOpen ? "bg-accent" : ""}`}>
                        <User className="size-3 shrink-0" />
                        <span className="text-[9px] font-semibold leading-tight text-foreground">Meu Perfil</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1.5">
                        <span className="h-1 w-10 rounded-full bg-border" />
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1.5">
                        <span className="h-1 w-8 rounded-full bg-border" />
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Mesmo dropdown do perfil, mas destacando "Tipografia" — que na realidade
 * vem depois de Meu Perfil/Convidar/Sair e de um separador, não é o
 * primeiro item. Cicla aberto/fechado sozinho, como o ProfileMenuPreview.
 */
function TypographyMenuPreview() {
    const isOpen = useAutoToggle(1600);

    return (
        <div className="relative mx-auto w-full max-w-[240px] overflow-hidden rounded-xl border border-border bg-card" aria-hidden="true">
            <div className="flex h-7 items-center justify-end border-b border-border/60 bg-background px-2.5">
                <ProfileTriggerChip isOpen={isOpen} />
            </div>
            <div className="relative h-28">
                <div
                    className={`absolute right-2.5 top-1.5 w-32 origin-top-right overflow-hidden rounded-lg border border-border bg-background shadow-sm transition-all duration-300 ease-out ${
                        isOpen ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
                    }`}
                >
                    <div className="flex items-center gap-1.5 px-2 py-1.5">
                        <span className="h-1 w-14 rounded-full bg-border" />
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1.5">
                        <span className="h-1 w-10 rounded-full bg-border" />
                    </div>
                    <div className="my-0.5 border-t border-border/60" />
                    <div className={`flex items-center gap-1.5 px-2 py-1.5 transition-colors duration-300 ${isOpen ? "bg-accent" : ""}`}>
                        <Type className="size-3 shrink-0" />
                        <span className="text-[9px] font-semibold leading-tight text-foreground">Tipografia</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * O tema também muda de lugar por tamanho de tela real (ver Header.tsx): a
 * partir de 960px o botão de tema fica solto na barra de navegação sempre;
 * abaixo de 960px, para quem está logado (o público real deste onboarding),
 * ele SOME da barra e vira um item "Tema" dentro do dropdown do perfil,
 * antes de "Tipografia". São dois lugares genuinamente diferentes, não só
 * um botão redesenhado — por isso dois mocks distintos, não um só com CSS.
 */
const THEME_SNAPSHOTS = [
    { label: "Claro",  icon: SunMedium, bg: "#eef4ff", card: "#ffffff", muted: "#64748b", accent: "#1d4ed8" },
    { label: "Sépia",  icon: BookOpen,  bg: "#f5edda", card: "#fffcf3", muted: "#6b5f48", accent: "#92400e" },
    { label: "Escuro", icon: MoonStar,  bg: "#111111", card: "#161616", muted: "#acacac", accent: "#3b9eff" },
] as const;

/** Desktop (≥960px): janela inteira mudando de cor, botão de tema solto na barra de navegação. */
function ThemeWindowPreview() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = window.setInterval(() => setIndex(i => (i + 1) % THEME_SNAPSHOTS.length), 1600);
        return () => window.clearInterval(interval);
    }, []);

    const snap = THEME_SNAPSHOTS[index];
    const Icon = snap.icon;
    const fade = "transition-colors duration-700 ease-in-out";

    return (
        <div className="mx-auto hidden w-full max-w-[240px] min-[960px]:block">
            <div className={`overflow-hidden rounded-xl border border-border/60 ${fade}`} style={{ backgroundColor: snap.bg }} aria-hidden="true">
                {/* barra de navegação: logo + itens placeholder à esquerda, botão de tema real à direita */}
                <div className={`flex h-8 items-center gap-2 px-2.5 ${fade}`} style={{ backgroundColor: snap.card }}>
                    <span className={`h-1.5 w-6 rounded-full ${fade}`} style={{ backgroundColor: snap.muted, opacity: 0.6 }} />
                    <span className={`h-1.5 w-5 rounded-full ${fade}`} style={{ backgroundColor: snap.muted, opacity: 0.4 }} />
                    <span
                        className={`ml-auto flex size-5 items-center justify-center rounded-full border ${fade}`}
                        style={{ borderColor: snap.muted, backgroundColor: snap.card }}
                    >
                        <Icon className="size-2.5" style={{ color: snap.accent }} />
                    </span>
                </div>
                <div className="space-y-2 p-3">
                    <div className={`h-2 w-4/5 rounded-full ${fade}`} style={{ backgroundColor: snap.muted, opacity: 0.5 }} />
                    <div className={`h-2 w-full rounded-full ${fade}`} style={{ backgroundColor: snap.muted, opacity: 0.35 }} />
                    <div className={`h-2 w-3/5 rounded-full ${fade}`} style={{ backgroundColor: snap.muted, opacity: 0.35 }} />
                </div>
            </div>
            <p className="mt-3 text-xs font-medium text-muted-foreground">{snap.label}</p>
        </div>
    );
}

/** Mobile (<960px), logado: "Tema" dentro do dropdown do perfil, antes de "Tipografia" — não um botão na barra. */
function ThemeMenuPreview() {
    const isOpen = useAutoToggle(1600);
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = window.setInterval(() => setIndex(i => (i + 1) % THEME_SNAPSHOTS.length), 1600);
        return () => window.clearInterval(interval);
    }, []);

    const snap = THEME_SNAPSHOTS[index];
    const Icon = snap.icon;

    return (
        <div className="relative mx-auto w-full max-w-[240px] overflow-hidden rounded-xl border border-border bg-card min-[960px]:hidden" aria-hidden="true">
            <div className="flex h-7 items-center justify-end border-b border-border/60 bg-background px-2.5">
                <ProfileTriggerChip isOpen={isOpen} />
            </div>
            <div className="relative h-32">
                <div
                    className={`absolute right-2.5 top-1.5 w-32 origin-top-right overflow-hidden rounded-lg border border-border bg-background shadow-sm transition-all duration-300 ease-out ${
                        isOpen ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
                    }`}
                >
                    <div className="flex items-center gap-1.5 px-2 py-1.5">
                        <span className="h-1 w-14 rounded-full bg-border" />
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1.5">
                        <span className="h-1 w-10 rounded-full bg-border" />
                    </div>
                    <div className="my-0.5 border-t border-border/60" />
                    <div className={`flex items-center justify-between gap-1.5 px-2 py-1.5 transition-colors duration-300 ${isOpen ? "bg-accent" : ""}`}>
                        <span className="flex items-center gap-1.5">
                            <Icon className="size-3 shrink-0" />
                            <span className="text-[9px] font-semibold leading-tight text-foreground">Tema</span>
                        </span>
                        <span className="text-[7px] text-muted-foreground">{snap.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1.5 opacity-50">
                        <Type className="size-3 shrink-0" />
                        <span className="text-[8px] text-foreground">Tipografia</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

/** Onde cada recurso mora de verdade, simulado em miniatura — só para os passos com um local concreto (welcome não tem). */
const LOCATION_MOCK_BY_STEP: Record<string, ReactNode> = {
    // Barra de navegação real muda de forma por tamanho de tela: a partir de
    // 960px são itens de texto lado a lado; abaixo disso, "7 Blocos" está
    // dentro do menu hambúrguer expandido — não é um menu solto nem um botão colorido.
    blocks: (
        <>
            <div className="mx-auto hidden w-full max-w-[240px] overflow-hidden rounded-xl border border-border bg-card min-[960px]:block" aria-hidden="true">
                <div className="flex h-9 items-center justify-center gap-3 border-b border-border/60 bg-background px-3">
                    <span className="text-[8px] text-muted-foreground">7 IAs</span>
                    <span className="relative text-[8px] font-semibold" style={{ color: "var(--primary)" }}>
                        7 Blocos
                        <PingDot color="var(--primary)" className="-right-2 -top-1.5 size-2" />
                    </span>
                    <span className="text-[8px] text-muted-foreground">Quem somos</span>
                </div>
                <div className="space-y-1.5 p-3">
                    <div className="h-2 w-4/5 rounded-full bg-accent" />
                    <div className="h-2 w-full rounded-full bg-accent" />
                    <div className="h-2 w-3/5 rounded-full bg-accent" />
                </div>
            </div>
            <div className="mx-auto w-full max-w-[240px] overflow-hidden rounded-xl border border-border bg-card min-[960px]:hidden" aria-hidden="true">
                <div className="flex h-8 items-center justify-between border-b border-border/60 bg-background px-2.5">
                    <span className="h-1.5 w-8 rounded-full bg-border" />
                    <Menu className="size-3.5 text-muted-foreground" />
                </div>
                <div className="space-y-1 p-2">
                    <div className="flex items-center gap-2 rounded-lg px-2 py-1.5">
                        <span className="font-serif text-[7px]" style={{ color: "var(--primary)" }}>01</span>
                        <span className="h-1.5 w-10 rounded-full bg-border" />
                    </div>
                    <div className="relative flex items-center gap-2 rounded-lg px-2 py-1.5" style={{ backgroundColor: "var(--accent)" }}>
                        <span className="font-serif text-[7px]" style={{ color: "var(--primary)" }}>02</span>
                        <span className="text-[8px] font-semibold" style={{ color: "var(--primary)" }}>7 Blocos</span>
                        <PingDot color="var(--primary)" className="-right-0.5 -top-0.5 size-2" />
                    </div>
                    <div className="flex items-center gap-2 rounded-lg px-2 py-1.5">
                        <span className="font-serif text-[7px]" style={{ color: "var(--primary)" }}>03</span>
                        <span className="h-1.5 w-12 rounded-full bg-border" />
                    </div>
                </div>
            </div>
        </>
    ),
    // Página de artigo real: barra de contexto (voltar + compartilhar/PDF), título e parágrafo — não só barras genéricas.
    // + o mesmo ajuste, agora dentro do dropdown do perfil (Tipografia), abrindo/fechando sozinho.
    reading: (
        <div className="space-y-3">
            <div className="relative mx-auto w-full max-w-[240px] overflow-hidden rounded-xl border border-border bg-card" aria-hidden="true">
                <div className="flex h-7 items-center justify-between border-b border-border/60 bg-background px-2.5">
                    <span className="h-1.5 w-8 rounded-full bg-border" />
                    <div className="flex items-center gap-1">
                        <span className="size-2.5 rounded-full border border-border" />
                        <span className="size-2.5 rounded-full border border-border" />
                    </div>
                </div>
                <div className="relative space-y-1.5 p-3 pb-10">
                    <div className="h-2.5 w-3/4 rounded-full bg-accent" />
                    <div className="h-1.5 w-full rounded-full bg-accent/70" />
                    <div className="h-1.5 w-full rounded-full bg-accent/70" />
                    <div className="h-1.5 w-3/5 rounded-full bg-accent/70" />
                    <div className="absolute bottom-10 right-2 flex items-center gap-1 rounded-lg border border-border bg-background px-1.5 py-1 shadow-sm">
                        <span className="flex size-3.5 items-center justify-center rounded-full border border-border text-[6px] font-semibold">A+</span>
                        <span className="h-1 w-8 rounded-full bg-accent" />
                    </div>
                    <FabButtonPreview icon={Type} className="bottom-1 right-2" />
                </div>
            </div>
            <TypographyMenuPreview />
        </div>
    ),
    // Botão real do assistente: pílula escura com ícone, canto da tela — só na home. Sem texto real, só a "linha" que representa o rótulo.
    assistant: (
        <div className="relative mx-auto h-24 w-full max-w-[240px] overflow-hidden rounded-xl border border-border bg-card" aria-hidden="true">
            <div className="flex h-7 items-center gap-1.5 border-b border-border/60 bg-background px-2.5">
                <span className="size-1.5 rounded-full bg-border" />
                <span className="h-1.5 w-9 rounded-full bg-border" />
            </div>
            <div className="space-y-1.5 p-3">
                <div className="h-2 w-4/5 rounded-full bg-accent" />
                <div className="h-2 w-full rounded-full bg-accent" />
            </div>
            <span className="absolute bottom-2 right-2 inline-flex items-center gap-1.5 rounded-full border border-ink/90 bg-ink px-2 py-1.5 text-background shadow-sm">
                <MessageCircle className="size-2.5 shrink-0" />
                <span className="h-1 w-8 rounded-full bg-background/40" />
                <PingDot color="var(--block-newsletter)" className="-right-1 -top-1 size-2.5" />
            </span>
        </div>
    ),
    // O que está ao redor de verdade: na home, entre o card do livro e o da newsletter; no bloco, ao lado da capa e dos outros botões.
    community: (
        <div className="space-y-3">
            <div className="mx-auto w-full max-w-[240px] rounded-xl border border-border bg-card p-3" aria-hidden="true">
                <div className="text-[7px] uppercase tracking-wide text-muted-foreground">Home</div>
                <div className="mt-2 space-y-1.5">
                    <div className="flex items-center gap-1.5 rounded-lg p-1.5" style={{ backgroundColor: "var(--block-livro-soft)" }}>
                        <div className="h-5 w-3.5 shrink-0 rounded-sm bg-background/70" />
                        <span className="h-1.5 w-16 rounded-full bg-background/50" />
                    </div>
                    <div className="relative flex items-center gap-1 rounded-full border border-border bg-background px-2 py-1.5">
                        <BookOpen className="size-3 shrink-0 text-muted-foreground" />
                        <span className="h-1.5 w-16 rounded-full bg-accent" />
                        <PingDot color="var(--block-livro)" className="-right-1 -top-1 size-2.5" />
                    </div>
                    <div className="flex items-center gap-1.5 rounded-lg p-1.5" style={{ backgroundColor: "var(--block-newsletter-soft)" }}>
                        <span className="h-1.5 w-20 rounded-full bg-background/50" />
                    </div>
                </div>
            </div>
            <div className="mx-auto w-full max-w-[240px] rounded-xl border border-border bg-card p-3" aria-hidden="true">
                <div className="text-[7px] uppercase tracking-wide text-muted-foreground">Enquanto é Tempo</div>
                <div className="mt-2 flex gap-2">
                    <div className="h-14 w-10 shrink-0 rounded-md" style={{ backgroundColor: "var(--block-livro-soft)" }} />
                    <div className="flex-1 space-y-1.5">
                        <div className="h-1.5 w-full rounded-full bg-accent" />
                        <div className="h-1.5 w-4/5 rounded-full bg-accent" />
                        <div className="mt-1.5 flex gap-1">
                            <span className="relative inline-flex items-center rounded-full px-2 py-1" style={{ backgroundColor: "var(--block-livro)", color: "var(--block-livro-on)" }}>
                                <BookOpen className="size-2.5" />
                                <PingDot color="var(--block-livro)" className="-right-1 -top-1 size-2.5" />
                            </span>
                            <span className="inline-flex items-center rounded-full border border-border px-2 py-1">
                                <span className="block h-1 w-3 rounded-full bg-border" />
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    ),
    theme: (
        <>
            <ThemeWindowPreview />
            <ThemeMenuPreview />
        </>
    ),
    finish: <ProfileMenuPreview />,
};

export default function OnboardingModal() {
    const { isOpen, closeOnboarding } = useOnboarding();
    const [stepIndex, setStepIndex] = useState(0);
    const panelRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    useBodyScrollLock(isOpen);
    useDialogA11y(isOpen, closeOnboarding, panelRef);

    if (!isOpen) return null;

    const isFirst = stepIndex === 0;
    const isLast = stepIndex === ONBOARDING_STEPS.length - 1;
    const step = ONBOARDING_STEPS[stepIndex];
    const Icon = ICON_BY_STEP[step.id] ?? Sparkles;
    const locationMock = LOCATION_MOCK_BY_STEP[step.id];

    const handleClose = () => {
        setStepIndex(0);
        closeOnboarding();
    };

    const handleNext = () => {
        if (isLast) {
            setStepIndex(0);
            closeOnboarding();
            router.push("/explorar");
            return;
        }
        setStepIndex(i => Math.min(i + 1, ONBOARDING_STEPS.length - 1));
    };

    const handleBack = () => setStepIndex(i => Math.max(i - 1, 0));

    return (
        <Portal>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={handleClose}>
                <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />

                <div
                    ref={panelRef}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="onboarding-modal-title"
                    className="relative flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-[var(--shadow-elevated)]"
                    style={{ maxHeight: "calc(100vh - 2rem)" }}
                    onClick={e => e.stopPropagation()}
                >
                    <button
                        type="button"
                        onClick={handleClose}
                        className="absolute right-4 top-4 z-10 flex size-11 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        aria-label="Pular tour"
                    >
                        <X className="size-5" />
                    </button>

                    {/* Corpo: ícone grande centralizado como âncora visual, texto mínimo */}
                    <div className="flex-1 overflow-y-auto px-5 pb-4 pt-8 text-center sm:px-8 sm:pt-10">
                        <div
                            className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary-soft text-primary sm:size-20"
                            aria-hidden="true"
                        >
                            <Icon className="size-8 sm:size-10" />
                        </div>

                        <div className="mt-4 text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground sm:mt-5">
                            {step.eyebrow}
                        </div>
                        <h2 id="onboarding-modal-title" className="mt-2 font-serif text-3xl leading-tight text-ink sm:text-4xl">
                            {step.title}
                        </h2>
                        <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">
                            {step.caption}
                        </p>

                        {locationMock && <div className="mt-6">{locationMock}</div>}

                        {isLast && (
                            <p className="mt-4 text-xs text-muted-foreground/70">
                                Ao clicar em &quot;Começar a explorar&quot;, você sai desta tela e vai para a página Explorar.
                            </p>
                        )}

                        {step.id === "blocks" && (
                            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {ONBOARDING_BLOCKS.map(block => (
                                    <div
                                        key={block.label}
                                        className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card px-2 py-4 text-center"
                                    >
                                        <span className="size-6 shrink-0 rounded-full" style={{ backgroundColor: block.color }} />
                                        <span className="text-sm font-medium leading-tight text-foreground">{block.label}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Rodapé: progresso + navegação — botões grandes, fáceis de tocar.
                        No mobile os botões vêm primeiro (mais espaço de toque, mais
                        prioridade visual) e os pontos de progresso ficam abaixo,
                        centralizados; a partir de sm volta ao layout lado a lado. */}
                    <div className="flex flex-col-reverse gap-3 border-t border-border p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-6 sm:pt-5">
                        <div className="flex items-center justify-center gap-2 sm:justify-start" aria-hidden="true">
                            {ONBOARDING_STEPS.map((s, i) => (
                                <span
                                    key={s.id}
                                    className={`h-2 rounded-full transition-all ${
                                        i === stepIndex ? "w-6 bg-primary" : "w-2 bg-border"
                                    }`}
                                />
                            ))}
                        </div>

                        <div className="flex items-center gap-2">
                            {!isFirst && (
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="min-h-12 flex-1 rounded-full border border-border px-5 text-base text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground sm:flex-none"
                                >
                                    Voltar
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={handleNext}
                                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-base font-medium text-background transition hover:bg-foreground/80 sm:flex-none"
                            >
                                {isLast ? (
                                    <>
                                        <Check className="size-4" />
                                        Começar a explorar
                                    </>
                                ) : (
                                    <>
                                        Próximo
                                        <ArrowRight className="size-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Portal>
    );
}
