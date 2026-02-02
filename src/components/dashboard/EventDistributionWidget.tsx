
import React, { useState, useMemo } from 'react';
import { EVENTS_DATA } from '@/data/eventDistributionData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { exportToCSV } from '@/utils/exportUtils';
import { cn } from '@/lib/utils';
import { X, Download } from 'lucide-react';

interface CategoryConfig {
    dayType: string;
    occurrence: string;
}

const CATEGORIES: CategoryConfig[] = [
    { dayType: 'Working Day', occurrence: 'First' },
    { dayType: 'Working Day', occurrence: 'Second' },
    { dayType: 'Holiday', occurrence: 'First' },
    { dayType: 'Holiday', occurrence: 'Second' }
];

const PERIOD_NAMES = {
    'before_bh': 'Before Business Hours',
    'during_bh': 'During Business Hours',
    'after_bh': 'After Business Hours'
};

const TYPE_NAMES = {
    'first_down': 'First Event Down',
    'first_up': 'First Event Up',
    'sub_down': 'Sub Event Down',
    'sub_up': 'Sub Event Up'
};

const CHART_COLORS = [
    'rgba(102, 126, 234, 0.8)',
    'rgba(118, 75, 162, 0.8)',
    'rgba(240, 147, 251, 0.8)',
    'rgba(79, 172, 254, 0.8)'
];

export function EventDistributionWidget() {
    const [selectedDetail, setSelectedDetail] = useState<{
        category: CategoryConfig;
        period: keyof typeof PERIOD_NAMES;
        type: keyof typeof TYPE_NAMES;
        events: any[];
    } | null>(null);

    const handleCellClick = (category: CategoryConfig, period: string, type: string) => {
        // Filter events for this category (Day Type + Occurrence)
        // The original logic shows ALL events for the category in the modal, 
        // but highlights the specific period/type data.
        const categoryEvents = EVENTS_DATA.filter(event =>
            event.day_type === category.dayType &&
            event.alarm_occurrence === category.occurrence
        );

        setSelectedDetail({
            category,
            period: period as keyof typeof PERIOD_NAMES,
            type: type as keyof typeof TYPE_NAMES,
            events: categoryEvents
        });
    };

    const generateChartData = (events: any[], key: 'down_alarm' | 'up_alarm') => {
        const counts: Record<string, number> = {};
        events.forEach(event => {
            const val = event[key]?.suppressed || 'N/A';
            counts[val] = (counts[val] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    };

    return (
        <div className="rounded-xl border border-border/50 bg-card p-0 shadow-sm overflow-hidden flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-border/50 flex items-center justify-between bg-white relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#667eea] to-[#764ba2] opacity-10" />
                <div className="relative z-10 flex items-center gap-3">
                    <div className="bg-gradient-to-br from-[#667eea] to-[#764ba2] p-2 rounded-lg text-white shadow-lg">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                            <circle cx="9" cy="9" r="2" />
                            <path d="m21 12-3.01-2" />
                            <path d="m11 21 2-3.01" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-[#667eea]">Event Scenarios - Interactive Dashboard</h3>
                        <p className="text-xs text-muted-foreground">Click on any cell to view detailed analytics for that category</p>
                    </div>
                </div>
            </div>

            {/* Table Container */}
            <div className="p-4 overflow-x-auto">
                <table className="w-full border-collapse min-w-[1000px]">
                    <thead>
                        <tr className="bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white">
                            <th rowSpan={2} className="p-3 border-r border-white/20 text-center font-bold text-sm w-[150px]">Day Type</th>
                            <th rowSpan={2} className="p-3 border-r border-white/20 text-center font-bold text-sm w-[130px]">Alarm<br />Occurrence</th>
                            <th colSpan={4} className="p-2 border-r border-white/20 border-b border-white/20 text-center font-bold text-sm">Before BH</th>
                            <th colSpan={4} className="p-2 border-r border-white/20 border-b border-white/20 text-center font-bold text-sm">During BH</th>
                            <th colSpan={4} className="p-2 text-center font-bold text-sm">After BH</th>
                        </tr>
                        <tr className="bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white">
                            {/* Before BH */}
                            <th className="p-2 border-r border-white/20 border-t border-white/20 text-xs text-center font-semibold">First Event<br />Down</th>
                            <th className="p-2 border-r border-white/20 border-t border-white/20 text-xs text-center font-semibold">First Event<br />Up</th>
                            <th className="p-2 border-r border-white/20 border-t border-white/20 text-xs text-center font-semibold">Sub Event<br />Down</th>
                            <th className="p-2 border-r border-white/20 border-t border-white/20 text-xs text-center font-semibold">Sub Event<br />Up</th>
                            {/* During BH */}
                            <th className="p-2 border-r border-white/20 border-t border-white/20 text-xs text-center font-semibold">First Event<br />Down</th>
                            <th className="p-2 border-r border-white/20 border-t border-white/20 text-xs text-center font-semibold">First Event<br />Up</th>
                            <th className="p-2 border-r border-white/20 border-t border-white/20 text-xs text-center font-semibold">Sub Event<br />Down</th>
                            <th className="p-2 border-r border-white/20 border-t border-white/20 text-xs text-center font-semibold">Sub Event<br />Up</th>
                            {/* After BH */}
                            <th className="p-2 border-r border-white/20 border-t border-white/20 text-xs text-center font-semibold">First Event<br />Down</th>
                            <th className="p-2 border-r border-white/20 border-t border-white/20 text-xs text-center font-semibold">First Event<br />Up</th>
                            <th className="p-2 border-r border-white/20 border-t border-white/20 text-xs text-center font-semibold">Sub Event<br />Down</th>
                            <th className="p-2 border-t border-white/20 text-xs text-center font-semibold">Sub Event<br />Up</th>
                        </tr>
                    </thead>
                    <tbody>
                        {CATEGORIES.map((category, idx) => {
                            // Filter events for this category
                            const categoryEvents = EVENTS_DATA.filter(event =>
                                event.day_type === category.dayType &&
                                event.alarm_occurrence === category.occurrence
                            );

                            return (
                                <tr key={`${category.dayType}-${category.occurrence}`} className="border-b border-border/50 bg-white hover:bg-muted/5 transition-colors">
                                    <td className="p-3 border-r border-border/30 bg-gradient-to-br from-[#667eea]/15 to-[#764ba2]/15 text-[#667eea] font-bold text-sm text-center">
                                        {category.dayType}
                                    </td>
                                    <td className="p-3 border-r border-border/30 bg-gradient-to-br from-[#667eea]/15 to-[#764ba2]/15 text-[#667eea] font-bold text-sm text-center">
                                        {category.occurrence}
                                    </td>

                                    {['before_bh', 'during_bh', 'after_bh'].map(period =>
                                        ['first_down', 'first_up', 'sub_down', 'sub_up'].map(type => (
                                            <td key={`${period}-${type}`} className="p-0 border-r border-border/30 relative h-[80px] w-[80px]">
                                                <button
                                                    onClick={() => handleCellClick(category, period, type)}
                                                    className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#667eea]/10 to-[#764ba2]/10 hover:from-[#667eea]/25 hover:to-[#764ba2]/25 transition-all hover:scale-105 hover:z-10 hover:shadow-lg group"
                                                >
                                                    <span className="text-2xl font-bold text-[#667eea]">{categoryEvents.length}</span>
                                                    {/* Optional: Show if data exists for this specific cell */}
                                                    {/* {categoryEvents.some(e => e[period][type]) && <div className="w-1.5 h-1.5 rounded-full bg-[#764ba2] mt-1" />} */}
                                                </button>
                                            </td>
                                        ))
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Legend */}
            <div className="p-4 bg-muted/5 border-t border-border/50 flex justify-center">
                <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-border/50 shadow-sm">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-[#667eea]/10 to-[#764ba2]/10 border border-[#667eea]/20"></div>
                    <span className="text-xs text-muted-foreground font-medium">Click any cell to view detailed event analytics</span>
                </div>
            </div>

            {/* Detail Modal */}
            <Dialog open={!!selectedDetail} onOpenChange={(open) => !open && setSelectedDetail(null)}>
                <DialogContent className="max-w-[1200px] max-h-[90vh] overflow-y-auto p-0 gap-0 border-none rounded-2xl">
                    {selectedDetail && (
                        <>
                            <div className="bg-gradient-to-br from-[#667eea] to-[#764ba2] p-6 text-white flex items-center justify-between sticky top-0 z-50">
                                <div>
                                    <h2 className="text-2xl font-bold">Event Details</h2>
                                    <p className="text-white/80 mt-1">
                                        {selectedDetail.category.dayType} - {selectedDetail.category.occurrence} Alarm
                                    </p>
                                    <div className="flex items-center gap-2 mt-2 text-sm bg-white/10 w-fit px-3 py-1 rounded-full border border-white/20">
                                        <span className="font-semibold">{PERIOD_NAMES[selectedDetail.period]}</span>
                                        <span className="opacity-60">&rarr;</span>
                                        <span className="font-semibold">{TYPE_NAMES[selectedDetail.type]}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => exportToCSV(selectedDetail.events, `Events_${selectedDetail.category.dayType}_${selectedDetail.category.occurrence}_${selectedDetail.period}`)}
                                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                        title="Export Filtered Events"
                                    >
                                        <Download className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={() => setSelectedDetail(null)}
                                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6 bg-[#f8f9fa] space-y-8">
                                {/* Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-[#667eea]">
                                        <h4 className="text-[#667eea] font-bold text-sm uppercase mb-1">Total Events</h4>
                                        <p className="text-2xl font-black text-slate-800">{selectedDetail.events.length}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-[#764ba2]">
                                        <h4 className="text-[#764ba2] font-bold text-sm uppercase mb-1">With Data</h4>
                                        <p className="text-2xl font-black text-slate-800">
                                            {selectedDetail.events.filter(e => e[selectedDetail.period] && e[selectedDetail.period][selectedDetail.type]).length}
                                        </p>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-emerald-500">
                                        <h4 className="text-emerald-500 font-bold text-sm uppercase mb-1">Day Type</h4>
                                        <p className="text-lg font-bold text-slate-800">{selectedDetail.category.dayType}</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-amber-500">
                                        <h4 className="text-amber-500 font-bold text-sm uppercase mb-1">Occurrence</h4>
                                        <p className="text-lg font-bold text-slate-800">{selectedDetail.category.occurrence}</p>
                                    </div>
                                </div>

                                {/* Event List */}
                                <div>
                                    <h3 className="text-[#667eea] font-bold text-lg border-b-2 border-[#667eea] pb-2 mb-4">
                                        All Events in Category
                                    </h3>
                                    <div className="bg-white rounded-xl shadow-sm border border-border/50 max-h-[300px] overflow-y-auto">
                                        {selectedDetail.events.map((event, idx) => {
                                            const eventValue = event[selectedDetail.period]?.[selectedDetail.type];
                                            const hasData = eventValue !== null && eventValue !== undefined && eventValue !== 'None';

                                            return (
                                                <div key={idx} className="p-4 border-b border-border/50 last:border-0 hover:bg-muted/5 transition-colors">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="bg-[#667eea] text-white px-3 py-1 rounded-full text-xs font-bold">
                                                            Event #{event.id}
                                                        </span>
                                                        {hasData ? (
                                                            <span className="bg-[#cce5ff] text-[#004085] px-3 py-1 rounded-full text-xs font-bold">
                                                                {eventValue}
                                                            </span>
                                                        ) : (
                                                            <span className="bg-[#f8d7da] text-[#721c24] px-3 py-1 rounded-full text-xs font-bold opacity-60">
                                                                No Data
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground mt-2">
                                                        <div><span className="font-bold text-slate-700">Day:</span> {event.day_type}</div>
                                                        <div><span className="font-bold text-slate-700">Occ:</span> {event.alarm_occurrence}</div>
                                                        <div><span className="font-bold text-slate-700">Down Suppressed:</span> {event.down_alarm?.suppressed || 'N/A'}</div>
                                                        <div><span className="font-bold text-slate-700">Up Suppressed:</span> {event.up_alarm?.suppressed || 'N/A'}</div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Analytics Charts */}
                                <div>
                                    <h3 className="text-[#667eea] font-bold text-lg border-b-2 border-[#667eea] pb-2 mb-4">
                                        Analytics
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Down Alarm Chart */}
                                        <div className="bg-white p-6 rounded-xl shadow-sm border border-border/50">
                                            <h4 className="text-center font-bold text-[#667eea] mb-4">Down Alarm - Suppressed Status</h4>
                                            <div className="h-[250px] w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={generateChartData(selectedDetail.events, 'down_alarm')}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={60}
                                                            outerRadius={80}
                                                            paddingAngle={5}
                                                            dataKey="value"
                                                        >
                                                            {generateChartData(selectedDetail.events, 'down_alarm').map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip />
                                                        <Legend verticalAlign="bottom" height={36} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        {/* Up Alarm Chart */}
                                        <div className="bg-white p-6 rounded-xl shadow-sm border border-border/50">
                                            <h4 className="text-center font-bold text-[#667eea] mb-4">Up Alarm - Suppressed Status</h4>
                                            <div className="h-[250px] w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={generateChartData(selectedDetail.events, 'up_alarm')}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={60}
                                                            outerRadius={80}
                                                            paddingAngle={5}
                                                            dataKey="value"
                                                        >
                                                            {generateChartData(selectedDetail.events, 'up_alarm').map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip />
                                                        <Legend verticalAlign="bottom" height={36} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
