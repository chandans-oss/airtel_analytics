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
    Router,
    Wifi,
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
    Shuffle
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

        // Enforce some realistic clusters
        if (i < count * 0.1) utilBase = 90 + Math.random() * 8; // Critical
        else if (i < count * 0.25) utilBase = 70 + Math.random() * 15; // High
        else if (i > count * 0.8) utilBase = Math.random() * 8; // Underutilized

        const currentUtil = Math.min(99, Math.max(1, utilBase));

        // Trend Analysis
        const trend = Math.random() > 0.6 ? (Math.random() > 0.5 ? 'Rising' : 'Declining') : 'Stable';
        const momGrowth = trend === 'Rising' ? Math.floor(Math.random() * 15 + 2) :
            trend === 'Declining' ? -Math.floor(Math.random() * 10) : Math.floor(Math.random() * 4 - 2);

        // Business vs Non-Business
        const isBursty = Math.random() > 0.7;
        const peakToAvg = isBursty ? (1.8 + Math.random()) : (1.1 + Math.random() * 0.3);
        const businessUtil = Math.min(100, currentUtil * 1.1);
        const nonBusinessUtil = currentUtil * 0.4; // Significantly lower typically

        // Forecasting
        const daysTo80 = trend === 'Rising' && currentUtil < 80
            ? Math.floor((80 - currentUtil) / (momGrowth / 30)) // Rough approx
            : 0;

        // Stability
        const variance = isBursty ? Math.random() * 20 : Math.random() * 5;
        const stabilityScore = variance > 15 ? 'Low' : variance > 5 ? 'Medium' : 'High';

        // Errors & Performance
        const packetLoss = currentUtil > 80 ? Math.random() * 5 : 0;
        const latency = 20 + (currentUtil > 70 ? (currentUtil - 70) * 2 : 0) + Math.random() * 10;

        // Redundancy
        const backupUtil = Math.random() * 30; // Usually low
        const failOverUtil = Math.min(100, currentUtil + backupUtil);
        const failoverRisk = failOverUtil > 90 ? 'High' : 'Low';

        return {
            id,
            name: `${region}-Core-${i}`,
            region,
            tier,
            service,
            customer,
            currentUtil: Number(currentUtil.toFixed(1)),
            trend,
            momGrowth,
            peakToAvg: Number(peakToAvg.toFixed(2)),
            businessUtil: Number(businessUtil.toFixed(1)),
            nonBusinessUtil: Number(nonBusinessUtil.toFixed(1)),
            daysTo80: daysTo80 > 0 ? daysTo80 : 999, // 999 = safe or already breached
            stabilityScore,
            packetLoss: Number(packetLoss.toFixed(2)),
            latency: Math.floor(latency),
            backupUtil: Number(backupUtil.toFixed(1)),
            failOverUtil: Number(failOverUtil.toFixed(1)),
            failoverRisk,
            efficiencyScore: Math.floor((currentUtil * (stabilityScore === 'High' ? 1.2 : 0.9)) - (currentUtil < 10 ? 20 : 0))
        };
    });
};

const LINKS_DATA = generateMockLinks(100);

// --- COMPONENT ---

export function PerformanceDashboard() {
    const { setSelectedModule } = useInventoryStore();
    const [selectedView, setSelectedView] = useState<'OVERVIEW' | 'PLANNING' | 'OPTIMIZATION'>('OVERVIEW');

    // --- DERIVED ANALYTICS ---

    // 1. High Utilized Links
    const criticalLinks = useMemo(() => LINKS_DATA.filter(l => l.currentUtil > 90), []);
    const highLinks = useMemo(() => LINKS_DATA.filter(l => l.currentUtil >= 70 && l.currentUtil <= 90), []);

    // 2. Low Utilized Links
    const zombieLinks = useMemo(() => LINKS_DATA.filter(l => l.currentUtil < 5), []);

    // 3. Trends
    const risingLinks = useMemo(() => LINKS_DATA.filter(l => l.trend === 'Rising' && l.currentUtil > 50), []);

    // 4. Forecast Data (Top 5 Riskiest)
    const forecastRiskData = useMemo(() => {
        return risingLinks
            .filter(l => l.daysTo80 < 60) // Only imminent risks
            .sort((a, b) => a.daysTo80 - b.daysTo80)
            .slice(0, 5)
            .map(l => ({
                name: l.name,
                current: l.currentUtil,
                days: Math.floor(l.daysTo80),
                growth: l.momGrowth,
                fullData: l
            }));
    }, [risingLinks]);

    // 5. Business Hours vs Non-Business (Aggregate)
    const timeOfDayComparison = useMemo(() => {
        const avgBiz = LINKS_DATA.reduce((acc, curr) => acc + curr.businessUtil, 0) / LINKS_DATA.length;
        const avgNonBiz = LINKS_DATA.reduce((acc, curr) => acc + curr.nonBusinessUtil, 0) / LINKS_DATA.length;
        return [
            { name: 'Business Hours', value: Math.floor(avgBiz), fill: '#3b82f6' },
            { name: 'Non-Business Hours', value: Math.floor(avgNonBiz), fill: '#94a3b8' }
        ];
    }, []);

    // 6. Efficiency Scores (Top 7)
    const topEfficientLinks = useMemo(() => {
        return [...LINKS_DATA].sort((a, b) => b.efficiencyScore - a.efficiencyScore).slice(0, 7);
    }, []);

    // 7. Heatmap Data (Mock Region vs Hour simulation)
    const heatmapData = useMemo(() => {
        const hours = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];
        return ['North', 'South', 'East', 'West'].flatMap(region =>
            hours.map(hour => ({
                region,
                hour,
                value: Math.floor(Math.random() * 60 + (hour === '12:00' || hour === '16:00' ? 30 : 0))
            }))
        );
    }, []);

    // 8. Customer Impact (New)
    const customerImpactDates = useMemo(() => {
        const impact = {} as Record<string, number>;
        LINKS_DATA.forEach(l => {
            if (!impact[l.customer]) impact[l.customer] = 0;
            impact[l.customer] += l.currentUtil;
        });
        return Object.entries(impact)
            .map(([name, totalUtil]) => ({ name, value: Math.round(totalUtil / 10), fill: '#8b5cf6' })) // Avg-ish
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, []);

    // 9. Redundancy Risk (New)
    const redundancyRiskData = useMemo(() => {
        const highRisk = LINKS_DATA.filter(l => l.failoverRisk === 'High');
        return highRisk.sort((a, b) => b.failOverUtil - a.failOverUtil).slice(0, 5).map(l => ({
            name: l.name,
            primary: l.currentUtil,
            backup: l.backupUtil,
            projected: l.failOverUtil,
            fullData: l
        }));
    }, []);

    // --- HANDLERS ---
    const handleBarClick = (data: any, prefix: string) => {
        if (data && data.payload && data.payload.fullData) {
            exportToCSV([data.payload.fullData], `${prefix}_${data.payload.name}_Details`);
        } else if (data && data.payload) {
            // Fallback for aggregate charts
            exportToCSV([data.payload], `${prefix}_${data.payload.name || 'Data'}`);
        }
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-500 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between px-1 mb-4">
                <div className="flex items-center gap-3">
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
                            Performance & Capacity Intelligence
                        </h2>
                        <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider opacity-60">
                            Predictive Utilization • Efficiency Scoring • Cost Optimization
                        </p>
                    </div>
                </div>
                <div className="flex bg-muted/50 p-1 rounded-lg">
                    {['OVERVIEW', 'PLANNING', 'OPTIMIZATION'].map(view => (
                        <button
                            key={view}
                            onClick={() => setSelectedView(view as any)}
                            className={cn(
                                "px-3 py-1 text-[10px] font-bold uppercase transition-all rounded-md",
                                selectedView === view ? "bg-card shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {view}
                        </button>
                    ))}
                </div>
            </div>

            {/* ---------------- SECTION 1: CRITICAL UTILIZATION METRICS ---------------- */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Critical > 90% */}
                <div className="rounded-xl border border-destructive/30 bg-gradient-to-br from-destructive/5 to-transparent p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <AlertTriangle size={64} className="text-destructive" />
                    </div>
                    <div className="flex justify-between items-start z-10">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-destructive mb-1">Critical Saturation</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-3xl font-black text-foreground">{criticalLinks.length}</h3>
                                <span className="text-[10px] font-bold text-destructive flex items-center gap-1">
                                    <TrendingUp size={10} /> &gt;90% Util
                                </span>
                            </div>
                        </div>
                        <button onClick={() => exportToCSV(criticalLinks, 'Critical_Links_Report')} className="p-1.5 rounded-md hover:bg-destructive hover:text-white text-muted-foreground transition-all">
                            <Download size={14} />
                        </button>
                    </div>
                    <div className="mt-3">
                        <div className="bg-background/40 backdrop-blur-sm rounded-lg p-2 border border-destructive/20">
                            <p className="text-[9px] text-muted-foreground mb-1">Recommendation:</p>
                            <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full border border-destructive/20">
                                🔴 Upgrade Required
                            </span>
                        </div>
                    </div>
                </div>

                {/* High 70-90% */}
                <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-transparent p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Activity size={64} className="text-amber-500" />
                    </div>
                    <div className="flex justify-between items-start z-10">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1">High Load Warning</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-3xl font-black text-foreground">{highLinks.length}</h3>
                                <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                                    <TrendingUp size={10} /> 70-90% Util
                                </span>
                            </div>
                        </div>
                        <button onClick={() => exportToCSV(highLinks, 'High_Util_Links_Report')} className="p-1.5 rounded-md hover:bg-amber-500 hover:text-white text-muted-foreground transition-all">
                            <Download size={14} />
                        </button>
                    </div>
                    <div className="mt-3">
                        <div className="bg-background/40 backdrop-blur-sm rounded-lg p-2 border border-amber-500/20">
                            <p className="text-[9px] text-muted-foreground mb-1">Recommendation:</p>
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                🟠 Monitor Closely
                            </span>
                        </div>
                    </div>
                </div>

                {/* Underutilized < 5% */}
                <div className="rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/5 to-transparent p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <ArrowDownRight size={64} className="text-blue-500" />
                    </div>
                    <div className="flex justify-between items-start z-10">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-1">Zombie Links</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-3xl font-black text-foreground">{zombieLinks.length}</h3>
                                <span className="text-[10px] font-bold text-blue-600 flex items-center gap-1">
                                    <TrendingDown size={10} /> &lt;5% Util
                                </span>
                            </div>
                        </div>
                        <button onClick={() => exportToCSV(zombieLinks, 'Zombie_Links_Report')} className="p-1.5 rounded-md hover:bg-blue-500 hover:text-white text-muted-foreground transition-all">
                            <Download size={14} />
                        </button>
                    </div>
                    <div className="mt-3">
                        <div className="bg-background/40 backdrop-blur-sm rounded-lg p-2 border border-blue-500/20">
                            <p className="text-[9px] text-muted-foreground mb-1">Recommendation:</p>
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                                🟢 Downgrade Candidate
                            </span>
                        </div>
                    </div>
                </div>

                {/* Avg Efficiency Score */}
                <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/5 to-transparent p-4 flex flex-col justify-between shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Gauge size={64} className="text-emerald-500" />
                    </div>
                    <div className="flex justify-between items-start z-10">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-1">Fleet Efficiency</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-3xl font-black text-foreground">
                                    {Math.round(LINKS_DATA.reduce((acc, l) => acc + l.efficiencyScore, 0) / LINKS_DATA.length)}
                                </h3>
                                <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                                    score / 100
                                </span>
                            </div>
                        </div>
                        <button onClick={() => exportToCSV(LINKS_DATA, 'Full_Network_Efficiency_Report')} className="p-1.5 rounded-md hover:bg-emerald-500 hover:text-white text-muted-foreground transition-all">
                            <Download size={14} />
                        </button>
                    </div>
                    <div className="mt-3">
                        <p className="text-[9px] text-muted-foreground leading-tight">
                            Composite score of Utilization × Stability × Business Value.
                        </p>
                    </div>
                </div>
            </div>

            {/* ---------------- SECTION 2: FORECASTING & TRENDS (PLANNING VIEW) ---------------- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 1. Time-to-Threshold (Capacity Risk) */}
                <div className="col-span-1 lg:col-span-2 rounded-xl border border-border bg-card p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                                <Clock size={14} className="text-destructive" />
                                Forecasted Capacity Breaches (Next 60 Days)
                            </h3>
                            <p className="text-[10px] text-muted-foreground mt-1">
                                Predictions based on 30-day linear regression trend analysis.
                            </p>
                        </div>
                        <button onClick={() => exportToCSV(forecastRiskData, 'Capacity_Risk_Forecast')} className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-primary transition-colors bg-muted/20"><Download size={14} /></button>
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={forecastRiskData} layout="vertical" margin={{ left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                                <XAxis type="number" domain={[0, 60]} tick={{ fontSize: 10 }} label={{ value: 'Days to Breach (80%)', position: 'insideBottom', offset: -5, fontSize: 10 }} />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10, fontWeight: 700 }} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                                    formatter={(value: any, name: any, props: any) => {
                                        if (name === 'days') return [`${value} Days`, 'Time to Breach'];
                                        return [value, name];
                                    }}
                                />
                                <Bar
                                    dataKey="days"
                                    barSize={20}
                                    radius={[0, 4, 4, 0]}
                                    onClick={(data) => handleBarClick(data, 'Forecast')}
                                    cursor="pointer"
                                >
                                    {forecastRiskData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.days < 15 ? '#ef4444' : entry.days < 45 ? '#f59e0b' : '#3b82f6'} />
                                    ))}
                                    <LabelList dataKey="days" position="right" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 2. Business vs Non-Business Pattern */}
                <div className="col-span-1 rounded-xl border border-border bg-card p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                            <Clock size={14} className="text-blue-500" />
                            Biz vs Non-Biz Utilization
                        </h3>
                        <button onClick={() => exportToCSV(LINKS_DATA, 'Business_Vs_NonBusiness_Stats')} className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-primary transition-colors bg-muted/20"><Download size={14} /></button>
                    </div>
                    <div className="h-[200px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={timeOfDayComparison}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    onClick={(data) => exportToCSV(LINKS_DATA, `Export_${data.name}`)}
                                    cursor="pointer"
                                >
                                    {timeOfDayComparison.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-[10px] text-muted-foreground font-medium uppercase">Avg Util</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* ---------------- SECTION 3: NEW METRICS - CUSTOMER & REDUNDANCY ---------------- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Customer / Service Impact */}
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                                <Layers size={14} className="text-purple-500" />
                                Top Customer Bandwidth Consumers
                            </h3>
                            <p className="text-[10px] text-muted-foreground mt-1">Aggregated utilization by primary customer account.</p>
                        </div>
                        <button onClick={() => exportToCSV(customerImpactDates, 'Customer_Bandwidth_Impact')} className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-primary transition-colors bg-muted/20"><Download size={14} /></button>
                    </div>
                    <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={customerImpactDates} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10, fontWeight: 700 }} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                                <Bar
                                    dataKey="value"
                                    barSize={20}
                                    radius={[0, 4, 4, 0]}
                                    fill="#8b5cf6"
                                    onClick={(data) => exportToCSV(LINKS_DATA.filter(l => l.customer === data.name), `Detailed_${data.name}_Links`)}
                                    cursor="pointer"
                                >
                                    <LabelList dataKey="value" position="right" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Redundancy & Failover Risk */}
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                                <Shuffle size={14} className="text-destructive" />
                                Redundancy Failover Simulation
                            </h3>
                            <p className="text-[10px] text-muted-foreground mt-1">Projected utilization if primary link fails (Top Risks).</p>
                        </div>
                        <button onClick={() => exportToCSV(redundancyRiskData, 'Failover_Risk_Report')} className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-primary transition-colors bg-muted/20"><Download size={14} /></button>
                    </div>
                    <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={redundancyRiskData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                                <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" height={40} />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip cursor={{ fill: 'hsl(var(--muted)/0.3)' }} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                                <Bar
                                    dataKey="projected"
                                    name="Projected Load"
                                    fill="#ef4444"
                                    barSize={30}
                                    radius={[4, 4, 0, 0]}
                                    onClick={(data) => handleBarClick(data, 'FailoverRisk')}
                                    cursor="pointer"
                                />
                                <ReferenceLine y={100} stroke="red" strokeDasharray="3 3" label={{ value: 'Capacity Limit', position: 'top', fontSize: 9, fill: 'red' }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {/* ---------------- SECTION 4: PERFORMANCE CORRELATION & INSIGHTS ---------------- */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* 1. Error vs Utilization Scatter */}
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                            <ShieldAlert size={14} className="text-destructive" />
                            Performance Impact Correlation
                        </h3>
                        <button onClick={() => exportToCSV(LINKS_DATA, 'Performance_Correlation_Data')} className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-primary transition-colors bg-muted/20"><Download size={14} /></button>
                    </div>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                <XAxis type="number" dataKey="currentUtil" name="Utilization" unit="%" tick={{ fontSize: 10 }} label={{ value: 'Utilization %', position: 'insideBottom', offset: -10, fontSize: 10 }} />
                                <YAxis type="number" dataKey="latency" name="Latency" unit="ms" tick={{ fontSize: 10 }} label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                                <ZAxis type="number" dataKey="packetLoss" range={[20, 300]} name="Packet Loss" unit="%" />
                                <Tooltip
                                    cursor={{ strokeDasharray: '3 3' }}
                                    contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                                />
                                <Scatter
                                    name="Links"
                                    data={LINKS_DATA.filter(d => d.currentUtil > 50)}
                                    fill="#8884d8"
                                    onClick={(data) => exportToCSV([data.payload], `Scatter_Link_${data.payload.id}`)}
                                >
                                    {LINKS_DATA.filter(d => d.currentUtil > 50).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={Number(entry.packetLoss) > 2 ? '#ef4444' : Number(entry.packetLoss) > 0.5 ? '#f59e0b' : '#3b82f6'} cursor="pointer" />
                                    ))}
                                </Scatter>
                                <ReferenceLine x={80} stroke="red" strokeDasharray="3 3" label={{ value: 'Throttling Threshold', position: 'insideTopLeft', fontSize: 10, fill: 'red' }} />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-[9px] text-center text-muted-foreground mt-2">
                        Bubble size represents <span className="font-bold">Packet Loss %</span>. High latency typically appearing &gt;80% Load.
                    </p>
                </div>

                {/* 2. Top Efficiency Scores */}
                <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                            <Gauge size={14} className="text-emerald-500" />
                            Top Performing Links (Efficiency Score)
                        </h3>
                        <button onClick={() => exportToCSV(topEfficientLinks, 'Efficiency_Leaderboard')} className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-primary transition-colors bg-muted/20"><Download size={14} /></button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-[9px] uppercase text-muted-foreground bg-muted/30">
                                <tr>
                                    <th className="p-2 pl-3">Link Name</th>
                                    <th className="p-2">Region</th>
                                    <th className="p-2 text-center">Stability</th>
                                    <th className="p-2 text-right pr-3">Score</th>
                                </tr>
                            </thead>
                            <tbody className="text-[11px] font-medium divide-y divide-border/20">
                                {topEfficientLinks.map((link, i) => (
                                    <tr key={i} className="hover:bg-muted/10 group cursor-pointer" onClick={() => exportToCSV([link], `Link_${link.id}_Efficiency`)}>
                                        <td className="p-2 pl-3 text-primary group-hover:underline">{link.name}</td>
                                        <td className="p-2">{link.region}</td>
                                        <td className="p-2 text-center">
                                            <span className={cn(
                                                "px-1.5 py-0.5 rounded text-[9px] uppercase font-bold",
                                                link.stabilityScore === 'High' ? "bg-emerald-100 text-emerald-700" :
                                                    link.stabilityScore === 'Medium' ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                                            )}>
                                                {link.stabilityScore}
                                            </span>
                                        </td>
                                        <td className="p-2 text-right pr-3 font-mono font-bold">{link.efficiencyScore}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* ---------------- SECTION 5: HEATMAP (VISUAL PATTERNS) ---------------- */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                        <Activity size={14} className="text-purple-500" />
                        Regional Utilization Heatmap (24h Activity)
                    </h3>
                    <div className="flex items-center gap-4">
                        <div className="flex gap-2 items-center text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-blue-100"></div> Low</span>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-blue-500"></div> Med</span>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-blue-900"></div> High</span>
                        </div>
                        <button onClick={() => exportToCSV(heatmapData, 'Regional_Heatmap_Raw')} className="p-1.5 hover:bg-muted rounded-md text-muted-foreground hover:text-primary transition-colors bg-muted/20"><Download size={14} /></button>
                    </div>
                </div>
                <div className="grid grid-cols-4 lg:grid-cols-7 gap-2">
                    {/* Header Row */}
                    <div className="text-[10px] font-bold text-muted-foreground flex items-center justify-center p-2">REGION / HOUR</div>
                    {['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'].map(h => (
                        <div key={h} className="text-[10px] font-bold text-muted-foreground flex items-center justify-center p-2 bg-muted/20 rounded-md">
                            {h}
                        </div>
                    ))}

                    {/* Data Rows */}
                    {['North', 'South', 'East', 'West'].map(region => (
                        <>
                            <div className="text-[10px] font-bold text-foreground flex items-center justify-center p-2 bg-muted/10 rounded-md">{region}</div>
                            {heatmapData.filter(d => d.region === region).map((cell, i) => {
                                const intensity = cell.value > 60 ? 'bg-blue-900 text-white' : cell.value > 30 ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-900';
                                return (
                                    <div
                                        key={i}
                                        className={cn("text-[10px] font-bold flex items-center justify-center p-3 rounded-md transition-all hover:scale-105 cursor-pointer shadow-sm relative group", intensity)}
                                        onClick={() => exportToCSV(LINKS_DATA.filter(l => l.region === region), `Heatmap_${region}_${cell.hour.replace(':', '')}_Detail`)}
                                    >
                                        {cell.value}%
                                        <div className="absolute opacity-0 group-hover:opacity-100 bottom-full mb-1 bg-black text-white text-[9px] px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none">
                                            {region} @ {cell.hour} <br /> (Click to Export)
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    ))}
                </div>
            </div>
        </div>
    );
}
