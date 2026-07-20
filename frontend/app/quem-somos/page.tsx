import Footer from "@/components/Footer";
import Navbar from "@/components/Header";
import { getTeamMemberContactLinks, TEAM_MEMBERS } from "@/constants/team";
import type { TeamContactKind, TeamMemberKind } from "@/constants/team";
import { portalContentClass } from "@/lib/layout";
import { ArrowLeft, Briefcase, FileCheck2, Github, Instagram, Linkedin, Mail, MessageCircle, Palette, Users } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Quem Somos · PP7+IAS",
    description: "Plataforma de curadoria que combina 40+ anos de liderança executiva com 7 inteligências artificiais.",
};

const iconByKind: Record<TeamMemberKind, typeof Users> = {
    creator: Briefcase,
    tech: Users,
    arts: Palette,
    review: FileCheck2,
};

const iconByContactKind: Record<TeamContactKind, typeof Mail> = {
    email: Mail,
    instagram: Instagram,
    whatsapp: MessageCircle,
    linkedin: Linkedin,
    github: Github,
};

export default function QuemSomosPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className={`${portalContentClass} py-8`}>

                {/* Back */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="size-3.5" />
                    Portal
                </Link>

                {/* Header */}
                <div className="mt-8 mb-10">
                    <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                        PP7+IAS
                    </p>
                    <h1 className="mt-2 font-serif text-3xl tracking-tight text-ink md:text-4xl">
                        Quem somos.
                    </h1>
                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                        Plataforma de curadoria que combina{" "}
                        <span className="font-medium text-foreground">40+ anos de liderança executiva</span>{" "}
                        com{" "}
                        <span className="font-medium text-foreground">7 inteligências artificiais</span>.
                        Conteúdo organizado em 7 blocos, publicando só o que foi testado e funciona.
                    </p>
                </div>

                {/* Team grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {TEAM_MEMBERS.map(({ role, name, description, kind, contact }) => {
                        const Icon = iconByKind[kind];
                        const contactLinks = getTeamMemberContactLinks(contact);
                        return (
                            <div
                                key={name}
                                className="flex flex-col rounded-2xl border border-border bg-card p-5 transition-colors hover:border-foreground/20"
                            >
                                <div className="mb-4 flex size-9 items-center justify-center rounded-xl bg-accent">
                                    <Icon className="size-4 text-muted-foreground" />
                                </div>
                                <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
                                    {role}
                                </p>
                                <p className="mt-1.5 text-sm font-medium text-foreground">{name}</p>
                                {description && (
                                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                                        {description}
                                    </p>
                                )}
                                {contactLinks.length > 0 && (
                                    <div className="mt-4 flex flex-wrap items-center gap-2 pt-1">
                                        {contactLinks.map(({ kind: contactKind, href, label }) => {
                                            const ContactIcon = iconByContactKind[contactKind];
                                            const isExternal = !href.startsWith("mailto:");
                                            return (
                                                <a
                                                    key={contactKind}
                                                    href={href}
                                                    aria-label={`${label} de ${name}`}
                                                    title={label}
                                                    target={isExternal ? "_blank" : undefined}
                                                    rel={isExternal ? "noopener noreferrer" : undefined}
                                                    className="touch-target inline-flex items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                                                >
                                                    <ContactIcon className="size-4" aria-hidden="true" />
                                                </a>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </main>

            <Footer />
        </div>
    );
}
