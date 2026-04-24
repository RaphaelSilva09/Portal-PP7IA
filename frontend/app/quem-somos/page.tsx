import Footer from "@/components/Footer";
import Navbar from "@/components/Header";
import { portalContentClass } from "@/lib/layout";
import { ArrowLeft, Briefcase, Users } from "lucide-react";
import Link from "next/link";

export default function QuemSomosPage() {
    return (
        <div className="min-h-screen bg-bg-primary text-white">
            <Navbar />

            <main className="pt-20 pb-16">
                <div className={portalContentClass}>
                    {/* Back Link */}
                    <Link
                        href="/"
                        className="portal-back-link inline-flex items-center gap-2 text-text-secondary mb-6 transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span>Voltar ao Portal</span>
                    </Link>

                    {/* Hero Section */}
                    <section className="mb-10">
                        <div className="relative overflow-hidden rounded-3xl">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/8 via-purple-500/5 to-blue-500/8" />
                            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 blur-3xl rounded-full" />
                            <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-500/5 blur-3xl rounded-full" />
                            <div className="absolute inset-0 rounded-3xl border border-blue-500/15" />

                            <div className="relative z-10 p-8 lg:p-10 text-center">
                                <div className="inline-block bg-gradient-to-r from-brand-blue to-brand-purple px-4 py-1.5 rounded-full text-sm font-semibold mb-4" style={{ color: "#fff" }}>
                                    PP7+IAS
                                </div>
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                                    Quem Somos{" "}
                                    <span className="bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">
                                        Nós
                                    </span>
                                </h1>
                                <p className="text-gray-300 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed mb-2">
                                    Plataforma de curadoria que combina{" "}
                                    <span className="text-brand-blue font-semibold">40+ anos de liderança executiva</span> com{" "}
                                    <span className="text-brand-blue font-semibold">7 inteligências artificiais</span>
                                </p>
                                <p className="text-gray-400 text-base max-w-xl mx-auto">
                                    Conteúdo organizado em 7 blocos principais, publicando só o que foi testado e funciona
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Team Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 xl:gap-3">
                        {/* Card: Criador */}
                        <div className="group relative h-full overflow-hidden rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 p-5 xl:p-4 hover:bg-white/[0.07] hover:border-purple-500/30 transition-all duration-300">
                            <div className="mb-3">
                                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <Briefcase className="w-6 h-6 text-purple-400" />
                                </div>
                            </div>
                            <div>
                                <span className="text-xs text-purple-400 font-semibold uppercase tracking-wider mb-1.5 block">
                                    Criador
                                </span>
                                <h3 className="text-base font-bold text-white mb-2 leading-snug">
                                    Paulo Periquito
                                </h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    Mentor, investidor-anjo e advisor com 40+ anos de liderança.
                                </p>
                            </div>
                        </div>

                        {/* Card: Assistente Técnico 1 */}
                        <div className="group relative h-full overflow-hidden rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 p-5 xl:p-4 hover:bg-white/[0.07] hover:border-blue-500/30 transition-all duration-300">
                            <div className="mb-3">
                                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <Users className="w-6 h-6 text-blue-400" />
                                </div>
                            </div>
                            <div>
                                <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-1.5 block">
                                    Assistência Técnica
                                </span>
                                <h3 className="text-base font-bold text-white mb-2 leading-snug">
                                    Raphael Silva
                                </h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    Aluno de Ciência da Computação. Desenvolvimento técnico.
                                </p>
                            </div>
                        </div>

                        {/* Card: Assistente Técnico 2 */}
                        <div className="group relative h-full overflow-hidden rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 p-5 xl:p-4 hover:bg-white/[0.07] hover:border-blue-500/30 transition-all duration-300">
                            <div className="mb-3">
                                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <Users className="w-6 h-6 text-blue-400" />
                                </div>
                            </div>
                            <div>
                                <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-1.5 block">
                                    Assistência Técnica
                                </span>
                                <h3 className="text-base font-bold text-white mb-2 leading-snug">
                                    Lucas Periquito Costa
                                </h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    Aluno de Engenharia da Computação. Suporte técnico.
                                </p>
                            </div>
                        </div>

                        {/* Card: Assistente Técnico 3 */}
                        <div className="group relative h-full overflow-hidden rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 p-5 xl:p-4 hover:bg-white/[0.07] hover:border-blue-500/30 transition-all duration-300">
                            <div className="mb-3">
                                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <Users className="w-6 h-6 text-blue-400" />
                                </div>
                            </div>
                            <div>
                                <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-1.5 block">
                                    Assistência Técnica
                                </span>
                                <h3 className="text-base font-bold text-white mb-2 leading-snug">
                                    Luiza Santana
                                </h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    Aluna de Sistemas de Informação. Curadoria de conteúdo.
                                </p>
                            </div>
                        </div>

                        {/* Card: Assistente Técnico 4 */}
                        <div className="group relative h-full overflow-hidden rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 p-5 xl:p-4 hover:bg-white/[0.07] hover:border-blue-500/30 transition-all duration-300">
                            <div className="mb-3">
                                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <Users className="w-6 h-6 text-blue-400" />
                                </div>
                            </div>
                            <div>
                                <span className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-1.5 block">
                                    Assistência Técnica
                                </span>
                                <h3 className="text-base font-bold text-white mb-2 leading-snug">
                                    Davi Ferreira
                                </h3>
                                <p className="text-sm text-gray-400 leading-relaxed">
                                    Aluno de Engenharia da Computação. Apoio técnico.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
