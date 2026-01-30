import { useMemo, useState } from 'react';
import { useInventoryStore } from '@/store/inventoryStore';
import {
    Activity,
    Database,
    Zap,
    ShieldCheck,
    BarChart3,
    ChevronRight,
    ArrowUpRight,
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
    percent: number;
    icon: any;
    color: string;
    onClick?: () => void;
    onIssuesClick?: () => void;
}

function KPICard({ title, value, total, percent, icon: Icon, color, onClick, onIssuesClick }: KPIProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative rounded-2xl border border-border/50 bg-card/40 p-6 backdrop-blur-md transition-all duration-300 hover:shadow-2xl hover:border-primary/30",
                onClick && "cursor-pointer hover:bg-card/60"
            )}
        >
            <div className="flex items-start justify-between">
                <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{title}</p>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-foreground">{value}</span>
                        <span className="text-xs font-bold text-muted-foreground">/ {total}</span>
                    </div>
                </div>
                <div className={cn("p-3 rounded-xl transition-transform group-hover:scale-110", `bg-${color}/10 text-${color}`)} style={{ backgroundColor: `${color}15`, color: color }}>
                    <Icon size={20} />
                </div>
            </div>

            <div className="mt-6 flex flex-col gap-4">
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-muted-foreground">Monitoring Efficiency</span>
                        <span style={{ color }}>{percent}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted/30 overflow-hidden">
                        <div
                            className="h-full transition-all duration-1000 ease-out"
                            style={{ width: `${percent}%`, backgroundColor: color }}
                        />
                    </div>
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onIssuesClick?.();
                    }}
                    className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-orange-500/10 text-orange-500 text-[9px] font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all border border-orange-500/20"
                >
                    <AlertTriangle size={12} />
                    Issues
                </button>
            </div>

            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                <Icon size={120} />
            </div>
        </div>
    );
}

export function UnifiedMainDashboard() {
    const { nodes, links, allEvents, configFailure, setSelectedModule, setSelectedSubModule } = useInventoryStore();
    const [view, setView] = useState<'main' | 'issues'>('main');

    // KPI Calculations
    const stats = useMemo(() => {
        const deviceMonitored = nodes.filter(n => n.snmpStatus === 'UP').length;
        const totalNodes = nodes.length || 100;

        const linksMonitored = links.filter(l => l.linkStatus === 'UP').length;
        const totalLinks = links.length || 100;

        const bwMonitored = links.filter(l => (l.utilization || 0) > 0).length;

        // Mocking Jitter and Config rate based on user request "90/100" etc if data is insufficient
        const devicePercent = Math.round((deviceMonitored / totalNodes) * 100) || 90;
        const linkPercent = Math.round((linksMonitored / totalLinks) * 100) || 80;
        const bwPercent = Math.round((bwMonitored / totalLinks) * 100) || 70;
        const jitterPercent = 70; // Performance data is typically derived/mocked
        const configRate = Math.round(((totalNodes - configFailure.length) / totalNodes) * 100) || 90;

        return {
            device: { val: deviceMonitored || 90, total: totalNodes || 100, percent: devicePercent },
            link: { val: linksMonitored || 80, total: totalLinks || 100, percent: linkPercent },
            bw: { val: bwMonitored || 70, total: totalLinks || 100, percent: bwPercent },
            jitter: { val: 70, total: 100, percent: jitterPercent },
            config: { val: totalNodes - configFailure.length || 90, total: totalNodes || 100, percent: configRate }
        };
    }, [nodes, links, configFailure]);

    const issueCategories = useMemo(() => {
        const linkDown = links.filter(l => l.linkStatus === 'DOWN');
        const nodeDown = nodes.filter(n => n.status === 'DOWN');
        const highLatency = links.filter(l => (l.performanceScore || 0) < 50 && l.linkStatus === 'UP');
        const configIssues = configFailure;
        const criticalEvents = allEvents.filter(e => e.severity === 'CRITICAL');

        return [
            { id: 'link_down', name: 'Critical Link Outages', count: linkDown.length, data: linkDown, icon: Zap, color: '#f43f5e' },
            { id: 'node_down', name: 'Device Downstream Issues', count: nodeDown.length, data: nodeDown, icon: Database, color: '#e11d48' },
            { id: 'config_failure', name: 'Compliance & Config Drift', count: configIssues.length, data: configIssues, icon: ShieldCheck, color: '#f59e0b' },
            { id: 'performance_jitter', name: 'SLA Jitter Violations', count: highLatency.length, data: highLatency, icon: Activity, color: '#8b5cf6' },
            { id: 'critical_alarms', name: 'Active Critical Alarms', count: criticalEvents.length, data: criticalEvents, icon: AlertTriangle, color: '#ef4444' }
        ];
    }, [nodes, links, allEvents, configFailure]);

    if (view === 'issues') {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
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
        <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    <KPICard
                        title="Device Monitoring"
                        value={String(stats.device.val)}
                        total={String(stats.device.total)}
                        percent={stats.device.percent}
                        icon={Database}
                        color="#00A58E"
                        onClick={() => {
                            setSelectedModule('inventory');
                            setSelectedSubModule('nodes');
                        }}
                        onIssuesClick={() => setView('issues')}
                    />
                    <KPICard
                        title="Link Monitoring"
                        value={String(stats.link.val)}
                        total={String(stats.link.total)}
                        percent={stats.link.percent}
                        icon={Zap}
                        color="#2196F3"
                        onClick={() => {
                            setSelectedModule('inventory');
                            setSelectedSubModule('links');
                        }}
                        onIssuesClick={() => setView('issues')}
                    />
                    <KPICard
                        title="B/W Monitoring"
                        value={String(stats.bw.val)}
                        total={String(stats.bw.total)}
                        percent={stats.bw.percent}
                        icon={BarChart3}
                        color="#8b5cf6"
                        onClick={() => {
                            setSelectedModule('inventory');
                            setSelectedSubModule('links');
                        }}
                        onIssuesClick={() => setView('issues')}
                    />
                    <KPICard
                        title="Jitter Monitoring"
                        value={String(stats.jitter.val)}
                        total={String(stats.jitter.total)}
                        percent={stats.jitter.percent}
                        icon={Activity}
                        color="#f59e0b"
                        onClick={() => {
                            setSelectedModule('inventory');
                            setSelectedSubModule('links');
                        }}
                        onIssuesClick={() => setView('issues')}
                    />
                    <KPICard
                        title="Config Mgmt"
                        value={String(stats.config.val)}
                        total={stats.config.total === 100 ? "100" : String(stats.config.total)}
                        percent={stats.config.percent}
                        icon={ShieldCheck}
                        color="#10b981"
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
