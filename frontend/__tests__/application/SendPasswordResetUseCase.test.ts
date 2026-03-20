import { describe, expect, it, vi, beforeEach } from 'vitest';
import { SendPasswordResetUseCase } from '@/application/usecases/SendPasswordResetUseCase';
import { IAuthRepository } from '@/domain/repositories/IAuthRepository';

const mockRepo = {
    sendPasswordReset: vi.fn(),
} satisfies Partial<IAuthRepository>;

const useCase = new SendPasswordResetUseCase(mockRepo as unknown as IAuthRepository);

describe('SendPasswordResetUseCase', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('email inválido → throw "Email inválido"', async () => {
        await expect(
            useCase.execute({ email: 'not-an-email' })
        ).rejects.toThrow('Email inválido');
        expect(mockRepo.sendPasswordReset).not.toHaveBeenCalled();
    });

    it('email vazio → throw sobre email obrigatório', async () => {
        await expect(
            useCase.execute({ email: '' })
        ).rejects.toThrow(/obrigatório/);
        expect(mockRepo.sendPasswordReset).not.toHaveBeenCalled();
    });

    it('email válido → chama repo sem lançar', async () => {
        mockRepo.sendPasswordReset.mockResolvedValue(undefined);

        await expect(
            useCase.execute({ email: 'test@example.com' })
        ).resolves.toBeUndefined();

        expect(mockRepo.sendPasswordReset).toHaveBeenCalledWith('test@example.com');
    });

    it('email normalizado para lowercase antes de chamar repo', async () => {
        mockRepo.sendPasswordReset.mockResolvedValue(undefined);

        await useCase.execute({ email: 'TEST@EXAMPLE.COM' });

        expect(mockRepo.sendPasswordReset).toHaveBeenCalledWith('test@example.com');
    });
});
