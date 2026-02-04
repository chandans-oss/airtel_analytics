import React, { useMemo, useState } from 'react';
import { useInventoryStore } from '@/store/inventoryStore';
import {
    Zap,
    Download,
    ChevronLeft,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Activity,
    ShieldCheck,
    MousePointer2,
    Link2,
    Globe,
    TrendingDown,
    Network,
    LayoutGrid
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
    CartesianGrid, LabelList, PieChart, Pie, Cell, Legend
} from 'recharts';
import { exportToCSV } from '@/utils/exportUtils';

export function LinkStatusAnalytics() {
    const { setSelectedModule, links } = useInventoryStore();
    const [filter, setFilter] = useState('All');

    const LINK_DATA = useMemo(() => {
        const regions = ['North', 'South', 'East', 'West', 'Central'];
        const types = ['Fiber Optic', 'Microwave', 'Leased Line', 'MPLS VPN', 'Satellite'];
        const failureReasons = [
            'Reachability Issue',
            'Device Unreachable',
            'Interface Operational Down',
            'Routing / Protocol Failure',
            'Provider End Unreachable',
            'Physical / Last-Mile Failure'
        ];

        // Use actual links if available, otherwise generate mock
        const baseData = links.length > 0 ? links : Array.from({ length: 109 }).map((_, i) => ({
            id: `LNK-${2000 + i}`,
            name: `Link-${2000 + i}`,
            region: regions[i % regions.length],
            status: i < 86 ? 'UP' : 'DOWN',
            type: types[i % types.length]
        }));

        return baseData.map((l: any, i) => {
            const isUp = l.status === 'UP' || l.linkStatus === 'UP';
            const latency = isUp ? Math.floor(Math.random() * 50 + 5) : 0;
            const jitter = isUp ? Math.floor(Math.random() * 10 + 2) : 0;
            const issue = isUp ? 'None' : (l.failureReason || failureReasons[i % failureReasons.length]);

            return {
                id: l.id || l.linkId || `LNK-${2000 + i}`,
                name: l.name || l.deviceName || `Link-${2000 + i}`,
                region: l.region || regions[i % regions.length],
                type: l.linkType || types[i % types.length],
                latency,
                jitter,
                status: isUp ? 'UP' : 'DOWN',
                issue
            };
        });
    }, [links]);

    const colors = ['#3b82f6', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

    const stats = useMemo(() => {
        const total = LINK_DATA.length;
        const up = LINK_DATA.filter(l => l.status === 'UP').length;
        const down = total - up;
        const highLatency = LINK_DATA.filter(l => l.status === 'UP' && l.latency > 40).length;

        return { total, up, down, highLatency };
    }, [LINK_DATA]);

    const issueData = useMemo(() => {
        const counts: Record<string, number> = {};
        LINK_DATA.filter(l => l.status === 'DOWN').forEach(l => {
            counts[l.issue] = (counts[l.issue] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    }, [LINK_DATA]);

    const regionData = useMemo(() => {
        const counts: Record<string, number> = {};
        LINK_DATA.forEach(l => {
            counts[l.region] = (counts[l.region] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [LINK_DATA]);

    const filteredData = useMemo(() => {
        if (filter === 'All') return LINK_DATA;
        if (filter === 'UP') return LINK_DATA.filter(l => l.status === 'UP');
        if (filter === 'DOWN') return LINK_DATA.filter(l => l.status === 'DOWN');
        if (filter === 'Latent') return LINK_DATA.filter(l => l.status === 'UP' && l.latency > 40);
        return LINK_DATA;
    }, [filter, LINK_DATA]);

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-500 pb-10 max-w-[1600px] mx-auto">
            <div className="flex flex-col gap-1 px-1">
                <div className="flex items-center gap-3">
                    <button onClick={() => setSelectedModule('unified')} className="p-1 rounded-lg hover:bg-primary/10 text-primary transition-all flex items-center justify-center border border-primary/20 bg-primary/5">
                        <ChevronLeft size={20} strokeWidth={2.5} />
                    </button>
                    <div className="h-6 w-1 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
                    <div>
                        <h2 className="text-[14px] font-black uppercase tracking-[0.2em] text-foreground/90">Link Analytics</h2>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider opacity-60 flex items-center gap-2">
                            Connectivity Status • Latency Telemetry • Network Health
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 flex flex-col justify-between min-h-[110px] shadow-sm relative overflow-hidden group hover:bg-blue-500/10 transition-all border-l-4 border-l-blue-500">
                    <div className="flex items-start justify-between">
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Total Links</p>
                        <Link2 size={16} className="text-blue-500 opacity-40" />
                    </div>
                    <p className="text-3xl font-black">{stats.total}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[9px] font-bold text-blue-500 uppercase">Monitored Paths</span>
                    </div>
                </div>

                <div className={cn(
                    "rounded-2xl border p-4 flex flex-col justify-between min-h-[110px] shadow-sm cursor-pointer transition-all hover:scale-[1.02] active:scale-95 group border-l-4",
                    filter === 'UP' ? "bg-emerald-500/10 border-emerald-500 shadow-lg" : "bg-emerald-500/5 border-emerald-500/20"
                )} onClick={() => setFilter('UP')}>
                    <div className="flex items-start justify-between">
                        <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest mb-1">Active State</p>
                        <ShieldCheck size={16} className="text-emerald-500 opacity-40 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-3xl font-black text-emerald-600">{stats.up}</p>
                    <div className="flex items-center gap-1 text-[9px] text-emerald-700 font-bold mt-1 uppercase tracking-tighter">
                        <CheckCircle2 size={10} /> {Math.round((stats.up / stats.total) * 100)}% Connectivity
                    </div>
                </div>

                <div className={cn(
                    "rounded-2xl border p-4 flex flex-col justify-between min-h-[110px] shadow-sm cursor-pointer transition-all hover:scale-[1.02] active:scale-95 group border-l-4",
                    filter === 'DOWN' ? "bg-rose-500/10 border-rose-500 shadow-lg" : "bg-rose-500/5 border-rose-500/20"
                )} onClick={() => setFilter('DOWN')}>
                    <div className="flex items-start justify-between">
                        <p className="text-[10px] font-black uppercase text-rose-600 tracking-widest mb-1">Link Outage</p>
                        <AlertTriangle size={16} className="text-rose-500 opacity-40 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-3xl font-black text-rose-600">{stats.down}</p>
                    <div className="flex items-center gap-1 text-[9px] text-rose-700 font-bold mt-1 uppercase tracking-tighter">
                        <XCircle size={10} /> {stats.down} Total Breaks
                    </div>
                </div>

                <div className={cn(
                    "rounded-2xl border p-4 flex flex-col justify-between min-h-[110px] shadow-sm cursor-pointer transition-all hover:scale-[1.02] active:scale-95 group border-l-4",
                    filter === 'Latent' ? "bg-amber-500/10 border-amber-500 shadow-lg" : "bg-amber-500/5 border-amber-500/20"
                )} onClick={() => setFilter('Latent')}>
                    <div className="flex items-start justify-between">
                        <p className="text-[10px] font-black uppercase text-amber-600 tracking-widest mb-1">High Latency</p>
                        <TrendingDown size={16} className="text-amber-500 opacity-40 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-3xl font-black text-amber-600">{stats.highLatency}</p>
                    <div className="flex items-center gap-1 text-[9px] text-amber-700 font-bold mt-1 uppercase tracking-tighter">
                        <Activity size={10} /> &gt;40ms Delay
                    </div>
                </div>
            </div>

            {/* Issues Breakdown Section */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <LayoutGrid size={18} className="text-blue-500" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Link Down Issues Breakdown</h3>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider opacity-60">
                        Click cards to filter detailed inventory
                    </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                    {[
                        { label: 'Reachability Issue', desc: '(Ping/SNMP failure)', color: 'rose', issue: 'Reachability Issue' },
                        { label: 'Device Unreachable', desc: '(CPE/router down, power...)', color: 'orange', issue: 'Device Unreachable' },
                        { label: 'Interface Operational Down', desc: '(Port down, admin down...)', color: 'amber', issue: 'Interface Operational Down' },
                        { label: 'Routing / Failure', desc: '(BGP peer down...)', color: 'blue', issue: 'Routing / Protocol Failure' },
                        { label: 'Provider Unreachable', desc: '(Provider PE / gateway...)', color: 'purple', issue: 'Provider End Unreachable' },
                        { label: 'Physical failure', desc: '(Fiber cut, provider outage...)', color: 'pink', issue: 'Physical / Last-Mile Failure' }
                    ].map((item) => {
                        const issueData = LINK_DATA.filter(l => l.issue === item.issue);
                        const count = issueData.length;
                        return (
                            <div
                                key={item.label}
                                onClick={() => setFilter(filter === item.issue ? 'All' : item.issue)}
                                className={cn(
                                    "flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer hover:shadow-md relative group/card",
                                    filter === item.issue ? `bg-${item.color}-500/10 border-${item.color}-500 shadow-sm` : `bg-${item.color}-500/5 border-${item.color}-500/20`
                                )}
                            >
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        exportToCSV(issueData, `Link_${item.label.replace(/\s+/g, '_')}_Issues`);
                                    }}
                                    className="absolute top-1.5 right-1.5 p-1 rounded-md hover:bg-foreground/10 opacity-0 group-hover/card:opacity-100 transition-opacity"
                                    title="Export these issues"
                                >
                                    <Download size={10} className={cn(`text-${item.color}-600`)} />
                                </button>
                                <span className={cn("text-2xl font-black mb-1", `text-${item.color}-600`)}>{count}</span>
                                <span className={cn("text-[8px] font-black uppercase tracking-tight text-center leading-tight", `text-${item.color}-700`)}>{item.label}</span>
                                <span className="text-[7px] text-muted-foreground font-medium text-center opacity-70 mt-1">{item.desc}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col relative group overflow-hidden">
                    <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-500/5 blur-[80px] group-hover:bg-blue-500/10 transition-colors" />

                    <div className="flex items-center justify-between mb-6 relative z-10">
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <AlertTriangle size={16} className="text-rose-500 animate-pulse" />
                            Link Failure Breakdown
                        </h3>
                    </div>

                    <div className="h-[340px] w-full relative">
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 -translate-y-6">
                            <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] leading-none mb-1">Total</span>
                            <span className="text-4xl font-black text-foreground tabular-nums drop-shadow-sm">{stats.down}</span>
                            <span className="text-[10px] font-black text-rose-500/80 uppercase tracking-widest mt-1">Breaks</span>
                        </div>

                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={issueData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {issueData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend
                                    verticalAlign="bottom"
                                    height={80}
                                    content={({ payload }) => (
                                        <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 mt-2">
                                            {payload?.map((entry: any, index: number) => (
                                                <div key={index} className="flex items-center gap-1.5 bg-muted/20 px-2 py-1 rounded-md border border-border/40">
                                                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                                    <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">
                                                        {entry.value}
                                                    </span>
                                                    <span className="text-[10px] font-black text-foreground tabular-nums ml-1 border-l border-border/30 pl-1.5 opacity-80">
                                                        {issueData[index]?.value}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col lg:col-span-1">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Network size={16} className="text-blue-500" />
                            Regional Link Distribution
                        </h3>
                    </div>
                    <div className="h-[300px] mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={regionData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                <XAxis dataKey="name" tick={{ fontSize: 10, fontStyle: 'italic' }} />
                                <YAxis hide />
                                <Tooltip cursor={{ fill: 'hsl(var(--primary)/0.05)' }} />
                                <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                                    {regionData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                    ))}
                                    <LabelList dataKey="value" position="top" style={{ fontSize: '11px', fontWeight: 'black' }} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-6">SLA Compliance Tracking</h3>
                        <div className="space-y-6">
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase">
                                    <span>Average Latency</span>
                                    <span className="text-blue-500">22.4 ms</span>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full">
                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '45%' }}></div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase">
                                    <span>Jitter Stability</span>
                                    <span className="text-emerald-500">Excellent</span>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '88%' }}></div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase">
                                    <span>Packet Delivery</span>
                                    <span className="text-emerald-500">99.98%</span>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full">
                                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '99%' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><MousePointer2 size={16} /></div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Click on links below to view hop-by-hop trace data.</p>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden border-t-4 border-t-blue-600">
                <div className="p-5 border-b border-border/50 flex items-center justify-between bg-muted/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 text-white rounded-lg"><Link2 size={16} /></div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Link Diagnostic Inventory</h3>
                    </div>
                    <button
                        onClick={() => exportToCSV(LINK_DATA, 'Link_Inventory_Export')}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/10 text-blue-600 border border-blue-600/20 rounded-lg hover:bg-blue-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-wider"
                    >
                        <Download size={14} />
                        Export CSV
                    </button>
                </div>
                <div className="max-h-[500px] overflow-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="text-[10px] uppercase font-black text-muted-foreground bg-muted/30 sticky top-0 z-10">
                            <tr>
                                <th className="p-4 border-b">Link Identifier</th>
                                <th className="p-4 border-b text-center">Type</th>
                                <th className="p-4 border-b text-center">Status</th>
                                <th className="p-4 border-b text-center">Latency / Jitter</th>
                                <th className="p-4 border-b text-right">Diagnostic Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-[12px] font-bold divide-y divide-border/20">
                            {filteredData.map((row, i) => (
                                <tr key={i} className="hover:bg-primary/5 transition-colors">
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-black text-blue-600 font-display">{row.name}</span>
                                            <span className="text-[9px] text-muted-foreground font-mono">{row.id}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center"><span className="px-2 py-0.5 bg-muted rounded text-[10px] uppercase">{row.type}</span></td>
                                    <td className="p-4 text-center">
                                        <span className={cn("px-2 py-0.5 rounded-full text-[9px] uppercase font-black", row.status === 'UP' ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600")}>
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex flex-col items-center gap-0.5">
                                            <span className="text-[10px] tabular-nums">{row.latency} ms <span className="text-[8px] opacity-40">delay</span></span>
                                            <span className="text-[10px] tabular-nums text-muted-foreground">{row.jitter} ms <span className="text-[8px] opacity-40">jit</span></span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        {row.status === 'DOWN' ? (
                                            <span className="text-rose-600 text-[10px] uppercase">{row.issue}</span>
                                        ) : (
                                            <span className="text-emerald-600/40 text-[10px] uppercase">Operational</span>
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
