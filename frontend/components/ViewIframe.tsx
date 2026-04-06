"use client";

import { useTheme } from "next-themes";

interface ViewIframeProps {
    htmlPath: string;
    title: string;
}

export default function ViewIframe({ htmlPath, title }: ViewIframeProps) {
    const { resolvedTheme } = useTheme();
    const theme = resolvedTheme === "light" ? "light" : "dark";
    const src = `${htmlPath}?theme=${theme}`;

    return (
        <iframe
            src={src}
            className="w-full h-full border-0"
            title={title}
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
    );
}
