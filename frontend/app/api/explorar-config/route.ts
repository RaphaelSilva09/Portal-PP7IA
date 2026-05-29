import { NextResponse } from "next/server";
import DIContainer from "@/infrastructure/di/container";

export const runtime = "nodejs";

export async function GET() {
    const config = await DIContainer.getExplorarConfigUseCase().execute();
    return NextResponse.json(config);
}
