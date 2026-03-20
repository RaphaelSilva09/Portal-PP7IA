import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('@/presentation/hooks/usePortalNews', () => ({
    usePortalNews: vi.fn(),
}));

vi.mock('next/navigation', () => ({
    useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

import { usePortalNews } from '@/presentation/hooks/usePortalNews';
import { PortalNewsItem, PortalNewsItemProps } from '@/domain/entities/PortalNewsItem';
import PortalNewsWidget from '@/components/PortalNewsWidget';

function makeItem(overrides: Partial<PortalNewsItemProps> = {}) {
    return PortalNewsItem.create({
        id: 'item-1',
        title: 'Test Item',
        description: null,
        icon: '🚀',
        category: 'launch',
        accentColor: null,
        publishedAt: new Date('2025-01-01'),
        displayOrder: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        linkType: null,
        linkItemId: null,
        ...overrides,
    } as any);
}

describe('PortalNewsWidget', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renderiza lista de items', () => {
        vi.mocked(usePortalNews).mockReturnValue({
            items: [
                makeItem({ id: '1', title: 'Item 1' }),
                makeItem({ id: '2', title: 'Item 2' }),
            ],
            isLoading: false,
            error: null,
        });

        render(<PortalNewsWidget />);

        expect(screen.getByText('Item 1')).toBeTruthy();
        expect(screen.getByText('Item 2')).toBeTruthy();
    });

    it('estado de loading → exibe skeletons, sem items', () => {
        vi.mocked(usePortalNews).mockReturnValue({
            items: [],
            isLoading: true,
            error: null,
        });

        render(<PortalNewsWidget />);

        expect(screen.queryByRole('button')).toBeNull();
    });

    it('item com link → elemento clicável presente', () => {
        vi.mocked(usePortalNews).mockReturnValue({
            items: [
                makeItem({ id: '1', title: 'Linked Item', linkType: 'newsletter', linkItemId: 42 }),
            ],
            isLoading: false,
            error: null,
        });

        render(<PortalNewsWidget />);

        expect(screen.getByRole('button')).toBeTruthy();
    });

    it('item sem link → sem elemento clicável', () => {
        vi.mocked(usePortalNews).mockReturnValue({
            items: [
                makeItem({ id: '1', title: 'No Link Item', linkType: null, linkItemId: null }),
            ],
            isLoading: false,
            error: null,
        });

        render(<PortalNewsWidget />);

        expect(screen.queryByRole('button')).toBeNull();
    });

    it('sem items → exibe mensagem de vazio', () => {
        vi.mocked(usePortalNews).mockReturnValue({
            items: [],
            isLoading: false,
            error: null,
        });

        render(<PortalNewsWidget />);

        expect(screen.getByText(/nenhuma novidade/i)).toBeTruthy();
    });
});
