import Footer from "@/components/Footer";
import Navbar from "@/components/Header";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const sections = [
    {
        number: "1.",
        title: "NATUREZA",
        body: "O PP7+IAS é um projeto pessoal, não-jornalístico e sem fins lucrativos, criado e mantido por Paulo Periquito. Todo o conteúdo publicado — textos, análises, resumos, sínteses e comentários — representa exclusivamente a opinião pessoal do autor, não constituindo reportagem, notícia verificada ou produto editorial certificado.",
    },
    {
        number: "2.",
        title: "ISENÇÃO TOTAL",
        body: "Nenhum conteúdo do PP7+IAS constitui, direta ou indiretamente, recomendação financeira, jurídica, médica, psicológica ou de qualquer outra natureza profissional regulamentada. O leitor é inteiramente responsável pelas decisões que tomar com base nas informações aqui disponibilizadas. Em caso de dúvida, consulte profissionais habilitados.",
    },
    {
        number: "3.",
        title: "PRECISÃO",
        body: "Embora o autor empregue esforço razoável para garantir acuracidade nas informações publicadas, o PP7+IAS não oferece qualquer garantia de completude, atualidade ou ausência de erros. Informações podem estar desatualizadas no momento da leitura. Fontes primárias e especializadas devem sempre ser consultadas para decisões relevantes.",
    },
    {
        number: "4.",
        title: "IAs UTILIZADAS",
        body: "O PP7+IAS utiliza ferramentas de Inteligência Artificial como apoio editorial, incluindo — mas não se limitando a — Claude (Anthropic), ChatGPT (OpenAI), Gemini (Google), Copilot (Microsoft) e outras disponíveis ao autor. O uso dessas ferramentas é instrumental: a curadoria, seleção, revisão e responsabilidade pelo conteúdo final permanecem exclusivamente com o autor humano.",
    },
    {
        number: "5.",
        title: "PRIVACIDADE LGPD",
        body: "Os dados pessoais fornecidos pelos membros (nome, e-mail, WhatsApp) são utilizados exclusivamente para comunicações do PP7+IAS, sem compartilhamento com terceiros. Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), qualquer membro pode solicitar a exclusão de seus dados a qualquer momento — o pedido será atendido em até 48 horas úteis mediante solicitação pelos canais oficiais de contato.",
    },
    {
        number: "6.",
        title: "FILOSOFIA",
        body: "O método PP7 se orienta pelo princípio de simplificar o que é complexo, nunca de reinventar o que já existe. O portal parte sempre de fontes primárias, estudos e especialistas reconhecidos, agregando organização, síntese e perspectiva — não originalidade forçada. A curadoria honesta vale mais do que a novidade vazia.",
    },
    {
        number: "7.",
        title: "DIREITOS AUTORAIS",
        body: "Todo o conteúdo original produzido no PP7+IAS — textos, estruturas, metodologias e compilações — é de autoria de Paulo Periquito e protegido pela legislação brasileira de direitos autorais. O compartilhamento é encorajado, desde que feito com devida atribuição ao autor e ao portal. Reprodução comercial sem autorização expressa é vedada.",
    },
    {
        number: "8.",
        title: "ALTERAÇÕES",
        body: "Estes termos e declarações podem ser atualizados pelo autor a qualquer momento, sem aviso prévio. A versão mais recente estará sempre disponível nesta página do portal. A continuidade de uso do portal após alterações implica aceitação dos novos termos.",
    },
];

export default function DeclaracoesPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Navbar />

            <main className="pb-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Back Link */}
                    <Link
                        href="/"
                        className="portal-back-link inline-flex items-center gap-2 text-text-secondary mb-6 transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span>Voltar ao Portal</span>
                    </Link>

                    {/* Hero Section */}
                    <section className="text-center mb-12 pb-8 border-b border-border-glass">
                        <div className="inline-block bg-gradient-to-r from-brand-blue to-brand-purple px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
                            PP7+IAS
                        </div>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">
                            DISCLOSURES LEGAIS & COMPLIANCE
                        </h1>
                        <p className="text-text-secondary text-base md:text-lg">
                            Iniciativa pessoal, independente, sem fins lucrativos | Atualização: 21.Jan.2026
                        </p>
                    </section>

                    {/* Sections */}
                    <div className="space-y-4 mb-10">
                        {sections.map(section => (
                            <div
                                key={section.number}
                                className="bg-bg-secondary/50 border border-border-glass rounded-2xl p-6"
                            >
                                <div className="flex items-baseline gap-3 mb-3">
                                    <span className="text-brand-blue font-mono font-bold text-lg">
                                        {section.number}
                                    </span>
                                    <span className="text-foreground font-semibold tracking-wide">
                                        {section.title}
                                    </span>
                                </div>
                                <p className="text-text-secondary leading-relaxed">{section.body}</p>
                            </div>
                        ))}
                    </div>

                    {/* Contact Block */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <p className="text-text-secondary text-xs font-mono uppercase tracking-widest mb-4">
                            CONTATO
                        </p>
                        <div className="space-y-1 text-text-secondary text-sm">
                            <p>
                                <span className="text-white/50 mr-2">Portal</span>
                                pp7ias-portal.com.br
                            </p>
                            <p>
                                <span className="text-white/50 mr-2">WhatsApp</span>
                                +55 11 91489-2836
                            </p>
                            <p>
                                <span className="text-white/50 mr-2">E-mail</span>
                                paulof@pp7ias-portal.com.br / oliveirapfmop@gmail.com
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
