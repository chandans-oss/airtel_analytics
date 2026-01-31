import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useInventoryStore } from '@/store/inventoryStore';
import {
    LayoutDashboard,
    Activity,
    ShieldCheck,
    Map,
    Users,
    Cpu,
    Zap,
    ChevronLeft,
    TrendingUp,
    Link2,
    BarChart3,
    Settings2,
    ChevronDown,
    ChevronRight,
    Filter,
    Layers,
    AlertOctagon,
    AlertCircle,
    CheckSquare
} from 'lucide-react';
import { HierarchyBuilder } from '../dashboard/HierarchyBuilder';

const inventorySubModules = [
    { id: 'links', label: 'Links Analysis', icon: Link2 },
    { id: 'nodes', label: 'Nodes Analysis', icon: Cpu },
];

export function InventorySidebar() {
    const {
        selectedModule,
        selectedSubModule,
        setSelectedSubModule,
        inventorySidebarOpen,
        setInventorySidebarOpen,

        // Event Filters (for Events module)
        eventSeverities,
        setEventSeverities,
        eventType,
        setEventType,
        showSuppressed,
        setShowSuppressed
    } = useInventoryStore();

    // Local state for expandable sections in Events config
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        'hierarchy': true,
        'filters': true
    });

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const toggleSeverity = (label: string) => {
        setEventSeverities(
            eventSeverities.includes(label)
                ? eventSeverities.filter(s => s !== label)
                : [...eventSeverities, label]
        );
    };

    if (selectedModule !== 'inventory' && selectedModule !== 'events') return null;

    const isEvents = selectedModule === 'events';

    return (
        <aside
            className={cn(
                "flex flex-col border-r border-border bg-card/40 backdrop-blur-md transition-all duration-500 ease-in-out relative shrink-0 overflow-hidden",
                inventorySidebarOpen ? "w-[280px]" : "w-0 opacity-0 pointer-events-none"
            )}
        >
            <div className="flex h-14 items-center justify-between px-5 border-b border-border/50 shrink-0 bg-muted/10">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                        {isEvents ? <Settings2 size={16} /> : <Zap size={14} />}
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.1em] text-foreground font-display">
                        {isEvents ? 'Configuration' : 'Dashboards'}
                    </span>
                </div>
                <button
                    onClick={() => setInventorySidebarOpen(false)}
                    className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-all"
                >
                    <ChevronLeft size={16} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">

                {/* INVENTORY MODULE CONTENT */}
                {!isEvents && (
                    <div className="p-3 space-y-1">
                        {inventorySubModules.map((sub) => {
                            const isActive = selectedSubModule === sub.id;
                            return (
                                <button
                                    key={sub.id}
                                    onClick={() => setSelectedSubModule(sub.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group",
                                        isActive
                                            ? "bg-primary/10 text-primary shadow-sm border border-primary/20"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
                                    )}
                                >
                                    <sub.icon size={16} className={cn("transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")} />
                                    <span className={cn("text-xs font-bold transition-colors", isActive ? "text-foreground" : "")}>
                                        {sub.label}
                                    </span>
                                    {isActive && (
                                        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(0,165,142,0.6)]" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* EVENTS MODULE CONTENT (CONFIGURATION) */}
                {isEvents && (
                    <div className="flex flex-col select-none">
                        {/* Build Path (Hierarchy) */}
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

                        {/* Global Filters */}
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
                                                const isSelected = eventSeverities.includes(severity.label);
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
                                                <option>All Types</option>
                                                <option>Link Down</option>
                                                <option>BGP Peer Down</option>
                                                <option>High Utilization</option>
                                                <option>Hardware Failure</option>
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
                )}
            </div>
        </aside>
    );
}
