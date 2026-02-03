"use client";

import AuthorProfile from "./AuthorProfile";

export default function Author() {
    return (
        <section
            id="autor"
            className="relative py-20 px-4 sm:px-6 lg:px-8 scroll-mt-20"
            style={{ isolation: "isolate" }}
        >
            <div className="max-w-7xl mx-auto">
                <AuthorProfile />
            </div>
        </section>
    );
}
