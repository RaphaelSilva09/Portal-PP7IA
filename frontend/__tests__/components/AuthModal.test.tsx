import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
    mockAuthState,
    mockOpenForgotPasswordModal,
    mockRouterPush,
} = vi.hoisted(() => ({
    mockAuthState: {
        user: null,
        isLoading: false,
        error: null as string | null,
        emailConfirmationRequired: false,
        signUp: vi.fn(),
        signIn: vi.fn(),
        signOut: vi.fn(),
        getCurrentUser: vi.fn(),
        updateEmail: vi.fn(),
        updatePassword: vi.fn(),
        updatePreferences: vi.fn(),
        updateProfile: vi.fn(),
        deleteAccount: vi.fn(),
        sendPasswordReset: vi.fn(),
        resetPasswordWithToken: vi.fn(),
        clearError: vi.fn(),
    },
    mockOpenForgotPasswordModal: vi.fn(),
    mockRouterPush: vi.fn(),
}));

vi.mock('@/context/AuthContext', () => ({
    useAuth: vi.fn(() => mockAuthState),
}));

vi.mock('@/context/ForgotPasswordModalContext', () => ({
    useForgotPasswordModal: vi.fn(() => ({ openModal: mockOpenForgotPasswordModal })),
}));

vi.mock('next/navigation', () => ({
    useRouter: vi.fn(() => ({ push: mockRouterPush })),
}));

vi.mock('@/components/Portal', () => ({
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import AuthModal from '@/components/AuthModal';

describe('AuthModal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        Object.defineProperty(window, 'scrollTo', {
            value: vi.fn(),
            writable: true,
            configurable: true,
        });
        Object.assign(mockAuthState, {
            user: null,
            isLoading: false,
            error: null,
            emailConfirmationRequired: false,
        });
        mockAuthState.signUp.mockResolvedValue({ emailConfirmationRequired: false });
        mockAuthState.signIn.mockResolvedValue(undefined);
    });

    it('login bem-sucedido chama signIn, fecha modal e navega para /home', async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();

        render(<AuthModal isOpen onClose={onClose} initialMode="login" />);

        await user.type(screen.getByLabelText('Email'), 'test@example.com');
        await user.type(screen.getByLabelText('Senha'), '123456');
        await user.click(screen.getByRole('button', { name: 'Entrar' }));

        await waitFor(() => {
            expect(mockAuthState.signIn).toHaveBeenCalledWith({
                email: 'test@example.com',
                password: '123456',
            });
            expect(onClose).toHaveBeenCalledTimes(1);
            expect(mockRouterPush).toHaveBeenCalledWith('/home');
        });
    });

    it('signup com confirmação de email mostra mensagem de sucesso sem fechar modal', async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();
        mockAuthState.signUp.mockResolvedValueOnce({ emailConfirmationRequired: true });

        render(<AuthModal isOpen onClose={onClose} initialMode="signup" />);

        await user.type(screen.getByLabelText('Nome Completo'), 'Test User');
        await user.type(screen.getByLabelText('Email'), 'test@example.com');
        await user.type(screen.getByLabelText('Celular'), '11999999999');
        await user.type(screen.getByLabelText('Senha'), '123456');
        await user.click(screen.getByText('Aceito receber atualizações e novidades por e-mail'));
        await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

        await waitFor(() => {
            expect(mockAuthState.signUp).toHaveBeenCalledWith(
                expect.objectContaining({
                    nome: 'Test User',
                    email: 'test@example.com',
                    acceptEmailUpdates: true,
                    acceptWhatsAppUpdates: false,
                }),
            );
            expect(screen.getByText(/verifique seu email para confirmar sua conta/i)).toBeTruthy();
            expect(onClose).not.toHaveBeenCalled();
            expect(mockRouterPush).not.toHaveBeenCalled();
        });
    });

    it('signup sem consentimento bloqueia submit e exibe erro de validação', async () => {
        const user = userEvent.setup();

        render(<AuthModal isOpen onClose={vi.fn()} initialMode="signup" />);

        await user.type(screen.getByLabelText('Nome Completo'), 'Test User');
        await user.type(screen.getByLabelText('Email'), 'test@example.com');
        await user.type(screen.getByLabelText('Celular'), '11999999999');
        await user.type(screen.getByLabelText('Senha'), '123456');
        await user.click(screen.getByRole('button', { name: 'Cadastrar' }));

        expect(screen.getByText(/aceite pelo menos uma forma de receber atualizações/i)).toBeTruthy();
        expect(mockAuthState.signUp).not.toHaveBeenCalled();
    });

    it('renderiza erro de autenticação vindo do contexto', () => {
        mockAuthState.error = 'Email ou senha inválidos';

        render(<AuthModal isOpen onClose={vi.fn()} initialMode="login" />);

        expect(screen.getByText('Email ou senha inválidos')).toBeTruthy();
    });

    it('link de esqueci a senha fecha modal e abre o modal dedicado', async () => {
        const user = userEvent.setup();
        const onClose = vi.fn();

        render(<AuthModal isOpen onClose={onClose} initialMode="login" />);

        await user.click(screen.getByRole('button', { name: 'Esqueceu sua senha?' }));

        expect(onClose).toHaveBeenCalledTimes(1);
        expect(mockOpenForgotPasswordModal).toHaveBeenCalledTimes(1);
    });
});
