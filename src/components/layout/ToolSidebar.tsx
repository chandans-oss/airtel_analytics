import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useInventoryStore } from '@/store/inventoryStore';
import { HierarchyBuilder } from '../dashboard/HierarchyBuilder';
import { ActiveFilters } from '../dashboard/ActiveFilters';
import { Filter, ChevronDown, ChevronLeft, ChevronRight, SlidersHorizontal, Layers } from 'lucide-react';

export function ToolSidebar() {
    const { toolSidebarOpen, setToolSidebarOpen, selectedModule } = useInventoryStore();
    const [hierarchyExpanded, setHierarchyExpanded] = useState(true);
    const [filtersExpanded, setFiltersExpanded] = useState(true);

    // Only show tool sidebar for specific modules
    const showToolSidebar = ['inventory', 'events', 'config'].includes(selectedModule);

    if (!showToolSidebar) return null;

    return (
        <aside
            className={cn(
                "flex flex-col border-r border-border bg-card/30 backdrop-blur-xl transition-all duration-500 ease-in-out relative group/sidebar",
                toolSidebarOpen ? "w-80" : "w-0 overflow-hidden opacity-0 pointer-events-none"
            )}
        >
            {/* Header */}
            <div className="flex h-14 items-center justify-between px-5 border-b border-border/50 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                        <SlidersHorizontal size={14} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-foreground font-display">Configuration</span>
                </div>
                <button
                    onClick={() => setToolSidebarOpen(false)}
                    className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-all"
                >
                    <ChevronLeft size={16} />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                {/* Hierarchy Section */}
                <div className="space-y-3">
                    <button
                        onClick={() => setHierarchyExpanded(!hierarchyExpanded)}
                        className="w-full flex items-center justify-between group/btn"
                    >
                        <div className="flex items-center gap-2">
                            <Layers size={14} className={cn("transition-colors", hierarchyExpanded ? "text-primary" : "text-muted-foreground")} />
                            <span className={cn("text-[10px] font-black uppercase tracking-widest transition-colors font-display", hierarchyExpanded ? "text-foreground" : "text-muted-foreground")}>
                                Build Path
                            </span>
                        </div>
                        <ChevronDown size={14} className={cn("text-muted-foreground transition-transform duration-300", !hierarchyExpanded && "-rotate-90")} />
                    </button>

                    <div className={cn(
                        "transition-all duration-300 overflow-hidden",
                        hierarchyExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                    )}>
                        <div className="rounded-xl bg-muted/20 border border-border/30 p-1">
                            <HierarchyBuilder />
                        </div>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="space-y-3">
                    <button
                        onClick={() => setFiltersExpanded(!filtersExpanded)}
                        className="w-full flex items-center justify-between group/btn"
                    >
                        <div className="flex items-center gap-2">
                            <Filter size={14} className={cn("transition-colors", filtersExpanded ? "text-primary" : "text-muted-foreground")} />
                            <div className="flex items-center gap-1.5">
                                <span className={cn("text-[10px] font-black uppercase tracking-widest transition-colors font-display", filtersExpanded ? "text-foreground" : "text-muted-foreground")}>
                                    Global Filters
                                </span>
                                <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                            </div>
                        </div>
                        <ChevronDown size={14} className={cn("text-muted-foreground transition-transform duration-300", !filtersExpanded && "-rotate-90")} />
                    </button>

                    <div className={cn(
                        "transition-all duration-300 overflow-hidden",
                        filtersExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                    )}>
                        <div className="rounded-xl bg-muted/20 border border-border/30 p-1">
                            <ActiveFilters />
                        </div>
                    </div>
                </div>


            </div>

            {/* Persistence Toggle (Small handle to re-open) */}
            {!toolSidebarOpen && (
                <button
                    onClick={() => setToolSidebarOpen(true)}
                    className="fixed left-[64px] top-1/2 -translate-y-1/2 z-50 flex h-16 w-4 items-center justify-center bg-card border border-l-0 border-border rounded-r-xl shadow-xl hover:w-6 transition-all group/handle"
                >
                    <ChevronRight size={14} className="text-muted-foreground group-hover/handle:text-primary transition-colors" />
                </button>
            )}
        </aside>
    );
}
