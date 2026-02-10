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
    MousePointer2,
    LayoutGrid
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
    CartesianGrid, LabelList, PieChart, Pie, Cell, Legend
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

    const colors = ['#f43f5e', '#f97316', '#8b5cf6', '#3b82f6', '#06b6d4'];

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
                        <h2 className="text-[14px] font-black uppercase tracking-[0.2em] text-foreground/90">Bandwidth Analytics</h2>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider opacity-60 flex items-center gap-2">
                            Capacity • Traffic Distribution • Polling Diagnostics
                        </p>
                    </div>
                </div>
            </div>

            {/* KPI Cards / Diagnostic Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3 flex flex-col justify-between min-h-[85px] shadow-sm relative overflow-hidden group hover:bg-primary/10 transition-all border-l-4 border-l-primary">
                    <div className="flex items-start justify-between">
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Total WAN Links</p>
                        <Activity size={16} className="text-primary opacity-40" />
                    </div>
                    <p className="text-3xl font-black">{stats.total}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-[9px] font-bold text-primary uppercase">Monitored Backbone</span>
                    </div>
                </div>

                <div className={cn(
                    "rounded-2xl border p-3 flex flex-col justify-between min-h-[85px] shadow-sm cursor-pointer transition-all hover:scale-[1.02] active:scale-95 group border-l-4",
                    filter === 'Polled' ? "bg-emerald-500/10 border-emerald-500 shadow-lg" : "bg-emerald-500/5 border-emerald-500/20"
                )} onClick={() => setFilter('Polled')}>
                    <div className="flex items-start justify-between">
                        <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest mb-1">Polling Health</p>
                        <ShieldCheck size={16} className="text-emerald-500 opacity-40 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-3xl font-black text-emerald-600">{stats.polled}</p>
                    <div className="flex items-center gap-1 text-[9px] text-emerald-700 font-bold mt-1 uppercase tracking-tighter">
                        <CheckCircle2 size={10} /> {Math.round((stats.polled / stats.total) * 100)}% Success Rate
                    </div>
                </div>

                <div className={cn(
                    "rounded-2xl border p-3 flex flex-col justify-between min-h-[85px] shadow-sm cursor-pointer transition-all hover:scale-[1.02] active:scale-95 group border-l-4",
                    filter === 'Not Polled' ? "bg-rose-500/10 border-rose-500 shadow-lg" : "bg-rose-500/5 border-rose-500/20"
                )} onClick={() => setFilter('Not Polled')}>
                    <div className="flex items-start justify-between">
                        <p className="text-[10px] font-black uppercase text-rose-600 tracking-widest mb-1">Silent Links</p>
                        <AlertTriangle size={16} className="text-rose-500 opacity-40 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-3xl font-black text-rose-600">{stats.notPolled}</p>
                    <div className="flex items-center gap-1 text-[9px] text-rose-700 font-bold mt-1 uppercase tracking-tighter">
                        <XCircle size={10} /> {Math.round((stats.notPolled / stats.total) * 100)}% Failure Rate
                    </div>
                </div>

                <div className={cn(
                    "rounded-2xl border p-3 flex flex-col justify-between min-h-[85px] shadow-sm cursor-pointer transition-all hover:scale-[1.02] active:scale-95 group border-l-4",
                    filter === 'High Util' ? "bg-amber-500/10 border-amber-500 shadow-lg" : "bg-amber-500/5 border-amber-500/20"
                )} onClick={() => setFilter('High Util')}>
                    <div className="flex items-start justify-between">
                        <p className="text-[10px] font-black uppercase text-amber-600 tracking-widest mb-1">Congestion Risk</p>
                        <TrendingUp size={16} className="text-amber-500 opacity-40 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-3xl font-black text-amber-600">{stats.highUtil}</p>
                    <div className="flex items-center gap-1 text-[9px] text-amber-700 font-bold mt-1 uppercase tracking-tighter">
                        <Activity size={10} /> &gt;80% Utilization
                    </div>
                </div>
            </div>

            {/* Issues Breakdown Section */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <LayoutGrid size={18} className="text-primary" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Bandwidth Performance Issues</h3>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider opacity-60">
                        Diagnostics for Link Capacity & Traffic Health
                    </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[
                        { label: 'Critical Congestion', desc: '(Utilization > 90%)', color: 'rose', type: 'High Util' },
                        { label: 'Polling Health', desc: '(SNMP/ICMP Failure)', color: 'orange', type: 'Not Polled' },
                        { label: 'Latency Breach', desc: '(Delay > 100ms)', color: 'amber', type: 'Latency' },
                        { label: 'Silent Link', desc: '(No traffic detected)', color: 'blue', type: 'Silent' },
                        { label: 'MIB Timeout', desc: '(Diagnostic failure)', color: 'purple', type: 'MIB' }
                    ].map((item) => {
                        let exportData = [];
                        if (item.type === 'High Util') exportData = BANDWIDTH_DATA.filter(d => d.utilization > 90);
                        else if (item.type === 'Not Polled') exportData = BANDWIDTH_DATA.filter(d => d.status === 'Not Polled');
                        else exportData = BANDWIDTH_DATA.slice(0, Math.floor(Math.random() * 10) + 1); // Sample for simulated categories

                        const count = item.type === 'High Util' || item.type === 'Not Polled' ? exportData.length : Math.floor(Math.random() * 10);

                        return (
                            <div
                                key={item.label}
                                className={cn(
                                    "flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer hover:shadow-md relative group/card min-h-[90px]",
                                    `bg-${item.color}-500/5 border-${item.color}-500/20`
                                )}
                                onClick={() => {
                                    if (item.type === 'High Util') setFilter('High Util');
                                    else if (item.type === 'Not Polled') setFilter('Not Polled');
                                }}
                            >
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        exportToCSV(exportData, `Bandwidth_${item.label.replace(/\s+/g, '_')}_Issues`);
                                    }}
                                    className="absolute top-2 right-2 p-1.5 rounded-md hover:bg-foreground/10 opacity-0 group-hover/card:opacity-100 transition-opacity"
                                    title="Export these issues"
                                >
                                    <Download size={12} className={cn(`text-${item.color}-600`)} />
                                </button>
                                <span className={cn("text-xl font-black", `text-${item.color}-600`)}>{count}</span>
                                <span className={cn("text-[10px] font-black uppercase tracking-tight text-center", `text-${item.color}-700`)}>{item.label}</span>
                                <span className="text-[8px] text-muted-foreground font-medium text-center opacity-70 mt-0.5">{item.desc}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Visual Insights Section - Pie Chart */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col relative group overflow-hidden">
                    {/* Background Glow Effect */}
                    <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/5 blur-[80px] group-hover:bg-primary/10 transition-colors" />

                    <div className="flex items-center justify-between mb-6 relative z-10">
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Activity size={16} className="text-rose-500 animate-pulse" />
                            Issue distribution
                        </h3>
                        <button
                            onClick={() => exportToCSV(BANDWIDTH_DATA.filter(d => d.status === 'Not Polled'), 'Bandwidth_Failure_Analysis')}
                            className="p-2 hover:bg-rose-500/10 rounded-lg text-rose-500 transition-all bg-rose-500/5 border border-rose-500/20 shadow-sm"
                            title="Export Failure Data"
                        >
                            <Download size={14} />
                        </button>
                    </div>

                    <div className="h-[340px] w-full relative">
                        {/* Center Content Overlaid on Donut */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 -translate-y-6">
                            <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] leading-none mb-1">Total</span>
                            <span className="text-4xl font-black text-foreground tabular-nums drop-shadow-sm">{stats.notPolled}</span>
                            <span className="text-[10px] font-black text-rose-500/80 uppercase tracking-widest mt-1">Failures</span>
                        </div>

                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <defs>
                                    {issueData.map((_entry, index) => (
                                        <linearGradient key={`grad-${index}`} id={`colorGrad-${index}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={colors[index % colors.length]} stopOpacity={0.9} />
                                            <stop offset="95%" stopColor={colors[index % colors.length]} stopOpacity={0.6} />
                                        </linearGradient>
                                    ))}
                                </defs>
                                <Pie
                                    data={issueData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={8}
                                    dataKey="value"
                                    animationBegin={0}
                                    animationDuration={1500}
                                    stroke="none"
                                >
                                    {issueData.map((_entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={`url(#colorGrad-${index})`}
                                            className="hover:opacity-80 transition-opacity cursor-pointer outline-none"
                                            style={{
                                                filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.1))'
                                            }}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        borderRadius: '12px',
                                        border: '1px solid hsl(var(--border))',
                                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                        fontSize: '10px',
                                        fontWeight: 'bold',
                                        padding: '8px 12px'
                                    }}
                                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={80}
                                    iconType="circle"
                                    content={({ payload }) => (
                                        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-4">
                                            {payload?.map((entry: any, index: number) => (
                                                <div key={index} className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-md border border-border/50">
                                                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                                    <span className="text-[9px] font-black uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                                                        {entry.value}
                                                    </span>
                                                    <span className="text-[10px] font-black text-foreground tabular-nums ml-1 border-l border-border/50 pl-1.5 opacity-80">
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
                    <p className="text-[10px] text-center text-muted-foreground/50 mt-8 uppercase font-bold tracking-[0.1em] italic">
                        Real-time Diagnostic Breakdown
                    </p>
                </div>

                {/* Visual Insights Section - Bar Chart */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col lg:col-span-1">
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
                                    barSize={18}
                                    radius={[0, 6, 6, 0]}
                                    cursor="pointer"
                                    onClick={(data) => exportToCSV(BANDWIDTH_DATA.filter(d => d.issue === data.name), `Bandwidth_Issue_${data.name}`)}
                                >
                                    {issueData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                    ))}
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
