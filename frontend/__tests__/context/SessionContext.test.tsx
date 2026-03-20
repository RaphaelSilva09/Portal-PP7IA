import { act, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { SessionProvider, useSession } from '@/context/SessionContext';
import { User } from '@/domain/entities/User';
import { InvalidCredentialsError } from '@/domain/errors/AuthError';

// vi.hoisted ensures these vars are available inside vi.mock factory (which is hoisted to top)
const {
    mockGetSession,
    mockGetUserFromSession,
    mockSignInExecute,
    mockUnsubscribe,
    capturedCallback,
} = vi.hoisted(() => {
    const capturedCallback = { value: null as ((event: string, session: any) => Promise<void>) | null };
    return {
        mockGetSession: vi.fn(),
        mockGetUserFromSession: vi.fn(),
        mockSignInExecute: vi.fn(),
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
        getSignUpUseCase: vi.fn(() => ({ execute: vi.fn() })),
        getSignOutUseCase: vi.fn(() => ({ execute: vi.fn() })),
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
});
