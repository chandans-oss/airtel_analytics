import React, { useMemo, useState } from 'react';
import { useInventoryStore } from '@/store/inventoryStore';
import {
    Activity,
    BarChart3,
    Download,
    Search,
    ChevronLeft,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    ArrowUpRight,
    ArrowDownRight,
    Wifi
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
    Cell, CartesianGrid, Legend, PieChart, Pie, LabelList
} from 'recharts';
import { exportToCSV } from '@/utils/exportUtils';

// --- MOCK DATA ---
const generateBandwidthData = (count: number) => {
    const regions = ['North', 'South', 'East', 'West'];
    const issues = ['None', 'SNMP Fail', 'Ping Fail', 'Auth Error', 'Timeout'];

    return Array.from({ length: count }).map((_, i) => {
        const isPolled = Math.random() > 0.15; // 85% polled
        const bandwidth = isPolled ? Math.floor(Math.random() * 10000) : 0; // Mbps
        const util = isPolled ? Math.floor(Math.random() * 100) : 0;
        const issue = isPolled ? 'None' : issues[Math.floor(Math.random() * (issues.length - 1)) + 1];

        return {
            id: `LNK-${1000 + i}`,
            name: `Link-${1000 + i}`,
            region: regions[Math.floor(Math.random() * regions.length)],
            capacity: 10000, // 10G
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

    // Stats
    const stats = useMemo(() => {
        const total = BANDWIDTH_DATA.length;
        const polled = BANDWIDTH_DATA.filter(d => d.status === 'Polled').length;
        const notPolled = total - polled;

        const highUtil = BANDWIDTH_DATA.filter(d => d.utilization > 80).length;
        const lowUtil = BANDWIDTH_DATA.filter(d => d.utilization < 10 && d.status === 'Polled').length;

        return { total, polled, notPolled, highUtil, lowUtil };
    }, []);

    // Issue Breakdown
    const issueData = useMemo(() => {
        const counts: Record<string, number> = {};
        BANDWIDTH_DATA.filter(d => d.status === 'Not Polled').forEach(d => {
            counts[d.issue] = (counts[d.issue] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, []);

    // Filtered Data
    const filteredData = useMemo(() => {
        if (filter === 'All') return BANDWIDTH_DATA;
        if (filter === 'Polled') return BANDWIDTH_DATA.filter(d => d.status === 'Polled');
        if (filter === 'Not Polled') return BANDWIDTH_DATA.filter(d => d.status === 'Not Polled');
        if (filter === 'High Util') return BANDWIDTH_DATA.filter(d => d.utilization > 80);
        return BANDWIDTH_DATA;
    }, [filter]);

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-500 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between px-1 mb-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSelectedModule('unified')}
                        className="p-1 rounded-lg hover:bg-primary/10 text-primary transition-all flex items-center justify-center"
                        title="Back to Overview"
                    >
                        <ChevronLeft size={20} strokeWidth={2.5} />
                    </button>
                    <div className="h-5 w-1 bg-primary rounded-full shadow-[0_0_8px_rgba(0,165,142,0.4)]" />
                    <div>
                        <h2 className="text-[12px] font-black uppercase tracking-[0.15em] text-foreground/90">
                            Bandwidth Analytics
                        </h2>
                        <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider opacity-60">
                            Utilization & Polling Health
                        </p>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-[10px] font-bold uppercase text-muted-foreground">Total Links</p>
                        <p className="text-2xl font-black">{stats.total}</p>
                    </div>
                    <div className="p-2 bg-primary/10 rounded-lg text-primary"><BarChart3 size={20} /></div>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between shadow-sm cursor-pointer hover:border-emerald-500/50 transition-colors" onClick={() => setFilter('Polled')}>
                    <div>
                        <p className="text-[10px] font-bold uppercase text-muted-foreground">Successfully Polled</p>
                        <p className="text-2xl font-black text-emerald-600">{stats.polled}</p>
                    </div>
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><CheckCircle2 size={20} /></div>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between shadow-sm cursor-pointer hover:border-red-500/50 transition-colors" onClick={() => setFilter('Not Polled')}>
                    <div>
                        <p className="text-[10px] font-bold uppercase text-muted-foreground">Not Polled</p>
                        <p className="text-2xl font-black text-destructive">{stats.notPolled}</p>
                    </div>
                    <div className="p-2 bg-red-500/10 rounded-lg text-destructive"><XCircle size={20} /></div>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between shadow-sm cursor-pointer hover:border-amber-500/50 transition-colors" onClick={() => setFilter('High Util')}>
                    <div>
                        <p className="text-[10px] font-bold uppercase text-muted-foreground">High Utilization</p>
                        <p className="text-2xl font-black text-amber-600">{stats.highUtil}</p>
                    </div>
                    <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500"><Activity size={20} /></div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Issue Breakdown */}
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                            <AlertTriangle size={14} className="text-destructive" />
                            Polling Issues Breakdown
                        </h3>
                        <button onClick={() => exportToCSV(issueData, 'Bandwidth_Polling_Issues')} className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-primary transition-colors bg-muted/20"><Download size={14} /></button>
                    </div>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={issueData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10, fontWeight: 700 }} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                                <Bar
                                    dataKey="value"
                                    barSize={20}
                                    radius={[0, 4, 4, 0]}
                                    fill="#ef4444"
                                    cursor="pointer"
                                    onClick={(data) => exportToCSV(BANDWIDTH_DATA.filter(d => d.issue === data.name), `Bandwidth_Issue_${data.name}`)}
                                >
                                    <LabelList dataKey="value" position="right" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Utilization Distribution */}
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                            <Activity size={14} className="text-primary" />
                            Utilization Distribution
                        </h3>
                        <button onClick={() => exportToCSV(BANDWIDTH_DATA.filter(d => d.status === 'Polled'), 'Utilization_Data')} className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-primary transition-colors bg-muted/20"><Download size={14} /></button>
                    </div>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { name: '0-20%', value: BANDWIDTH_DATA.filter(d => d.utilization <= 20 && d.status === 'Polled').length },
                                { name: '20-50%', value: BANDWIDTH_DATA.filter(d => d.utilization > 20 && d.utilization <= 50 && d.status === 'Polled').length },
                                { name: '50-80%', value: BANDWIDTH_DATA.filter(d => d.utilization > 50 && d.utilization <= 80 && d.status === 'Polled').length },
                                { name: '>80%', value: BANDWIDTH_DATA.filter(d => d.utilization > 80).length },
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'hsl(var(--muted)/0.3)' }} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                                <Bar
                                    dataKey="value"
                                    fill="#3b82f6"
                                    radius={[4, 4, 0, 0]}
                                    barSize={40}
                                    cursor="pointer"
                                    onClick={(data) => {
                                        let subset = [];
                                        if (data.name === '0-20%') subset = BANDWIDTH_DATA.filter(d => d.utilization <= 20 && d.status === 'Polled');
                                        else if (data.name === '20-50%') subset = BANDWIDTH_DATA.filter(d => d.utilization > 20 && d.utilization <= 50 && d.status === 'Polled');
                                        else if (data.name === '50-80%') subset = BANDWIDTH_DATA.filter(d => d.utilization > 50 && d.utilization <= 80 && d.status === 'Polled');
                                        else if (data.name === '>80%') subset = BANDWIDTH_DATA.filter(d => d.utilization > 80);
                                        exportToCSV(subset, `Bandwidth_Distribution_${data.name}`);
                                    }}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Data Table */}
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/20">
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                            {filter} Links
                        </h3>
                        <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded-full">
                            {filteredData.length} Records
                        </span>
                    </div>
                    <button
                        onClick={() => exportToCSV(filteredData, 'Bandwidth_Detailed_Report')}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[10px] font-bold uppercase hover:bg-primary/90 transition-all"
                    >
                        <Download size={12} /> Export CSV
                    </button>
                </div>
                <div className="max-h-[400px] overflow-auto">
                    <table className="w-full text-left">
                        <thead className="text-[10px] uppercase text-muted-foreground bg-muted/50 sticky top-0 z-10">
                            <tr>
                                <th className="p-3">ID</th>
                                <th className="p-3">Name</th>
                                <th className="p-3">Region</th>
                                <th className="p-3 text-center">Status</th>
                                <th className="p-3 text-center">Utilization</th>
                                <th className="p-3 text-right">Issue</th>
                            </tr>
                        </thead>
                        <tbody className="text-[11px] font-medium divide-y divide-border/20">
                            {filteredData.map((row, i) => (
                                <tr key={i} className="hover:bg-muted/10">
                                    <td className="p-3 font-mono text-primary">{row.id}</td>
                                    <td className="p-3">{row.name}</td>
                                    <td className="p-3">{row.region}</td>
                                    <td className="p-3 text-center">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-full text-[9px] font-bold",
                                            row.status === 'Polled' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                        )}>
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="p-3 text-center">
                                        {row.status === 'Polled' ? (
                                            <div className="flex items-center gap-2 justify-center">
                                                <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                                    <div className={cn("h-full", row.utilization > 80 ? "bg-red-500" : "bg-blue-500")} style={{ width: `${row.utilization}%` }} />
                                                </div>
                                                <span className="w-8 text-right">{row.utilization}%</span>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </td>
                                    <td className="p-3 text-right text-muted-foreground">{row.issue}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
