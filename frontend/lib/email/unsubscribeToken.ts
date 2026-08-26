import { createHmac, timingSafeEqual } from "node:crypto";
import type { CommunicationType } from "../../domain/entities/CommunicationPreference";

/**
 * Opaque, HMAC-signed unsubscribe token. Not a JWT — the payload carries only
 * what's needed to identify the subscription (userId, communicationType,
 * version), never the email address, and never expires: old digest emails
 * sitting in an inbox for months must still be able to unsubscribe. Anyone
 * with the token can cancel the subscription (expected — see docs), but the
 * token can never authenticate, read the profile, or resubscribe anything.
 */

const TOKEN_VERSION = "1";

interface TokenPayload {
    userId: string;
    communicationType: CommunicationType;
}

function currentSecret(): string {
    const secret = process.env.UNSUBSCRIBE_TOKEN_SECRET?.trim();
    if (!secret) throw new Error("UNSUBSCRIBE_TOKEN_SECRET não configurado");
    return secret;
}

function candidateSecrets(): string[] {
    const secrets = [currentSecret()];
    const previous = process.env.UNSUBSCRIBE_TOKEN_SECRET_PREVIOUS?.trim();
    if (previous) secrets.push(previous);
    return secrets;
}

function sign(payload: string, secret: string): string {
    return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function signUnsubscribeToken(userId: string, communicationType: CommunicationType): string {
    const payload = `${TOKEN_VERSION}.${userId}.${communicationType}`;
    const encodedPayload = Buffer.from(payload, "utf8").toString("base64url");
    const signature = sign(payload, currentSecret());
    return `${encodedPayload}.${signature}`;
}

export function verifyUnsubscribeToken(token: string): TokenPayload | null {
    if (typeof token !== "string" || !token) return null;

    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [encodedPayload, signature] = parts;

    let payload: string;
    try {
        payload = Buffer.from(encodedPayload, "base64url").toString("utf8");
    } catch {
        return null;
    }

    const signatureBuffer = safeBase64UrlDecode(signature);
    if (!signatureBuffer) return null;

    const isValid = candidateSecrets().some(secret => {
        const expected = safeBase64UrlDecode(sign(payload, secret));
        return expected !== null && expected.length === signatureBuffer.length && timingSafeEqual(expected, signatureBuffer);
    });
    if (!isValid) return null;

    const segments = payload.split(".");
    if (segments.length !== 3) return null;
    const [version, userId, communicationType] = segments;
    if (version !== TOKEN_VERSION || !userId || communicationType !== "weekly_news") return null;

    return { userId, communicationType };
}

function safeBase64UrlDecode(value: string): Buffer | null {
    try {
        return Buffer.from(value, "base64url");
    } catch {
        return null;
    }
}
