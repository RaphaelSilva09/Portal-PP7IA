import Footer from "@/components/Footer";
import Navbar from "@/components/Header";
import type { Metadata } from "next";
import ExplorarClient from "./ExplorarClient";

export const metadata: Metadata = {
    title: "Explorar · PP7+IAS",
    description: "Sete blocos editoriais reunidos num só lugar. Filtre por formato, busque por título ou navegue pelos temas.",
};

interface Props {
    searchParams: Promise<{ b?: string }>;
}

export default async function ExplorarPage({ searchParams }: Props) {
    const { b } = await searchParams;
    return (
        <main className="min-h-screen bg-background text-foreground">
            <Navbar />
            <ExplorarClient initialBlock={b ?? null} />
            <Footer />
        </main>
    );
}
