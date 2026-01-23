import React, { useMemo, useState, useEffect } from 'react';
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
import { ChevronRight, Home, RefreshCw, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

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

export function DrilldownHierarchy() {
    const { getFilteredNodes, getFilteredLinks, hierarchyLevels: storeLevels } = useInventoryStore();
    const nodes = getFilteredNodes();
    const links = getFilteredLinks();

    const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
    const [history, setHistory] = useState<{ field: string; linkField: string; value: string; label: string }[]>([]);

    const currentLevel = storeLevels[currentLevelIdx];

    // Reset drilldown if hierarchy order is changed by user
    useEffect(() => {
        reset();
    }, [storeLevels.map(l => l.id).join(',')]);

    const drilldownData = useMemo(() => {
        let filteredNodes = [...nodes];
        let filteredLinks = [...links];

        // Core filtering logic: walk through history and filter both sets
        history.forEach(h => {
            filteredNodes = filteredNodes.filter(n => String((n as any)[h.field]).toUpperCase() === h.value.toUpperCase());
            filteredLinks = filteredLinks.filter(l => String((l as any)[h.linkField]).toUpperCase() === h.value.toUpperCase());
        });

        const groups = new Map<string, number>();
        const majorMakes = ['CISCO', 'FORTINET', 'HUAWEI'];

        // Pre-populate with 0 for all expected categories
        if (currentLevel.expectedValues) {
            currentLevel.expectedValues.forEach(val => groups.set(val, 0));
        }

        // Aggregate counts for the current level
        filteredNodes.forEach(n => {
            let rawVal = (n as any)[currentLevel.field];
            if (rawVal && String(rawVal).toUpperCase() !== 'UNKNOWN') {
                let val = String(rawVal);
                if (currentLevel.field === 'make') {
                    const upperVal = val.toUpperCase();
                    if (!majorMakes.includes(upperVal)) {
                        val = 'Others';
                    } else {
                        // Match casing with expectedValues if possible
                        val = currentLevel.expectedValues?.find(ev => ev.toUpperCase() === upperVal) || val;
                    }
                }
                groups.set(val, (groups.get(val) || 0) + 1);
            }
        });

        filteredLinks.forEach(l => {
            let rawVal = (l as any)[currentLevel.linkField];
            if (rawVal && String(rawVal).toUpperCase() !== 'UNKNOWN') {
                let val = String(rawVal);
                if (currentLevel.linkField === 'make') {
                    const upperVal = val.toUpperCase();
                    if (!majorMakes.includes(upperVal)) {
                        val = 'Others';
                    } else {
                        // Match casing with expectedValues if possible
                        val = currentLevel.expectedValues?.find(ev => ev.toUpperCase() === upperVal) || val;
                    }
                }
                groups.set(val, (groups.get(val) || 0) + 1);
            }
        });

        return Array.from(groups.entries())
            .map(([name, value], index) => ({
                name,
                value,
                color: STATUS_COLORS[name.toUpperCase()] || COLORS[index % COLORS.length]
            }))
            .sort((a, b) => {
                if (a.name === 'Others') return 1;
                if (b.name === 'Others') return -1;
                return b.value - a.value;
            });
    }, [nodes, links, currentLevel, history]);

    const handleDrilldown = (name: string) => {
        if (currentLevelIdx < storeLevels.length - 1) {
            setHistory([...history, {
                field: currentLevel.field,
                linkField: currentLevel.linkField || (currentLevel.field as string),
                value: name,
                label: name
            }]);
            setCurrentLevelIdx(currentLevelIdx + 1);
        }
    };

    const handleBack = () => {
        if (history.length > 0) {
            setHistory(history.slice(0, -1));
            setCurrentLevelIdx(currentLevelIdx - 1);
        }
    };

    const reset = () => {
        setHistory([]);
        setCurrentLevelIdx(0);
    };

    const handleBreadcrumbClick = (index: number) => {
        const newHistory = history.slice(0, index + 1);
        setHistory(newHistory);
        setCurrentLevelIdx(newHistory.length);
    };

    const currentTotal = drilldownData.reduce((acc, d) => acc + d.value, 0);

    return (
        <div className="chart-container flex flex-col h-full min-h-[450px]">
            <div className="mb-6 flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                        Airtel Network Drill-down
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground overflow-x-auto pb-1 no-scrollbar">
                        <button
                            onClick={reset}
                            className={cn(
                                "hover:text-primary transition-colors flex items-center gap-1",
                                history.length === 0 && "text-primary font-bold"
                            )}
                        >
                            <Home size={12} /> Root
                        </button>
                        {history.map((h, i) => (
                            <React.Fragment key={i}>
                                <ChevronRight size={10} />
                                <button
                                    onClick={() => handleBreadcrumbClick(i)}
                                    className={cn(
                                        "whitespace-nowrap hover:text-primary transition-colors",
                                        i === history.length - 1 && "text-primary font-bold cursor-default hover:text-primary"
                                    )}
                                >
                                    {h.label}
                                </button>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
                <div className="flex gap-2">
                    {history.length > 0 && (
                        <button
                            onClick={handleBack}
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors"
                            title="Go Back"
                        >
                            <ArrowLeft size={16} />
                        </button>
                    )}
                    <button
                        onClick={reset}
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors"
                        title="Reset"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>

            <div className="flex-1 relative flex flex-col">
                {drilldownData.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center h-full">
                        <div className="h-[300px] w-full relative">
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-bold">{currentTotal}</span>
                                <span className="text-[10px] uppercase font-bold text-muted-foreground">Total {currentLevel.label}s</span>
                            </div>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={drilldownData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={110}
                                        paddingAngle={4}
                                        dataKey="value"
                                        onClick={(e) => handleDrilldown(e.name)}
                                        style={{ cursor: currentLevelIdx < storeLevels.length - 1 ? 'pointer' : 'default' }}
                                    >
                                        {drilldownData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--popover))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '8px'

                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="space-y-4">
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b border-border/50 pb-2">
                                Distribution by {currentLevel.label}
                            </p>
                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {drilldownData.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="group cursor-pointer"
                                        onClick={() => handleDrilldown(item.name)}
                                    >
                                        <div className="flex items-center justify-between mb-1.5 text-xs">
                                            <span className="font-semibold group-hover:text-primary transition-colors flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                                {item.name}
                                            </span>
                                            <span className="text-muted-foreground">
                                                {item.value} <span className="text-[10px] ml-1">({currentTotal > 0 ? Math.round((item.value / currentTotal) * 100) : 0}%)</span>
                                            </span>
                                        </div>
                                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full transition-all duration-500 ease-out"
                                                style={{
                                                    width: `${currentTotal > 0 ? (item.value / currentTotal) * 100 : 0}%`,
                                                    backgroundColor: item.color
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            {currentLevelIdx < storeLevels.length - 1 && (
                                <p className="text-[10px] text-muted-foreground italic text-center animate-pulse">
                                    Click a segment to drill down into the next level
                                </p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground opacity-50">
                        <RefreshCw size={32} className="mb-2 animate-spin-slow" />
                        <p className="text-sm">No data path found for this selection</p>
                    </div>
                )}
            </div>
        </div>
    );
}
