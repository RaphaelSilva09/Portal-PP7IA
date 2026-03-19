import { useEffect } from "react";

export function useScrollToHash(isReady: boolean) {
    useEffect(() => {
        if (!isReady) return;
        const hash = window.location.hash;
        if (!hash) return;
        const el = document.getElementById(hash.slice(1));
        if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "center" }), 100);
    }, [isReady]);
}
