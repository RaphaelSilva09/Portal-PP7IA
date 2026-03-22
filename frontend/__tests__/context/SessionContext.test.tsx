import { act, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { SessionProvider, useSession } from '@/context/SessionContext';
import { User } from '@/domain/entities/User';
import { InvalidCredentialsError } from '@/domain/errors/AuthError';

// vi.hoisted ensures these vars are available inside vi.mock factory (which is hoisted to top)
const {
    mockGetSession,
    mockGetUserFromSession,
    mockSignInExecute,
    mockSignOutExecute,
    mockSignUpExecute,
    mockUnsubscribe,
    capturedCallback,
} = vi.hoisted(() => {
    const capturedCallback = { value: null as ((event: string, session: any) => Promise<void>) | null };
    return {
        mockGetSession: vi.fn(),
        mockGetUserFromSession: vi.fn(),
        mockSignInExecute: vi.fn(),
        mockSignOutExecute: vi.fn(),
        mockSignUpExecute: vi.fn(),
        mockUnsubscribe: vi.fn(),
        capturedCallback,
    };
});

vi.mock('@/infrastructure/config/supabase', () => ({
    supabase: {
        auth: {
            onAuthStateChange: vi.fn((cb) => {
                capturedCallback.value = cb;
                return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
            }),
            getSession: mockGetSession,
        },
    },
}));

vi.mock('@/infrastructure/di/container', () => ({
    default: {
        getAuthRepository: vi.fn(() => ({
            getUserFromSession: mockGetUserFromSession,
            getCurrentUser: vi.fn(),
        })),
        getSignInUseCase: vi.fn(() => ({ execute: mockSignInExecute })),
        getSignUpUseCase: vi.fn(() => ({ execute: mockSignUpExecute })),
        getSignOutUseCase: vi.fn(() => ({ execute: mockSignOutExecute })),
    },
}));

const mockUser = User.create({
    id: 'u1',
    email: 'test@example.com',
    nome: 'Test User',
    celular: '11999999999',
    acceptEmailUpdates: true,
    acceptWhatsAppUpdates: false,
    createdAt: new Date(),
    role: 'user',
});

function SessionConsumer() {
    const { user, isLoading, error } = useSession();
    return (
        <div>
            <span data-testid="loading">{isLoading ? 'loading' : 'done'}</span>
            <span data-testid="user">{user?.email ?? 'null'}</span>
            <span data-testid="error">{error ?? 'null'}</span>
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
                onClick={async () => {
                    try {
                        await signIn({ email: 'test@test.com', password: 'wrong' });
                    } catch {}
                }}
            >
                Sign In
            </button>
        </div>
    );
}

function SignOutButton() {
    const { signOut, isLoading } = useSession();
    return (
        <div>
            <span data-testid="loading">{isLoading ? 'loading' : 'done'}</span>
            <button onClick={() => signOut().catch(() => {})}>Sign Out</button>
        </div>
    );
}

function EmailConfirmationConsumer() {
    const { signUp, emailConfirmationRequired } = useSession();
    return (
        <div>
            <span data-testid="emailConfirmation">{emailConfirmationRequired ? 'true' : 'false'}</span>
            <button
                onClick={async () => {
                    try {
                        await signUp({
                            email: 't@t.com',
                            password: '123456',
                            nome: 'T',
                            celular: '11999999999',
                            acceptEmailUpdates: false,
                            acceptWhatsAppUpdates: false,
                        });
                    } catch {}
                }}
            >
                Sign Up
            </button>
        </div>
    );
}

describe('SessionContext', () => {
    beforeEach(() => {
        capturedCallback.value = null;
        vi.clearAllMocks();
        mockGetSession.mockResolvedValue({ data: { session: null } });
    });

    it('INITIAL_SESSION com sessão → user populado, isLoading=false', async () => {
        mockGetUserFromSession.mockResolvedValue(mockUser);

        render(
            <SessionProvider>
                <SessionConsumer />
            </SessionProvider>
        );

        await act(async () => {
            await capturedCallback.value!('INITIAL_SESSION', {
                user: { id: 'u1', app_metadata: { role: 'user' } },
            });
        });

        await waitFor(() => {
            expect(screen.getByTestId('user').textContent).toBe('test@example.com');
            expect(screen.getByTestId('loading').textContent).toBe('done');
        });
    });

    it('INITIAL_SESSION sem sessão → user=null, isLoading=false', async () => {
        render(
            <SessionProvider>
                <SessionConsumer />
            </SessionProvider>
        );

        await act(async () => {
            await capturedCallback.value!('INITIAL_SESSION', null);
        });

        await waitFor(() => {
            expect(screen.getByTestId('user').textContent).toBe('null');
            expect(screen.getByTestId('loading').textContent).toBe('done');
        });
    });

    it('SIGNED_OUT → user=null', async () => {
        mockGetUserFromSession.mockResolvedValue(mockUser);

        render(
            <SessionProvider>
                <SessionConsumer />
            </SessionProvider>
        );

        await act(async () => {
            await capturedCallback.value!('INITIAL_SESSION', {
                user: { id: 'u1', app_metadata: {} },
            });
        });

        await act(async () => {
            await capturedCallback.value!('SIGNED_OUT', null);
        });

        await waitFor(() => {
            expect(screen.getByTestId('user').textContent).toBe('null');
        });
    });

    it('TOKEN_REFRESHED → user atualizado', async () => {
        const updatedUser = User.create({ ...mockUser.toObject(), email: 'updated@example.com' });
        mockGetUserFromSession.mockResolvedValue(updatedUser);

        render(
            <SessionProvider>
                <SessionConsumer />
            </SessionProvider>
        );

        await act(async () => {
            await capturedCallback.value!('TOKEN_REFRESHED', {
                user: { id: 'u1', app_metadata: { role: 'user' } },
            });
        });

        await waitFor(() => {
            expect(screen.getByTestId('user').textContent).toBe('updated@example.com');
        });
    });

    it('visibilitychange para visible → getSession chamado', async () => {
        render(
            <SessionProvider>
                <SessionConsumer />
            </SessionProvider>
        );

        await act(async () => {
            await capturedCallback.value!('INITIAL_SESSION', null);
        });

        const callsBefore = mockGetSession.mock.calls.length;

        await act(async () => {
            Object.defineProperty(document, 'visibilityState', {
                value: 'visible',
                writable: true,
                configurable: true,
            });
            document.dispatchEvent(new Event('visibilitychange'));
        });

        expect(mockGetSession.mock.calls.length).toBeGreaterThan(callsBefore);
    });

    it('signIn com erro → isLoading=false, error setado', async () => {
        mockSignInExecute.mockRejectedValue(new InvalidCredentialsError());

        render(
            <SessionProvider>
                <SignInButton />
            </SessionProvider>
        );

        await act(async () => {
            await capturedCallback.value!('INITIAL_SESSION', null);
        });

        await act(async () => {
            screen.getByText('Sign In').click();
        });

        await waitFor(() => {
            expect(screen.getByTestId('loading').textContent).toBe('done');
            expect(screen.getByTestId('error').textContent).toBe('Email ou senha inválidos');
        });
    });

    describe('cascata de revalidação Safari/iOS ITP', () => {
        beforeEach(() => vi.useFakeTimers());
        afterEach(() => vi.useRealTimers());

        it('INITIAL_SESSION vazio seguido de SIGNED_IN tardio → usuário setado corretamente', async () => {
            mockGetUserFromSession.mockResolvedValue(mockUser);

            render(
                <SessionProvider>
                    <SessionConsumer />
                </SessionProvider>
            );

            await act(async () => {
                await capturedCallback.value!('INITIAL_SESSION', null);
            });

            expect(screen.getByTestId('user').textContent).toBe('null');
            expect(screen.getByTestId('loading').textContent).toBe('done');

            // Before 1s timer — still null
            await act(async () => { await vi.advanceTimersByTimeAsync(500); });
            expect(screen.getByTestId('user').textContent).toBe('null');

            // SIGNED_IN fires after the 500ms mark
            await act(async () => {
                await capturedCallback.value!('SIGNED_IN', {
                    user: { id: 'u1', app_metadata: { role: 'user' } },
                });
            });

            expect(screen.getByTestId('user').textContent).toBe('test@example.com');
            expect(screen.getByTestId('loading').textContent).toBe('done');
        });

        it('cascata 1s/3s retornam sessão nula, SIGNED_IN ganha corrida, timer de 8s é no-op', async () => {
            // Default mockGetSession returns null session (set in outer beforeEach)
            mockGetUserFromSession.mockResolvedValue(mockUser);

            render(
                <SessionProvider>
                    <SessionConsumer />
                </SessionProvider>
            );

            await act(async () => {
                await capturedCallback.value!('INITIAL_SESSION', null);
            });

            // Timer 1s fires — getSession returns null — revalidate aborts
            await act(async () => { await vi.advanceTimersByTimeAsync(1000); });

            // Timer 3s fires — getSession returns null — revalidate aborts
            await act(async () => { await vi.advanceTimersByTimeAsync(2000); });

            // SIGNED_IN wins the race — getUserFromSession called (1st and only time)
            await act(async () => {
                await capturedCallback.value!('SIGNED_IN', {
                    user: { id: 'u1', app_metadata: { role: 'user' } },
                });
            });

            // Timer 8s fires — userRef.current !== null — no-op
            await act(async () => { await vi.advanceTimersByTimeAsync(5000); });

            expect(screen.getByTestId('user').textContent).toBe('test@example.com');
            expect(mockGetUserFromSession).toHaveBeenCalledTimes(1);
        });

        it('revalidação bem-sucedida no timer de 1s → timers subsequentes são no-op', async () => {
            // Override: revalidation at 1s finds a valid session
            mockGetSession.mockResolvedValue({
                data: {
                    session: {
                        user: { id: 'u1', app_metadata: { role: 'user' } },
                    },
                },
            });
            mockGetUserFromSession.mockResolvedValue(mockUser);

            render(
                <SessionProvider>
                    <SessionConsumer />
                </SessionProvider>
            );

            await act(async () => {
                await capturedCallback.value!('INITIAL_SESSION', null);
            });

            // Timer 1s fires — getSession returns valid session — getUserFromSession called
            await act(async () => { await vi.advanceTimersByTimeAsync(1000); });

            expect(screen.getByTestId('user').textContent).toBe('test@example.com');

            // Timers 3s and 8s fire — userRef.current !== null — no-op
            await act(async () => { await vi.advanceTimersByTimeAsync(7000); });

            expect(mockGetUserFromSession).toHaveBeenCalledTimes(1);
        });
    });

    it('SIGNED_OUT após signUp com emailConfirmationRequired → reseta emailConfirmationRequired para false', async () => {
        mockSignUpExecute.mockResolvedValue({ emailConfirmationRequired: true });

        render(
            <SessionProvider>
                <EmailConfirmationConsumer />
            </SessionProvider>
        );

        await act(async () => {
            await capturedCallback.value!('INITIAL_SESSION', null);
        });

        expect(screen.getByTestId('emailConfirmation').textContent).toBe('false');

        await act(async () => {
            screen.getByText('Sign Up').click();
        });

        await waitFor(() => {
            expect(screen.getByTestId('emailConfirmation').textContent).toBe('true');
        });

        await act(async () => {
            await capturedCallback.value!('SIGNED_OUT', null);
        });

        await waitFor(() => {
            expect(screen.getByTestId('emailConfirmation').textContent).toBe('false');
        });
    });

    it('signIn bem-sucedido → isLoading resolvido para false pelo finally', async () => {
        mockSignInExecute.mockResolvedValue(undefined);

        render(
            <SessionProvider>
                <SignInButton />
            </SessionProvider>
        );

        await act(async () => {
            await capturedCallback.value!('INITIAL_SESSION', null);
        });

        await act(async () => {
            screen.getByText('Sign In').click();
        });

        await waitFor(() => {
            expect(screen.getByTestId('loading').textContent).toBe('done');
        });
    });

    it('signOut bem-sucedido → isLoading resolvido para false pelo finally', async () => {
        mockSignOutExecute.mockResolvedValue(undefined);

        render(
            <SessionProvider>
                <SignOutButton />
            </SessionProvider>
        );

        await act(async () => {
            await capturedCallback.value!('INITIAL_SESSION', null);
        });

        await act(async () => {
            screen.getByText('Sign Out').click();
        });

        await waitFor(() => {
            expect(screen.getByTestId('loading').textContent).toBe('done');
        });
    });

    it('safety timer de 8s: se execute() nunca resolver, isLoading volta para false em 8s', async () => {
        vi.useFakeTimers();
        try {
            mockSignInExecute.mockReturnValue(new Promise(() => {}));

            render(
                <SessionProvider>
                    <SignInButton />
                </SessionProvider>
            );

            await act(async () => {
                await capturedCallback.value!('INITIAL_SESSION', null);
            });

            await act(async () => {
                screen.getByText('Sign In').click();
            });

            await act(async () => { await vi.advanceTimersByTimeAsync(8001); });

            expect(screen.getByTestId('loading').textContent).toBe('done');
        } finally {
            vi.useRealTimers();
        }
    });
});
