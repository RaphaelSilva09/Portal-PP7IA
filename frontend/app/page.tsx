import dynamic from "next/dynamic";
import BentoGrid from "@/components/BentoGridConteudo";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import IASParceiras from "@/components/IASParceiras";
import Navbar from "@/components/Header";

const ChatBubble = dynamic(() => import("@/components/chat/ChatBubble"), { ssr: false });

export default function Home() {
    return (
        <main className="min-h-screen bg-background text-foreground">
            <Navbar />
            <HeroSection />
            <BentoGrid />
            <IASParceiras />
            <Footer />
            {process.env.NEXT_PUBLIC_CHAT_ENABLED !== "false" && <ChatBubble />}
        </main>
    );
}
