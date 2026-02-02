import React, { useMemo, useState } from 'react';
import { useInventoryStore } from '@/store/inventoryStore';
import {
    Activity,
    BarChart3,
    Download,
    ChevronLeft,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    SignalHigh,
    Info,
    MousePointer2,
    ShieldAlert,
    Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
    CartesianGrid, LabelList
} from 'recharts';
import { exportToCSV } from '@/utils/exportUtils';

// --- MOCK DATA ---
const generateJitterData = (count: number) => {
    const regions = ['North', 'South', 'East', 'West'];
    const issues = ['None', 'Probe Timeout', 'High Latency', 'ICMP Blocked', 'Route Flapping', 'Jitter Buffer Overrun'];

    return Array.from({ length: count }).map((_, i) => {
        const isPolled = Math.random() > 0.15;
        const jitter = isPolled ? Math.floor(Math.random() * 60) : 0;
        const issue = isPolled ? (jitter > 50 ? 'High Jitter' : 'None') : issues[Math.floor(Math.random() * (issues.length - 1)) + 1];

        return {
            id: `LNK-${2000 + i}`,
            name: `Link-${2000 + i}`,
            region: regions[Math.floor(Math.random() * regions.length)],
            jitter,
            status: isPolled ? 'Polled' : 'Not Polled',
            issue
        };
    });
};

const JITTER_DATA = generateJitterData(150);

export function JitterAnalytics() {
    const { setSelectedModule } = useInventoryStore();
    const [filter, setFilter] = useState('All');

    const stats = useMemo(() => {
        const total = JITTER_DATA.length;
        const polled = JITTER_DATA.filter(d => d.status === 'Polled').length;
        const notPolled = total - polled;
        const highJitter = JITTER_DATA.filter(d => d.jitter > 30).length;

        return { total, polled, notPolled, highJitter };
    }, []);

    const issueData = useMemo(() => {
        const counts: Record<string, number> = {};
        JITTER_DATA.filter(d => d.issue !== 'None').forEach(d => {
            counts[d.issue] = (counts[d.issue] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    }, []);

    const jitterDistribution = useMemo(() => {
        const dist = [
            { name: '< 10ms', value: 0, color: '#10b981' },
            { name: '10-30ms', value: 0, color: '#3b82f6' },
            { name: '30-50ms', value: 0, color: '#f59e0b' },
            { name: '> 50ms', value: 0, color: '#ef4444' }
        ];
        JITTER_DATA.filter(d => d.status === 'Polled').forEach(d => {
            if (d.jitter < 10) dist[0].value++;
            else if (d.jitter <= 30) dist[1].value++;
            else if (d.jitter <= 50) dist[2].value++;
            else dist[3].value++;
        });
        return dist;
    }, []);

    const filteredData = useMemo(() => {
        if (filter === 'All') return JITTER_DATA;
        if (filter === 'Polled') return JITTER_DATA.filter(d => d.status === 'Polled');
        if (filter === 'Not Polled') return JITTER_DATA.filter(d => d.status === 'Not Polled');
        if (filter === 'High Jitter') return JITTER_DATA.filter(d => d.jitter > 30);
        return JITTER_DATA;
    }, [filter]);

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-500 pb-10 max-w-[1600px] mx-auto">
            {/* Header Section */}
            <div className="flex flex-col gap-1 px-1">
                <div className="flex items-center gap-3">
                    <button onClick={() => setSelectedModule('unified')} className="p-1 rounded-lg hover:bg-primary/10 text-primary transition-all flex items-center justify-center border border-primary/20 bg-primary/5">
                        <ChevronLeft size={20} strokeWidth={2.5} />
                    </button>
                    <div className="h-6 w-1 bg-primary rounded-full shadow-[0_0_8px_rgba(0,165,142,0.4)]" />
                    <div>
                        <h2 className="text-[14px] font-black uppercase tracking-[0.2em] text-foreground/90">SLA Jitter & Latency Portal</h2>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider opacity-60">Variance Analysis • Stability Monitoring • Jitter Diagnostics</p>
                    </div>
                </div>

                {/* Explainability Banner */}
                <div className="mt-4 p-4 rounded-xl border border-purple-500/20 bg-purple-500/5 flex items-start gap-3 shadow-inner">
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500 mt-1"><Info size={18} /></div>
                    <div>
                        <h4 className="text-[11px] font-black uppercase text-purple-700 tracking-wider mb-1">Impact of Jitter on Service Quality</h4>
                        <p className="text-[11px] leading-relaxed text-muted-foreground max-w-4xl">
                            Jitter measures the <strong>variation in packet arrival time</strong>. High jitter (&gt;30ms) causes choppy audio in Voice/VoIP and buffering in Video services.
                            <strong>Stability Monitoring</strong> classifies links: <span className="text-emerald-600 font-bold">Stable (&lt;10ms)</span>, <span className="text-amber-600 font-bold">Variable (30-50ms)</span>, and <span className="text-red-600 font-bold">Violating (&gt;50ms)</span>.
                            If Jitter is high while Load is low, investigate <strong>Route Flapping</strong> or hardware buffer issues.
                        </p>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-5"><Activity size={40} /></div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Total SLA Probes</p>
                        <p className="text-3xl font-black">{stats.total}</p>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-xl text-primary"><Activity size={24} /></div>
                </div>

                <div className={cn("rounded-xl border border-border bg-card p-4 flex items-center justify-between shadow-sm cursor-pointer transition-all hover:scale-[1.02] active:scale-95 group", filter === 'Polled' && "ring-2 ring-emerald-500/50 border-emerald-500/30 shadow-lg")} onClick={() => setFilter('Polled')}>
                    <div>
                        <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest mb-1 italic">Probe Status</p>
                        <p className="text-3xl font-black text-emerald-600">{stats.polled}</p>
                        <div className="flex items-center gap-1 text-[9px] text-emerald-700 font-bold mt-1 uppercase tracking-tighter"><CheckCircle2 size={10} /> Active Monitoring</div>
                    </div>
                    <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors"><ShieldAlert size={24} /></div>
                </div>

                <div className={cn("rounded-xl border border-border bg-card p-4 flex items-center justify-between shadow-sm cursor-pointer transition-all hover:scale-[1.02] active:scale-95 group", filter === 'Not Polled' && "ring-2 ring-red-500/50 border-red-500/30 shadow-lg")} onClick={() => setFilter('Not Polled')}>
                    <div>
                        <p className="text-[10px] font-black uppercase text-destructive tracking-widest mb-1 italic">Silent Probes</p>
                        <p className="text-3xl font-black text-destructive">{stats.notPolled}</p>
                        <div className="flex items-center gap-1 text-[9px] text-destructive font-bold mt-1 uppercase tracking-tighter"><XCircle size={10} /> ICMP/UDP Blocked</div>
                    </div>
                    <div className="p-3 bg-red-500/10 rounded-xl text-destructive group-hover:bg-red-500 group-hover:text-white transition-colors"><AlertTriangle size={24} /></div>
                </div>

                <div className={cn("rounded-xl border border-border bg-card p-4 flex items-center justify-between shadow-sm cursor-pointer transition-all hover:scale-[1.02] active:scale-95 group", filter === 'High Jitter' && "ring-2 ring-purple-500/50 border-purple-500/30 shadow-lg")} onClick={() => setFilter('High Jitter')}>
                    <div>
                        <p className="text-[10px] font-black uppercase text-purple-600 tracking-widest mb-1 italic">SLA Violations</p>
                        <p className="text-3xl font-black text-purple-600">{stats.highJitter}</p>
                        <div className="flex items-center gap-1 text-[9px] text-purple-700 font-bold mt-1 uppercase tracking-tighter"><TrendingUp size={10} /> &gt;30ms Variance</div>
                    </div>
                    <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors"><SignalHigh size={24} /></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <AlertTriangle size={16} className="text-destructive" />
                            Diagnostic Failure Analysis
                        </h3>
                        <button onClick={() => exportToCSV(issueData, 'Jitter_Failures')} className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-all bg-muted/30 border border-border/50"><Download size={14} /></button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mb-6 leading-relaxed bg-muted/20 p-2 rounded-lg border-l-2 border-destructive uppercase font-bold tracking-tight">
                        Breakdown of why SLA probes are failing. <strong>Route Flapping</strong> typically indicates routing protocol instability (BGP/OSPF neighbors bouncing).
                    </p>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={issueData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10, fontWeight: 800 }} />
                                <Tooltip cursor={{ fill: 'hsl(var(--primary)/0.05)' }} contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid hsl(var(--border))' }} />
                                <Bar dataKey="value" barSize={22} radius={[0, 6, 6, 0]} fill="#ef4444" cursor="pointer" onClick={(data) => exportToCSV(JITTER_DATA.filter(d => d.issue === data.name), `Jitter_Issue_${data.name}`)}>
                                    <LabelList dataKey="value" position="right" style={{ fontSize: '11px', fontWeight: 'black', fill: 'hsl(var(--destructive))' }} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Clock size={16} className="text-purple-500" />
                            Jitter Distribution Buckets
                        </h3>
                        <button onClick={() => exportToCSV(JITTER_DATA, 'Jitter_Distribution')} className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-all bg-muted/30 border border-border/50"><Download size={14} /></button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mb-6 leading-relaxed bg-muted/20 p-2 rounded-lg border-l-2 border-purple-500 uppercase font-bold tracking-tight">
                        Stability distribution. <strong>&gt;50ms</strong> represents severe service degradation for real-time applications like Voice and Precision Control systems.
                    </p>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={jitterDistribution}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'hsl(var(--muted)/0.3)' }} contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))' }} />
                                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={45} cursor="pointer" onClick={(data) => {
                                    // Complex filter for distribution
                                    exportToCSV(JITTER_DATA.filter(d => {
                                        if (data.name === '< 10ms') return d.jitter < 10 && d.status === 'Polled';
                                        if (data.name === '10-30ms') return d.jitter > 10 && d.jitter <= 30;
                                        if (data.name === '> 50ms') return d.jitter > 50;
                                        return false;
                                    }), `Jitter_Bucket_${data.name}`);
                                }}>
                                    {jitterDistribution.map((entry, index) => <Bar key={`cell-${index}`} fill={entry.color} dataKey="value" />) /* Cell equivalent */}
                                </Bar>
                                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={45}>
                                    {jitterDistribution.map((entry, index) => (
                                        <Bar key={`bar-${index}`} dataKey="value" fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden border-t-4 border-t-purple-600">
                <div className="p-5 border-b border-border/50 flex items-center justify-between bg-muted/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-600 text-white rounded-lg shadow-lg shadow-purple-600/20"><Activity size={16} /></div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">SLA Stability Deep-Dive</h3>
                            <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{filteredData.length} Link Probes</span>
                        </div>
                    </div>
                    <button onClick={() => exportToCSV(filteredData, 'Jitter_SLA_Detailed')} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-purple-700 transition-all shadow-lg shadow-purple-600/20">
                        <Download size={16} /> Export Detailed Report
                    </button>
                </div>
                <div className="max-h-[500px] overflow-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="text-[10px] uppercase font-black text-muted-foreground bg-muted/30 sticky top-0 z-10 backdrop-blur-md">
                            <tr>
                                <th className="p-4 border-b border-border/50">Probe Identity</th>
                                <th className="p-4 border-b border-border/50 text-center">Geography</th>
                                <th className="p-4 border-b border-border/50 text-center">SLA Health</th>
                                <th className="p-4 border-b border-border/50 text-center">Variance (Jitter)</th>
                                <th className="p-4 border-b border-border/50 text-right">Operational Insight</th>
                            </tr>
                        </thead>
                        <tbody className="text-[12px] font-bold divide-y divide-border/20">
                            {filteredData.map((row, i) => (
                                <tr key={i} className="hover:bg-purple-500/5 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-black text-purple-600 group-hover:underline cursor-pointer">{row.name}</span>
                                            <span className="text-[9px] text-muted-foreground font-mono italic">{row.id}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center"><span className="px-2 py-1 bg-muted rounded text-[10px] uppercase">{row.region}</span></td>
                                    <td className="p-4 text-center">
                                        <span className={cn("px-2.5 py-1 rounded-full text-[10px] uppercase font-black tracking-tighter", row.status === 'Polled' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>{row.status}</span>
                                    </td>
                                    <td className="p-4 text-center font-mono font-black italic">
                                        {row.status === 'Polled' ? <span className={cn(row.jitter > 30 ? "text-red-500" : "text-emerald-600")}>{row.jitter} ms</span> : <span className="text-muted-foreground opacity-30">-</span>}
                                    </td>
                                    <td className="p-4 text-right">
                                        {row.issue !== 'None' ? (
                                            <div className="flex flex-col items-end">
                                                <span className="text-destructive font-black text-[10px] uppercase italic tracking-tighter">{row.issue}</span>
                                                <span className="text-[8px] text-muted-foreground opacity-70">SLA Violation Threshold Breached</span>
                                            </div>
                                        ) : row.jitter > 10 ? (
                                            <span className="text-amber-600 text-[10px] uppercase font-black">Warning: Medium Variance</span>
                                        ) : (
                                            <span className="text-emerald-600 text-[10px] opacity-40 uppercase tracking-widest font-black">Stable Link</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
