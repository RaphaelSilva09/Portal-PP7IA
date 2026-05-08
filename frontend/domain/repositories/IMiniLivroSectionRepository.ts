import type { MiniLivroSection, MiniLivroSectionKind } from "../entities/MiniLivroSection";

export interface IMiniLivroSectionRepository {
    getAll(): Promise<MiniLivroSection[]>;
    getById(id: number): Promise<MiniLivroSection | null>;
    getIntroducao(): Promise<MiniLivroSection | null>;
    getEncerramentos(): Promise<MiniLivroSection[]>;
    getByKind(kind: MiniLivroSectionKind): Promise<MiniLivroSection[]>;
}
