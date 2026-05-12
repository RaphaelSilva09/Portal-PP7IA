// Better-auth handler with explicit CORS for trusted origins.
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const TRUSTED_ORIGINS = new Set([
    "https://pp7ias-portal.com.br",
    "https://www.pp7ias-portal.com.br",
    "https://develop.pp7ias-portal.com.br",
]);

function corsHeaders(origin: string | null): Record<string, string> {
    if (!origin || !TRUSTED_ORIGINS.has(origin)) return { Vary: "Origin" };
    return {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, Cookie",
        Vary: "Origin",
    };
}

const handlers = toNextJsHandler(auth);

export async function GET(req: Request) {
    const res = await handlers.GET(req);
    for (const [k, v] of Object.entries(corsHeaders(req.headers.get("origin")))) {
        res.headers.set(k, v);
    }
    return res;
}

export async function POST(req: Request) {
    const res = await handlers.POST(req);
    for (const [k, v] of Object.entries(corsHeaders(req.headers.get("origin")))) {
        res.headers.set(k, v);
    }
    return res;
}

export async function OPTIONS(req: Request) {
    return new Response(null, { status: 204, headers: corsHeaders(req.headers.get("origin")) });
}
