import Footer from "@/components/Footer";
import Navbar from "@/components/Header";
import { portalContentClass } from "@/lib/layout";
import { ArrowLeft, Award, Target } from "lucide-react";
import Link from "next/link";

export default function AutorPage() {
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
                    <section className="text-center mb-10">
                        <div className="inline-block bg-gradient-to-r from-brand-blue to-brand-purple px-4 py-1.5 rounded-full text-sm font-semibold mb-4" style={{ color: "#fff" }}>
                            PP7+IAS
                        </div>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                            Paulo Periquito
                        </h1>
                        <p className="text-text-secondary text-base md:text-lg">
                            Mentor, Investidor Anjo e Advisor
                        </p>
                    </section>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Trajectory Card */}
                        <div className="glass-card p-8 h-full border-l-4 border-l-brand-blue/50 hover:border-l-brand-blue transition-colors duration-300">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 rounded-lg bg-brand-blue/10 flex items-center justify-center">
                                    <Award className="w-5 h-5 text-brand-blue" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Trajetória</h3>
                            </div>
                            <div className="text-text-secondary leading-relaxed space-y-1">
                                <p>
                                    Engenheiro, com formação em TI, e <span className="text-white font-bold">4+ décadas</span>{" "}
                                    de carreira <span className="text-white font-bold">C-Level</span> em RH, PE, CFO, operações,
                                    varejo e inovação.
                                </p>
                                <p>
                                    <span className="text-brand-blue font-bold">Presidente</span> da{" "}
                                    <span className="text-white italic">Alcoa</span> México e{" "}
                                    <span className="text-brand-blue font-bold">COO</span> da empresa na América Latina.
                                </p>
                                <p>
                                    <span className="text-brand-blue font-bold">Presidente</span> da{" "}
                                    <span className="text-white italic">Whirlpool</span> na América Latina, e depois{" "}
                                    <span className="text-brand-blue font-bold">Presidente Internacional</span> — LatAm, Ásia,
                                    Europa.
                                </p>
                            </div>
                        </div>

                        {/* Focus Card */}
                        <div className="glass-card p-8 h-full border-l-4 border-l-brand-green/50 hover:border-l-brand-green transition-colors duration-300">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 rounded-lg bg-brand-green/10 flex items-center justify-center">
                                    <Target className="w-5 h-5 text-brand-green" />
                                </div>
                                <h3 className="text-xl font-bold text-white">Foco Atual</h3>
                            </div>
                            <p className="text-2xl font-semibold text-white mb-4">Família, Saúde e Legado</p>
                            <p className="text-text-secondary leading-relaxed">
                                Formando <span className="text-brand-green font-medium">líderes</span> e{" "}
                                <span className="text-brand-green font-medium">profissionais</span> unindo gestão humana ao
                                potencial da <span className="text-white font-medium">IA</span>.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
