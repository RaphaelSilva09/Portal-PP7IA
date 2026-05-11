import { NextResponse } from "next/server";
import DIContainer from "@/infrastructure/di/container";

export const runtime = "nodejs";

export async function GET() {
    const repo = DIContainer.getHomeDatesRepository();
    const dates = await repo.getLatestDates();
    return NextResponse.json(dates);
}
