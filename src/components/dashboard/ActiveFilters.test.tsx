import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { ActiveFilters } from './ActiveFilters';
import { useInventoryStore } from '@/store/inventoryStore';

// Mock the store
vi.mock('@/store/inventoryStore', () => ({
    useInventoryStore: vi.fn(),
}));

describe('ActiveFilters Component', () => {
    const mockRemoveFilter = vi.fn();
    const mockClearFilters = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should display "No Active Filters" when no filters are applied', () => {
        (useInventoryStore as any).mockReturnValue({
            activeFilters: {},
            nodeFilters: {},
            linkFilters: {},
            removeFilter: mockRemoveFilter,
            clearFilters: mockClearFilters,
        });

        render(<ActiveFilters />);

        expect(screen.getByText('No Active Filters')).toBeInTheDocument();
    });

    it('should display active filters from activeFilters', () => {
        (useInventoryStore as any).mockReturnValue({
            activeFilters: {
                region: ['North', 'South'],
            },
            nodeFilters: {},
            linkFilters: {},
            removeFilter: mockRemoveFilter,
            clearFilters: mockClearFilters,
        });

        const { container } = render(<ActiveFilters />);

        expect(screen.getByText('North')).toBeInTheDocument();
        expect(screen.getByText('South')).toBeInTheDocument();

        // Check that we have filter items (checking for the class that wraps items)
        const items = container.querySelectorAll('.rounded-full');
        expect(items.length).toBeGreaterThan(0);
    });

    it('should display node filters with correct styling', () => {
        (useInventoryStore as any).mockReturnValue({
            activeFilters: {},
            nodeFilters: {
                deviceType: ['Router'],
            },
            linkFilters: {},
            removeFilter: mockRemoveFilter,
            clearFilters: mockClearFilters,
        });

        render(<ActiveFilters />);

        // Find the text "Router" and check its parent container style
        const filterText = screen.getByText('Router');
        const filterContainer = filterText.closest('div');
        expect(filterContainer).toHaveClass('bg-blue-500/5', 'text-blue-500');
    });

    it('should display link filters with correct styling', () => {
        (useInventoryStore as any).mockReturnValue({
            activeFilters: {},
            nodeFilters: {},
            linkFilters: {
                linkStatus: ['UP'],
            },
            removeFilter: mockRemoveFilter,
            clearFilters: mockClearFilters,
        });

        render(<ActiveFilters />);

        const filterText = screen.getByText('UP');
        const filterContainer = filterText.closest('div');
        expect(filterContainer).toHaveClass('bg-emerald-500/5', 'text-emerald-500');
    });

    it('should call removeFilter when X button is clicked', () => {
        (useInventoryStore as any).mockReturnValue({
            activeFilters: {},
            nodeFilters: {},
            linkFilters: {
                region: ['North'],
            },
            removeFilter: mockRemoveFilter,
            clearFilters: mockClearFilters,
        });

        render(<ActiveFilters />);

        const valueText = screen.getByText('North');
        const filterContainer = valueText.closest('div');
        if (!filterContainer) throw new Error('Filter container not found');

        // Find the button inside this container
        const removeButton = within(filterContainer).getByRole('button');

        fireEvent.click(removeButton);
        expect(mockRemoveFilter).toHaveBeenCalledWith('region', 'North', 'links');
    });

    it('should display "Reset Environment" button when filters exist', () => {
        (useInventoryStore as any).mockReturnValue({
            activeFilters: {
                region: ['North'],
            },
            nodeFilters: {},
            linkFilters: {},
            removeFilter: mockRemoveFilter,
            clearFilters: mockClearFilters,
        });

        render(<ActiveFilters />);

        expect(screen.getByText('Reset Environment')).toBeInTheDocument();
    });

    it('should call clearFilters when Reset button is clicked', () => {
        (useInventoryStore as any).mockReturnValue({
            activeFilters: {
                region: ['North'],
            },
            nodeFilters: {},
            linkFilters: {},
            removeFilter: mockRemoveFilter,
            clearFilters: mockClearFilters,
        });

        render(<ActiveFilters />);

        const resetButton = screen.getByText('Reset Environment');
        fireEvent.click(resetButton);

        expect(mockClearFilters).toHaveBeenCalled();
    });

    it('should display multiple filters from different sources', () => {
        (useInventoryStore as any).mockReturnValue({
            activeFilters: {
                region: ['North'],
            },
            nodeFilters: {
                deviceType: ['Router'],
            },
            linkFilters: {
                linkStatus: ['UP'],
            },
            removeFilter: mockRemoveFilter,
            clearFilters: mockClearFilters,
        });

        render(<ActiveFilters />);

        expect(screen.getByText('North')).toBeInTheDocument();
        expect(screen.getByText('Router')).toBeInTheDocument();
        expect(screen.getByText('UP')).toBeInTheDocument();
    });

    it('should display multiple values for the same filter field', () => {
        (useInventoryStore as any).mockReturnValue({
            activeFilters: {},
            nodeFilters: {},
            linkFilters: {
                region: ['North', 'South', 'East'],
            },
            removeFilter: mockRemoveFilter,
            clearFilters: mockClearFilters,
        });

        render(<ActiveFilters />);

        expect(screen.getByText('North')).toBeInTheDocument();
        expect(screen.getByText('South')).toBeInTheDocument();
        expect(screen.getByText('East')).toBeInTheDocument();
    });

    it('should generate unique keys for each filter', () => {
        (useInventoryStore as any).mockReturnValue({
            activeFilters: {
                region: ['North'],
            },
            nodeFilters: {
                region: ['North'],
            },
            linkFilters: {
                region: ['North'],
            },
            removeFilter: mockRemoveFilter,
            clearFilters: mockClearFilters,
        });

        const { container } = render(<ActiveFilters />);

        // Should render 3 items with North
        const northItems = screen.getAllByText('North');
        expect(northItems).toHaveLength(3);
    });

    it('should not display Reset button when no filters exist', () => {
        (useInventoryStore as any).mockReturnValue({
            activeFilters: {},
            nodeFilters: {},
            linkFilters: {},
            removeFilter: mockRemoveFilter,
            clearFilters: mockClearFilters,
        });

        render(<ActiveFilters />);

        expect(screen.queryByText('Reset Environment')).not.toBeInTheDocument();
    });
});
