import { NextResponse } from "next/server";
import DIContainer from "@/infrastructure/di/container";

export async function GET() {
    const items = await DIContainer.getFaqRepository().getAll();
    return NextResponse.json(items.map(item => item.toObject()));
}
