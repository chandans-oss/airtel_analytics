import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Download, Clock, Calendar, ArrowRight, ShieldCheck, History, ArrowLeft, ChevronDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { exportToCSV } from '@/utils/exportUtils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

// --- DATA DEFINITIONS ---

const REGIONS = ['North', 'South', 'East', 'West'];
const AGING_BUCKETS = ['< 1h', '1-24h', '1-7D', '7-15D', '15-30D', '> 30D'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const INTENSITY_COLORS = {
    0: 'bg-muted/10 border-transparent',
    1: 'bg-sky-500/20 border-sky-500/30 text-sky-500 hover:bg-sky-500/30',
    2: 'bg-indigo-500/30 border-indigo-500/40 text-indigo-500 hover:bg-indigo-500/40',
    3: 'bg-purple-500/40 border-purple-500/50 text-purple-500 hover:bg-purple-500/50',
};

// --- MOCK DATA GENERATORS ---

const generateAgingData = () => {
    const data = [];
    for (const region of REGIONS) {
        for (const bucket of AGING_BUCKETS) {
            // Probability decreases as aging increases (hopefully!)
            let probability = 0.6;
            if (bucket === '15-30D' || bucket === '> 30D') probability = 0.2;
            else if (bucket === '1-7D' || bucket === '7-15D') probability = 0.4;

            if (region === 'North' || region === 'South') probability += 0.2;

            const count = Math.random() < probability ? Math.floor(Math.random() * (bucket.includes('D') ? 8 : 15)) : 0;

            const getPreciseAging = (b: string) => {
                if (b === '< 1h') return `${Math.floor(Math.random() * 59) + 1}m`;
                if (b === '1-24h') return `${Math.floor(Math.random() * 23) + 1}h`;
                if (b === '1-7D') return `${Math.floor(Math.random() * 6) + 1}D`;
                if (b === '7-15D') return `${Math.floor(Math.random() * 8) + 7}D`;
                if (b === '15-30D') return `${Math.floor(Math.random() * 15) + 15}D`;
                return `${Math.floor(Math.random() * 60) + 30}D`;
            };

            data.push({
                region,
                bucket,
                count,
                details: Array.from({ length: count }).map((_, i) => ({
                    id: `EVT-AGE-${region.substring(0, 1)}-${i}`,
                    customer: `Customer_${Math.floor(Math.random() * 20)}`,
                    severity: i % 3 === 0 ? 'Critical' : 'Major',
                    aging: bucket,
                    preciseTime: getPreciseAging(bucket)
                }))
            });
        }
    }
    return data;
};

const AGING_DATA = generateAgingData();

// --- NEW RAW DATA GENERATOR FOR CLOSURE TIMELINES ---
const generateRawClosureData = () => {
    return Array.from({ length: 1500 }).map((_, i) => {
        // Create a realistic distribution: many fast closures, some medium, fewer long
        const rand = Math.random();
        let durationMinutes;

        if (rand < 0.45) {
            // Fast: 1-15 mins
            durationMinutes = Math.floor(Math.random() * 15) + 1;
        } else if (rand < 0.75) {
            // Medium: 15-60 mins
            durationMinutes = Math.floor(Math.random() * 45) + 15;
        } else if (rand < 0.9) {
            // Slow: 1-4 hours
            durationMinutes = Math.floor(Math.random() * 180) + 60;
        } else if (rand < 0.98) {
            // Very Slow: 4-24 hours
            durationMinutes = Math.floor(Math.random() * 1200) + 240;
        } else {
            // Stuck: > 1 day
            durationMinutes = Math.floor(Math.random() * 5000) + 1440;
        }

        return {
            id: `EVT-RAW-${i}`,
            durationMinutes,
            vendor: ['Ericsson', 'Nokia', 'Huawei', 'Cisco'][Math.floor(Math.random() * 4)],
            severity: ['Critical', 'Major', 'Minor'][Math.floor(Math.random() * 3)],
        };
    });
};

const RAW_CLOSURE_DATA = generateRawClosureData();

// --- SUB-COMPONENTS ---

function HeatmapCell({ count, onClick, intensityLimit = [2, 6, 10], colorType = 'sky' }: any) {
    let intensity = 0;
    if (count >= intensityLimit[2]) intensity = 3;
    else if (count >= intensityLimit[1]) intensity = 2;
    else if (count >= intensityLimit[0]) intensity = 1;

    const colors = {
        sky: [
            'bg-muted/10 border-transparent',
            'bg-sky-500/20 border-sky-500/30 text-sky-500 hover:bg-sky-500/30',
            'bg-indigo-500/30 border-indigo-500/40 text-indigo-500 hover:bg-indigo-500/40',
            'bg-purple-500/40 border-purple-500/50 text-purple-500 hover:bg-purple-500/50',
        ],
        emerald: [
            'bg-muted/10 border-transparent',
            'bg-emerald-500/20 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/30',
            'bg-teal-500/30 border-teal-500/40 text-teal-500 hover:bg-teal-500/40',
            'bg-green-600/40 border-green-600/50 text-green-600 hover:bg-green-600/50',
        ],
        amber: [
            'bg-muted/10 border-transparent',
            'bg-amber-500/20 border-amber-500/30 text-amber-500 hover:bg-amber-500/30',
            'bg-orange-500/30 border-orange-500/40 text-orange-500 hover:bg-orange-500/40',
            'bg-yellow-600/40 border-yellow-600/50 text-yellow-600 hover:bg-yellow-600/50',
        ],
        rose: [
            'bg-muted/10 border-transparent',
            'bg-rose-500/20 border-rose-500/30 text-rose-500 hover:bg-rose-500/30',
            'bg-red-500/30 border-red-500/40 text-red-500 hover:bg-red-500/40',
            'bg-red-700/40 border-red-700/50 text-red-700 hover:bg-red-700/50',
        ]
    };

    const activeColors = colors[colorType as keyof typeof colors] || colors.sky;

    return (
        <button
            onClick={onClick}
            className={cn(
                "flex-1 h-full rounded border transition-all duration-300 relative group overflow-hidden",
                activeColors[intensity],
                count > 0 && "hover:scale-105 hover:z-10 hover:shadow-md"
            )}
        >
            {count > 0 && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[9px] font-black">{count}</span>
                </div>
            )}
        </button>
    );
}

export function EventAgingHeatmap() {
    const [selectedAging, setSelectedAging] = useState<any>(null);
    const [agingTimeRange, setAgingTimeRange] = useState('All');
    const TIME_OPTIONS = ['1 Week', '1 Month', '3 Months', '6 Months', '1 Year', 'All'];

    return (
        <>
            <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm flex flex-col h-full bg-gradient-to-br from-card to-background/50">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                            <History size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Event Aging Summary Analyzer</h3>
                            <p className="text-[10px] text-muted-foreground font-medium">Regional Cross-Section of Ticket Aging</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative flex items-center gap-2 px-3 py-1.5 bg-card border border-border/50 rounded-lg text-[10px] font-black uppercase tracking-wider text-muted-foreground hover:border-primary/30 transition-all cursor-pointer group">
                            <Clock size={12} className="text-primary" />
                            <select
                                className="bg-transparent border-none outline-none cursor-pointer appearance-none pr-4"
                                value={agingTimeRange}
                                onChange={(e) => setAgingTimeRange(e.target.value)}
                            >
                                {TIME_OPTIONS.map(opt => <option key={opt} value={opt} className="bg-card text-foreground">{opt}</option>)}
                            </select>
                            <ChevronDown size={10} className="absolute right-2 pointer-events-none group-hover:text-primary transition-colors" />
                        </div>
                        <button
                            onClick={() => exportToCSV(AGING_DATA.flatMap(d => d.details), 'Event_Aging_Full_Report')}
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-all"
                        >
                            <Download size={14} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-x-auto">
                    <div className="min-w-[700px] flex flex-col gap-1">
                        <div className="flex gap-1 ml-24 mb-2">
                            {AGING_BUCKETS.map(b => (
                                <div key={b} className="flex-1 text-center text-[9px] font-black text-muted-foreground uppercase">{b}</div>
                            ))}
                        </div>
                        {REGIONS.map(region => (
                            <div key={region} className="flex gap-1 items-center h-12">
                                <div className="w-24 text-[10px] font-black text-muted-foreground uppercase pr-4 text-right">{region}</div>
                                {AGING_BUCKETS.map(bucket => {
                                    const cell = AGING_DATA.find(d => d.region === region && d.bucket === bucket);
                                    return (
                                        <HeatmapCell
                                            key={`${region}-${bucket}`}
                                            count={cell?.count || 0}
                                            onClick={() => cell?.count && setSelectedAging(cell)}
                                            intensityLimit={bucket.includes('D') ? [1, 2, 4] : [1, 5, 10]}
                                        />
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-6 text-[10px] font-black text-muted-foreground uppercase tracking-tighter">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-indigo-500/10 border border-border" />
                        <span>Compliance</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-sky-500/20 border border-sky-500/50" />
                        <span>SLA Warning</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-indigo-500/30 border border-indigo-500/50" />
                        <span>At Risk</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-purple-500/40 border border-purple-500/50" />
                        <span>Critical (Chronic)</span>
                    </div>
                </div>
            </div>

            <Dialog open={!!selectedAging} onOpenChange={(o) => !o && setSelectedAging(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="sticky top-0 z-50 bg-background/95 backdrop-blur pb-4 border-b">
                        <DialogTitle className="flex items-center justify-between gap-2">
                            <span className="flex items-center gap-4">
                                <button
                                    onClick={() => setSelectedAging(null)}
                                    className="p-1.5 hover:bg-muted rounded-full transition-colors"
                                    title="Go Back"
                                >
                                    <ArrowLeft size={16} />
                                </button>
                                <span className="flex items-center gap-2">
                                    <History size={18} className="text-indigo-500" />
                                    Aging Details: {selectedAging?.region} - {selectedAging?.bucket}
                                </span>
                            </span>
                            <button
                                onClick={() => exportToCSV(selectedAging?.details || [], `Aging_Details_${selectedAging?.region}_${selectedAging?.bucket}`)}
                                className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-zinc-900 rounded border border-border hover:shadow-sm transition-all text-xs font-bold text-primary"
                            >
                                <Download size={14} /> Export CSV
                            </button>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <div className="bg-muted/20 rounded-xl p-4 border border-border/50">
                            <h4 className="text-[10px] font-black uppercase text-muted-foreground mb-4">Severity Split</h4>
                            <div className="h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Critical', value: selectedAging?.details.filter((d: any) => d.severity === 'Critical').length || 0 },
                                                { name: 'Major', value: selectedAging?.details.filter((d: any) => d.severity === 'Major').length || 0 }
                                            ]}
                                            dataKey="value"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                        >
                                            <Cell fill="#ef4444" />
                                            <Cell fill="#f59e0b" />
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="bg-muted/20 rounded-xl p-4 border border-border/50 overflow-hidden flex flex-col">
                            <h4 className="text-[10px] font-black uppercase text-muted-foreground mb-4">Top Customers Involved</h4>
                            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                                {selectedAging?.details.map((item: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between p-2 rounded bg-card border border-border/50 text-xs">
                                        <div className="flex flex-col">
                                            <span className="font-bold">{item.customer}</span>
                                            <span className="text-[8px] text-muted-foreground uppercase">{item.severity}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-1.5 py-0.5 rounded font-black whitespace-nowrap">
                                                {item.preciseTime} AGED
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

export function EventClosureHeatmap() {
    // Configuration State
    const [intervalValue, setIntervalValue] = useState<number>(15);
    const [intervalUnit, setIntervalUnit] = useState<'Minutes' | 'Hours' | 'Days'>('Minutes');

    // Derived Data Calculation
    const chartData = useMemo(() => {
        const multiplier = intervalUnit === 'Hours' ? 60 : intervalUnit === 'Days' ? 1440 : 1;
        const bucketSize = intervalValue * multiplier;

        const buckets: Record<string, { name: string, rangeStart: number, count: number, critical: number, major: number }> = {};

        // Dynamic aggregations
        RAW_CLOSURE_DATA.forEach(evt => {
            const bucketIndex = Math.floor(evt.durationMinutes / bucketSize);
            const rangeStart = bucketIndex * bucketSize;
            const rangeEnd = (bucketIndex + 1) * bucketSize;

            // Format Label
            let label = '';
            if (intervalUnit === 'Minutes') {
                label = `${rangeStart}-${rangeEnd}m`;
            } else if (intervalUnit === 'Hours') {
                label = `${(rangeStart / 60).toFixed(1)}-${(rangeEnd / 60).toFixed(1)}h`;
            } else {
                label = `${(rangeStart / 1440).toFixed(1)}-${(rangeEnd / 1440).toFixed(1)}d`;
            }

            // Cap the long tail 
            let bucketKey = label;
            let sortOrder = bucketIndex;

            // Group tail if too long (optional, keeping simple for now)
            if (bucketIndex >= 15) {
                const limitVal = 15 * intervalValue;
                bucketKey = `> ${limitVal} ${intervalUnit}`;
                sortOrder = 999;
            }

            if (!buckets[bucketKey]) {
                buckets[bucketKey] = { name: bucketKey, rangeStart: sortOrder, count: 0, critical: 0, major: 0 };
            }

            buckets[bucketKey].count++;
            if (evt.severity === 'Critical') buckets[bucketKey].critical++;
            if (evt.severity === 'Major') buckets[bucketKey].major++;
        });

        return Object.values(buckets).sort((a, b) => a.rangeStart - b.rangeStart);
    }, [intervalValue, intervalUnit]);

    return (
        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm flex flex-col h-full bg-gradient-to-br from-card to-background/50 relative overflow-hidden">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-6 z-10 relative">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Event Closure Efficiency</h3>
                        <p className="text-[10px] text-muted-foreground font-medium">
                            Distribution of Resolution Times (Interval: {intervalValue} {intervalUnit})
                        </p>
                    </div>
                </div>

                {/* Configuration Controls */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-muted/30 rounded-lg border border-border/50 p-1">
                        <div className="flex items-center px-2 gap-2 border-r border-border/50">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Interval:</span>
                            <div className="relative flex items-center">
                                <input
                                    type="number"
                                    min="1"
                                    max="1440"
                                    list="interval-presets"
                                    value={intervalValue}
                                    onChange={(e) => setIntervalValue(Number(e.target.value) || 1)}
                                    className="w-12 bg-transparent text-xs font-bold text-right outline-none text-primary appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <datalist id="interval-presets">
                                    {[5, 10, 15, 20, 30, 60].map((v) => (
                                        <option key={v} value={v} />
                                    ))}
                                </datalist>
                            </div>
                        </div>
                        <div className="flex items-center px-1">
                            <select
                                value={intervalUnit}
                                onChange={(e) => setIntervalUnit(e.target.value as any)}
                                className="bg-transparent text-[10px] font-bold uppercase text-muted-foreground outline-none cursor-pointer hover:text-primary transition-colors"
                            >
                                <option value="Minutes">Mins</option>
                                <option value="Hours">Hours</option>
                                <option value="Days">Days</option>
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={() => exportToCSV(RAW_CLOSURE_DATA, 'Closure_Efficiency_Raw')}
                        className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-all border border-transparent hover:border-border"
                        title="Export Raw Data"
                    >
                        <Download size={14} />
                    </button>
                </div>
            </div>

            {/* Main Chart Area */}
            <div className="flex-1 w-full min-h-[250px] relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                        barSize={40}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <Tooltip
                            cursor={{ fill: 'hsl(var(--muted)/0.2)' }}
                            content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                        <div className="rounded-lg border border-border bg-popover p-3 shadow-lg">
                                            <p className="text-xs font-bold mb-2 text-popover-foreground">{label} Range</p>
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between gap-4 text-xs">
                                                    <span className="text-muted-foreground">Total Closed:</span>
                                                    <span className="font-mono font-bold text-primary">{data.count}</span>
                                                </div>
                                                <div className="h-px bg-border/50 my-1" />
                                                <div className="flex items-center justify-between gap-4 text-[10px]">
                                                    <span className="text-red-500">Critical:</span>
                                                    <span className="font-mono">{data.critical}</span>
                                                </div>
                                                <div className="flex items-center justify-between gap-4 text-[10px]">
                                                    <span className="text-amber-500">Major:</span>
                                                    <span className="font-mono">{data.major}</span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        {/* Gradient Definitions */}
                        <defs>
                            <linearGradient id="barGradientFast" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                                <stop offset="100%" stopColor="#10b981" stopOpacity={0.3} />
                            </linearGradient>
                            <linearGradient id="barGradientMedium" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8} />
                                <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.3} />
                            </linearGradient>
                            <linearGradient id="barGradientSlow" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                                <stop offset="100%" stopColor="#ef4444" stopOpacity={0.3} />
                            </linearGradient>
                        </defs>
                        <Bar
                            dataKey="count"
                            radius={[6, 6, 0, 0]}
                            animationDuration={1000}
                        >
                            {chartData.map((entry, index) => {
                                // Dynamic coloring based on position in the distribution
                                const percentage = index / Math.max(chartData.length, 1);
                                let fill = "url(#barGradientFast)";
                                if (percentage > 0.3) fill = "url(#barGradientMedium)";
                                if (percentage > 0.6) fill = "url(#barGradientSlow)";

                                return <Cell key={`cell-${index}`} fill={fill} strokeWidth={0} />;
                            })}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 flex items-center justify-between text-[10px] text-muted-foreground/70">
                <div className="flex gap-4">
                    <span className="flex items-center gap-1.5">
                        <span className="block w-2 h-2 rounded-full bg-emerald-500"></span> Fast Resolution
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="block w-2 h-2 rounded-full bg-amber-500"></span> Moderate
                    </span>
                    <span className="flex items-center gap-1.5">
                        <span className="block w-2 h-2 rounded-full bg-red-500"></span> Delayed
                    </span>
                </div>
                <div>
                    Total Closures Monitored: <span className="font-mono font-bold text-foreground">{RAW_CLOSURE_DATA.length}</span>
                </div>
            </div>
        </div>
    );
}
