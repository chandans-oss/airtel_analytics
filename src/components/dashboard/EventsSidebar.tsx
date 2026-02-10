import React from 'react';
import {
    ChevronDown,
    ChevronRight,
    MapPin,
    Users,
    Activity,
    AlertCircle,
    AlertOctagon,
    Filter,
    Layers,
    Server,
    Wifi,
    CheckSquare,
    Square,
    Settings2,
    ChevronLeft,
    Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { HierarchyBuilder } from './HierarchyBuilder';

interface EventsSidebarProps {
    selectedSeverities: string[];
    setSelectedSeverities: React.Dispatch<React.SetStateAction<string[]>>;
    eventType: string;
    setEventType: (type: string) => void;
    showSuppressed: boolean;
    setShowSuppressed: (show: boolean) => void;
    onClose: () => void;
}

export function EventsSidebar({
    selectedSeverities,
    setSelectedSeverities,
    eventType,
    setEventType,
    showSuppressed,
    setShowSuppressed,
    onClose
}: EventsSidebarProps) {
    const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
        'hierarchy': true,
        'filters': true
    });

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const toggleSeverity = (label: string) => {
        setSelectedSeverities(prev =>
            prev.includes(label)
                ? prev.filter(s => s !== label)
                : [...prev, label]
        );
    };

    return (
        <div className="w-[280px] flex-shrink-0 border-r border-border bg-card h-full overflow-y-auto flex flex-col select-none shadow-[4px_0_24px_rgba(0,0,0,0.02)]">

            {/* 1. Configuration Toggle Header */}
            <div
                onClick={onClose}
                className="flex items-center justify-between p-5 border-b border-border/40 hover:bg-muted/30 transition-colors cursor-pointer group"
                title="Collapse Configuration"
            >
                <div className="flex items-center gap-3">
                    <Settings2 size={18} className="text-primary" />
                    <span className="text-sm font-black uppercase tracking-widest text-foreground/80 group-hover:text-primary transition-colors">Configuration</span>
                </div>
                <ChevronLeft size={16} className="text-muted-foreground/70 group-hover:text-primary transition-colors" />
            </div>

            {/* 2. Build Path (Hierarchy) */}
            <div className="border-b border-border/40">
                <button
                    onClick={() => toggleSection('hierarchy')}
                    className={cn(
                        "flex items-center justify-between w-full p-5 text-xs font-bold uppercase tracking-wider transition-all",
                        expandedSections['hierarchy'] ? "text-primary bg-primary/5" : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <Layers size={16} />
                        <span>Build Path</span>
                    </div>
                    {expandedSections['hierarchy'] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>

                {expandedSections['hierarchy'] && (
                    <div className="p-4 bg-muted/10 animate-in slide-in-from-top-1 duration-200 border-t border-border/40">
                        <HierarchyBuilder />
                    </div>
                )}
            </div>

            {/* 3. Global Filters */}
            <div className="border-b border-border/40">
                <button
                    onClick={() => toggleSection('filters')}
                    className={cn(
                        "flex items-center justify-between w-full p-5 text-xs font-bold uppercase tracking-wider transition-all",
                        expandedSections['filters'] ? "text-primary bg-primary/5" : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <Filter size={16} />
                        <span>Global Filters</span>
                    </div>
                    {expandedSections['filters'] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>

                {expandedSections['filters'] && (
                    <div className="p-5 bg-muted/10 animate-in slide-in-from-top-1 duration-200 border-t border-border/40 space-y-6">

                        {/* Severity Filter */}
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold uppercase text-muted-foreground/60 tracking-widest">Severity Scope</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { label: 'Critical', icon: AlertOctagon, color: 'text-red-500', activeBg: 'bg-red-500/10 border-red-500/20' },
                                    { label: 'Warning', icon: AlertCircle, color: 'text-amber-500', activeBg: 'bg-amber-500/10 border-amber-500/20' },
                                    { label: 'Info', icon: Activity, color: 'text-sky-500', activeBg: 'bg-sky-500/10 border-sky-500/20' },
                                    { label: 'Resolved', icon: Zap, color: 'text-emerald-500', activeBg: 'bg-emerald-500/10 border-emerald-500/20' }
                                ].map((severity) => {
                                    const isSelected = selectedSeverities.includes(severity.label);
                                    return (
                                        <div
                                            key={severity.label}
                                            onClick={() => toggleSeverity(severity.label)}
                                            className={cn(
                                                "flex items-center gap-2 p-2 rounded-md border cursor-pointer transition-all duration-200 select-none",
                                                isSelected ? severity.activeBg : "border-transparent hover:bg-white hover:shadow-sm"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-3 h-3 rounded-[3px] border flex items-center justify-center transition-colors",
                                                isSelected ? "bg-foreground border-foreground" : "border-muted-foreground/40"
                                            )}>
                                                {isSelected && <CheckSquare size={8} className="text-background" />}
                                            </div>
                                            <severity.icon size={12} className={severity.color} />
                                            <span className={cn("text-[11px] font-medium", isSelected ? "text-foreground" : "text-muted-foreground")}>{severity.label}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Event Type Filter */}
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold uppercase text-muted-foreground/60 tracking-widest">Event Category</h4>
                            <div className="relative">
                                <select
                                    value={eventType}
                                    onChange={(e) => setEventType(e.target.value)}
                                    className="w-full appearance-none bg-white border border-border rounded-lg text-xs font-medium p-3 pr-8 focus:ring-2 focus:ring-primary/20 outline-none shadow-sm hover:border-primary/50 transition-all cursor-pointer"
                                >
                                    <option>All Event Types</option>
                                    <option>Link Availability</option>
                                    <option>BGP Peer Status</option>
                                    <option>Capacity / Utilization</option>
                                    <option>Hardware Health</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                            </div>
                        </div>

                        {/* Suppression Toggle */}
                        <div className="pt-2 border-t border-border/30">
                            <div
                                onClick={() => setShowSuppressed(!showSuppressed)}
                                className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-white shadow-sm cursor-pointer hover:border-primary/50 transition-all group"
                            >
                                <div className="flex flex-col gap-0.5">
                                    <span className={cn("text-xs font-bold transition-colors", showSuppressed ? "text-primary" : "text-foreground")}>
                                        Show Suppressed
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">Include low priority logs</span>
                                </div>
                                <div className={cn(
                                    "w-9 h-5 rounded-full relative transition-colors duration-300 shadow-inner",
                                    showSuppressed ? "bg-primary" : "bg-slate-200"
                                )}>
                                    <div className={cn(
                                        "absolute top-1 w-3 h-3 bg-white rounded-full shadow-md transition-all duration-300",
                                        showSuppressed ? "left-[20px]" : "left-1"
                                    )} />
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>

        </div>
    );
}
