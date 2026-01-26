"use client";

import { Github, Instagram, Linkedin, Mail, Twitter, Youtube } from "lucide-react";

// 7 links de redes sociais seguindo a regra de negócio
const socialLinks = [
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Youtube, href: "#", label: "YouTube" },
    { icon: Github, href: "#", label: "GitHub" },
    { icon: Mail, href: "#", label: "Email" },
];

// Links legais funcionais
const legalLinks = [
    { label: "Termos de Uso", href: "/PP7IAS_Disclosures_Legal_Compliance.pdf" },
    { label: "Contato", href: "mailto:contato@pp7ias.com" },
];

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-bg-secondary border-t border-border-glass">
            <div className="max-w-7xl mx-auto">
                {/* Top Section */}
                <div className="flex flex-col md:flex-row gap-8 mb-12">
                    {/* Brand */}
                    <div className="w-full">
                        <a
                            href="/"
                            className="inline-block text-2xl sm:text-3xl font-bold bg-linear-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent mb-4"
                        >
                            PP7+IAS
                        </a>
                        <p className="text-text-secondary text-sm max-w-md mb-6">
                            Menos ruído, mais clareza. Conhecimento e IA acessível para todos.
                        </p>

                        {/* Social Links - 7 items */}
                        <div className="flex flex-wrap gap-3">
                            {socialLinks.map(social => {
                                const Icon = social.icon;
                                return (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        aria-label={social.label}
                                        className="w-10 h-10 rounded-full glass flex items-center justify-center text-text-secondary hover:text-white hover:bg-brand-blue/20 transition-all duration-200 touch-target"
                                    >
                                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>

                    {/* Legal */}
                    <div className="flex flex-col w-auto min-w-fit">
                        <h4 className="text-white font-semibold text-base mb-6 uppercase tracking-wide">Legal</h4>
                        <ul className="space-y-3">
                            {legalLinks.map(item => (
                                <li key={item.label}>
                                    <a
                                        href={item.href}
                                        className="text-text-secondary hover:text-white transition-colors duration-200 text-sm whitespace-nowrap"
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

                {/* Credits */}
                <div className="mt-8 text-center">
                    <p className="text-text-secondary/50 text-xs flex items-center justify-center gap-1">
                        Feito por Raphael Silva
                    </p>
                </div>
            </div>
        </footer>
    );
}
