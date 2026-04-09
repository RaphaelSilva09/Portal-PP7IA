import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

const mockExecute = vi.fn();

vi.mock('@/infrastructure/di/container', () => ({
    default: {
        getSearchContentUseCase: vi.fn(() => ({ execute: mockExecute })),
    },
}));

import { useSearch } from '@/presentation/hooks/useSearch';

describe('useSearch', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('query < 3 chars → results=[], sem loading', () => {
        const { result } = renderHook(() => useSearch('te', 'all'));

        expect(result.current.results).toEqual([]);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('query vazia → results=[], sem loading', () => {
        const { result } = renderHook(() => useSearch('', 'all'));

        expect(result.current.results).toEqual([]);
        expect(result.current.isLoading).toBe(false);
    });

    it('query ≥ 3 chars → isLoading=true imediatamente', () => {
        mockExecute.mockResolvedValue([]);

        const { result } = renderHook(() => useSearch('tes', 'all'));

        expect(result.current.isLoading).toBe(true);
    });

    it('query ≥ 3 chars → após 300ms chama use case e seta resultados', async () => {
        const mockResults = [{ id: '1', title: 'Result 1', type: 'newsletter' as const, category: '' }];
        mockExecute.mockResolvedValue(mockResults);

        const { result } = renderHook(() => useSearch('tes', 'all'));

        expect(result.current.isLoading).toBe(true);

        // Advance timers and flush all async work
        await act(async () => {
            await vi.runAllTimersAsync();
        });

        expect(result.current.results).toEqual(mockResults);
        expect(result.current.isLoading).toBe(false);
        expect(mockExecute).toHaveBeenCalledTimes(1);
    });

    it('query muda antes de 300ms → primeira request cancelada, apenas segunda executada', async () => {
        const mockResults = [{ id: '2', title: 'New Result', type: 'newsletter' as const, category: '' }];
        mockExecute.mockResolvedValue(mockResults);

        const { result, rerender } = renderHook(
            ({ query }: { query: string }) => useSearch(query, 'all'),
            { initialProps: { query: 'tes' } }
        );

        expect(result.current.isLoading).toBe(true);

        // Advance 100ms (timer1 still pending), then change query
        act(() => { vi.advanceTimersByTime(100); });
        rerender({ query: 'test' });

        // Run all remaining timers (fires timer2, clears timer1)
        await act(async () => {
            await vi.runAllTimersAsync();
        });

        // Only one call was made (timer1 was cancelled by rerender cleanup)
        expect(mockExecute).toHaveBeenCalledTimes(1);
        expect(result.current.results).toEqual(mockResults);
        expect(result.current.isLoading).toBe(false);
    });

    it('erro do use case → error setado, results=[]', async () => {
        mockExecute.mockRejectedValue(new Error('Search failed'));

        const { result } = renderHook(() => useSearch('test', 'all'));

        await act(async () => {
            await vi.runAllTimersAsync();
        });

        expect(result.current.error).toBe('Search failed');
        expect(result.current.results).toEqual([]);
        expect(result.current.isLoading).toBe(false);
    });
});
