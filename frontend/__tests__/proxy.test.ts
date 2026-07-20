import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { mockGetSession } = vi.hoisted(() => ({
    mockGetSession: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
    auth: {
        api: {
            getSession: mockGetSession,
        },
    },
}));

import { proxy } from '@/proxy';

function createRequest(url: string): NextRequest {
    const requestUrl = new URL(url);

    return {
        url: requestUrl.toString(),
        nextUrl: requestUrl,
        headers: new Headers(),
    } as NextRequest;
}

describe('proxy auth guard', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    beforeEach(() => {
        vi.clearAllMocks();
        mockGetSession.mockResolvedValue(null);
    });

    afterEach(() => {
        warnSpy.mockClear();
    });

    it('permite rota pública sem consultar sessão', async () => {
        const response = await proxy(createRequest('http://localhost/home'));

        expect(response.status).toBe(200);
        expect(response.headers.get('location')).toBeNull();
        expect(mockGetSession).not.toHaveBeenCalled();
    });

    it('redireciona /user para modal de login preservando o destino', async () => {
        const response = await proxy(createRequest('http://localhost/user'));

        expect(mockGetSession).toHaveBeenCalledTimes(1);
        expect(response.headers.get('location')).toBe('http://localhost/?authModal=login&next=%2Fuser');
    });

    it('trata erro ao consultar sessão como usuário não autenticado', async () => {
        mockGetSession.mockRejectedValueOnce(new Error('database unavailable'));

        const response = await proxy(createRequest('http://localhost/user'));

        expect(response.headers.get('location')).toBe('http://localhost/?authModal=login&next=%2Fuser');
    });

    it('permite /user para usuário autenticado', async () => {
        mockGetSession.mockResolvedValueOnce({
            user: { id: 'u1', role: 'user' },
        });

        const response = await proxy(createRequest('http://localhost/user'));

        expect(response.status).toBe(200);
        expect(response.headers.get('location')).toBeNull();
    });

    it('redireciona /painel-admin para login quando não há usuário', async () => {
        const response = await proxy(createRequest('http://localhost/painel-admin'));

        expect(response.headers.get('location')).toBe('http://localhost/?authModal=login&next=%2Fpainel-admin');
    });

    it('bloqueia /painel-admin para usuário sem role admin', async () => {
        mockGetSession.mockResolvedValueOnce({
            user: { id: 'u1', role: 'user' },
        });

        const response = await proxy(createRequest('http://localhost/painel-admin'));

        expect(response.headers.get('location')).toBe('http://localhost/');
    });

    it('permite /painel-admin para usuário admin', async () => {
        mockGetSession.mockResolvedValueOnce({
            user: { id: 'u1', role: 'admin' },
        });

        const response = await proxy(createRequest('http://localhost/painel-admin'));

        expect(response.status).toBe(200);
        expect(response.headers.get('location')).toBeNull();
    });
});
