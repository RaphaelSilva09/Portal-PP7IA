import React from "react";
import { ArrowRight, FileText } from "lucide-react";

interface PdfButtonProps {
    href: string;
    title: string;
    description: string;
    delay?: string;
}

export default function PdfButton({ href, title, description, delay = "0s" }: PdfButtonProps) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative w-auto sm:w-auto flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 bg-brand-purple/10 border border-brand-purple/30 hover:bg-brand-purple/20 hover:border-brand-purple/50 rounded-2xl transition-all duration-300 touch-target hover:scale-105 hover:shadow-[0_0_30px_rgba(99,102,241,0.3)]"
        >
            {/* Pulse ring effect */}
            <span
                className="absolute inset-0 rounded-2xl animate-pulse-ring border-2 border-brand-purple/40"
                style={{ animationDelay: delay }}
            />

            <div className="relative w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl bg-brand-purple/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="relative w-5 h-5 md:w-6 md:h-6 text-brand-purple" />
            </div>
            <div className="text-left">
                <span className="block text-sm sm:text-base font-bold text-white">{title}</span>
                <span className="block text-xs text-brand-purple/80">{description}</span>
            </div>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-brand-purple group-hover:translate-x-1 transition-all" />
        </a>
    );
}
