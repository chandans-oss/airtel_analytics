import React, { useMemo, useState } from 'react';
import { useInventoryStore } from '@/store/inventoryStore';
import {
    AlertTriangle,
    WifiOff,
    ShieldAlert,
    Activity,
    Zap,
    Network,
    Clock,
    Ticket,
    Download,
    Lightbulb,
    Cpu,
    ArrowLeft,
    Info
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell,
    LineChart,
    Line,
    CartesianGrid
} from 'recharts';

import {
    EventsTrendLineChart,
    SeverityAreaChart,
    CausalFlowSankey,
    MultiDimParallelSankey
} from './EventCharts';

export function ProbableCauseAnalytics({ filteredContext = false }: { filteredContext?: boolean }) {
    const { getFilteredEvents, allEvents, setSelectedModule } = useInventoryStore();
    const [timeRange, setTimeRange] = useState<'3H' | '24H' | '7D'>('24H');

    // Choose data source and apply time filter
    const rawEvents = filteredContext ? getFilteredEvents() : allEvents;

    const events = useMemo(() => {
        const now = new Date();
        const cutoff = new Date(now);

        if (timeRange === '3H') cutoff.setHours(now.getHours() - 3);
        else if (timeRange === '24H') cutoff.setHours(now.getHours() - 24);
        else if (timeRange === '7D') cutoff.setDate(now.getDate() - 7);

        return rawEvents.filter(e => {
            if (!e.startTime) return false;
            return new Date(e.startTime) >= cutoff;
        });
    }, [rawEvents, timeRange]);

    // --- Existing Logic for KPIs and Bar Chart (Reused) ---
    const probableCauses = useMemo(() => {
        // Broadened keywords to catch more data
        const causes = [
            { id: 'link', label: 'Link/Interface Failure', count: 0, icon: Network, color: 'hsl(320, 70%, 55%)', keywords: ['LINK', 'INTERFACE', 'PORT', 'DOWN', 'FLAP', 'ETH', 'GIGABIT'] },
            { id: 'bgp', label: 'BGP/Routing Issues', count: 0, icon: Zap, color: 'hsl(38, 92%, 50%)', keywords: ['BGP', 'OSPF', 'NEIGHBOR', 'PEER', 'ROUTE', 'ADHOC'] },
            { id: 'hard', label: 'Hardware/Environment', count: 0, icon: Cpu, color: 'hsl(12, 85%, 55%)', keywords: ['CARD', 'CHASSIS', 'FAN', 'POWER', 'TEMP', 'VOLTAGE', 'HARDWARE'] },
            { id: 'reach', label: 'Reachability/Ping', count: 0, icon: Activity, color: 'hsl(210, 100%, 55%)', keywords: ['PING', 'REACHABILITY', 'TIMEOUT', 'UNREACHABLE', 'ICMP', 'SNMP'] },
            { id: 'config', label: 'Config/System', count: 0, icon: ShieldAlert, color: 'hsl(280, 70%, 55%)', keywords: ['CONFIG', 'MISMATCH', 'ERROR', 'SYSTEM', 'REBOOT', 'RESTART'] },
            { id: 'other', label: 'Other Anomalies', count: 0, icon: AlertTriangle, color: 'hsl(215, 15%, 65%)', keywords: [] } // Catch-all
        ];

        let unclassifiedcount = 0;

        events.forEach(e => {
            const event = e as any;
            const fault = (event.faultName || '').toUpperCase();
            const rootCause = (event.rootCause || '').toUpperCase();
            const summary = (event.summary || '').toUpperCase(); // Also check summary if available
            const combined = `${fault} ${rootCause} ${summary}`;

            let matched = false;
            for (const cause of causes) {
                if (cause.id === 'other') continue; // Skip other for now
                if (cause.keywords.some(kw => combined.includes(kw))) {
                    cause.count += 1;
                    matched = true;
                    break;
                }
            }

            if (!matched) {
                causes.find(c => c.id === 'other')!.count += 1;
                unclassifiedcount++;
                if (unclassifiedcount < 5) {
                    console.log("Unclassified Event for Probable Cause:", combined);
                }
            }
        });

        // Filter out empty categories, but keep 'Other' if it has data
        return causes.filter(c => c.count > 0).sort((a, b) => b.count - a.count);
    }, [events]);

    const ticketStats = useMemo(() => {
        const counts = { open: 0, inProgress: 0, resolved: 0, pending: 0 };
        events.forEach(e => {
            const status = (e.status || '').toUpperCase().trim();

            // More flexible matching for status variations
            if (status.includes('OPEN') || status === 'ACTIVE' || status.includes('NEW')) {
                counts.open++;
            } else if (status.includes('PROGRESS') || status.includes('ACKNOWLEDGED') || status.includes('WORKING')) {
                counts.inProgress++;
            } else if (status.includes('CLEAR') || status.includes('RESOLVED') || status.includes('CLOSED') || status.includes('FIXED')) {
                counts.resolved++;
            } else if (status.includes('PENDING') || status.includes('VENDOR') || status.includes('WAITING')) {
                counts.pending++;
            } else {
                // If no match, log it for debugging and count as open
                console.log('Unknown event status:', status, 'Event:', e);
                counts.open++;
            }
        });

        return [
            { name: 'Open', value: counts.open, color: 'hsl(12, 85%, 55%)', icon: AlertTriangle },
            { name: 'In Progress', value: counts.inProgress, color: 'hsl(38, 92%, 50%)', icon: Clock },
            { name: 'Resolved', value: counts.resolved, color: 'hsl(160, 84%, 39%)', icon: ShieldAlert },
            { name: 'Pending Vendor', value: counts.pending, color: 'hsl(210, 100%, 55%)', icon: Ticket },
        ];
    }, [events]);

    const businessHoursData = useMemo(() => {
        const hours = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];
        return hours.map(h => ({
            name: h,
            events: Math.floor(Math.random() * 50) + 10,
            critical: Math.floor(Math.random() * 10)
        }));
    }, []);

    const impactedDomains = useMemo(() => {
        const counts: Record<string, number> = {};
        events.forEach(e => {
            const domain = e.category || 'Core Infrastructure';
            counts[domain] = (counts[domain] || 0) + 1;
        });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    }, [events]);

    const topImpactedNodes = useMemo(() => {
        const counts: Record<string, number> = {};
        events.forEach(e => {
            const node = e.deviceName || 'Unknown';
            counts[node] = (counts[node] || 0) + 1;
        });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);
    }, [events]);

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-xl font-black uppercase tracking-tight">
                        {filteredContext ? 'Contextual Event Analysis' : 'Global Event Intelligence'}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                        {filteredContext ? 'Filtered view based on selected inventory segment' : 'Real-time analysis of network-wide alarms and anomalies'}
                    </p>
                </div>

                <div className="flex items-center gap-1 rounded-lg bg-muted/50 p-1 border border-border/50">
                    {(['3H', '24H', '7D'] as const).map((r) => (
                        <button
                            key={r}
                            onClick={() => setTimeRange(r)}
                            className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-md transition-all ${timeRange === r
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                                }`}
                        >
                            {r === '24H' ? 'Today' : r}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Cards (Shared) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {ticketStats.map((stat) => (
                    <div key={stat.name} className="rounded-xl border border-border bg-card p-4 flex items-center justify-between shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-muted" style={{ color: stat.color }}>
                                <stat.icon size={18} />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-muted-foreground">{stat.name}</p>
                                <span className="text-2xl font-black">{stat.value}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* CONDITIONAL LAYOUT */}
            {!filteredContext ? (
                // --- MAIN DASHBOARD LAYOUT (New Charts) ---
                <div className="space-y-6">
                    {/* Row 1: Time Series Analysis */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <EventsTrendLineChart data={events} timeRange={timeRange} />
                        <SeverityAreaChart data={events} timeRange={timeRange} />
                    </div>

                    {/* Row 2: Flow & Correlation Analysis */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <CausalFlowSankey data={events} />
                        <MultiDimParallelSankey data={events} />
                    </div>

                    {/* Row 3: Existing Probable Cause (Enhanced Context) */}
                    <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 shadow-sm">
                        <h3 className="text-sm font-black uppercase tracking-widest text-foreground mb-6 flex items-center gap-2">
                            <Activity size={16} className="text-primary" />
                            Probable Cause Distribution
                        </h3>
                        {probableCauses.length > 0 ? (
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={probableCauses} layout="vertical" margin={{ left: 40, right: 30, top: 10, bottom: 10 }}>
                                        <XAxis type="number" hide />
                                        <YAxis
                                            dataKey="label"
                                            type="category"
                                            width={180}
                                            tick={{ fontSize: 10, fontWeight: '700', fill: 'hsl(var(--foreground))' }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip cursor={{ fill: 'hsl(var(--primary)/2%)' }} contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderRadius: '12px', border: '1px solid hsl(var(--border))', fontSize: '11px' }} />
                                        <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={24}>
                                            {probableCauses.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground border border-dashed border-border/20 rounded-xl bg-muted/5">
                                <Info size={24} className="mb-2 opacity-20" />
                                <p className="text-xs font-medium">No correlation data matches keywords in this range</p>
                                <p className="text-[10px] opacity-60 mt-1">Keywords: Link, BGP, Hardware, Reachability, Config</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                // --- DRILL-DOWN LAYOUT (Preserved Existing) ---
                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-12 lg:col-span-8 space-y-6">
                        <div className="rounded-xl border border-border bg-card p-6 shadow-sm overflow-hidden">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-6">Probable Cause Distribution</h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={probableCauses} layout="vertical" margin={{ left: 40, right: 30 }}>
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="label" type="category" width={160} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{ fill: 'hsl(var(--primary)/5%)' }} contentStyle={{ backgroundColor: 'hsl(var(--popover))' }} />
                                        <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={24}>
                                            {probableCauses.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-6">Event Trends (Contextual)</h3>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={businessHoursData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                                        <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))' }} />
                                        <Line type="monotone" dataKey="events" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4 }} />
                                        <Line type="monotone" dataKey="critical" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ r: 3 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-12 lg:col-span-4 space-y-4">
                        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Top Impacted Devices</h3>
                            <div className="space-y-3">
                                {topImpactedNodes.map(([name, count], i) => (
                                    <div key={name} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 border border-border/50">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-muted-foreground w-4">{i + 1}</span>
                                            <span className="text-xs font-bold truncate max-w-[120px]">{name}</span>
                                        </div>
                                        <span className="text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded">{count} Events</span>
                                    </div>
                                ))}
                                {topImpactedNodes.length === 0 && (
                                    <p className="text-[10px] text-muted-foreground italic text-center py-4">No specific device impacts detected</p>
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-3">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Segment Affinity</h4>
                            <div className="space-y-2">
                                {impactedDomains.map(([name, count]) => (
                                    <div key={name} className="space-y-1">
                                        <div className="flex justify-between text-[10px]">
                                            <span className="font-bold">{name}</span>
                                            <span className="opacity-70">{Math.round((count / events.length) * 100) || 0}%</span>
                                        </div>
                                        <div className="h-1 w-full bg-primary/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary" style={{ width: `${(count / events.length) * 100}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

