import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
    mockCreateServerClient,
    mockGetUser,
    shouldSetRefreshCookie,
} = vi.hoisted(() => ({
    mockCreateServerClient: vi.fn(),
    mockGetUser: vi.fn(),
    shouldSetRefreshCookie: { value: false },
}));

vi.mock('@supabase/ssr', () => ({
    createServerClient: mockCreateServerClient,
}));

import { proxy } from '@/proxy';

function createRequest(url: string): NextRequest {
    const requestUrl = new URL(url);

    return {
        url: requestUrl.toString(),
        nextUrl: requestUrl,
        headers: new Headers(),
        cookies: {
            getAll: vi.fn(() => []),
        },
    } as unknown as NextRequest;
}

describe('proxy auth guard', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        shouldSetRefreshCookie.value = false;

        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

        mockGetUser.mockResolvedValue({ data: { user: null } });
        mockCreateServerClient.mockImplementation((_url: string, _key: string, options: any) => ({
            auth: {
                getUser: vi.fn(async () => {
                    const result = await mockGetUser();

                    if (shouldSetRefreshCookie.value) {
                        options.cookies.setAll([
                            {
                                name: 'sb-refresh',
                                value: 'fresh-token',
                                options: { path: '/' },
                            },
                        ]);
                    }

                    return result;
                }),
            },
        }));
    });

    it('permite /home para usuário autenticado', async () => {
        mockGetUser.mockResolvedValueOnce({
            data: { user: { id: 'u1', app_metadata: { role: 'user' } } },
        });

        const response = await proxy(createRequest('http://localhost/home'));

        expect(response.status).toBe(200);
        expect(response.headers.get('location')).toBeNull();
    });

    it('redireciona /home para / quando usuário não está autenticado', async () => {
        const response = await proxy(createRequest('http://localhost/home'));

        expect(response.headers.get('location')).toBe('http://localhost/');
    });

    it('redireciona /user para modal de login quando usuário não está autenticado', async () => {
        const response = await proxy(createRequest('http://localhost/user'));

        expect(response.headers.get('location')).toBe('http://localhost/?authModal=login');
    });

    it('redireciona / para /home quando usuário já está autenticado', async () => {
        mockGetUser.mockResolvedValueOnce({
            data: { user: { id: 'u1', app_metadata: { role: 'user' } } },
        });

        const response = await proxy(createRequest('http://localhost/'));

        expect(response.headers.get('location')).toBe('http://localhost/home');
    });

    it('bloqueia /painel-admin para usuário sem role admin', async () => {
        mockGetUser.mockResolvedValueOnce({
            data: { user: { id: 'u1', app_metadata: { role: 'user' } } },
        });

        const response = await proxy(createRequest('http://localhost/painel-admin'));

        expect(response.headers.get('location')).toBe('http://localhost/home');
    });

    it('permite /painel-admin para usuário admin', async () => {
        mockGetUser.mockResolvedValueOnce({
            data: { user: { id: 'u1', app_metadata: { role: 'admin' } } },
        });

        const response = await proxy(createRequest('http://localhost/painel-admin'));

        expect(response.status).toBe(200);
        expect(response.headers.get('location')).toBeNull();
    });

    it('preserva cookies de refresh quando a resposta final é redirect', async () => {
        shouldSetRefreshCookie.value = true;
        mockGetUser.mockResolvedValueOnce({
            data: { user: { id: 'u1', app_metadata: { role: 'user' } } },
        });

        const response = await proxy(createRequest('http://localhost/'));

        expect(response.headers.get('location')).toBe('http://localhost/home');
        expect(response.cookies.get('sb-refresh')?.value).toBe('fresh-token');
    });
});
