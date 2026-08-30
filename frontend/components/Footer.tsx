"use client";

import { portalContentClass } from "@/lib/layout";
import { Mail, MessageCircle } from "lucide-react";
import Link from "next/link";

// Links de redes sociais (alguns comentados para uso futuro)
const socialLinks = [
    // { icon: Twitter, href: "#", label: "Twitter" },
    // { icon: Linkedin, href: "#", label: "LinkedIn" },
    // { icon: Instagram, href: "#", label: "Instagram" },
    // { icon: Youtube, href: "#", label: "YouTube" },
    // { icon: Github, href: "#", label: "GitHub" },
    { icon: Mail, href: "mailto:paulof@pp7ias-portal.com.br", label: "E-mail: paulof@pp7ias-portal.com.br" },
    { icon: MessageCircle, href: "https://wa.me/5511914892836", label: "WhatsApp: +55 11 91489-2836" },
];

// Links legais funcionais
const legalLinks = [
    { label: "Termos de Uso", href: "/declaracoes" },
    { label: "Contato", href: "mailto:contato@pp7ias.com" },
];

// Recursos do portal
const resourceLinks = [
    { label: "Biblioteca de Prompts", href: "/explorar?b=biblioteca&tema=prompts" },
    { label: "Perguntas Frequentes", href: "/faq" },
];

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer id="footer" className="relative border-t border-border-glass bg-bg-secondary py-12 sm:py-16">
            <div className={portalContentClass}>
                {/* Top Section */}
                <div className="flex flex-col md:flex-row gap-8 mb-12">
                    {/* Brand */}
                    <div className="w-full">
                        <Link
                            href="/"
                            className="inline-block text-2xl sm:text-3xl font-bold bg-linear-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent mb-4"
                        >
                            PP7+IAS
                        </Link>
                        <p className="text-text-secondary text-sm max-w-md mb-6">
                            Menos ruído, mais clareza. Conhecimento e IA acessível para todos.
                        </p>

                        {/* Contact Links */}
                        <div className="flex flex-col gap-3">
                            {socialLinks.map(social => {
                                const Icon = social.icon;
                                return (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        target={social.href.startsWith("http") ? "_blank" : undefined}
                                        rel={social.href.startsWith("http") ? "noopener noreferrer" : undefined}
                                        className="flex items-center gap-3 text-text-secondary hover:text-foreground transition duration-200"
                                    >
                                        <span className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-brand-blue/20 transition duration-200">
                                            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </span>
                                        <span className="text-sm">{social.label}</span>
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Recursos */}
                    <div className="flex flex-col w-auto min-w-fit">
                        <h2 className="text-foreground font-semibold text-base mb-6 uppercase tracking-wide">Recursos</h2>
                        <ul className="space-y-3">
                            {resourceLinks.map(item => (
                                <li key={item.label}>
                                    <Link
                                        href={item.href}
                                        className="text-text-secondary hover:text-foreground transition-colors duration-200 text-sm whitespace-nowrap"
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div className="flex flex-col w-auto min-w-fit">
                        <h2 className="text-foreground font-semibold text-base mb-6 uppercase tracking-wide">Legal</h2>
                        <ul className="space-y-3">
                            {legalLinks.map(item => (
                                <li key={item.label}>
                                    <a
                                        href={item.href}
                                        className="text-text-secondary hover:text-foreground transition-colors duration-200 text-sm whitespace-nowrap"
                                    >
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="flex flex-col items-center justify-center gap-4 pt-8 border-t border-border-glass">
                    <p className="text-text-secondary text-sm text-center">
                        © {currentYear} PP7+IAS. Todos os direitos reservados.
                    </p>
                </div>
            </div>
        </footer>
    );
}
