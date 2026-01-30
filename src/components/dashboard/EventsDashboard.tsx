import { useMemo, useState } from 'react';
import { useInventoryStore } from '@/store/inventoryStore';
import {
    AlertCircle,
    AlertTriangle,
    Info,
    Clock,
    Search,
    Filter,
    ArrowUpDown,
    Download,
    Calendar,
    ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const SEVERITY_COLORS: Record<string, string> = {
    'CRITICAL': 'hsl(12, 85%, 55%)',
    'MAJOR': 'hsl(38, 92%, 50%)',
    'MINOR': 'hsl(174, 72%, 45%)',
    'WARNING': 'hsl(210, 100%, 55%)',
};

type TimeRange = '3h' | '24h' | '7d' | '1m' | '3m' | '1y' | 'all';

const TIME_RANGE_CONFIG = {
    '3h': { label: '3 Hours', hours: 3 },
    '24h': { label: '24 Hours', hours: 24 },
    '7d': { label: '7 Days', hours: 24 * 7 },
    '1m': { label: '1 Month', hours: 24 * 30 },
    '3m': { label: '1 Quarter', hours: 24 * 90 },
    '1y': { label: '1 Year', hours: 24 * 365 },
    'all': { label: 'All Time', hours: Infinity }
};

export function EventsDashboard() {
    const { allEvents, activeEvents } = useInventoryStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [severityFilter, setSeverityFilter] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState<TimeRange>('24h');

    // Filter events by time range
    const timeFilteredEvents = useMemo(() => {
        if (timeRange === 'all') return allEvents;

        const now = new Date();
        const cutoffTime = new Date(now.getTime() - TIME_RANGE_CONFIG[timeRange].hours * 60 * 60 * 1000);

        // Mock filtering: In production, filter by actual event timestamp
        // For now, we'll simulate by taking a percentage based on range
        const percentage = timeRange === '3h' ? 0.05 :
            timeRange === '24h' ? 0.2 :
                timeRange === '7d' ? 0.4 :
                    timeRange === '1m' ? 0.6 :
                        timeRange === '3m' ? 0.8 : 1;

        const count = Math.floor(allEvents.length * percentage);
        return allEvents.slice(-count);
    }, [allEvents, timeRange]);

    // Stats based on time-filtered events
    const stats = useMemo(() => {
        const counts = {
            CRITICAL: 0,
            MAJOR: 0,
            MINOR: 0,
            WARNING: 0,
            TOTAL: timeFilteredEvents.length,
            ACTIVE: Math.floor(timeFilteredEvents.length * 0.7) // Mock active count
        };
        timeFilteredEvents.forEach(e => {
            if (counts[e.severity as keyof typeof counts] !== undefined) {
                counts[e.severity as keyof typeof counts]++;
            }
        });
        return counts;
    }, [timeFilteredEvents]);

    // Severity Distribution Data
    const severityData = useMemo(() => {
        return Object.entries(SEVERITY_COLORS).map(([name, color]) => ({
            name,
            value: stats[name as keyof typeof stats] as number,
            color
        }));
    }, [stats]);

    // Category Distribution
    const categoryData = useMemo(() => {
        const counts: Record<string, number> = {};
        timeFilteredEvents.forEach(e => {
            const cat = e.category || 'Uncategorized';
            counts[cat] = (counts[cat] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 8);
    }, [timeFilteredEvents]);

    // Filtered Events (time + search + severity)
    const filteredEvents = useMemo(() => {
        return timeFilteredEvents.filter(e => {
            const matchesSearch =
                e.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                e.faultName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                e.ip.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesSeverity = !severityFilter || e.severity === severityFilter;
            return matchesSearch && matchesSeverity;
        });
    }, [timeFilteredEvents, searchTerm, severityFilter]);

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
                    <h1 className="text-[12px] font-black uppercase tracking-[0.15em] text-foreground/90">
                        Global Event Intelligence
                    </h1>
                </div>
                <div className="h-[1px] flex-1 mx-4 bg-gradient-to-r from-border/50 to-transparent" />
            </div>

            {/* Timeline Filter */}
            <div className="rounded-xl border border-border/50 bg-gradient-to-r from-card/50 to-card/30 backdrop-blur-sm p-4 shadow-sm">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Clock size={18} className="text-primary" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">
                                Time Range
                            </span>
                            <span className="text-sm font-bold text-foreground">
                                {TIME_RANGE_CONFIG[timeRange].label}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {(Object.keys(TIME_RANGE_CONFIG) as TimeRange[]).map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={cn(
                                    "px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                                    timeRange === range
                                        ? "bg-primary text-primary-foreground shadow-md scale-105"
                                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:scale-102"
                                )}
                            >
                                {TIME_RANGE_CONFIG[range].label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Time Range Info */}
                <div className="mt-3 pt-3 border-t border-border/30 flex items-center justify-between text-[10px]">
                    <span className="text-muted-foreground">
                        Showing <span className="font-bold text-foreground">{timeFilteredEvents.length}</span> events from the last <span className="font-bold text-primary">{TIME_RANGE_CONFIG[timeRange].label.toLowerCase()}</span>
                    </span>
                    <span className="text-muted-foreground">
                        Active: <span className="font-bold text-emerald-500">{stats.ACTIVE}</span> •
                        Critical: <span className="font-bold text-red-500"> {stats.CRITICAL}</span>
                    </span>
                </div>
            </div>

            {/* Severity KPIs */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Object.entries(SEVERITY_COLORS).map(([severity, color]) => (
                    <button
                        key={severity}
                        onClick={() => setSeverityFilter(severityFilter === severity ? null : severity)}
                        className={cn(
                            "relative overflow-hidden rounded-xl border p-4 transition-all hover:shadow-lg text-left group",
                            severityFilter === severity ? "border-primary ring-1 ring-primary" : "border-border/50 bg-card/50"
                        )}
                    >
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    {severity}
                                </span>
                                <div className="text-3xl font-black tabular-nums leading-none">
                                    {stats[severity as keyof typeof stats]}
                                </div>
                            </div>
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ backgroundColor: `${color}15` }}>
                                <AlertTriangle size={20} style={{ color }} />
                            </div>
                        </div>
                        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                    backgroundColor: color,
                                    width: `${(stats[severity as keyof typeof stats] as number / stats.TOTAL * 100) || 0}%`
                                }}
                            />
                        </div>
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Visualizations */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
                        <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                            Severity Distribution
                        </h3>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={severityData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {severityData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] font-bold uppercase tracking-wider">
                            {severityData.map(s => (
                                <div key={s.name} className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                                    <span className="text-muted-foreground">{s.name}</span>
                                    <span className="ml-auto opacity-50">{s.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
                        <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                            Top Fault Categories
                        </h3>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={categoryData} layout="vertical">
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                        width={100}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                                    />
                                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={12} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Event Table */}
                <div className="col-span-12 lg:col-span-8">
                    <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="border-b border-border/50 bg-muted/30 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <AlertCircle size={18} className="text-primary" />
                                <h3 className="text-sm font-bold uppercase tracking-wider">
                                    Fault Log <span className="text-xs text-muted-foreground lowercase font-medium">({filteredEvents.length} entries)</span>
                                </h3>
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <div className="relative flex-1 sm:w-64">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Search devices, faults..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-background border border-border/50 rounded-lg py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                                    />
                                </div>
                                <button className="p-2 rounded-lg border border-border/50 bg-background hover:bg-muted transition-colors text-muted-foreground">
                                    <Filter size={14} />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto max-h-[600px]">
                            <table className="w-full text-left text-xs">
                                <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-md font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50">
                                    <tr>
                                        <th className="px-4 py-3">Severity</th>
                                        <th className="px-4 py-3">Device & IP</th>
                                        <th className="px-4 py-3">Event Detail</th>
                                        <th className="px-4 py-3 whitespace-nowrap">Time Occurred</th>
                                        <th className="px-4 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                    {filteredEvents.map((event, idx) => (
                                        <tr key={idx} className="hover:bg-muted/20 transition-colors group">
                                            <td className="px-4 py-4">
                                                <span className="inline-flex items-center gap-1.5 font-black text-[10px]" style={{ color: SEVERITY_COLORS[event.severity] }}>
                                                    <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: SEVERITY_COLORS[event.severity] }} />
                                                    {event.severity}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-foreground truncate max-w-[150px]">{event.deviceName}</span>
                                                    <span className="text-[10px] text-muted-foreground font-mono">{event.ip}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex flex-col gap-0.5 max-w-[250px]">
                                                    <span className="font-medium text-foreground/90 truncate">{event.faultName}</span>
                                                    <span className="text-[10px] text-muted-foreground italic px-1.5 py-0.5 bg-muted rounded self-start">
                                                        {event.category || 'System'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-muted-foreground tabular-nums">
                                                <div className="flex flex-col">
                                                    <span>{event.startTime}</span>
                                                    <span className="text-[10px] opacity-70">Age: {event.age || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <button className="text-[10px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Analyze
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredEvents.length === 0 && (
                                <div className="py-20 text-center text-muted-foreground">
                                    <div className="flex justify-center mb-4 opacity-20">
                                        <AlertCircle size={48} />
                                    </div>
                                    <p className="text-sm font-medium">No events found matching your criteria</p>
                                    <button
                                        onClick={() => { setSearchTerm(''); setSeverityFilter(null); }}
                                        className="mt-2 text-xs text-primary hover:underline"
                                    >
                                        Clear all filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
