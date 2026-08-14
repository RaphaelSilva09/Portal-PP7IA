import { describe, expect, it } from "vitest";
import { BLOCK_CARD_CONFIG, cardConfigForContentType } from "@/components/explorar/ContentCards";
import { SAVABLE_CONTENT_TYPES } from "@/domain/entities/SavedContent";

describe("cardConfigForContentType", () => {
    it("maps every savable content type to a card config", () => {
        for (const type of SAVABLE_CONTENT_TYPES) {
            expect(cardConfigForContentType(type)).toBeTruthy();
        }
    });

    it("maps especial-semana and radar_oportunidades to their editorial block configs", () => {
        expect(cardConfigForContentType("especial-semana")).toBe(BLOCK_CARD_CONFIG.reportagem);
        expect(cardConfigForContentType("radar_oportunidades")).toBe(BLOCK_CARD_CONFIG.radar);
    });

    it("maps mini-livro and ebook to the same 'livro' block config", () => {
        expect(cardConfigForContentType("mini-livro")).toBe(BLOCK_CARD_CONFIG.livro);
        expect(cardConfigForContentType("ebook")).toBe(BLOCK_CARD_CONFIG.livro);
    });

    it("maps newsletter, biblioteca and estudar to their own blocks", () => {
        expect(cardConfigForContentType("newsletter")).toBe(BLOCK_CARD_CONFIG.newsletter);
        expect(cardConfigForContentType("biblioteca")).toBe(BLOCK_CARD_CONFIG.biblioteca);
        expect(cardConfigForContentType("estudar")).toBe(BLOCK_CARD_CONFIG.estudar);
    });
});
