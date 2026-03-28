/**
 * IAnnouncementBarRepository (Domain Layer)
 *
 * Interface do repositório de barras de aviso.
 *
 * Princípios aplicados:
 * - DIP: Define contrato independente de implementação
 * - ISP: Interface enxuta, apenas operações necessárias
 */

import { AnnouncementBar } from "../entities/AnnouncementBar";

export interface CreateAnnouncementBarInput {
    message: string;
    linkUrl?: string | null;
    linkLabel?: string | null;
    bgColor?: string;
    textColor?: string;
    isActive?: boolean;
    priority?: number;
    startsAt?: Date | null;
    endsAt?: Date | null;
    isClosable?: boolean;
}

export interface UpdateAnnouncementBarInput {
    message?: string;
    linkUrl?: string | null;
    linkLabel?: string | null;
    bgColor?: string;
    textColor?: string;
    isActive?: boolean;
    priority?: number;
    startsAt?: Date | null;
    endsAt?: Date | null;
    isClosable?: boolean;
}

export interface IAnnouncementBarRepository {
    getAll(): Promise<AnnouncementBar[]>;
    create(input: CreateAnnouncementBarInput): Promise<AnnouncementBar>;
    update(id: string, input: UpdateAnnouncementBarInput): Promise<AnnouncementBar>;
    delete(id: string): Promise<void>;
    toggle(id: string, isActive: boolean): Promise<void>;
}
