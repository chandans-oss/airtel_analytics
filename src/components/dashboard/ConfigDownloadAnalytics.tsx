import React, { useMemo } from 'react';
import { useInventoryStore } from '@/store/inventoryStore';
import {
    FileWarning,
    Lock,
    WifiOff,
    ShieldX,
    FileText,
    Download,
    History,
    AlertCircle,
    Monitor,
    ArrowLeft
} from 'lucide-react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const COLORS = [
    'hsl(12, 85%, 55%)',
    'hsl(38, 92%, 50%)',
    'hsl(280, 70%, 55%)',
    'hsl(210, 100%, 55%)',
];

export function ConfigDownloadAnalytics({ filteredContext = false }: { filteredContext?: boolean }) {
    const { getFilteredConfigFailures, configFailure, getFilteredNodes, nodes: allNodes, setSelectedModule } = useInventoryStore();

    const failures = filteredContext ? getFilteredConfigFailures() : configFailure;

    // For "Failures by Device Type", we need to look up node details.
    // If strict context, use filtered nodes. If global, use all nodes.
    const nodesToUse = filteredContext ? getFilteredNodes() : allNodes;

    // We must pass nodesToUse to the useMemos or use it directly, but current implementation calls getFilteredNodes() inside.
    // So we need to refactor previous implementation slightly to rely on passed nodes
    const nodes = nodesToUse;

    const failureStats = useMemo(() => {
        const counts: Record<string, number> = {
            'Access Denied': 0,
            'Ping Failed': 0,
            'SNMP Failed': 0,
            'SSH Failed': 0,
            'Others': 0
        };

        failures.forEach(f => {
            const reason = f.failureReason || '';
            if (reason.includes('Denied') || reason.includes('Auth')) counts['Access Denied']++;
            else if (reason.includes('Ping')) counts['Ping Failed']++;
            else if (reason.includes('SNMP')) counts['SNMP Failed']++;
            else if (reason.includes('SSH')) counts['SSH Failed']++;
            else counts['Others']++;
        });

        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .filter(d => d.value > 0);
    }, [failures]);

    const failuresByDeviceType = useMemo(() => {
        const counts: Record<string, number> = {};
        failures.forEach(f => {
            const node = nodes.find(n => n.deviceName === f.deviceName);
            const type = node?.deviceType || 'Unknown';
            counts[type] = (counts[type] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [failures, nodes]);

    const topFailingNodes = useMemo(() => {
        const counts: Record<string, number> = {};
        failures.forEach(f => {
            counts[f.deviceName] = (counts[f.deviceName] || 0) + 1;
        });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    }, [failures]);

    const complianceScore = useMemo(() => {
        const total = nodes.length || 1;
        const failed = new Set(failures.map(f => f.deviceName)).size;
        return Math.max(0, Math.round(((total - failed) / total) * 100));
    }, [nodes, failures]);

    // Simulated version changes
    const versionChanges = [
        { device: failures[0]?.deviceName || 'RTR-CORE-01', from: 'IOS-XE 17.3', to: 'IOS-XE 17.6', date: '2024-01-20', status: 'Failed' },
        { device: failures[1]?.deviceName || 'SW-EDGE-04', from: 'V.15.2', to: 'V.15.4', date: '2024-01-19', status: 'In Progress' },
        { device: failures[2]?.deviceName || 'FW-DC-02', from: 'FortiOS 6.4', to: 'FortiOS 7.0', date: '2024-01-18', status: 'Pending' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setSelectedModule('inventory')}
                        className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"
                        title="Back to Inventory"
                    >
                        <ArrowLeft size={16} />
                    </button>
                    <div className="flex items-center gap-2 text-destructive">
                        <FileWarning size={18} />
                        <span className="text-xs font-bold uppercase tracking-widest text-foreground">Config Management Compliance</span>
                    </div>
                </div>
                <button className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:bg-destructive hover:text-white transition-all">
                    <Download size={14} />
                    Export Compliance Report
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1 border-l-4 border-destructive rounded-xl border border-border bg-card/30 p-4 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Download Failures</p>
                    <p className="text-3xl font-black text-destructive">{failures.length}</p>
                    <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                        <AlertCircle size={10} />
                        <span>{filteredContext ? 'Segment-specific issues' : 'Requires NOC intervention'}</span>
                    </div>
                </div>

                <div className="md:col-span-1 border-l-4 border-emerald-500 rounded-xl border border-border bg-card/30 p-4 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Compliance Adherence</p>
                    <p className="text-3xl font-black text-emerald-500">{complianceScore}%</p>
                    <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${complianceScore}%` }} />
                    </div>
                </div>

                {failureStats.slice(0, 3).map((stat, i) => (
                    <div key={stat.name} className="rounded-xl border border-border bg-card/30 p-4 space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.name}</p>
                        <p className="text-3xl font-black text-foreground">{stat.value}</p>
                        <div className="h-1 w-full bg-muted rounded-full">
                            <div
                                className="h-full rounded-full transition-all duration-1000"
                                style={{
                                    width: `${(stat.value / failures.length) * 100}%`,
                                    backgroundColor: COLORS[i % COLORS.length]
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-6 flex items-center gap-2">
                            <Monitor size={16} className="text-primary" />
                            Failure Distribution
                        </h3>
                        <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={failureStats}
                                        innerRadius={70}
                                        outerRadius={95}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {failureStats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {filteredContext && (
                        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Device Hotspots</h3>
                            <div className="space-y-3">
                                {topFailingNodes.map(([name, count]) => (
                                    <div key={name} className="flex items-center justify-between p-2 rounded-lg bg-destructive/5 border border-destructive/10">
                                        <span className="text-xs font-bold truncate max-w-[150px]">{name}</span>
                                        <span className="text-[10px] font-black text-destructive">{count} Failures</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="col-span-12 lg:col-span-8 rounded-xl border border-border bg-card p-6 shadow-sm">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-6 flex items-center gap-2">
                        <History size={16} className="text-blue-500" />
                        Failures by Device Type
                    </h3>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={failuresByDeviceType}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                                />
                                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="col-span-12 rounded-xl border border-border bg-card overflow-hidden">
                    <div className="bg-muted/30 px-6 py-3 border-b border-border flex items-center gap-2">
                        <History size={14} className="text-muted-foreground" />
                        <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Version Change Compliance - Conflict Details</h3>
                    </div>
                    <div className="p-0 overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-muted/10 text-muted-foreground font-bold uppercase tracking-tighter border-b border-border/50">
                                <tr>
                                    <th className="px-6 py-3">Device Name</th>
                                    <th className="px-6 py-3">Source Version</th>
                                    <th className="px-6 py-3">Target Version</th>
                                    <th className="px-6 py-3">Scheduled Date</th>
                                    <th className="px-6 py-3">Last Attempt Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {versionChanges.map((change, i) => (
                                    <tr key={i} className="hover:bg-muted/20 transition-colors">
                                        <td className="px-6 py-4 font-bold">{change.device}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{change.from}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{change.to}</td>
                                        <td className="px-6 py-4 italic">{change.date}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${change.status === 'Failed' ? 'bg-destructive/10 text-destructive' :
                                                change.status === 'In Progress' ? 'bg-blue-500/10 text-blue-500' : 'bg-muted text-muted-foreground'
                                                }`}>
                                                {change.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

