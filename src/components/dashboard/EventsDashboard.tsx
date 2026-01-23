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
    Download
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

export function EventsDashboard() {
    const { allEvents, activeEvents } = useInventoryStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [severityFilter, setSeverityFilter] = useState<string | null>(null);

    // Stats
    const stats = useMemo(() => {
        const counts = {
            CRITICAL: 0,
            MAJOR: 0,
            MINOR: 0,
            WARNING: 0,
            TOTAL: allEvents.length,
            ACTIVE: activeEvents.length
        };
        allEvents.forEach(e => {
            if (counts[e.severity as keyof typeof counts] !== undefined) {
                counts[e.severity as keyof typeof counts]++;
            }
        });
        return counts;
    }, [allEvents, activeEvents]);

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
        allEvents.forEach(e => {
            const cat = e.category || 'Uncategorized';
            counts[cat] = (counts[cat] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 8);
    }, [allEvents]);

    // Filtered Events
    const filteredEvents = useMemo(() => {
        return allEvents.filter(e => {
            const matchesSearch =
                e.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                e.faultName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                e.ip.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesSeverity = !severityFilter || e.severity === severityFilter;
            return matchesSearch && matchesSeverity;
        });
    }, [allEvents, searchTerm, severityFilter]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-widest text-foreground">
                        Event Analytics
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Real-time network fault analysis and incident tracking.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:bg-muted transition-all">
                        <Download size={14} />
                        Export Report
                    </button>
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
