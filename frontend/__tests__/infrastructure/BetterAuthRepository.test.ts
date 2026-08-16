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
import {
    InvalidOTPError,
    OTPExpiredError,
    RateLimitError,
    TooManyOTPAttemptsError,
    WeakPasswordError,
} from '@/domain/errors/AuthError';

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

        expect(mockCheckVerificationOtp).toHaveBeenCalledWith(
            { email: 'test@example.com', otp: '12345678', type: 'forget-password' },
            expect.objectContaining({ onError: expect.any(Function) }),
        );
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

    it('TOO_MANY_ATTEMPTS → lança TooManyOTPAttemptsError (não cai em erro genérico)', async () => {
        mockCheckVerificationOtp.mockResolvedValue({
            error: { code: 'TOO_MANY_ATTEMPTS', message: 'Too many attempts', status: 403 },
        });

        await expect(
            repo.verifyPasswordResetOTP({ email: 'test@example.com', token: '00000000' }),
        ).rejects.toBeInstanceOf(TooManyOTPAttemptsError);
    });

    it('resposta 429 → lança RateLimitError usando o Retry-After real do header', async () => {
        mockCheckVerificationOtp.mockImplementation(async (_body: unknown, opts: { onError: (ctx: { response: Response }) => void }) => {
            opts.onError({ response: new Response(null, { headers: { 'X-Retry-After': '17' } }) });
            return { error: { status: 429, message: 'Too many requests. Please try again later.' } };
        });

        try {
            await repo.verifyPasswordResetOTP({ email: 'test@example.com', token: '00000000' });
            throw new Error('expected rejection');
        } catch (err) {
            expect(err).toBeInstanceOf(RateLimitError);
            expect((err as RateLimitError).retryAfterSeconds).toBe(17);
        }
    });

    it('resposta 429 sem header legível → RateLimitError não inventa um tempo de espera', async () => {
        mockCheckVerificationOtp.mockResolvedValue({
            error: { status: 429, message: 'Too many requests. Please try again later.' },
        });

        try {
            await repo.verifyPasswordResetOTP({ email: 'test@example.com', token: '00000000' });
            throw new Error('expected rejection');
        } catch (err) {
            expect(err).toBeInstanceOf(RateLimitError);
            expect((err as RateLimitError).retryAfterSeconds).toBeNull();
        }
    });

    it('RECOVERY_THROTTLED (password-recovery-throttle plugin) → RateLimitError usando retryAfterSeconds do corpo, não do header', async () => {
        mockCheckVerificationOtp.mockResolvedValue({
            error: {
                status: 429,
                code: 'RECOVERY_THROTTLED',
                message: 'Muitas tentativas de recuperação de senha. Tente novamente mais tarde.',
                retryAfterSeconds: 900,
            },
        });

        try {
            await repo.verifyPasswordResetOTP({ email: 'test@example.com', token: '00000000' });
            throw new Error('expected rejection');
        } catch (err) {
            expect(err).toBeInstanceOf(RateLimitError);
            expect((err as RateLimitError).retryAfterSeconds).toBe(900);
        }
    });
});

describe('BetterAuthRepository.resetPasswordWithOTP', () => {
    let repo: BetterAuthRepository;

    beforeEach(async () => {
        vi.clearAllMocks();
        repo = new BetterAuthRepository();
        mockCheckVerificationOtp.mockResolvedValue({ error: null });
        await repo.verifyPasswordResetOTP({ email: 'test@example.com', token: '12345678' });
    });

    it('PASSWORD_TOO_SHORT → lança WeakPasswordError com a mensagem do requisito não atendido (não usa substring)', async () => {
        mockResetPassword.mockResolvedValue({
            error: { code: 'PASSWORD_TOO_SHORT', message: 'Password too short' },
        });

        try {
            await repo.resetPasswordWithOTP('123');
            throw new Error('expected rejection');
        } catch (err) {
            expect(err).toBeInstanceOf(WeakPasswordError);
            expect((err as Error).message).toBe('A senha deve ter no mínimo 6 caracteres');
        }
    });

    it('PASSWORD_TOO_LONG → lança WeakPasswordError (código estruturado, não capturado hoje por substring)', async () => {
        mockResetPassword.mockResolvedValue({
            error: { code: 'PASSWORD_TOO_LONG', message: 'Password too long' },
        });

        try {
            await repo.resetPasswordWithOTP('x'.repeat(200));
            throw new Error('expected rejection');
        } catch (err) {
            expect(err).toBeInstanceOf(WeakPasswordError);
            expect((err as Error).message).toBe('A senha excede o tamanho máximo permitido');
        }
    });
});
