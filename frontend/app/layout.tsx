import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800", "900"],
    variable: "--font-inter",
    display: "swap",
});

export const metadata: Metadata = {
    title: "Pp7ia Portal - Curadoria Humana para Líderes e Inovadores",
    description:
        "Traduzimos e simplificamos o que é complexo, com menos ruído e mais clareza. Curadoria humana de IA para líderes, inovadores e profissionais estratégicos.",
    keywords: ["curadoria", "inteligência artificial", "IA", "liderança", "inovação", "newsletter", "tecnologia"],
    authors: [{ name: "Pp7ia" }],
    openGraph: {
        title: "Pp7ia Portal - Curadoria Humana",
        description: "Menos ruído. Mais clareza.",
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
        <html lang="pt-BR" className={inter.variable}>
            <body className="antialiased bg-bg-primary text-text-primary font-sans">{children}</body>
        </html>
    );
}
