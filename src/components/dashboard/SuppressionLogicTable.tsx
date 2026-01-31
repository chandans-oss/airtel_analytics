import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronRight, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogicRow {
    dayType: 'Working Day' | 'Holiday';
    occurrence: 'First' | 'Second';
    timing: 'Before BH' | 'During BH' | 'After BH';
    subEvent: 'First Event' | 'Sub Event' | '-';
    downDetails: { suppressed: boolean; grouped: boolean; status: string };
    upDetails: { suppressed: boolean; grouped: boolean; status: string };
}

const LOGIC_DATA: LogicRow[] = [
    { dayType: 'Working Day', occurrence: 'First', timing: 'Before BH', subEvent: 'First Event', downDetails: { suppressed: true, grouped: false, status: 'Suppressed' }, upDetails: { suppressed: true, grouped: false, status: 'Suppressed' } },
    { dayType: 'Working Day', occurrence: 'First', timing: 'During BH', subEvent: 'First Event', downDetails: { suppressed: false, grouped: false, status: 'Actionable' }, upDetails: { suppressed: false, grouped: true, status: 'Grouped' } },
    { dayType: 'Working Day', occurrence: 'First', timing: 'After BH', subEvent: 'First Event', downDetails: { suppressed: false, grouped: false, status: 'Actionable' }, upDetails: { suppressed: true, grouped: false, status: 'Suppressed' } },
    { dayType: 'Working Day', occurrence: 'Second', timing: 'Before BH', subEvent: '-', downDetails: { suppressed: true, grouped: false, status: 'Suppressed' }, upDetails: { suppressed: true, grouped: false, status: 'Suppressed' } },
    { dayType: 'Working Day', occurrence: 'Second', timing: 'During BH', subEvent: '-', downDetails: { suppressed: false, grouped: true, status: 'Grouped' }, upDetails: { suppressed: false, grouped: true, status: 'Grouped' } },
    { dayType: 'Holiday', occurrence: 'First', timing: 'Before BH', subEvent: '-', downDetails: { suppressed: true, grouped: false, status: 'Suppressed' }, upDetails: { suppressed: true, grouped: false, status: 'Suppressed' } },
    // Add more representative rows as needed
];

export function SuppressionLogicTable() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <FileText size={16} className="text-primary" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Suppression Logic Matrix (Reference)</h3>
                </div>
                {isOpen ? <ChevronDown size={16} className="text-muted-foreground" /> : <ChevronRight size={16} className="text-muted-foreground" />}
            </button>

            {isOpen && (
                <div className="overflow-x-auto p-4 border-t border-border/50 bg-muted/5 animate-in slide-in-from-top-2">
                    <table className="w-full text-xs border-collapse border border-border/50">
                        <thead>
                            <tr className="bg-primary/10 text-primary-foreground">
                                <th className="border border-border/50 p-2 text-left bg-muted/50 text-muted-foreground" rowSpan={2}>Day Type</th>
                                <th className="border border-border/50 p-2 text-left bg-muted/50 text-muted-foreground" rowSpan={2}>Occurrence</th>
                                <th className="border border-border/50 p-2 text-left bg-muted/50 text-muted-foreground" rowSpan={2}>Timing / Condition</th>
                                <th className="border border-border/50 p-2 text-center bg-red-500/10 text-red-700 font-bold" colSpan={3}>Down Alarm Details</th>
                                <th className="border border-border/50 p-2 text-center bg-emerald-500/10 text-emerald-700 font-bold" colSpan={3}>Up Alarm Details</th>
                            </tr>
                            <tr className="bg-muted text-muted-foreground font-medium">
                                <th className="border border-border/50 p-2">Suppressed</th>
                                <th className="border border-border/50 p-2">Grouped</th>
                                <th className="border border-border/50 p-2">Status</th>
                                <th className="border border-border/50 p-2">Suppressed</th>
                                <th className="border border-border/50 p-2">Grouped</th>
                                <th className="border border-border/50 p-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {LOGIC_DATA.map((row, idx) => (
                                <tr key={idx} className="hover:bg-muted/30 transition-colors">
                                    <td className="border border-border/50 p-2 font-medium">{row.dayType}</td>
                                    <td className="border border-border/50 p-2">{row.occurrence}</td>
                                    <td className="border border-border/50 p-2">
                                        <span className={cn(
                                            "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
                                            row.timing === 'During BH' ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"
                                        )}>
                                            {row.timing}
                                        </span>
                                        {row.subEvent !== '-' && <span className="ml-2 text-[10px] text-muted-foreground">({row.subEvent})</span>}
                                    </td>

                                    {/* Down Details */}
                                    <td className="border border-border/50 p-2 text-center">{row.downDetails.suppressed ? 'Yes' : 'No'}</td>
                                    <td className="border border-border/50 p-2 text-center">{row.downDetails.grouped ? 'Yes' : 'No'}</td>
                                    <td className="border border-border/50 p-2 text-center font-bold">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-full text-[10px]",
                                            row.downDetails.status === 'Actionable' ? "bg-red-100 text-red-700" :
                                                row.downDetails.status === 'Grouped' ? "bg-blue-100 text-blue-700" :
                                                    "bg-slate-100 text-slate-500"
                                        )}>
                                            {row.downDetails.status}
                                        </span>
                                    </td>

                                    {/* Up Details */}
                                    <td className="border border-border/50 p-2 text-center">{row.upDetails.suppressed ? 'Yes' : 'No'}</td>
                                    <td className="border border-border/50 p-2 text-center">{row.upDetails.grouped ? 'Yes' : 'No'}</td>
                                    <td className="border border-border/50 p-2 text-center font-bold">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded-full text-[10px]",
                                            row.upDetails.status === 'Actionable' ? "bg-red-100 text-red-700" :
                                                row.upDetails.status === 'Grouped' ? "bg-blue-100 text-blue-700" :
                                                    "bg-slate-100 text-slate-500"
                                        )}>
                                            {row.upDetails.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
