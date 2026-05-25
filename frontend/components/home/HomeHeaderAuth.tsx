"use client";

import { useAuthModal } from "@/context/AuthModalContext";
import { ArrowUpRight } from "lucide-react";

export default function HomeHeaderAuth() {
    const { openModal } = useAuthModal();

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={() => openModal({}, "login")}
                className="hidden px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground md:inline-flex"
            >
                Entrar
            </button>
            <button
                onClick={() => openModal({}, "signup")}
                className="group inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2.5 text-sm font-medium text-background transition-all hover:bg-primary"
            >
                Quero fazer parte
                <ArrowUpRight
                    className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    aria-hidden="true"
                />
            </button>
        </div>
    );
}
