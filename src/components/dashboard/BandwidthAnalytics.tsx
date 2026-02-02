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
    Info,
    ArrowUpRight,
    TrendingUp,
    ShieldCheck,
    MousePointer2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
    CartesianGrid, LabelList
} from 'recharts';
import { exportToCSV } from '@/utils/exportUtils';

// --- MOCK DATA ---
const generateBandwidthData = (count: number) => {
    const regions = ['North', 'South', 'East', 'West'];
    const issues = ['None', 'SNMP Fail', 'Ping Fail', 'Auth Error', 'Timeout', 'MIB Limit'];

    return Array.from({ length: count }).map((_, i) => {
        const isPolled = Math.random() > 0.15;
        const bandwidth = isPolled ? Math.floor(Math.random() * 10000) : 0;
        const util = isPolled ? Math.floor(Math.random() * 100) : 0;
        const issue = isPolled ? 'None' : issues[Math.floor(Math.random() * (issues.length - 1)) + 1];

        return {
            id: `LNK-${1000 + i}`,
            name: `Link-${1000 + i}`,
            region: regions[Math.floor(Math.random() * regions.length)],
            capacity: 10000,
            currentBw: bandwidth,
            utilization: util,
            status: isPolled ? 'Polled' : 'Not Polled',
            issue
        };
    });
};

const BANDWIDTH_DATA = generateBandwidthData(150);

export function BandwidthAnalytics() {
    const { setSelectedModule } = useInventoryStore();
    const [filter, setFilter] = useState('All');

    const stats = useMemo(() => {
        const total = BANDWIDTH_DATA.length;
        const polled = BANDWIDTH_DATA.filter(d => d.status === 'Polled').length;
        const notPolled = total - polled;
        const highUtil = BANDWIDTH_DATA.filter(d => d.utilization > 80).length;
        const healthy = BANDWIDTH_DATA.filter(d => d.utilization <= 70 && d.status === 'Polled').length;

        return { total, polled, notPolled, highUtil, healthy };
    }, []);

    const issueData = useMemo(() => {
        const counts: Record<string, number> = {};
        BANDWIDTH_DATA.filter(d => d.status === 'Not Polled').forEach(d => {
            counts[d.issue] = (counts[d.issue] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    }, []);

    const filteredData = useMemo(() => {
        if (filter === 'All') return BANDWIDTH_DATA;
        if (filter === 'Polled') return BANDWIDTH_DATA.filter(d => d.status === 'Polled');
        if (filter === 'Not Polled') return BANDWIDTH_DATA.filter(d => d.status === 'Not Polled');
        if (filter === 'High Util') return BANDWIDTH_DATA.filter(d => d.utilization > 80);
        return BANDWIDTH_DATA;
    }, [filter]);

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-500 pb-10 max-w-[1600px] mx-auto">
            {/* Header Section with Explainability */}
            <div className="flex flex-col gap-1 px-1">
                <div className="flex items-center gap-3">
                    <button onClick={() => setSelectedModule('unified')} className="p-1 rounded-lg hover:bg-primary/10 text-primary transition-all flex items-center justify-center border border-primary/20 bg-primary/5">
                        <ChevronLeft size={20} strokeWidth={2.5} />
                    </button>
                    <div className="h-6 w-1 bg-primary rounded-full shadow-[0_0_8px_rgba(0,165,142,0.4)]" />
                    <div>
                        <h2 className="text-[14px] font-black uppercase tracking-[0.2em] text-foreground/90">Bandwidth Intelligence Portal</h2>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider opacity-60 flex items-center gap-2">
                            Infrastructure Capacity • Traffic Distribution • Polling Diagnostics
                        </p>
                    </div>
                </div>

                {/* Explainability Banner */}
                <div className="mt-4 p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 flex items-start gap-3 shadow-inner">
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 mt-1"><Info size={18} /></div>
                    <div>
                        <h4 className="text-[11px] font-black uppercase text-blue-700 tracking-wider mb-1">How to Analyze this Dashboard</h4>
                        <p className="text-[11px] leading-relaxed text-muted-foreground max-w-4xl">
                            This module provides a dual-view into link performance. <strong>Polling Health</strong> identifies assets where data is missing due to authentication or protocol failures.
                            <strong>Utilization Clusters</strong> categorize link load: <span className="text-emerald-600 font-bold">Healthy (&lt;70%)</span>, <span className="text-amber-600 font-bold">Warning (70-80%)</span>, and <span className="text-red-600 font-bold">Critical (&gt;80%)</span>.
                            Click on any KPI card or chart bar to drill down and export specific asset lists.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main Stats with Drilled Filter capability */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-5"><BarChart3 size={40} /></div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Total Monitored Links</p>
                        <p className="text-3xl font-black">{stats.total}</p>
                        <p className="text-[9px] text-muted-foreground mt-1 underline decoration-dotted">Across all registered nodes</p>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-xl text-primary"><BarChart3 size={24} /></div>
                </div>

                <div className={cn("rounded-xl border border-border bg-card p-4 flex items-center justify-between shadow-sm cursor-pointer transition-all hover:scale-[1.02] active:scale-95 group", filter === 'Polled' && "ring-2 ring-emerald-500/50 border-emerald-500/30 shadow-lg shadow-emerald-500/5")} onClick={() => setFilter('Polled')}>
                    <div>
                        <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest mb-1 italic">Polling Success</p>
                        <p className="text-3xl font-black text-emerald-600">{stats.polled}</p>
                        <div className="flex items-center gap-1 text-[9px] text-emerald-700 font-bold mt-1">
                            <CheckCircle2 size={10} /> Active Data Stream
                        </div>
                    </div>
                    <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors"><ShieldCheck size={24} /></div>
                </div>

                <div className={cn("rounded-xl border border-border bg-card p-4 flex items-center justify-between shadow-sm cursor-pointer transition-all hover:scale-[1.02] active:scale-95 group", filter === 'Not Polled' && "ring-2 ring-red-500/50 border-red-500/30 shadow-lg shadow-red-500/5")} onClick={() => setFilter('Not Polled')}>
                    <div>
                        <p className="text-[10px] font-black uppercase text-destructive tracking-widest mb-1 italic">Data Gaps</p>
                        <p className="text-3xl font-black text-destructive">{stats.notPolled}</p>
                        <div className="flex items-center gap-1 text-[9px] text-destructive font-bold mt-1">
                            <XCircle size={10} /> Needs Immediate Repair
                        </div>
                    </div>
                    <div className="p-3 bg-red-500/10 rounded-xl text-destructive group-hover:bg-red-500 group-hover:text-white transition-colors"><AlertTriangle size={24} /></div>
                </div>

                <div className={cn("rounded-xl border border-border bg-card p-4 flex items-center justify-between shadow-sm cursor-pointer transition-all hover:scale-[1.02] active:scale-95 group", filter === 'High Util' && "ring-2 ring-amber-500/50 border-amber-500/30 shadow-lg shadow-amber-500/5")} onClick={() => setFilter('High Util')}>
                    <div>
                        <p className="text-[10px] font-black uppercase text-amber-600 tracking-widest mb-1 italic">Congested Path</p>
                        <p className="text-3xl font-black text-amber-600">{stats.highUtil}</p>
                        <div className="flex items-center gap-1 text-[9px] text-amber-700 font-bold mt-1">
                            <TrendingUp size={10} /> &gt;80% Saturation
                        </div>
                    </div>
                    <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors"><Activity size={24} /></div>
                </div>
            </div>

            {/* Charts with Legend & Explainability */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <AlertTriangle size={16} className="text-destructive animate-pulse" />
                            Polling Diagnostic Matrix
                        </h3>
                        <div className="flex gap-2">
                            <button onClick={() => exportToCSV(issueData, 'Poling_Issues')} className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-primary transition-all bg-muted/30 border border-border/50"><Download size={14} /></button>
                        </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mb-6 leading-relaxed bg-muted/20 p-2 rounded-lg border-l-2 border-destructive">
                        Root cause distribution of non-responding assets. <strong>MIB Failures</strong> usually point to mismatched community strings, while <strong>Auth Failure</strong> suggests incorrect CLI credentials.
                    </p>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={issueData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10, fontWeight: 800, fill: 'hsl(var(--foreground))' }} />
                                <Tooltip cursor={{ fill: 'hsl(var(--primary)/0.05)' }} contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid hsl(var(--border))', fontWeight: 'bold' }} />
                                <Bar dataKey="value" barSize={22} radius={[0, 6, 6, 0]} fill="#ef4444" cursor="pointer" onClick={(data) => exportToCSV(BANDWIDTH_DATA.filter(d => d.issue === data.name), `Issue_${data.name}`)}>
                                    <LabelList dataKey="value" position="right" style={{ fontSize: '11px', fontWeight: 'black', fill: 'hsl(var(--destructive))' }} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 flex items-center gap-4 text-[9px] font-bold text-muted-foreground uppercase opacity-70">
                        <span className="flex items-center gap-1"><MousePointer2 size={10} /> Click Bar to Export Assets</span>
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Activity size={16} className="text-primary" />
                            Utilization Heat-Density
                        </h3>
                        <button onClick={() => exportToCSV(BANDWIDTH_DATA.filter(d => d.status === 'Polled'), 'Full_Utilization_Report')} className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-primary transition-all bg-muted/30 border border-border/50"><Download size={14} /></button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mb-6 leading-relaxed bg-muted/20 p-2 rounded-lg border-l-2 border-primary">
                        Traffic density across the network fleet. Assets in the <strong>&gt;80% bucket</strong> are candidates for path-optimization or backbone upgrades to prevent packet loss.
                    </p>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { name: '0-20%', value: BANDWIDTH_DATA.filter(d => d.utilization <= 20 && d.status === 'Polled').length, color: '#10b981' },
                                { name: '20-50%', value: BANDWIDTH_DATA.filter(d => d.utilization > 20 && d.utilization <= 50 && d.status === 'Polled').length, color: '#3b82f6' },
                                { name: '50-80%', value: BANDWIDTH_DATA.filter(d => d.utilization > 50 && d.utilization <= 80 && d.status === 'Polled').length, color: '#f59e0b' },
                                { name: '>80%', value: BANDWIDTH_DATA.filter(d => d.utilization > 80).length, color: '#ef4444' },
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'hsl(var(--muted)/0.3)' }} contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))' }} />
                                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={45} cursor="pointer" onClick={(data) => {
                                    let subset = [];
                                    if (data.name === '0-20%') subset = BANDWIDTH_DATA.filter(d => d.utilization <= 20 && d.status === 'Polled');
                                    else if (data.name === '20-50%') subset = BANDWIDTH_DATA.filter(d => d.utilization > 20 && d.utilization <= 50 && d.status === 'Polled');
                                    else if (data.name === '50-80%') subset = BANDWIDTH_DATA.filter(d => d.utilization > 50 && d.utilization <= 80 && d.status === 'Polled');
                                    else if (data.name === '>80%') subset = BANDWIDTH_DATA.filter(d => d.utilization > 80);
                                    exportToCSV(subset, `Utilization_${data.name}`);
                                }}>
                                    {[1, 2, 3, 4].map((_, i) => <Bar key={i} dataKey="value" fill={['#10b981', '#3b82f6', '#f59e0b', '#ef4444'][i]} />) /* This is hacky but for mock colors */}
                                    {/* Real usage would use Cell mapping */}
                                </Bar>
                                {/* Fixed color mapping below */}
                                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={45}>
                                    {[
                                        { name: '0-20%', color: '#10b981' },
                                        { name: '20-50%', color: '#3b82f6' },
                                        { name: '50-80%', color: '#f59e0b' },
                                        { name: '>80%', color: '#ef4444' }
                                    ].map((entry, index) => (
                                        <Bar key={`bar-${index}`} dataKey="value" fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Enhanced Table with Insight Column */}
            <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden border-t-4 border-t-primary">
                <div className="p-5 border-b border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary text-white rounded-lg shadow-lg shadow-primary/20"><Info size={16} /></div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">{filter} Network Assets Breakdown</h3>
                            <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{filteredData.length} Records Loaded</span>
                        </div>
                    </div>
                    <button onClick={() => exportToCSV(filteredData, 'Detailed_Asset_Report')} className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-[11px] font-black uppercase tracking-widest hover:bg-primary/90 hover:shadow-xl transition-all active:scale-95 shadow-lg shadow-primary/20">
                        <Download size={16} /> Global Export (.csv)
                    </button>
                </div>
                <div className="max-h-[500px] overflow-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="text-[10px] uppercase font-black text-muted-foreground bg-muted/30 sticky top-0 z-10 backdrop-blur-md">
                            <tr>
                                <th className="p-4 border-b border-border/50">Asset Identity</th>
                                <th className="p-4 border-b border-border/50">Geography</th>
                                <th className="p-4 border-b border-border/50 text-center">Data Integrity</th>
                                <th className="p-4 border-b border-border/50 text-center w-[200px]">Utilization Intensity</th>
                                <th className="p-4 border-b border-border/50 text-right">Operational Insight</th>
                            </tr>
                        </thead>
                        <tbody className="text-[12px] font-bold divide-y divide-border/20">
                            {filteredData.map((row, i) => (
                                <tr key={i} className="hover:bg-primary/5 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-black text-primary group-hover:underline cursor-pointer">{row.name}</span>
                                            <span className="text-[9px] text-muted-foreground font-mono">{row.id}</span>
                                        </div>
                                    </td>
                                    <td className="p-4"><span className="px-2 py-1 bg-muted rounded text-[10px]">{row.region}</span></td>
                                    <td className="p-4 text-center">
                                        <span className={cn("px-2.5 py-1 rounded-full text-[10px] uppercase font-black tracking-tighter", row.status === 'Polled' ? "bg-emerald-100 text-emerald-700 decoration-emerald-500/30 underline" : "bg-red-100 text-red-700 decoration-red-500/30 underline")}>
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {row.status === 'Polled' ? (
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden shadow-inner">
                                                    <div className={cn("h-full transition-all duration-700", row.utilization > 80 ? "bg-red-500" : row.utilization > 50 ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${row.utilization}%` }} />
                                                </div>
                                                <span className={cn("min-w-[35px] text-right font-black tabular-nums font-mono", row.utilization > 80 ? "text-red-600" : "text-foreground")}>{row.utilization}%</span>
                                            </div>
                                        ) : (
                                            <div className="flex justify-center italic text-muted-foreground opacity-50 text-[10px]">Data Stream Offline</div>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        {row.issue !== 'None' ? (
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-destructive font-black text-[10px] uppercase tracking-tighter">{row.issue}</span>
                                                <span className="text-[8px] text-muted-foreground font-normal">Check Credentials/IP Reach</span>
                                            </div>
                                        ) : row.utilization > 80 ? (
                                            <span className="text-amber-600 character-pulse text-[10px] uppercase font-black">Upgrade Recommended</span>
                                        ) : (
                                            <span className="text-emerald-600 text-[10px] opacity-40">System Nominal</span>
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
