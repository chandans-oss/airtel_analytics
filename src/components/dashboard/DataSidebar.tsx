import { X, ChevronLeft } from 'lucide-react';
import { useInventoryStore } from '@/store/inventoryStore';
import { DataTable } from './DataTable';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export function DataSidebar() {
    const { activeFilters, nodeFilters, linkFilters, clearFilters, sidebarOpen, setSidebarOpen } = useInventoryStore();

    const hasFilters = Object.keys(activeFilters).length > 0 || Object.keys(nodeFilters).length > 0 || Object.keys(linkFilters).length > 0;

    // Status filters shouldn't trigger the sidebar to open
    const hasStatusFiltersOnly = hasFilters &&
        Object.keys(nodeFilters).every(f => f === 'status') &&
        Object.keys(linkFilters).every(f => f === 'linkStatus') &&
        Object.keys(activeFilters).every(f => f === 'status' || f === 'linkStatus');

    const hasTriggerFilters = hasFilters && !hasStatusFiltersOnly;

    // Auto-open sidebar effect removed as per user request
    /*
    useEffect(() => {
        if (hasTriggerFilters) {
            setSidebarOpen(true);
        } else if (!hasFilters) {
            setSidebarOpen(false);
        }
    }, [hasTriggerFilters, hasFilters, setSidebarOpen]);
    */

    if (!sidebarOpen && !hasFilters) return null;

    const handleClear = () => clearFilters();

    return (
        <>
            {/* Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity duration-300",
                    sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={handleClear}
            />

            {/* Sidebar Panel */}
            <div
                className={cn(
                    "fixed inset-y-0 right-0 z-50 w-[70%] bg-card border-l border-border shadow-2xl transition-transform duration-300 transform",
                    sidebarOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                <div className="flex h-full flex-col">
                    {/* Sidebar Header */}
                    <div className="flex items-center justify-between border-b border-border p-6 bg-muted/30">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleClear}
                                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background border border-border group-hover:border-primary group-hover:text-primary transition-all">
                                    <ChevronLeft size={18} />
                                </div>
                                Back to Dashboard
                            </button>
                            <div className="h-4 w-px bg-border" />
                            <h2 className="text-xl font-bold text-foreground">Detailed Inventory</h2>
                        </div>

                        <button
                            onClick={handleClear}
                            className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Sidebar Content */}
                    <div className="flex-1 overflow-auto p-6 space-y-8">
                        <div className="grid grid-cols-1 gap-8">
                            <DataTable type="nodes" />
                            <DataTable type="links" />
                        </div>
                    </div>

                    {/* Footer - Optional */}
                    <div className="border-t border-border p-6 bg-muted/30">
                        <p className="text-xs text-muted-foreground text-center">
                            INFRAON Analytics Command Center - Real-time Network Inventory Analysis
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
