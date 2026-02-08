import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SearchModalProvider } from "@/context/SearchModalContext";
import { FirstVisitModalProvider } from "@/context/FirstVisitModalContext";
import { AuthModalProvider } from "@/context/AuthModalContext";
import ModalsProvider from "@/components/ModalsProvider";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800", "900"],
    variable: "--font-inter",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Pp7+ias Portal - Curadoria Humana para Líderes e Inovadores",
    description: "Menos ruído, mais clareza. Conhecimento e IA acessível para todos.",
    keywords: ["curadoria", "inteligência artificial", "IA", "liderança", "inovação", "newsletter", "tecnologia"],
    authors: [{ name: "Pp7ia" }],
    openGraph: {
        title: "Pp7+ias Portal - Curadoria Humana",
        description: "Menos ruído, mais clareza. Conhecimento e IA acessível para todos.",
        type: "website",
        locale: "pt_BR",
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    themeColor: "#111111",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR" className={inter.variable} suppressHydrationWarning>
            <body className="antialiased bg-bg-primary text-text-primary font-sans" suppressHydrationWarning>
                <SearchModalProvider>
                    <AuthModalProvider>
                        <FirstVisitModalProvider>
                            {children}
                            <Suspense fallback={null}>
                                <ModalsProvider />
                            </Suspense>
                        </FirstVisitModalProvider>
                    </AuthModalProvider>
                </SearchModalProvider>
                <Analytics />
            </body>
        </html>
    );
}
