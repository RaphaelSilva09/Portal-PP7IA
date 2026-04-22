"use client";

import { useState } from "react";
import type { ContentViewNavigationLink } from "@/application/usecases/GetContentViewNavigationUseCase";
import Navbar from "@/components/Header";
import ViewContentNavigation from "@/components/ViewContentNavigation";
import ViewIframe from "@/components/ViewIframe";

interface ViewContentFrameProps {
    htmlPath: string;
    title: string;
    previous: ContentViewNavigationLink | null;
    next: ContentViewNavigationLink | null;
}

export default function ViewContentFrame({ htmlPath, title, previous, next }: ViewContentFrameProps) {
    const [shellBackgroundColor, setShellBackgroundColor] = useState<string | null>(null);

    return (
        <div
            className="min-h-screen bg-[var(--background)]"
            style={shellBackgroundColor ? { backgroundColor: shellBackgroundColor } : undefined}
        >
            <Navbar autoHideOnScroll />
            <ViewIframe htmlPath={htmlPath} title={title} onBackgroundColorChange={setShellBackgroundColor} />
            <ViewContentNavigation previous={previous} next={next} />
        </div>
    );
}
