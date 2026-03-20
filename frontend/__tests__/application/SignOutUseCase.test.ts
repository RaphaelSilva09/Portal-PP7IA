import { describe, expect, it, vi, beforeEach } from 'vitest';
import { SignOutUseCase } from '@/application/usecases/SignOutUseCase';
import { IAuthRepository } from '@/domain/repositories/IAuthRepository';

const mockRepo = {
    signOut: vi.fn(),
} satisfies Partial<IAuthRepository>;

const useCase = new SignOutUseCase(mockRepo as IAuthRepository);

describe('SignOutUseCase', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('chama repo.signOut() uma vez', async () => {
        mockRepo.signOut.mockResolvedValue(undefined);

        await useCase.execute();

        expect(mockRepo.signOut).toHaveBeenCalledTimes(1);
    });

    it('repassa erro se repo lançar', async () => {
        const err = new Error('Logout failed');
        mockRepo.signOut.mockRejectedValue(err);

        await expect(useCase.execute()).rejects.toThrow('Logout failed');
    });
});
