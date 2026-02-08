"use client";

import { Briefcase } from "lucide-react";

export default function Equipe() {
    return (
        <section className="px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* ============================================
                EQUIPE
                ============================================ */}
                <div className="mb-8">
                    <div className="group relative overflow-hidden rounded-3xl p-6 sm:p-8 transition-all duration-300 pb-0">
                        {/* Main container: flex-row with space-between */}
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                            {/* Left side: Icon + Title + Description */}
                            <div className="flex flex-col items-center md:items-start gap-4 md:gap-6">
                                {/* Icon */}
                                <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center">
                                    <Briefcase className="w-8 h-8 text-purple-400" />
                                </div>

                                {/* Title + Description */}
                                <div className="text-center md:text-left">
                                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2 tracking-tight">Equipe</h2>
                                    <p className="text-gray-400 text-base sm:text-lg tracking-tight">
                                        Criado por <span className="text-white font-medium">Paulo Periquito</span>, com
                                        assistência técnica de{" "}
                                        <span className="text-white font-medium">Raphael Silva</span> e{" "}
                                        <span className="text-white font-medium">Lucas Periquito Costa</span> (estudantes
                                        de Ciências/Engenharia da Computação).
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
