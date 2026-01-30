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
    ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
    Cell, CartesianGrid, AreaChart, Area, LineChart, Line,
    PieChart, Pie, Legend
} from 'recharts';

type TimeRange = 'today' | '7days' | '30days' | 'custom';

// Polling Parameters Data
const POLLING_DATA = [
    {
        parameter: 'Jitter',
        configured: 50000,
        resources: 200000,
        snmpUp: 190000,
        polling: 180000,
        color: 'hsl(280, 70%, 55%)'
    },
    {
        parameter: 'Packet Loss',
        configured: 50000,
        resources: 200000,
        snmpUp: 190000,
        polling: 180000,
        color: 'hsl(12, 85%, 55%)'
    },
    {
        parameter: 'Latency',
        configured: 50000,
        resources: 200000,
        snmpUp: 190000,
        polling: 180000,
        color: 'hsl(38, 92%, 50%)'
    },
    {
        parameter: 'Utilization',
        configured: 95000,
        resources: 110000,
        snmpUp: 100000,
        polling: 90000,
        color: 'hsl(210, 100%, 55%)'
    }
];

// Polling Failure Reasons
const POLLING_FAILURES = [
    { reason: 'SNMP Timeout', count: 8500, percentage: 42.5, color: 'hsl(12, 85%, 55%)' },
    { reason: 'Device Unreachable', count: 5200, percentage: 26, color: 'hsl(38, 92%, 50%)' },
    { reason: 'Authentication Failed', count: 3800, percentage: 19, color: 'hsl(280, 70%, 55%)' },
    { reason: 'Configuration Error', count: 2500, percentage: 12.5, color: 'hsl(210, 100%, 55%)' }
];

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
                <div className="rounded-xl border border-border/50 bg-card/50 p-6 flex items-center gap-6">
                    <div className="h-16 w-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <Link2 size={32} />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Links Modified</span>
                        <div className="text-3xl font-black">{discoveryStats.linksModified}</div>
                        <p className="text-[10px] text-blue-500 font-bold">Topology changes detected</p>
                    </div>
                </div>

                <div className="rounded-xl border border-border/50 bg-card/50 p-6 flex items-center gap-6">
                    <div className="h-16 w-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                        <TrendingUp size={32} />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">ICMP → SNMP</span>
                        <div className="text-3xl font-black">{discoveryStats.icmpToSnmp}</div>
                        <p className="text-[10px] text-purple-500 font-bold">Protocol upgrades</p>
                    </div>
                </div>

                <div className="rounded-xl border border-border/50 bg-card/50 p-6 flex items-center gap-6">
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <PlusCircle size={32} />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">New Resources</span>
                        <div className="text-3xl font-black">{discoveryStats.newResources}</div>
                        <p className="text-[10px] text-emerald-500 font-bold">Discovered devices</p>
                    </div>
                </div>

                <div className="rounded-xl border border-border/50 bg-card/50 p-6 flex items-center gap-6">
                    <div className="h-16 w-16 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                        <AlertTriangle size={32} />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Modifications</span>
                        <div className="text-3xl font-black">{discoveryStats.modificationsDetected}</div>
                        <p className="text-[10px] text-orange-500 font-bold">Config changes found</p>
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
                                    <Line type="monotone" dataKey="new" stroke="hsl(var(--primary))" strokeWidth={3} name="New Devices" />
                                    <Line type="monotone" dataKey="changes" stroke="hsl(210, 100%, 55%)" strokeWidth={3} name="Changes" />
                                    <Line type="monotone" dataKey="success" stroke="hsl(160, 84%, 39%)" strokeWidth={3} name="Successful Scans" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Polling Statistics */}
            <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Database size={14} className="text-primary" />
                            Polling Parameters Statistics
                        </h3>
                        <p className="text-[10px] text-muted-foreground mt-1">Configured devices vs actual polling status</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-muted/50 font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50">
                            <tr>
                                <th className="px-4 py-3">Parameter</th>
                                <th className="px-4 py-3 text-right">Devices Configured</th>
                                <th className="px-4 py-3 text-right">No of Resources</th>
                                <th className="px-4 py-3 text-right">SNMP Up</th>
                                <th className="px-4 py-3 text-right">Polling</th>
                                <th className="px-4 py-3 text-right">Success Rate</th>
                                <th className="px-4 py-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {POLLING_DATA.map((item, idx) => {
                                const successRate = ((item.polling / item.resources) * 100).toFixed(1);
                                const notPolled = item.resources - item.polling;

                                return (
                                    <tr key={idx} className="hover:bg-muted/20 transition-colors group">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                                                <span className="font-bold text-foreground">{item.parameter}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-right font-semibold tabular-nums">{item.configured.toLocaleString()}</td>
                                        <td className="px-4 py-4 text-right font-semibold tabular-nums">{item.resources.toLocaleString()}</td>
                                        <td className="px-4 py-4 text-right font-semibold tabular-nums text-blue-500">{item.snmpUp.toLocaleString()}</td>
                                        <td className="px-4 py-4 text-right font-bold tabular-nums text-emerald-500">{item.polling.toLocaleString()}</td>
                                        <td className="px-4 py-4 text-right">
                                            <span className={cn(
                                                "font-black tabular-nums",
                                                parseFloat(successRate) > 90 ? "text-emerald-500" :
                                                    parseFloat(successRate) > 80 ? "text-orange-500" : "text-red-500"
                                            )}>
                                                {successRate}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            {parseFloat(successRate) > 90 ? (
                                                <Wifi size={16} className="inline text-emerald-500" />
                                            ) : (
                                                <WifiOff size={16} className="inline text-orange-500" />
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Polling Failure Analysis */}
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-6">
                    <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm h-full">
                        <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <AlertTriangle size={14} className="text-orange-500" />
                            Polling Failure Reasons
                        </h3>
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={POLLING_FAILURES}
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="count"
                                        label={({ reason, percentage }) => `${reason}: ${percentage}%`}
                                        labelLine={{ stroke: 'hsl(var(--border))' }}
                                    >
                                        {POLLING_FAILURES.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-6">
                    <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm h-full">
                        <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                            Failure Breakdown
                        </h3>
                        <div className="space-y-4">
                            {POLLING_FAILURES.map((failure, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: failure.color }} />
                                            <span className="text-xs font-bold text-foreground">{failure.reason}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-muted-foreground">{failure.count.toLocaleString()} devices</span>
                                            <span className="text-sm font-black" style={{ color: failure.color }}>{failure.percentage}%</span>
                                        </div>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                backgroundColor: failure.color,
                                                width: `${failure.percentage}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-4 border-t border-border/30">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-muted-foreground">Total Failures</span>
                                <span className="text-lg font-black text-red-500">
                                    {POLLING_FAILURES.reduce((sum, f) => sum + f.count, 0).toLocaleString()}
                                </span>
                            </div>
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
