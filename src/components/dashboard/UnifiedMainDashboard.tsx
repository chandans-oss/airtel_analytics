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
    MessageSquare,
    ChevronLeft,
    Cpu,
    MemoryStick,
    Clock,
    RefreshCcw,
    Network,
    Ticket,
    Mail,
    FileSpreadsheet,
    Calendar,
    Signal
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
    exportData?: any[];
    exportUpData?: any[];
    exportDownData?: any[];
}

function KPICard({ title, value, total, icon: Icon, issueCount, onClick, onIssuesClick, exportData, exportUpData, exportDownData }: KPIProps) {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const isConfig = title.toLowerCase().includes('config');
    const upLabel = isConfig ? 'SUCCESS' : 'UP';
    const downLabel = isConfig ? 'FAILURE' : 'DOWN';

    const numValue = parseInt(String(value).replace(/,/g, '')) || 0;
    const numTotal = parseInt(String(total).replace(/,/g, '')) || 1;
    const percentage = Math.round((numValue / numTotal) * 100);

    const statusColor = useMemo(() => {
        if (percentage === 100) return {
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/50',
            text: 'text-emerald-600',
            pill: 'text-emerald-700 border-emerald-600/60 bg-emerald-500/10',
            hover: 'hover:border-emerald-500/80'
        };
        if (percentage > 80) return {
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/50',
            text: 'text-amber-600',
            pill: 'text-amber-700 border-amber-600/60 bg-amber-500/10',
            hover: 'hover:border-amber-500/80'
        };
        return {
            bg: 'bg-rose-500/10',
            border: 'border-rose-500/50',
            text: 'text-rose-600',
            pill: 'text-rose-700 border-rose-600/60 bg-rose-500/10',
            hover: 'hover:border-rose-500/80'
        };
    }, [percentage]);

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

    return (
        <div
            onClick={onClick}
            className={cn(
                "group relative rounded-2xl border px-4 py-3 transition-all duration-300 backdrop-blur-md overflow-visible flex flex-col justify-between min-h-[110px]",
                statusColor.bg,
                statusColor.border,
                // statusColor.hover, // Removed specific hover border to avoid conflict or excessive visual noise
                onClick && "cursor-pointer hover:shadow-lg hover:bg-card/80", // Darker hover
                showMenu && "z-50 ring-2 ring-primary/20 shadow-2xl scale-[1.02]"
            )}
            style={{
                boxShadow: percentage <= 80 ? '0 4px 12px rgba(225, 29, 72, 0.1)' : undefined
            }}
            onContextMenu={(e) => {
                e.preventDefault();
                if (issueCount > 0) setShowMenu(true);
            }}
        >
            {/* Top Row: Title */}
            <div className="flex items-start justify-between mb-1">
                <h3 className="text-[11px] font-black uppercase tracking-wider text-foreground/80 font-display leading-tight max-w-[80%]">
                    {title}
                </h3>
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-white/10 text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all">
                    <ArrowUpRight size={14} />
                </div>
            </div>

            {/* Middle Row: Big Total & Percentage Pill */}
            <div className="flex items-center justify-between mt-1 mb-2">
                <span
                    className="text-4xl font-black tabular-nums tracking-tighter text-foreground drop-shadow-sm cursor-pointer hover:text-primary transition-colors"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (exportData && exportData.length > 0) {
                            exportToCSV(exportData, `${title.replace(/\s+/g, '_')}_Total_Export`);
                        }
                    }}
                    title="Click to Export Full Data"
                >
                    {total}
                </span>

                <div className={cn(
                    "px-2 py-0.5 rounded-lg border-2 font-black text-sm tabular-nums tracking-tight shadow-sm",
                    statusColor.pill
                )}>
                    {percentage}%
                </div>
            </div>

            {/* Bottom Row: Up/Down Stats */}
            <div className="flex items-center gap-4 mt-auto">
                {/* UP STATS */}
                <div
                    className="flex items-baseline gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (exportUpData && exportUpData.length > 0) {
                            exportToCSV(exportUpData, `${title.replace(/\s+/g, '_')}_${upLabel}_Export`);
                        }
                    }}
                    title={`Export ${upLabel} Data`}
                >
                    <span className="text-lg font-black text-emerald-600 tabular-nums">{value}</span>
                    <ArrowUp size={14} className="text-emerald-600 translate-y-[2px]" strokeWidth={3} />
                </div>

                {/* DOWN STATS - Relative for Menu */}
                <div
                    className="relative flex items-baseline gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (exportDownData && exportDownData.length > 0) {
                            exportToCSV(exportDownData, `${title.replace(/\s+/g, '_')}_${downLabel}_Export`);
                        }
                    }}
                    title={`Export ${downLabel} Data`}
                >
                    <span className="text-lg font-black text-rose-600 tabular-nums">{issueCount}</span>
                    <ArrowDown size={14} className="text-rose-600 translate-y-[2px]" strokeWidth={3} />
                    {/* <span className="text-[9px] font-bold text-rose-600/60 uppercase tracking-tighter ml-0.5">{downLabel}</span> */}

                    {/* Context Menu (Attached to Down Stats area usually, or card center) */}
                    {showMenu && (
                        <div
                            ref={menuRef}
                            className="absolute bottom-full left-0 mb-2 z-[50] animate-in fade-in slide-in-from-bottom-2 zoom-in-95 duration-200"
                            onClick={(e) => {
                                e.stopPropagation();
                                onIssuesClick?.();
                                setShowMenu(false);
                            }}
                        >
                            <div className="bg-rose-600 border border-white/30 shadow-[0_10px_30px_rgba(225,29,72,0.5)] rounded-lg p-1 min-w-[120px]">
                                <div className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white/10 text-white transition-all group/item cursor-pointer">
                                    <div className="p-1 rounded bg-white/20">
                                        <AlertTriangle size={12} className="text-white animate-pulse" />
                                    </div>
                                    <div className="flex flex-col items-start text-left">
                                        <span className="text-[9px] font-black uppercase tracking-widest leading-none">Analyze {downLabel}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export function UnifiedMainDashboard() {
    const { nodes, links, allEvents, configFailure, raInventory, setSelectedModule, setSelectedSubModule, showNetworkMetrics, showAppMetrics } = useInventoryStore();
    const [view, setView] = useState<'main' | 'issues'>('main');

    // KPI Calculations
    const stats = useMemo(() => {
        const totalNodes = nodes.length || 100;
        const totalLinks = links.length || 100;
        const totalEvents = allEvents.length || 100;

        // Base Data Filtering
        const deviceDown = nodes.filter(n => n.snmpStatus === 'DOWN' || n.status === 'DOWN');
        const deviceUp = nodes.filter(n => !(n.snmpStatus === 'DOWN' || n.status === 'DOWN'));

        const linkDown = links.filter(l => l.linkStatus === 'DOWN');
        const linkUp = links.filter(l => l.linkStatus !== 'DOWN');

        const bwIssues = links.filter(l => (l.utilization || 0) > 85);
        const bwHealthy = links.filter(l => (l.utilization || 0) <= 85);

        const jitterIssues = links.filter(l => (l.performanceScore || 100) < 60);
        const jitterHealthy = links.filter(l => (l.performanceScore || 100) >= 60);

        const configIssues = configFailure;
        const configSuccess = nodes.filter(n => !configFailure.find(c => c.deviceName === n.deviceName));

        // New Metrics Data Filtering
        const qosHealthyData = links.filter(l => (l.performanceScore || 0) > 90);
        const qosIssuesData = links.filter(l => (l.performanceScore || 0) <= 90);

        // Simulating data partitions for metrics that don't have explicit backing data in mock
        const cpuIssuesData = nodes.slice(0, Math.floor(totalNodes * 0.08));
        const cpuHealthyData = nodes.slice(Math.floor(totalNodes * 0.08));

        const memIssuesData = nodes.slice(0, Math.floor(totalNodes * 0.12));
        const memHealthyData = nodes.slice(Math.floor(totalNodes * 0.12));

        const uptimeIssuesData = nodes.filter(n => n.status === 'DOWN');
        const uptimeHealthyData = nodes.filter(n => n.status === 'UP');

        const errorsHealthyData = links.filter(l => !l.errors || l.errors === 0);
        const errorsIssuesData = links.filter(l => l.errors && l.errors > 0);

        const rebootData = nodes.slice(0, Math.floor(totalNodes * 0.05));

        const bgpHealthyData = links.filter(l => l.peering && l.peering !== 'None');
        const bgpIssuesData = links.filter(l => !l.peering || l.peering === 'None'); // Simplified proxy

        const ticketsClosedData = allEvents.filter(e => e.srStatus === 'Closed');
        const ticketsOpenData = allEvents.filter(e => e.srStatus !== 'Closed');

        const mailData = allEvents.filter(e => e.category === 'Notification');

        const raCompletedData = raInventory.filter(r => r.status === 'Completed');
        const raPendingData = raInventory.filter(r => r.status !== 'Completed');

        return {
            device: { val: deviceUp.length, total: totalNodes, issues: deviceDown.length, data: nodes, upData: deviceUp, downData: deviceDown },
            link: { val: linkUp.length, total: totalLinks, issues: linkDown.length, data: links, upData: linkUp, downData: linkDown },
            bw: { val: bwHealthy.length, total: totalLinks, issues: bwIssues.length, data: links, upData: bwHealthy, downData: bwIssues },
            jitter: { val: jitterHealthy.length, total: totalLinks, issues: jitterIssues.length, data: links, upData: jitterHealthy, downData: jitterIssues },
            config: { val: configSuccess.length, total: totalNodes, issues: configIssues.length, data: nodes, upData: configSuccess, downData: configIssues },
            critical: { issues: allEvents.filter(e => e.severity === 'CRITICAL').length },

            // New Metrics
            qos: { val: qosHealthyData.length, total: totalLinks, data: links, upData: qosHealthyData, downData: qosIssuesData },
            cpu: { val: cpuHealthyData.length, total: totalNodes, data: nodes, upData: cpuHealthyData, downData: cpuIssuesData },
            memory: { val: memHealthyData.length, total: totalNodes, data: nodes, upData: memHealthyData, downData: memIssuesData },
            uptime: { val: uptimeHealthyData.length, total: totalNodes, data: nodes, upData: uptimeHealthyData, downData: uptimeIssuesData },
            errors: { val: errorsHealthyData.length, total: totalLinks, data: links, upData: errorsHealthyData, downData: errorsIssuesData },
            reboot: { val: rebootData.length, total: totalNodes, data: nodes, upData: rebootData, downData: [] }, // Reboot "good" isn't exactly standard, just export count
            bgp: { val: bgpHealthyData.length, total: totalLinks, data: links, upData: bgpHealthyData, downData: bgpIssuesData },
            ticketing: { val: ticketsClosedData.length, total: allEvents.length, data: allEvents, upData: ticketsClosedData, downData: ticketsOpenData },
            mail: { val: mailData.length, total: allEvents.length, data: allEvents, upData: mailData, downData: [] },
            ra: { val: raCompletedData.length, total: raInventory.length, data: raInventory, upData: raCompletedData, downData: raPendingData },
            disc: { val: nodes.length, total: totalNodes, data: nodes, upData: nodes, downData: [] },
            reports: { val: 45, total: 50, data: [], upData: [], downData: [] },
        };
    }, [nodes, links, configFailure, allEvents, raInventory]);

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
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setView('main')}
                            className="p-1 rounded-lg hover:bg-primary/10 text-primary transition-all flex items-center justify-center"
                            title="Back to Overview"
                        >
                            <ChevronLeft size={20} strokeWidth={2.5} />
                        </button>
                        <div className="h-5 w-1 bg-primary rounded-full shadow-[0_0_8px_rgba(0,165,142,0.4)]" />
                        <h2 className="text-[12px] font-black uppercase tracking-[0.15em] text-foreground/90">
                            Global Issue Analytics
                        </h2>
                    </div>
                    <div className="h-[1px] flex-1 mx-4 bg-gradient-to-r from-border/50 to-transparent" />
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
            {showNetworkMetrics && (
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
                            exportData={stats.device.data}
                            exportUpData={stats.device.upData}
                            exportDownData={stats.device.downData}
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
                            exportData={stats.link.data}
                            exportUpData={stats.link.upData}
                            exportDownData={stats.link.downData}
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
                            exportData={stats.bw.data}
                            exportUpData={stats.bw.upData}
                            exportDownData={stats.bw.downData}
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
                            exportData={stats.jitter.data}
                            exportUpData={stats.jitter.upData}
                            exportDownData={stats.jitter.downData}
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
                            exportData={stats.config.data}
                            exportUpData={stats.config.upData}
                            exportDownData={stats.config.downData}
                        />
                    </div>
                </div>
            )}

            {/* Operational Performance Metrics */}
            <div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {/* Network Based Stats */}
                    {showNetworkMetrics && (
                        <>
                            <KPICard
                                title="QOS Score"
                                value={String(stats.qos.val)}
                                total={String(stats.qos.total)}
                                issueCount={stats.qos.total - stats.qos.val}
                                icon={Signal}
                                exportData={stats.qos.data}
                                exportUpData={stats.qos.upData}
                                exportDownData={stats.qos.downData}
                            />
                            <KPICard
                                title="CPU Load"
                                value={String(stats.cpu.val)}
                                total={String(stats.cpu.total)}
                                issueCount={stats.cpu.total - stats.cpu.val}
                                icon={Cpu}
                                exportData={stats.cpu.data}
                                exportUpData={stats.cpu.upData}
                                exportDownData={stats.cpu.downData}
                            />
                            <KPICard
                                title="Memory Usage"
                                value={String(stats.memory.val)}
                                total={String(stats.memory.total)}
                                issueCount={stats.memory.total - stats.memory.val}
                                icon={MemoryStick}
                                exportData={stats.memory.data}
                                exportUpData={stats.memory.upData}
                                exportDownData={stats.memory.downData}
                            />
                            <KPICard
                                title="System Uptime"
                                value={String(stats.uptime.val)}
                                total={String(stats.uptime.total)}
                                issueCount={stats.uptime.total - stats.uptime.val}
                                icon={Clock}
                                exportData={stats.uptime.data}
                                exportUpData={stats.uptime.upData}
                                exportDownData={stats.uptime.downData}
                            />
                            <KPICard
                                title="Link Errors"
                                value={String(stats.errors.total - stats.errors.val)}
                                total={String(stats.errors.total)}
                                issueCount={stats.errors.total - stats.errors.val}
                                icon={AlertTriangle}
                                exportData={stats.errors.data}
                                exportUpData={stats.errors.upData}
                                exportDownData={stats.errors.downData}
                            />
                            <KPICard
                                title="Reboot Counter"
                                value={String(stats.reboot.val)}
                                total={String(stats.reboot.total)}
                                issueCount={0}
                                icon={RefreshCcw}
                                exportData={stats.reboot.data}
                                exportUpData={stats.reboot.upData}
                            />
                            <KPICard
                                title="BGP Sessions"
                                value={String(stats.bgp.val)}
                                total={String(stats.bgp.total)}
                                issueCount={stats.bgp.total - stats.bgp.val}
                                icon={Network}
                                exportData={stats.bgp.data}
                                exportUpData={stats.bgp.upData}
                                exportDownData={stats.bgp.downData}
                            />
                        </>
                    )}

                    {/* Application Specific Stats */}
                    {showAppMetrics && (
                        <>
                            <KPICard
                                title="Ticketing"
                                value={String(stats.ticketing.val)}
                                total={String(stats.ticketing.total)}
                                issueCount={stats.ticketing.total - stats.ticketing.val}
                                icon={Ticket}
                                exportData={stats.ticketing.data}
                                exportUpData={stats.ticketing.upData}
                                exportDownData={stats.ticketing.downData}
                            />
                            <KPICard
                                title="Mail Triggers"
                                value={String(stats.mail.val)}
                                total={String(stats.mail.total)}
                                issueCount={0}
                                icon={Mail}
                                exportData={stats.mail.data}
                                exportUpData={stats.mail.upData}
                            />
                            <KPICard
                                title="RA Processing"
                                value={String(stats.ra.val)}
                                total={String(stats.ra.total)}
                                issueCount={stats.ra.total - stats.ra.val}
                                icon={FileSpreadsheet}
                                exportData={stats.ra.data}
                                exportUpData={stats.ra.upData}
                                exportDownData={stats.ra.downData}
                            />
                            <KPICard
                                title="Sched Disc"
                                value={String(stats.disc.val)}
                                total={String(stats.disc.total)}
                                issueCount={0}
                                icon={Calendar}
                                exportData={stats.disc.data}
                                exportUpData={stats.disc.upData}
                            />
                            <KPICard
                                title="Sched Reports"
                                value={String(stats.reports.val)}
                                total={String(stats.reports.total)}
                                issueCount={0}
                                icon={FileSpreadsheet}
                                exportData={stats.reports.data}
                                exportUpData={stats.reports.upData}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
