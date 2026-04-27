// frontend/infrastructure/chat/RateLimitRepository.ts
import type { SupabaseClient } from "@supabase/supabase-js";
import { getServiceRoleClient } from "./serviceRoleClient";

export class RateLimitRepository {
    constructor(private readonly supabase: SupabaseClient = getServiceRoleClient()) {}

    /** Returns the current count for the user today (0 if none). */
    async currentCount(userId: string): Promise<number> {
        const today = new Date().toISOString().slice(0, 10);
        const { data, error } = await this.supabase
            .from("rag_usage")
            .select("count")
            .eq("user_id", userId)
            .eq("usage_date", today)
            .maybeSingle();
        if (error) throw new Error(`RateLimitRepository.currentCount: ${error.message}`);
        return data?.count ?? 0;
    }

    /** Atomically increment using ON CONFLICT via the RPC bump_rag_usage. */
    async increment(userId: string): Promise<void> {
        const today = new Date().toISOString().slice(0, 10);
        const { error } = await this.supabase.rpc("bump_rag_usage", {
            p_user_id: userId,
            p_usage_date: today,
        });
        if (error) throw new Error(`RateLimitRepository.increment: ${error.message}`);
    }
}
