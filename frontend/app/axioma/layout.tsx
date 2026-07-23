import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./axioma.css";

export const metadata: Metadata = {
    title: "Axioma IA · Mapeie sua jornada em Inteligência Artificial",
    description: "Diagnóstico comportamental e técnico em Inteligência Artificial. Receba um relatório personalizado da sua jornada em IA. Parte do portal PP7+IAS.",
    openGraph: {
        title: "PP7+IAS · Axioma IA — Diagnóstico Educacional",
        description: "Diagnóstico comportamental e técnico em Inteligência Artificial. Receba um relatório personalizado da sua jornada em IA. Parte do portal PP7+IAS.",
        type: "website",
    },
};

export default function AxiomaLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <Toaster position="top-right" />
        </>
    );
}
