import type { MiniLivroSection } from "@/domain/entities/MiniLivroSection";
import type { IMiniLivroSectionRepository } from "@/domain/repositories/IMiniLivroSectionRepository";

export interface GetMiniLivroSectionsOutput {
    prefacio: MiniLivroSection | null;
    encerramentos: MiniLivroSection[];
    all: MiniLivroSection[];
}

export class GetMiniLivroSectionsUseCase {
    constructor(private readonly repository: IMiniLivroSectionRepository) {}

    async execute(): Promise<GetMiniLivroSectionsOutput> {
        const all = await this.repository.getAll();

        return {
            prefacio: all.find(item => item.kind === "prefacio") ?? null,
            encerramentos: all.filter(item => item.kind === "encerramento"),
            all,
        };
    }
}
