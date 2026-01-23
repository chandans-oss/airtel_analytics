import { useMemo } from 'react';
import { useInventoryStore } from '@/store/inventoryStore';
import { ChartContainer, UniversalChartRenderer } from './DistributionCharts';
import { cn } from '@/lib/utils';
import { RefreshCw } from 'lucide-react';

interface AnalyticsSetProps {
    title: string;
    type: 'nodes' | 'links';
    levels: {
        label: string;
        field: string;
        expectedValues?: string[];
    }[];
}

const MAJOR_MAKES = ['CISCO', 'FORTINET', 'HUAWEI'];

function AnalyticsSet({ title, type, levels }: AnalyticsSetProps) {
    const { getFilteredNodes, getFilteredLinks, toggleFilter } = useInventoryStore();

    const dataSet = type === 'nodes' ? getFilteredNodes() : getFilteredLinks();

    return (
        <div className="space-y-4 rounded-xl border border-border/50 bg-muted/5 p-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/80">
                    {title} Analytics <span className="text-[10px] text-muted-foreground ml-2 font-medium bg-muted px-2 py-0.5 rounded">Active Data View</span>
                </h3>
            </div>

            <div className={cn(
                "grid grid-cols-1 gap-4 md:grid-cols-3",
                levels.length === 5 ? "lg:grid-cols-5" :
                    levels.length === 4 ? "lg:grid-cols-4" :
                        levels.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-5"
            )}>
                {levels.map((level) => (
                    <AnalyticsWidget
                        key={level.field}
                        level={level}
                        type={type}
                        onFilter={(val) => toggleFilter(level.field, val, type)}
                    />
                ))}
            </div>
        </div>
    );
}

function AnalyticsWidget({ level, type, onFilter }: {
    level: any;
    type: 'nodes' | 'links';
    onFilter: (val: string) => void
}) {
    const { getFilteredNodesExcluding, getFilteredLinksExcluding, nodeFilters, linkFilters, setSidebarOpen } = useInventoryStore();

    // Get data filtered for EVERYTHING except this widget's own field
    const data = type === 'nodes'
        ? getFilteredNodesExcluding(level.field)
        : getFilteredLinksExcluding(level.field);

    const activeValues = (type === 'nodes' ? nodeFilters : linkFilters)[level.field] || [];

    const chartData = useMemo(() => {
        const groups = new Map<string, number>();

        // Initialize expected values with 0
        if (level.expectedValues) {
            level.expectedValues.forEach(v => groups.set(v, 0));
        }

        data.forEach(item => {
            let val = item[level.field];
            if (val && String(val).toUpperCase() !== 'UNKNOWN') {
                let key = String(val);

                // Normalize key against expected values (case-insensitive)
                if (level.expectedValues) {
                    const upperKey = key.toUpperCase();
                    const match = level.expectedValues.find(v => v.toUpperCase() === upperKey);
                    if (match) {
                        key = match;
                    } else if (level.field === 'make') {
                        key = 'Others';
                    }
                }

                // Increment if it's a valid key
                if (!level.expectedValues || groups.has(key)) {
                    groups.set(key, (groups.get(key) || 0) + 1);
                }
            }
        });

        return Array.from(groups.entries())
            .map(([name, value]) => {
                let color;
                if (level.field === 'status' || level.field === 'linkStatus') {
                    color = name === 'UP' ? 'hsl(160, 84%, 39%)' : 'hsl(12, 85%, 55%)';
                }

                // Effective highlighting: Gray out non-selected bars
                const isSelected = activeValues.includes(name);
                const hasAnySelection = activeValues.length > 0;

                let barColor = color;
                let opacity = 1;

                if (hasAnySelection) {
                    if (isSelected) {
                        opacity = 1;
                        if (!barColor) barColor = 'hsl(174, 72%, 45%)';
                    } else {
                        opacity = 0.15;
                        barColor = 'hsl(215, 15%, 65%)'; // Neutral Gray
                    }
                } else {
                    if (!barColor) barColor = 'hsl(174, 72%, 45%)';
                }

                return {
                    name,
                    value,
                    color: barColor,
                    opacity,
                    isSelected
                };
            })
            .sort((a, b) => {
                if (a.name === 'Others') return 1;
                if (b.name === 'Others') return -1;
                return b.value - a.value;
            });
    }, [data, level, activeValues]);

    const handlePointClick = (val: string) => {
        onFilter(val);
        // Only open sidebar for non-status fields
        if (level.field !== 'status' && level.field !== 'linkStatus') {
            setSidebarOpen(true);
        }
    };

    return (
        <div className={cn(
            "bg-card rounded-lg border shadow-sm overflow-hidden hover:shadow-md transition-all",
            activeValues.length > 0 ? "border-primary/40 ring-1 ring-primary/20" : "border-border/40"
        )}>
            <div className={cn(
                "px-3 py-2 border-b bg-muted/20 flex justify-between items-center",
                activeValues.length > 0 ? "border-primary/20" : "border-border/30"
            )}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
                    {level.label}
                </span>
                {activeValues.length > 0 && (
                    <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                        Filtered
                    </span>
                )}
            </div>
            <div className="p-1 h-[200px] flex items-center justify-center">
                <UniversalChartRenderer
                    data={chartData}
                    chartType="bar"
                    variant="mini"
                    onPointClick={handlePointClick}
                />
            </div>
        </div>
    );
}

export function InterdependentAnalytics() {
    const { clearFilters } = useInventoryStore();
    const nodeLevels = [
        { label: 'Status', field: 'status', expectedValues: ['UP', 'DOWN'] },
        { label: 'Make', field: 'make', expectedValues: ['Cisco', 'Fortinet', 'Huawei', 'Others'] },
        { label: 'Scan Type', field: 'scanType', expectedValues: ['SNMP', 'ICMP'] },
    ];

    const linkLevels = [
        { label: 'Link Status', field: 'linkStatus', expectedValues: ['UP', 'DOWN'] },
        { label: 'Flavor', field: 'serviceFlavor', expectedValues: ['Fully Managed', 'Partially Managed'] },
        { label: 'Make', field: 'make', expectedValues: ['Cisco', 'Fortinet', 'Huawei', 'Others'] },
        { label: 'Region', field: 'region', expectedValues: ['North', 'South', 'East', 'West'] },
        { label: 'Scan Type', field: 'scanType', expectedValues: ['SNMP', 'ICMP'] },
    ];

    return (
        <div className="space-y-10 py-6 border-t border-border/50 mt-12">
            <div className="flex flex-col items-center gap-4 text-center">
                <div className="space-y-2">
                    <h2 className="text-2xl font-black uppercase tracking-widest">Interdependent Business Intelligence</h2>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => clearFilters('nodes')}
                        className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 transition-all"
                    >
                        <RefreshCw size={12} />
                        Reset Nodes
                    </button>
                    <button
                        onClick={() => clearFilters('links')}
                        className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/10 transition-all"
                    >
                        <RefreshCw size={12} />
                        Reset Links
                    </button>
                </div>
            </div>

            <AnalyticsSet title="Node Inventory" type="nodes" levels={nodeLevels} />
            <AnalyticsSet title="Link Inventory" type="links" levels={linkLevels} />
        </div>
    );
}
