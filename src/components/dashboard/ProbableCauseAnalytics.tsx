import React, { useMemo, useState } from 'react';
import { useInventoryStore } from '@/store/inventoryStore';
import {
    AlertTriangle,
    WifiOff,
    ShieldAlert,
    Activity,
    Zap,
    Network,
    Download,
    Lightbulb,
    Cpu,
    Search,
    Server,
    Globe,
    ShieldCheck,
    Wrench,
    Factory,
    Clock,
    Ticket,
    AlertCircle,
    ChevronLeft
} from 'lucide-react';
import {
    CartesianGrid,
    PieChart,
    Pie,
    LabelList,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Cell,
    LineChart,
    Line
} from 'recharts';

import {
    EventsTrendLineChart,
    SeverityAreaChart,
    CausalFlowSankey,
    MultiDimParallelSankey
} from './EventCharts';

export function ProbableCauseAnalytics({ filteredContext = false }: { filteredContext?: boolean }) {
    const { getFilteredEvents, allEvents, setSelectedModule } = useInventoryStore();
    const [timeRange, setTimeRange] = useState<'3H' | '24H' | '7D' | '30D' | 'ALL'>('ALL');

    // Choose data source and apply time filter
    const rawEvents = filteredContext ? getFilteredEvents() : allEvents;

    const events = useMemo(() => {
        if (timeRange === 'ALL') return rawEvents;

        const now = new Date();
        const cutoff = new Date(now);

        if (timeRange === '3H') cutoff.setHours(now.getHours() - 3);
        else if (timeRange === '24H') cutoff.setHours(now.getHours() - 24);
        else if (timeRange === '7D') cutoff.setDate(now.getDate() - 7);
        else if (timeRange === '30D') cutoff.setDate(now.getDate() - 30);

        return rawEvents.filter(e => {
            if (!e.startTime) return false;
            // Handle multiple date formats safely
            const eventDate = new Date(e.startTime);
            return !isNaN(eventDate.getTime()) && eventDate >= cutoff;
        });
    }, [rawEvents, timeRange]);

    // --- Existing Logic for KPIs and Bar Chart (Reused) ---
    const probableCauses = useMemo(() => {
        // Broadened keywords to catch more data
        const causes = [
            { id: 'control', label: 'SD-WAN Control Plane', count: 0, icon: ShieldAlert, color: 'hsl(280, 85%, 60%)', keywords: ['CONTROL', 'TLOC', 'OMP', 'CONNECTION'] },
            { id: 'reach', label: 'Reachability & SNMP', count: 0, icon: Globe, color: 'hsl(210, 100%, 50%)', keywords: ['PING', 'REACHABILITY', 'ICMP', 'SNMP', 'TIMEOUT', 'RESPONDING'] },
            { id: 'routing', label: 'Routing & Peering', count: 0, icon: Zap, color: 'hsl(38, 92%, 50%)', keywords: ['BGP', 'BFD', 'PEERING', 'NEIGHBOR', 'SESSIONS'] },
            { id: 'link', label: 'Link & Inteface', count: 0, icon: Network, color: 'hsl(160, 80%, 45%)', keywords: ['LINK DOWN', 'OPER-STATE', 'ADMIN-STATE', 'INTERFACE', 'PORT'] },
            { id: 'system', label: 'Compute & System', count: 0, icon: Cpu, color: 'hsl(12, 85%, 55%)', keywords: ['CPU', 'MEMORY', 'USAGE', 'LOAD', 'THRESHOLD', 'CERTIFICATE'] },
            { id: 'ops', label: 'Administrative/Ops', count: 0, icon: Server, color: 'hsl(215, 20%, 60%)', keywords: ['CLEARED', 'UPLOADED', 'SERIAL FILE', 'ALARM'] },
            { id: 'other', label: 'Other Anomalies', count: 0, icon: AlertTriangle, color: 'hsl(215, 15%, 65%)', keywords: [] }
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
        const now = new Date();

        return hours.map(h => {
            const [hourStr] = h.split(':');
            const targetHour = parseInt(hourStr, 10);

            const count = events.filter(e => {
                const d = new Date(e.startTime || '');
                return d.getHours() >= targetHour && d.getHours() < targetHour + 4;
            }).length;

            const critical = events.filter(e => {
                const d = new Date(e.startTime || '');
                return (d.getHours() >= targetHour && d.getHours() < targetHour + 4) &&
                    (e.severity === 'CRITICAL' || e.severity === 'MAJOR');
            }).length;

            return { name: h, events: count, critical };
        });
    }, [events]);

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

    // --- NEW ANALYTICAL DATASETS ---



    // 2. Ticket Maturity (SR Status)
    const ticketMaturityData = useMemo(() => {
        const counts: Record<string, number> = {};
        events.forEach(e => {
            const status = e.srStatus || 'No Ticket';
            counts[status] = (counts[status] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [events]);

    // 3. Operational Efficiency (Automation Ratio)
    const opsEfficiency = useMemo(() => {
        const grouped = events.filter(e => e.isGrouped?.toLowerCase().includes('yes')).length;
        const suppressed = events.filter(e => e.isSuppressed?.toLowerCase().includes('yes')).length;
        const total = events.length || 1;

        return [
            { label: 'Network Grouping', value: Math.round((grouped / total) * 100) },
            { label: 'Noise Reduction', value: Math.round((suppressed / total) * 100) },
        ];
    }, [events]);

    // 4. Vendor Reliability Scorecard
    const vendorReliability = useMemo(() => {
        const counts: Record<string, number> = {};
        events.forEach(e => {
            const vendor = e.vendor || 'Unknown';
            counts[vendor] = (counts[vendor] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 6);
    }, [events]);

    // 5. High-Level KPI overrides
    const tacticalKPIs = useMemo(() => {
        const premiumAtRisk = events.filter(e => (e.severity === 'CRITICAL' || e.severity === 'MAJOR') && e.isPremium?.toLowerCase().includes('yes')).length;
        const openTickets = events.filter(e => e.srStatus && !['Closed', 'Resolved'].includes(e.srStatus)).length;

        return [
            { name: 'NOC Silence', value: `${opsEfficiency[1].value}%`, icon: ShieldCheck, color: 'hsl(142, 69%, 58%)', sub: 'Suppression Rate' },
            { name: 'Active Tickets', value: openTickets, icon: Wrench, color: 'hsl(217, 91%, 60%)', sub: 'Pending MTTR' },
            { name: 'Network Vendors', value: vendorReliability.length, icon: Factory, color: 'hsl(262, 83%, 58%)', sub: 'Platform Context' },
        ];
    }, [events, opsEfficiency, vendorReliability]);

    // 6. Regional Impact Heatmap
    const regionalData = useMemo(() => {
        const counts: Record<string, number> = {};
        events.forEach(e => {
            const state = e.state || 'Unknown';
            counts[state] = (counts[state] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);
    }, [events]);

    // 7. Severity Distribution (Major, Critical, Minor)
    const severityDistribution = useMemo(() => {
        const counts = {
            CRITICAL: 0,
            MAJOR: 0,
            MINOR: 0,
        };
        events.forEach(e => {
            const sev = (e.severity || '').toUpperCase();
            if (sev.includes('CRIT')) counts.CRITICAL++;
            else if (sev.includes('MAJ')) counts.MAJOR++;
            else counts.MINOR++;
        });

        return [
            { name: 'Critical', value: counts.CRITICAL, color: 'rgb(239, 68, 68)' },
            { name: 'Major', value: counts.MAJOR, color: 'rgb(249, 115, 22)' },
            { name: 'Minor', value: counts.MINOR, color: 'rgb(59, 130, 246)' },
        ];
    }, [events]);

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <div className="flex items-center gap-3 mb-4">
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
                        {filteredContext ? 'Contextual Event Analysis' : 'Global Event Intelligence'}
                    </h2>
                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider opacity-60">
                        {filteredContext ? 'Segmented analysis of network-wide alarms' : 'Real-time analysis of network alarms & anomalies'}
                    </p>
                </div>

                <div className="h-[1px] flex-1 mx-4 bg-gradient-to-r from-border/50 to-transparent" />

                <div className="flex items-center gap-1 rounded-lg bg-muted/50 p-1 border border-border/50">
                    {(['3H', '24H', '7D', '30D', 'ALL'] as const).map((r) => (
                        <button
                            key={r}
                            onClick={() => setTimeRange(r)}
                            className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-md transition-all ${timeRange === r
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                                }`}
                        >
                            {r === '24H' ? 'Today' : r === 'ALL' ? 'Total' : r}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Cards (Tactical) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {tacticalKPIs.map((stat) => (
                    <div key={stat.name} className="group relative rounded-xl border border-border/50 bg-card/50 p-4 flex items-center justify-between shadow-sm hover:border-primary/20 transition-all overflow-hidden">
                        <div className="flex items-center gap-3 relative z-10">
                            <div className="p-2.5 rounded-xl bg-muted group-hover:bg-primary/5 transition-colors" style={{ color: stat.color }}>
                                <stat.icon size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-0.5">{stat.name}</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-black tabular-nums">{stat.value}</span>
                                    <span className="text-[9px] font-bold opacity-60 uppercase">{stat.sub}</span>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity rotate-12">
                            <stat.icon size={60} strokeWidth={3} />
                        </div>
                    </div>
                ))}
            </div>

            {/* CONDITIONAL LAYOUT */}
            {!filteredContext ? (
                <div className="space-y-6">
                    {/* Row 1: Tactical Reliability Analysis */}
                    <div className="grid grid-cols-12 gap-6">
                        {/* Vendor Reliability */}
                        <div className="col-span-12 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2">
                                    <Factory size={16} className="text-primary" />
                                    Vendor Reliability Scorecard
                                </h3>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Fault intensity by platform</p>
                            </div>
                            <div className="h-[280px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={vendorReliability} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
                                        <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: '700' }} axisLine={false} tickLine={false} />
                                        <YAxis hide />
                                        <Tooltip cursor={{ fill: 'hsl(var(--primary)/2%)' }} contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }} />
                                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} barSize={60}>
                                            <LabelList dataKey="count" position="top" style={{ fontSize: '10px', fontWeight: '900', fill: 'hsl(var(--foreground))' }} />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Event Trends & Severity Composition */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <EventsTrendLineChart data={events} timeRange={timeRange} />
                        <SeverityAreaChart data={events} timeRange={timeRange} />
                    </div>

                    {/* Row 2: Service & Resolution Matrix */}
                    <div className="grid grid-cols-12 gap-6">
                        {/* Ticket Maturity */}
                        <div className="col-span-12 lg:col-span-4 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 shadow-sm">
                            <h3 className="text-sm font-black uppercase tracking-widest text-foreground mb-6">Resolution Maturity</h3>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={ticketMaturityData}
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {ticketMaturityData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={`hsl(262, 80%, ${50 + index * 10}%)`} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderRadius: '12px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2 text-[8px]">
                                {ticketMaturityData.map((s, i) => (
                                    <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 border border-border/20">
                                        <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: `hsl(262, 80%, ${50 + i * 10}%)` }} />
                                        <span className="font-black uppercase">{s.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>


                    </div>

                    {/* Row 3: Regional Footprint & State Analysis */}
                    <div className="grid grid-cols-12 gap-6">
                        <div className="col-span-12 lg:col-span-6 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 shadow-sm">
                            <h3 className="text-sm font-black uppercase tracking-widest text-foreground mb-6">Regional Impact Footprint</h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={regionalData} layout="vertical" margin={{ left: 20, right: 30 }}>
                                        <XAxis type="number" hide />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            width={100}
                                            tick={{ fontSize: 10, fontWeight: '700' }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip cursor={{ fill: 'hsl(var(--primary)/5%)' }} contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderRadius: '12px' }} />
                                        <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={16}>
                                            <LabelList dataKey="value" position="right" style={{ fontSize: '10px', fontWeight: '900', fill: 'hsl(var(--foreground))' }} />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="col-span-12 lg:col-span-6 rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 shadow-sm overflow-hidden">
                            <h3 className="text-sm font-black uppercase tracking-widest text-foreground mb-6">Probable Cause Evolution</h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={probableCauses} layout="horizontal" margin={{ top: 20, bottom: 20 }}>
                                        <XAxis dataKey="label" tick={{ fontSize: 9, fontWeight: '700' }} axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" height={60} />
                                        <YAxis hide />
                                        <Tooltip cursor={{ fill: 'hsl(var(--primary)/2%)' }} contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderRadius: '12px' }} />
                                        <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={30}>
                                            {probableCauses.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                            <LabelList dataKey="count" position="top" style={{ fontSize: '10px', fontWeight: '900', fill: 'hsl(var(--foreground))' }} />
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
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

