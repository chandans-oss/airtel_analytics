import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Download, ChevronRight, X, Clock, Calendar, AlertCircle, Filter } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { exportToCSV } from '@/utils/exportUtils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis } from 'recharts';

// --- MOCK DATA GENERATION ---

// Business Hours Definitions
const BUSINESS_HOURS_START = 8;
const BUSINESS_HOURS_END = 18;

// Days
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Intensity Levels
const INTENSITY_COLORS = {
    0: 'bg-muted/10 border-transparent', // No activity
    1: 'bg-amber-500/20 border-amber-500/30 text-amber-500 hover:bg-amber-500/30', // Low (1-3)
    2: 'bg-orange-500/30 border-orange-500/40 text-orange-500 hover:bg-orange-500/40', // Medium (4-6)
    3: 'bg-red-500/40 border-red-500/50 text-red-500 hover:bg-red-500/50', // High (7+)
};

// Generate Mock Data for Heatmap
// Returns an array of { day: string, hour: number, count: number, events: Array<any> }
const generateHeatmapData = () => {
    const data = [];
    const eventTypes = ['Link Down', 'High CPU', 'BGP Flap', 'Interface Reset', 'Power Failure'];
    const customers = ['DABUR', 'KPMG', 'GOVT', 'HATSUN', 'PAAYAS'];
    const sevs = ['Critical', 'Major', 'Minor'];

    for (let d = 0; d < DAYS.length; d++) {
        const dayName = DAYS[d];
        const isWeekend = dayName === 'Sat' || dayName === 'Sun';

        for (let h = 0; h < 24; h++) {
            // Determine probability based on business hours and weekday
            let probability = 0.2;
            if (!isWeekend && h >= BUSINESS_HOURS_START && h <= BUSINESS_HOURS_END) {
                probability = 0.7; // Higher activity during BH
            } else if (isWeekend && h >= 10 && h <= 14) {
                probability = 0.4; // Some activity on weekends
            }

            // Generate event count
            let count = 0;
            if (Math.random() < probability) {
                count = Math.floor(Math.random() * 10); // 0 to 9 events
            }

            // Generate specific event details for this cell
            const cellEvents = [];
            for (let k = 0; k < count; k++) {
                cellEvents.push({
                    id: `${dayName}-${h}-${k}`,
                    type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
                    customer: customers[Math.floor(Math.random() * customers.length)],
                    severity: sevs[Math.floor(Math.random() * sevs.length)],
                    timestamp: `${dayName} ${h}:00`,
                    status: Math.random() > 0.5 ? 'Active' : 'Suppressed',
                    details: 'Automated generated event'
                });
            }

            data.push({
                day: dayName,
                hour: h,
                count: count,
                events: cellEvents
            });
        }
    }
    return data;
};

const HEATMAP_DATA = generateHeatmapData();

export function EventHeatmapWidget() {
    const [selectedCell, setSelectedCell] = useState<any | null>(null);
    const [filter, setFilter] = useState<'All' | 'Before' | 'During' | 'After'>('All');

    // Filter Logic
    const filteredData = useMemo(() => {
        if (filter === 'All') return HEATMAP_DATA;

        return HEATMAP_DATA.map(item => {
            let matches = false;
            // Before BH: < 8
            if (filter === 'Before' && item.hour < BUSINESS_HOURS_START) matches = true;
            // During BH: 8 <= h <= 18
            if (filter === 'During' && item.hour >= BUSINESS_HOURS_START && item.hour <= BUSINESS_HOURS_END) matches = true;
            // After BH: > 18
            if (filter === 'After' && item.hour > BUSINESS_HOURS_END) matches = true;

            // If not matches filter, just return empty events but keep structure to maintain grid alignment? 
            // Or render as "opacity-20"?
            // Re-reading usage: Usually heatmaps dim the irrelevant cells.
            return {
                ...item,
                isDimmed: !matches
            };
        });
    }, [filter]);

    // Analytics for Modal
    const analytics = useMemo(() => {
        if (!selectedCell) return null;

        const typeCounts: Record<string, number> = {};
        const severityCounts: Record<string, number> = {};

        selectedCell.events.forEach((e: any) => {
            typeCounts[e.type] = (typeCounts[e.type] || 0) + 1;
            severityCounts[e.severity] = (severityCounts[e.severity] || 0) + 1;
        });

        return {
            types: Object.entries(typeCounts).map(([name, value]) => ({ name, value })),
            severities: Object.entries(severityCounts).map(([name, value]) => ({ name, value }))
        };
    }, [selectedCell]);

    const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#a855f7'];

    return (
        <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm flex flex-col h-full bg-gradient-to-br from-card to-background/50">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Clock size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Event Distribution by Business Hours</h3>
                        <p className="text-[10px] text-muted-foreground font-medium">Interactive Heatmap Analysis</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-muted/20 p-1 rounded-lg border border-border/50">
                    {(['All', 'Before', 'During', 'After'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition-all",
                                filter === f
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                        >
                            {f === 'All' ? 'All' : `${f} BH`}
                        </button>
                    ))}
                    <div className="w-px h-4 bg-border/50 mx-1" />
                    <button
                        onClick={() => exportToCSV(
                            filteredData.flatMap(d => d.events),
                            `Event_Heatmap_Global_${filter}`
                        )}
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-all"
                        title="Export Current View"
                    >
                        <Download size={14} />
                    </button>
                </div>
            </div>

            {/* Heatmap Grid */}
            <div className="flex-1 overflow-x-auto pb-2">
                <div className="min-w-[800px] flex flex-col gap-1">
                    {/* X-Axis Labels (Hours) */}
                    <div className="flex gap-1 ml-12 mb-2">
                        {Array.from({ length: 24 }).map((_, i) => (
                            <div key={i} className="flex-1 text-center text-[9px] font-bold text-muted-foreground">
                                {i}
                            </div>
                        ))}
                    </div>

                    {/* Rows */}
                    {DAYS.map((day) => (
                        <div key={day} className="flex gap-1 items-center h-8">
                            {/* Y-Axis Label */}
                            <div className="w-12 text-[10px] font-bold text-muted-foreground uppercase flex-shrink-0 text-right pr-3">
                                {day}
                            </div>

                            {/* Cells */}
                            {filteredData
                                .filter(d => d.day === day)
                                .sort((a, b) => a.hour - b.hour)
                                .map((cell, idx) => {
                                    // Determine intensity
                                    let intensity = 0;
                                    if (cell.count >= 7) intensity = 3;
                                    else if (cell.count >= 4) intensity = 2;
                                    else if (cell.count >= 1) intensity = 1;

                                    const dimClass = (cell as any).isDimmed ? "opacity-10 grayscale" : "";

                                    return (
                                        <button
                                            key={`${day}-${idx}`}
                                            onClick={() => !((cell as any).isDimmed) && setSelectedCell(cell)}
                                            className={cn(
                                                "flex-1 h-full rounded border transition-all duration-300 relative group overflow-hidden",
                                                INTENSITY_COLORS[intensity as keyof typeof INTENSITY_COLORS],
                                                dimClass,
                                                !((cell as any).isDimmed) && "hover:scale-110 hover:z-10 hover:shadow-lg focus:ring-2 focus:ring-primary/50"
                                            )}
                                            title={`${day} @ ${cell.hour}:00 - ${cell.count} Events`}
                                            disabled={!!(cell as any).isDimmed}
                                        >
                                            {intensity > 0 && (
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-[9px] font-black">{cell.count}</span>
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="mt-6 flex items-center justify-end gap-6 text-[10px] font-medium text-muted-foreground">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-muted/10 border border-border" />
                    <span>No Activity</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/50" />
                    <span>Low (1-3)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-orange-500/30 border border-orange-500/50" />
                    <span>Medium (4-6)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-red-500/40 border border-red-500/50" />
                    <span>High (7+)</span>
                </div>
            </div>

            {/* Detailed Analytics Modal - Redesigned per User Request (Images 2 & 3) */}
            <Dialog open={!!selectedCell} onOpenChange={(o) => !o && setSelectedCell(null)}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-[#F8F9FA] dark:bg-zinc-950 p-6">
                    <DialogHeader className="mb-6">
                        <DialogTitle className="flex items-center justify-between">
                            <span className="flex items-center gap-2 text-xl font-bold">
                                <span className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                    <Clock size={20} />
                                </span>
                                Analytics for {selectedCell?.day} @ {selectedCell?.hour}:00
                            </span>
                            <button
                                onClick={() => exportToCSV(selectedCell.events, `Events_${selectedCell.day}_${selectedCell.hour}`)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-zinc-900 rounded-md border border-border hover:shadow-sm transition-all text-xs font-bold text-primary"
                            >
                                <Download size={14} /> Export CSV
                            </button>
                        </DialogTitle>
                    </DialogHeader>

                    {selectedCell && (
                        <div className="space-y-6">

                            {/* 1. KPI Cards (Image 2 style) */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-sm border border-border/50 border-l-4 border-l-blue-500">
                                    <p className="text-[10px] font-bold uppercase text-blue-500 mb-1">Total Events</p>
                                    <p className="text-2xl font-black text-foreground">{selectedCell.count}</p>
                                </div>
                                <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-sm border border-border/50 border-l-4 border-l-purple-500">
                                    <p className="text-[10px] font-bold uppercase text-purple-500 mb-1">With Data</p>
                                    <p className="text-2xl font-black text-foreground">{Math.floor(selectedCell.count * 0.8)}</p>
                                </div>
                                <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-sm border border-border/50 border-l-4 border-l-emerald-500">
                                    <p className="text-[10px] font-bold uppercase text-emerald-500 mb-1">Day Type</p>
                                    <p className="text-xl font-black text-foreground">
                                        {(selectedCell.day === 'Sat' || selectedCell.day === 'Sun') ? 'Weekend' : 'Working Day'}
                                    </p>
                                </div>
                                <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 shadow-sm border border-border/50 border-l-4 border-l-amber-500">
                                    <p className="text-[10px] font-bold uppercase text-amber-500 mb-1">Occurrence</p>
                                    <p className="text-xl font-black text-foreground">Second</p>
                                </div>
                            </div>

                            {/* 2. Charts Section (Dynamic Analysis) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Severity Distribution - Bar Chart (User Requested) */}
                                <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-border/50">
                                    <h4 className="text-[10px] font-black uppercase text-blue-500 mb-6 text-center tracking-widest">Severity Analysis (Count of Events)</h4>
                                    <div className="h-[200px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={[
                                                { name: 'Critical', val: selectedCell.events.filter((e: any) => e.severity === 'Critical').length || 0, color: '#ef4444' },
                                                { name: 'Major', val: selectedCell.events.filter((e: any) => e.severity === 'Major').length || 0, color: '#f59e0b' },
                                                { name: 'Minor', val: selectedCell.events.filter((e: any) => e.severity === 'Minor').length || 0, color: '#0ea5e9' }
                                            ]}>
                                                <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                                                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                                <Tooltip
                                                    cursor={{ fill: 'transparent' }}
                                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                                />
                                                <Bar dataKey="val" radius={[4, 4, 0, 0]} barSize={40}>
                                                    {[
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

                                {/* Event Type Distribution - Pie Chart */}
                                <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-border/50">
                                    <h4 className="text-[10px] font-black uppercase text-blue-500 mb-6 text-center tracking-widest">Event Nature Breakdown</h4>
                                    <div className="h-[200px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={analytics?.types || []}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                    strokeWidth={0}
                                                >
                                                    {(analytics?.types || []).map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend
                                                    verticalAlign="bottom"
                                                    height={36}
                                                    iconType="square"
                                                    iconSize={10}
                                                    formatter={(value) => <span className="text-[10px] font-bold text-muted-foreground uppercase ml-1">{value}</span>}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            {/* 3. Event List (Enhanced Style) */}
                            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-border/50 overflow-hidden flex flex-col h-[400px] shadow-sm">
                                <div className="p-4 border-b border-border/50 flex items-center justify-between">
                                    <h4 className="text-sm font-bold uppercase text-blue-500">All Events in Category</h4>
                                </div>
                                <div className="flex-1 overflow-y-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-muted/10 sticky top-0 backdrop-blur-md z-10">
                                            <tr>
                                                <th className="px-6 py-3 font-bold text-muted-foreground uppercase tracking-wider">Type</th>
                                                <th className="px-6 py-3 font-bold text-muted-foreground uppercase tracking-wider">Customer</th>
                                                <th className="px-6 py-3 font-bold text-muted-foreground uppercase tracking-wider">Severity</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/30">
                                            {selectedCell.events.map((e: any, i: number) => (
                                                <tr key={i} className="hover:bg-muted/20 transition-colors">
                                                    <td className="px-6 py-3 font-bold text-foreground">{e.type}</td>
                                                    <td className="px-6 py-3 text-muted-foreground font-medium">{e.customer}</td>
                                                    <td className="px-6 py-3">
                                                        <span className={cn(
                                                            "px-2 py-1 rounded text-[10px] uppercase font-black tracking-wide border shadow-sm",
                                                            e.severity === 'Critical' ? "text-red-600 bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/20" :
                                                                e.severity === 'Major' ? "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20" :
                                                                    "text-sky-600 bg-sky-50 border-sky-200 dark:bg-sky-500/10 dark:border-sky-500/20"
                                                        )}>
                                                            {e.severity}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

