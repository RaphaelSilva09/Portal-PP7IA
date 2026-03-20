import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ResetPasswordWithTokenUseCase } from '@/application/usecases/ResetPasswordWithTokenUseCase';
import { IAuthRepository } from '@/domain/repositories/IAuthRepository';

const mockRepo = {
    resetPasswordWithToken: vi.fn(),
} satisfies Partial<IAuthRepository>;

const useCase = new ResetPasswordWithTokenUseCase(mockRepo as IAuthRepository);

describe('ResetPasswordWithTokenUseCase', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('senhas não coincidem → throw "As senhas não coincidem"', async () => {
        await expect(
            useCase.execute({ newPassword: 'senha123', confirmPassword: 'outraSenha' })
        ).rejects.toThrow('As senhas não coincidem');
        expect(mockRepo.resetPasswordWithToken).not.toHaveBeenCalled();
    });

    it('senha nova vazia → throw', async () => {
        await expect(
            useCase.execute({ newPassword: '', confirmPassword: '' })
        ).rejects.toThrow(/obrigatória/);
    });

    it('senha muito curta → throw', async () => {
        await expect(
            useCase.execute({ newPassword: '12345', confirmPassword: '12345' })
        ).rejects.toThrow(/mínimo/);
        expect(mockRepo.resetPasswordWithToken).not.toHaveBeenCalled();
    });

    it('input válido → chama repo com a nova senha', async () => {
        mockRepo.resetPasswordWithToken.mockResolvedValue(undefined);

        await useCase.execute({ newPassword: 'novaSenha123', confirmPassword: 'novaSenha123' });

        expect(mockRepo.resetPasswordWithToken).toHaveBeenCalledWith('novaSenha123');
    });

    it('repo lança erro → repassa erro', async () => {
        mockRepo.resetPasswordWithToken.mockRejectedValue(new Error('Falha ao resetar'));

        await expect(
            useCase.execute({ newPassword: 'novaSenha123', confirmPassword: 'novaSenha123' })
        ).rejects.toThrow('Falha ao resetar');
    });
});
