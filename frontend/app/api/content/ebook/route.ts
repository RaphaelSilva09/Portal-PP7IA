import { NextResponse } from "next/server";
import DIContainer from "@/infrastructure/di/container";

export const runtime = "nodejs";

export async function GET() {
    const uc = DIContainer.getEbookUseCase();
    const result = await uc.execute();
    return NextResponse.json(result);
}
