import React, { useMemo, useState } from 'react';
import { useInventoryStore } from '@/store/inventoryStore';
import {
    Activity,
    Settings,
    Download,
    ChevronLeft,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    ListFilter,
    ShieldAlert,
    Info,
    MousePointer2,
    ArrowUpDown,
    Network,
    Gauge,
    Timer,
    LayoutGrid
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
    CartesianGrid, LabelList
} from 'recharts';
import { exportToCSV } from '@/utils/exportUtils';

export function JitterAnalytics() {
    const { setSelectedModule, links } = useInventoryStore();
    const [filter, setFilter] = useState('All');

    // --- CONSISTENT DATA LOGIC (Matching Unified Dashboard) ---
    const JITTER_DATA = useMemo(() => {
        // Use 45% subset as defined in Unified Dashboard for SLA links
        const jitterSubset = links.filter((_, i) => (i % 100) < 45);
        const regions = ['North', 'South', 'East', 'West'];
        const issues = ['SNMP Fail', 'Ping Fail', 'MDT Timeout', 'High Latency', 'Packet Out-order'];

        // Fallback to match image (Jitter Status: 54 Total, 46 UP, 8 NOTPOLLED)
        const baseData = jitterSubset.length > 0 ? jitterSubset : Array.from({ length: 54 }).map((_, i) => ({
            id: `LNK-${2000 + i}`,
            deviceName: `Core-MPLS-${2000 + i}`,
            region: regions[i % 4],
            snmpStatus: i < 46 ? 'UP' : 'DOWN', // 46 UP, 8 NOTPOLLED
            linkStatus: 'UP'
        }));

        return baseData.map((d: any, i) => {
            const isPolled = d.snmpStatus === 'UP';
            // Scale jitter for typical MPLS links: 1-15ms for healthy, 30-80ms for problematic
            const jitterVal = isPolled ? (Math.random() > 0.8 ? 30 + Math.floor(Math.random() * 50) : 2 + Math.floor(Math.random() * 8)) : 0;
            const issue = isPolled ? (jitterVal > 30 ? 'SLA Violation' : 'None') : issues[i % issues.length];

            return {
                id: d.id || `LNK-${2000 + i}`,
                name: d.deviceName || d.name || `Link-${2000 + i}`,
                region: d.region || regions[i % 4],
                jitter: jitterVal,
                latency: isPolled ? 20 + jitterVal * 2 : 0,
                status: isPolled ? 'Polled' : 'Not Polled',
                issue
            };
        });
    }, [links]);

    const stats = useMemo(() => {
        const total = JITTER_DATA.length;
        const polled = JITTER_DATA.filter(d => d.status === 'Polled').length;
        const notPolled = total - polled;
        const slaViolations = JITTER_DATA.filter(d => d.jitter > 30).length;
        const healthy = JITTER_DATA.filter(d => d.jitter <= 15 && d.status === 'Polled').length;

        return { total, polled, notPolled, slaViolations, healthy };
    }, [JITTER_DATA]);

    const issueData = useMemo(() => {
        const counts: Record<string, number> = {};
        JITTER_DATA.filter(d => d.issue !== 'None').forEach(d => {
            counts[d.issue] = (counts[d.issue] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    }, [JITTER_DATA]);

    const filteredData = useMemo(() => {
        if (filter === 'All') return JITTER_DATA;
        if (filter === 'Polled') return JITTER_DATA.filter(d => d.status === 'Polled');
        if (filter === 'Not Polled') return JITTER_DATA.filter(d => d.status === 'Not Polled');
        if (filter === 'SLA Violation') return JITTER_DATA.filter(d => d.jitter > 30);
        return JITTER_DATA;
    }, [filter, JITTER_DATA]);

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
                        <h2 className="text-[14px] font-black uppercase tracking-[0.2em] text-foreground/90">Jitter Analytics</h2>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider opacity-60">Variance Analysis • Latency Spikes • SLA Compliance</p>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="rounded-xl border border-border bg-card p-3 flex items-center justify-between shadow-sm relative overflow-hidden min-h-[85px]">
                    <div className="absolute top-0 right-0 p-2 opacity-5"><Activity size={40} /></div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Total Monitored Segments</p>
                        <p className="text-3xl font-black">{stats.total}</p>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-xl text-primary"><Gauge size={24} /></div>
                </div>

                <div className={cn("rounded-xl border border-border bg-card p-3 flex items-center justify-between shadow-sm cursor-pointer transition-all hover:scale-[1.02] active:scale-95 group min-h-[85px]", filter === 'Polled' && "ring-2 ring-emerald-500/50 border-emerald-500/30 shadow-lg")} onClick={() => setFilter('Polled')}>
                    <div>
                        <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest mb-1 italic">Stability Health</p>
                        <p className="text-3xl font-black text-emerald-600">{stats.polled}</p>
                        <div className="flex items-center gap-1 text-[9px] text-emerald-700 font-bold mt-1 uppercase tracking-tighter"><CheckCircle2 size={10} /> Polling Active</div>
                    </div>
                    <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors"><ShieldAlert size={24} /></div>
                </div>

                <div className={cn("rounded-xl border border-border bg-card p-3 flex items-center justify-between shadow-sm cursor-pointer transition-all hover:scale-[1.02] active:scale-95 group min-h-[85px]", filter === 'Not Polled' && "ring-2 ring-red-500/50 border-red-500/30 shadow-lg")} onClick={() => setFilter('Not Polled')}>
                    <div>
                        <p className="text-[10px] font-black uppercase text-destructive tracking-widest mb-1 italic">Polling Gaps</p>
                        <p className="text-3xl font-black text-destructive">{stats.notPolled}</p>
                        <div className="flex items-center gap-1 text-[9px] text-destructive font-bold mt-1 uppercase tracking-tighter"><XCircle size={10} /> MDT/Telemetry Fail</div>
                    </div>
                    <div className="p-3 bg-red-500/10 rounded-xl text-destructive group-hover:bg-red-500 group-hover:text-white transition-colors"><AlertTriangle size={24} /></div>
                </div>

                <div className={cn("rounded-xl border border-border bg-card p-3 flex items-center justify-between shadow-sm cursor-pointer transition-all hover:scale-[1.02] active:scale-95 group min-h-[85px]", filter === 'SLA Violation' && "ring-2 ring-amber-500/50 border-amber-500/30 shadow-lg")} onClick={() => setFilter('SLA Violation')}>
                    <div>
                        <p className="text-[10px] font-black uppercase text-amber-600 tracking-widest mb-1 italic">SLA Violations</p>
                        <p className="text-3xl font-black text-amber-600">{stats.slaViolations}</p>
                        <div className="flex items-center gap-1 text-[9px] text-amber-700 font-bold mt-1 uppercase tracking-tighter"><Timer size={10} /> High Jitter (&gt;30ms)</div>
                    </div>
                    <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors"><ShieldAlert size={24} /></div>
                </div>
            </div>

            {/* Issues Breakdown Section */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <LayoutGrid size={18} className="text-primary" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Jitter & Stability Inhibitors</h3>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider opacity-60">
                        Stability Diagnostics & Telemetry Gaps
                    </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: 'MDT Timeout', desc: '(Telemetry stream loss)', color: 'rose', issue: 'MDT Timeout' },
                        { label: 'SLA Violation', desc: '(High Jitter > 30ms)', color: 'orange', issue: 'SLA Violation' },
                        { label: 'Ping Fail', desc: '(ICMP reachability)', color: 'amber', issue: 'Ping Fail' },
                        { label: 'Packet Out-order', desc: '(Sequence mismatch)', color: 'blue', issue: 'Packet Out-order' }
                    ].map((item) => {
                        const issueData = JITTER_DATA.filter(d => d.issue === item.issue);
                        const count = issueData.length;
                        return (
                            <div
                                key={item.label}
                                className={cn(
                                    "flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer hover:shadow-md relative group/card min-h-[90px]",
                                    `bg-${item.color}-500/5 border-${item.color}-500/20`
                                )}
                                onClick={() => setFilter(item.issue)}
                            >
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        exportToCSV(issueData, `Jitter_${item.label.replace(/\s+/g, '_')}_Issues`);
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <ListFilter size={16} className="text-rose-500" />
                            Drill-down: Stability Inhibitors
                        </h3>
                        <button onClick={() => exportToCSV(issueData, 'Jitter_Diagnostics')} className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-all bg-muted/30 border border-border/50"><Download size={14} /></button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mb-6 leading-relaxed bg-muted/20 p-2 rounded-lg border-l-2 border-rose-500 uppercase font-bold tracking-tight">
                        Breakdown of jitter-inducing factors. <strong>MDT (Model Driven Telemetry)</strong> gaps represent missed data points in high-speed polling loops.
                    </p>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={issueData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10, fontWeight: 800 }} />
                                <Tooltip cursor={{ fill: 'hsl(var(--primary)/0.05)' }} contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid hsl(var(--border))' }} />
                                <Bar
                                    dataKey="value"
                                    fill="#e11d48"
                                    barSize={22}
                                    radius={[0, 6, 6, 0]}
                                    cursor="pointer"
                                    onClick={(data) => exportToCSV(JITTER_DATA.filter(d => d.issue === data.name), `Jitter_Issue_${data.name}`)}
                                >
                                    <LabelList dataKey="value" position="right" style={{ fontSize: '11px', fontWeight: 'black' }} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <ArrowUpDown size={16} className="text-primary" />
                            Jitter Variance Distribution
                        </h3>
                        <button onClick={() => exportToCSV(JITTER_DATA, 'Jitter_Full_Export')} className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-all bg-muted/30 border border-border/50"><Download size={14} /></button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mb-6 leading-relaxed bg-muted/20 p-2 rounded-lg border-l-2 border-primary uppercase font-bold tracking-tight">
                        Statistical profile of jitter across the fleet. Outliers beyond <strong>20ms</strong> typically indicate localized link flapping or queue congestion.
                    </p>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={JITTER_DATA.slice(0, 15)}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                <XAxis dataKey="id" tick={{ fontSize: 9, fontWeight: 700 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'hsl(var(--muted)/0.3)' }} contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))' }} />
                                <Bar dataKey="jitter" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} barSize={25} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 flex gap-4 text-[9px] font-black uppercase text-muted-foreground">
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> &lt;10ms (Healthy)</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> 10-30ms (Warning)</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500"></div> &gt;30ms (Critical)</span>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden border-t-4 border-t-rose-600">
                <div className="p-5 border-b border-border/50 flex items-center justify-between bg-muted/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-rose-600 text-white rounded-lg shadow-lg shadow-rose-600/20"><Network size={16} /></div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">SLA Stability Inventory</h3>
                            <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{filteredData.length} SLA Entries</span>
                        </div>
                    </div>
                    <button onClick={() => exportToCSV(filteredData, 'Jitter_Detailed_Inventory')} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/20">
                        <Download size={16} /> Download CSV Dataset
                    </button>
                </div>
                <div className="max-h-[500px] overflow-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="text-[10px] uppercase font-black text-muted-foreground bg-muted/30 sticky top-0 z-10 backdrop-blur-md">
                            <tr>
                                <th className="p-4 border-b border-border/50">Interface ID</th>
                                <th className="p-4 border-b border-border/50 text-center">Geography</th>
                                <th className="p-4 border-b border-border/50 text-center">Jitter (ms)</th>
                                <th className="p-4 border-b border-border/50 text-center">Avg Latency</th>
                                <th className="p-4 border-b border-border/50 text-right">Operational Insight</th>
                            </tr>
                        </thead>
                        <tbody className="text-[12px] font-bold divide-y divide-border/20">
                            {filteredData.map((row, i) => (
                                <tr key={i} className="hover:bg-rose-500/5 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-black text-rose-600 group-hover:underline cursor-pointer">{row.name}</span>
                                            <span className="text-[9px] text-muted-foreground font-mono italic">{row.id}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center"><span className="px-2 py-1 bg-muted rounded text-[10px] uppercase">{row.region}</span></td>
                                    <td className="p-4 text-center font-mono font-black italic">
                                        <span className={cn(row.jitter > 30 ? "text-red-600 scale-110 block" : row.jitter > 15 ? "text-amber-600" : "text-emerald-600")}>
                                            {row.jitter === 0 ? '---' : `${row.jitter}ms`}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="text-muted-foreground font-mono text-[11px]">{row.latency > 0 ? `${row.latency}ms` : '---'}</span>
                                    </td>
                                    <td className="p-4 text-right">
                                        {row.issue !== 'None' ? (
                                            <div className="flex flex-col items-end">
                                                <span className="text-destructive font-black text-[10px] uppercase italic tracking-tighter">{row.issue}</span>
                                                <span className="text-[8px] text-muted-foreground opacity-70">Action: Investigate Path Stability</span>
                                            </div>
                                        ) : row.jitter > 20 ? (
                                            <div className="flex flex-col items-end">
                                                <span className="text-amber-600 text-[10px] uppercase font-black">Variance Warning</span>
                                                <span className="text-[8px] text-muted-foreground opacity-70">Action: Audit Interface Errors</span>
                                            </div>
                                        ) : (
                                            <span className="text-emerald-600 text-[10px] opacity-40 uppercase tracking-widest font-black italic">SLA Compliant</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    );
}
