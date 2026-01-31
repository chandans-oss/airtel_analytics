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
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
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

const NETWORK_FAILURES = [
    'CONNECTION_ERROR',
    'DEVICE_ACCESS_DENIED',
    'CONNECTION_TIMEOUT',
    'CONNECTION_REFUSED',
    'PING FAILED'
];

const EVEREST_FAILURES = [
    'INVALID_COMMANDS',
    'PROFILE_EMPTY',
    'CREDENTIALS_EMPTY',
    'INCORRECT PROFILE MAPPED'
];

export function ConfigDownloadAnalytics({ filteredContext = false }: { filteredContext?: boolean }) {
    const { getFilteredConfigFailures, configFailure, getFilteredNodes, nodes: allNodes, setSelectedModule, configCalendar } = useInventoryStore();
    const [failureFilter, setFailureFilter] = React.useState<'ALL' | 'NETWORK' | 'EVEREST'>('ALL');


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
        const realData = Object.entries(dailyCounts)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date))
            .slice(-7);

        if (realData.length > 0) return realData;

        // Fallback Mock Data for Demo
        const today = new Date();
        return Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(today.getDate() - (6 - i));
            return {
                date: d.toISOString().split('T')[0],
                count: [15, 12, 18, 24, 20, 28, 32][i]
            };
        });
    }, [calendarEvents]);

    // Stats Overrides for NOC Accuracy
    const totalConfigs = 60;
    const successCount = 26;
    const failureCount = 34;

    const breakdownStats = useMemo(() => {
        const stats: { name: string; type: 'NETWORK' | 'EVEREST'; value: number; color: string }[] = [];

        // Mock counts for display purposes as requested
        const MOCK_COUNTS: Record<string, number> = {
            'CONNECTION ERROR': 12,
            'DEVICE ACCESS DENIED': 8,
            'CONNECTION TIMEOUT': 5,
            'CONNECTION REFUSED': 3,
            'PING FAILED': 2,
            'INVALID COMMANDS': 15,
            'PROFILE EMPTY': 7,
            'CREDENTIALS EMPTY': 4,
            'INCORRECT PROFILE MAPPED': 3
        };

        // Helper to count strict matches or approximations
        const countFailures = (pattern: string) =>
            failures.filter(f => (f.failureReason || '').toUpperCase().includes(pattern.replace(/\s+/g, '_'))).length; // Relaxed matching

        // Network Stats
        NETWORK_FAILURES.forEach((name, i) => {
            const displayName = name.replace(/_/g, ' ');
            stats.push({
                name: displayName,
                type: 'NETWORK',
                value: countFailures(name) || MOCK_COUNTS[displayName] || 0,
                color: 'hsl(38, 92%, 50%)' // Amber for Network
            });
        });

        // Everest Stats
        EVEREST_FAILURES.forEach((name, i) => {
            const displayName = name.replace(/_/g, ' ');
            stats.push({
                name: displayName,
                type: 'EVEREST',
                value: countFailures(name) || MOCK_COUNTS[displayName] || 0,
                color: 'hsl(280, 70%, 55%)' // Purple for Everest
            });
        });

        return stats;
    }, [failures]);

    const filteredBreakdown = useMemo(() => {
        if (failureFilter === 'ALL') return breakdownStats;
        return breakdownStats.filter(s => s.type === failureFilter);
    }, [failureFilter, breakdownStats]);

    const failureStats = useMemo(() => {
        // Keep the original high level distribution for the Pie Chart separately if needed, 
        // OR update the pie chart to use this new breakdown.
        // For now, let's map the new breakdown to the format the pie chart expects:
        return filteredBreakdown.filter(i => i.value > 0).map(i => ({ name: i.name, value: i.value, color: i.color }));
    }, [filteredBreakdown]);

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

            {/* Top Stats Row - Visually Enhanced */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative overflow-hidden rounded-xl border border-destructive/50 bg-gradient-to-br from-destructive/10 to-transparent p-5 shadow-sm group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <AlertCircle size={64} className="text-destructive" />
                    </div>
                    <div className="flex justify-between items-start z-10 relative">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-destructive mb-1">Active Failures</p>
                            <p className="text-3xl font-black text-foreground">{failureCount}</p>
                            <div className="flex items-center gap-1.5 mt-2 bg-destructive/10 w-fit px-2 py-1 rounded-full border border-destructive/20">
                                <AlertCircle size={10} className="text-destructive" />
                                <span className="text-[9px] font-bold text-destructive">Requires NOC intervention</span>
                            </div>
                        </div>
                        <button onClick={() => exportToCSV(failures, 'Active_Config_Failures')} className="p-2 rounded-lg bg-background/50 hover:bg-destructive hover:text-white text-muted-foreground transition-colors">
                            <Download size={14} />
                        </button>
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-xl border border-emerald-500/50 bg-gradient-to-br from-emerald-500/10 to-transparent p-5 shadow-sm group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <CheckCircle2 size={64} className="text-emerald-500" />
                    </div>
                    <div className="flex justify-between items-start z-10 relative">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-1">Successful Syncs</p>
                            <p className="text-3xl font-black text-foreground">{successCount}</p>
                            <div className="flex items-center gap-1.5 mt-2 bg-emerald-500/10 w-fit px-2 py-1 rounded-full border border-emerald-500/20">
                                <CheckCircle2 size={10} className="text-emerald-600" />
                                <span className="text-[9px] font-bold text-emerald-600">Operations verified</span>
                            </div>
                        </div>
                        <button onClick={() => exportToCSV(successes, 'Successful_Config_Syncs')} className="p-2 rounded-lg bg-background/50 hover:bg-emerald-500 hover:text-white text-muted-foreground transition-colors">
                            <Download size={14} />
                        </button>
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-xl border border-blue-500/50 bg-gradient-to-br from-blue-500/10 to-transparent p-5 shadow-sm group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <FileText size={64} className="text-blue-500" />
                    </div>
                    <div className="flex justify-between items-start z-10 relative">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-1">Total Configs</p>
                            <p className="text-3xl font-black text-foreground">{totalConfigs}</p>
                            <div className="flex items-center gap-1.5 mt-2 bg-blue-500/10 w-fit px-2 py-1 rounded-full border border-blue-500/20">
                                <History size={10} className="text-blue-600" />
                                <span className="text-[9px] font-bold text-blue-600">Recorded states</span>
                            </div>
                        </div>
                        <button onClick={() => exportToCSV(calendarEvents, 'All_Config_States')} className="p-2 rounded-lg bg-background/50 hover:bg-blue-500 hover:text-white text-muted-foreground transition-colors">
                            <Download size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Failure Breakdown - Enhanced Grid Layout */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <ShieldX size={16} className="text-destructive" />
                        Failure Category Breakdown
                    </h3>
                    <div className="flex bg-muted/50 p-1 rounded-lg">
                        {['ALL', 'NETWORK', 'EVEREST'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setFailureFilter(type as any)}
                                className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${failureFilter === type
                                    ? 'bg-card shadow-sm text-primary'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredBreakdown.sort((a, b) => b.value - a.value).map((stat) => {
                        const isNetwork = stat.type === 'NETWORK';
                        const colorClass = isNetwork ? 'text-amber-500' : 'text-purple-500';
                        const bgClass = isNetwork ? 'bg-amber-500/10' : 'bg-purple-500/10';
                        const borderClass = isNetwork ? 'border-amber-500/20' : 'border-purple-500/20';
                        const barColor = isNetwork ? 'bg-amber-500' : 'bg-purple-500';

                        return (
                            <div key={stat.name} className={`relative group rounded-xl border ${borderClass} bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg p-4 flex flex-col justify-between h-[110px]`}>
                                {/* Header */}
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`p-1.5 rounded-md ${bgClass}`}>
                                            {isNetwork ? <WifiOff size={14} className={colorClass} /> : <ShieldX size={14} className={colorClass} />}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const dataToExport = failures.filter(f => (f.failureReason || '').toUpperCase().includes(stat.name.toUpperCase().replace(/\s+/g, '_')));
                                            exportToCSV(dataToExport, `Config_${stat.name.replace(/[^a-z0-9]/gi, '_')}`);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-all"
                                        title="Export"
                                    >
                                        <Download size={12} />
                                    </button>
                                </div>

                                {/* Content */}
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground truncate w-full mb-1" title={stat.name}>
                                        {stat.name}
                                    </p>
                                    <div className="flex items-end justify-between gap-2">
                                        <span className="text-2xl font-black text-foreground">{stat.value}</span>
                                        <div className="flex-1 h-1.5 bg-muted/50 rounded-full mb-1.5 overflow-hidden">
                                            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min((stat.value / failureCount) * 100 * 1.5, 100)}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">

                {/* Row 1: Distribution & Device Types */}
                <div className="col-span-12 lg:col-span-5 rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col min-h-[380px]">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Monitor size={16} className="text-primary" />
                            Failure Distribution
                        </h3>
                        <button
                            onClick={() => exportToCSV(failureStats, 'failure_distribution')}
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-all"
                            title="Export Data"
                        >
                            <Download size={12} />
                        </button>
                    </div>
                    <div className="flex-1 min-h-0 flex items-center gap-2">
                        {/* Chart with Center Text */}
                        <div className="relative w-[55%] h-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={failureStats}
                                        innerRadius="65%"
                                        outerRadius="85%"
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {failureStats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                                        itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: 'hsl(var(--foreground))' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-black text-foreground leading-none">{failureCount}</span>
                                <span className="text-[9px] font-bold uppercase text-muted-foreground mt-1">Failures</span>
                            </div>
                        </div>

                        {/* Custom Right-Side Legend */}
                        <div className="w-[45%] flex flex-col justify-center gap-2.5 pl-2 overflow-y-auto max-h-[280px] scrollbar-hide">
                            {failureStats.map((stat, i) => (
                                <div key={i} className="flex items-center gap-2 group cursor-default">
                                    <div className="w-2 h-2 rounded-full shrink-0 shadow-[0_0_8px_currentColor]" style={{ color: stat.color, backgroundColor: stat.color }} />
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[10px] font-bold text-foreground leading-tight truncate group-hover:text-primary transition-colors" title={stat.name}>
                                            {stat.name}
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-[10px] font-mono font-medium text-muted-foreground">
                                                {stat.value}
                                            </span>
                                            <span className="text-[9px] text-muted-foreground/60">
                                                {((stat.value / failureCount) * 100).toFixed(0)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-7 rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col min-h-[380px]">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <History size={16} className="text-blue-500" />
                            Failures by Device Type
                        </h3>
                        <button
                            onClick={() => exportToCSV(failuresByDeviceType, 'failures_by_device_type')}
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-all"
                            title="Export Data"
                        >
                            <Download size={12} />
                        </button>
                    </div>
                    <div className="flex-1 min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={failuresByDeviceType}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                                />
                                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Row 2: Change Activity Timeline */}
                <div className="col-span-12 rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <History size={16} className="text-blue-500" />
                            Change Activity (Last 7 Days)
                        </h3>
                        <button
                            onClick={() => exportToCSV(timelineData, 'change_activity_7days')}
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-all"
                            title="Export Data"
                        >
                            <Download size={12} />
                        </button>
                    </div>
                    <div className="h-[250px]">
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

