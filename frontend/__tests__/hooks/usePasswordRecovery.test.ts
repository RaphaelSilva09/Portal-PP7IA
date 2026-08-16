import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    InvalidOTPError,
    OTPExpiredError,
    RateLimitError,
    TooManyOTPAttemptsError,
    WeakPasswordError,
} from '@/domain/errors/AuthError';

const {
    mockSendPasswordResetExecute,
    mockVerifyOTPExecute,
    mockResetPasswordWithOTP,
    mockSignOut,
} = vi.hoisted(() => ({
    mockSendPasswordResetExecute: vi.fn(),
    mockVerifyOTPExecute: vi.fn(),
    mockResetPasswordWithOTP: vi.fn(),
    mockSignOut: vi.fn(),
}));

vi.mock('@/infrastructure/di/container', () => ({
    default: {
        getSendPasswordResetUseCase: vi.fn(() => ({ execute: mockSendPasswordResetExecute })),
        getVerifyPasswordResetOTPUseCase: vi.fn(() => ({ execute: mockVerifyOTPExecute })),
        getAuthRepository: vi.fn(() => ({
            resetPasswordWithOTP: mockResetPasswordWithOTP,
            signOut: mockSignOut,
        })),
    },
}));

import { usePasswordRecovery } from '@/hooks/usePasswordRecovery';

async function goToCodePhase() {
    mockSendPasswordResetExecute.mockResolvedValue(undefined);
    const hook = renderHook(() => usePasswordRecovery());
    await act(async () => {
        await hook.result.current.requestReset('user@example.com');
    });
    return hook;
}

async function goToPasswordPhase() {
    const hook = await goToCodePhase();
    mockVerifyOTPExecute.mockResolvedValue(undefined);
    await act(async () => {
        await hook.result.current.verifyCode('12345678');
    });
    return hook;
}

describe('usePasswordRecovery', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.useRealTimers();
    });

    it('código incorreto permanece na fase CODE e nunca apresenta sucesso', async () => {
        const { result } = await goToCodePhase();
        mockVerifyOTPExecute.mockRejectedValue(new InvalidOTPError());

        await act(async () => {
            await result.current.verifyCode('00000000');
        });

        expect(result.current.state.phase).toBe('code');
        expect(result.current.state.phase).not.toBe('success');
        if (result.current.state.phase === 'code') {
            expect(result.current.state.error?.kind).toBe('invalid');
        }
    });

    it('tentativas restantes diminuem a cada falha e o texto pluraliza corretamente', async () => {
        const { result } = await goToCodePhase();
        mockVerifyOTPExecute.mockRejectedValue(new InvalidOTPError());

        await act(async () => { await result.current.verifyCode('00000000'); });
        expect(result.current.state.phase === 'code' && result.current.state.error?.attemptsRemaining).toBe(9);
        expect(result.current.state.phase === 'code' && result.current.state.error?.message).toContain('Restam 9 tentativas');

        for (let i = 0; i < 6; i++) {
            await act(async () => { await result.current.verifyCode('00000000'); });
        }
        // 7 falhas totais → 3 restantes
        expect(result.current.state.phase === 'code' && result.current.state.error?.attemptsRemaining).toBe(3);

        await act(async () => { await result.current.verifyCode('00000000'); });
        // 8 falhas → 2 restantes, mensagem no singular/plural correto
        expect(result.current.state.phase === 'code' && result.current.state.error?.attemptsRemaining).toBe(2);
        expect(result.current.state.phase === 'code' && result.current.state.error?.message).toBe(
            'Código incorreto. Restam 2 tentativas. Depois disso, você precisará solicitar um novo código.',
        );

        await act(async () => { await result.current.verifyCode('00000000'); });
        // 9 falhas → 1 restante, singular
        expect(result.current.state.phase === 'code' && result.current.state.error?.message).toBe(
            'Código incorreto. Resta 1 tentativa. Depois disso, este código não poderá mais ser usado.',
        );
    });

    it('a décima falha aplica o estado de limite atingido e bloqueia o formulário', async () => {
        const { result } = await goToCodePhase();
        mockVerifyOTPExecute.mockRejectedValue(new InvalidOTPError());

        for (let i = 0; i < 10; i++) {
            await act(async () => { await result.current.verifyCode('00000000'); });
        }

        expect(result.current.state.phase).toBe('code');
        if (result.current.state.phase === 'code') {
            expect(result.current.state.locked).toBe(true);
            expect(result.current.state.error?.kind).toBe('too_many_attempts');
            expect(result.current.state.error?.attemptsRemaining).toBe(0);
        }
    });

    it('um TOO_MANY_ATTEMPTS vindo do servidor bloqueia mesmo numa instância recém-criada do hook (refresh não recupera tentativas)', async () => {
        const { result } = await goToCodePhase();
        mockVerifyOTPExecute.mockRejectedValue(new TooManyOTPAttemptsError());

        await act(async () => { await result.current.verifyCode('00000000'); });

        expect(result.current.state.phase).toBe('code');
        if (result.current.state.phase === 'code') {
            expect(result.current.state.locked).toBe(true);
            expect(result.current.state.error?.kind).toBe('too_many_attempts');
        }
    });

    it('código expirado recebe tratamento distinto de código incorreto e não decrementa tentativas', async () => {
        const { result } = await goToCodePhase();
        mockVerifyOTPExecute.mockRejectedValue(new OTPExpiredError());

        await act(async () => { await result.current.verifyCode('12345678'); });

        expect(result.current.state.phase).toBe('code');
        if (result.current.state.phase === 'code') {
            expect(result.current.state.error?.kind).toBe('expired');
            expect(result.current.state.error?.attemptsRemaining).toBeNull();
            expect(result.current.state.locked).toBe(false);
        }

        // uma tentativa real ainda restante logo depois — mostra que a expiração não consumiu o contador local
        mockVerifyOTPExecute.mockRejectedValue(new InvalidOTPError());
        await act(async () => { await result.current.verifyCode('00000000'); });
        expect(result.current.state.phase === 'code' && result.current.state.error?.attemptsRemaining).toBe(9);
    });

    it('rate limit recebe tratamento distinto, usando o Retry-After real quando disponível', async () => {
        const { result } = await goToCodePhase();
        mockVerifyOTPExecute.mockRejectedValue(new RateLimitError(42));

        await act(async () => { await result.current.verifyCode('12345678'); });

        expect(result.current.state.phase).toBe('code');
        if (result.current.state.phase === 'code') {
            expect(result.current.state.error?.kind).toBe('rate_limited');
            expect(result.current.state.error?.message).toContain('42s');
        }
    });

    it('reenvio respeita o cooldown e não dispara nova chamada', async () => {
        const { result } = await goToCodePhase();
        mockSendPasswordResetExecute.mockClear();

        const ok = await act(async () => result.current.resendCode());

        expect(ok).toBe(false);
        expect(mockSendPasswordResetExecute).not.toHaveBeenCalled();
    });

    it('verificação bem-sucedida avança para PASSWORD sem nenhum erro residual', async () => {
        const { result } = await goToPasswordPhase();

        expect(result.current.state.phase).toBe('password');
        if (result.current.state.phase === 'password') {
            expect(result.current.state.error).toBeNull();
        }
    });

    it('um erro de código antigo não sobrevive à transição para PASSWORD', async () => {
        const { result } = await goToCodePhase();
        mockVerifyOTPExecute.mockRejectedValueOnce(new InvalidOTPError());
        await act(async () => { await result.current.verifyCode('00000000'); });
        expect(result.current.state.phase === 'code' && result.current.state.error).not.toBeNull();

        mockVerifyOTPExecute.mockResolvedValueOnce(undefined);
        await act(async () => { await result.current.verifyCode('12345678'); });

        expect(result.current.state.phase).toBe('password');
        if (result.current.state.phase === 'password') {
            expect(result.current.state.error).toBeNull();
        }
    });

    it('weak_password permanece na fase PASSWORD com erro próprio, não é reportado como sucesso', async () => {
        const { result } = await goToPasswordPhase();
        mockResetPasswordWithOTP.mockRejectedValue(new WeakPasswordError('A senha deve ter no mínimo 6 caracteres'));

        await act(async () => { await result.current.resetPassword('123', '123'); });

        expect(result.current.state.phase).toBe('password');
        if (result.current.state.phase === 'password') {
            expect(result.current.state.error?.kind).toBe('weak');
            expect(result.current.state.error?.message).toBe('A senha deve ter no mínimo 6 caracteres');
        }
        expect(mockSignOut).not.toHaveBeenCalled();
    });

    it('senhas divergentes permanecem na fase PASSWORD com erro de mismatch', async () => {
        const { result } = await goToPasswordPhase();

        await act(async () => { await result.current.resetPassword('senhaNova1', 'outraSenha2'); });

        expect(result.current.state.phase).toBe('password');
        if (result.current.state.phase === 'password') {
            expect(result.current.state.error?.kind).toBe('mismatch');
        }
        expect(mockResetPasswordWithOTP).not.toHaveBeenCalled();
    });

    it('falha transitória ao persistir a senha não apresenta sucesso e permite nova tentativa', async () => {
        const { result } = await goToPasswordPhase();
        mockResetPasswordWithOTP.mockRejectedValue(new Error('network blip'));

        await act(async () => { await result.current.resetPassword('senhaNova1', 'senhaNova1'); });

        expect(result.current.state.phase).toBe('password');
        if (result.current.state.phase === 'password') {
            expect(result.current.state.error?.kind).toBe('unknown');
        }
    });

    it('sessão de recovery expirada durante a submissão da senha não apresenta sucesso e reinicia o fluxo', async () => {
        const { result } = await goToPasswordPhase();
        mockResetPasswordWithOTP.mockRejectedValue(new OTPExpiredError());

        await act(async () => { await result.current.resetPassword('senhaNova1', 'senhaNova1'); });

        expect(result.current.state.phase).not.toBe('success');
        expect(result.current.state.phase).toBe('email');
        if (result.current.state.phase === 'email') {
            expect(result.current.state.error).toContain('sessão de redefinição expirou');
        }
        expect(mockSignOut).not.toHaveBeenCalled();
    });

    it('sucesso só ocorre após a API de troca de senha confirmar, e então encerra a sessão', async () => {
        const { result } = await goToPasswordPhase();
        mockResetPasswordWithOTP.mockResolvedValue(undefined);
        mockSignOut.mockResolvedValue(undefined);

        await act(async () => { await result.current.resetPassword('senhaNova1', 'senhaNova1'); });

        expect(result.current.state.phase).toBe('success');
        expect(mockResetPasswordWithOTP).toHaveBeenCalledWith('senhaNova1');
        expect(mockSignOut).toHaveBeenCalledTimes(1);
    });
});
