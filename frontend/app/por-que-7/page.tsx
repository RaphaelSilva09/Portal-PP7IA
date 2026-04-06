"use client";

import Footer from "@/components/Footer";
import Navbar from "@/components/Header";
import { Accordion, AccordionGroup, NumberedList } from "@/components/ui";
import {
    conexoesFamiliares,
    grupo1PessoalFamilia,
    grupo2FeAbraamica,
    grupo3TradicoesMundiais,
    grupo4CienciaSaude,
    grupo5TecnologiaEducacao,
    grupo6NegociosMercados,
    grupo7CulturaMetodoPP7,
    heroData,
    introParagraphs,
    metodoEditorial,
    resumoExecutivo,
} from "@/data/porque7";
import DOMPurify from "isomorphic-dompurify";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

/**
 * Por Que o 7? Page
 *
 * Página dedicada explicando a metodologia PP7 baseada no número 7.
 * Estrutura hierárquica com 3 níveis de accordions (7×7 final).
 *
 * Princípios aplicados:
 * - Clean Architecture: Separação de dados (data/porque7.ts) e apresentação
 * - Composition: Accordions aninhados via composição
 * - SRP: Cada seção é independente e autocontida
 * - DRY: Reutilização de componentes Accordion/NumberedList
 */
export default function PorQue7Page() {
    return (
        <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-blue-500/20 via-purple-500/10 to-transparent dark:from-blue-500/15 dark:via-purple-500/8" />
            <Navbar />

            <main className="pt-20 pb-16">
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
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
                            {heroData.title}
                        </h1>
                        <p className="text-text-secondary text-base md:text-lg mb-6">{heroData.subtitle}</p>
                        <div className="inline-block bg-linear-to-r from-blue-600 to-purple-700 px-6 py-3 rounded-xl font-semibold text-sm md:text-base" style={{ color: "#fff" }}>
                            {heroData.badge}
                        </div>
                    </section>

                    {/* Intro Section */}
                    <section className="mb-8 bg-card/80 border border-border rounded-2xl p-6 md:p-8">
                        {introParagraphs.map((para, index) => (
                            <p
                                key={index}
                                className="text-text-secondary leading-relaxed mb-4 last:mb-0"
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(para) }}
                            />
                        ))}
                    </section>

                    {/* Main Content - Level 1 Accordions */}
                    <AccordionGroup>
                        {/* 1. Conexões Familiares */}
                        <Accordion variant="level1" title="Conexões Familiares" id="conexoes-familiares" isOpen={false} onToggle={() => {}}>
                            <NumberedList items={conexoesFamiliares} variant="dark" />
                        </Accordion>

                        {/* 2. Método Editorial */}
                        <Accordion variant="level1" title="Método Editorial" id="metodo-editorial" isOpen={false} onToggle={() => {}}>
                            <NumberedList items={metodoEditorial} variant="dark" />
                        </Accordion>

                        {/* 3. 7 para o Mundo - Com nested accordions */}
                        <Accordion variant="level1" title="7 para o Mundo" id="7-para-mundo" isOpen={false} onToggle={() => {}}>
                            <AccordionGroup>
                                {/* 3.1 Resumo Executivo */}
                                <Accordion variant="level2" title="Resumo Executivo" id="resumo-executivo" isOpen={false} onToggle={() => {}}>
                                    <NumberedList items={resumoExecutivo} variant="dark" />
                                </Accordion>

                                {/* 3.2 Edição Completa (7×7) - Com deeply nested accordions */}
                                <Accordion variant="level2" title="Edição Completa (7×7)" id="edicao-completa" isOpen={false} onToggle={() => {}}>
                                    <AccordionGroup>
                                        {/* Grupo 1: Pessoal e Família */}
                                        <Accordion
                                            variant="level3"
                                            title="① Pessoal e Família"
                                            id="grupo-1-pessoal"
                                            isOpen={false}
                                            onToggle={() => {}}
                                        >
                                            <NumberedList items={grupo1PessoalFamilia} variant="light" />
                                        </Accordion>

                                        {/* Grupo 2: Fé Abraâmica */}
                                        <Accordion
                                            variant="level3"
                                            title="② Fé Abraâmica"
                                            id="grupo-2-fe"
                                            isOpen={false}
                                            onToggle={() => {}}
                                        >
                                            <NumberedList items={grupo2FeAbraamica} variant="light" />
                                        </Accordion>

                                        {/* Grupo 3: Tradições Mundiais */}
                                        <Accordion
                                            variant="level3"
                                            title="③ Tradições Mundiais"
                                            id="grupo-3-tradicoes"
                                            isOpen={false}
                                            onToggle={() => {}}
                                        >
                                            <NumberedList items={grupo3TradicoesMundiais} variant="light" />
                                        </Accordion>

                                        {/* Grupo 4: Ciência e Saúde */}
                                        <Accordion
                                            variant="level3"
                                            title="④ Ciência e Saúde"
                                            id="grupo-4-ciencia"
                                            isOpen={false}
                                            onToggle={() => {}}
                                        >
                                            <NumberedList items={grupo4CienciaSaude} variant="light" />
                                        </Accordion>

                                        {/* Grupo 5: Tecnologia e Educação */}
                                        <Accordion
                                            variant="level3"
                                            title="⑤ Tecnologia e Educação"
                                            id="grupo-5-tech"
                                            isOpen={false}
                                            onToggle={() => {}}
                                        >
                                            <NumberedList items={grupo5TecnologiaEducacao} variant="light" />
                                        </Accordion>

                                        {/* Grupo 6: Negócios e Mercados */}
                                        <Accordion
                                            variant="level3"
                                            title="⑥ Negócios e Mercados"
                                            id="grupo-6-negocios"
                                            isOpen={false}
                                            onToggle={() => {}}
                                        >
                                            <NumberedList items={grupo6NegociosMercados} variant="light" />
                                        </Accordion>

                                        {/* Grupo 7: Cultura e Método PP7 */}
                                        <Accordion
                                            variant="level3"
                                            title="⑦ Cultura e Método PP7"
                                            id="grupo-7-cultura"
                                            isOpen={false}
                                            onToggle={() => {}}
                                        >
                                            <NumberedList items={grupo7CulturaMetodoPP7} variant="light" />
                                        </Accordion>
                                    </AccordionGroup>
                                </Accordion>
                            </AccordionGroup>
                        </Accordion>
                    </AccordionGroup>
                </div>
            </main>

            <Footer />
        </div>
    );
}
