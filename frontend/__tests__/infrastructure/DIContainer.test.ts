import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/infrastructure/config/supabase', () => ({
    supabase: {
        auth: {
            onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
            getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
            getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
            signInWithPassword: vi.fn(),
            signOut: vi.fn(),
        },
        from: vi.fn(() => ({
            select: vi.fn(() => ({
                eq: vi.fn(() => ({ single: vi.fn() })),
            })),
        })),
    },
}));

import DIContainer from '@/infrastructure/di/container';
import { SupabaseAuthRepository } from '@/infrastructure/repositories/SupabaseAuthRepository';
import { SignInUseCase } from '@/application/usecases/SignInUseCase';

describe('DIContainer', () => {
    beforeEach(() => {
        DIContainer.reset();
    });

    it('getAuthRepository() retorna instância de SupabaseAuthRepository', () => {
        const repo = DIContainer.getAuthRepository();
        expect(repo).toBeInstanceOf(SupabaseAuthRepository);
    });

    it('getSignInUseCase() retorna instância de SignInUseCase', () => {
        const useCase = DIContainer.getSignInUseCase();
        expect(useCase).toBeInstanceOf(SignInUseCase);
    });

    it('getAuthRepository() retorna a mesma instância em chamadas repetidas (singleton)', () => {
        const repo1 = DIContainer.getAuthRepository();
        const repo2 = DIContainer.getAuthRepository();
        expect(repo1).toBe(repo2);
    });

    it('após reset(), getAuthRepository() cria nova instância', () => {
        const repo1 = DIContainer.getAuthRepository();
        DIContainer.reset();
        const repo2 = DIContainer.getAuthRepository();
        expect(repo1).not.toBe(repo2);
    });
});
