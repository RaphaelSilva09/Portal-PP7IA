"use client";

import {
  Sparkles,
  Mail,
  Search,
  Library,
  Users,
  Cpu,
  Scale,
  ArrowRight,
} from "lucide-react";

/**
 * BentoGrid Component - Layout "1x3x3 Hierarchy"
 * 7 itens organizados em 3 linhas hierárquicas
 * Regra de Negócio: O número 7
 */
export default function BentoGrid() {
  return (
    <section id="blocos" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-block px-3 py-1 text-xs font-semibold text-brand-blue bg-brand-blue/10 rounded-full mb-4 tracking-tight">
            ECOSSISTEMA
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            7 Blocos de{" "}
            <span className="bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">
              Conhecimento
            </span>
          </h2>
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto tracking-tight">
            Cada bloco foi projetado para entregar valor específico e complementar.
          </p>
        </div>

        {/* Bento Grid - 3 Columns Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          
          {/* ============================================
              LINHA 1 - HERO (Manchete)
              1 Card - col-span-3 - min-h-[400px]
              ============================================ */}
          <div className="col-span-1 md:col-span-3 group relative overflow-hidden rounded-3xl min-h-[400px] cursor-pointer transition-all duration-500 hover:scale-[1.01]">
            {/* Gradient Background */}
            <div 
              className="absolute inset-0"
              style={{
                background: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0, 129, 242, 0.3), transparent), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(99, 102, 241, 0.2), transparent), linear-gradient(180deg, #0a0a0f 0%, #111118 100%)",
              }}
            />
            
            {/* Subtle Border */}
            <div className="absolute inset-0 rounded-3xl border border-white/10" />
            
            {/* Shimmer on Hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
              <div className="absolute inset-0 shimmer" />
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-between p-8 sm:p-12">
              {/* Top */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full mb-6">
                  <Sparkles className="w-4 h-4 text-brand-blue" />
                  <span className="text-xs font-medium text-gray-300 tracking-tight">BLOCO PRINCIPAL</span>
                </div>
              </div>

              {/* Center */}
              <div className="max-w-2xl">
                <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight leading-tight">
                  Curadoria Humana de{" "}
                  <span className="bg-gradient-to-r from-brand-blue via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Inteligência Artificial
                  </span>
                </h3>
                <p className="text-gray-400 text-lg sm:text-xl leading-relaxed tracking-tight">
                  Traduzimos e simplificamos o que é complexo, com menos ruído e mais clareza. 
                  Para líderes, inovadores e profissionais estratégicos.
                </p>
              </div>

              {/* Bottom */}
              <div className="flex items-center gap-4 mt-8">
                <button className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/10 rounded-full text-white font-medium transition-all duration-300 group/btn">
                  <span className="tracking-tight">Explorar</span>
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* ============================================
              LINHA 2 - CORE PRODUCTS (Corpo)
              3 Cards - col-span-1 cada - ~280px
              ============================================ */}
          
          {/* Card: Newsletter */}
          <div className="col-span-1 group relative overflow-hidden rounded-3xl min-h-[280px] bg-white/5 backdrop-blur-sm border border-white/10 cursor-pointer transition-all duration-300 hover:bg-white/[0.07] hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(0,129,242,0.15)]">
            <div className="relative z-10 h-full flex flex-col p-6 sm:p-8">
              {/* Icon */}
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Mail className="w-6 h-6 text-blue-400" />
              </div>

              {/* Content */}
              <div className="mt-auto">
                <span className="text-xs font-mono text-gray-500 tracking-tight">BLOCO 01</span>
                <h4 className="text-xl sm:text-2xl font-bold text-white mt-1 mb-2 tracking-tight">
                  Newsletter
                </h4>
                <p className="text-gray-400 text-sm sm:text-base tracking-tight">
                  Análises aprofundadas entregues diretamente no seu email toda semana.
                </p>
              </div>

              {/* Accent Line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </div>
          </div>

          {/* Card: Radar */}
          <div className="col-span-1 group relative overflow-hidden rounded-3xl min-h-[280px] bg-white/5 backdrop-blur-sm border border-white/10 cursor-pointer transition-all duration-300 hover:bg-white/[0.07] hover:border-orange-500/30 hover:shadow-[0_0_30px_rgba(249,115,22,0.15)]">
            <div className="relative z-10 h-full flex flex-col p-6 sm:p-8">
              {/* Icon */}
              <div className="w-12 h-12 rounded-2xl bg-orange-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Search className="w-6 h-6 text-orange-400" />
              </div>

              {/* Content */}
              <div className="mt-auto">
                <span className="text-xs font-mono text-gray-500 tracking-tight">BLOCO 02</span>
                <h4 className="text-xl sm:text-2xl font-bold text-white mt-1 mb-2 tracking-tight">
                  Radar
                </h4>
                <p className="text-gray-400 text-sm sm:text-base tracking-tight">
                  Monitoramento de sinais e tendências emergentes do mercado de IA.
                </p>
              </div>

              {/* Accent Line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-yellow-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </div>
          </div>

          {/* Card: Biblioteca */}
          <div className="col-span-1 group relative overflow-hidden rounded-3xl min-h-[280px] bg-white/5 backdrop-blur-sm border border-white/10 cursor-pointer transition-all duration-300 hover:bg-white/[0.07] hover:border-purple-500/30 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]">
            <div className="relative z-10 h-full flex flex-col p-6 sm:p-8">
              {/* Icon */}
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Library className="w-6 h-6 text-purple-400" />
              </div>

              {/* Content */}
              <div className="mt-auto">
                <span className="text-xs font-mono text-gray-500 tracking-tight">BLOCO 03</span>
                <h4 className="text-xl sm:text-2xl font-bold text-white mt-1 mb-2 tracking-tight">
                  Biblioteca
                </h4>
                <p className="text-gray-400 text-sm sm:text-base tracking-tight">
                  Acervo curado de prompts, ferramentas e recursos práticos.
                </p>
              </div>

              {/* Accent Line */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </div>
          </div>

          {/* ============================================
              LINHA 3 - SUPPORT/META (Base)
              3 Cards - col-span-1 cada - ~140px
              ============================================ */}
          
          {/* Card: Comunidade */}
          <div className="col-span-1 group relative overflow-hidden rounded-2xl min-h-[140px] bg-black/20 border border-white/5 cursor-pointer transition-all duration-300 hover:bg-black/30 hover:border-white/10">
            <div className="relative z-10 h-full flex items-center gap-4 p-5 sm:p-6">
              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-5 h-5 text-emerald-400" />
              </div>

              {/* Content */}
              <div className="min-w-0">
                <span className="text-[10px] font-mono text-gray-600 tracking-tight">BLOCO 04</span>
                <h4 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                  Comunidade
                </h4>
                <p className="text-gray-500 text-xs tracking-tight truncate">
                  Rede de profissionais conectados
                </p>
              </div>
            </div>
          </div>

          {/* Card: Stack */}
          <div className="col-span-1 group relative overflow-hidden rounded-2xl min-h-[140px] bg-black/20 border border-white/5 cursor-pointer transition-all duration-300 hover:bg-black/30 hover:border-white/10">
            <div className="relative z-10 h-full flex items-center gap-4 p-5 sm:p-6">
              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Cpu className="w-5 h-5 text-cyan-400" />
              </div>

              {/* Content */}
              <div className="min-w-0">
                <span className="text-[10px] font-mono text-gray-600 tracking-tight">BLOCO 05</span>
                <h4 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                  Stack
                </h4>
                <p className="text-gray-500 text-xs tracking-tight truncate">
                  Tecnologias e ferramentas utilizadas
                </p>
              </div>
            </div>
          </div>

          {/* Card: Sobre/Legal */}
          <div className="col-span-1 group relative overflow-hidden rounded-2xl min-h-[140px] bg-black/20 border border-white/5 cursor-pointer transition-all duration-300 hover:bg-black/30 hover:border-white/10">
            <div className="relative z-10 h-full flex items-center gap-4 p-5 sm:p-6">
              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-gray-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Scale className="w-5 h-5 text-gray-400" />
              </div>

              {/* Content */}
              <div className="min-w-0">
                <span className="text-[10px] font-mono text-gray-600 tracking-tight">BLOCO 06</span>
                <h4 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                  Sobre & Legal
                </h4>
                <p className="text-gray-500 text-xs tracking-tight truncate">
                  Termos, privacidade e informações
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Note - 7º elemento implícito */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 text-xs tracking-tight">
            <span className="text-brand-blue">7</span> blocos interconectados para sua jornada em IA
          </p>
        </div>
      </div>
    </section>
  );
}
