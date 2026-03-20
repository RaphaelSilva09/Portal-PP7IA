import { describe, expect, it, vi, beforeEach } from 'vitest';
import { SupabaseAuthRepository } from '@/infrastructure/repositories/SupabaseAuthRepository';
import {
    EmailNotConfirmedError,
    InvalidCredentialsError,
    NetworkError,
    UnknownAuthError,
    UserAlreadyExistsError,
} from '@/domain/errors/AuthError';

function createMockSupabaseClient() {
    const mockSingle = vi.fn();
    const mockEq = vi.fn(() => ({ single: mockSingle }));
    const mockSelect = vi.fn(() => ({ eq: mockEq }));
    const mockFrom = vi.fn(() => ({ select: mockSelect }));

    return {
        auth: {
            signInWithPassword: vi.fn(),
            signUp: vi.fn(),
            signOut: vi.fn(),
            getUser: vi.fn(),
            verifyOtp: vi.fn(),
            resetPasswordForEmail: vi.fn(),
            updateUser: vi.fn(),
        },
        from: mockFrom,
        _mockSingle: mockSingle,
    };
}

const validUserRow = {
    email: 'test@example.com',
    nome: 'Test User',
    celular: '11999999999',
    accept_email_updates: true,
    accept_whatsapp_updates: false,
    created_at: '2024-01-01T00:00:00Z',
};

describe('SupabaseAuthRepository', () => {
    let mockClient: ReturnType<typeof createMockSupabaseClient>;
    let repo: SupabaseAuthRepository;

    beforeEach(() => {
        mockClient = createMockSupabaseClient();
        repo = new SupabaseAuthRepository(mockClient as any);
    });

    describe('signIn', () => {
        it('com credenciais corretas → retorna AuthResult com user e session', async () => {
            mockClient.auth.signInWithPassword.mockResolvedValue({
                data: {
                    user: { id: 'u1', app_metadata: { role: 'user' } },
                    session: { access_token: 'at', refresh_token: 'rt' },
                },
                error: null,
            });
            mockClient._mockSingle.mockResolvedValue({
                data: validUserRow,
                error: null,
            });

            const result = await repo.signIn({ email: 'test@example.com', password: '123456' });

            expect(result.user.email).toBe('test@example.com');
            expect(result.session?.accessToken).toBe('at');
        });

        it('com error "invalid login credentials" → lança InvalidCredentialsError', async () => {
            mockClient.auth.signInWithPassword.mockResolvedValue({
                data: { user: null, session: null },
                error: { message: 'invalid login credentials', code: null },
            });

            await expect(
                repo.signIn({ email: 'test@example.com', password: 'errada' })
            ).rejects.toBeInstanceOf(InvalidCredentialsError);
        });

        it('com error "email not confirmed" → lança EmailNotConfirmedError', async () => {
            mockClient.auth.signInWithPassword.mockResolvedValue({
                data: { user: null, session: null },
                error: { message: 'email not confirmed', code: null },
            });

            await expect(
                repo.signIn({ email: 'test@example.com', password: '123456' })
            ).rejects.toBeInstanceOf(EmailNotConfirmedError);
        });

        it('com error de rede → lança NetworkError', async () => {
            mockClient.auth.signInWithPassword.mockResolvedValue({
                data: { user: null, session: null },
                error: { message: 'network error', code: 'NETWORK_ERROR' },
            });

            await expect(
                repo.signIn({ email: 'test@example.com', password: '123456' })
            ).rejects.toBeInstanceOf(NetworkError);
        });
    });

    describe('signUp', () => {
        it('com email já cadastrado (identities vazio) → lança UserAlreadyExistsError', async () => {
            mockClient.auth.signUp.mockResolvedValue({
                data: {
                    user: {
                        id: 'u1',
                        identities: [],
                    },
                    session: null,
                },
                error: null,
            });

            await expect(
                repo.signUp({
                    email: 'existing@example.com',
                    password: '123456',
                    nome: 'User',
                    celular: '11999999999',
                    acceptEmailUpdates: true,
                    acceptWhatsAppUpdates: false,
                })
            ).rejects.toBeInstanceOf(UserAlreadyExistsError);
        });
    });

    describe('getCurrentUser', () => {
        it('sem sessão → retorna null', async () => {
            mockClient.auth.getUser.mockResolvedValue({
                data: { user: null },
            });

            const result = await repo.getCurrentUser();

            expect(result).toBeNull();
        });
    });

    describe('verifyPasswordResetOTP', () => {
        it('OTP inválido → lança UnknownAuthError com mensagem de código inválido', async () => {
            mockClient.auth.verifyOtp.mockResolvedValue({
                data: {},
                error: { message: 'Invalid OTP token' },
            });

            await expect(
                repo.verifyPasswordResetOTP({ email: 'test@test.com', token: '12345678' })
            ).rejects.toBeInstanceOf(UnknownAuthError);
        });

        it('OTP expirado → lança UnknownAuthError com mensagem de código expirado', async () => {
            mockClient.auth.verifyOtp.mockResolvedValue({
                data: {},
                error: { message: 'Token has expired' },
            });

            const err = await repo.verifyPasswordResetOTP({ email: 'test@test.com', token: '12345678' }).catch(e => e);
            expect(err).toBeInstanceOf(UnknownAuthError);
            expect(err.message).toMatch(/expirado/i);
        });
    });
});
