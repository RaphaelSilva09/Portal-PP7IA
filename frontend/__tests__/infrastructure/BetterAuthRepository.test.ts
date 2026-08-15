import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockCheckVerificationOtp, mockResetPassword } = vi.hoisted(() => ({
    mockCheckVerificationOtp: vi.fn(),
    mockResetPassword: vi.fn(),
}));

vi.mock('@/lib/auth-client', () => ({
    authClient: {
        emailOtp: {
            checkVerificationOtp: mockCheckVerificationOtp,
            resetPassword: mockResetPassword,
            sendVerificationOtp: vi.fn(),
        },
    },
}));

import { BetterAuthRepository } from '@/infrastructure/repositories/BetterAuthRepository';
import { InvalidOTPError, OTPExpiredError } from '@/domain/errors/AuthError';

describe('BetterAuthRepository.verifyPasswordResetOTP', () => {
    let repo: BetterAuthRepository;

    beforeEach(() => {
        vi.clearAllMocks();
        repo = new BetterAuthRepository();
    });

    it('código inválido → lança erro e NÃO permite avançar para redefinição de senha', async () => {
        mockCheckVerificationOtp.mockResolvedValue({
            error: { code: 'INVALID_OTP', message: 'Invalid OTP' },
        });

        await expect(
            repo.verifyPasswordResetOTP({ email: 'test@example.com', token: '00000000' }),
        ).rejects.toBeInstanceOf(InvalidOTPError);
    });

    it('código expirado → lança OTPExpiredError', async () => {
        mockCheckVerificationOtp.mockResolvedValue({
            error: { code: 'OTP_EXPIRED', message: 'OTP expired' },
        });

        await expect(
            repo.verifyPasswordResetOTP({ email: 'test@example.com', token: '12345678' }),
        ).rejects.toBeInstanceOf(OTPExpiredError);
    });

    it('código válido → resolve sem erro e chama o endpoint de verificação com o tipo correto', async () => {
        mockCheckVerificationOtp.mockResolvedValue({ error: null });

        await expect(
            repo.verifyPasswordResetOTP({ email: 'test@example.com', token: '12345678' }),
        ).resolves.toBeUndefined();

        expect(mockCheckVerificationOtp).toHaveBeenCalledWith({
            email: 'test@example.com',
            otp: '12345678',
            type: 'forget-password',
        });
    });

    it('código inválido → resetPasswordWithOTP subsequente não é chamado com dados não verificados', async () => {
        mockCheckVerificationOtp.mockResolvedValue({
            error: { code: 'INVALID_OTP', message: 'Invalid OTP' },
        });

        await expect(
            repo.verifyPasswordResetOTP({ email: 'test@example.com', token: '00000000' }),
        ).rejects.toThrow();

        await expect(repo.resetPasswordWithOTP('novaSenha123')).rejects.toThrow(
            'Verifique o código antes de redefinir a senha',
        );
        expect(mockResetPassword).not.toHaveBeenCalled();
    });
});
