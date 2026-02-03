import React, { useMemo, useState } from 'react';
import { useInventoryStore } from '@/store/inventoryStore';

import { SuppressionLogicTable } from './SuppressionLogicTable';
import { EventInterdependentPlots } from './EventInterdependentPlots';

import { EventHeatmapWidget } from './EventHeatmapWidget';
import { EventAnalyticalHeatmaps } from './EventAnalyticalHeatmaps';
import {
    Clock,
    Filter,
    Download,
    ChevronLeft,
    ChevronDown,
    Activity,
    Zap,
    Server,
    AlertOctagon,
    ArrowRight,
    Ticket,
    AlertCircle,
    Settings2,
    ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    AreaChart, Area, LineChart, Line, Legend, ComposedChart,
    ScatterChart, Scatter, ZAxis
} from 'recharts';
import { exportToCSV } from '@/utils/exportUtils';

// --- MOCK DATA ---

const LINK_DOWN_ISSUES = [
    { label: 'Reachability Issue', sub: '(Ping/SNMP failure)', value: 200, network: 140, app: 60, color: 'text-red-500', border: 'border-red-500/50', bg: 'bg-red-500/10' },
    { label: 'Device Unreachable', sub: '(CPE/router down, power...)', value: 90, network: 80, app: 10, color: 'text-orange-500', border: 'border-orange-500/50', bg: 'bg-orange-500/10' },
    { label: 'Interface Operational Down', sub: '(Port down, admin down...)', value: 50, network: 45, app: 5, color: 'text-yellow-500', border: 'border-yellow-500/50', bg: 'bg-yellow-500/10' },
    { label: 'Routing / Protocol Failure', sub: '(BGP peer down...)', value: 40, network: 35, app: 5, color: 'text-blue-500', border: 'border-blue-500/50', bg: 'bg-blue-500/10' },
    { label: 'Provider End Unreachable', sub: '(Provider PE / gateway...)', value: 70, network: 70, app: 0, color: 'text-purple-500', border: 'border-purple-500/50', bg: 'bg-purple-500/10' },
    { label: 'Physical / Last-Mile Failure', sub: '(Fiber cut, provider outage...)', value: 55, network: 55, app: 0, color: 'text-pink-500', border: 'border-pink-500/50', bg: 'bg-pink-500/10' },
];

const IMPACT_DATA = [
    {
        name: 'South', events: 324, links: 45, critical: 67, mttr: 18, color: '#06b6d4',
        cities: [
            { name: 'Bangalore', events: 156, links: 18, critical: 32 },
            { name: 'Chennai', events: 98, links: 15, critical: 21 },
            { name: 'Hyderabad', events: 70, links: 12, critical: 14 }
        ]
    },
    {
        name: 'North', events: 267, links: 38, critical: 52, mttr: 22, color: '#f59e0b',
        cities: [
            { name: 'Delhi', events: 134, links: 16, critical: 28 },
            { name: 'Noida', events: 78, links: 12, critical: 15 },
            { name: 'Gurgaon', events: 55, links: 10, critical: 9 }
        ]
    },
    {
        name: 'West', events: 198, links: 32, critical: 38, mttr: 15, color: '#22c55e',
        cities: [
            { name: 'Mumbai', events: 110, links: 14, critical: 20 },
            { name: 'Pune', events: 58, links: 10, critical: 12 },
            { name: 'Ahmedabad', events: 30, links: 8, critical: 6 }
        ]
    },
    {
        name: 'East', events: 128, links: 21, critical: 22, mttr: 25, color: '#a855f7',
        cities: [
            { name: 'Kolkata', events: 80, links: 12, critical: 14 },
            { name: 'Patna', events: 28, links: 5, critical: 5 },
            { name: 'Bhubaneswar', events: 20, links: 4, critical: 3 }
        ]
    },
];

const SUPPRESSION_DATA = [
    { name: 'Business Hours', value: 289, color: '#06b6d4' },
    { name: 'Reboot Pattern', value: 178, color: '#f59e0b' },
    { name: 'Maintenance Window', value: 134, color: '#10b981' },
    { name: 'Duplicate Alert', value: 45, color: '#8b5cf6' },
    { name: 'Transient Issue', value: 21, color: '#3b82f6' },
];

const TREND_DATA = [
    { month: 'Jan', total: 750, ticketed: 180, suppressed: 570 },
    { month: 'Feb', total: 820, ticketed: 210, suppressed: 610 },
    { month: 'Mar', total: 690, ticketed: 190, suppressed: 500 },
    { month: 'Apr', total: 917, ticketed: 250, suppressed: 667 },
    { month: 'May', total: 850, ticketed: 220, suppressed: 630 },
    { month: 'Jun', total: 940, ticketed: 260, suppressed: 680 },
];

const CUSTOMER_DATA = [
    { name: 'DABUR INDIA LIMITED', value: 145, color: '#0ea5e9' },
    { name: 'Dept of Income Tax', value: 120, color: '#f59e0b' },
    { name: 'Hatsun Agro Products', value: 95, color: '#22c55e' },
    { name: 'KPMG', value: 78, color: '#a855f7' },
    { name: 'Paayas Milk Producer', value: 65, color: '#3b82f6' },
];






export function EventsDashboard() {
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
    const [impactView, setImpactView] = useState<'overview' | 'correlation' | 'performance'>('overview');
    const [layerFilter, setLayerFilter] = useState({ network: true, application: true });

    // Global Event Filters from Store
    const { eventSeverities, eventType, showSuppressed } = useInventoryStore();

    const handleExport = (data: any[], filename: string) => {
        exportToCSV(data, filename);
    };

    // Helper to generate mock export data based on category and active filters
    const handleCardExport = (item: typeof LINK_DOWN_ISSUES[0]) => {
        const rows = [];

        // 1. Generate Network Logs if Filter is ON
        if (layerFilter.network) {
            for (let i = 0; i < item.network; i++) {
                rows.push({
                    EventID: `EVT-NET-${1000 + i}`,
                    Timestamp: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString(),
                    Category: item.label,
                    SubCategory: item.sub,
                    Layer: 'Network',
                    Device: `Router-Core-${Math.floor(Math.random() * 50)}`,
                    Status: 'Active',
                    Severity: 'Critical'
                });
            }
        }

        // 2. Generate Application Logs if Filter is ON
        if (layerFilter.application) {
            for (let i = 0; i < item.app; i++) {
                rows.push({
                    EventID: `EVT-APP-${5000 + i}`,
                    Timestamp: new Date(Date.now() - Math.floor(Math.random() * 86400000)).toISOString(),
                    Category: item.label,
                    SubCategory: item.sub,
                    Layer: 'Application',
                    AppService: `Service-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
                    Status: 'Warning',
                    Severity: 'Major'
                });
            }
        }

        exportToCSV(rows, `${item.label.replace(/\s+/g, '_')}_Detailed_Report`);
    };

    // Calculate Dynamic Grid Data based on Toggles
    const dynamicLinkDownIssues = useMemo(() => {
        return LINK_DOWN_ISSUES.map(item => {
            let val = 0;
            if (layerFilter.network) val += item.network;
            if (layerFilter.application) val += item.app;
            return { ...item, value: val };
        });
    }, [layerFilter]);

    return (
        <div className="flex flex-col h-full bg-background animate-in fade-in duration-500">
            {/* Top Bar */}
            <div className="flex-shrink-0 h-14 border-b border-border/50 bg-card px-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => useInventoryStore.getState().setSelectedModule('unified')}
                        className="p-1 rounded-lg hover:bg-primary/10 text-primary transition-all"
                        title="Back to Overview"
                    >
                        <ChevronLeft size={20} strokeWidth={2.5} />
                    </button>
                    <div className="h-5 w-1 bg-primary rounded-full shadow-[0_0_8px_rgba(0,165,142,0.4)]" />
                    <h1 className="text-lg font-black uppercase tracking-[0.15em] text-foreground/90">
                        Event Analytics
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    {/* Layer Toggles */}
                    <div className="flex items-center bg-muted/20 rounded-lg p-1 border border-border/50">
                        <button
                            onClick={() => setLayerFilter(prev => ({ ...prev, network: !prev.network }))}
                            className={cn(
                                "px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all flex items-center gap-1.5",
                                layerFilter.network ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Server size={10} /> Network
                        </button>
                        <button
                            onClick={() => setLayerFilter(prev => ({ ...prev, application: !prev.application }))}
                            className={cn(
                                "px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all flex items-center gap-1.5",
                                layerFilter.application ? "bg-purple-500 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Activity size={10} /> Application
                        </button>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/20 rounded-md border border-border/50">
                        <Clock size={14} className="text-muted-foreground" />
                        <span className="text-xs font-medium">Last 24 Hours</span>
                        <ChevronDown size={12} className="text-muted-foreground ml-2" />
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/20 rounded-md border border-border/50 cursor-pointer">
                        <span className="text-xs font-medium">Business Hours</span>
                        <div className="w-8 h-4 bg-primary/20 rounded-full relative">
                            <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-primary rounded-full shadow-sm" />
                        </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                        JD
                    </div>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden relative">


                <main className="flex-1 overflow-y-auto p-6 space-y-6 bg-muted/5 pb-20 relative">


                    {/* Top KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="rounded-xl border border-border/50 bg-card p-4 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><Activity size={40} /></div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total Events</p>
                            <p className="text-3xl font-black mt-1">917</p>
                            <p className="text-[10px] text-emerald-500 font-bold mt-2">↑ 195 vs 24 hrs ago</p>
                        </div>
                        <div className="rounded-xl border border-border/50 bg-card p-4 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><Filter size={40} /></div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Suppression Rate</p>
                            <p className="text-3xl font-black mt-1">73%</p>
                            <p className="text-[10px] text-muted-foreground mt-2">667/917 EVENTS SUPPRESSED</p>
                        </div>
                        <div className="rounded-xl border border-border/50 bg-card p-4 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><Clock size={40} /></div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Business Hr Compliance</p>
                            <p className="text-3xl font-black mt-1">81%</p>
                            <p className="text-[10px] text-destructive font-bold mt-2">4297 TICKETS OUT OF BH</p>
                        </div>
                        <div className="rounded-xl border border-border/50 bg-card p-4 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><Zap size={40} /></div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">MTTR</p>
                            <p className="text-3xl font-black mt-1">21 <span className="text-sm font-medium text-muted-foreground">min</span></p>
                            <p className="text-[10px] text-emerald-500 font-bold mt-2">↓ 0.2% vs 30 Days</p>
                        </div>
                        <div className="rounded-xl border border-border/50 bg-card p-4 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity"><AlertOctagon size={40} /></div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Critical Events</p>
                            <p className="text-3xl font-black mt-1 text-destructive">179</p>
                            <p className="text-[10px] text-muted-foreground mt-2">Requires Immediate Action</p>
                        </div>
                    </div>

                    {/* Link Down Issues Grid (Compacted) */}
                    <div className="rounded-xl border border-border/50 bg-card p-3 shadow-sm mb-3">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                <Server size={14} className="text-primary" />
                                Link Down Issues Breakdown
                            </h3>
                            <div className="text-[10px] text-muted-foreground italic mr-2 border-l border-border pl-2">
                                Click cloud icon on cards to export filtered details
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                            {dynamicLinkDownIssues.map((item, idx) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        "p-2 rounded-lg border flex flex-col items-center justify-center text-center transition-all hover:scale-102 cursor-default min-h-[80px] relative group",
                                        item.border,
                                        item.bg
                                    )}
                                >
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleCardExport(item);
                                        }}
                                        className="absolute top-1 right-1 p-1 rounded-full bg-background/50 hover:bg-background text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                                        title={`Export ${item.label} Data`}
                                    >
                                        <Download size={10} />
                                    </button>

                                    <p className={cn("text-xl font-black", item.color)}>{item.value}</p>
                                    <p className="text-[10px] font-bold text-foreground leading-tight px-1">{item.label}</p>
                                    <p className="text-[9px] text-muted-foreground opacity-80">{item.sub}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Interdependent Event Analysis Plots */}
                    <EventInterdependentPlots />


                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Event Distribution Widget (Full Width) */}


                        {/* Event Heatmap Widget (Also Full Width - User Requested "Assume as a widget") */}
                        <div className="col-span-12">
                            <EventHeatmapWidget />
                        </div>

                        {/* Advanced Analytical Heatmaps (Aging & Closures) */}
                        <div className="col-span-12">
                            <EventAnalyticalHeatmaps />
                        </div>

                        {/* Lifecycle Flow - Corporate Redesign V2 */}
                        <div className="col-span-12 rounded-xl border border-border/50 bg-card/50 shadow-sm flex flex-col h-full overflow-hidden">
                            {/* Header */}
                            <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between bg-card">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                    Events Lifecycle
                                </h3>
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        73% Suppressed
                                    </span>
                                    <button
                                        onClick={() => handleExport([
                                            { Stage: 'Total Alarms', Count: 917 },
                                            { Stage: 'Suppressed', Count: 667 },
                                            { Stage: 'Actionable', Count: 250 },
                                            { Stage: 'Ticketed', Count: 179 },
                                            { Stage: 'Wrong SR', Count: 217 },
                                            { Stage: 'Mail Triggered', Count: 71 }
                                        ], 'Lifecycle_Flow')}
                                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-all"
                                        title="Export CSV"
                                    >
                                        <Download size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Flow Diagram - Scrollable */}
                            <div className="flex-1 overflow-x-auto p-6 bg-gradient-to-br from-card to-background/50">
                                <div className="flex items-center min-w-[800px] gap-4">

                                    {/* Step 1: Total */}
                                    <div className="w-32 h-24 rounded-lg border border-sky-500/50 bg-sky-500/5 flex flex-col items-center justify-center p-2 relative shadow-[0_0_15px_rgba(14,165,233,0.1)]">
                                        <span className="text-3xl font-black text-sky-500">917</span>
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Total Alarms</span>
                                    </div>

                                    <ArrowRight className="text-muted-foreground/30 shrink-0" />

                                    {/* Step 2: Split */}
                                    <div className="flex flex-col gap-4">
                                        {/* Suppressed */}
                                        <div className="w-48 p-3 rounded-lg border border-emerald-500/50 bg-emerald-500/5 relative group hover:bg-emerald-500/10 transition-colors">
                                            <div className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-card border border-emerald-500 text-emerald-500"><Activity size={10} /></div>
                                            <div className="text-center">
                                                <span className="text-2xl font-black text-emerald-500">667</span>
                                                <p className="text-[10px] font-bold text-emerald-500/80 uppercase mb-2">Suppressed/Grouped</p>
                                                <div className="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden mb-1">
                                                    <div className="h-full bg-emerald-500 w-[72.7%] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                                </div>
                                                <p className="text-[9px] font-bold text-emerald-500 text-right">72.7%</p>
                                            </div>
                                        </div>
                                        {/* Actionable */}
                                        <div className="w-48 p-3 rounded-lg border border-amber-500/50 bg-amber-500/5 relative group hover:bg-amber-500/10 transition-colors">
                                            <div className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-card border border-amber-500 text-amber-500"><Zap size={10} /></div>
                                            <div className="text-center">
                                                <span className="text-2xl font-black text-amber-500">250</span>
                                                <p className="text-[10px] font-bold text-amber-500/80 uppercase mb-2">Actionable Alarms</p>
                                                <div className="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden mb-1">
                                                    <div className="h-full bg-amber-500 w-[27.3%] rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                                                </div>
                                                <p className="text-[9px] font-bold text-amber-500 text-right">27.3%</p>
                                            </div>
                                        </div>
                                    </div>

                                    <ArrowRight className="text-muted-foreground/30 shrink-0" />

                                    {/* Step 3: Tickets & Wrong */}
                                    <div className="flex flex-col gap-4">
                                        {/* Ticketed */}
                                        <div className="w-48 p-3 rounded-lg border border-cyan-500/50 bg-cyan-500/5 relative group hover:bg-cyan-500/10 transition-colors">
                                            <div className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-card border border-cyan-500 text-cyan-500"><Ticket size={10} /></div>
                                            <div className="text-center">
                                                <span className="text-2xl font-black text-cyan-500">179</span>
                                                <p className="text-[10px] font-bold text-cyan-500/80 uppercase mb-2">Ticket Created (SR)</p>
                                                <div className="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden mb-1">
                                                    <div className="h-full bg-cyan-500 w-[71.6%] rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]"></div>
                                                </div>
                                                <p className="text-[9px] font-bold text-cyan-500 text-right">71.6%</p>
                                            </div>

                                            {/* Arrow to next step (absolute positioned visual hack for clean flow) */}
                                            <div className="absolute -right-6 top-1/2 -translate-y-1/2 text-muted-foreground/30"><ArrowRight size={16} /></div>
                                        </div>

                                        {/* Wrong SR */}
                                        <div className="w-48 p-3 rounded-lg border border-red-500/50 bg-red-500/5 relative group hover:bg-red-500/10 transition-colors">
                                            <div className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-card border border-red-500 text-red-500"><AlertCircle size={10} /></div>
                                            <div className="text-center">
                                                <span className="text-2xl font-black text-red-500">217</span>
                                                <p className="text-[10px] font-bold text-red-500/80 uppercase mb-1">Wrong SR</p>
                                                <p className="text-[9px] text-muted-foreground">Invalid/Duplicate</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-6"></div> {/* Spacer for the absolute arrow above */}

                                    {/* Step 4: Mail */}
                                    <div className="w-36 h-24 rounded-lg border border-slate-500/50 bg-slate-500/5 flex flex-col items-center justify-center p-2 relative">
                                        <div className="absolute -top-1.5 -right-1.5 p-1 rounded-full bg-card border border-slate-500 text-slate-500"><Server size={10} /></div>
                                        <span className="text-2xl font-black text-slate-400">71</span>
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase mt-1 text-center">Mail Triggered</span>
                                    </div>

                                    <ArrowRight className="text-muted-foreground/30 shrink-0" />

                                    {/* Step 5: Final Status */}
                                    <div className="flex flex-col gap-4">
                                        <div className="w-36 p-2 rounded-lg border border-orange-500/50 bg-orange-500/5 flex flex-col items-center justify-center">
                                            <span className="text-xl font-black text-orange-500">238</span>
                                            <span className="text-[9px] font-bold text-orange-500/80 uppercase">Timed Out</span>
                                        </div>
                                        <div className="w-36 p-2 rounded-lg border border-sky-500/50 bg-sky-500/5 flex flex-col items-center justify-center">
                                            <span className="text-xl font-black text-sky-500">802</span>
                                            <span className="text-[9px] font-bold text-sky-500/80 uppercase">In Progress</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Stats */}
                            <div className="grid grid-cols-4 divide-x divide-border/30 border-t border-border/50 bg-card/50">
                                <div className="p-3 text-center">
                                    <p className="text-xl font-black text-emerald-500">73%</p>
                                    <p className="text-[9px] text-muted-foreground font-bold uppercase mt-1">Suppression Rate</p>
                                </div>
                                <div className="p-3 text-center">
                                    <p className="text-xl font-black text-cyan-500">72%</p>
                                    <p className="text-[9px] text-muted-foreground font-bold uppercase mt-1">Ticket Creation Rate</p>
                                </div>
                                <div className="p-3 text-center">
                                    <p className="text-xl font-black text-amber-500">87%</p>
                                    <p className="text-[9px] text-muted-foreground font-bold uppercase mt-1">Wrong SR Rate</p>
                                </div>
                                <div className="p-3 text-center">
                                    <p className="text-xl font-black text-sky-500">71</p>
                                    <p className="text-[9px] text-muted-foreground font-bold uppercase mt-1">Mails Sent</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Impact Intelligence Advanced Widget */}
                        <div className="col-span-12 lg:col-span-8 rounded-xl border border-border/50 bg-card p-0 shadow-sm overflow-hidden flex flex-col">
                            {/* Header */}
                            <div className="p-4 border-b border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/5">
                                <div className="flex items-center gap-4">
                                    {selectedRegion ? (
                                        <button onClick={() => setSelectedRegion(null)} className="p-1 hover:bg-muted rounded-full transition-colors">
                                            <ChevronLeft size={20} />
                                        </button>
                                    ) : null}
                                    <div className="space-y-0.5">
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                            Impact Intelligence
                                        </h3>
                                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                            <span>Events vs Links vs Regions</span>
                                            {selectedRegion && <span className="font-bold text-primary"> &gt; {selectedRegion}</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex gap-2">
                                        <div className="flex flex-col items-center px-3 py-1 bg-sky-500/10 border border-sky-500/20 rounded-lg">
                                            <span className="text-sm font-black text-sky-500">917</span>
                                            <span className="text-[8px] uppercase font-bold text-sky-500 opacity-80">Events</span>
                                        </div>
                                        <div className="flex flex-col items-center px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                            <span className="text-sm font-black text-emerald-500">136</span>
                                            <span className="text-[8px] uppercase font-bold text-emerald-500 opacity-80">Links</span>
                                        </div>
                                        <div className="flex flex-col items-center px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-lg">
                                            <span className="text-sm font-black text-red-500">179</span>
                                            <span className="text-[8px] uppercase font-bold text-red-500 opacity-80">Critical</span>
                                        </div>
                                    </div>
                                    <div className="w-px h-8 bg-border/50 mx-1 mobile-hidden" />
                                    <div className="flex bg-muted rounded-lg p-1">
                                        {(['overview', 'correlation', 'performance'] as const).map(view => (
                                            <button
                                                key={view}
                                                onClick={() => setImpactView(view)}
                                                className={cn(
                                                    "px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all flex items-center gap-1.5",
                                                    impactView === view ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                                                )}
                                            >
                                                {view === 'overview' && <Activity size={12} />}
                                                {view === 'correlation' && <AlertOctagon size={12} />}
                                                {view === 'performance' && <Zap size={12} />}
                                                <span className="hidden sm:inline">{view}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Main Chart Area */}
                            <div className="h-[320px] w-full p-4 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    {impactView === 'correlation' ? (
                                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                                            <XAxis type="number" dataKey="links" name="Links" label={{ value: 'Number of Links', position: 'bottom', offset: 0, fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tick={{ fontSize: 10 }} />
                                            <YAxis type="number" dataKey="events" name="Events" label={{ value: 'Number of Events', angle: -90, position: 'left', offset: 0, fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} tick={{ fontSize: 10 }} />
                                            <ZAxis type="number" dataKey="critical" range={[100, 400]} name="Critical Events" />
                                            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <div className="bg-popover border border-border rounded-lg shadow-xl p-3 text-xs">
                                                            <p className="font-bold mb-1" style={{ color: data.color }}>{data.name || data.city}</p>
                                                            <p>Events: <span className="font-bold">{data.events}</span></p>
                                                            <p>Links: <span className="font-bold">{data.links}</span></p>
                                                            <p>Critical: <span className="font-bold text-red-500">{data.critical}</span></p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }} />
                                            <Legend />
                                            {IMPACT_DATA.map((region) => (
                                                <Scatter key={region.name} name={region.name} data={region.cities || [region]} fill={region.color} />
                                            ))}
                                        </ScatterChart>
                                    ) : impactView === 'performance' ? (
                                        <BarChart
                                            layout="vertical"
                                            data={selectedRegion ? IMPACT_DATA.find(r => r.name === selectedRegion)?.cities : IMPACT_DATA}
                                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} stroke="hsl(var(--border))" opacity={0.3} />
                                            <XAxis type="number" tick={{ fontSize: 10 }} />
                                            <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fontWeight: 700 }} width={80} />
                                            <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                                            <Legend />
                                            <Bar dataKey="events" name="Events" radius={[0, 4, 4, 0]} barSize={20}>
                                                {IMPACT_DATA.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={selectedRegion ? IMPACT_DATA.find(r => r.name === selectedRegion)?.color : entry.color} />
                                                ))}
                                            </Bar>
                                            <Bar dataKey="mttr" name="Avg Resolution (min)" fill="#818cf8" radius={[0, 4, 4, 0]} barSize={20} />
                                        </BarChart>
                                    ) : (
                                        <ComposedChart
                                            data={selectedRegion ? IMPACT_DATA.find(r => r.name === selectedRegion)?.cities : IMPACT_DATA}
                                            margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                                            onClick={(e) => {
                                                if (e && e.activePayload && !selectedRegion) {
                                                    setSelectedRegion(e.activePayload[0].payload.name);
                                                }
                                            }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                                            <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                            <YAxis yAxisId="left" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                            <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                                            {!selectedRegion && <text x="50%" y="10" textAnchor="middle" fill="#666" fontSize="10">Click on a region bar to drill down</text>}
                                            <Legend iconType="circle" />
                                            <Bar yAxisId="left" dataKey="events" name="Total Events" radius={[4, 4, 0, 0]} barSize={40} cursor="pointer">
                                                {(selectedRegion ? IMPACT_DATA.find(r => r.name === selectedRegion)?.cities : IMPACT_DATA)?.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={selectedRegion ? (IMPACT_DATA.find(r => r.name === selectedRegion)?.color) : entry.color} opacity={0.9} />
                                                ))}
                                            </Bar>
                                            <Bar yAxisId="left" dataKey="critical" name="Critical Events" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} />
                                            <Line yAxisId="right" type="monotone" dataKey="links" name="Active Links" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                                        </ComposedChart>
                                    )}
                                </ResponsiveContainer>
                            </div>

                            {/* Footer Cards - Drill Down Selectors */}
                            <div className="grid grid-cols-4 border-t border-border/50 divide-x divide-border/50 bg-muted/5">
                                {IMPACT_DATA.map((region) => (
                                    <button
                                        key={region.name}
                                        onClick={() => setSelectedRegion(selectedRegion === region.name ? null : region.name)}
                                        className={cn(
                                            "p-3 text-left transition-all hover:bg-muted/50 group relative overflow-hidden",
                                            selectedRegion === region.name ? "bg-muted shadow-inner" : ""
                                        )}
                                    >
                                        {selectedRegion === region.name && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: region.color }}></div>
                                            <span className={cn("text-xs font-bold", selectedRegion === region.name ? "text-foreground" : "text-muted-foreground")}>{region.name}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-y-2 gap-x-1">
                                            <div>
                                                <p className="text-[10px] text-muted-foreground uppercase">Events</p>
                                                <p className="text-sm font-black">{region.events}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-muted-foreground uppercase">Links</p>
                                                <p className="text-sm font-bold text-emerald-500">{region.links}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-muted-foreground uppercase">Critical</p>
                                                <p className="text-sm font-bold text-destructive">{region.critical}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-muted-foreground uppercase">Avg MTTR</p>
                                                <p className="text-sm font-bold text-sky-500">{region.mttr}m</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Suppression Reasons */}
                        <div className="col-span-12 lg:col-span-4 rounded-xl border border-border/50 bg-card p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Suppression Reasons</h3>
                                <button onClick={() => handleExport(SUPPRESSION_DATA, 'Suppression_Reasons')} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-all" title="Export CSV">
                                    <Download size={14} />
                                </button>
                            </div>
                            <div className="h-[200px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={SUPPRESSION_DATA}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {SUPPRESSION_DATA.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-3 mt-4">
                                {SUPPRESSION_DATA.slice(0, 3).map((item) => (
                                    <div key={item.name} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="text-muted-foreground font-medium">{item.name}</span>
                                        </div>
                                        <span className="font-bold">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Trend Chart */}
                        <div className="col-span-12 lg:col-span-7 rounded-xl border border-border/50 bg-card p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Events Trend: Ticketed vs Suppressed</h3>
                                <button onClick={() => handleExport(TREND_DATA, 'Events_Trend')} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-all" title="Export CSV">
                                    <Download size={14} />
                                </button>
                            </div>
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={TREND_DATA}>
                                        <defs>
                                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                                        <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                                        <Area type="monotone" dataKey="total" stackId="1" stroke="#0ea5e9" fill="url(#colorTotal)" />
                                        <Area type="monotone" dataKey="suppressed" stackId="2" stroke="#f59e0b" fill="none" strokeWidth={2} />
                                        <Area type="monotone" dataKey="ticketed" stackId="3" stroke="#10b981" fill="none" strokeWidth={2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Events by Customer */}
                        <div className="col-span-12 lg:col-span-5 rounded-xl border border-border/50 bg-card p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Events by Customer</h3>
                                <button onClick={() => handleExport(CUSTOMER_DATA, 'Events_By_Customer')} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-all" title="Export CSV">
                                    <Download size={14} />
                                </button>
                            </div>
                            <div className="space-y-4">
                                {CUSTOMER_DATA.map((item) => (
                                    <div key={item.name} className="space-y-1">
                                        <div className="flex justify-between text-xs font-bold">
                                            <span>{item.name}</span>
                                            <span>{item.value}</span>
                                        </div>
                                        <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-1000"
                                                style={{ width: `${(item.value / 160) * 100}%`, backgroundColor: item.color }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Operational Table - Enhanced Design */}

                </main>
            </div>
        </div>
    );
}
