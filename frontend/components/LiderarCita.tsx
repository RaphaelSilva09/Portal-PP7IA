"use client";

import { portalContentClass } from "@/lib/layout";

export default function LiderarCita() {
    return (
        <section id="liderar-citacao" className="py-8">
            <div className={portalContentClass}>
                <div className="flex justify-center">
                    <span className="bg-card/85 px-4 py-2 rounded-full text-sm font-semibold text-text-secondary text-center border border-border">
                        &ldquo;Liderar é servir. Formar pessoas. Deixar legado.&rdquo;
                    </span>
                </div>
            </div>
        </section>
    );
}
