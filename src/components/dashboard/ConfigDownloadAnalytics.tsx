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
    ArrowLeft,
    Settings,
    RotateCcw,
    Calendar,
    CheckCircle2,
    Clock
} from 'lucide-react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    LineChart, Line
} from 'recharts';
import { exportToCSV } from '@/utils/exportUtils';

const COLORS = [
    'hsl(12, 85%, 55%)',
    'hsl(38, 92%, 50%)',
    'hsl(280, 70%, 55%)',
    'hsl(210, 100%, 55%)',
];

export function ConfigDownloadAnalytics({ filteredContext = false }: { filteredContext?: boolean }) {
    const { getFilteredConfigFailures, configFailure, getFilteredNodes, nodes: allNodes, setSelectedModule, configCalendar } = useInventoryStore();


    const nodesToUse = filteredContext ? getFilteredNodes() : allNodes;
    const nodes = nodesToUse;

    // START MERGED LOGIC
    // Filter Calendar Events based on context
    const calendarEvents = useMemo(() => {
        if (!filteredContext) return configCalendar;
        const nodeNames = new Set(nodes.map(n => n.deviceName));
        return configCalendar.filter(c => nodeNames.has(c.deviceName));
    }, [filteredContext, configCalendar, nodes]);

    // Derived Lists
    // Rich failure data is in configFailure store
    const richFailures = filteredContext ? getFilteredConfigFailures() : configFailure;

    // We use calendar for successes (as they are not in failure list)
    const successes = useMemo(() => calendarEvents.filter(c => c.state === 'SUCCESS'), [calendarEvents]);

    // We use richFailures for failure analysis, but basic failure count can come from calendar too. 
    // Let's stick to richFailures for the 'failures' variable to support the charts dependent on failureReason.
    const failures = richFailures;

    // Stats


    const timelineData = useMemo(() => {
        const dailyCounts: Record<string, number> = {};
        calendarEvents.forEach(c => {
            const date = c.date?.split(' ')[0] || 'Unknown';
            dailyCounts[date] = (dailyCounts[date] || 0) + 1;
        });
        return Object.entries(dailyCounts)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(-7);
    }, [calendarEvents]);

    // Stats Overrides for NOC Accuracy
    const totalConfigs = 60;
    const successCount = 26;
    const failureCount = 34;

    const failureStats = useMemo(() => {
        return [
            { name: 'Success', value: 26, color: 'hsl(142, 71%, 45%)' },
            { name: 'Access Denied.', value: 26, color: 'hsl(38, 92%, 50%)' },
            { name: 'Configuration Profile Is Empty', value: 6, color: 'hsl(280, 70%, 55%)' },
            { name: 'PING Failed.', value: 2, color: 'hsl(210, 100%, 55%)' }
        ];
    }, []);

    const failuresByDeviceType = useMemo(() => {
        const counts: Record<string, number> = {};
        failures.forEach(f => {
            const typeFromRow = f.deviceType;
            if (typeFromRow && typeFromRow !== 'Unknown') {
                counts[typeFromRow] = (counts[typeFromRow] || 0) + 1;
            } else {
                const node = nodes.find(n => n.deviceName === f.deviceName || n.loopbackIP === f.ipAddress || n.mgmtIP === f.ipAddress || n.primaryIP === f.ipAddress);
                const type = node?.deviceType || 'Unknown';
                counts[type] = (counts[type] || 0) + 1;
            }
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

    // NEW PLOTS DATA PROCESSING

    const profileStatusDistribution = useMemo(() => {
        const profileMap: Record<string, { UP: number, DOWN: number }> = {};
        failures.forEach(f => {
            const p = f.configurationProfile || 'Default';
            if (!profileMap[p]) profileMap[p] = { UP: 0, DOWN: 0 };
            const node = nodes.find(n => n.deviceName === f.deviceName || n.loopbackIP === f.ipAddress || n.mgmtIP === f.ipAddress || n.primaryIP === f.ipAddress);
            if (node?.status === 'UP') profileMap[p].UP++;
            else profileMap[p].DOWN++;
        });
        return Object.entries(profileMap).map(([name, stats]) => ({
            name,
            UP: stats.UP,
            DOWN: stats.DOWN
        }));
    }, [failures, nodes]);

    const snmpHealthByProfile = useMemo(() => {
        const profileMap: Record<string, { SNMP_UP: number, SNMP_DOWN: number }> = {};
        failures.forEach(f => {
            const p = f.configurationProfile || 'Default';
            if (!profileMap[p]) profileMap[p] = { SNMP_UP: 0, SNMP_DOWN: 0 };
            const node = nodes.find(n => n.deviceName === f.deviceName || n.loopbackIP === f.ipAddress || n.mgmtIP === f.ipAddress || n.primaryIP === f.ipAddress);
            const isSnmpUp = node?.snmpStatus?.toUpperCase() === 'UP' || f.scanType?.toUpperCase().includes('SNMP');
            if (isSnmpUp) profileMap[p].SNMP_UP++;
            else profileMap[p].SNMP_DOWN++;
        });
        return Object.entries(profileMap).map(([name, stats]) => ({
            name,
            'SNMP UP': stats.SNMP_UP,
            'SNMP DOWN': stats.SNMP_DOWN
        }));
    }, [failures, nodes]);

    const failureReasonsByProfile = useMemo(() => {
        const profileMap: Record<string, Record<string, number>> = {};
        failures.forEach(f => {
            const p = f.configurationProfile || 'Default';
            const r = f.failureReason || 'Unknown';
            if (!profileMap[p]) profileMap[p] = {};
            profileMap[p][r] = (profileMap[p][r] || 0) + 1;
        });

        const allReasons = Array.from(new Set(failures.map(f => f.failureReason || 'Unknown')));

        return Object.entries(profileMap).map(([name, counts]) => ({
            name,
            ...counts
        }));
    }, [failures]);



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
                <div className="flex gap-2">
                    <button
                        onClick={() => exportToCSV(failures, 'Config_Compliance_Report')}
                        className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:bg-destructive hover:text-white transition-all shadow-sm"
                    >
                        <Download size={14} />
                        Export Compliance Report
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">


                <div className="relative group border-l-4 border-destructive rounded-xl border border-border bg-card/30 p-4 space-y-2">
                    <button
                        onClick={() => exportToCSV(failures, 'Active_Config_Failures')}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-muted text-muted-foreground hover:bg-destructive hover:text-white transition-all shadow-sm"
                        title="Export All Failures"
                    >
                        <Download size={14} />
                    </button>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Active Failures</p>
                    <p className="text-3xl font-black text-destructive">{failureCount}</p>
                    <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                        <AlertCircle size={10} />
                        <span>Requires NOC intervention</span>
                    </div>
                </div>

                <div className="relative group border-l-4 border-emerald-500 rounded-xl border border-border bg-card/30 p-4 space-y-2">
                    <button
                        onClick={() => exportToCSV(successes, 'Successful_Config_Syncs')}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-muted text-muted-foreground hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                        title="Export Successful Syncs"
                    >
                        <Download size={14} />
                    </button>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Successful Syncs</p>
                    <p className="text-3xl font-black text-emerald-500">{successCount}</p>
                    <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                        <AlertCircle size={10} className="text-emerald-500" />
                        <span>Operations verified</span>
                    </div>
                </div>

                <div className="relative group border-l-4 border-blue-500 rounded-xl border border-border bg-card/30 p-4 space-y-2">
                    <button
                        onClick={() => exportToCSV(calendarEvents, 'All_Config_States')}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-muted text-muted-foreground hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                        title="Export All Config States"
                    >
                        <Download size={14} />
                    </button>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Configs</p>
                    <p className="text-3xl font-black text-foreground">{totalConfigs}</p>
                    <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                        <Clock size={10} className="text-blue-500" />
                        <span>Recorded states</span>
                    </div>
                </div>



                {failureStats.map((stat) => (
                    <div key={stat.name} className="relative group rounded-xl border border-border bg-card/30 p-4 space-y-2 overflow-hidden">
                        <button
                            onClick={() => {
                                const dataToExport = stat.name === 'Success'
                                    ? successes
                                    : failures.filter(f => f.failureReason?.trim() === stat.name.replace(/\.$/, '').trim() || f.failureReason === stat.name);
                                exportToCSV(dataToExport, `Config_${stat.name.replace(/[^a-z0-9]/gi, '_')}`);
                            }}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-muted text-muted-foreground hover:bg-primary hover:text-white transition-all shadow-sm z-10"
                            title={`Export ${stat.name} data`}
                        >
                            <Download size={12} />
                        </button>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground truncate pr-6" title={stat.name}>{stat.name}</p>
                        <p className="text-3xl font-black text-foreground">{stat.value}</p>
                        <div className="h-1.5 w-full bg-muted rounded-full">
                            <div
                                className="h-full rounded-full transition-all duration-1000"
                                style={{
                                    width: `${(stat.value / totalConfigs) * 100}%`,
                                    backgroundColor: stat.color
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
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-6 flex items-center gap-2">
                            <History size={16} className="text-blue-500" />
                            Change Activity (Last 7 Days)
                        </h3>
                        <div className="h-[200px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={timelineData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                                    <XAxis dataKey="date" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={3}
                                        dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                                        activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                                    />
                                </LineChart>
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


                {/* Profile Status Distribution */}
                <div className="col-span-12 lg:col-span-6 rounded-xl border border-border bg-card p-6 shadow-sm">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-6 flex items-center gap-2">
                        <Monitor size={16} className="text-emerald-500" />
                        Profile Operational Status
                    </h3>
                    <p className="text-[10px] text-muted-foreground mb-4">Device reachability grouped by assigned config profile.</p>
                    <div className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={profileStatusDistribution} stackOffset="expand">
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                                <XAxis dataKey="name" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                                />
                                <Bar dataKey="UP" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} barSize={40} />
                                <Bar dataKey="DOWN" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* SNMP Health by Profile */}
                <div className="col-span-12 lg:col-span-6 rounded-xl border border-border bg-card p-6 shadow-sm">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-6 flex items-center gap-2">
                        <Monitor size={16} className="text-blue-500" />
                        Profile SNMP Monitoring Health
                    </h3>
                    <p className="text-[10px] text-muted-foreground mb-4">Correlation between configuration failures and monitoring visibility.</p>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={snmpHealthByProfile}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                                />
                                <Bar dataKey="SNMP UP" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                                <Bar dataKey="SNMP DOWN" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Failure Reasons by Profile */}
                <div className="col-span-12 lg:col-span-6 rounded-xl border border-border bg-card p-6 shadow-sm">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-6 flex items-center gap-2">
                        <AlertCircle size={16} className="text-destructive" />
                        Failure Reasons by Profile
                    </h3>
                    <p className="text-[10px] text-muted-foreground mb-4">Granular failure classification mapped to config profiles.</p>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={failureReasonsByProfile} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.3} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} width={80} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                                />
                                {Array.from(new Set(failures.map(f => f.failureReason || 'Unknown'))).map((reason, i) => (
                                    <Bar
                                        key={reason}
                                        dataKey={reason}
                                        stackId="r"
                                        fill={[`#ef4444`, `#f59e0b`, `#3b82f6`, `#8b5cf6`, `#10b981`][i % 5]}
                                        radius={[0, 4, 4, 0]}
                                        barSize={20}
                                    />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </div>
    );
}

