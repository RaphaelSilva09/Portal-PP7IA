import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
    mockCreateServerClient,
    mockExchangeCodeForSession,
    mockVerifyOtp,
} = vi.hoisted(() => ({
    mockCreateServerClient: vi.fn(),
    mockExchangeCodeForSession: vi.fn(),
    mockVerifyOtp: vi.fn(),
}));

vi.mock('@supabase/ssr', () => ({
    createServerClient: mockCreateServerClient,
}));

import { GET } from '@/app/auth/confirm/route';

describe('app/auth/confirm/route', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

        mockExchangeCodeForSession.mockResolvedValue({ error: null });
        mockVerifyOtp.mockResolvedValue({ error: null });
        mockCreateServerClient.mockImplementation((_url: string, _key: string, options: any) => ({
            auth: {
                exchangeCodeForSession: vi.fn(async (code: string) => {
                    const result = await mockExchangeCodeForSession(code);

                    if (!result?.error) {
                        options.cookies.setAll([
                            {
                                name: 'sb-test-auth',
                                value: 'cookie-value',
                                options: { path: '/' },
                            },
                        ]);
                    }

                    return result;
                }),
                verifyOtp: vi.fn(async (params: unknown) => {
                    const result = await mockVerifyOtp(params);

                    if (!result?.error) {
                        options.cookies.setAll([
                            {
                                name: 'sb-test-auth',
                                value: 'cookie-value',
                                options: { path: '/' },
                            },
                        ]);
                    }

                    return result;
                }),
            },
        }));
    });

    it('troca code por sessão e redireciona para /home com cookie de sessão', async () => {
        const response = await GET(new NextRequest('http://localhost/auth/confirm?code=auth-code-123'));

        expect(mockExchangeCodeForSession).toHaveBeenCalledWith('auth-code-123');
        expect(mockVerifyOtp).not.toHaveBeenCalled();
        expect(response.status).toBe(303);
        expect(response.headers.get('location')).toBe('http://localhost/home');
        expect(response.cookies.get('sb-test-auth')?.value).toBe('cookie-value');
    });

    it('verifica o token e redireciona para /home com cookie de sessão', async () => {
        const response = await GET(new NextRequest('http://localhost/auth/confirm?token_hash=hash123&type=email'));

        expect(mockVerifyOtp).toHaveBeenCalledWith({
            token_hash: 'hash123',
            type: 'email',
        });
        expect(response.status).toBe(303);
        expect(response.headers.get('location')).toBe('http://localhost/home');
        expect(response.cookies.get('sb-test-auth')?.value).toBe('cookie-value');
    });

    it('redireciona para / quando token_hash ou type estiver ausente', async () => {
        const response = await GET(new NextRequest('http://localhost/auth/confirm?type=email'));

        expect(mockVerifyOtp).not.toHaveBeenCalled();
        expect(response.status).toBe(303);
        expect(response.headers.get('location')).toBe('http://localhost/');
    });

    it('redireciona para / quando verifyOtp falha', async () => {
        mockVerifyOtp.mockResolvedValueOnce({ error: { message: 'invalid token' } });

        const response = await GET(new NextRequest('http://localhost/auth/confirm?token_hash=hash123&type=email'));

        expect(response.status).toBe(303);
        expect(response.headers.get('location')).toBe('http://localhost/');
        expect(response.cookies.get('sb-test-auth')).toBeUndefined();
    });

    it('aceita next interno seguro', async () => {
        const response = await GET(
            new NextRequest('http://localhost/auth/confirm?token_hash=hash123&type=email&next=%2Fuser'),
        );

        expect(response.headers.get('location')).toBe('http://localhost/user');
    });

    it('ignora next externo e usa /home como fallback seguro', async () => {
        const response = await GET(
            new NextRequest('http://localhost/auth/confirm?token_hash=hash123&type=email&next=https%3A%2F%2Fevil.com'),
        );

        expect(response.headers.get('location')).toBe('http://localhost/home');
    });
});
