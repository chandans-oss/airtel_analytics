import { useMemo, useState, useEffect, useRef } from 'react';
import { useInventoryStore } from '@/store/inventoryStore';
import {
    Activity,
    Database,
    Zap,
    ShieldCheck,
    BarChart3,
    ChevronRight,
    ArrowUpRight,
    ArrowUp,
    ArrowDown,
    AlertTriangle,
    Download,
    LayoutDashboard,
    Search,
    MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { exportToCSV } from '@/utils/exportUtils';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie
} from 'recharts';

interface KPIProps {
    title: string;
    value: string;
    total: string;
    icon: any;
    issueCount: number;
    onClick?: () => void;
    onIssuesClick?: () => void;
}

function KPICard({ title, value, total, icon: Icon, issueCount, onClick, onIssuesClick }: KPIProps) {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const isConfig = title.toLowerCase().includes('config');
    const upLabel = isConfig ? 'SUCCESS' : 'UP';
    const downLabel = isConfig ? 'FAILURE' : 'DOWN';

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };
        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);

    const statusColor = useMemo(() => {
        if (issueCount === 0) return {
            bg: 'bg-emerald-500/5',
            border: 'border-emerald-500/20',
            text: 'text-emerald-500',
            hover: 'hover:border-emerald-500/50'
        };
        if (issueCount <= 8) return {
            bg: 'bg-amber-500/5',
            border: 'border-amber-500/20',
            text: 'text-amber-500',
            hover: 'hover:border-amber-500/50'
        };
        return {
            bg: 'bg-rose-500/5',
            border: 'border-rose-500/20',
            text: 'text-rose-500',
            hover: 'hover:border-rose-500/50'
        };
    }, [issueCount]);

    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative rounded-2xl border p-5 transition-all duration-300 backdrop-blur-md overflow-visible",
                statusColor.bg,
                statusColor.border,
                statusColor.hover,
                onClick && "cursor-pointer hover:shadow-lg",
                showMenu && "z-50 ring-2 ring-primary/20 shadow-2xl scale-[1.02]"
            )}
        >


            {/* Top Row: Title and Redirect */}
            <div className="flex items-start justify-between mb-2">
                <h3 className="text-base font-black uppercase tracking-wider text-foreground/90 font-display">
                    {title}
                </h3>
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white/10 text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all">
                    <ArrowUpRight size={14} />
                </div>
            </div>

            {/* Center: Total Number */}
            <div className="flex justify-center my-4">
                <span className="text-4xl font-black tabular-nums tracking-tighter text-foreground drop-shadow-sm">
                    {total}
                </span>
            </div>

            {/* Bottom Row: Healthy and Issues */}
            <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-1.5">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center gap-1">
                            <span className="text-xl font-black text-emerald-500 tabular-nums">{value}</span>
                            <ArrowUp size={16} className="text-emerald-500" strokeWidth={3} />
                        </div>
                        <span className="text-[8px] font-bold text-emerald-500/60 uppercase tracking-tighter">{upLabel}</span>
                    </div>
                </div>

                <div
                    className="relative flex flex-col items-center cursor-context-menu"
                    onContextMenu={(e) => {
                        e.preventDefault();
                        if (issueCount > 0) {
                            setShowMenu(true);
                        }
                    }}
                >
                    {/* Right-Click Context Menu */}
                    {showMenu && (
                        <div
                            ref={menuRef}
                            className="absolute bottom-full mb-8 left-1/2 -translate-x-1/2 z-[9999] animate-in fade-in slide-in-from-bottom-2 zoom-in-95 duration-200"
                            onClick={(e) => {
                                e.stopPropagation();
                                onIssuesClick?.();
                                setShowMenu(false);
                            }}
                        >
                            <div className="bg-rose-600 border border-white/30 shadow-[0_20px_50px_rgba(225,29,72,0.6)] rounded-xl p-1.5 min-w-[180px]">
                                <div className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/10 text-white transition-all group/item cursor-pointer">
                                    <div className="p-2 rounded-lg bg-white/20">
                                        <AlertTriangle size={18} className="text-white animate-pulse" />
                                    </div>
                                    <div className="flex flex-col items-start text-left">
                                        <span className="text-[11px] font-black uppercase tracking-widest leading-none">Analyze {downLabel}</span>
                                        <span className="text-[9px] opacity-80 font-bold uppercase tracking-tighter mt-1">View detailed records</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-1">
                        <span className="text-xl font-black text-rose-500 tabular-nums">{issueCount}</span>
                        <ArrowDown size={16} className="text-rose-500" strokeWidth={3} />
                    </div>
                    <span className="text-[8px] font-bold text-rose-500/60 uppercase tracking-tighter">{downLabel}</span>
                </div>
            </div>
        </div>
    );
}

export function UnifiedMainDashboard() {
    const { nodes, links, allEvents, configFailure, setSelectedModule, setSelectedSubModule } = useInventoryStore();
    const [view, setView] = useState<'main' | 'issues'>('main');

    // KPI Calculations
    const stats = useMemo(() => {
        const totalNodes = nodes.length || 100;
        const totalLinks = links.length || 100;

        const deviceIssues = nodes.filter(n => n.snmpStatus === 'DOWN' || n.status === 'DOWN').length;
        const linkIssues = links.filter(l => l.linkStatus === 'DOWN').length;
        const bwIssues = links.filter(l => (l.utilization || 0) > 85).length;
        const jitterIssues = links.filter(l => (l.performanceScore || 100) < 60).length;
        const configIssues = configFailure.length;

        const deviceMonitored = totalNodes - deviceIssues;
        const linksMonitored = totalLinks - linkIssues;
        const bwMonitored = totalLinks - bwIssues;
        const jitterMonitored = totalLinks - jitterIssues;
        const configMonitored = totalNodes - configIssues;

        return {
            device: { val: deviceMonitored, total: totalNodes, issues: deviceIssues },
            link: { val: linksMonitored, total: totalLinks, issues: linkIssues },
            bw: { val: bwMonitored, total: totalLinks, issues: bwIssues },
            jitter: { val: jitterMonitored, total: totalLinks, issues: jitterIssues },
            config: { val: configMonitored, total: totalNodes, issues: configIssues },
            critical: { issues: allEvents.filter(e => e.severity === 'CRITICAL').length }
        };
    }, [nodes, links, configFailure, allEvents]);

    const issueCategories = useMemo(() => {
        const linkDown = links.filter(l => l.linkStatus === 'DOWN');
        const nodeDown = nodes.filter(n => n.snmpStatus === 'DOWN' || n.status === 'DOWN');
        const highLatency = links.filter(l => (l.performanceScore || 100) < 60);
        const configIssues = configFailure;
        const criticalEvents = allEvents.filter(e => e.severity === 'CRITICAL');

        return [
            { id: 'link_down', name: 'Critical Link Outages', count: stats.link.issues, data: linkDown, icon: Zap, color: '#f43f5e' },
            { id: 'node_down', name: 'Device Downstream Issues', count: stats.device.issues, data: nodeDown, icon: Database, color: '#e11d48' },
            { id: 'config_failure', name: 'Compliance & Config Drift', count: stats.config.issues, data: configIssues, icon: ShieldCheck, color: '#f59e0b' },
            { id: 'performance_jitter', name: 'SLA Jitter Violations', count: stats.jitter.issues, data: highLatency, icon: Activity, color: '#8b5cf6' },
            { id: 'critical_alarms', name: 'Active Critical Alarms', count: stats.critical.issues, data: criticalEvents, icon: AlertTriangle, color: '#ef4444' }
        ];
    }, [nodes, links, allEvents, configFailure, stats]);

    if (view === 'issues') {
        return (
            <div className="space-y-8 animate-in fade-in duration-500 pb-20">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black uppercase tracking-widest">Global Issue Analytics</h2>
                        <p className="text-sm text-muted-foreground mt-1">Cross-domain failure analysis and export center</p>
                    </div>
                    <button
                        onClick={() => setView('main')}
                        className="px-4 py-2 rounded-xl bg-muted/50 hover:bg-muted font-bold text-xs uppercase tracking-widest transition-all"
                    >
                        Back to Overview
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {issueCategories.map((cat) => (
                        <div key={cat.id} className="rounded-2xl border border-border/50 bg-card/40 p-6 flex flex-col gap-4 group hover:border-primary/30 transition-all">
                            <div className="flex items-center justify-between">
                                <div className="p-2 rounded-lg" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>
                                    <cat.icon size={18} />
                                </div>
                                <span className="text-xl font-black tabular-nums">{cat.count}</span>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold">{cat.name}</h3>
                                <p className="text-[10px] text-muted-foreground mt-0.5">Impacted assets in last 24h</p>
                            </div>
                            <button
                                onClick={() => exportToCSV(cat.data, `issue_analytics_${cat.id}`)}
                                className="mt-2 w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider hover:bg-primary hover:text-white transition-all border border-primary/20"
                            >
                                <Download size={14} />
                                Export Detailed Dataset
                            </button>
                        </div>
                    ))}
                </div>

                <div className="rounded-3xl border border-border/50 bg-card/20 p-8 flex flex-col items-center justify-center text-center gap-4 border-dashed">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Search size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">Deep Scan Required?</h3>
                        <p className="max-w-md text-sm text-muted-foreground mt-2">Use the detailed dashboard modules for interactive root cause analysis and correlation mapping.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            <div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    <KPICard
                        title="Device Monitoring"
                        value={String(stats.device.val)}
                        total={String(stats.device.total)}
                        issueCount={stats.device.issues}
                        icon={Database}
                        onClick={() => {
                            setSelectedModule('inventory');
                            setSelectedSubModule('nodes');
                        }}
                        onIssuesClick={() => setView('issues')}
                    />
                    <KPICard
                        title="Link Health"
                        value={String(stats.link.val)}
                        total={String(stats.link.total)}
                        issueCount={stats.link.issues}
                        icon={Zap}
                        onClick={() => {
                            setSelectedModule('inventory');
                            setSelectedSubModule('links');
                        }}
                        onIssuesClick={() => setView('issues')}
                    />
                    <KPICard
                        title="Bandwidth Monitoring"
                        value={String(stats.bw.val)}
                        total={String(stats.bw.total)}
                        issueCount={stats.bw.issues}
                        icon={BarChart3}
                        onClick={() => {
                            setSelectedModule('inventory');
                            setSelectedSubModule('links');
                        }}
                        onIssuesClick={() => setView('issues')}
                    />
                    <KPICard
                        title="Jitter Analysis"
                        value={String(stats.jitter.val)}
                        total={String(stats.jitter.total)}
                        issueCount={stats.jitter.issues}
                        icon={Activity}
                        onClick={() => {
                            setSelectedModule('inventory');
                            setSelectedSubModule('links');
                        }}
                        onIssuesClick={() => setView('issues')}
                    />
                    <KPICard
                        title="Config Compliance"
                        value={String(stats.config.val)}
                        total={String(stats.config.total)}
                        issueCount={stats.config.issues}
                        icon={ShieldCheck}
                        onClick={() => {
                            setSelectedModule('config');
                        }}
                        onIssuesClick={() => setView('issues')}
                    />
                </div>
            </div>
        </div>
    );
}
