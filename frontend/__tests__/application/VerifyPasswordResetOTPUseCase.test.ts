import { describe, expect, it, vi, beforeEach } from 'vitest';
import { VerifyPasswordResetOTPUseCase } from '@/application/usecases/VerifyPasswordResetOTPUseCase';
import { IAuthRepository } from '@/domain/repositories/IAuthRepository';

const mockRepo = {
    verifyPasswordResetOTP: vi.fn(),
} satisfies Partial<IAuthRepository>;

const useCase = new VerifyPasswordResetOTPUseCase(mockRepo as unknown as IAuthRepository);

describe('VerifyPasswordResetOTPUseCase', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('OTP com menos de 8 dígitos → throw sobre 8 dígitos numéricos', async () => {
        await expect(
            useCase.execute({ email: 'test@test.com', otp: '1234567' })
        ).rejects.toThrow(/8 dígitos numéricos/);
        expect(mockRepo.verifyPasswordResetOTP).not.toHaveBeenCalled();
    });

    it('OTP com mais de 8 dígitos → throw sobre 8 dígitos numéricos', async () => {
        await expect(
            useCase.execute({ email: 'test@test.com', otp: '123456789' })
        ).rejects.toThrow(/8 dígitos numéricos/);
    });

    it('OTP com letras → throw sobre 8 dígitos numéricos', async () => {
        await expect(
            useCase.execute({ email: 'test@test.com', otp: '1234567a' })
        ).rejects.toThrow(/8 dígitos numéricos/);
    });

    it('email inválido → throw "Email inválido"', async () => {
        await expect(
            useCase.execute({ email: 'not-an-email', otp: '12345678' })
        ).rejects.toThrow('Email inválido');
        expect(mockRepo.verifyPasswordResetOTP).not.toHaveBeenCalled();
    });

    it('input válido → chama repo com email normalizado e OTP trimado', async () => {
        mockRepo.verifyPasswordResetOTP.mockResolvedValue(undefined);

        await useCase.execute({ email: '  TEST@EXAMPLE.COM  ', otp: ' 12345678 ' });

        expect(mockRepo.verifyPasswordResetOTP).toHaveBeenCalledWith({
            email: 'test@example.com',
            token: '12345678',
        });
    });

    it('input válido → não lança erro', async () => {
        mockRepo.verifyPasswordResetOTP.mockResolvedValue(undefined);

        await expect(
            useCase.execute({ email: 'test@test.com', otp: '12345678' })
        ).resolves.toBeUndefined();
    });
});
