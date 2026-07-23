import { describe, expect, it, vi, beforeEach } from 'vitest';

const queryMock = vi.fn();

vi.mock('@/lib/db', () => ({
    pool: { query: queryMock },
}));

const { AxiomaUsageRepository } = await import('@/infrastructure/axioma/AxiomaUsageRepository');

describe('AxiomaUsageRepository', () => {
    beforeEach(() => {
        queryMock.mockReset();
    });

    it('getUsageCount retorna o count da linha quando existe registro', async () => {
        queryMock.mockResolvedValue({ rows: [{ count: 4 }] });

        const repo = new AxiomaUsageRepository();
        const count = await repo.getUsageCount('1.2.3.4');

        expect(count).toBe(4);
        expect(queryMock).toHaveBeenCalledWith(
            expect.stringContaining('SELECT count FROM public.axioma_usage'),
            ['1.2.3.4', expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/)],
        );
    });

    it('getUsageCount retorna 0 quando não há registro para o IP/dia', async () => {
        queryMock.mockResolvedValue({ rows: [] });

        const repo = new AxiomaUsageRepository();
        const count = await repo.getUsageCount('1.2.3.4');

        expect(count).toBe(0);
    });

    it('incrementUsage executa um upsert com ip e data corrente', async () => {
        queryMock.mockResolvedValue({ rows: [] });

        const repo = new AxiomaUsageRepository();
        await repo.incrementUsage('1.2.3.4');

        expect(queryMock).toHaveBeenCalledWith(
            expect.stringContaining('ON CONFLICT (ip_address, usage_date)'),
            ['1.2.3.4', expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/)],
        );
    });
});
