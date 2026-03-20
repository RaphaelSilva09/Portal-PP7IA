import { SupabaseClient } from "@supabase/supabase-js";
import { Book } from "../../domain/entities/Book";
import { IBookRepository } from "../../domain/repositories/IBookRepository";

export class SupabaseBookRepository implements IBookRepository {
    constructor(private readonly supabase: SupabaseClient) {}

    async getActiveBook(): Promise<Book | null> {
        try {
            const { data, error } = await this.supabase
                .from("book")
                .select("*")
                .eq("is_active", true)
                .limit(1)
                .single();

            if (error) {
                if (error.code === "PGRST116") return null; // Não encontrou nenhum registro
                console.error("SupabaseBookRepository.getActiveBook error:", error);
                throw error;
            }

            if (!data) return null;

            return Book.create({
                id: data.id,
                title: data.title,
                subtitle: data.subtitle ?? null,
                description: data.description ?? null,
                coverImagePath: data.cover_image_path ?? null,
                coverPdfPath: data.cover_pdf_path ?? null,
                introHtmlPath: data.intro_html_path ?? null,
                introPdfPath: data.intro_pdf_path ?? null,
                badgeText: data.badge_text ?? null,
                isActive: data.is_active ?? false,
            });
        } catch (error) {
            console.error("Unexpected error in SupabaseBookRepository.getActiveBook:", error);
            throw error;
        }
    }
}
