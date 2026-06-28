import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SessionProvider, useSession } from '@/context/SessionContext';
import { User } from '@/domain/entities/User';
import { InvalidCredentialsError, UserAlreadyExistsError } from '@/domain/errors/AuthError';

const {
    mockGetSession,
    mockRepositoryGetCurrentUser,
    mockSessionState,
    mockSignInExecute,
    mockSignOutExecute,
    mockSignUpExecute,
} = vi.hoisted(() => ({
    mockGetSession: vi.fn(),
    mockRepositoryGetCurrentUser: vi.fn(),
    mockSessionState: {
        data: null as { user: Record<string, unknown> } | null,
        isPending: false,
    },
    mockSignInExecute: vi.fn(),
    mockSignOutExecute: vi.fn(),
    mockSignUpExecute: vi.fn(),
}));

vi.mock('@/lib/auth-client', () => ({
    authClient: {
        useSession: vi.fn(() => mockSessionState),
        getSession: mockGetSession,
    },
}));

vi.mock('@/infrastructure/di/container', () => ({
    default: {
        getAuthRepository: vi.fn(() => ({
            getCurrentUser: mockRepositoryGetCurrentUser,
        })),
        getSignInUseCase: vi.fn(() => ({ execute: mockSignInExecute })),
        getSignUpUseCase: vi.fn(() => ({ execute: mockSignUpExecute })),
        getSignOutUseCase: vi.fn(() => ({ execute: mockSignOutExecute })),
    },
}));

const sessionUser = {
    id: 'u1',
    email: 'test@example.com',
    nome: 'Test User',
    celular: '11999999999',
    accept_email_updates: true,
    accept_whatsapp_updates: false,
    createdAt: '2024-01-01T00:00:00.000Z',
    role: 'user',
};

const mockUser = User.create({
    id: 'u1',
    email: 'test@example.com',
    nome: 'Test User',
    celular: '11999999999',
    acceptEmailUpdates: true,
    acceptWhatsAppUpdates: false,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    role: 'user',
});

function resetSessionState() {
    mockSessionState.data = null;
    mockSessionState.isPending = false;
}

function SessionConsumer() {
    const { user, isLoading, error, emailConfirmationRequired } = useSession();
    return (
        <div>
            <span data-testid="loading">{isLoading ? 'loading' : 'done'}</span>
            <span data-testid="user">{user?.email ?? 'null'}</span>
            <span data-testid="name">{user?.nome ?? 'null'}</span>
            <span data-testid="error">{error ?? 'null'}</span>
            <span data-testid="emailConfirmation">{emailConfirmationRequired ? 'true' : 'false'}</span>
        </div>
    );
}

function SignInButton() {
    const { signIn, error, isLoading } = useSession();
    return (
        <div>
            <span data-testid="loading">{isLoading ? 'loading' : 'done'}</span>
            <span data-testid="error">{error ?? 'null'}</span>
            <button
                type="button"
                onClick={() => {
                    void signIn({ email: 'test@test.com', password: 'wrong' }).catch(() => {});
                }}
            >
                Sign In
            </button>
        </div>
    );
}

function SignOutButton() {
    const { signOut } = useSession();
    return (
        <button type="button" onClick={() => { void signOut().catch(() => {}); }}>
            Sign Out
        </button>
    );
}

function SignUpButton() {
    const { signUp, emailConfirmationRequired, error } = useSession();

    return (
        <div>
            <span data-testid="error">{error ?? 'null'}</span>
            <span data-testid="emailConfirmation">{emailConfirmationRequired ? 'true' : 'false'}</span>
            <button
                type="button"
                onClick={() => {
                    void signUp({
                        email: 'new@example.com',
                        password: '123456',
                        nome: 'New User',
                        celular: '11999999999',
                        acceptEmailUpdates: true,
                        acceptWhatsAppUpdates: false,
                    }).catch(() => {});
                }}
            >
                Sign Up
            </button>
        </div>
    );
}

function GetCurrentUserButton() {
    const { getCurrentUser, user, error } = useSession();

    return (
        <div>
            <span data-testid="user">{user?.email ?? 'null'}</span>
            <span data-testid="error">{error ?? 'null'}</span>
            <button type="button" onClick={() => { void getCurrentUser().catch(() => {}); }}>
                Get Current User
            </button>
        </div>
    );
}

describe('SessionContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        resetSessionState();
        mockGetSession.mockResolvedValue({ data: { session: { user: sessionUser } } });
        mockRepositoryGetCurrentUser.mockResolvedValue(null);
        mockSignInExecute.mockResolvedValue(undefined);
        mockSignOutExecute.mockResolvedValue(undefined);
        mockSignUpExecute.mockResolvedValue({ emailConfirmationRequired: false });
    });

    afterEach(() => {
        resetSessionState();
    });

    it('sem sessão → user=null e isLoading=false', () => {
        render(
            <SessionProvider>
                <SessionConsumer />
            </SessionProvider>,
        );

        expect(screen.getByTestId('user').textContent).toBe('null');
        expect(screen.getByTestId('loading').textContent).toBe('done');
    });

    it('sessão pendente → isLoading=true', () => {
        mockSessionState.isPending = true;

        render(
            <SessionProvider>
                <SessionConsumer />
            </SessionProvider>,
        );

        expect(screen.getByTestId('loading').textContent).toBe('loading');
    });

    it('sessão do better-auth popula usuário e resolve loading', async () => {
        mockSessionState.data = { user: sessionUser };

        render(
            <SessionProvider>
                <SessionConsumer />
            </SessionProvider>,
        );

        await waitFor(() => {
            expect(screen.getByTestId('user').textContent).toBe('test@example.com');
            expect(screen.getByTestId('name').textContent).toBe('Test User');
            expect(screen.getByTestId('loading').textContent).toBe('done');
        });
    });

    it('sessão malformada limpa usuário e resolve loading', async () => {
        mockSessionState.data = { user: { id: null, email: null } };

        render(
            <SessionProvider>
                <SessionConsumer />
            </SessionProvider>,
        );

        await waitFor(() => {
            expect(screen.getByTestId('user').textContent).toBe('null');
            expect(screen.getByTestId('loading').textContent).toBe('done');
        });
    });

    it('visibilitychange para visible revalida e limpa usuário quando servidor não tem sessão', async () => {
        mockSessionState.data = { user: sessionUser };
        mockGetSession.mockResolvedValueOnce({ data: { session: null } });

        render(
            <SessionProvider>
                <SessionConsumer />
            </SessionProvider>,
        );

        await waitFor(() => {
            expect(screen.getByTestId('user').textContent).toBe('test@example.com');
        });

        await act(async () => {
            Object.defineProperty(document, 'visibilityState', {
                value: 'visible',
                writable: true,
                configurable: true,
            });
            document.dispatchEvent(new Event('visibilitychange'));
        });

        await waitFor(() => {
            expect(mockGetSession).toHaveBeenCalledTimes(1);
            expect(screen.getByTestId('user').textContent).toBe('null');
        });
    });

    it('pageshow persisted=true revalida sessão ativa sem limpar usuário', async () => {
        mockSessionState.data = { user: sessionUser };
        mockGetSession.mockResolvedValueOnce({ data: { session: { user: sessionUser } } });

        render(
            <SessionProvider>
                <SessionConsumer />
            </SessionProvider>,
        );

        await waitFor(() => {
            expect(screen.getByTestId('user').textContent).toBe('test@example.com');
        });

        await act(async () => {
            const event = new Event('pageshow');
            Object.defineProperty(event, 'persisted', {
                value: true,
                configurable: true,
            });
            window.dispatchEvent(event);
        });

        expect(mockGetSession).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId('user').textContent).toBe('test@example.com');
    });

    it('eventos de revalidação não chamam servidor quando não há usuário local', async () => {
        render(
            <SessionProvider>
                <SessionConsumer />
            </SessionProvider>,
        );

        await act(async () => {
            const event = new Event('pageshow');
            Object.defineProperty(event, 'persisted', {
                value: true,
                configurable: true,
            });
            window.dispatchEvent(event);
        });

        expect(mockGetSession).not.toHaveBeenCalled();
    });

    it('signIn com erro de domínio expõe mensagem amigável', async () => {
        mockSignInExecute.mockRejectedValue(new InvalidCredentialsError());

        render(
            <SessionProvider>
                <SignInButton />
            </SessionProvider>,
        );

        fireEvent.click(screen.getByText('Sign In'));

        await waitFor(() => {
            expect(screen.getByTestId('loading').textContent).toBe('done');
            expect(screen.getByTestId('error').textContent).toBe('Email ou senha inválidos');
        });
    });

    it('signUp com confirmação de email atualiza flag', async () => {
        mockSignUpExecute.mockResolvedValueOnce({ emailConfirmationRequired: true });

        render(
            <SessionProvider>
                <SignUpButton />
            </SessionProvider>,
        );

        fireEvent.click(screen.getByText('Sign Up'));

        await waitFor(() => {
            expect(screen.getByTestId('emailConfirmation').textContent).toBe('true');
        });
    });

    it('signUp com erro de domínio mantém flag false e expõe mensagem', async () => {
        mockSignUpExecute.mockRejectedValue(new UserAlreadyExistsError());

        render(
            <SessionProvider>
                <SignUpButton />
            </SessionProvider>,
        );

        fireEvent.click(screen.getByText('Sign Up'));

        await waitFor(() => {
            expect(screen.getByTestId('error').textContent).toBe('Já existe uma conta com este email');
            expect(screen.getByTestId('emailConfirmation').textContent).toBe('false');
        });
    });

    it('signOut chama use case de saída', async () => {
        render(
            <SessionProvider>
                <SignOutButton />
            </SessionProvider>,
        );

        fireEvent.click(screen.getByText('Sign Out'));

        await waitFor(() => {
            expect(mockSignOutExecute).toHaveBeenCalledTimes(1);
        });
    });

    it('getCurrentUser bem-sucedido atualiza usuário atual', async () => {
        mockRepositoryGetCurrentUser.mockResolvedValueOnce(mockUser);

        render(
            <SessionProvider>
                <GetCurrentUserButton />
            </SessionProvider>,
        );

        fireEvent.click(screen.getByText('Get Current User'));

        await waitFor(() => {
            expect(screen.getByTestId('user').textContent).toBe('test@example.com');
            expect(screen.getByTestId('error').textContent).toBe('null');
        });
    });

    it('getCurrentUser com erro limpa usuário e expõe mensagem', async () => {
        mockSessionState.data = { user: sessionUser };
        mockRepositoryGetCurrentUser.mockRejectedValueOnce(new Error('fetch failed'));

        render(
            <SessionProvider>
                <GetCurrentUserButton />
            </SessionProvider>,
        );

        await waitFor(() => {
            expect(screen.getByTestId('user').textContent).toBe('test@example.com');
        });

        fireEvent.click(screen.getByText('Get Current User'));

        await waitFor(() => {
            expect(screen.getByTestId('user').textContent).toBe('null');
            expect(screen.getByTestId('error').textContent).toBe('Erro ao buscar usuário.');
        });
    });
});
