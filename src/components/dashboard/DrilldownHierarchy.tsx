import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useInventoryStore } from '@/store/inventoryStore';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie
} from 'recharts';
import {
    ChevronRight,
    Home,
    RefreshCw,
    ArrowLeft,
    Database,
    Zap,
    TrendingUp,
    Activity,
    ExternalLink,
    Settings2,
    Download,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ExportButton } from '../common/ExportButton';
import { HierarchyBuilder } from './HierarchyBuilder';

const COLORS = [
    'hsl(174, 72%, 45%)',
    'hsl(210, 100%, 55%)',
    'hsl(38, 92%, 50%)',
    'hsl(280, 70%, 55%)',
    'hsl(320, 70%, 55%)',
    'hsl(140, 60%, 45%)',
    'hsl(20, 80%, 55%)',
    'hsl(200, 70%, 50%)',
];

const STATUS_COLORS: Record<string, string> = {
    'UP': 'hsl(160, 84%, 39%)',
    'DOWN': 'hsl(12, 85%, 55%)',
    'ACTIVE': 'hsl(160, 84%, 39%)',
};

interface DrilldownHierarchyProps {
    entityType?: 'nodes' | 'links';
    setEntityType?: (type: 'nodes' | 'links') => void;
}

export function DrilldownHierarchy({ entityType = 'nodes', setEntityType }: DrilldownHierarchyProps) {
    const {
        getFilteredNodes,
        getFilteredLinks,
        nodeHierarchyLevels,
        linkHierarchyLevels,
        hierarchyPath,
        setHierarchyPath,
        setSelectedModule,
        clearFilters
    } = useInventoryStore();

    const nodes = getFilteredNodes();
    const links = getFilteredLinks();

    // Use passed entityType or fallback to smart detection (though toggle now controls it)
    const activeType = entityType;
    const activeLevels = activeType === 'nodes' ? nodeHierarchyLevels : linkHierarchyLevels;

    const currentLevelIdx = hierarchyPath.length;
    const currentLevel = activeLevels[currentLevelIdx];

    const drilldownData = useMemo(() => {
        // If we reached the end of hierarchy or level is undefined
        if (!currentLevel) return [];

        const sourceData = activeType === 'nodes' ? nodes : links;
        // The definitions in activeLevels all use 'field' to point to the data key
        const field = currentLevel.field;

        // Group by field
        const groups: Record<string, number> = {};
        sourceData.forEach(item => {
            // Apply strict filtering based on previous hierarchy steps
            // This ensures we only show relevant data for the current drill-down path
            let match = true;
            for (let i = 0; i < hierarchyPath.length; i++) {
                const path = hierarchyPath[i];
                // Since we build path using same 'activeLevels' logic, 'field' should match
                // However, we stored 'field' and 'linkField' in path.
                // We should check against the field that was used at that level.
                // But simplified: path.field property stores the data key used.

                // Note: The previous handleDrilldown stored `field` as `nextLevel.field`.
                // So checking `item[path.field]` should be correct for both nodes and links 
                // IF separate hierarchies are respected.
                const val = (item as any)[path.field];
                if (String(val) !== path.value) {
                    match = false;
                    break;
                }
            }

            if (match) {
                const val = String((item as any)[field] || 'Unknown');
                groups[val] = (groups[val] || 0) + 1;
            }
        });

        return Object.entries(groups)
            .map(([name, value], index) => ({
                name,
                value,
                color: STATUS_COLORS[name.toUpperCase()] || COLORS[index % COLORS.length]
            }))
            .sort((a, b) => b.value - a.value);
    }, [nodes, links, currentLevel, activeType, hierarchyPath]);

    const handleDrilldown = (name: string) => {
        if (currentLevelIdx < activeLevels.length - 1) {
            // For nodes, we use 'field'. For links, we might use 'field' too if defined in activeLevels.
            // The previous logic used 'linkField' but now we have explicit lists.
            const nextLevel = activeLevels[currentLevelIdx];

            setHierarchyPath([...hierarchyPath, {
                field: nextLevel.field,
                linkField: nextLevel.field, // Simplify since we have split lists now
                value: name,
                label: name
            }]);
        }
    };

    const handleBack = () => {
        if (hierarchyPath.length > 0) {
            setHierarchyPath(hierarchyPath.slice(0, -1));
        }
    };

    const reset = () => {
        setHierarchyPath([]);
        clearFilters();
    };

    const handleBreadcrumbClick = (index: number) => {
        setHierarchyPath(hierarchyPath.slice(0, index + 1));
    };

    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, name: string } | null>(null);
    const [showConfig, setShowConfig] = useState(false);

    const handleContextMenu = (e: React.MouseEvent, name: string) => {
        e.preventDefault();

        const x = e.clientX;
        const y = e.clientY;

        // Clamp to viewport
        const menuWidth = 256; // w-64 = 16rem = 256px
        const menuHeight = 280; // Approximate height

        const clampedX = Math.min(x, window.innerWidth - menuWidth - 20);
        const clampedY = Math.min(y, window.innerHeight - menuHeight - 20);

        setContextMenu({ x: clampedX, y: clampedY, name });
    };

    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    const currentTotal = drilldownData.reduce((acc, d) => acc + d.value, 0);

    return (
        <div className="flex flex-col h-full min-h-[450px] relative animate-in fade-in zoom-in-95 duration-500">
            {contextMenu && createPortal(
                <div
                    className="fixed z-[9999] w-64 bg-background/95 backdrop-blur-xl border border-border shadow-2xl rounded-2xl overflow-hidden py-1.5 animate-in fade-in zoom-in-90 duration-200"
                    style={{ left: contextMenu.x, top: contextMenu.y }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="px-4 py-2 border-b border-border/50 bg-primary/5 mb-1.5">
                        <p className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                            <Settings2 size={10} />
                            Segment Operations
                        </p>
                        <p className="text-xs font-bold text-foreground truncate mt-0.5">{contextMenu.name}</p>
                    </div>

                    <button
                        onClick={() => {
                            handleDrilldown(contextMenu.name);
                            setSelectedModule('filteredEvents');
                            setContextMenu(null);
                        }}
                        className="w-full text-left px-4 py-2 text-xs hover:bg-primary hover:text-primary-foreground transition-all flex items-center gap-3 group"
                    >
                        <Activity size={14} className="text-primary group-hover:text-primary-foreground shadow-sm" />
                        <div>
                            <p className="font-bold">Event Analysis</p>
                            <p className="text-[9px] opacity-70">Probable cause & Ticketing</p>
                        </div>
                    </button>

                    <button
                        onClick={() => {
                            handleDrilldown(contextMenu.name);
                            setSelectedModule('filteredConfig');
                            setContextMenu(null);
                        }}
                        className="w-full text-left px-4 py-2 text-xs hover:bg-blue-500 hover:text-white transition-all flex items-center gap-3 group"
                    >
                        <Database size={14} className="text-blue-500 group-hover:text-white" />
                        <div>
                            <p className="font-bold">Config Issues</p>
                            <p className="text-[9px] opacity-70">Download & Compliance</p>
                        </div>
                    </button>

                    <button
                        onClick={() => {
                            handleDrilldown(contextMenu.name);
                            setContextMenu(null);
                        }}
                        className="w-full text-left px-4 py-2 text-xs hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-3 group"
                    >
                        <ExternalLink size={14} className="text-emerald-500 group-hover:text-white" />
                        <div>
                            <p className="font-bold">Deep Drill-down</p>
                            <p className="text-[9px] opacity-70">Expand next hierarchy level</p>
                        </div>
                    </button>

                    <div className="border-t border-border/50 mt-1.5 pt-1.5">
                        <button className="w-full text-left px-4 py-2 text-xs hover:bg-muted text-muted-foreground flex items-center gap-3 group transition-colors">
                            <TrendingUp size={14} className="opacity-50 group-hover:opacity-100" />
                            <span>Compare / Trends</span>
                        </button>
                    </div>
                </div>,
                document.body
            )}

            <div className="mb-6 flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                        <div className="h-1 w-4 bg-primary rounded-full" />
                        Inventory Analysis
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground overflow-x-auto pb-1 no-scrollbar">
                        <button
                            onClick={reset}
                            className={cn(
                                "hover:text-primary transition-colors flex items-center gap-1 uppercase tracking-wider",
                                hierarchyPath.length === 0 && "text-primary border-b border-primary/50"
                            )}
                        >
                            <Home size={10} /> Root
                        </button>
                        {hierarchyPath.map((path, i) => (
                            <React.Fragment key={i}>
                                <ChevronRight size={10} className="opacity-30" />
                                <button
                                    onClick={() => handleBreadcrumbClick(i)}
                                    className={cn(
                                        "whitespace-nowrap hover:text-primary transition-colors uppercase tracking-wider",
                                        i === hierarchyPath.length - 1 && "text-primary border-b border-primary/50"
                                    )}
                                >
                                    {path.label}
                                </button>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowConfig(true)}
                        className={cn(
                            "p-2 rounded-xl border border-border/50 bg-background/50 text-muted-foreground hover:text-foreground hover:bg-background transition-all shadow-sm",
                            showConfig && "bg-primary/10 text-primary border-primary/20"
                        )}
                        title="Configure Hierarchy Levels"
                    >
                        <Settings2 size={16} />
                    </button>
                    {/* Entity Type Toggle */}
                    {setEntityType && (
                        <div className="flex bg-muted/50 p-1 rounded-lg border border-border/50">
                            <button
                                onClick={() => setEntityType?.('nodes')}
                                className={cn(
                                    "px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-all flex items-center gap-1.5",
                                    entityType === 'nodes' ? "bg-emerald-500 text-white shadow-md" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Settings2 size={10} /> Nodes
                            </button>
                            <button
                                onClick={() => setEntityType?.('links')}
                                className={cn(
                                    "px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-all flex items-center gap-1.5",
                                    entityType === 'links' ? "bg-emerald-500 text-white shadow-md" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <ExternalLink size={10} /> Links
                            </button>
                        </div>
                    )}

                    <div className="h-6 w-px bg-border/50" />

                    <div className="flex gap-2">
                        {hierarchyPath.length > 0 && (
                            <button
                                onClick={handleBack}
                                className="p-2 rounded-xl bg-muted/50 hover:bg-primary/20 hover:text-primary transition-all shadow-sm"
                                title="Go Back"
                            >
                                <ArrowLeft size={16} />
                            </button>
                        )}
                        <button
                            onClick={reset}
                            className="p-2 rounded-xl bg-muted/50 hover:bg-primary/20 hover:text-primary transition-all shadow-sm"
                            title="Reset All"
                        >
                            <RefreshCw size={16} />
                        </button>
                        <ExportButton
                            data={drilldownData}
                            title={`${activeType.toUpperCase()} Hierarchy Data - ${hierarchyPath.map(p => p.value).join(' > ') || 'Root'}`}
                            filename={`hierarchy_${activeType}_export`}
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 relative flex flex-col">
                {drilldownData.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center h-full">
                        <div className="h-[350px] w-full relative">
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                                <span className="text-5xl font-black text-foreground drop-shadow-sm">{drilldownData.length}</span>
                                <span className="text-[10px] uppercase font-black tracking-[0.3em] text-muted-foreground mt-1">
                                    {currentLevel?.label?.endsWith('s') ? currentLevel.label : `${currentLevel?.label}s`}
                                </span>
                                <div className="mt-2 flex items-center gap-1.5 px-3 py-1 bg-muted/40 rounded-full border border-border/50">
                                    <Activity size={10} className="text-primary" />
                                    <span className="text-[9px] font-bold uppercase tracking-wider">{currentTotal} Total {activeType === 'nodes' ? 'Nodes' : 'Links'}</span>
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={drilldownData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={95}
                                        outerRadius={135}
                                        paddingAngle={6}
                                        dataKey="value"
                                        animationDuration={1000}
                                        onClick={(e) => handleDrilldown(e.name)}
                                        onContextMenu={(data: any, index: number, event: any) => handleContextMenu(event, data.name)}
                                        style={{ cursor: currentLevelIdx < activeLevels.length - 1 ? 'pointer' : 'default' }}
                                    >
                                        {drilldownData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.color}
                                                stroke="none"
                                                className="hover:opacity-80 transition-opacity"
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--popover))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '12px',
                                            boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                                        }}
                                        itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center justify-between border-b border-border/50 pb-3">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                    Distribution Breakdown
                                </p>
                                <span className="text-[9px] font-bold bg-muted px-2 py-0.5 rounded text-muted-foreground">TOP {drilldownData.length}</span>
                            </div>
                            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-4 custom-scrollbar">
                                {drilldownData.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="group cursor-pointer space-y-2"
                                        onClick={() => handleDrilldown(item.name)}
                                        onContextMenu={(e) => handleContextMenu(e, item.name)}
                                    >
                                        <div className="flex items-center justify-between text-xs transition-transform group-hover:translate-x-1 duration-300">
                                            <span className="font-bold flex items-center gap-3">
                                                <div className="w-3 h-3 rounded-md shadow-sm" style={{ backgroundColor: item.color }} />
                                                {item.name}
                                                <ChevronRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                                            </span>
                                            <div className="flex items-center gap-3 font-mono">
                                                <span className="text-foreground font-black">{item.value}</span>
                                                <div onClick={(e) => e.stopPropagation()}>
                                                    <ExportButton
                                                        data={activeType === 'nodes' ? nodes.filter(n => String((n as any)[currentLevel.field]) === item.name) : links.filter(l => String((l as any)[currentLevel.field]) === item.name)}
                                                        filename={`${activeType}_${currentLevel.field}_${item.name}`}
                                                        title={`${activeType.toUpperCase()} Report - ${item.name}`}
                                                    />
                                                </div>
                                                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                                    {currentTotal > 0 ? Math.round((item.value / currentTotal) * 100) : 0}%
                                                </span>
                                            </div>
                                        </div>
                                        <div className="w-full h-1 bg-muted/30 rounded-full overflow-hidden">
                                            <div
                                                className="h-full transition-all duration-700 ease-out"
                                                style={{
                                                    width: `${currentTotal > 0 ? (item.value / currentTotal) * 100 : 0}%`,
                                                    backgroundColor: item.color
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground opacity-30 gap-4">
                        <div className="p-4 rounded-full bg-muted shadow-inner">
                            <Activity size={48} className="animate-spin-slow" />
                        </div>
                        <p className="text-sm font-bold tracking-widest uppercase">No correlation paths detected</p>
                    </div>
                )}
            </div>
            {showConfig && (
                <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-sm rounded-2xl p-6 overflow-hidden animate-in fade-in duration-200 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold">Configure Hierarchy Path</h3>
                            <p className="text-xs text-muted-foreground">Drag and drop to reorder drill-down levels</p>
                        </div>
                        <button
                            onClick={() => setShowConfig(false)}
                            className="p-2 rounded-full hover:bg-muted transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                        <HierarchyBuilder />
                    </div>
                </div>
            )}
        </div >
    );
}


