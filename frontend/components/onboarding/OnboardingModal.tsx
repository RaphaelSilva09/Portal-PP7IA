"use client";

import { useRef, useState } from "react";
import { ArrowRight, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { ONBOARDING_BLOCKS, ONBOARDING_STEPS } from "@/constants/onboarding";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { useDialogA11y } from "@/hooks/useDialogA11y";
import { useOnboarding } from "@/context/OnboardingContext";
import Portal from "@/components/Portal";

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
                    {/* Header */}
                    <div className="flex items-start justify-between p-6 pb-4">
                        <div>
                            <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                                {step.eyebrow}
                            </div>
                            <h2 id="onboarding-modal-title" className="mt-1 font-serif text-3xl text-ink">
                                {step.title}
                            </h2>
                        </div>
                        <button
                            type="button"
                            onClick={handleClose}
                            className="ml-4 flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                            aria-label="Pular tour"
                        >
                            <X className="size-4" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="flex-1 overflow-y-auto px-6 pb-2">
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            {step.description}
                        </p>

                        {step.id === "blocks" && (
                            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                                {ONBOARDING_BLOCKS.map(block => (
                                    <div
                                        key={block.label}
                                        className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card px-2 py-3 text-center"
                                    >
                                        <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: block.color }} />
                                        <span className="text-xs font-medium text-foreground">{block.label}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer: progress + navigation */}
                    <div className="flex items-center justify-between gap-4 border-t border-border p-6 pt-5">
                        <div className="flex items-center gap-1.5" aria-hidden="true">
                            {ONBOARDING_STEPS.map((s, i) => (
                                <span
                                    key={s.id}
                                    className={`h-1.5 rounded-full transition-all ${
                                        i === stepIndex ? "w-5 bg-primary" : "w-1.5 bg-border"
                                    }`}
                                />
                            ))}
                        </div>

                        <div className="flex items-center gap-2">
                            {!isFirst && (
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                                >
                                    Voltar
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={handleNext}
                                className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition hover:bg-foreground/80"
                            >
                                {isLast ? (
                                    <>
                                        <Check className="size-3.5" />
                                        Começar a explorar
                                    </>
                                ) : (
                                    <>
                                        Próximo
                                        <ArrowRight className="size-3.5" />
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
