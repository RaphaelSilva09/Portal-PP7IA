import { NextResponse } from "next/server";
import DIContainer from "@/infrastructure/di/container";

export const runtime = "nodejs";

export async function GET() {
    const uc = DIContainer.getHomepageConfigUseCase();
    const config = await uc.execute();
    return NextResponse.json(config);
}
