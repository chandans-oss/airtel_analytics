import React, { useMemo, useState } from 'react';
import { useInventoryStore } from '@/store/inventoryStore';
import {
    Activity,
    Server,
    Download,
    Cpu,
    Zap,
    Network,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    ChevronLeft,
    TrendingUp,
    TrendingDown,
    Clock,
    Calendar,
    BarChart3,
    ShieldAlert,
    Gauge,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    Filter,
    Layers,
    Shuffle,
    History,
    ZapOff,
    MonitorPlay,
    Timer,
    Info,
    MousePointer2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
    Cell, CartesianGrid, Legend, PieChart, Pie, LabelList,
    AreaChart, Area, LineChart, Line, ScatterChart, Scatter, ZAxis, ReferenceLine
} from 'recharts';
import { exportToCSV } from '@/utils/exportUtils';

// --- ADVANCED MOCK DATA GENERATOR ---

const generateMockLinks = (count: number) => {
    const regions = ['North', 'South', 'East', 'West'];
    const tiers = ['Gold', 'Silver', 'Bronze'];
    const serviceTypes = ['MPLS', 'Internet', 'P2P'];
    const customers = ['HDFC Bank', 'Infosys', 'Wipro', 'TCS', 'Axis Bank', 'Flipkart'];

    return Array.from({ length: count }).map((_, i) => {
        const id = `LNK-${1000 + i}`;
        const region = regions[Math.floor(Math.random() * regions.length)];
        const tier = tiers[Math.floor(Math.random() * tiers.length)];
        const service = serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
        const customer = customers[Math.floor(Math.random() * customers.length)];

        // Utilization Profile
        let utilBase = Math.random() * 100;
        if (i < count * 0.15) utilBase = 85 + Math.random() * 14; // Critical/High
        else if (i < count * 0.3) utilBase = 60 + Math.random() * 20; // Mid
        else if (i > count * 0.85) utilBase = Math.random() * 10; // Low

        const currentUtil = Math.min(99.9, Math.max(0.5, utilBase));

        // Trend Analysis
        const trend = Math.random() > 0.65 ? (Math.random() > 0.5 ? 'Rising' : 'Declining') : 'Stable';
        const momGrowth = trend === 'Rising' ? Math.floor(Math.random() * 18 + 5) :
            trend === 'Declining' ? -Math.floor(Math.random() * 12) : Math.floor(Math.random() * 6 - 3);

        // Sustained utilization (Last 7/14/30 days)
        const sustained70 = currentUtil > 70 && Math.random() > 0.3;
        const chronicUnderUtil = currentUtil < 10 && Math.random() > 0.4;

        // Peak vs Avg
        const isBursty = Math.random() > 0.7;
        const avgUtil = currentUtil;
        const peakUtil = Math.min(100, isBursty ? (avgUtil * (1.5 + Math.random())) : (avgUtil * (1.1 + Math.random() * 0.2)));
        const peakToAvgRatio = peakUtil / avgUtil;

        // Business vs Non-Business
        const businessUtil = Math.min(100, currentUtil * (1.1 + Math.random() * 0.2));
        const nonBusinessUtil = currentUtil * (0.3 + Math.random() * 0.2);

        // Forecasting (Days to breach)
        const daysTo70 = currentUtil < 70 && trend === 'Rising' ? Math.floor((70 - currentUtil) / (momGrowth / 30)) : 0;
        const daysTo80 = currentUtil < 80 && trend === 'Rising' ? Math.floor((80 - currentUtil) / (momGrowth / 30)) : 0;
        const daysTo90 = currentUtil < 90 && trend === 'Rising' ? Math.floor((90 - currentUtil) / (momGrowth / 30)) : 0;

        // Stability Score
        const variance = isBursty ? 25 + Math.random() * 30 : 5 + Math.random() * 10;
        const stabilityScoreValue = 100 - (variance / 0.6) - (trend === 'Rising' ? 10 : 0);
        const stabilityStr = stabilityScoreValue > 80 ? 'High' : stabilityScoreValue > 50 ? 'Medium' : 'Low';

        // Errors & Performance
        const packetLoss = currentUtil > 85 ? (currentUtil - 80) * 0.8 + Math.random() : (currentUtil > 70 ? Math.random() * 0.5 : 0);
        const latency = 15 + (currentUtil > 70 ? (currentUtil - 60) * 2.5 : 0) + (isBursty ? 20 : 0);

        // Redundancy
        const backupUtil = Math.random() * 40;
        const projectedFailoverUtil = Math.min(120, currentUtil + backupUtil); // Can exceed 100% in simulation

        // Composite Efficiency Score
        const overprovisionPenalty = currentUtil < 5 ? 40 : (currentUtil < 15 ? 20 : 0);
        const efficiencyScore = Math.floor((currentUtil * 0.6) + (stabilityScoreValue * 0.4) - overprovisionPenalty);

        return {
            id,
            name: `${region}-Aggregation-${i}`,
            region,
            tier,
            service,
            customer,
            currentUtil: Number(currentUtil.toFixed(1)),
            avgUtil: Number(avgUtil.toFixed(1)),
            peakUtil: Number(peakUtil.toFixed(1)),
            peakToAvgRatio: Number(peakToAvgRatio.toFixed(2)),
            trend,
            momGrowth,
            sustained70,
            chronicUnderUtil,
            businessUtil: Number(businessUtil.toFixed(1)),
            nonBusinessUtil: Number(nonBusinessUtil.toFixed(1)),
            daysTo70: daysTo70 || (currentUtil >= 70 ? 1 : 999),
            daysTo80: daysTo80 || (currentUtil >= 80 ? 1 : 999),
            daysTo90: daysTo90 || (currentUtil >= 90 ? 1 : 999),
            stabilityScore: stabilityStr,
            stabilityValue: Math.max(0, Math.floor(stabilityScoreValue)),
            packetLoss: Number(packetLoss.toFixed(2)),
            latency: Math.floor(latency),
            backupUtil: Number(backupUtil.toFixed(1)),
            failoverLoad: Number(projectedFailoverUtil.toFixed(1)),
            efficiencyScore: Math.min(100, Math.max(0, efficiencyScore))
        };
    });
};

const LINKS_DATA = generateMockLinks(150);

export function PerformanceDashboard() {
    const { setSelectedModule } = useInventoryStore();
    const [selectedView, setSelectedView] = useState<'OVERVIEW' | 'PLANNING' | 'OPTIMIZATION'>('OVERVIEW');
    const [filter, setFilter] = useState('All');

    // --- DERIVED ANALYTICS ---

    // 1. Utilization Buckets
    const buckets = useMemo(() => ({
        critical: LINKS_DATA.filter(l => l.currentUtil >= 90),
        high: LINKS_DATA.filter(l => l.currentUtil >= 70 && l.currentUtil < 90),
        medium: LINKS_DATA.filter(l => l.currentUtil >= 50 && l.currentUtil < 70),
        low5: LINKS_DATA.filter(l => l.currentUtil < 5),
        low10: LINKS_DATA.filter(l => l.currentUtil >= 5 && l.currentUtil < 10),
    }), []);

    // 2. Planning Metrics
    const planningStats = useMemo(() => ({
        sustained70: LINKS_DATA.filter(l => l.sustained70).length,
        growth10: LINKS_DATA.filter(l => l.momGrowth > 10).length,
        breach15Days: LINKS_DATA.filter(l => l.daysTo80 > 1 && l.daysTo80 <= 15).length,
        redundancyAtRisk: LINKS_DATA.filter(l => l.failoverLoad > 95).length
    }), []);

    // 3. Optimization Metrics
    const optimizationStats = useMemo(() => ({
        zombieLinks: buckets.low5.length,
        chronicUnderUtil: buckets.low10.length,
        overprovisioned: LINKS_DATA.filter(l => l.efficiencyScore < 30).length
    }), []);

    // 4. Forecast Summary
    const forecastGraphData = useMemo(() => {
        return LINKS_DATA
            .filter(l => l.daysTo80 < 90 && l.daysTo80 > 1)
            .sort((a, b) => a.daysTo80 - b.daysTo80)
            .slice(0, 10)
            .map(l => ({
                name: l.name,
                current: l.currentUtil,
                days: l.daysTo80,
                growth: l.momGrowth,
                fullData: l
            }));
    }, []);

    // 5. Pattern Matrix (Biz vs Non-Biz)
    const bizComparison = useMemo(() => {
        const avgBiz = Math.round(LINKS_DATA.reduce((acc, l) => acc + l.businessUtil, 0) / LINKS_DATA.length);
        const avgNonBiz = Math.round(LINKS_DATA.reduce((acc, l) => acc + l.nonBusinessUtil, 0) / LINKS_DATA.length);
        return [
            { name: 'Business Hours (09-18)', value: avgBiz, fill: '#3b82f6' },
            { name: 'Off-Hours', value: avgNonBiz, fill: '#94a3b8' }
        ];
    }, []);

    const filteredLinks = useMemo(() => {
        if (filter === 'All') return LINKS_DATA;
        if (filter === 'Critical') return buckets.critical;
        if (filter === 'High') return buckets.high;
        if (filter === 'Medium') return buckets.medium;
        if (filter === 'Zombie') return buckets.low5;
        if (filter === 'Underutilized') return buckets.low10;
        return LINKS_DATA;
    }, [filter, buckets]);

    const getRecommendation = (link: any) => {
        if (link.currentUtil >= 90 || (link.currentUtil > 75 && link.trend === 'Rising')) return { label: '🔴 UPGRADE REQUIRED', color: 'text-red-600 bg-red-100 border-red-200' };
        if (link.currentUtil >= 70) return { label: '🟠 MONITOR CLOSELY', color: 'text-amber-600 bg-amber-100 border-amber-200' };
        if (link.currentUtil < 10) return { label: '🟢 CANDIDATE FOR DOWNGRADE', color: 'text-emerald-600 bg-emerald-100 border-emerald-200' };
        if (link.peakToAvgRatio > 2.0) return { label: '🟡 OPTIMIZE TRAFFIC (BURSTY)', color: 'text-blue-600 bg-blue-100 border-blue-200' };
        return { label: '⚪ SYSTEM NOMINAL', color: 'text-muted-foreground bg-muted border-border' };
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-500 pb-10 max-w-[1600px] mx-auto">
            {/* Header Section */}
            <div className="flex flex-col gap-1 px-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSelectedModule('unified')} className="p-1 rounded-lg hover:bg-primary/10 text-primary transition-all flex items-center justify-center border border-primary/20 bg-primary/5">
                            <ChevronLeft size={20} strokeWidth={2.5} />
                        </button>
                        <div className="h-6 w-1 bg-primary rounded-full shadow-[0_0_8px_rgba(0,165,142,0.4)]" />
                        <div>
                            <h2 className="text-[14px] font-black uppercase tracking-[0.2em] text-foreground/90">Performance & Capacity Intelligence</h2>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider opacity-60">Predictive Modeling • Traffic Stability • Asset Efficiency</p>
                        </div>
                    </div>
                    <div className="flex bg-muted/50 p-1 rounded-xl border border-border/50">
                        {['OVERVIEW', 'PLANNING', 'OPTIMIZATION'].map(view => (
                            <button
                                key={view}
                                onClick={() => setSelectedView(view as any)}
                                className={cn(
                                    "px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg",
                                    selectedView === view ? "bg-card shadow-sm text-primary border border-border/50" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {view}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-4 p-4 rounded-2xl border border-primary/20 bg-primary/5 flex items-start gap-4 shadow-inner">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary animate-pulse"><Info size={20} /></div>
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                            <h4 className="text-[11px] font-black uppercase text-primary tracking-widest">NOC Executive Summary</h4>
                            <span className="text-[10px] font-bold text-muted-foreground bg-background/50 px-2 py-0.5 rounded-full border border-border/50">Last Update: Real-time</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-muted-foreground">
                            Analyzed 150 backbone segments. Found <span className="text-red-600 font-black">{buckets.critical.length} assets in critical saturation</span> and <span className="text-amber-600 font-black">{planningStats.growth10} segments with &gt;10% MoM growth</span>.
                            Forecasting identifies <span className="text-destructive font-black underline decoration-2">{planningStats.breach15Days} imminent 15-day breaches</span>. Optimization identifies <span className="text-emerald-600 font-black">{optimizationStats.zombieLinks} major downgrade candidates</span> to reduce operational cost by ~12%.
                        </p>
                    </div>
                </div>
            </div>

            {/* --- SECTION 1: DUAL CHANNEL UTILIZATION BUCKETS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* HIGH UTIL CHANNEL */}
                <div className={cn("col-span-1 rounded-2xl border border-destructive/30 bg-gradient-to-br from-destructive/5 to-transparent p-4 shadow-sm cursor-pointer transition-all hover:scale-[1.02]", filter === 'Critical' && "ring-2 ring-red-500 shadow-lg")} onClick={() => setFilter('Critical')}>
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-[10px] font-black text-destructive uppercase tracking-tighter italic">Critical Saturation</p>
                        <AlertTriangle size={14} className="text-destructive" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-black text-foreground">{buckets.critical.length}</h3>
                        <span className="text-[10px] font-bold text-destructive">&gt;90% LOAD</span>
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-1 font-bold">Action: Immediate Upgrade</p>
                </div>

                <div className={cn("col-span-1 rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent p-4 shadow-sm cursor-pointer transition-all hover:scale-[1.02]", filter === 'High' && "ring-2 ring-amber-500 shadow-lg")} onClick={() => setFilter('High')}>
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-tighter italic">High Warning</p>
                        <TrendingUp size={14} className="text-amber-500" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-black text-foreground">{buckets.high.length}</h3>
                        <span className="text-[10px] font-bold text-amber-600">70-90% LOAD</span>
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-1 font-bold">Action: Traffic Balancing</p>
                </div>

                <div className={cn("col-span-1 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-4 shadow-sm cursor-pointer transition-all hover:scale-[1.02]", filter === 'Medium' && "ring-2 ring-primary shadow-lg")} onClick={() => setFilter('Medium')}>
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-[10px] font-black text-primary uppercase tracking-tighter italic">Growth Zone</p>
                        <Activity size={14} className="text-primary" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-black text-foreground">{buckets.medium.length}</h3>
                        <span className="text-[10px] font-bold text-primary">50-70% LOAD</span>
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-1 font-bold">Action: Baseline Shift</p>
                </div>

                {/* LOW UTIL CHANNEL */}
                <div className={cn("col-span-1 rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-transparent p-4 shadow-sm cursor-pointer transition-all hover:scale-[1.02]", filter === 'Zombie' && "ring-2 ring-blue-500 shadow-lg")} onClick={() => setFilter('Zombie')}>
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-tighter italic">Zombie Assets</p>
                        <ZapOff size={14} className="text-blue-500" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-black text-foreground">{buckets.low5.length}</h3>
                        <span className="text-[10px] font-bold text-blue-600">&lt;5% LOAD</span>
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-1 font-bold">Action: Release Capacity</p>
                </div>

                <div className={cn("col-span-1 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-transparent p-4 shadow-sm cursor-pointer transition-all hover:scale-[1.02]", filter === 'Underutilized' && "ring-2 ring-emerald-500 shadow-lg")} onClick={() => setFilter('Underutilized')}>
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter italic">Operational Slop</p>
                        <ArrowDownRight size={14} className="text-emerald-500" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-black text-foreground">{buckets.low10.length}</h3>
                        <span className="text-[10px] font-bold text-emerald-600">5-10% LOAD</span>
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-1 font-bold">Action: Downgrade Review</p>
                </div>
            </div>

            {/* --- SECTION 2: FORECASTING & CAPACITY RISK (PLANNING) --- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Capacity Breach Forecast */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Timer size={16} className="text-destructive animate-pulse" />
                            Time-to-Breach Indicators (80% Forecast)
                        </h3>
                        <button onClick={() => exportToCSV(forecastGraphData, 'Capacity_Breach_Forecast')} className="p-2 hover:bg-muted rounded-lg text-muted-foreground bg-muted/30 border border-border/50 transition-all"><Download size={14} /></button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mb-6 leading-relaxed bg-muted/20 p-2 rounded-lg border-l-2 border-destructive">
                        Linear regression applied to 30-day historical data. Links with <span className="font-black text-red-600">&lt;15 days</span> are in critical execution window for hardware upgrade.
                    </p>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={forecastGraphData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                                <XAxis type="number" domain={[0, 90]} tick={{ fontSize: 10, fontWeight: 700 }} label={{ value: 'Days Remaining', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10, fontWeight: 800, fill: 'hsl(var(--foreground))' }} />
                                <Tooltip cursor={{ fill: 'hsl(var(--primary)/0.05)' }} contentStyle={{ borderRadius: '12px', fontSize: '11px', border: '1px solid hsl(var(--border))' }} />
                                <Bar dataKey="days" radius={[0, 6, 6, 0]} barSize={22} cursor="pointer">
                                    {forecastGraphData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.days < 15 ? '#ef4444' : entry.days < 45 ? '#f59e0b' : '#3b82f6'} />
                                    ))}
                                    <LabelList dataKey="days" position="right" style={{ fontSize: '11px', fontWeight: 'black' }} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 flex gap-4 text-[9px] font-black uppercase text-muted-foreground">
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Critical (&lt;15d)</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Warning (15-45d)</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Safe (&gt;45d)</span>
                    </div>
                </div>

                {/* Pattern View: Biz vs Off-Hours + Analysis Heatmap */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <History size={16} className="text-blue-500" />
                            Temporal Load Distribution
                        </h3>
                        <div className="flex items-center gap-2">
                            <div className="flex gap-1 items-center px-2 py-1 bg-muted rounded-lg text-[10px] font-bold text-muted-foreground">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div> Biz
                                <div className="w-2 h-2 rounded-full bg-slate-400"></div> Off
                            </div>
                            <button onClick={() => exportToCSV(LINKS_DATA, 'Load_Distribution_Data')} className="p-2 hover:bg-muted rounded-lg text-muted-foreground bg-muted/30 border border-border/50"><Download size={14} /></button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 flex-1">
                        <div className="h-full flex flex-col justify-center items-center gap-4">
                            <ResponsiveContainer width="100%" height={180}>
                                <PieChart>
                                    <Pie data={bizComparison} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {bizComparison.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="text-center">
                                <p className="text-2xl font-black text-primary">{bizComparison[0].value}%</p>
                                <p className="text-[10px] font-black text-muted-foreground uppercase opacity-70 italic">Peak Biz Capacity</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp size={14} className="text-purple-600" />
                                    <span className="text-[10px] font-black uppercase">Peak-to-Avg Ratio</span>
                                </div>
                                <p className="text-3xl font-black text-foreground">
                                    {(LINKS_DATA.reduce((acc, l) => acc + l.peakToAvgRatio, 0) / LINKS_DATA.length).toFixed(2)}
                                </p>
                                <p className="text-[9px] text-muted-foreground mt-1">High ratio indicates <span className="text-amber-600 font-bold uppercase tracking-tight">Bursty Traffic Profile</span> requiring higher buffer depth.</p>
                            </div>
                            <div className="p-3 bg-primary/5 rounded-xl border border-primary/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <ShieldAlert size={14} className="text-primary" />
                                    <span className="text-[10px] font-black uppercase">Failover Risk Exposure</span>
                                </div>
                                <p className="text-3xl font-black text-primary">{planningStats.redundancyAtRisk}</p>
                                <p className="text-[9px] text-muted-foreground mt-1">Links that will exceed <span className="text-red-600 font-bold uppercase">95% Load</span> if secondary fails.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- SECTION 3: PERFORMANCE CORRELATION (SCATTER) & CUSTOMER METRICS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Layers size={16} className="text-indigo-500" />
                            Utilization vs Performance Impact Correlation
                        </h3>
                        <button onClick={() => exportToCSV(LINKS_DATA, 'Correlation_Dataset')} className="p-2 hover:bg-muted rounded-lg text-muted-foreground bg-muted/30 border border-border/50"><Download size={14} /></button>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis type="number" dataKey="currentUtil" name="Utilization" unit="%" tick={{ fontSize: 10, fontWeight: 700 }} label={{ value: 'Utilization %', position: 'insideBottom', offset: -10, fontSize: 10, fontWeight: 800 }} />
                                <YAxis type="number" dataKey="latency" name="Latency" unit="ms" tick={{ fontSize: 10, fontWeight: 700 }} label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft', fontSize: 10, fontWeight: 800 }} />
                                <ZAxis type="number" dataKey="packetLoss" range={[40, 400]} name="Packet Loss" unit="%" />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                                <Scatter name="Network Segments" data={LINKS_DATA} fill="#6366f1">
                                    {LINKS_DATA.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.currentUtil > 80 ? '#ef4444' : entry.currentUtil > 60 ? '#f59e0b' : '#3b82f6'} fillOpacity={0.6} stroke={entry.currentUtil > 80 ? '#b91c1c' : '#1e3a8a'} strokeWidth={1} />
                                    ))}
                                </Scatter>
                                <ReferenceLine x={80} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'Performance Degrade Threshold', position: 'top', fill: '#ef4444', fontSize: 9, fontWeight: 900 }} />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-[10px] text-center text-muted-foreground mt-4 italic font-bold">
                        Bubble Size = Packet Loss %. Visualization proves that saturation beyond <span className="text-red-600">80% Utilization</span> causes exponential latency growth.
                    </p>
                </div>

                {/* Efficiency Leaderboard */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Gauge size={16} className="text-emerald-500" />
                            Composite Capacity Efficiency
                        </h3>
                        <button onClick={() => exportToCSV(LINKS_DATA, 'Efficiency_Full')} className="p-2 hover:bg-muted rounded-lg text-muted-foreground bg-muted/30 border border-border/50"><Download size={14} /></button>
                    </div>
                    <div className="flex-1 overflow-auto">
                        <div className="space-y-3">
                            {LINKS_DATA.sort((a, b) => b.efficiencyScore - a.efficiencyScore).slice(0, 7).map((link, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/20 border border-border/40 hover:border-emerald-500/30 transition-all group">
                                    <div className="flex flex-col">
                                        <span className="text-[11px] font-black text-foreground group-hover:text-primary transition-colors">{link.name}</span>
                                        <span className="text-[9px] text-muted-foreground font-bold">{link.region} • {link.currentUtil}% Load</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[14px] font-black tabular-nums text-emerald-600">{link.efficiencyScore}</span>
                                        <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Efficiency</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-4 leading-tight bg-emerald-500/5 p-2 rounded border border-emerald-500/20">
                        Calc: (Avg Util × Stability × Biz Usage) – <span className="font-bold">Overprovision Penalty</span>. Score &gt;80 is Peak Asset Value.
                    </p>
                </div>
            </div>

            {/* --- SECTION 4: THE MASTER TABLE OF TRUTH --- */}
            <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden border-t-4 border-t-primary">
                <div className="p-5 border-b border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/20"><MonitorPlay size={18} /></div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Airtel Backbone Performance Inventory</h3>
                            <div className="flex gap-2 mt-1">
                                <span className="text-[9px] font-black text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border/50">Viewing: {filter} Segment Profile</span>
                                <span className="text-[9px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">{filteredLinks.length} Segments Loaded</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setFilter('All')} className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase bg-background border border-border/50 hover:bg-muted transition-all">Reset Filters</button>
                        <button onClick={() => exportToCSV(filteredLinks, 'Master_Performance_Inventory')} className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-[11px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95">
                            <Download size={16} /> Global CSV Export
                        </button>
                    </div>
                </div>
                <div className="max-h-[600px] overflow-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="text-[10px] uppercase font-black text-muted-foreground bg-muted/30 sticky top-0 z-10 backdrop-blur-md border-b border-border/50">
                            <tr>
                                <th className="p-4">Link / Segment</th>
                                <th className="p-4">Regional Tier</th>
                                <th className="p-4 text-center">Trend / Growth</th>
                                <th className="p-4 text-center">Avg vs Peak Ratio</th>
                                <th className="p-4 text-center">Stability Index</th>
                                <th className="p-4 text-center w-[180px]">Util Intensity</th>
                                <th className="p-4 text-right">Strategic Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-[12px] font-bold divide-y divide-border/20">
                            {filteredLinks.map((row, i) => {
                                const rec = getRecommendation(row);
                                return (
                                    <tr key={i} className="hover:bg-primary/5 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-black text-foreground group-hover:text-primary transition-colors cursor-pointer">{row.name}</span>
                                                <span className="text-[9px] text-muted-foreground font-mono">{row.id} • {row.customer}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black">{row.region}</span>
                                                <span className="text-[9px] text-muted-foreground opacity-70 underline decoration-primary/20">{row.tier} Tier Service</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex flex-col items-center">
                                                <div className={cn("flex items-center gap-1 text-[10px] font-black", row.trend === 'Rising' ? "text-red-600" : row.trend === 'Declining' ? "text-emerald-600" : "text-muted-foreground")}>
                                                    {row.trend === 'Rising' ? <TrendingUp size={12} /> : row.trend === 'Declining' ? <TrendingDown size={12} /> : <Activity size={12} />}
                                                    {row.trend}
                                                </div>
                                                <span className="text-[9px] text-muted-foreground tabular-nums">({row.momGrowth > 0 ? '+' : ''}{row.momGrowth}% MoM)</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center font-mono tabular-nums">
                                            <div className="flex flex-col items-center">
                                                <span className="text-[11px] font-black">{row.currentUtil}% / {row.peakUtil}%</span>
                                                <span className={cn("text-[9px] font-bold px-1.5 rounded", row.peakToAvgRatio > 1.8 ? "bg-amber-100 text-amber-700" : "text-muted-foreground")}>Ratio: {row.peakToAvgRatio}x</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className={cn("px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter",
                                                    row.stabilityScore === 'High' ? "bg-emerald-100 text-emerald-700" :
                                                        row.stabilityScore === 'Medium' ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                                                )}>
                                                    {row.stabilityScore} Score
                                                </span>
                                                <span className="text-[9px] text-muted-foreground mt-1 font-mono">Index: {row.stabilityValue}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden shadow-inner border border-border/30">
                                                    <div className={cn("h-full transition-all duration-700", row.currentUtil > 85 ? "bg-red-500" : row.currentUtil > 65 ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${row.currentUtil}%` }} />
                                                </div>
                                                <span className={cn("min-w-[40px] text-right font-black tabular-nums font-mono text-[11px]", row.currentUtil > 85 ? "text-red-600" : "text-foreground")}>{row.currentUtil}%</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex flex-col items-end gap-1">
                                                <span className={cn("px-2.5 py-1 rounded-lg text-[9px] font-black shadow-sm border", rec.color)}>
                                                    {rec.label}
                                                </span>
                                                <span className="text-[8px] text-muted-foreground font-medium italic opacity-70">
                                                    {row.daysTo80 < 30 ? (
                                                        <span className="text-red-500 font-bold">⚠️ Predicted Breach: {row.daysTo80} Days</span>
                                                    ) : row.chronicUnderUtil ? (
                                                        <span className="text-emerald-600 font-bold">Unused Capacity &gt;60 Days</span>
                                                    ) : (
                                                        'Utilization Profile: Sustained'
                                                    )}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Visual Heatmap Pattern Footer */}
            <div className="p-6 rounded-2xl border border-border bg-card shadow-sm border-l-4 border-l-indigo-500">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Calendar size={16} className="text-indigo-500" />
                        Airtel Regional Congestion Windows (24h Activity Loop)
                    </h3>
                    <div className="flex gap-3 text-[10px] font-bold text-muted-foreground">
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-indigo-50 text-[8px] border border-border"></div> Low util</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-indigo-500"></div> Peak window</span>
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-indigo-900"></div> Saturated</span>
                    </div>
                </div>
                <div className="grid grid-cols-4 lg:grid-cols-7 gap-2">
                    <div className="text-[10px] font-black text-muted-foreground p-3 bg-muted/10 rounded flex items-center justify-center italic">GEO / HR</div>
                    {['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'].map(h => <div key={h} className="text-[10px] font-black text-muted-foreground p-3 bg-muted/30 rounded flex items-center justify-center">{h}</div>)}

                    {['North Backbone', 'South Backbone', 'East Intra-Circle', 'West Intra-Circle'].map((r, ri) => (
                        <React.Fragment key={r}>
                            <div className="text-[10px] font-black text-foreground p-3 bg-muted/40 rounded flex items-center justify-center text-center leading-tight">{r}</div>
                            {[1, 2, 3, 4, 5, 6].map(c => {
                                const val = Math.floor(Math.random() * 60 + (c > 2 && c < 5 ? 35 : 0));
                                return (
                                    <div key={c} className={cn("p-4 rounded-xl flex items-center justify-center text-[11px] font-black shadow-inner transition-all hover:scale-105 cursor-pointer relative group",
                                        val > 80 ? "bg-indigo-900 text-white" : val > 50 ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "bg-indigo-50 text-indigo-900 border border-indigo-100"
                                    )}>
                                        {val}%
                                        <div className="absolute opacity-0 group-hover:opacity-100 -top-8 bg-black text-white text-[9px] px-2 py-1 rounded whitespace-nowrap z-50 pointer-events-none">
                                            {r} @ {c * 4 - 4}:00 <br /> Load Factor: {val}%
                                        </div>
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
}
