import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Download, Clock, Calendar, ArrowRight, ShieldCheck, History, ArrowLeft, ChevronDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { exportToCSV } from '@/utils/exportUtils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts';

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

const generateClosedData = () => {
    const data = [];
    for (const day of DAYS) {
        for (let hour = 0; hour < 24; hour++) {
            // Closures happen more during business hours (8-18)
            let prob = 0.3;
            if (hour >= 9 && hour <= 17) prob = 0.8;

            const count = Math.random() < prob ? (Math.floor(Math.random() * 7) + 1) : 0;

            data.push({
                day,
                hour,
                count,
                details: Array.from({ length: count }).map((_, i) => ({
                    id: `EVT-CLS-${day}-${hour}-${i}`,
                    customer: `Customer_${Math.floor(Math.random() * 20)}`,
                    resolution: ['Auto-Resolved', 'Manual Fix', 'Provider Action'][Math.floor(Math.random() * 3)],
                    severity: ['Critical', 'Major', 'Minor'][Math.floor(Math.random() * 3)],
                    timeToClose: `${Math.floor(Math.random() * 120)}m`
                }))
            });
        }
    }
    return data;
};

const AGING_DATA = generateAgingData();
const CLOSED_DATA = generateClosedData();

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
            'bg-cyan-500/40 border-cyan-500/50 text-cyan-500 hover:bg-cyan-500/50',
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

export function EventAnalyticalHeatmaps() {
    const [selectedAging, setSelectedAging] = useState<any>(null);
    const [selectedClosed, setSelectedClosed] = useState<any>(null);
    const [agingTimeRange, setAgingTimeRange] = useState('All');
    const [closedTimeRange, setClosedTimeRange] = useState('All');

    const TIME_OPTIONS = ['1 Week', '1 Month', '3 Months', '6 Months', '1 Year', 'All'];

    return (
        <div className="space-y-6">
            {/* 1. Event Aging Summary Heatmap */}
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

            {/* 2. Event Closed Per Time Heatmap */}
            <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm flex flex-col h-full bg-gradient-to-br from-card to-background/50">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Event Closure Efficiency Monitor</h3>
                            <p className="text-[10px] text-muted-foreground font-medium">Resolutions Pattern by Hour vs Day</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative flex items-center gap-2 px-3 py-1.5 bg-card border border-border/50 rounded-lg text-[10px] font-black uppercase tracking-wider text-muted-foreground hover:border-primary/30 transition-all cursor-pointer group">
                            <Calendar size={12} className="text-primary" />
                            <select
                                className="bg-transparent border-none outline-none cursor-pointer appearance-none pr-4"
                                value={closedTimeRange}
                                onChange={(e) => setClosedTimeRange(e.target.value)}
                            >
                                {TIME_OPTIONS.map(opt => <option key={opt} value={opt} className="bg-card text-foreground">{opt}</option>)}
                            </select>
                            <ChevronDown size={10} className="absolute right-2 pointer-events-none group-hover:text-primary transition-colors" />
                        </div>
                        <button
                            onClick={() => exportToCSV(CLOSED_DATA.flatMap(d => d.details), 'Event_Closures_Full_Report')}
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-all"
                        >
                            <Download size={14} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-x-auto">
                    <div className="min-w-[800px] flex flex-col gap-1">
                        <div className="flex gap-1 ml-12 mb-2">
                            {Array.from({ length: 24 }).map((_, i) => (
                                <div key={i} className="flex-1 text-center text-[9px] font-bold text-muted-foreground">{i}</div>
                            ))}
                        </div>
                        {DAYS.map(day => (
                            <div key={day} className="flex gap-1 items-center h-8">
                                <div className="w-12 text-[10px] font-bold text-muted-foreground uppercase pr-3 text-right">{day}</div>
                                {Array.from({ length: 24 }).map((_, hour) => {
                                    const cell = CLOSED_DATA.find(d => d.day === day && d.hour === hour);
                                    return (
                                        <HeatmapCell
                                            key={`${day}-${hour}`}
                                            count={cell?.count || 0}
                                            onClick={() => cell?.count && setSelectedClosed(cell)}
                                            intensityLimit={[1, 3, 5]}
                                            colorType="emerald"
                                        />
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-6 text-[10px] font-black text-muted-foreground uppercase tracking-tighter">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-muted/10 border border-border" />
                        <span>No Resolution</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/50" />
                        <span>Standard (1-2)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-teal-500/30 border border-teal-500/50" />
                        <span>Optimized (3-5)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-cyan-500/40 border border-cyan-500/50" />
                        <span>Peak (6+)</span>
                    </div>
                </div>
            </div>

            {/* Aging Detail Modal */}
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
                                onClick={() => exportToCSV(selectedAging.details, `Aging_Details_${selectedAging.region}_${selectedAging.bucket}`)}
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

            {/* Closure Detail Modal */}
            <Dialog open={!!selectedClosed} onOpenChange={(o) => !o && setSelectedClosed(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="sticky top-0 z-50 bg-background/95 backdrop-blur pb-4 border-b">
                        <DialogTitle className="flex items-center justify-between gap-2">
                            <span className="flex items-center gap-4">
                                <button
                                    onClick={() => setSelectedClosed(null)}
                                    className="p-1.5 hover:bg-muted rounded-full transition-colors"
                                    title="Go Back"
                                >
                                    <ArrowLeft size={16} />
                                </button>
                                <span className="flex items-center gap-2">
                                    <ShieldCheck size={18} className="text-emerald-500" />
                                    Closure Analytics: {selectedClosed?.day} @ {selectedClosed?.hour}:00
                                </span>
                            </span>
                            <button
                                onClick={() => exportToCSV(selectedClosed.details, `Closure_Analytics_${selectedClosed.day}_${selectedClosed.hour}`)}
                                className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-zinc-900 rounded border border-border hover:shadow-sm transition-all text-xs font-bold text-primary"
                            >
                                <Download size={14} /> Export CSV
                            </button>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <div className="bg-muted/20 rounded-xl p-4 border border-border/50">
                            <h4 className="text-[10px] font-black uppercase text-muted-foreground mb-4">Severity Analysis (Resolved)</h4>
                            <div className="h-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={[
                                        { name: 'Critical', val: selectedClosed?.details.filter((d: any) => d.severity === 'Critical').length || 0, color: '#ef4444' },
                                        { name: 'Major', val: selectedClosed?.details.filter((d: any) => d.severity === 'Major').length || 0, color: '#f59e0b' },
                                        { name: 'Minor', val: selectedClosed?.details.filter((d: any) => d.severity === 'Minor').length || 0, color: '#0ea5e9' }
                                    ]}>
                                        <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar dataKey="val" radius={[4, 4, 0, 0]} barSize={40}>
                                            {selectedClosed?.details && [
                                                { severity: 'Critical', color: '#ef4444' },
                                                { severity: 'Major', color: '#f59e0b' },
                                                { severity: 'Minor', color: '#0ea5e9' }
                                            ].map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="bg-muted/20 rounded-xl p-4 border border-border/50 overflow-hidden flex flex-col h-[300px]">
                            <h4 className="text-[10px] font-black uppercase text-muted-foreground mb-4">Granular Resolution List</h4>
                            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                                {selectedClosed?.details.map((item: any, i: number) => (
                                    <div key={i} className="flex items-center justify-between p-2 rounded bg-card border border-border/50 text-xs">
                                        <div className="flex flex-col">
                                            <span className="font-bold">{item.customer}</span>
                                            <span className="text-[8px] text-muted-foreground uppercase">{item.severity} • {item.resolution}</span>
                                        </div>
                                        <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded font-black">
                                            {item.timeToClose}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
