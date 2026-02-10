import React, { useMemo, useState } from 'react';
import { useInventoryStore } from '@/store/inventoryStore';
import {
    Database,
    Download,
    ChevronLeft,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Activity,
    ShieldCheck,
    MousePointer2,
    Server,
    Globe,
    Zap,
    LayoutGrid
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
    CartesianGrid, LabelList, PieChart, Pie, Cell, Legend
} from 'recharts';
import { exportToCSV } from '@/utils/exportUtils';

export function DeviceStatusAnalytics() {
    const { setSelectedModule, nodes } = useInventoryStore();
    const [filter, setFilter] = useState('All');

    const DEVICE_DATA = useMemo(() => {
        const regions = ['North', 'South', 'East', 'West', 'Central'];
        const types = ['Core Router', 'Edge Router', 'Distribution Switch', 'Access Switch', 'Firewall'];
        const failureReasons = ['Power Loss', 'Critical overheat', 'SNMP Timeout', 'Authentication Failure', 'Interface Flapping'];

        // Use actual nodes if available, otherwise generate mock
        const baseData = nodes.length > 0 ? nodes : Array.from({ length: 109 }).map((_, i) => ({
            id: `DEV-${1000 + i}`,
            deviceName: `Asset-${1000 + i}`,
            region: regions[i % regions.length],
            status: i < 87 ? 'UP' : 'DOWN',
            type: types[i % types.length]
        }));

        return baseData.map((d: any, i) => {
            const isUp = d.status === 'UP' || d.snmpStatus === 'UP';
            const cpu = isUp ? Math.floor(Math.random() * 60 + 20) : 0;
            const mem = isUp ? Math.floor(Math.random() * 50 + 30) : 0;
            const issue = isUp ? 'None' : (d.failureReason || failureReasons[i % failureReasons.length]);

            return {
                id: d.id || d.deviceId || `DEV-${1000 + i}`,
                name: d.deviceName || d.name || `Device-${1000 + i}`,
                region: d.region || regions[i % regions.length],
                type: d.deviceType || types[i % types.length],
                cpu,
                mem,
                status: isUp ? 'UP' : 'DOWN',
                issue
            };
        });
    }, [nodes]);

    const colors = ['#10b981', '#f43f5e', '#f59e0b', '#3b82f6', '#8b5cf6', '#6366f1'];

    const stats = useMemo(() => {
        const total = DEVICE_DATA.length;
        const up = DEVICE_DATA.filter(d => d.status === 'UP').length;
        const down = total - up;
        const critical = DEVICE_DATA.filter(d => d.status === 'UP' && (d.cpu > 80 || d.mem > 85)).length;

        return { total, up, down, critical };
    }, [DEVICE_DATA]);

    const issueData = useMemo(() => {
        const counts: Record<string, number> = {};
        DEVICE_DATA.filter(d => d.status === 'DOWN').forEach(d => {
            counts[d.issue] = (counts[d.issue] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    }, [DEVICE_DATA]);

    const typeData = useMemo(() => {
        const counts: Record<string, number> = {};
        DEVICE_DATA.forEach(d => {
            counts[d.type] = (counts[d.type] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    }, [DEVICE_DATA]);

    const filteredData = useMemo(() => {
        if (filter === 'All') return DEVICE_DATA;
        if (filter === 'UP') return DEVICE_DATA.filter(d => d.status === 'UP');
        if (filter === 'DOWN') return DEVICE_DATA.filter(d => d.status === 'DOWN');
        if (filter === 'Critical') return DEVICE_DATA.filter(d => d.status === 'UP' && (d.cpu > 80 || d.mem > 85));
        return DEVICE_DATA;
    }, [filter, DEVICE_DATA]);

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-500 pb-10 max-w-[1600px] mx-auto">
            <div className="flex flex-col gap-1 px-1">
                <div className="flex items-center gap-3">
                    <button onClick={() => setSelectedModule('unified')} className="p-1 rounded-lg hover:bg-primary/10 text-primary transition-all flex items-center justify-center border border-primary/20 bg-primary/5">
                        <ChevronLeft size={20} strokeWidth={2.5} />
                    </button>
                    <div className="h-6 w-1 bg-primary rounded-full shadow-[0_0_8px_rgba(0,165,142,0.4)]" />
                    <div>
                        <h2 className="text-[14px] font-black uppercase tracking-[0.2em] text-foreground/90">Device Analytics</h2>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider opacity-60 flex items-center gap-2">
                            Infrastructure Health • Resource Utilization • Assets
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3 flex flex-col justify-between min-h-[85px] shadow-sm relative overflow-hidden group hover:bg-primary/10 transition-all border-l-4 border-l-primary">
                    <div className="flex items-start justify-between">
                        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Total Assets</p>
                        <Database size={16} className="text-primary opacity-40" />
                    </div>
                    <p className="text-3xl font-black">{stats.total}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-[9px] font-bold text-primary uppercase">Active Inventory</span>
                    </div>
                </div>

                <div className={cn(
                    "rounded-2xl border p-3 flex flex-col justify-between min-h-[85px] shadow-sm cursor-pointer transition-all hover:scale-[1.02] active:scale-95 group border-l-4",
                    filter === 'UP' ? "bg-emerald-500/10 border-emerald-500 shadow-lg" : "bg-emerald-500/5 border-emerald-500/20"
                )} onClick={() => setFilter('UP')}>
                    <div className="flex items-start justify-between">
                        <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest mb-1">Operational</p>
                        <ShieldCheck size={16} className="text-emerald-500 opacity-40 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-3xl font-black text-emerald-600">{stats.up}</p>
                    <div className="flex items-center gap-1 text-[9px] text-emerald-700 font-bold mt-1 uppercase tracking-tighter">
                        <CheckCircle2 size={10} /> {Math.round((stats.up / stats.total) * 100)}% Availability
                    </div>
                </div>

                <div className={cn(
                    "rounded-2xl border p-3 flex flex-col justify-between min-h-[85px] shadow-sm cursor-pointer transition-all hover:scale-[1.02] active:scale-95 group border-l-4",
                    filter === 'DOWN' ? "bg-rose-500/10 border-rose-500 shadow-lg" : "bg-rose-500/5 border-rose-500/20"
                )} onClick={() => setFilter('DOWN')}>
                    <div className="flex items-start justify-between">
                        <p className="text-[10px] font-black uppercase text-rose-600 tracking-widest mb-1">Offline</p>
                        <AlertTriangle size={16} className="text-rose-500 opacity-40 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-3xl font-black text-rose-600">{stats.down}</p>
                    <div className="flex items-center gap-1 text-[9px] text-rose-700 font-bold mt-1 uppercase tracking-tighter">
                        <XCircle size={10} /> {stats.down} Critical Outages
                    </div>
                </div>

                <div className={cn(
                    "rounded-2xl border p-3 flex flex-col justify-between min-h-[85px] shadow-sm cursor-pointer transition-all hover:scale-[1.02] active:scale-95 group border-l-4",
                    filter === 'Critical' ? "bg-amber-500/10 border-amber-500 shadow-lg" : "bg-amber-500/5 border-amber-500/20"
                )} onClick={() => setFilter('Critical')}>
                    <div className="flex items-start justify-between">
                        <p className="text-[10px] font-black uppercase text-amber-600 tracking-widest mb-1">At Risk</p>
                        <Activity size={16} className="text-amber-500 opacity-40 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-3xl font-black text-amber-600">{stats.critical}</p>
                    <div className="flex items-center gap-1 text-[9px] text-amber-700 font-bold mt-1 uppercase tracking-tighter">
                        <Zap size={10} /> High Resource Load
                    </div>
                </div>
            </div>

            {/* Issues Breakdown Section */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <LayoutGrid size={18} className="text-primary" />
                        <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Device Down Issues Breakdown</h3>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider opacity-60">
                        Click cards to filter detailed inventory
                    </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[
                        { label: 'Power Loss', desc: '(Power failure/grid down)', color: 'rose', issue: 'Power Loss' },
                        { label: 'Critical Overheat', desc: '(Thermal threshold exceed)', color: 'orange', issue: 'Critical overheat' },
                        { label: 'SNMP Timeout', desc: '(Reachability loss)', color: 'amber', issue: 'SNMP Timeout' },
                        { label: 'Auth Failure', desc: '(Credential mismatch)', color: 'blue', issue: 'Authentication Failure' },
                        { label: 'Interface Flapping', desc: '(Port stability issues)', color: 'purple', issue: 'Interface Flapping' }
                    ].map((item) => {
                        const issueData = DEVICE_DATA.filter(d => d.issue === item.issue);
                        const count = issueData.length;
                        return (
                            <div
                                key={item.label}
                                onClick={() => setFilter(filter === item.issue ? 'All' : item.issue)}
                                className={cn(
                                    "flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer hover:shadow-md relative group/card min-h-[90px]",
                                    filter === item.issue ? `bg-${item.color}-500/10 border-${item.color}-500 shadow-sm` : `bg-${item.color}-500/5 border-${item.color}-500/20`
                                )}
                            >
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        exportToCSV(issueData, `Device_${item.label.replace(/\s+/g, '_')}_Issues`);
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
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col relative group overflow-hidden">
                    <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/5 blur-[80px] group-hover:bg-primary/10 transition-colors" />

                    <div className="flex items-center justify-between mb-6 relative z-10">
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <AlertTriangle size={16} className="text-rose-500 animate-pulse" />
                            Failure Root Causes
                        </h3>
                        <button
                            onClick={() => exportToCSV(DEVICE_DATA.filter(d => d.status === 'DOWN'), 'Device_Failure_Analysis')}
                            className="p-2 hover:bg-rose-500/10 rounded-lg text-rose-500 transition-all bg-rose-500/5 border border-rose-500/20 shadow-sm"
                        >
                            <Download size={14} />
                        </button>
                    </div>

                    <div className="h-[340px] w-full relative">
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 -translate-y-6">
                            <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] leading-none mb-1">Total</span>
                            <span className="text-4xl font-black text-foreground tabular-nums drop-shadow-sm">{stats.down}</span>
                            <span className="text-[10px] font-black text-rose-500/80 uppercase tracking-widest mt-1">Issues</span>
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
                                        <Cell key={`cell-${index}`} fill={colors[(index + 1) % colors.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))', fontSize: '10px' }}
                                />
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
                            <Server size={16} className="text-primary" />
                            Device Type Distribution
                        </h3>
                    </div>
                    <div className="h-[300px] mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={typeData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10, fontWeight: 800 }} />
                                <Tooltip cursor={{ fill: 'hsl(var(--primary)/0.05)' }} />
                                <Bar dataKey="value" fill="hsl(var(--primary))" barSize={18} radius={[0, 6, 6, 0]}>
                                    {typeData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                    ))}
                                    <LabelList dataKey="value" position="right" style={{ fontSize: '11px', fontWeight: 'black' }} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-6">Regional Health Overview</h3>
                        <div className="space-y-4">
                            {['North', 'South', 'East', 'West'].map((region, i) => {
                                const regionDevices = DEVICE_DATA.filter(d => d.region === region);
                                const regionUp = regionDevices.filter(d => d.status === 'UP').length;
                                const pct = (regionUp / regionDevices.length) * 100;
                                return (
                                    <div key={region} className="p-3 rounded-xl bg-muted/30 border border-border/50">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[10px] font-black uppercase">{region} Region</span>
                                            <span className={cn("text-xs font-black", pct > 95 ? "text-emerald-500" : "text-amber-500")}>{Math.round(pct)}% Healthy</span>
                                        </div>
                                        <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                                            <div className={cn("h-full", pct > 95 ? "bg-emerald-500" : "bg-amber-500")} style={{ width: `${pct}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary"><MousePointer2 size={16} /></div>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">Select any segment to view detailed node telemetry.</p>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden border-t-4 border-t-emerald-600">
                <div className="p-5 border-b border-border/50 flex items-center justify-between bg-muted/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-600 text-white rounded-lg"><Globe size={16} /></div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Infrastructure Asset Inventory</h3>
                    </div>
                    <button
                        onClick={() => exportToCSV(DEVICE_DATA, 'Device_Inventory_Export')}
                        className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600/10 text-emerald-600 border border-emerald-600/20 rounded-lg hover:bg-emerald-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-wider"
                    >
                        <Download size={14} />
                        Export CSV
                    </button>
                </div>
                <div className="max-h-[500px] overflow-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="text-[10px] uppercase font-black text-muted-foreground bg-muted/30 sticky top-0 z-10">
                            <tr>
                                <th className="p-4 border-b">Asset Name</th>
                                <th className="p-4 border-b text-center">Equipment Type</th>
                                <th className="p-4 border-b text-center">Status</th>
                                <th className="p-4 border-b text-center">CPU/MEM</th>
                                <th className="p-4 border-b text-right">Operational Log</th>
                            </tr>
                        </thead>
                        <tbody className="text-[12px] font-bold divide-y divide-border/20">
                            {filteredData.map((row, i) => (
                                <tr key={i} className="hover:bg-primary/5 transition-colors">
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-black text-primary">{row.name}</span>
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
                                        <div className="flex flex-col gap-1 items-center">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] w-6">CPU</span>
                                                <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                                                    <div className={cn("h-full", row.cpu > 80 ? "bg-red-500" : "bg-primary")} style={{ width: `${row.cpu}%` }}></div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] w-6">MEM</span>
                                                <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                                                    <div className={cn("h-full", row.mem > 80 ? "bg-red-500" : "bg-blue-500")} style={{ width: `${row.mem}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        {row.status === 'DOWN' ? (
                                            <span className="text-rose-600 text-[10px] uppercase">{row.issue}</span>
                                        ) : (
                                            <span className="text-emerald-600/40 text-[10px] uppercase">Stable</span>
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
