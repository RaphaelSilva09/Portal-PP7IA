import { NextResponse } from "next/server";
import DIContainer from "@/infrastructure/di/container";

export const runtime = "nodejs";

export async function GET() {
    const uc = DIContainer.getPortalNewsUseCase();
    const items = await uc.execute();
    return NextResponse.json({ items });
}
