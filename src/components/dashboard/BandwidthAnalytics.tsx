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

export function BandwidthAnalytics() {
    const { setSelectedModule, links } = useInventoryStore();
    const [filter, setFilter] = useState('All');

    // --- CONSISTENT DATA LOGIC (Matching Unified Dashboard) ---
    const BANDWIDTH_DATA = useMemo(() => {
        // Use 85% subset as defined in Unified Dashboard
        const bwSubset = links.filter((_, i) => (i % 100) < 85);
        const regions = ['North', 'South', 'East', 'West'];
        const issues = ['SNMP Fail', 'Ping Fail', 'Auth Error', 'Timeout', 'MIB Limit'];

        // If no links in store, fallback to mock but stay consistent with counts
        const baseData = bwSubset.length > 0 ? bwSubset : Array.from({ length: 94 }).map((_, i) => ({
            id: `LNK-${1000 + i}`,
            deviceName: `Edge-Router-${1000 + i}`,
            region: regions[i % 4],
            snmpStatus: i < 56 ? 'UP' : 'DOWN', // 56 UP, 38 DOWN (Total 94) to match image
            linkStatus: 'UP'
        }));

        return baseData.map((d: any, i) => {
            const isPolled = d.snmpStatus === 'UP';
            const util = isPolled ? Math.floor(Math.random() * 100) : 0;
            const issue = isPolled ? 'None' : issues[i % issues.length];

            return {
                id: d.id || `LNK-${1000 + i}`,
                name: d.deviceName || d.name || `Link-${1000 + i}`,
                region: d.region || regions[i % 4],
                capacity: 10000,
                currentBw: isPolled ? Math.floor(util * 100) : 0,
                utilization: util,
                status: isPolled ? 'Polled' : 'Not Polled',
                issue
            };
        });
    }, [links]);

    const stats = useMemo(() => {
        const total = BANDWIDTH_DATA.length;
        const polled = BANDWIDTH_DATA.filter(d => d.status === 'Polled').length;
        const notPolled = total - polled;
        const highUtil = BANDWIDTH_DATA.filter(d => d.utilization > 80).length;
        const healthy = BANDWIDTH_DATA.filter(d => d.utilization <= 70 && d.status === 'Polled').length;

        return { total, polled, notPolled, highUtil, healthy };
    }, [BANDWIDTH_DATA]);

    const issueData = useMemo(() => {
        const counts: Record<string, number> = {};
        BANDWIDTH_DATA.filter(d => d.status === 'Not Polled').forEach(d => {
            counts[d.issue] = (counts[d.issue] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    }, [BANDWIDTH_DATA]);

    const filteredData = useMemo(() => {
        if (filter === 'All') return BANDWIDTH_DATA;
        if (filter === 'Polled') return BANDWIDTH_DATA.filter(d => d.status === 'Polled');
        if (filter === 'Not Polled') return BANDWIDTH_DATA.filter(d => d.status === 'Not Polled');
        if (filter === 'High Util') return BANDWIDTH_DATA.filter(d => d.utilization > 80);
        return BANDWIDTH_DATA;
    }, [filter, BANDWIDTH_DATA]);

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
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-5"><Activity size={40} /></div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Total WAN Links</p>
                        <p className="text-3xl font-black">{stats.total}</p>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-xl text-primary font-black uppercase tracking-tighter text-[10px]">Backbone</div>
                </div>

                <div className={cn("rounded-xl border border-border bg-card p-4 flex items-center justify-between shadow-sm cursor-pointer transition-all hover:scale-[1.02] active:scale-95 group", filter === 'Polled' && "ring-2 ring-emerald-500/50 border-emerald-500/30 shadow-lg")} onClick={() => setFilter('Polled')}>
                    <div>
                        <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest mb-1 italic">Polling Health</p>
                        <p className="text-3xl font-black text-emerald-600">{stats.polled}</p>
                        <div className="flex items-center gap-1 text-[9px] text-emerald-700 font-bold mt-1 uppercase tracking-tighter"><CheckCircle2 size={10} /> Up & Collecting</div>
                    </div>
                    <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors"><ShieldCheck size={24} /></div>
                </div>

                <div className={cn("rounded-xl border border-border bg-card p-4 flex items-center justify-between shadow-sm cursor-pointer transition-all hover:scale-[1.02] active:scale-95 group", filter === 'Not Polled' && "ring-2 ring-red-500/50 border-red-500/30 shadow-lg")} onClick={() => setFilter('Not Polled')}>
                    <div>
                        <p className="text-[10px] font-black uppercase text-destructive tracking-widest mb-1 italic">Silent Links</p>
                        <p className="text-3xl font-black text-destructive">{stats.notPolled}</p>
                        <div className="flex items-center gap-1 text-[9px] text-destructive font-bold mt-1 uppercase tracking-tighter"><XCircle size={10} /> Data Collection Fail</div>
                    </div>
                    <div className="p-3 bg-red-500/10 rounded-xl text-destructive group-hover:bg-red-500 group-hover:text-white transition-colors"><AlertTriangle size={24} /></div>
                </div>

                <div className={cn("rounded-xl border border-border bg-card p-4 flex items-center justify-between shadow-sm cursor-pointer transition-all hover:scale-[1.02] active:scale-95 group", filter === 'High Util' && "ring-2 ring-amber-500/50 border-amber-500/30 shadow-lg")} onClick={() => setFilter('High Util')}>
                    <div>
                        <p className="text-[10px] font-black uppercase text-amber-600 tracking-widest mb-1 italic">Congestion Risk</p>
                        <p className="text-3xl font-black text-amber-600">{stats.highUtil}</p>
                        <div className="flex items-center gap-1 text-[9px] text-amber-700 font-bold mt-1 uppercase tracking-tighter"><TrendingUp size={10} /> &gt;80% Utilization</div>
                    </div>
                    <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors"><Activity size={24} /></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Visual Insights Section */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <BarChart3 size={16} className="text-primary" />
                            Data Polling Diagnostic Breakdown
                        </h3>
                        <button onClick={() => exportToCSV(issueData, 'Polling_Diagnostics')} className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-all bg-muted/30 border border-border/50"><Download size={14} /></button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mb-6 leading-relaxed bg-muted/20 p-2 rounded-lg border-l-2 border-primary uppercase font-bold tracking-tight">
                        Diagnostics of why links are returning zero data. <strong>SNMP Timeout</strong> is often caused by firewall drops or incorrect community strings.
                    </p>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={issueData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10, fontWeight: 800 }} />
                                <Tooltip cursor={{ fill: 'hsl(var(--primary)/0.05)' }} contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid hsl(var(--border))' }} />
                                <Bar
                                    dataKey="value"
                                    fill="hsl(var(--primary))"
                                    barSize={22}
                                    radius={[0, 6, 6, 0]}
                                    cursor="pointer"
                                    onClick={(data) => exportToCSV(BANDWIDTH_DATA.filter(d => d.issue === data.name), `Bandwidth_Issue_${data.name}`)}
                                >
                                    <LabelList dataKey="value" position="right" style={{ fontSize: '11px', fontWeight: 'black' }} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Executive Summary Section */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <ShieldCheck size={16} className="text-emerald-500" />
                                Optimization Summary
                            </h3>
                            <button onClick={() => exportToCSV(BANDWIDTH_DATA, 'Bandwidth_Executive_Full')} className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-all bg-muted/30 border border-border/50"><Download size={14} /></button>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] font-black uppercase text-emerald-600">Capacity Surplus</span>
                                    <span className="text-xs font-black text-emerald-600">{stats.healthy} Links</span>
                                </div>
                                <div className="w-full h-1.5 bg-emerald-500/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500" style={{ width: `${(stats.healthy / stats.total) * 100}%` }}></div>
                                </div>
                                <p className="text-[9px] text-muted-foreground mt-2 uppercase font-bold italic opacity-70">Infrastructure operating within nominal parameters.</p>
                            </div>

                            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] font-black uppercase text-amber-600">Upgrade Required</span>
                                    <span className="text-xs font-black text-amber-600">{stats.highUtil} Links</span>
                                </div>
                                <div className="w-full h-1.5 bg-amber-500/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-500" style={{ width: `${(stats.highUtil / stats.total) * 100}%` }}></div>
                                </div>
                                <p className="text-[9px] text-muted-foreground mt-2 uppercase font-bold italic opacity-70">Critical congestion suspected; localized latency likely.</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary"><MousePointer2 size={16} /></div>
                        <p className="text-[10px] font-bold text-muted-foreground leading-tight uppercase tracking-tight">
                            Click on any <span className="text-primary font-black underline">Chart Segment</span> or <span className="text-primary font-black underline">Row</span> to export target link profiles for NOC deeper scan.
                        </p>
                    </div>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden border-t-4 border-t-blue-600">
                <div className="p-5 border-b border-border/50 flex items-center justify-between bg-muted/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 text-white rounded-lg shadow-lg shadow-blue-600/20"><TrendingUp size={16} /></div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Bandwidth Diagnostic Inventory</h3>
                            <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{filteredData.length} Inventory Entries</span>
                        </div>
                    </div>
                    <button onClick={() => exportToCSV(filteredData, 'Bandwidth_Detailed_Inventory')} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
                        <Download size={16} /> Download CSV Dataset
                    </button>
                </div>
                <div className="max-h-[500px] overflow-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="text-[10px] uppercase font-black text-muted-foreground bg-muted/30 sticky top-0 z-10 backdrop-blur-md">
                            <tr>
                                <th className="p-4 border-b border-border/50">Interface ID</th>
                                <th className="p-4 border-b border-border/50 text-center">Geography</th>
                                <th className="p-4 border-b border-border/50 text-center">Util %</th>
                                <th className="p-4 border-b border-border/50 text-center">Polling Status</th>
                                <th className="p-4 border-b border-border/50 text-right">Operational Insight</th>
                            </tr>
                        </thead>
                        <tbody className="text-[12px] font-bold divide-y divide-border/20">
                            {filteredData.map((row, i) => (
                                <tr key={i} className="hover:bg-primary/5 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-black text-primary group-hover:underline cursor-pointer">{row.name}</span>
                                            <span className="text-[9px] text-muted-foreground font-mono italic">{row.id}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center"><span className="px-2 py-1 bg-muted rounded text-[10px] uppercase">{row.region}</span></td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                                <div className={cn("h-full", row.utilization > 85 ? "bg-red-500" : row.utilization > 60 ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${row.utilization}%` }}></div>
                                            </div>
                                            <span className="tabular-nums font-black w-8 text-[10px]">{row.utilization}%</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={cn("px-2 py-0.5 rounded-full text-[9px] uppercase font-black italic", row.status === 'Polled' ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-red-500/10 text-red-600 border border-red-500/20")}>
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        {row.issue !== 'None' ? (
                                            <div className="flex flex-col items-end">
                                                <span className="text-destructive font-black text-[10px] uppercase italic tracking-tighter">{row.issue} DETECTED</span>
                                                <span className="text-[8px] text-muted-foreground opacity-70">Action: Verify SNMP Config</span>
                                            </div>
                                        ) : row.utilization > 80 ? (
                                            <div className="flex flex-col items-end">
                                                <span className="text-amber-600 text-[10px] uppercase font-black">Capacity Warning</span>
                                                <span className="text-[8px] text-muted-foreground opacity-70">Action: Load Balancing Required</span>
                                            </div>
                                        ) : (
                                            <span className="text-emerald-600 text-[10px] opacity-40 uppercase tracking-widest font-black italic">Operational Nominal</span>
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
