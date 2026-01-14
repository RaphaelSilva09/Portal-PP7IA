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

// 7 links legais/informacionais
const legalLinks = [
    { label: "Termos de Uso", href: "#termos" },
    { label: "Privacidade", href: "#privacidade" },
    { label: "Cookies", href: "#cookies" },
    { label: "FAQ", href: "#faq" },
    { label: "Suporte", href: "#suporte" },
    { label: "API", href: "#api" },
    { label: "Status", href: "#status" },
];

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-bg-secondary border-t border-border-glass">
            <div className="max-w-7xl mx-auto">
                {/* Top Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-12">
                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <a
                            href="/"
                            className="inline-block text-2xl sm:text-3xl font-bold bg-linear-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent mb-4"
                        >
                            PP7IA
                        </a>
                        <p className="text-text-secondary text-base sm:text-2xl max-w-md mb-6">
                            Traduzimos e simplificamos o que é complexo, com menos ruído e mais clareza. Curadoria
                            humana de IA para líderes e inovadores.
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

                    {/* Links */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Navegação</h4>
                        <ul className="space-y-2">
                            {["Manifesto", "Radar", "Biblioteca", "Newsletter"].map(item => (
                                <li key={item}>
                                    <a
                                        href={`#${item.toLowerCase()}`}
                                        className="text-text-secondary hover:text-white transition-colors duration-200 text-base sm:text-2xl"
                                    >
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Legal</h4>
                        <ul className="space-y-2">
                            {legalLinks.slice(0, 4).map(item => (
                                <li key={item.label}>
                                    <a
                                        href={item.href}
                                        className="text-text-secondary hover:text-white transition-colors duration-200 text-base sm:text-2xl"
                                    >
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Newsletter CTA */}
                <div className="glass-card rounded-2xl p-6 sm:p-8 mb-12">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div>
                            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                                Receba nossa curadoria semanal
                            </h3>
                            <p className="text-text-secondary text-base sm:text-2xl">
                                7 insights essenciais toda semana, direto no seu email.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
                            <input
                                type="email"
                                placeholder="seu@email.com"
                                className="flex-1 sm:w-64 px-4 py-3 bg-bg-primary border border-border-glass rounded-xl text-white placeholder:text-text-secondary focus:outline-none focus:border-brand-blue transition-colors touch-target"
                            />
                            <button className="px-6 py-3 bg-linear-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-glow-green hover:scale-105 active:scale-95 transition-transform duration-200 touch-target whitespace-nowrap">
                                Inscrever-se
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="flex flex-col items-center justify-center gap-4 pt-8 border-t border-border-glass">
                    <p className="text-text-secondary text-base sm:text-2xl text-center">
                        © {currentYear} PP7IA. Todos os direitos reservados.
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
