import { NextResponse } from "next/server";
import DIContainer from "@/infrastructure/di/container";

export async function GET() {
    try {
        const items = await DIContainer.getFaqRepository().getAll();
        return NextResponse.json(items.map(item => item.toObject()));
    } catch (err) {
        console.error("Erro ao buscar FAQ:", err);
        return NextResponse.json({ error: "Não foi possível carregar as perguntas." }, { status: 500 });
    }
}
