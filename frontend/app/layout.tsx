import ModalsProvider from "@/components/ModalsProvider";
import PortalTypographyEffect from "@/components/PortalTypographyEffect";
import Providers from "@/components/Providers";
import UserActivityTracker from "@/components/UserActivityTracker";
import { AuthProvider } from "@/context/AuthContext";
import { AuthModalProvider } from "@/context/AuthModalContext";
import { FirstVisitModalProvider } from "@/context/FirstVisitModalContext";
import { ForgotPasswordModalProvider } from "@/context/ForgotPasswordModalContext";
import { InviteModalProvider } from "@/context/InviteModalContext";
import { OnboardingProvider } from "@/context/OnboardingContext";
import ReferralCapture from "@/components/ReferralCapture";
import { SearchModalProvider } from "@/context/SearchModalContext";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif, Lora } from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800", "900"],
    variable: "--font-inter",
    display: "swap",
});

const instrumentSerif = Instrument_Serif({
    subsets: ["latin"],
    weight: ["400"],
    variable: "--font-instrument-serif",
    display: "swap",
});

const lora = Lora({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    variable: "--font-lora",
    display: "swap",
});


export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000"),
    title: "PP7+IAS — Menos ruído. Mais clareza.",
    description: "Curadoria editorial sobre liderança, gestão de pessoas e inteligência artificial. 7 blocos, 7 IAs — para quem decide.",
    keywords: ["curadoria", "liderança", "gestão de pessoas", "inteligência artificial", "IA", "newsletter", "editorial"],
    authors: [{ name: "Paulo Periquito" }],
    openGraph: {
        title: "PP7+IAS — Menos ruído. Mais clareza.",
        description: "Curadoria editorial sobre liderança, gestão de pessoas e inteligência artificial. 7 blocos, 7 IAs — para quem decide.",
        type: "website",
        locale: "pt_BR",
        images: [
            "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/d2e4d955-2d67-4a2d-aa19-72db2ce1f778/id-preview-cb16b84c--0228cf06-7a9e-4e69-8dd8-fde2ea37a40c.lovable.app-1779132240293.png",
        ],
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    themeColor: [
        { media: "(prefers-color-scheme: dark)", color: "#111111" },
        { media: "(prefers-color-scheme: light)", color: "#eef4ff" },
    ],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // Só carrega Analytics se estiver em produção E habilitado no Vercel
    const showAnalytics = process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_VERCEL_ANALYTICS === "true";

    return (
        <html lang="pt-BR" className={`${inter.variable} ${lora.variable} ${instrumentSerif.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
            <head>
                <link rel="stylesheet" href="/api/theme-css" />
                {process.env.NEXT_PUBLIC_AUTH_DEBUG === 'true' && (
                    <>
                        <Script src="https://cdn.jsdelivr.net/npm/eruda@3/eruda.js" strategy="afterInteractive" />
                        <Script id="eruda-init" strategy="afterInteractive">
                            {`window.addEventListener('load', () => eruda.init());`}
                        </Script>
                    </>
                )}
            </head>
            <body className="antialiased bg-background text-foreground font-sans" suppressHydrationWarning>
                <Providers>
                    <AuthProvider>
                        <SearchModalProvider>
                            <AuthModalProvider>
                                <ForgotPasswordModalProvider>
                                    <FirstVisitModalProvider>
                                        <InviteModalProvider>
                                            <OnboardingProvider>
                                                {children}
                                                <ReferralCapture />
                                                <PortalTypographyEffect />
                                                <UserActivityTracker />
                                                <Suspense fallback={null}>
                                                    <ModalsProvider />
                                                </Suspense>
                                            </OnboardingProvider>
                                        </InviteModalProvider>
                                    </FirstVisitModalProvider>
                                </ForgotPasswordModalProvider>
                            </AuthModalProvider>
                        </SearchModalProvider>
                    </AuthProvider>
                </Providers>
                {showAnalytics && <Analytics />}
            </body>
        </html>
    );
}
