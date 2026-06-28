import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { useSearch } from '@/presentation/hooks/useSearch';

function createJsonResponse(body: unknown, status = 200): Response {
    return {
        ok: status >= 200 && status < 300,
        status,
        json: vi.fn().mockResolvedValue(body),
    } as Pick<Response, 'ok' | 'status' | 'json'> as Response;
}

describe('useSearch', () => {
    const fetchMock = vi.fn();

    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();
        vi.stubGlobal('fetch', fetchMock);
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.unstubAllGlobals();
    });

    it('query < 3 chars → results=[], sem loading', () => {
        const { result } = renderHook(() => useSearch('te', 'all'));

        expect(result.current.results).toEqual([]);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('query vazia → results=[], sem loading', () => {
        const { result } = renderHook(() => useSearch('', 'all'));

        expect(result.current.results).toEqual([]);
        expect(result.current.isLoading).toBe(false);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('query ≥ 3 chars → isLoading=true imediatamente', () => {
        fetchMock.mockResolvedValue(createJsonResponse({ results: [] }));

        const { result } = renderHook(() => useSearch('tes', 'all'));

        expect(result.current.isLoading).toBe(true);
    });

    it('query ≥ 3 chars → após 300ms chama endpoint e seta resultados', async () => {
        const mockResults = [{ id: '1', title: 'Result 1', type: 'newsletter' as const, category: '' }];
        fetchMock.mockResolvedValue(createJsonResponse({ results: mockResults }));

        const { result } = renderHook(() => useSearch('tes', 'all'));

        expect(result.current.isLoading).toBe(true);

        await act(async () => {
            await vi.runAllTimersAsync();
        });

        const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];

        expect(url).toBe('/api/search');
        expect(init).toEqual(
            expect.objectContaining({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: 'tes', filter: 'all' }),
            }),
        );
        expect(init.signal).toBeDefined();
        expect(result.current.results).toEqual(mockResults);
        expect(result.current.isLoading).toBe(false);
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('query muda antes de 300ms → primeira request cancelada, apenas segunda executada', async () => {
        const mockResults = [{ id: '2', title: 'New Result', type: 'newsletter' as const, category: '' }];
        fetchMock.mockResolvedValue(createJsonResponse({ results: mockResults }));

        const { result, rerender } = renderHook(
            ({ query }: { query: string }) => useSearch(query, 'all'),
            { initialProps: { query: 'tes' } },
        );

        expect(result.current.isLoading).toBe(true);

        act(() => {
            vi.advanceTimersByTime(100);
        });
        rerender({ query: 'test' });

        await act(async () => {
            await vi.runAllTimersAsync();
        });

        const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(init.body).toBe(JSON.stringify({ query: 'test', filter: 'all' }));
        expect(result.current.results).toEqual(mockResults);
        expect(result.current.isLoading).toBe(false);
    });

    it('erro do endpoint → error setado, results=[]', async () => {
        fetchMock.mockRejectedValue(new Error('Search failed'));

        const { result } = renderHook(() => useSearch('test', 'all'));

        await act(async () => {
            await vi.runAllTimersAsync();
        });

        expect(result.current.error).toBe('Search failed');
        expect(result.current.results).toEqual([]);
        expect(result.current.isLoading).toBe(false);
    });

    it('status HTTP não-ok → error inclui status', async () => {
        fetchMock.mockResolvedValue(createJsonResponse({ results: [] }, 500));

        const { result } = renderHook(() => useSearch('test', 'all'));

        await act(async () => {
            await vi.runAllTimersAsync();
        });

        expect(result.current.error).toBe('HTTP 500');
        expect(result.current.results).toEqual([]);
        expect(result.current.isLoading).toBe(false);
    });
});
