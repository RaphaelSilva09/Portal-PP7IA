import type { MiniLivroSection } from "@/domain/entities/MiniLivroSection";
import type { IMiniLivroSectionRepository } from "@/domain/repositories/IMiniLivroSectionRepository";

export interface GetMiniLivroSectionsOutput {
    introducoes: MiniLivroSection[];
    encerramentos: MiniLivroSection[];
    all: MiniLivroSection[];
}

export class GetMiniLivroSectionsUseCase {
    constructor(private readonly repository: IMiniLivroSectionRepository) {}

    async execute(): Promise<GetMiniLivroSectionsOutput> {
        const all = await this.repository.getAll();

        return {
            introducoes: all.filter(item => item.kind === "introducao"),
            encerramentos: all.filter(item => item.kind === "encerramento"),
            all,
        };
    }
}
