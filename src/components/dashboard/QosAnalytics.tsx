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
    ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
    CartesianGrid, LabelList
} from 'recharts';
import { exportToCSV } from '@/utils/exportUtils';

// --- MOCK DATA ---
const generateQosData = (count: number) => {
    const regions = ['North', 'South', 'East', 'West'];
    const issues = ['None', 'SNMP MIB Limit', 'Auth Failure', 'CLI Timeout', 'Policy Mismatch'];
    const classes = ['Voice', 'Video', 'Signaling', 'BestEffort', 'MissionCritical'];

    return Array.from({ length: count }).map((_, i) => {
        const isPolled = Math.random() > 0.15; // 85% polled
        const drops = isPolled ? (Math.random() > 0.7 ? Math.floor(Math.random() * 500) : 0) : 0;
        const issue = isPolled ? (drops > 100 ? 'High Drop Rate' : 'None') : issues[Math.floor(Math.random() * (issues.length - 1)) + 1];

        return {
            id: `LNK-${3000 + i}`,
            name: `Link-${3000 + i}`,
            region: regions[Math.floor(Math.random() * regions.length)],
            policyClass: classes[Math.floor(Math.random() * classes.length)],
            drops,
            status: isPolled ? 'Polled' : 'Not Polled',
            issue
        };
    });
};

const QOS_DATA = generateQosData(150);

export function QosAnalytics() {
    const { setSelectedModule } = useInventoryStore();
    const [filter, setFilter] = useState('All');

    const stats = useMemo(() => {
        const total = QOS_DATA.length;
        const polled = QOS_DATA.filter(d => d.status === 'Polled').length;
        const notPolled = total - polled;
        const highDrops = QOS_DATA.filter(d => d.drops > 50).length;

        return { total, polled, notPolled, highDrops };
    }, []);

    const issueData = useMemo(() => {
        const counts: Record<string, number> = {};
        QOS_DATA.filter(d => d.issue !== 'None').forEach(d => {
            counts[d.issue] = (counts[d.issue] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    }, []);

    const dropDistribution = useMemo(() => {
        const counts: Record<string, number> = {};
        QOS_DATA.filter(d => d.status === 'Polled').forEach(d => {
            counts[d.policyClass] = (counts[d.policyClass] || 0) + d.drops;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    }, []);

    const filteredData = useMemo(() => {
        if (filter === 'All') return QOS_DATA;
        if (filter === 'Polled') return QOS_DATA.filter(d => d.status === 'Polled');
        if (filter === 'Not Polled') return QOS_DATA.filter(d => d.status === 'Not Polled');
        if (filter === 'Packet Drops') return QOS_DATA.filter(d => d.drops > 0);
        return QOS_DATA;
    }, [filter]);

    const handleIssueClick = (data: any) => {
        exportToCSV(QOS_DATA.filter(d => d.issue === data.name), `QoS_Issue_${data.name}`);
    };

    const handleClassClick = (data: any) => {
        // Export links that have drops in this class
        exportToCSV(QOS_DATA.filter(d => d.policyClass === data.name && d.drops > 0), `QoS_Class_Drops_${data.name}`);
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-500 pb-10">
            <div className="flex items-center justify-between px-1 mb-4">
                <div className="flex items-center gap-3">
                    <button onClick={() => setSelectedModule('unified')} className="p-1 rounded-lg hover:bg-primary/10 text-primary transition-all flex items-center justify-center">
                        <ChevronLeft size={20} strokeWidth={2.5} />
                    </button>
                    <div className="h-5 w-1 bg-primary rounded-full shadow-[0_0_8px_rgba(0,165,142,0.4)]" />
                    <div>
                        <h2 className="text-[12px] font-black uppercase tracking-[0.15em] text-foreground/90">QoS Analytics</h2>
                        <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider opacity-60">Policy Compliance & Drops</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between shadow-sm">
                    <div><p className="text-[10px] font-bold uppercase text-muted-foreground">Total Policies</p><p className="text-2xl font-black">{stats.total}</p></div>
                    <div className="p-2 bg-primary/10 rounded-lg text-primary"><Settings size={20} /></div>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between shadow-sm cursor-pointer hover:border-emerald-500/50 transition-colors" onClick={() => setFilter('Polled')}>
                    <div><p className="text-[10px] font-bold uppercase text-muted-foreground">Polled</p><p className="text-2xl font-black text-emerald-600">{stats.polled}</p></div>
                    <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><CheckCircle2 size={20} /></div>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between shadow-sm cursor-pointer hover:border-red-500/50 transition-colors" onClick={() => setFilter('Not Polled')}>
                    <div><p className="text-[10px] font-bold uppercase text-muted-foreground">Not Polled</p><p className="text-2xl font-black text-destructive">{stats.notPolled}</p></div>
                    <div className="p-2 bg-red-500/10 rounded-lg text-destructive"><XCircle size={20} /></div>
                </div>
                <div className="rounded-xl border border-border bg-card p-4 flex items-center justify-between shadow-sm cursor-pointer hover:border-amber-500/50 transition-colors" onClick={() => setFilter('Packet Drops')}>
                    <div><p className="text-[10px] font-bold uppercase text-muted-foreground">Packet Drops</p><p className="text-2xl font-black text-amber-600">{stats.highDrops}</p></div>
                    <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500"><ShieldAlert size={20} /></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2"><AlertTriangle size={14} className="text-destructive" /> Issue Breakdown</h3>
                        <button onClick={() => exportToCSV(issueData, 'QoS_Issue_Counts')} className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-primary transition-colors bg-muted/20"><Download size={14} /></button>
                    </div>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={issueData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10, fontWeight: 700 }} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                                <Bar dataKey="value" barSize={18} radius={[0, 4, 4, 0]} fill="#ef4444" onClick={handleIssueClick} cursor="pointer">
                                    <LabelList dataKey="value" position="right" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2"><ListFilter size={14} className="text-amber-500" /> Total Drops by Class</h3>
                        <button onClick={() => exportToCSV(dropDistribution, 'QoS_Class_Drops')} className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-primary transition-colors bg-muted/20"><Download size={14} /></button>
                    </div>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={dropDistribution}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'hsl(var(--muted)/0.3)' }} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                                <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={40} onClick={handleClassClick} cursor="pointer" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/20">
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{filter} Policies</h3>
                        <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded-full">{filteredData.length} Records</span>
                    </div>
                    <button onClick={() => exportToCSV(filteredData, 'QoS_Detailed_Report')} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[10px] font-bold uppercase hover:bg-primary/90 transition-all">
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
                                <th className="p-3 text-center">Class</th>
                                <th className="p-3 text-center">Drops</th>
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
                                        <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-bold", row.status === 'Polled' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>{row.status}</span>
                                    </td>
                                    <td className="p-3 text-center">{row.policyClass}</td>
                                    <td className="p-3 text-center font-mono font-bold">
                                        {row.status === 'Polled' ? <span className={cn(row.drops > 0 ? "text-amber-600" : "text-emerald-600")}>{row.drops}</span> : <span className="text-muted-foreground">-</span>}
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
