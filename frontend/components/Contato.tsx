"use client";

import { useState } from "react";
import AuthModal from "./AuthModal";
import NewsletterCTA from "./NewsletterCTA";
import InviteCTA from "./InviteCTA";

export default function Contato() {
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authInitialData, setAuthInitialData] = useState<{ email?: string; celular?: string }>({});

    const handleSubscribe = (email: string, celular: string) => {
        setAuthInitialData({ email, celular });
        setIsAuthModalOpen(true);
    };

    return (
        <section id="contato" className="py-8 px-4 sm:px-6 lg:px-8" style={{ scrollMarginTop: "100px" }}>
            <div className="max-w-7xl mx-auto">
                <NewsletterCTA onSubscribe={handleSubscribe} />
                <InviteCTA />
            </div>

            {/* Auth Modal */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                initialMode="signup"
                initialData={authInitialData}
            />
        </section>
    );
}
