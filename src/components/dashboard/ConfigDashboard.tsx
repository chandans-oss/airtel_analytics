import { useMemo, useState } from 'react';
import { useInventoryStore } from '@/store/inventoryStore';
import {
    Settings,
    ShieldAlert,
    Calendar,
    CheckCircle2,
    XCircle,
    Search,
    Clock,
    RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
    Cell, CartesianGrid, LineChart, Line
} from 'recharts';

export function ConfigDashboard() {
    const { configCalendar, configFailure } = useInventoryStore();
    const [searchTerm, setSearchTerm] = useState('');

    // Stats
    const stats = useMemo(() => {
        return {
            TOTAL_EVENTS: configCalendar.length,
            FAILURES: configFailure.length,
            SUCCESS_RATE: configCalendar.length > 0
                ? Math.round(((configCalendar.length - configFailure.length) / configCalendar.length) * 100)
                : 100,
            PENDING_AUDITS: configCalendar.filter(c => c.state === 'Scheduled').length
        };
    }, [configCalendar, configFailure]);

    // Failure Reasons
    const failureReasons = useMemo(() => {
        const counts: Record<string, number> = {};
        configFailure.forEach(f => {
            const reason = f.failureReason || 'Unknown';
            counts[reason] = (counts[reason] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [configFailure]);

    // Event Timeline (Mocking some trend data based on dates if available, otherwise generic)
    const timelineData = useMemo(() => {
        const dailyCounts: Record<string, number> = {};
        configCalendar.forEach(c => {
            const date = c.date?.split(' ')[0] || 'Unknown';
            dailyCounts[date] = (dailyCounts[date] || 0) + 1;
        });
        return Object.entries(dailyCounts)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(-7);
    }, [configCalendar]);

    const filteredFailures = useMemo(() => {
        return configFailure.filter(f =>
            f.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            f.failureReason.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [configFailure, searchTerm]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-widest text-foreground">
                        Configuration Management
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Automated audits, backup status, and compliance tracking.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 rounded-lg bg-muted/50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:bg-muted transition-all">
                        <RotateCcw size={14} />
                        Trigger Audit
                    </button>
                    <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-lg hover:bg-primary/90 transition-all">
                        <Settings size={14} />
                        Config Policies
                    </button>
                </div>
            </div>

            {/* Config KPIs */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-border/50 bg-card/50 p-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Compliance Rate</span>
                            <div className="text-3xl font-black">{stats.SUCCESS_RATE}%</div>
                        </div>
                        <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-500">
                            <CheckCircle2 size={20} />
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-border/50 bg-card/50 p-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Failures</span>
                            <div className="text-3xl font-black text-destructive">{stats.FAILURES}</div>
                        </div>
                        <div className="rounded-lg bg-destructive/10 p-2 text-destructive">
                            <ShieldAlert size={20} />
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-border/50 bg-card/50 p-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total Change Events</span>
                            <div className="text-3xl font-black">{stats.TOTAL_EVENTS}</div>
                        </div>
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                            <Clock size={20} />
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-border/50 bg-card/50 p-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Scheduled Jobs</span>
                            <div className="text-3xl font-black text-blue-500">{stats.PENDING_AUDITS}</div>
                        </div>
                        <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500">
                            <Calendar size={20} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Visualizations */}
                <div className="col-span-12 lg:col-span-5 space-y-6">
                    <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
                        <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                            Failure Reason Analysis
                        </h3>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={failureReasons} layout="vertical">
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                                        width={120}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                                    />
                                    <Bar dataKey="value" fill="hsl(12, 85%, 55%)" radius={[0, 4, 4, 0]} barSize={12} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
                        <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                            Change Activity (Last 7 Days)
                        </h3>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={timelineData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                                    <XAxis dataKey="date" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={3}
                                        dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                                        activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Audit Failures Table */}
                <div className="col-span-12 lg:col-span-7">
                    <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="border-b border-border/50 bg-muted/30 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ShieldAlert size={18} className="text-destructive" />
                                <h3 className="text-sm font-bold uppercase tracking-wider">
                                    Compliance Exceptions
                                </h3>
                            </div>
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Filter failures..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-background border border-border/50 rounded-lg py-1 pl-9 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto max-h-[600px]">
                            <table className="w-full text-left text-[10px]">
                                <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-md font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50">
                                    <tr>
                                        <th className="px-4 py-3">Device Name</th>
                                        <th className="px-4 py-3">Scan Type</th>
                                        <th className="px-4 py-3">Failure Reason</th>
                                        <th className="px-4 py-3">Profile</th>
                                        <th className="px-4 py-3 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/20">
                                    {filteredFailures.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-muted/20 transition-colors">
                                            <td className="px-4 py-4 font-bold text-foreground">{item.deviceName}</td>
                                            <td className="px-4 py-4 uppercase opacity-70">{item.scanType}</td>
                                            <td className="px-4 py-4">
                                                <span className="text-destructive font-medium">{item.failureReason}</span>
                                            </td>
                                            <td className="px-4 py-4 italic text-muted-foreground">{item.configurationProfile}</td>
                                            <td className="px-4 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1 text-destructive font-black">
                                                    <XCircle size={10} />
                                                    FAILED
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredFailures.length === 0 && (
                                <div className="py-20 text-center text-muted-foreground">
                                    <CheckCircle2 size={40} className="mx-auto mb-4 text-emerald-500 opacity-20" />
                                    <p>No configuration failures detected.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
