import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/auth-client', () => ({
    authClient: {
        signUp: { email: vi.fn() },
        signIn: { email: vi.fn() },
        signOut: vi.fn(),
        getSession: vi.fn().mockResolvedValue({ data: null }),
    },
}));

import DIContainer from '@/infrastructure/di/container';
import { BetterAuthRepository } from '@/infrastructure/repositories/BetterAuthRepository';
import { SignInUseCase } from '@/application/usecases/SignInUseCase';

describe('DIContainer', () => {
    beforeEach(() => {
        DIContainer.reset();
    });

    it('getAuthRepository() retorna instância de BetterAuthRepository', () => {
        const repo = DIContainer.getAuthRepository();
        expect(repo).toBeInstanceOf(BetterAuthRepository);
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
