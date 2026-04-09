import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
    mockCreateBrowserClient,
    mockCreateClient,
} = vi.hoisted(() => ({
    mockCreateBrowserClient: vi.fn(),
    mockCreateClient: vi.fn(),
}));

vi.mock('@supabase/ssr', () => ({
    createBrowserClient: mockCreateBrowserClient,
}));

vi.mock('@supabase/supabase-js', async importOriginal => {
    const actual = await importOriginal<typeof import('@supabase/supabase-js')>();

    return {
        ...actual,
        createClient: mockCreateClient,
    };
});

describe('supabase config storage hardening', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
        localStorage.clear();

        process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon-key';

        mockCreateBrowserClient.mockReturnValue({});
        mockCreateClient.mockReturnValue({});
    });

    it('remove storage de auth com JSON corrompido no bootstrap', async () => {
        localStorage.setItem('sb-example-auth-token', '{invalid-json');

        await import('@/infrastructure/config/supabase');

        expect(localStorage.getItem('sb-example-auth-token')).toBeNull();
    });

    it('não cria nem altera estado quando não existe storage prévio de auth', async () => {
        await import('@/infrastructure/config/supabase');

        expect(localStorage.length).toBe(0);
    });

    it('preserva storage de auth com JSON válido', async () => {
        const value = JSON.stringify({ currentSession: null, expiresAt: 0 });
        localStorage.setItem('sb-example-auth-token', value);

        await import('@/infrastructure/config/supabase');

        expect(localStorage.getItem('sb-example-auth-token')).toBe(value);
    });

    it('getter sanitiza entrada corrompida criada depois do bootstrap', async () => {
        await import('@/infrastructure/config/supabase');

        const options = mockCreateBrowserClient.mock.calls[0][2];
        const storage = options.auth.storage;

        localStorage.setItem('sb-example-auth-token', '{invalid-json');

        expect(storage.getItem('sb-example-auth-token')).toBeNull();
        expect(localStorage.getItem('sb-example-auth-token')).toBeNull();
    });

    it('não mexe em chaves não relacionadas a auth', async () => {
        localStorage.setItem('app-random-cache', '{invalid-json');

        await import('@/infrastructure/config/supabase');

        expect(localStorage.getItem('app-random-cache')).toBe('{invalid-json');
    });
});
