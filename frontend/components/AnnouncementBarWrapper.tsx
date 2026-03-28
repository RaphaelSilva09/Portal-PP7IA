"use client";

/**
 * AnnouncementBarWrapper Component (Presentation Layer)
 *
 * Wrapper client-only para a AnnouncementBar.
 * O mounted guard garante que não há hydration mismatch:
 * servidor e primeira renderização do cliente sempre retornam null.
 */

import { useAnnouncementBars } from "@/presentation/hooks/useAnnouncementBars";
import { useEffect, useState } from "react";
import AnnouncementBar from "./AnnouncementBar";

export default function AnnouncementBarWrapper() {
    const [mounted, setMounted] = useState(false);
    const { bars } = useAnnouncementBars();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || bars.length === 0) return null;

    return <AnnouncementBar bars={bars} />;
}
