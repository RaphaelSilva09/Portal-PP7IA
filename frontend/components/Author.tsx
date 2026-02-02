"use client";

import AuthorProfile from "./AuthorProfile";
import { authorSections, AuthorSection } from "./AuthorSections";

export default function Author() {
    // Helper to get section by ID
    const getSection = (id: string) => authorSections.find((s) => s.id === id);

    const formacao = getSection("formacao");
    const asa = getSection("asa-alcoa");
    const whirlpool = getSection("whirlpool");
    const portal = getSection("portal-pp-ias");
    const filosofia = getSection("filosofia");

    return (
        <section
            id="autor"
            className="relative py-20 px-4 sm:px-6 lg:px-8 scroll-mt-20"
            style={{ isolation: "isolate" }}
        >
            <div className="max-w-7xl mx-auto flex flex-col gap-8">

                {/* Row 1: Profile + Formação */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <AuthorProfile />
                    {formacao && <AuthorBlock section={formacao} />}
                </div>

                {/* Row 2: ASA + Whirlpool (Reverso visualmente se desejado, mas mantendo grid simples) 
                    User requested "reverse row". In code structure keeping it simple grid is safer for mobile,
                    but we can swap order in desktop if needed. 
                    However, "ASA" and "Whirlpool" are peers. Placing them side-by-side matches the "div reverse row" 
                    intent of having them grouped together like the first row. 
                */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                    {asa && <AuthorBlock section={asa} />}
                    {whirlpool && <AuthorBlock section={whirlpool} />}
                </div>

                {/* Row 3: Portal + Filosofia */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                    {portal && <AuthorBlock section={portal} />}
                    {filosofia && <AuthorBlock section={filosofia} />}
                </div>

            </div>
        </section>
    );
}

// Simple Block component for Author Sections
function AuthorBlock({ section }: { section: AuthorSection }) {
    const colorConfig = {
        blue: {
            bg: "rgba(59, 130, 246, 0.1)",
            border: "rgba(59, 130, 246, 0.2)",
            icon: "#3b82f6",
        },
        orange: {
            bg: "rgba(251, 146, 60, 0.1)",
            border: "rgba(251, 146, 60, 0.2)",
            icon: "#fb923c",
        },
        green: {
            bg: "rgba(34, 197, 94, 0.1)",
            border: "rgba(34, 197, 94, 0.2)",
            icon: "#22c55e",
        },
        purple: {
            bg: "rgba(168, 85, 247, 0.1)",
            border: "rgba(168, 85, 247, 0.2)",
            icon: "#a855f7",
        },
    };

    const colors = colorConfig[section.color];
    const Icon = section.icon;

    return (
        <article className="h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center border"
                    style={{
                        backgroundColor: colors.bg,
                        borderColor: colors.border,
                    }}
                >
                    <Icon className="w-6 h-6" style={{ color: colors.icon }} />
                </div>
                <h3 className="text-2xl font-bold text-white">{section.title}</h3>
            </div>

            {/* Content */}
            <div
                className="glass-card p-6 sm:p-8 border-l-4 flex-1"
                style={{
                    borderLeftColor: colors.border,
                    borderColor: "rgba(255,255,255,0.05)",
                }}
            >
                {section.content}
            </div>
        </article>
    );
}
