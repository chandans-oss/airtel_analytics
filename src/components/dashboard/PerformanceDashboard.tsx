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
    MousePointer2,
    PieChart as PieChartIcon,
    TableProperties
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
    Cell, CartesianGrid, Legend, PieChart, Pie, LabelList,
    AreaChart, Area, LineChart, Line, ScatterChart, Scatter, ZAxis, ReferenceLine, RadarChart, PolarGrid, PolarAngleAxis, Radar
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
        const daysTo80 = currentUtil < 80 && trend === 'Rising' ? Math.floor((80 - currentUtil) / (momGrowth / 30)) : 0;

        // Stability Score
        const variance = isBursty ? 25 + Math.random() * 30 : 5 + Math.random() * 10;
        const stabilityScoreValue = 100 - (variance / 0.6) - (trend === 'Rising' ? 10 : 0);
        const stabilityStr = stabilityScoreValue > 80 ? 'High' : stabilityScoreValue > 50 ? 'Medium' : 'Low';

        // Errors & Performance
        const packetLoss = currentUtil > 85 ? (currentUtil - 80) * 0.8 + Math.random() : (currentUtil > 70 ? Math.random() * 0.5 : 0);
        const latency = 15 + (currentUtil > 70 ? (currentUtil - 60) * 2.5 : 0) + (isBursty ? 20 : 0);

        // Failover
        const backupUtil = Math.random() * 40;
        const projectedFailoverUtil = Math.min(120, currentUtil + backupUtil);

        // Efficiency
        const overprovisionPenalty = currentUtil < 5 ? 40 : (currentUtil < 15 ? 20 : 0);
        const efficiencyScore = Math.floor((currentUtil * 0.6) + (stabilityScoreValue * 0.4) - overprovisionPenalty);

        return {
            id,
            name: `${region}-Link-${i}`,
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
            daysTo80: daysTo80 || (currentUtil >= 80 ? 1 : 999),
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

const ALL_LINKS = generateMockLinks(200);

export function PerformanceDashboard() {
    const { setSelectedModule } = useInventoryStore();
    const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
    const [selectedBucket, setSelectedBucket] = useState<string | null>(null);

    // --- INTERDEPENDENT FILTERING LOGIC ---
    const filteredLinks = useMemo(() => {
        let data = ALL_LINKS;
        if (selectedRegion) data = data.filter(l => l.region === selectedRegion);
        if (selectedBucket) {
            if (selectedBucket === 'Critical') data = data.filter(l => l.currentUtil >= 90);
            if (selectedBucket === 'High') data = data.filter(l => l.currentUtil >= 70 && l.currentUtil < 90);
            if (selectedBucket === 'Medium') data = data.filter(l => l.currentUtil >= 50 && l.currentUtil < 70);
            if (selectedBucket === 'Low') data = data.filter(l => l.currentUtil < 10);
        }
        return data;
    }, [selectedRegion, selectedBucket]);

    // --- CHART DATA GENERATORS ---

    // 1. Regional Distribution Plot
    const regionalData = useMemo(() => {
        const counts = {} as Record<string, number>;
        ALL_LINKS.forEach(l => {
            counts[l.region] = (counts[l.region] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, []);

    // 2. Efficiency Heat Radar
    const efficiencyRadarData = useMemo(() => {
        const regions = ['North', 'South', 'East', 'West'];
        return regions.map(r => {
            const rLinks = ALL_LINKS.filter(l => l.region === r);
            const avgEff = rLinks.reduce((acc, curr) => acc + curr.efficiencyScore, 0) / rLinks.length;
            const avgStab = rLinks.reduce((acc, curr) => acc + curr.stabilityValue, 0) / rLinks.length;
            const avgGrowth = rLinks.filter(l => l.trend === 'Rising').length / rLinks.length * 100;
            return {
                subject: r,
                Efficiency: Math.floor(avgEff),
                Stability: Math.floor(avgStab),
                Risk: Math.floor(avgGrowth),
                fullMark: 100
            };
        });
    }, []);

    // 3. Utilization Buckets
    const bucketData = useMemo(() => {
        const data = selectedRegion ? ALL_LINKS.filter(l => l.region === selectedRegion) : ALL_LINKS;
        return [
            { name: 'Critical', value: data.filter(l => l.currentUtil >= 90).length, fill: '#ef4444' },
            { name: 'High', value: data.filter(l => l.currentUtil >= 70 && l.currentUtil < 90).length, fill: '#f59e0b' },
            { name: 'Medium', value: data.filter(l => l.currentUtil >= 50 && l.currentUtil < 70).length, fill: '#3b82f6' },
            { name: 'Low', value: data.filter(l => l.currentUtil < 10).length, fill: '#10b981' }
        ];
    }, [selectedRegion]);

    // 4. Forecast Plot
    const forecastRiskData = useMemo(() => {
        return filteredLinks
            .filter(l => l.daysTo80 < 90 && l.daysTo80 > 1)
            .sort((a, b) => a.daysTo80 - b.daysTo80)
            .slice(0, 10)
            .map(l => ({
                name: l.name,
                days: l.daysTo80,
                util: l.currentUtil,
                fullData: l
            }));
    }, [filteredLinks]);

    // 5. Temporal Pattern Matrix
    const temporalData = useMemo(() => {
        const regions = ['North', 'South', 'East', 'West'];
        const hours = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];
        return regions.map(r => {
            const rLinks = ALL_LINKS.filter(l => l.region === r);
            return {
                region: r,
                ...hours.reduce((acc, h) => {
                    const base = rLinks.reduce((a, c) => a + c.currentUtil, 0) / rLinks.length;
                    const mod = (h === '12:00' || h === '16:00') ? 1.4 : 0.6;
                    acc[h] = Math.floor(base * mod);
                    return acc;
                }, {} as any)
            };
        });
    }, []);

    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-500 pb-10 max-w-[1600px] mx-auto">
            {/* INTERACTIVE HEADER */}
            <div className="flex flex-col gap-1 px-1">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSelectedModule('unified')} className="p-1 rounded-lg hover:bg-primary/10 text-primary transition-all flex items-center justify-center border border-primary/20 bg-primary/5 shadow-sm">
                            <ChevronLeft size={20} strokeWidth={2.5} />
                        </button>
                        <div className="h-6 w-1 bg-primary rounded-full shadow-[0_0_10px_rgba(0,165,142,0.6)]" />
                        <div>
                            <h2 className="text-[15px] font-black uppercase tracking-[0.2em] text-foreground/90 leading-none">Performance Intelligence</h2>
                            <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-50 mt-1">Dynamic Traffic Simulation • Regional Load Correlation</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {(selectedRegion || selectedBucket) && (
                            <button
                                onClick={() => { setSelectedRegion(null); setSelectedBucket(null); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-destructive/10 text-destructive text-[9px] font-black uppercase border border-destructive/20 hover:bg-destructive hover:text-white transition-all shadow-sm"
                            >
                                <ZapOff size={12} /> Clear Filters
                            </button>
                        )}
                        <button onClick={() => exportToCSV(filteredLinks, 'Performance_Audit_Export')} className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-primary text-white text-[9px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                            <Download size={14} /> Full Audit
                        </button>
                    </div>
                </div>
            </div>

            {/* --- TOP ROW: INTERDEPENDENT KPI PLOTS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* 1. Regional Traffic Hub */}
                <div className="col-span-1 rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between group">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Network size={14} className="text-primary" /> Regional Assets
                        </h3>
                        <button
                            onClick={(e) => { e.stopPropagation(); exportToCSV(regionalData, 'Regional_Asset_Counts'); }}
                            className="p-1.5 hover:bg-muted rounded text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Export Counts"
                        >
                            <Download size={12} />
                        </button>
                    </div>
                    <div className="flex-1 min-h-[140px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={regionalData} onClick={(d) => d && setSelectedRegion(d.activeLabel || null)}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 900 }} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: 'hsl(var(--primary)/0.05)' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontSize: '10px' }} />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]} cursor="pointer">
                                    {regionalData.map((entry, index) => (
                                        <Cell key={index} fill={selectedRegion === entry.name ? '#00a58e' : '#94a3b8'} fillOpacity={selectedRegion === entry.name ? 1 : 0.4} />
                                    ))}
                                    <LabelList dataKey="value" position="top" style={{ fontSize: '9px', fontWeight: '900', fill: 'hsl(var(--muted-foreground))' }} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-[8px] text-muted-foreground uppercase font-bold text-center mt-2 opacity-60">Click Bar to Filter/Export Region</p>
                </div>

                {/* 2. Utilization Intensity Pyramid */}
                <div className="col-span-1 rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between group">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Activity size={14} className="text-amber-500" /> Util Intensity
                        </h3>
                        <button
                            onClick={(e) => { e.stopPropagation(); exportToCSV(bucketData, 'Utilization_Bucket_Counts'); }}
                            className="p-1.5 hover:bg-muted rounded text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Export Counts"
                        >
                            <Download size={12} />
                        </button>
                    </div>
                    <div className="flex-1 min-h-[140px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={bucketData}
                                    innerRadius={45}
                                    outerRadius={60}
                                    paddingAngle={5}
                                    dataKey="value"
                                    onClick={(d) => d && setSelectedBucket(d.name)}
                                    cursor="pointer"
                                >
                                    {bucketData.map((entry, index) => (
                                        <Cell key={index} fill={entry.fill} fillOpacity={selectedBucket === entry.name ? 1 : 0.5} stroke={selectedBucket === entry.name ? 'white' : 'transparent'} strokeWidth={2} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '10px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-[8px] text-muted-foreground uppercase font-bold text-center mt-2 opacity-60">Click Segment to Isolate/Export</p>
                </div>

                {/* 3. Regional Health Profile Radar */}
                <div className="col-span-1 lg:col-span-2 rounded-2xl border border-border bg-card p-5 shadow-sm flex flex-col group relative">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Shuffle size={14} className="text-indigo-500" /> Operational Matrix Correlation
                        </h3>
                        <button
                            onClick={(e) => { e.stopPropagation(); exportToCSV(efficiencyRadarData, 'Regional_Efficiency_Radar_Stats'); }}
                            className="p-2 hover:bg-muted rounded-xl text-muted-foreground opacity-0 group-hover:opacity-100 transition-all border border-transparent hover:border-border"
                        >
                            <Download size={14} />
                        </button>
                    </div>
                    <div className="flex-1 min-h-[140px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={efficiencyRadarData} margin={{ top: 0, right: 30, bottom: 0, left: 30 }}>
                                <PolarGrid strokeOpacity={0.1} />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 900 }} />
                                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '10px' }} />
                                <Radar name="Regional Health" dataKey="Efficiency" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
                                <Radar name="Stability" dataKey="Stability" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                                <Radar name="Risk Index" dataKey="Risk" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} />
                                <Legend wrapperStyle={{ fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* --- MIDDLE ROW: DEEP-SCAN INTERACTIVE PLOTS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Capacity Breach Forecast */}
                <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col group">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Clock size={16} className="text-destructive animate-pulse" />
                            Time-to-Breach Simulation ({selectedRegion || 'Global'})
                        </h3>
                        <button onClick={() => exportToCSV(forecastRiskData, `Breach_Risk_Forecast_${selectedRegion || 'Global'}`)} className="p-2 hover:bg-muted rounded-lg text-muted-foreground bg-muted/30 border border-border/50 transition-all opacity-0 group-hover:opacity-100"><Download size={14} /></button>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={forecastRiskData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                                <XAxis type="number" domain={[0, 90]} tick={{ fontSize: 10, fontWeight: 700 }} />
                                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 10, fontWeight: 800, fill: 'hsl(var(--foreground))' }} />
                                <Tooltip cursor={{ fill: 'hsl(var(--primary)/0.05)' }} contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
                                <Bar dataKey="days" radius={[0, 6, 6, 0]} barSize={22} cursor="pointer" onClick={(d) => d && exportToCSV([d.fullData], `Risk_Audit_${d.name}`)}>
                                    {forecastRiskData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.days < 15 ? '#ef4444' : entry.days < 45 ? '#f59e0b' : '#3b82f6'} />
                                    ))}
                                    <LabelList dataKey="days" position="right" style={{ fontSize: '11px', fontWeight: 'black', fill: '#ef4444' }} formatter={(v: any) => `${v}d`} />
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Efficiency Correlation Plot */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col group">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Gauge size={16} className="text-emerald-500" /> Efficiency vs Utilization Scatter
                        </h3>
                        <button onClick={() => exportToCSV(filteredLinks.slice(0, 50), 'Efficiency_Scatter_Data')} className="p-2 hover:bg-muted rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 transition-all"><Download size={14} /></button>
                    </div>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis type="number" dataKey="currentUtil" name="Utilization" unit="%" tick={{ fontSize: 9 }} />
                                <YAxis type="number" dataKey="efficiencyScore" name="Efficiency" tick={{ fontSize: 9 }} />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '12px', fontSize: '10px' }} />
                                <Scatter name="Links" data={filteredLinks.slice(0, 50)} fill="#10b981">
                                    {filteredLinks.slice(0, 50).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.currentUtil > 80 ? '#ef4444' : '#10b981'} fillOpacity={0.6} strokeWidth={1} />
                                    ))}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="text-[9px] text-center text-muted-foreground mt-4 italic font-bold uppercase tracking-tight opacity-60">
                        High Utilization with Low Efficiency indicates <span className="text-red-600 font-extrabold">Structural Congestion</span>.
                    </p>
                </div>
            </div>

            {/* --- BOTTOM SECTION: DATA INVENTORY --- */}
            <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden border-t-4 border-t-primary">
                <div className="p-5 border-b border-border/50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/20"><MonitorPlay size={18} /></div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Diagnostic Performance Table</h3>
                            <div className="flex gap-2 mt-1">
                                {selectedRegion && <span className="text-[9px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">Region: {selectedRegion}</span>}
                                {selectedBucket && <span className="text-[9px] font-black text-amber-600 bg-amber-600/10 px-2 py-0.5 rounded-full border border-amber-600/20">Bucket: {selectedBucket}</span>}
                                <span className="text-[9px] font-black text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border/50">{filteredLinks.length} Segments Linked</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => exportToCSV(filteredLinks, 'Performance_Diagnostic_Inventory')} className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-[11px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95">
                        <Download size={16} /> Export Detailed Dataset
                    </button>
                </div>
                <div className="max-h-[500px] overflow-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="text-[10px] uppercase font-black text-muted-foreground bg-muted/30 sticky top-0 z-10 backdrop-blur-md border-b border-border/50">
                            <tr>
                                <th className="p-4">Link Profile</th>
                                <th className="p-4 text-center">Trend Focus</th>
                                <th className="p-4 text-center">Efficiency Score</th>
                                <th className="p-4 text-center w-[200px]">Pulse Load (Util %)</th>
                                <th className="p-4 text-right">Forecasted Event</th>
                            </tr>
                        </thead>
                        <tbody className="text-[11px] font-bold divide-y divide-border/10">
                            {filteredLinks.map((row, i) => (
                                <tr key={i} className="hover:bg-primary/5 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-black text-foreground group-hover:text-primary transition-colors cursor-pointer">{row.name}</span>
                                            <span className="text-[9px] text-muted-foreground font-mono">{row.id} • {row.region}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter",
                                            row.trend === 'Rising' ? "bg-red-500/10 text-red-600 border border-red-200" :
                                                row.trend === 'Declining' ? "bg-emerald-500/10 text-emerald-600 border border-emerald-200" : "bg-muted text-muted-foreground"
                                        )}>
                                            {row.trend === 'Rising' ? <TrendingUp size={12} /> : row.trend === 'Declining' ? <TrendingDown size={12} /> : <Activity size={12} />}
                                            {row.momGrowth}% MoM
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className={cn("text-sm font-black tabular-nums", row.efficiencyScore > 70 ? "text-emerald-600" : row.efficiencyScore < 30 ? "text-red-600" : "text-amber-600")}>
                                                {row.efficiencyScore}
                                            </span>
                                            <span className="text-[8px] uppercase opacity-50">Score Index</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden shadow-inner border border-border/30">
                                                <div className={cn("h-full transition-all duration-700", row.currentUtil > 85 ? "bg-red-500" : row.currentUtil > 65 ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${row.currentUtil}%` }} />
                                            </div>
                                            <span className="min-w-[40px] text-right font-black tabular-nums font-mono text-[10px]">{row.currentUtil}%</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className={cn("text-[10px] font-black uppercase", row.daysTo80 < 30 ? "text-red-500" : "text-muted-foreground")}>
                                                {row.daysTo80 < 90 ? `Breach in ${row.daysTo80} Days` : 'Steady State'}
                                            </span>
                                            <span className="text-[8px] text-muted-foreground font-bold italic opacity-60">Linear Regression Confidence: 94%</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* --- TEMPORAL PATTERN RADAR FOOTER --- */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm border-l-4 border-l-primary flex flex-col lg:flex-row gap-8 items-center group">
                <div className="w-full lg:w-1/3">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-primary/10 text-primary rounded-xl"><History size={20} /></div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Regional Peak Correlator</h3>
                        </div>
                        <button onClick={() => exportToCSV(temporalData, 'Temporal_Peak_Baseline')} className="p-2 hover:bg-muted rounded-lg text-muted-foreground opacity-0 group-hover:opacity-100 transition-all"><Download size={14} /></button>
                    </div>
                    <p className="text-[11px] leading-relaxed text-muted-foreground font-medium uppercase tracking-tight opacity-70">
                        Dynamic cross-region load simulation. The center plot shows real-time temporal baseline shifts.
                        Clicking any peak isolates <span className="text-primary font-black">Congestion Windows</span> across the entire fleet.
                    </p>
                    <div className="grid grid-cols-2 gap-2 mt-6">
                        {['00:00', '08:00', '12:00', '20:00'].map(h => (
                            <div key={h} className="p-3 bg-muted/30 rounded-xl border border-border/50 flex flex-col items-center">
                                <span className="text-[10px] font-black text-muted-foreground">{h} Window</span>
                                <span className="text-lg font-black text-foreground">{(Math.random() * 40 + 30).toFixed(1)}%</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex-1 h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={temporalData}>
                            <defs>
                                <linearGradient id="colorNorth" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.05} vertical={false} />
                            <XAxis dataKey="region" hide />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '10px' }} />
                            <Area type="monotone" dataKey="12:00" stroke="#3b82f6" fillOpacity={1} fill="url(#colorNorth)" strokeWidth={3} />
                            <Area type="monotone" dataKey="16:00" stroke="#10b981" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />
                            <Area type="monotone" dataKey="20:00" stroke="#f59e0b" fillOpacity={0} strokeWidth={2} strokeDasharray="5 5" />
                            <Legend wrapperStyle={{ fontSize: '9px', fontWeight: 'black', textTransform: 'uppercase' }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
