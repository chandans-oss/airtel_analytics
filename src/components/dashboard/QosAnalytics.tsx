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
    Network
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
    CartesianGrid, LabelList
} from 'recharts';
import { exportToCSV } from '@/utils/exportUtils';

export function QosAnalytics() {
    const { setSelectedModule, links } = useInventoryStore();
    const [filter, setFilter] = useState('All');

    // --- CONSISTENT DATA LOGIC (Matching Unified Dashboard) ---
    const QOS_DATA = useMemo(() => {
        // Use 65% subset as defined in Unified Dashboard for QoS enabled links
        const qosSubset = links.filter((_, i) => (i % 100) < 65);
        const regions = ['North', 'South', 'East', 'West'];
        const issues = ['None', 'SNMP MIB Limit', 'Auth Failure', 'CLI Error', 'Policy Skip', 'Discovery Fail'];
        const classes = ['Voice', 'Video', 'Signaling', 'BestEffort', 'MissionCritical'];

        // Fallback to match image (Image 2 shows 74 total)
        const baseData = qosSubset.length > 0 ? qosSubset : Array.from({ length: 74 }).map((_, i) => ({
            id: `LNK-${3000 + i}`,
            deviceName: `Distribution-Switch-${3000 + i}`,
            region: regions[i % 4],
            // "put some up also" - make ~92% polled
            snmpStatus: (i % 12 === 0) ? 'DOWN' : 'UP',
            linkStatus: 'UP'
        }));

        return baseData.map((d: any, i) => {
            // "put some up also" - if data is entirely down, force some healthy state
            const isPolled = d.snmpStatus === 'UP' || (i % 10 !== 0);
            const drops = isPolled ? (Math.random() > 0.85 ? Math.floor(Math.random() * 800) : 0) : 0;
            const issue = isPolled ? (drops > 100 ? 'High Drop Rate' : 'None') : issues[Math.floor(Math.random() * (issues.length - 1)) + 1];

            return {
                id: d.id || `LNK-${3000 + i}`,
                name: d.deviceName || d.name || `Interface-${3000 + i}`,
                region: d.region || regions[i % 4],
                policyClass: classes[i % classes.length],
                drops,
                status: isPolled ? 'Polled' : 'Not Polled',
                issue
            };
        });
    }, [links]);

    const stats = useMemo(() => {
        const total = QOS_DATA.length;
        const polled = QOS_DATA.filter(d => d.status === 'Polled').length;
        const notPolled = total - polled;
        const highDrops = QOS_DATA.filter(d => d.drops > 50).length;

        return { total, polled, notPolled, highDrops };
    }, [QOS_DATA]);

    const issueData = useMemo(() => {
        const counts: Record<string, number> = {};
        QOS_DATA.filter(d => d.issue !== 'None').forEach(d => {
            counts[d.issue] = (counts[d.issue] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    }, [QOS_DATA]);

    const dropDistribution = useMemo(() => {
        const counts: Record<string, number> = {};
        QOS_DATA.filter(d => d.status === 'Polled').forEach(d => {
            counts[d.policyClass] = (counts[d.policyClass] || 0) + d.drops;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    }, [QOS_DATA]);

    const filteredData = useMemo(() => {
        if (filter === 'All') return QOS_DATA;
        if (filter === 'Polled') return QOS_DATA.filter(d => d.status === 'Polled');
        if (filter === 'Not Polled') return QOS_DATA.filter(d => d.status === 'Not Polled');
        if (filter === 'Packet Drops') return QOS_DATA.filter(d => d.drops > 0);
        return QOS_DATA;
    }, [filter, QOS_DATA]);

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
                        <h2 className="text-[14px] font-black uppercase tracking-[0.2em] text-foreground/90">QoS Compliance & Drops Portal</h2>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider opacity-60">Traffic Prioritization • Queue Diagnostics • Policy Enforcement</p>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-5"><Settings size={40} /></div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Total QoS Policies</p>
                        <p className="text-3xl font-black">{stats.total}</p>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-xl text-primary"><Settings size={24} /></div>
                </div>

                <div className={cn("rounded-xl border border-border bg-card p-4 flex items-center justify-between shadow-sm cursor-pointer transition-all hover:scale-[1.02] active:scale-95 group", filter === 'Polled' && "ring-2 ring-emerald-500/50 border-emerald-500/30 shadow-lg")} onClick={() => setFilter('Polled')}>
                    <div>
                        <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest mb-1 italic">Policy Health</p>
                        <p className="text-3xl font-black text-emerald-600">{stats.polled}</p>
                        <div className="flex items-center gap-1 text-[9px] text-emerald-700 font-bold mt-1 uppercase tracking-tighter"><CheckCircle2 size={10} /> Sync Confirmed</div>
                    </div>
                    <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors"><ShieldAlert size={24} /></div>
                </div>

                <div className={cn("rounded-xl border border-border bg-card p-4 flex items-center justify-between shadow-sm cursor-pointer transition-all hover:scale-[1.02] active:scale-95 group", filter === 'Not Polled' && "ring-2 ring-red-500/50 border-red-500/30 shadow-lg")} onClick={() => setFilter('Not Polled')}>
                    <div>
                        <p className="text-[10px] font-black uppercase text-destructive tracking-widest mb-1 italic">Silent Interfaces</p>
                        <p className="text-3xl font-black text-destructive">{stats.notPolled}</p>
                        <div className="flex items-center gap-1 text-[9px] text-destructive font-bold mt-1 uppercase tracking-tighter"><XCircle size={10} /> MIB/OID Unreachable</div>
                    </div>
                    <div className="p-3 bg-red-500/10 rounded-xl text-destructive group-hover:bg-red-500 group-hover:text-white transition-colors"><AlertTriangle size={24} /></div>
                </div>

                <div className={cn("rounded-xl border border-border bg-card p-4 flex items-center justify-between shadow-sm cursor-pointer transition-all hover:scale-[1.02] active:scale-95 group", filter === 'Packet Drops' && "ring-2 ring-amber-500/50 border-amber-500/30 shadow-lg")} onClick={() => setFilter('Packet Drops')}>
                    <div>
                        <p className="text-[10px] font-black uppercase text-amber-600 tracking-widest mb-1 italic">Active Discards</p>
                        <p className="text-3xl font-black text-amber-600">{stats.highDrops}</p>
                        <div className="flex items-center gap-1 text-[9px] text-amber-700 font-bold mt-1 uppercase tracking-tighter"><ArrowUpDown size={10} /> Buffer Overflow Events</div>
                    </div>
                    <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors"><ShieldAlert size={24} /></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <AlertTriangle size={16} className="text-destructive" />
                            Policy & Config Diagnostics
                        </h3>
                        <button onClick={() => exportToCSV(issueData, 'Qos_Issues')} className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-all bg-muted/30 border border-border/50"><Download size={14} /></button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mb-6 leading-relaxed bg-muted/20 p-2 rounded-lg border-l-2 border-destructive uppercase font-bold tracking-tight">
                        Diagnostics of why QoS stats are unavailable. <strong>SNMP MIB Limit</strong> often occurs on high-density routers where the polling engine is throttled.
                    </p>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={issueData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10, fontWeight: 800 }} />
                                <Tooltip cursor={{ fill: 'hsl(var(--primary)/0.05)' }} contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid hsl(var(--border))' }} />
                                <Bar dataKey="value" barSize={22} radius={[0, 6, 6, 0]} fill="#ef4444" cursor="pointer" onClick={(data) => exportToCSV(QOS_DATA.filter(d => d.issue === data.name), `QoS_Issue_${data.name}`)}>
                                    <LabelList dataKey="value" position="right" style={{ fontSize: '11px', fontWeight: 'black', fill: 'hsl(var(--destructive))' }} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <ListFilter size={16} className="text-amber-500" />
                            Total Drop Volume by Class
                        </h3>
                        <button onClick={() => exportToCSV(dropDistribution, 'Drops_by_Class')} className="p-2 hover:bg-muted rounded-lg text-muted-foreground transition-all bg-muted/30 border border-border/50"><Download size={14} /></button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mb-6 leading-relaxed bg-muted/20 p-2 rounded-lg border-l-2 border-amber-500 uppercase font-bold tracking-tight">
                        Aggregate packet discards per traffic class. Drops in <strong>MissionCritical</strong> or <strong>Voice</strong> classes require prioritized buffer restructuring.
                    </p>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dropDistribution}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'hsl(var(--muted)/0.3)' }} contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))' }} />
                                <Bar dataKey="value" fill="#f59e0b" radius={[6, 6, 0, 0]} barSize={45} cursor="pointer" onClick={(data) => exportToCSV(QOS_DATA.filter(d => d.policyClass === data.name), `QoS_Class_${data.name}`)}>
                                    <LabelList dataKey="value" position="top" style={{ fontSize: '11px', fontWeight: 'black', fill: 'hsl(var(--amber-600))' }} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden border-t-4 border-t-amber-600">
                <div className="p-5 border-b border-border/50 flex items-center justify-between bg-muted/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-600 text-white rounded-lg shadow-lg shadow-amber-600/20"><Network size={16} /></div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Policy Compliance Drill-Down</h3>
                            <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{filteredData.length} Policy Entries</span>
                        </div>
                    </div>
                    <button onClick={() => exportToCSV(filteredData, 'QoS_Detailed_Inventory')} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-amber-700 transition-all shadow-lg shadow-amber-600/20">
                        <Download size={16} /> Download Full Dataset
                    </button>
                </div>
                <div className="max-h-[500px] overflow-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="text-[10px] uppercase font-black text-muted-foreground bg-muted/30 sticky top-0 z-10 backdrop-blur-md">
                            <tr>
                                <th className="p-4 border-b border-border/50">Interface ID</th>
                                <th className="p-4 border-b border-border/50 text-center">Geography</th>
                                <th className="p-4 border-b border-border/50 text-center">Class Mapping</th>
                                <th className="p-4 border-b border-border/50 text-center">Discard Rate</th>
                                <th className="p-4 border-b border-border/50 text-right">Operational Insight</th>
                            </tr>
                        </thead>
                        <tbody className="text-[12px] font-bold divide-y divide-border/20">
                            {filteredData.map((row, i) => (
                                <tr key={i} className="hover:bg-amber-500/5 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-black text-amber-600 group-hover:underline cursor-pointer">{row.name}</span>
                                            <span className="text-[9px] text-muted-foreground font-mono italic">{row.id}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center"><span className="px-2 py-1 bg-muted rounded text-[10px] uppercase">{row.region}</span></td>
                                    <td className="p-4 text-center">
                                        <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-lg text-[10px] uppercase font-black">{row.policyClass}</span>
                                    </td>
                                    <td className="p-4 text-center font-mono font-black italic">
                                        {row.status === 'Polled' ? <span className={cn(row.drops > 100 ? "text-red-500 underline" : row.drops > 0 ? "text-amber-600" : "text-emerald-600")}>{row.drops} pkts</span> : <span className="text-muted-foreground opacity-30">NO DATA</span>}
                                    </td>
                                    <td className="p-4 text-right">
                                        {row.issue !== 'None' ? (
                                            <div className="flex flex-col items-end">
                                                <span className="text-destructive font-black text-[10px] uppercase italic tracking-tighter">{row.issue}</span>
                                                <span className="text-[8px] text-muted-foreground opacity-70">Action: Investigate Config Sync</span>
                                            </div>
                                        ) : row.drops > 0 ? (
                                            <div className="flex flex-col items-end">
                                                <span className="text-amber-600 text-[10px] uppercase font-black">Tail Discards Active</span>
                                                <span className="text-[8px] text-muted-foreground opacity-70">Tuning: Increase Queue Depth</span>
                                            </div>
                                        ) : (
                                            <span className="text-emerald-600 text-[10px] opacity-40 uppercase tracking-widest font-black italic">In-Spec Compliance</span>
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
