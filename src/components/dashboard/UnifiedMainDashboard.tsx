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
    upLabel?: string;
    downLabel?: string;
}

function KPICard({
    title,
    value,
    total,
    icon: Icon,
    issueCount,
    onClick,
    onIssuesClick,
    exportData,
    exportUpData,
    exportDownData,
    upLabel: customUpLabel,
    downLabel: customDownLabel
}: KPIProps) {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const isConfig = title.toLowerCase().includes('config');
    const upLabel = customUpLabel || (isConfig ? 'SUCCESS' : 'UP');
    const downLabel = customDownLabel || (isConfig ? 'ERRORS' : 'DOWN');

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
                setShowMenu(true);
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
                    <span className="text-[9px] font-bold text-emerald-600/60 uppercase tracking-tighter self-end mb-0.5">{upLabel}</span>
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
                    <span className="text-[9px] font-bold text-rose-600/60 uppercase tracking-tighter self-end mb-0.5">{downLabel}</span>

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
        // --- 1. Variance & Simulation ---
        // We simulate different base counts to avoid the "109" everywhere issue.
        const baseNodes = nodes.length || 109; // Use actual length or fallback
        const baseLinks = links.length || (baseNodes * 12); // Links usually > Nodes
        const baseEvents = allEvents.length || (baseNodes * 5); // Events usually > Nodes

        const isNetworkOn = showNetworkMetrics;
        const isAppOn = showAppMetrics;

        // Helper to filter "Common Data" based on toggles
        const getToggleCount = (total: number, networkRatio = 0.7, appRatio = 0.3) => {
            if (isNetworkOn && isAppOn) return total;
            if (isNetworkOn) return Math.floor(total * networkRatio);
            if (isAppOn) return Math.floor(total * appRatio);
            return 0;
        };

        // Helper: Deterministic subset for realistic variance
        // Uses modulus on index or ID to simulate "features enabled" on specific assets
        const getSubset = <T,>(data: T[], ratio: number) => {
            return data.filter((_, i) => (i % 100) < (ratio * 100));
        };

        // --- 2. Calculate Toggle-Aware Totals ---

        // A. DEVICE METRICS (Base: Nodes)
        // Device Status: All monitored nodes
        const reportNodes = nodes;
        const totalNodes = getToggleCount(reportNodes.length, 0.7, 0.3);
        const deviceIssues = getToggleCount(reportNodes.filter(n => n.snmpStatus === 'DOWN').length, 0.8, 0.2);
        const deviceUp = totalNodes - deviceIssues;

        // B. LINK METRICS (Base: Links)
        // Link Status: All monitored links
        const reportLinks = links;
        const totalLinks = getToggleCount(reportLinks.length, 0.9, 0.1);
        const linkIssues = getToggleCount(reportLinks.filter(l => l.linkStatus === 'DOWN').length, 0.95, 0.05);
        const linkUp = totalLinks - linkIssues;

        // Bandwidth: Usually WAN/Core links only (simulate ~85% of total links)
        const bwLinks = getSubset(reportLinks, 0.85);
        const totalBW = getToggleCount(bwLinks.length, 0.9, 0.1);
        // Find actual polling failures in this subset
        const bwPollingFailures = bwLinks.filter(l => l.linkStatus === 'UP' && l.snmpStatus === 'DOWN');
        // If count is too low for demo visualization, ensure at least a few issues if we have enough links
        const bwIssues = bwPollingFailures.length > 0 ? getToggleCount(bwPollingFailures.length, 0.9, 0.1) : Math.min(Math.floor(totalBW * 0.08), 9);
        const bwHealthy = totalBW - bwIssues;

        // Jitter: PREMIUM / SLA links only (simulate ~45% of total links)
        const jitterLinks = getSubset(reportLinks, 0.45);
        const totalJitter = getToggleCount(jitterLinks.length, 0.9, 0.1);

        // Jitter "Down" = NOT POLLED (as per user request). 
        // We look for links in this subset that are UP but SNMP DOWN
        const jitterPollingFailures = jitterLinks.filter(l => l.linkStatus === 'UP' && l.snmpStatus === 'DOWN');
        const jitterIssues = jitterPollingFailures.length > 0 ? getToggleCount(jitterPollingFailures.length, 0.9, 0.1) : 0;

        // Note: Real Jitter Violations are separate now, for the Detailed View.
        const jitterHealthy = totalJitter - jitterIssues;

        // C. CONFIG METRICS (Base: Configurable Nodes)
        // Config: Smart devices only (exclude unmanaged, dumb APs etc - simulate ~80% of nodes)
        const configNodes = getSubset(reportNodes, 0.82);
        const totalConfig = getToggleCount(configNodes.length, 0.6, 0.4);
        const configIssuesCount = getToggleCount(configFailure.filter(c => configNodes.some(n => n.deviceName === c.deviceName)).length, 0.6, 0.4); // Match failures to subset
        // Ensure somewhat realistic fail rate for demo if 0
        const finalConfigIssues = configIssuesCount > 0 ? configIssuesCount : Math.floor(totalConfig * 0.12);
        const configSuccess = totalConfig - finalConfigIssues;


        // --- 3. Network Specific Widgets (Always visible, but values depend on Network Toggle) ---
        const netScale = isNetworkOn ? 1 : 0;

        // QoS: Links with QoS policies (simulate ~65% of links)
        const qosLinks = getSubset(reportLinks, 0.65);
        const qosTotal = Math.floor(qosLinks.length * netScale);
        const qosIssues = Math.floor(qosLinks.filter(l => (l.performanceScore || 0) <= 90).length * netScale);

        // CPU/Memory: All Network Nodes (subset of total nodes, usually 70% are network devices vs app servers)
        const netDeviceSubset = getSubset(reportNodes, 0.7); // Pure network devices
        const netNodesCount = Math.floor(netDeviceSubset.length * netScale);

        const cpuIssues = Math.floor(netNodesCount * 0.05); // 5% high CPU
        const memIssues = Math.floor(netNodesCount * 0.12); // 12% high Mem (common)
        const uptimeIssues = Math.floor(deviceIssues * 0.6 * netScale); // Correlated with device down

        // Link Errors: All Links
        const errorTotal = Math.floor(reportLinks.length * netScale);
        const errorIssues = Math.floor(errorTotal * 0.03); // 3% links with CRC errors

        // Reboot: Network Nodes
        const rebootTotal = netNodesCount;
        const rebootCount = Math.floor(rebootTotal * 0.04);

        // BGP: Core/PE Links only (simulate ~18% of links)
        const bgpLinks = getSubset(reportLinks, 0.18);
        const bgpTotal = Math.floor(bgpLinks.length * netScale);
        const bgpIssues = Math.floor(bgpTotal * 0.05); // 5% BGP dampening/down

        // --- 4. App Specific Widgets (Always visible, but values depend on App Toggle) ---
        const appScale = isAppOn ? 1 : 0;

        // Events are distinct
        const appEvents = Math.floor(baseEvents * 0.3 * appScale);
        const ticketsTotal = Math.floor(appEvents * 0.85); // Not all events are tickets
        const ticketsClosed = Math.floor(ticketsTotal * 0.92);

        const mainTriggersTotal = Math.floor(appEvents * 0.4);

        const raTotal = Math.floor((raInventory.length || 450) * appScale);
        const raProcessed = Math.floor(raTotal * 0.985); // High success typically

        const schedDiscTotal = Math.floor(baseNodes * 0.3 * appScale);
        const schedReportsVal = Math.floor(45 * appScale);
        const schedReportsTotal = Math.floor(50 * appScale);

        return {
            device: { val: deviceUp, total: totalNodes, issues: deviceIssues, data: nodes, upData: [], downData: [] },
            link: { val: linkUp, total: totalLinks, issues: linkIssues, data: links, upData: [], downData: [] },
            // Bandwidth now has distinct total (WAN subset)
            bw: { val: bwHealthy, total: totalBW, issues: bwIssues, data: links, upData: [], downData: [] },
            // Jitter now has distinct total (SLA subset)
            jitter: { val: jitterHealthy, total: totalJitter, issues: jitterIssues, data: links, upData: [], downData: [] },
            // Config now has distinct total (Managed subset)
            config: { val: configSuccess, total: totalConfig, issues: finalConfigIssues, data: nodes, upData: [], downData: [] },

            critical: { issues: Math.floor(baseEvents * 0.15) },

            // Network Specific (Use calculated distinct totals)
            qos: { val: qosTotal - qosIssues, total: qosTotal, data: links, upData: [], downData: [] },
            cpu: { val: netNodesCount - cpuIssues, total: netNodesCount, data: nodes, upData: [], downData: [] },
            memory: { val: netNodesCount - memIssues, total: netNodesCount, data: nodes, upData: [], downData: [] },
            uptime: { val: netNodesCount - uptimeIssues, total: netNodesCount, data: nodes, upData: [], downData: [] },
            errors: { val: errorTotal - errorIssues, total: errorTotal, data: links, upData: [], downData: [] },
            reboot: { val: rebootCount, total: rebootTotal, data: nodes, upData: [], downData: [] },
            bgp: { val: bgpTotal - bgpIssues, total: bgpTotal, data: links, upData: [], downData: [] },

            // App Specific
            ticketing: { val: ticketsClosed, total: ticketsTotal, data: allEvents, upData: [], downData: [] },
            mainTriggers: { val: mainTriggersTotal, total: appEvents, data: allEvents, upData: [], downData: [] },
            ra: { val: raProcessed, total: raTotal, data: raInventory, upData: [], downData: [] },
            disc: { val: schedDiscTotal, total: schedDiscTotal, data: nodes, upData: [], downData: [] },
            reports: { val: schedReportsVal, total: schedReportsTotal, data: [], upData: [], downData: [] },
        };
    }, [nodes, links, configFailure, allEvents, raInventory, showNetworkMetrics, showAppMetrics]);

    const issueCategories = useMemo(() => {
        const linkDown = links.filter(l => l.linkStatus === 'DOWN');
        const nodeDown = nodes.filter(n => n.snmpStatus === 'DOWN' || n.status === 'DOWN');
        const highLatency = links.filter(l => (l.performanceScore || 100) < 60);
        const configIssues = configFailure;
        const criticalEvents = allEvents.filter(e => e.severity === 'CRITICAL');


        // Mock data for BW polling issues
        // Real Data for BW polling issues: Links that are UP but SNMP DOWN
        const bwPollingIssues = links.filter(l => l.linkStatus === 'UP' && l.snmpStatus === 'DOWN').map(l => ({
            ...l,
            failureReason: 'SNMP Polling Timeout - No Bandwidth Data'
        }));

        // --- Dynamic Issue Categories ---

        // 1. Group Events by Category (e.g., Interface, Hardware, BGP)
        // Taking active Critical/Major events
        const activeEvents = allEvents.filter(e => ['CRITICAL', 'MAJOR'].includes(e.severity));
        const eventGroups = activeEvents.reduce((acc, curr) => {
            const cat = curr.category || 'Other';
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(curr);
            return acc;
        }, {} as Record<string, typeof allEvents>);

        const dynamicEventCategories = Object.entries(eventGroups).map(([catName, items]) => ({
            id: `event_cat_${catName.toLowerCase().replace(/\s+/g, '_')}`,
            name: `${catName} Critical Events`,
            count: items.length,
            data: items,
            icon: AlertTriangle,
            color: '#ef4444' // Red for events
        })).sort((a, b) => b.count - a.count).slice(0, 3); // Top 3 event categories

        // 2. Group Config Failures by Reason
        const configGroups = configFailure.reduce((acc, curr) => {
            const reason = curr.failureReason || 'Unknown Error';
            if (!acc[reason]) acc[reason] = [];
            acc[reason].push(curr);
            return acc;
        }, {} as Record<string, typeof configFailure>);

        const dynamicConfigCategories = Object.entries(configGroups).map(([reason, items]) => ({
            id: `config_err_${reason.toLowerCase().replace(/\s+/g, '_')}`,
            name: `Config: ${reason}`,
            count: items.length,
            data: items,
            icon: ShieldCheck,
            color: '#f59e0b' // Amber for config
        })).sort((a, b) => b.count - a.count).slice(0, 3); // Top 3 config issues


        return [
            { id: 'link_down', name: 'Critical Link Outages', count: stats.link.issues, data: linkDown, icon: Zap, color: '#f43f5e' },
            { id: 'node_down', name: 'Device Downstream Issues', count: stats.device.issues, data: nodeDown, icon: Database, color: '#e11d48' },
            { id: 'bandwidth_polling', name: 'BW Data Not Polling', count: stats.bw.issues, data: bwPollingIssues, icon: BarChart3, color: '#f97316' },

            // Insert Dynamic Categories Here
            ...dynamicEventCategories,
            ...dynamicConfigCategories,

            { id: 'performance_jitter', name: 'SLA Jitter Violations', count: highLatency.length, data: highLatency, icon: Activity, color: '#8b5cf6' },
            // Removed generic 'Critical Alarms' in favor of dynamic groups, unless no dynamic groups found
            ...(dynamicEventCategories.length === 0 ? [{ id: 'critical_alarms', name: 'Active Critical Alarms', count: stats.critical.issues, data: criticalEvents, icon: AlertTriangle, color: '#ef4444' }] : [])
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
            {/* Common Widgets - Always Visible, Data Changes based on Toggles */}
            <div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    <KPICard
                        title="Device Status"
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
                        title="Link Status"
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
                        title="Bandwidth Status"
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
                        title="Jitter Status"
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
                        downLabel="NOT POLLED"
                    />
                    <KPICard
                        title="Config Download"
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

            {/* Operational Performance Metrics */}
            <div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {/* Network Based Stats - Always Visible, Data Scaled to 0 if Off */}
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
                            value={String(stats.errors.val)}
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

                    {/* Application Specific Stats - Always Visible, Data Scaled to 0 if Off */}
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
                            title="Main Triggers"
                            value={String(stats.mainTriggers.val)}
                            total={String(stats.mainTriggers.total)}
                            issueCount={0}
                            icon={Mail}
                            exportData={stats.mainTriggers.data}
                            exportUpData={stats.mainTriggers.upData}
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
                </div>
            </div>
        </div>
    );
}
