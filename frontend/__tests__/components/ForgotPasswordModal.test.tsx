import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockRecoveryState, mockCloseModal } = vi.hoisted(() => ({
    mockRecoveryState: {
        recoveryStatus: 'awaiting_code' as
            | 'idle'
            | 'awaiting_code'
            | 'verifying'
            | 'ready'
            | 'success'
            | 'error',
        recoveryError: null as string | null,
        userEmail: 'usuario@example.com',
        isLoading: false,
        cooldownRemaining: 0,
        requestReset: vi.fn(),
        verifyCode: vi.fn(),
        resendCode: vi.fn(),
        resetPassword: vi.fn(),
    },
    mockCloseModal: vi.fn(),
}));

vi.mock('@/hooks/usePasswordRecovery', () => ({
    usePasswordRecovery: vi.fn(() => mockRecoveryState),
}));

vi.mock('@/context/ForgotPasswordModalContext', () => ({
    useForgotPasswordModal: vi.fn(() => ({ isOpen: true, closeModal: mockCloseModal })),
}));

vi.mock('@/components/Portal', () => ({
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import ForgotPasswordModal from '@/components/ForgotPasswordModal';

describe('ForgotPasswordModal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        Object.defineProperty(window, 'scrollTo', {
            value: vi.fn(),
            writable: true,
            configurable: true,
        });
        Object.assign(mockRecoveryState, {
            recoveryStatus: 'awaiting_code',
            recoveryError: null,
            userEmail: 'usuario@example.com',
            isLoading: false,
            cooldownRemaining: 0,
        });
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
});
