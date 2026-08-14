import type { SavedContentEntry } from "../entities/SavedContent";

export interface ISavedContentRepository {
    /** Alterna o estado salvo: se já salvo, remove; senão, salva. Retorna o novo estado. */
    toggle(userId: string, contentType: string, contentId: string): Promise<boolean>;
    isSaved(userId: string, contentType: string, contentId: string): Promise<boolean>;
    /** Itens salvos do usuário, mais recentes primeiro. */
    listByUser(userId: string): Promise<SavedContentEntry[]>;
}
