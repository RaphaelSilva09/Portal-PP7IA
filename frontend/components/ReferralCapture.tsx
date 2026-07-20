"use client";

import { useEffect } from "react";
import { captureReferralTokenFromUrl } from "@/lib/referralCapture";

/** Captura ?ref= da URL (se presente) uma vez por carregamento — sem UI própria. */
export default function ReferralCapture() {
    useEffect(() => {
        captureReferralTokenFromUrl();
    }, []);

    return null;
}
