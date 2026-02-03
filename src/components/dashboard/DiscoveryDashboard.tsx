import { useMemo, useState } from 'react';
import { useInventoryStore } from '@/store/inventoryStore';
import {
    Search,
    Zap,
    History,
    PlusCircle,
    ArrowRight,
    SearchCode,
    Network,
    RefreshCw,
    Calendar,
    ChevronDown,
    Link2,
    Activity,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    TrendingUp,
    Database,
    Wifi,
    WifiOff,
    Clock,
    ChevronLeft,
    Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { exportToCSV } from '@/utils/exportUtils';
import {
    BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
    Cell, CartesianGrid, AreaChart, Area, LineChart, Line,
    PieChart, Pie, Legend
} from 'recharts';

type TimeRange = 'today' | '7days' | '30days' | 'custom';





export function DiscoveryDashboard() {
    const { nodes, links, configCalendar } = useInventoryStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [timeRange, setTimeRange] = useState<TimeRange>('7days');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Calculate date range based on selection
    const { startDate, endDate, label } = useMemo(() => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        switch (timeRange) {
            case 'today':
                return {
                    startDate: today,
                    endDate: now,
                    label: 'Today'
                };
            case '7days':
                const sevenDaysAgo = new Date(today);
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                return {
                    startDate: sevenDaysAgo,
                    endDate: now,
                    label: 'Last 7 Days'
                };
            case '30days':
                const thirtyDaysAgo = new Date(today);
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return {
                    startDate: thirtyDaysAgo,
                    endDate: now,
                    label: 'Last 30 Days'
                };
            case 'custom':
                if (customStartDate && customEndDate) {
                    return {
                        startDate: new Date(customStartDate),
                        endDate: new Date(customEndDate),
                        label: `${customStartDate} to ${customEndDate}`
                    };
                }
                return {
                    startDate: today,
                    endDate: now,
                    label: 'Select Custom Range'
                };
            default:
                return {
                    startDate: today,
                    endDate: now,
                    label: 'Today'
                };
        }
    }, [timeRange, customStartDate, customEndDate]);

    // Filter nodes based on time range
    const filteredNodes = useMemo(() => {
        const percentage = timeRange === 'today' ? 0.1 : timeRange === '7days' ? 0.3 : 1;
        const count = Math.floor(nodes.length * percentage);
        return nodes.slice(-count);
    }, [nodes, timeRange]);

    // Recent Additions
    const recentNodes = useMemo(() => filteredNodes.slice(-5).reverse(), [filteredNodes]);

    // Discovery Statistics
    const discoveryStats = useMemo(() => {
        const baseMultiplier = timeRange === 'today' ? 1 : timeRange === '7days' ? 7 : 30;

        return {
            linksModified: 127 * baseMultiplier,
            icmpToSnmp: 45 * baseMultiplier,
            newResources: filteredNodes.length,
            modificationsDetected: 89 * baseMultiplier,
            discoverySuccess: 94.5,
            discoveryFailure: 5.5,
            totalScans: 150 * baseMultiplier,
            successfulScans: 142 * baseMultiplier,
            failedScans: 8 * baseMultiplier
        };
    }, [timeRange, filteredNodes]);

    // Discovery Trend based on time range
    const discoveryTrend = useMemo(() => {
        if (timeRange === 'today') {
            return Array.from({ length: 24 }, (_, i) => ({
                day: `${i.toString().padStart(2, '0')}:00`,
                new: Math.floor(Math.random() * 5),
                changes: Math.floor(Math.random() * 10),
                success: Math.floor(Math.random() * 8) + 2
            })).filter((_, i) => i % 3 === 0);
        } else if (timeRange === '7days') {
            return [
                { day: 'Mon', new: 12, changes: 45, success: 8 },
                { day: 'Tue', new: 8, changes: 38, success: 7 },
                { day: 'Wed', new: 15, changes: 52, success: 9 },
                { day: 'Thu', new: 22, changes: 61, success: 10 },
                { day: 'Fri', new: 18, changes: 48, success: 8 },
                { day: 'Sat', new: 5, changes: 12, success: 4 },
                { day: 'Sun', new: 3, changes: 15, success: 3 },
            ];
        } else {
            return [
                { day: 'Week 1', new: 45, changes: 180, success: 32 },
                { day: 'Week 2', new: 38, changes: 165, success: 28 },
                { day: 'Week 3', new: 52, changes: 210, success: 38 },
                { day: 'Week 4', new: 41, changes: 195, success: 30 },
            ];
        }
    }, [timeRange]);

    const handleExportMetric = (metric: string, count: number) => {
        const mockDetails = Array.from({ length: Math.min(count, 100) }).map((_, i) => ({
            id: `DISC-${metric.substring(0, 3).toUpperCase()}-${i + 1}`,
            metric: metric,
            timestamp: new Date(Date.now() - Math.random() * 86400000 * (timeRange === '7days' ? 7 : 30)).toISOString(),
            details: `Automated detail for ${metric} event ${i + 1}`,
            status: 'Verified'
        }));
        exportToCSV(mockDetails, `Discovery_Metric_${metric.replace(/\s+/g, '_')}_${timeRange}`);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => useInventoryStore.getState().setSelectedModule('unified')}
                        className="p-1 rounded-lg hover:bg-primary/10 text-primary transition-all flex items-center justify-center"
                        title="Back to Overview"
                    >
                        <ChevronLeft size={20} strokeWidth={2.5} />
                    </button>
                    <div className="h-5 w-1 bg-primary rounded-full shadow-[0_0_8px_rgba(0,165,142,0.4)]" />
                    <div>
                        <h1 className="text-[12px] font-black uppercase tracking-[0.15em] text-foreground/90 leading-tight">
                            Discovery & Change
                        </h1>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-pulse" />
                            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">System Audit Timeline</span>
                        </div>
                    </div>
                </div>

                <div className="h-[1px] flex-1 mx-4 bg-gradient-to-r from-border/50 to-transparent" />

                <div className="flex items-center gap-1 rounded-lg bg-muted/50 p-1 border border-border/50">
                    {(['today', '7days', '30days'] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={cn(
                                "px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all",
                                timeRange === range
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-background/30"
                            )}
                        >
                            {range === 'today' ? 'Today' : range === '7days' ? '7 Days' : '30 Days'}
                        </button>
                    ))}
                    <div className="relative">
                        <button
                            onClick={() => setShowDatePicker(!showDatePicker)}
                            className={cn(
                                "px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1",
                                timeRange === 'custom'
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-background/30"
                            )}
                        >
                            Custom
                            <ChevronDown size={10} className={cn("transition-transform", showDatePicker && "rotate-180")} />
                        </button>
                        {showDatePicker && (
                            <div className="absolute right-0 top-full mt-2 p-4 bg-card border border-border rounded-xl shadow-2xl z-50 min-w-[280px] animate-in fade-in zoom-in-95 duration-200">
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            value={customStartDate}
                                            onChange={(e) => setCustomStartDate(e.target.value)}
                                            className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">End Date</label>
                                        <input
                                            type="date"
                                            value={customEndDate}
                                            onChange={(e) => setCustomEndDate(e.target.value)}
                                            className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (customStartDate && customEndDate) {
                                                setTimeRange('custom');
                                                setShowDatePicker(false);
                                            }
                                        }}
                                        className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-[10px] font-bold uppercase tracking-widest hover:brightness-110 transition-all"
                                    >
                                        Apply Range
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Discovery & Modification Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div
                    onClick={() => handleExportMetric('Links Modified', discoveryStats.linksModified)}
                    className="rounded-xl border border-border/50 bg-card/50 p-6 flex items-center gap-6 cursor-pointer hover:bg-muted/40 transition-all group relative"
                >
                    <div className="h-16 w-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                        <Link2 size={32} />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-blue-500 transition-colors">Links Modified</span>
                        <div className="text-3xl font-black tabular-nums">{discoveryStats.linksModified}</div>
                        <p className="text-[10px] text-blue-500 font-bold">Topology changes detected</p>
                    </div>
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Download size={12} className="text-muted-foreground" />
                    </div>
                </div>

                <div
                    onClick={() => handleExportMetric('ICMP to SNMP', discoveryStats.icmpToSnmp)}
                    className="rounded-xl border border-border/50 bg-card/50 p-6 flex items-center gap-6 cursor-pointer hover:bg-muted/40 transition-all group relative"
                >
                    <div className="h-16 w-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                        <TrendingUp size={32} />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-purple-500 transition-colors">ICMP → SNMP</span>
                        <div className="text-3xl font-black tabular-nums">{discoveryStats.icmpToSnmp}</div>
                        <p className="text-[10px] text-purple-500 font-bold">Protocol upgrades</p>
                    </div>
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Download size={12} className="text-muted-foreground" />
                    </div>
                </div>

                <div
                    onClick={() => handleExportMetric('New Resources', discoveryStats.newResources)}
                    className="rounded-xl border border-border/50 bg-card/50 p-6 flex items-center gap-6 cursor-pointer hover:bg-muted/40 transition-all group relative"
                >
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <PlusCircle size={32} />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">New Resources</span>
                        <div className="text-3xl font-black tabular-nums">{discoveryStats.newResources}</div>
                        <p className="text-[10px] text-emerald-500 font-bold">Discovered devices</p>
                    </div>
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Download size={12} className="text-muted-foreground" />
                    </div>
                </div>

                <div
                    onClick={() => handleExportMetric('Modifications', discoveryStats.modificationsDetected)}
                    className="rounded-xl border border-border/50 bg-card/50 p-6 flex items-center gap-6 cursor-pointer hover:bg-muted/40 transition-all group relative"
                >
                    <div className="h-16 w-16 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                        <AlertTriangle size={32} />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-orange-500 transition-colors">Modifications</span>
                        <div className="text-3xl font-black tabular-nums">{discoveryStats.modificationsDetected}</div>
                        <p className="text-[10px] text-orange-500 font-bold">Config changes found</p>
                    </div>
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Download size={12} className="text-muted-foreground" />
                    </div>
                </div>
            </div>

            {/* Discovery Success/Failure */}
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-4">
                    <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm h-full">
                        <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Activity size={14} className="text-primary" />
                            Discovery Success Rate
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 size={16} className="text-emerald-500" />
                                    <span className="text-xs font-bold text-foreground">Successful</span>
                                </div>
                                <span className="text-2xl font-black text-emerald-500">{discoveryStats.successfulScans}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <XCircle size={16} className="text-red-500" />
                                    <span className="text-xs font-bold text-foreground">Failed</span>
                                </div>
                                <span className="text-2xl font-black text-red-500">{discoveryStats.failedScans}</span>
                            </div>
                            <div className="pt-4 border-t border-border/30">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Success Rate</span>
                                    <span className="text-lg font-black text-primary">{discoveryStats.discoverySuccess}%</span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-primary transition-all duration-500"
                                        style={{ width: `${discoveryStats.discoverySuccess}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Discovery Trend */}
                <div className="col-span-12 lg:col-span-8">
                    <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
                        <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                            Discovery Activity Timeline
                        </h3>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={discoveryTrend}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                                    <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                                    />
                                    <Legend
                                        verticalAlign="top"
                                        height={36}
                                        iconType="circle"
                                        formatter={(value) => <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{value}</span>}
                                    />
                                    <Line type="monotone" dataKey="new" stroke="hsl(var(--primary))" strokeWidth={3} name="New Devices" />
                                    <Line type="monotone" dataKey="changes" stroke="hsl(210, 100%, 55%)" strokeWidth={3} name="Changes" />
                                    <Line type="monotone" dataKey="success" stroke="hsl(160, 84%, 39%)" strokeWidth={3} name="Successful Scans" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>



            {/* Recently Discovered Nodes */}
            <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
                <div className="border-b border-border/50 bg-muted/30 px-4 py-3 flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <SearchCode size={14} className="text-primary" />
                        Recently Discovered Nodes
                    </h3>
                </div>
                <div className="divide-y divide-border/30">
                    {recentNodes.length > 0 ? recentNodes.map((node, idx) => (
                        <div key={idx} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-all">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                    {node.make[0]}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-foreground">{node.deviceName}</span>
                                    <span className="text-[10px] text-muted-foreground uppercase">{node.deviceType} • {node.make}</span>
                                </div>
                            </div>
                            <button className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground">
                                <ArrowRight size={14} />
                            </button>
                        </div>
                    )) : (
                        <div className="p-8 text-center text-muted-foreground text-sm">
                            No discoveries in selected time range
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
