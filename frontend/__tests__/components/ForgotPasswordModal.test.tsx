import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { RecoveryState } from '@/hooks/usePasswordRecovery';

const { mockRecoveryResult, mockCloseModal } = vi.hoisted(() => ({
    mockRecoveryResult: {
        state: {
            phase: 'code',
            email: 'usuario@example.com',
            isSubmitting: false,
            isResending: false,
            error: null,
            resendNotice: null,
            locked: false,
        } as RecoveryState,
        cooldownRemaining: 0,
        requestReset: vi.fn(),
        verifyCode: vi.fn(),
        resendCode: vi.fn(),
        resetPassword: vi.fn(),
        restartRecovery: vi.fn(),
    },
    mockCloseModal: vi.fn(),
}));

vi.mock('@/hooks/usePasswordRecovery', () => ({
    usePasswordRecovery: vi.fn(() => mockRecoveryResult),
}));

vi.mock('@/context/ForgotPasswordModalContext', () => ({
    useForgotPasswordModal: vi.fn(() => ({ isOpen: true, closeModal: mockCloseModal })),
}));

vi.mock('@/components/Portal', () => ({
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import ForgotPasswordModal from '@/components/ForgotPasswordModal';

function setState(state: RecoveryState) {
    mockRecoveryResult.state = state;
}

describe('ForgotPasswordModal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        Object.defineProperty(window, 'scrollTo', {
            value: vi.fn(),
            writable: true,
            configurable: true,
        });
        setState({
            phase: 'code',
            email: 'usuario@example.com',
            isSubmitting: false,
            isResending: false,
            error: null,
            resendNotice: null,
            locked: false,
        });
        mockRecoveryResult.cooldownRemaining = 0;
    });

    it('mantém o foco no campo de código enquanto o usuário digita', async () => {
        const user = userEvent.setup();

        render(<ForgotPasswordModal />);

        const otpInput = screen.getByPlaceholderText('00000000') as HTMLInputElement;
        await user.click(otpInput);
        await user.keyboard('12345678');

        expect(otpInput.value).toBe('12345678');
        expect(document.activeElement).toBe(otpInput);
    });

    it('nunca renderiza o título/copy de sucesso junto com um erro de código (regressão)', () => {
        setState({
            phase: 'code',
            email: 'usuario@example.com',
            isSubmitting: false,
            isResending: false,
            error: { kind: 'invalid', message: 'Código incorreto. Restam 9 tentativas.', attemptsRemaining: 9 },
            resendNotice: null,
            locked: false,
        });

        render(<ForgotPasswordModal />);

        expect(screen.getByText('Código incorreto. Restam 9 tentativas.')).toBeTruthy();
        expect(screen.queryByText(/Tudo certo/i)).toBeNull();
        expect(screen.queryByText(/redefinida com sucesso/i)).toBeNull();
    });

    it('erro de código é anunciado via role="alert" e associado ao input via aria-describedby', () => {
        setState({
            phase: 'code',
            email: 'usuario@example.com',
            isSubmitting: false,
            isResending: false,
            error: { kind: 'invalid', message: 'Código incorreto. Restam 8 tentativas.', attemptsRemaining: 8 },
            resendNotice: null,
            locked: false,
        });

        render(<ForgotPasswordModal />);

        const alert = screen.getByRole('alert');
        expect(alert.textContent).toContain('Restam 8 tentativas');

        const otpInput = screen.getByPlaceholderText('00000000');
        expect(otpInput.getAttribute('aria-invalid')).toBe('true');
        expect(otpInput.getAttribute('aria-describedby')).toContain(alert.id);
    });

    it('bloqueia o campo e o botão de verificar quando o limite de tentativas é atingido', () => {
        setState({
            phase: 'code',
            email: 'usuario@example.com',
            isSubmitting: false,
            isResending: false,
            error: {
                kind: 'too_many_attempts',
                message: 'Limite de tentativas atingido. Solicite um novo código para continuar.',
                attemptsRemaining: 0,
            },
            resendNotice: null,
            locked: true,
        });

        render(<ForgotPasswordModal />);

        expect((screen.getByPlaceholderText('00000000') as HTMLInputElement).disabled).toBe(true);
        expect((screen.getByRole('button', { name: /verificar código/i }) as HTMLButtonElement).disabled).toBe(true);
    });

    it('renderiza o passo de sucesso somente na fase success, sem nenhum banner de erro', () => {
        setState({ phase: 'success' });

        render(<ForgotPasswordModal />);

        expect(screen.getByText('Tudo certo!')).toBeTruthy();
        expect(screen.queryByRole('alert')).toBeNull();
    });

    it('erro da etapa de senha nunca aparece como erro de código', () => {
        setState({
            phase: 'password',
            email: 'usuario@example.com',
            isSubmitting: false,
            error: { kind: 'weak', message: 'A senha deve ter no mínimo 6 caracteres' },
        });

        render(<ForgotPasswordModal />);

        expect(screen.getByText('A senha deve ter no mínimo 6 caracteres')).toBeTruthy();
        expect(screen.queryByPlaceholderText('00000000')).toBeNull();
    });
});
