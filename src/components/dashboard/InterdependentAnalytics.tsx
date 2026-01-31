import { useMemo, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useInventoryStore } from '@/store/inventoryStore';
import { ChartContainer, UniversalChartRenderer } from './DistributionCharts';
import { cn } from '@/lib/utils';
import { ExportButton } from '../common/ExportButton';
import { ChartTypeSelector } from '../common/ChartTypeSelector';
import { exportToCSV } from '@/utils/exportUtils';
import type { ChartType } from '@/types/inventory';
import { Activity, Database, ExternalLink, Settings2, TrendingUp, ChevronLeft, RotateCcw } from 'lucide-react';

interface AnalyticsSetProps {
    title: string;
    type: 'nodes' | 'links';
    levels: {
        label: string;
        field: string;
        expectedValues?: string[];
    }[];
    showBackButton?: boolean;
}

interface HierarchyLevel {
    label: string;
    field: string;
    expectedValues?: string[];
}

export function AnalyticsSet({ title, type, levels, showBackButton }: AnalyticsSetProps) {
    const { toggleFilter, setSelectedModule } = useInventoryStore();
    const [expandedWidget, setExpandedWidget] = useState<string | null>(null);
    const [widgetSizes, setWidgetSizes] = useState<Record<string, { span: number; height: number }>>({});

    useEffect(() => {
        const initial: Record<string, { span: number; height: number }> = {};
        levels.forEach((level, index) => {
            let span = 4;
            if (index === 0) span = 3;
            else if (index === 1) span = 5;
            initial[level.field] = { span, height: 240 };
        });
        setWidgetSizes(initial);
    }, [levels]);

    const handleResize = (field: string, deltaX: number, deltaY: number) => {
        setWidgetSizes(prev => {
            const current = prev[field] || { span: 4, height: 240 };
            const colWidth = 100;
            const newSpan = Math.max(2, Math.min(12, current.span + Math.round(deltaX / colWidth)));
            const newHeight = Math.max(160, Math.min(600, current.height + deltaY));
            return {
                ...prev,
                [field]: { span: newSpan, height: newHeight }
            };
        });
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                    {showBackButton && (
                        <button
                            onClick={() => setSelectedModule('unified')}
                            className="p-1 rounded-lg hover:bg-primary/10 text-primary transition-all flex items-center justify-center"
                            title="Back to Overview"
                        >
                            <ChevronLeft size={20} strokeWidth={2.5} />
                        </button>
                    )}
                    <div className="h-5 w-1 bg-primary rounded-full shadow-[0_0_8px_rgba(0,165,142,0.4)]" />
                    <h3 className="text-[12px] font-black uppercase tracking-[0.15em] text-foreground/90">
                        {title}
                    </h3>
                    <button
                        onClick={() => {
                            useInventoryStore.getState().clearFilters(type);
                            setExpandedWidget(null);
                        }}
                        className="ml-2 p-1 rounded-full hover:bg-muted text-muted-foreground hover:text-primary transition-all"
                        title="Reset Filters & View"
                    >
                        <RotateCcw size={14} />
                    </button>
                </div>
                <div className="h-[1px] flex-1 mx-4 bg-gradient-to-r from-border/50 to-transparent" />
            </div>

            <div className="grid grid-cols-12 gap-3">
                {levels.map((level) => {
                    const isExpanded = expandedWidget === level.field;
                    const size = widgetSizes[level.field] || { span: 4, height: 240 };

                    return (
                        <div
                            key={level.field}
                            style={!isExpanded ? { gridColumn: `span ${size.span} / span ${size.span}` } : {}}
                            className={cn(
                                "transition-all duration-300 ease-in-out group relative",
                                isExpanded ? "col-span-12" : "col-span-12"
                            )}
                        >
                            <AnalyticsWidget
                                level={level}
                                type={type}
                                isExpanded={isExpanded}
                                customHeight={isExpanded ? 400 : size.height}
                                onToggleExpand={() => setExpandedWidget(isExpanded ? null : level.field)}
                                onFilter={(val) => toggleFilter(level.field, val, type)}
                            />
                            {!isExpanded && (
                                <ResizeHandles onResize={(dx, dy) => handleResize(level.field, dx, dy)} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function ResizeHandles({ onResize }: { onResize: (dx: number, dy: number) => void }) {
    const [isResizing, setIsResizing] = useState<string | null>(null);
    const lastPos = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent, type: 'right' | 'bottom' | 'corner') => {
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(type);
        lastPos.current = { x: e.clientX, y: e.clientY };
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;
            const dx = isResizing === 'bottom' ? 0 : e.clientX - lastPos.current.x;
            const dy = isResizing === 'right' ? 0 : e.clientY - lastPos.current.y;
            if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                onResize(dx, dy);
                lastPos.current = { x: e.clientX, y: e.clientY };
            }
        };

        const handleMouseUp = () => setIsResizing(null);

        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, onResize]);

    return (
        <div className="absolute inset-0 pointer-events-none">
            <div
                className={cn(
                    "absolute right-0 top-0 bottom-6 w-2 cursor-ew-resize transition-all z-[30] pointer-events-auto opacity-0 group-hover:opacity-100",
                    isResizing === 'right' ? "bg-primary/40 opacity-100 w-3" : "hover:bg-primary/20"
                )}
                onMouseDown={(e) => handleMouseDown(e, 'right')}
            />
            <div
                className={cn(
                    "absolute bottom-0 left-0 right-6 h-2 cursor-ns-resize transition-all z-[30] pointer-events-auto opacity-0 group-hover:opacity-100",
                    isResizing === 'bottom' ? "bg-primary/40 opacity-100 h-3" : "hover:bg-primary/20"
                )}
                onMouseDown={(e) => handleMouseDown(e, 'bottom')}
            />
            <div
                className={cn(
                    "absolute bottom-0 right-0 w-8 h-8 cursor-nwse-resize z-[40] pointer-events-auto opacity-0 group-hover:opacity-100 flex items-end justify-end p-2",
                    isResizing === 'corner' ? "text-primary scale-125" : "text-primary/40"
                )}
                onMouseDown={(e) => handleMouseDown(e, 'corner')}
            >
                <div className="w-3 h-3 border-r-2 border-b-2 border-current rounded-br-sm" />
            </div>
        </div>
    );
}

function AnalyticsWidget({ level, type, isExpanded, customHeight, onToggleExpand, onFilter }: {
    level: HierarchyLevel;
    type: 'nodes' | 'links';
    isExpanded?: boolean;
    customHeight?: number;
    onToggleExpand?: () => void;
    onFilter: (val: string) => void
}) {
    const { getFilteredNodesExcluding, getFilteredLinksExcluding, nodeFilters, linkFilters, setSelectedModule, toggleFilter } = useInventoryStore();
    const [chartType, setChartType] = useState<ChartType>(() => {
        if (level.field === 'status' || level.field === 'linkStatus') return 'donut';
        if (level.field === 'region' || level.field === 'state') return 'pie';
        if (level.field === 'make' || level.field === 'deviceType') return 'treemap';
        return 'bar';
    });
    const [customTitle, setCustomTitle] = useState(level.label);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, name: string } | null>(null);

    const handleContextMenu = (e: React.MouseEvent, name: string) => {
        e.preventDefault();
        const x = e.clientX;
        const y = e.clientY;

        const menuWidth = 240;
        const menuHeight = 220;
        const clampedX = Math.min(x, window.innerWidth - menuWidth - 20);
        const clampedY = Math.min(y, window.innerHeight - menuHeight - 20);

        setContextMenu({ x: clampedX, y: clampedY, name });
    };

    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    const data = type === 'nodes'
        ? getFilteredNodesExcluding(level.field)
        : getFilteredLinksExcluding(level.field);

    const activeValues = (type === 'nodes' ? nodeFilters : linkFilters)[level.field] || [];

    const chartData = useMemo(() => {
        const groups = new Map<string, number>();
        if (level.expectedValues) {
            level.expectedValues.forEach(v => groups.set(v, 0));
        }

        data.forEach(item => {
            let val = item[level.field];
            if (val && String(val).toUpperCase() !== 'UNKNOWN') {
                let key = String(val);
                if (level.expectedValues) {
                    const upperKey = key.toUpperCase();
                    const match = level.expectedValues.find(v => v.toUpperCase() === upperKey);
                    if (match) key = match;
                    else if (level.field === 'make') key = 'Others';
                }
                if (!level.expectedValues || groups.has(key)) {
                    groups.set(key, (groups.get(key) || 0) + 1);
                }
            }
        });

        const statusField = type === 'nodes' ? 'status' : 'linkStatus';
        const globalFilters = type === 'nodes' ? nodeFilters : linkFilters;
        const activeStatusFilters = globalFilters[statusField] || [];
        const hasStatusFilter = activeStatusFilters.length > 0;

        const contextColor = activeStatusFilters.includes('DOWN') ? '#FF3B30' :
            activeStatusFilters.includes('UP') ? '#34C759' : null;

        const PALETTE = ['#00A58E', '#2196F3', '#FF9800', '#9C27B0', '#E91E63', '#4CAF50', '#00BCD4', '#607D8B'];

        return Array.from(groups.entries())
            .map(([name, value], index) => {
                let barColor = hasStatusFilter ? (contextColor || PALETTE[index % PALETTE.length]) : PALETTE[index % PALETTE.length];
                if (level.field === 'status' || level.field === 'linkStatus') {
                    barColor = name === 'UP' ? '#34C759' : '#FF3B30';
                }
                const isDimensionFiltered = activeValues.length > 0;
                const isMatch = activeValues.includes(name);
                const opacity = isDimensionFiltered ? (isMatch ? 1.0 : 0.15) : 1.0;
                if (isDimensionFiltered && !isMatch) barColor = '#E0E7FF80';

                return { name, value, color: barColor, opacity, isSelected: isMatch };
            })
            .sort((a, b) => {
                if (a.name === 'Others') return 1;
                if (b.name === 'Others') return -1;
                return b.value - a.value;
            });
    }, [data, level, activeValues, nodeFilters, linkFilters, type]);

    const handlePointClick = (val: string) => onFilter(val);

    const handlePointExport = (name: string) => {
        const subData = data.filter(item =>
            String(item[level.field] || '').toUpperCase() === String(name || '').toUpperCase()
        );
        if (subData.length > 0) {
            exportToCSV(subData, `${type}_${level.field}_${name}_export`);
        }
    };

    return (
        <div className={cn(
            "bg-card rounded-xl border border-border/60 transition-all duration-500 shadow-sm overflow-hidden flex flex-col",
            isExpanded ? "h-[400px] shadow-2xl z-20" : "shadow-sm hover:shadow-md",
            activeValues.length > 0 ? "border-primary/60 ring-1 ring-primary/5" : ""
        )} style={{ height: isExpanded ? 400 : (customHeight || 240) }}>
            <div className="px-3 py-1.5 flex justify-between items-center border-b border-border/40 bg-muted/10">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/70">
                        {customTitle}
                    </span>
                    {activeValues.length > 0 && <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />}
                </div>
                <div className="flex items-center gap-1.5 scale-90">
                    <button
                        onClick={onToggleExpand}
                        className="p-1 px-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all flex items-center gap-1"
                        title={isExpanded ? "Collapse" : "Expand Size"}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            {isExpanded ? <path d="M8 3v5H3M16 3v5h5M16 21v-5h5M8 21v-5H3" /> : <path d="m15 15 6 6m-6-1.5 6.5.5V14M9 9 3 3M9 10.5 2.5 10V14m6-5L2 2" />}
                        </svg>
                    </button>
                    <ChartTypeSelector
                        data={chartData}
                        currentType={chartType}
                        onTypeChange={setChartType}
                        title={customTitle}
                        onTitleChange={setCustomTitle}
                        variant="mini"
                    />
                    <ExportButton
                        data={chartData}
                        title={`${customTitle} Analytics (${type})`}
                        filename={`${type}_${level.field}_export`}
                    />
                </div>
            </div>
            <div className="flex-1 p-1 relative overflow-hidden flex items-center justify-center">
                <UniversalChartRenderer
                    data={chartData}
                    chartType={chartType}
                    variant={isExpanded ? 'default' : 'mini'}
                    onPointClick={handlePointClick}
                    onPointExport={handlePointExport}
                    onContextMenu={handleContextMenu}
                />
            </div>
            {contextMenu && createPortal(
                <div
                    className="fixed z-[9999] w-60 bg-background/95 backdrop-blur-xl border border-border shadow-2xl rounded-2xl overflow-hidden py-1.5 animate-in fade-in zoom-in-90 duration-200"
                    style={{ left: contextMenu.x, top: contextMenu.y }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="px-4 py-2 border-b border-border/50 bg-primary/5 mb-1.5">
                        <p className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                            <Settings2 size={10} />
                            Quick Actions
                        </p>
                        <p className="text-xs font-bold text-foreground truncate mt-0.5">{contextMenu.name}</p>
                    </div>

                    <button
                        onClick={() => {
                            if (!activeValues.includes(contextMenu.name)) {
                                toggleFilter(level.field, contextMenu.name, type);
                            }
                            setSelectedModule('filteredEvents');
                            setContextMenu(null);
                        }}
                        className="w-full text-left px-4 py-2 text-xs hover:bg-primary hover:text-primary-foreground transition-all flex items-center gap-3 group"
                    >
                        <Activity size={14} className="text-primary group-hover:text-primary-foreground shadow-sm" />
                        <div>
                            <p className="font-bold">Event Analysis</p>
                            <p className="text-[9px] opacity-70">RCA & Alarms</p>
                        </div>
                    </button>

                    <button
                        onClick={() => {
                            if (!activeValues.includes(contextMenu.name)) {
                                toggleFilter(level.field, contextMenu.name, type);
                            }
                            setSelectedModule('filteredConfig');
                            setContextMenu(null);
                        }}
                        className="w-full text-left px-4 py-2 text-xs hover:bg-blue-500 hover:text-white transition-all flex items-center gap-3 group"
                    >
                        <Database size={14} className="text-blue-500 group-hover:text-white" />
                        <div>
                            <p className="font-bold">Config Issues</p>
                            <p className="text-[9px] opacity-70">Downloads & Compliance</p>
                        </div>
                    </button>

                    <button
                        onClick={() => {
                            handlePointClick(contextMenu.name);
                            setContextMenu(null);
                        }}
                        className="w-full text-left px-4 py-2 text-xs hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-3 group"
                    >
                        <ExternalLink size={14} className="text-emerald-500 group-hover:text-white" />
                        <div>
                            <p className="font-bold">Toggle Filter</p>
                            <p className="text-[9px] opacity-70">Apply/Remove Segment</p>
                        </div>
                    </button>

                    <div className="border-t border-border/50 mt-1.5 pt-1.5">
                        <button className="w-full text-left px-4 py-2 text-xs hover:bg-muted text-muted-foreground flex items-center gap-3 group transition-colors">
                            <TrendingUp size={14} className="opacity-50 group-hover:opacity-100" />
                            <span>Correlate Trends</span>
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}

export function InterdependentAnalytics() {
    const { nodeHierarchyLevels, linkHierarchyLevels } = useInventoryStore();

    return (
        <div className="flex flex-col gap-6 pt-0">
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <AnalyticsSet title="Link Inventory Analytics" type="links" levels={linkHierarchyLevels} showBackButton />
            </div>
            <div className="animate-in fade-in slide-in-from-top-4 duration-700">
                <AnalyticsSet title="Node Inventory Analytics" type="nodes" levels={nodeHierarchyLevels} />
            </div>
        </div>
    );
}
