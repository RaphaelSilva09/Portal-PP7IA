import { createServerClient } from "@supabase/ssr";
import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseClientKey, getSupabaseUrl } from "@/infrastructure/config/supabase-env";

const DEFAULT_SUCCESS_PATH = "/auth/confirmed";
const DEFAULT_ERROR_PATH = "/?authModal=login";

function resolveBaseUrl(request: NextRequest): string {
    const candidates = [
        process.env.NEXT_PUBLIC_SITE_URL?.trim(),
        process.env.NEXT_PUBLIC_APP_URL?.trim(),
    ];

    for (const candidate of candidates) {
        if (!candidate) continue;
        try {
            return new URL(candidate).origin;
        } catch {
            continue;
        }
    }

    return new URL(request.url).origin;
}

function sanitizeNextPath(next: string | null): string {
    if (!next || !next.startsWith("/") || next.startsWith("//")) {
        return DEFAULT_SUCCESS_PATH;
    }

    return next;
}

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const tokenHash = requestUrl.searchParams.get("token_hash");
    const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
    const nextPath = sanitizeNextPath(requestUrl.searchParams.get("next"));
    const baseUrl = resolveBaseUrl(request);

    const successResponse = NextResponse.redirect(new URL(nextPath, baseUrl), { status: 303 });

    const supabase = createServerClient(getSupabaseUrl(), getSupabaseClientKey(), {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value, options }) => {
                    successResponse.cookies.set(name, value, options);
                });
            },
        },
    });

    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
            return NextResponse.redirect(new URL(DEFAULT_ERROR_PATH, baseUrl), { status: 303 });
        }

        return successResponse;
    }

    if (!tokenHash || !type) {
        return NextResponse.redirect(new URL(DEFAULT_ERROR_PATH, baseUrl), { status: 303 });
    }

    const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type,
    });

    if (error) {
        return NextResponse.redirect(new URL(DEFAULT_ERROR_PATH, baseUrl), { status: 303 });
    }

    return successResponse;
}
