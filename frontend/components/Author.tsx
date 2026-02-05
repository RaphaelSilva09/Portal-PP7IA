"use client";

import AuthorProfile from "./AuthorProfile";

export default function Author() {
    return (
        <section
            id="autor"
            className="relative pb-10 px-4 sm:px-6 lg:px-8 scroll-mt-20"
            style={{ isolation: "isolate" }}
        >
            <div className="max-w-7xl mx-auto">
                <AuthorProfile />
            </div>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mt-8 sm:mt-12" />
        </section>
    );
}
