export default function InstructionsBanner() {
    return (
        <section className="relative py-8 sm:py-12 md:pt-4 md:pb-0 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="glass-card p-6 sm:p-8 bg-brand-blue/5 border-brand-blue/20 shadow-glow-blue-sm">
                    {/* Title */}
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-center">
                        📋 Instruções de Uso
                    </h2>

                    {/* Instructions List */}
                    <div className="space-y-4 text-sm sm:text-base md:text-lg text-text-secondary leading-relaxed">
                        {/* Instruction 1 - Como se inscrever */}
                        <div className="flex gap-3 items-start">
                            <span className="text-brand-blue font-bold flex-shrink-0">•</span>
                            <p>
                                <span className="text-brand-blue font-medium">Como se inscrever:</span> Clique em{" "}
                                <span className="text-brand-blue font-medium">"Quero Fazer Parte"</span> ou{" "}
                                <span className="text-brand-blue font-medium">"Entrar"</span> no topo da página.
                                Preencha nome, e-mail, celular e crie uma senha.
                                Escolha como quer receber atualizações (e-mail e/ou WhatsApp).
                                Após o cadastro, confirme seu e-mail clicando no link enviado (verifique a pasta de spam).
                            </p>
                        </div>

                        {/* Instruction 2 - Já é inscrito */}
                        <div className="flex gap-3 items-start">
                            <span className="text-brand-blue font-bold flex-shrink-0">•</span>
                            <p>
                                <span className="text-brand-blue font-medium">Já é inscrito?</span> Use o botão{" "}
                                <span className="text-brand-blue font-medium">"Entrar"</span> no topo para acessar sua conta com e-mail e senha.
                            </p>
                        </div>

                        {/* Instruction 3 - Ajuda */}
                        <div className="flex gap-3 items-start">
                            <span className="text-brand-blue font-bold flex-shrink-0">•</span>
                            <p>
                                Se algo estiver errado, precisar de ajuda ou tiver sugestões,{" "}
                                <span className="text-text-primary font-medium">nos envie</span>.
                            </p>
                        </div>

                        {/* Instruction 4 - Instruções por bloco */}
                        <div className="flex gap-3 items-start">
                            <span className="text-brand-blue font-bold flex-shrink-0">•</span>
                            <p>
                                Na entrada de cada bloco tem{" "}
                                <span className="text-brand-blue font-medium">instruções específicas de uso</span>.
                                Acesse quando quiser. Leia apenas o que fizer sentido para você.
                            </p>
                        </div>

                        {/* Instruction 5 - Atualizações */}
                        <div className="flex gap-3 items-start">
                            <span className="text-brand-blue font-bold flex-shrink-0">•</span>
                            <p>
                                <span className="text-brand-blue font-medium">Atualizações frequentes</span>, avisadas por e-mail ou WhatsApp.
                            </p>
                        </div>
                    </div>

                    {/* Closing Message */}
                    <p className="mt-6 text-center text-base sm:text-lg md:text-xl text-text-primary font-medium">
                        Muito obrigado e boa leitura!
                    </p>
                </div>
            </div>
        </section>
    );
}
