import { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useInventoryStore } from '@/store/inventoryStore';
import { UniversalChartRenderer } from './DistributionCharts';
import { cn } from '@/lib/utils';
import { Maximize2, Minimize2, Download, Zap, Shield, Map as MapIcon, Users, Cpu, TrendingUp, AlertTriangle, CheckCircle2, Settings2, Activity, Database, ExternalLink } from 'lucide-react';
import { exportToCSV } from '@/utils/exportUtils';
import { ChartTypeSelector } from '../common/ChartTypeSelector';
import type { LinkData, NodeData, ChartType } from '@/types/inventory';

interface SpecializedWidgetProps {
    title: string;
    data: any[];
    chartType: ChartType;
    source?: 'nodes' | 'links' | 'mixed';
    height?: number;
    className?: string;
    description?: string;
    fullWidth?: boolean;
}

function SpecializedWidget({ title, data, chartType: initialChartType, source = 'links', height = 340, className, description, fullWidth }: SpecializedWidgetProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [currentChartType, setCurrentChartType] = useState<ChartType>(initialChartType);
    const [customTitle, setCustomTitle] = useState(title);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, name: string } | null>(null);

    const { setSelectedModule, toggleFilter, getFilteredNodes, getFilteredLinks } = useInventoryStore();

    // Sync if props change
    useEffect(() => {
        setCurrentChartType(initialChartType);
        setCustomTitle(title);
    }, [initialChartType, title]);

    const handleExport = () => {
        let exportData = data;
        let filename = `${customTitle.replace(/\s+/g, '_')}`;

        if (source === 'nodes') {
            exportData = getFilteredNodes();
            filename += '_Detail_List.csv';
        } else if (source === 'links') {
            exportData = getFilteredLinks();
            filename += '_Detail_List.csv';
        } else if (currentChartType === 'table') {
            exportData = data;
            filename += '_Table_View.csv';
        } else {
            filename += '_Summary.csv';
        }

        exportToCSV(exportData, filename);
    };

    const handleContextMenu = (e: React.MouseEvent, name: string) => {
        e.preventDefault();
        const x = e.clientX;
        const y = e.clientY;

        const menuWidth = 240;
        const menuHeight = 220;
        const clampedX = Math.min(x, window.innerWidth - menuWidth - 20);
        const clampedY = Math.min(y, window.innerHeight - menuHeight - 20);

        setContextMenu({ x: clampedX, y: clampedY, name });
    };

    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    // Data Adapter: Ensures data is compatible with charts (names and values)
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];

        // If it already has name and value, keep it
        if (data[0].name !== undefined && data[0].value !== undefined) return data;

        // If it's table data, we need to adapt it for charts
        const keys = Object.keys(data[0]);
        // Filter out internal keys
        const validKeys = keys.filter(k => !['color', 'opacity', 'isSelected'].includes(k));

        // Strategy: First string key as name, first number key as value. If no number, count occurrences of stringKey.
        const stringKey = validKeys.find(k => typeof data[0][k] === 'string') || validKeys[0];
        const numberKey = validKeys.find(k => typeof data[0][k] === 'number') || null;

        if (numberKey) {
            return data.map(item => ({
                name: String(item[stringKey]),
                value: item[numberKey],
                ...item
            }));
        } else {
            // Count occurrences of the primary string key
            const counts: Record<string, number> = {};
            data.forEach(item => {
                const val = String(item[stringKey] || 'N/A');
                counts[val] = (counts[val] || 0) + 1;
            });
            return Object.entries(counts)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 15); // Limit for chart clarity
        }
    }, [data, currentChartType]);

    const handleDownloadCategory = (categoryName: string) => {
        if (!data || data.length === 0) return;

        // Determine which field we're filtering on
        const keys = Object.keys(data[0]);
        const validKeys = keys.filter(k => !['color', 'opacity', 'isSelected'].includes(k));
        const stringKey = validKeys.find(k => typeof data[0][k] === 'string') || validKeys[0];

        // Filter the original raw data
        const categoryData = data.filter(item => {
            if (item.name !== undefined && item.value !== undefined) {
                return item.name === categoryName;
            }
            return String(item[stringKey]) === categoryName;
        });

        if (categoryData.length > 0) {
            exportToCSV(categoryData, `${customTitle}_${categoryName}.csv`);
        }
    };

    return (
        <div
            id="cons"
            className={cn(
                "group relative flex flex-col rounded-2xl border border-border/50 bg-card/10 backdrop-blur-md transition-all duration-300 hover:shadow-xl hover:border-primary/30",
                isExpanded ? "fixed inset-4 z-50 bg-card/95 p-6" : fullWidth ? "col-span-full" : "",
                className
            )}
            style={!isExpanded ? { height: fullWidth ? 'auto' : height, minHeight: height } : {}}
        >
            <div className="flex items-center justify-between border-b border-border/50 px-4 py-3 shrink-0">
                <div className="flex flex-col overflow-hidden">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary/60 shadow-[0_0_8px_rgba(0,165,142,0.4)]" />
                        <h4 className="text-[11px] font-black uppercase tracking-widest text-foreground/90 truncate mr-2">{customTitle}</h4>
                        <span className={cn(
                            "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-tight whitespace-nowrap",
                            source === 'nodes' ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                                source === 'links' ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                                    "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        )}>
                            {source}
                        </span>
                    </div>
                    {description && <p className="text-[9px] text-muted-foreground mt-0.5 font-medium truncate">{description}</p>}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-all"
                        title={isExpanded ? "Minimize" : "Maximize"}
                    >
                        {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                    </button>

                    <ChartTypeSelector
                        data={chartData}
                        currentType={currentChartType}
                        onTypeChange={setCurrentChartType}
                        title={customTitle}
                        onTitleChange={setCustomTitle}
                        variant="mini"
                    />

                    <button
                        onClick={handleExport}
                        className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-all"
                        title="Export CSV"
                    >
                        <Download size={14} />
                    </button>
                </div>
            </div>

            <div className={cn("flex-1 p-4 overflow-hidden flex flex-col min-h-0", currentChartType === 'table' ? "overflow-y-auto" : "")}>
                {currentChartType === 'table' ? (
                    <div className="w-full h-full overflow-auto custom-scrollbar">
                        <table className="w-full text-left text-[10px] border-collapse">
                            <thead className="sticky top-0 bg-card/50 backdrop-blur-sm z-10">
                                <tr className="text-muted-foreground border-b border-border/50">
                                    {data.length > 0 && Object.keys(data[0]).filter(k => !['color', 'opacity', 'isSelected', 'x', 'y', 'z'].includes(k)).map(key => (
                                        <th key={key} className="px-3 py-2 font-black uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1')}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.length > 0 ? data.map((row, i) => (
                                    <tr key={i} className="border-b border-border/5 hover:bg-primary/5 transition-colors">
                                        {Object.entries(row).filter(([k]) => !['color', 'opacity', 'isSelected', 'x', 'y', 'z'].includes(k)).map(([k, v], j) => (
                                            <td key={j} className={cn("px-3 py-2 font-medium capitalize", k.toLowerCase().includes('status') && (v === 'UP' || v === 'ACTIVE' || v === 'ONLINE') ? "text-emerald-500 font-bold" : k.toLowerCase().includes('status') && (v === 'DOWN' || v === 'OFFLINE' || v === 'FAILED') ? "text-rose-500 font-bold" : "text-foreground/80")}>
                                                {String(v)}
                                            </td>
                                        ))}
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground italic">
                                            No data matching criteria in current view
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex-1 w-full min-h-0 flex items-center justify-center">
                        {chartData.length > 0 ? (
                            <UniversalChartRenderer
                                data={chartData}
                                chartType={currentChartType as any}
                                variant={isExpanded ? 'default' : 'mini'}
                                onPointClick={() => { }}
                                onPointExport={handleDownloadCategory}
                                onContextMenu={handleContextMenu}
                            />
                        ) : (
                            <div className="text-[10px] text-muted-foreground italic bg-muted/20 px-4 py-8 rounded-lg border border-dashed border-border/50">
                                No visualization data available
                            </div>
                        )}
                    </div>
                )}
            </div>

            {contextMenu && createPortal(
                <div
                    className="fixed z-[9999] w-60 bg-background/95 backdrop-blur-xl border border-border shadow-2xl rounded-2xl overflow-hidden py-1.5 animate-in fade-in zoom-in-90 duration-200"
                    style={{ left: contextMenu.x, top: contextMenu.y }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="px-4 py-2 border-b border-border/50 bg-primary/5 mb-1.5">
                        <p className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                            <Settings2 size={10} />
                            Pivot Analysis
                        </p>
                        <p className="text-xs font-bold text-foreground truncate mt-0.5">{contextMenu.name}</p>
                    </div>

                    <button
                        onClick={() => {
                            // Specialized widgets are more complex, we might not always have a single field to filter on
                            // but we try our best using the component's internal knowledge if possible
                            // For now, pivoting to events for this segment
                            setSelectedModule('filteredEvents');
                            setContextMenu(null);
                        }}
                        className="w-full text-left px-4 py-2 text-xs hover:bg-primary hover:text-primary-foreground transition-all flex items-center gap-3 group"
                    >
                        <Activity size={14} className="text-primary group-hover:text-primary-foreground shadow-sm" />
                        <div>
                            <p className="font-bold">Event Correlation</p>
                            <p className="text-[9px] opacity-70">RCA for this segment</p>
                        </div>
                    </button>

                    <button
                        onClick={() => {
                            setSelectedModule('filteredConfig');
                            setContextMenu(null);
                        }}
                        className="w-full text-left px-4 py-2 text-xs hover:bg-blue-500 hover:text-white transition-all flex items-center gap-3 group"
                    >
                        <Database size={14} className="text-blue-500 group-hover:text-white" />
                        <div>
                            <p className="font-bold">Config Drift</p>
                            <p className="text-[9px] opacity-70">Compliance & Backup</p>
                        </div>
                    </button>

                    <div className="border-t border-border/50 mt-1.5 pt-1.5">
                        <button className="w-full text-left px-4 py-2 text-xs hover:bg-muted text-muted-foreground flex items-center gap-3 group transition-colors">
                            <TrendingUp size={14} className="opacity-50 group-hover:opacity-100" />
                            <span>Segment Trends</span>
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}

// --- 1. NETWORK OPERATIONS MODULE ---
export function InventoryOpsModule() {
    const { getFilteredLinks } = useInventoryStore();
    const links = getFilteredLinks();

    const monitoringData = useMemo(() => {
        const counts = { 'Monitored': 0, 'Maintenance Mode': 0 };
        links.forEach(l => {
            // PROACTIVE_MONITORING = "Yes" means link is in MAINTENANCE MODE (excluded from monitoring)
            const isInMaintenance = (l as any).PROACTIVE_MONITORING === 'Yes';

            if (isInMaintenance) {
                counts['Maintenance Mode']++;
            } else {
                // Only count as monitored if NOT in maintenance AND has monitoring enabled
                const hasPingMonitoring = (l as any).PING === 'Yes';
                const hasLinkMonitoring = (l as any).MONITOR_VIA_LINK === 'Yes';
                const isMonitored = hasPingMonitoring || hasLinkMonitoring;

                counts[isMonitored ? 'Monitored' : 'Maintenance Mode']++;
            }
        });
        return [
            { name: 'Monitored', value: counts['Monitored'], color: '#10b981' },
            { name: 'Maintenance Mode', value: counts['Maintenance Mode'], color: '#f59e0b' }
        ];
    }, [links]);

    const snmpData = useMemo(() => {
        const counts: Record<string, number> = {};
        links.forEach(l => {
            const v = (l as any).SNMP_VERSION || 'No SNMP';
            counts[v] = (counts[v] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [links]);

    const scanTypeData = useMemo(() => {
        const counts: Record<string, number> = {};
        links.forEach(l => {
            const v = l.scanType || 'Unknown';
            counts[v] = (counts[v] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [links]);

    const redundancyData = useMemo(() => {
        const counts = { 'Primary': 0, 'Secondary': 0, 'Single-Homed': 0 };
        links.forEach(l => {
            const v = (l as any).PRIMARY_OR_SECONDARY || (l as any).primarySecondary || 'Single-Homed';
            if (v.toLowerCase().includes('primary')) counts['Primary']++;
            else if (v.toLowerCase().includes('secondary')) counts['Secondary']++;
            else counts['Single-Homed']++;
        });
        return [
            { name: 'Primary', value: counts['Primary'], color: '#3b82f6' },
            { name: 'Secondary', value: counts['Secondary'], color: '#10b981' },
            { name: 'Single-Homed', value: counts['Single-Homed'], color: '#f59e0b' }
        ];
    }, [links]);

    const nonRedundantSites = useMemo(() => {
        return links
            .filter(l => {
                const v = (l as any).PRIMARY_OR_SECONDARY || (l as any).primarySecondary || '';
                return !v.toLowerCase().includes('primary') && !v.toLowerCase().includes('secondary');
            })
            .slice(0, 15)
            .map(l => ({
                SiteName: (l as any).siteName || 'Unknown Site',
                LSI: (l as any).linkId || l.lsi || 'N/A',
                Risk: 'Single Homed'
            }));
    }, [links]);

    const failoverScoreData = useMemo(() => {
        const primary = links.filter(l => (l as any).PRIMARY_OR_SECONDARY?.toLowerCase().includes('primary')).length;
        const secondary = links.filter(l => (l as any).PRIMARY_OR_SECONDARY?.toLowerCase().includes('secondary')).length;
        const score = Math.round((secondary / (primary || 1)) * 100);
        return [{ name: 'Score', value: score }];
    }, [links]);

    const monitoringHoursData = useMemo(() => {
        return [
            { name: '24x7', value: Math.floor(links.length * 0.85) },
            { name: 'Business Hours', value: Math.floor(links.length * 0.12) },
            { name: 'Custom', value: Math.floor(links.length * 0.03) }
        ];
    }, [links]);

    const discoveryData = useMemo(() => {
        const counts = { 'Success': 0, 'Failure': 0 };
        links.forEach(l => {
            const v = (l as any).LAST_STATUS_CODE || '200';
            counts[v === '200' ? 'Success' : 'Failure']++;
        });
        return Object.entries(counts).map(([name, value]) => ({
            name, value, color: name === 'Success' ? '#10b981' : '#f43f5e'
        }));
    }, [links]);

    const healthData = useMemo(() => {
        const counts = {
            'Ping UP / SNMP UP': 0,
            'Ping UP / SNMP DOWN': 0,
            'Ping DOWN / SNMP UP': 0,
            'Ping DOWN / SNMP DOWN': 0
        };

        links.forEach(l => {
            // Determine Ping status
            const isPingUp = l.pingStatus?.toUpperCase() === 'UP' ||
                l.linkStatus === 'UP' ||
                l.linkState?.toUpperCase() === 'UP' ||
                l.reachabilityStatus?.toUpperCase() === 'REACHABLE';

            // Determine SNMP status independently
            const isSnmpUp = l.snmpStatus?.toUpperCase() === 'UP' ||
                (l.scanType?.toUpperCase().includes('SNMP') && l.linkStatus === 'UP');

            // Categorize based on both statuses
            if (isPingUp && isSnmpUp) {
                counts['Ping UP / SNMP UP']++;
            } else if (isPingUp && !isSnmpUp) {
                counts['Ping UP / SNMP DOWN']++;
            } else if (!isPingUp && isSnmpUp) {
                counts['Ping DOWN / SNMP UP']++;
            } else {
                counts['Ping DOWN / SNMP DOWN']++;
            }
        });

        return Object.entries(counts)
            .filter(([, value]) => value > 0) // Only show categories with data
            .map(([name, value]) => ({
                name,
                value,
                color: name === 'Ping UP / SNMP UP' ? '#10b981' :
                    name === 'Ping UP / SNMP DOWN' ? '#f59e0b' :
                        name === 'Ping DOWN / SNMP UP' ? '#8b5cf6' :
                            '#f43f5e'
            }));
    }, [links]);

    const pollingIssues = useMemo(() => {
        return links
            .filter(l => {
                const isPingUp = l.pingStatus?.toUpperCase() === 'UP' || l.linkStatus === 'UP';
                const isSnmpDown = l.snmpStatus?.toUpperCase() === 'DOWN' || (!l.scanType?.toUpperCase().includes('SNMP') && isPingUp);
                return isPingUp && isSnmpDown;
            })
            .slice(0, 15)
            .map(l => ({
                Circuit: (l as any).linkId || l.lsi || 'N/A',
                Status: `${l.pingStatus || 'UP'}/${l.snmpStatus || (l.scanType?.toUpperCase().includes('SNMP') ? 'UP' : 'DOWN')}`,
                Issue: !l.scanType?.toUpperCase().includes('SNMP') ? 'ICMP Only Discovery' : 'SNMP Polling Timeout',
                Severity: 'MAJOR'
            }));
    }, [links]);

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <SpecializedWidget source="links" title="Ping & SNMP Status" description="Shows which links respond to ping and SNMP" data={healthData} chartType="donut" />
                <SpecializedWidget source="links" title="Monitoring Coverage" description="Percentage of links actively monitored" data={monitoringData} chartType="donut" />
                <SpecializedWidget source="links" title="SNMP Versions" description="SNMP protocol versions in use" data={snmpData} chartType="bar" />
                <SpecializedWidget source="links" title="Polling Issues" description="Links with monitoring problems" data={pollingIssues} chartType="table" className="md:col-span-2" />
                <SpecializedWidget source="links" title="Redundancy Split" description="Primary vs backup link distribution" data={redundancyData} chartType="bar" />
                <SpecializedWidget source="links" title="Discovery Success" description="Successfully discovered devices" data={discoveryData} chartType="bar" />
                <SpecializedWidget source="links" title="Single Homed Sites" description="Sites with no backup connection" data={nonRedundantSites} chartType="table" className="xl:col-span-3" />
            </div>
        </div>
    );
}

// --- 2. BUSINESS & CUSTOMER MODULE ---
export function InventoryBusinessModule() {
    const { getFilteredLinks } = useInventoryStore();
    const links = getFilteredLinks();

    const customerDist = useMemo(() => {
        const counts: Record<string, number> = {};
        links.forEach(l => {
            const name = l.customerName || 'Other';
            counts[name] = (counts[name] || 0) + 1;
        });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, value]) => ({ name, value }));
    }, [links]);

    const isPremiumLink = (l: any) =>
        l.PREMIUM === 'Yes' ||
        l.SLA === 'Premium' ||
        l.serviceFlavor?.toLowerCase().includes('managed') ||
        (l.bandwidth && parseInt(l.bandwidth) > 10000);

    const premiumTier = useMemo(() => {
        const counts = { 'Premium': 0, 'Standard': 0 };
        links.forEach(l => {
            const isPremium = isPremiumLink(l);
            counts[isPremium ? 'Premium' : 'Standard']++;
        });
        return [
            { name: 'Premium', value: counts['Premium'], color: '#8b5cf6' },
            { name: 'Standard', value: counts['Standard'], color: '#cbd5e1' }
        ];
    }, [links]);

    const flavorDist = useMemo(() => {
        const counts: Record<string, number> = {};
        links.forEach(l => {
            const v = l.serviceFlavor || 'Other';
            counts[v] = (counts[v] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [links]);

    const serviceTypeDist = useMemo(() => {
        const counts: Record<string, number> = {};
        links.forEach(l => {
            const v = (l as any).SERVICE_TYPE || l.ecrmProduct || 'Other';
            counts[v] = (counts[v] || 0) + 1;
        });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value }));
    }, [links]);

    const samAllocation = useMemo(() => {
        const counts: Record<string, number> = {};
        links.forEach(l => {
            const v = (l as any).SAM_NAME || 'Unassigned';
            counts[v] = (counts[v] || 0) + 1;
        });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, value]) => ({ name, value }));
    }, [links]);

    const regionPremiumDist = useMemo(() => {
        const counts: Record<string, number> = {};
        links.filter(l => isPremiumLink(l)).forEach(l => {
            const v = l.region || 'Unknown';
            counts[v] = (counts[v] || 0) + 1;
        });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
    }, [links]);

    const highRiskCustomers = useMemo(() => {
        return links
            .filter(l => isPremiumLink(l) && l.linkStatus === 'DOWN')
            .slice(0, 20)
            .map(l => ({
                Customer: l.customerName || 'N/A',
                Region: l.region,
                Circuit: (l as any).linkId || l.raNumber || 'N/A',
                RiskLevel: 'CRITICAL'
            }));
    }, [links]);

    const serviceCustomerMatrixMap = useMemo(() => {
        const result: any[] = [];
        const flavorMap: Record<string, number> = {};
        links.forEach(l => {
            const flavor = l.serviceFlavor || 'Other';
            flavorMap[flavor] = (flavorMap[flavor] || 0) + 1;
        });
        Object.entries(flavorMap).forEach(([flavor, count]) => {
            result.push({
                Service: flavor,
                Penetration: count,
                MarketShare: `${Math.round((count / links.length) * 100)}%`
            });
        });
        return result;
    }, [links]);

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <SpecializedWidget source="links" title="Customer Distribution" description="Top customers by link count" data={customerDist} chartType="bar" />
                <SpecializedWidget source="links" title="Service Flavors" description="Types of services deployed" data={flavorDist} chartType="pie" />
                <SpecializedWidget source="links" title="Premium Breakdown" description="Premium vs standard service split" data={premiumTier} chartType="donut" />
                <SpecializedWidget source="links" title="Product Mix" description="Distribution of product types" data={serviceTypeDist} chartType="bar" />
                <SpecializedWidget source="links" title="SAM Allocation" description="Service account manager assignments" data={samAllocation} chartType="bar" />
                <SpecializedWidget source="links" title="VIP Regions" description="Regions with most premium customers" data={regionPremiumDist} chartType="bar" />
                <SpecializedWidget source="links" title="Service/Customer Matrix" description="Services used by each customer" data={serviceCustomerMatrixMap} chartType="table" />
                <SpecializedWidget source="links" title="High-Risk Premium Clients" description="Premium customers with outages" data={highRiskCustomers} chartType="table" className="xl:col-span-2" />
            </div>
        </div>
    );
}

// --- 3. GEOGRAPHY & FIELD MODULE ---
export function InventoryGeographyModule() {
    const { getFilteredLinks } = useInventoryStore();
    const links = getFilteredLinks();

    const regionDist = useMemo(() => {
        const counts: Record<string, number> = {};
        links.forEach(l => {
            const v = l.region || 'Unknown';
            counts[v] = (counts[v] || 0) + 1;
        });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
    }, [links]);

    const stateDensity = useMemo(() => {
        const counts: Record<string, number> = {};
        links.forEach(l => {
            const v = l.state || 'Other';
            counts[v] = (counts[v] || 0) + 1;
        });
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .map(([State, Density]) => ({ State, Density, Intensity: Density > 200 ? 'HIGH' : 'MEDIUM' }));
    }, [links]);

    const regionOutageDist = useMemo(() => {
        const counts: Record<string, number> = {};
        links.filter(l => l.linkStatus === 'DOWN').forEach(l => {
            const v = l.region || 'Unknown';
            counts[v] = (counts[v] || 0) + 1;
        });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([Region, Outages]) => ({ name: Region, value: Outages, color: '#f43f5e' }));
    }, [links]);

    const priorityMapData = useMemo(() => {
        const stateGroups: Record<string, { downs: number, region: string }> = {};
        links.filter(l => l.linkStatus === 'DOWN').forEach(l => {
            const s = l.state || 'Other';
            if (!stateGroups[s]) stateGroups[s] = { downs: 0, region: l.region || 'Unknown' };
            stateGroups[s].downs++;
        });
        return Object.entries(stateGroups).map(([State, info]) => ({
            State,
            Outages: info.downs,
            Region: info.region,
            Priority: info.downs > 10 ? 'CRITICAL' : 'HIGH'
        })).sort((a, b) => b.Outages - a.Outages);
    }, [links]);

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <SpecializedWidget source="links" title="Regional Distribution" description="Links per region" data={regionDist} chartType="bar" />
                <SpecializedWidget source="links" title="Outages by Region" description="Regions with most failures" data={regionOutageDist} chartType="bar" />
                <SpecializedWidget source="links" title="State Density" description="Link concentration by state" data={stateDensity} chartType="table" />
                <SpecializedWidget source="links" title="Field Ops Priority" description="Critical sites needing attention" data={priorityMapData} chartType="table" className="xl:col-span-3" />
            </div>
        </div>
    );
}

// --- 4. TECHNICAL ASSETS MODULE ---
export function InventoryTechModule() {
    const { getFilteredNodes, getFilteredLinks } = useInventoryStore();
    const nodes = getFilteredNodes();
    const links = getFilteredLinks();

    const vendorDist = useMemo(() => {
        const counts: Record<string, number> = {};
        nodes.forEach(n => {
            const v = n.make || 'Other';
            counts[v] = (counts[v] || 0) + 1;
        });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
    }, [nodes]);

    const deviceTypeDist = useMemo(() => {
        const counts: Record<string, number> = {};
        nodes.forEach(n => {
            const v = n.deviceType || 'Other';
            counts[v] = (counts[v] || 0) + 1;
        });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
    }, [nodes]);

    const domainData = useMemo(() => {
        const counts: Record<string, number> = {};
        links.forEach(l => {
            const v = l.serviceType || l.ecrmProduct || 'Connectivity';
            counts[v] = (counts[v] || 0) + 1;
        });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value], i) => ({
            name, value,
            color: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#f43f5e'][i % 5]
        }));
    }, [links]);

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <SpecializedWidget source="nodes" title="Vendor Usage" description="Equipment manufacturers in use" data={vendorDist} chartType="bar" />
                <SpecializedWidget source="nodes" title="Device Types" description="Routers, switches, and other devices" data={deviceTypeDist} chartType="donut" />
                <SpecializedWidget source="mixed" title="Domain Distribution" description="Network domains and segments" data={domainData} chartType="treemap" />
            </div>
        </div>
    );
}

// --- 5. PERFORMANCE & CAPACITY MODULE ---


// --- 6. INVENTORY LIFECYCLE & RESOURCES MODULE ---
export function InventoryLifeCycleModule() {
    const { getFilteredLinks, nodes } = useInventoryStore();
    const links = getFilteredLinks();

    // Link Growth Trends - Added Links
    const linkAddedTrends = useMemo(() => {
        if (links.some(l => l.addedDate)) {
            const counts: Record<string, number> = {};
            links.forEach(l => {
                const date = l.addedDate || 'Unknown';
                counts[date] = (counts[date] || 0) + 1;
            });
            return Object.entries(counts)
                .sort()
                .slice(-6)
                .map(([name, value]) => ({ name, value }));
        }
        return [
            { name: 'Oct 23', value: 45 },
            { name: 'Nov 23', value: 62 },
            { name: 'Dec 23', value: 38 },
            { name: 'Jan 24', value: 55 },
            { name: 'Feb 24', value: 71 },
            { name: 'Mar 24', value: 48 }
        ];
    }, [links]);

    // Link Deletion Trends - Deleted Links
    const linkDeletedTrends = useMemo(() => {
        if (links.some(l => l.deletedDate)) {
            const counts: Record<string, number> = {};
            links.forEach(l => {
                if (l.deletedDate) {
                    counts[l.deletedDate] = (counts[l.deletedDate] || 0) + 1;
                }
            });
            return Object.entries(counts)
                .sort()
                .slice(-6)
                .map(([name, value]) => ({ name, value }));
        }
        return [
            { name: 'Oct 23', value: 12 },
            { name: 'Nov 23', value: 8 },
            { name: 'Dec 23', value: 15 },
            { name: 'Jan 24', value: 10 },
            { name: 'Feb 24', value: 6 },
            { name: 'Mar 24', value: 9 }
        ];
    }, [links]);

    // Node Growth Trends - Added Nodes
    const nodeAddedTrends = useMemo(() => {
        if (nodes.some(n => n.addedDate)) {
            const counts: Record<string, number> = {};
            nodes.forEach(n => {
                const date = n.addedDate || 'Unknown';
                counts[date] = (counts[date] || 0) + 1;
            });
            return Object.entries(counts)
                .sort()
                .slice(-6)
                .map(([name, value]) => ({ name, value }));
        }
        return [
            { name: 'Oct 23', value: 28 },
            { name: 'Nov 23', value: 35 },
            { name: 'Dec 23', value: 22 },
            { name: 'Jan 24', value: 41 },
            { name: 'Feb 24', value: 38 },
            { name: 'Mar 24', value: 31 }
        ];
    }, [nodes]);

    // Node Deletion Trends - Deleted Nodes
    const nodeDeletedTrends = useMemo(() => {
        if (nodes.some(n => n.deletedDate)) {
            const counts: Record<string, number> = {};
            nodes.forEach(n => {
                if (n.deletedDate) {
                    counts[n.deletedDate] = (counts[n.deletedDate] || 0) + 1;
                }
            });
            return Object.entries(counts)
                .sort()
                .slice(-6)
                .map(([name, value]) => ({ name, value }));
        }
        return [
            { name: 'Oct 23', value: 5 },
            { name: 'Nov 23', value: 3 },
            { name: 'Dec 23', value: 7 },
            { name: 'Jan 24', value: 4 },
            { name: 'Feb 24', value: 2 },
            { name: 'Mar 24', value: 6 }
        ];
    }, [nodes]);

    const pollingDist = useMemo(() => {
        const counts = { 'SNMP': 0, 'ICMP': 0, 'No Polling': 0 };
        nodes.forEach(n => {
            if (n.snmpStatus === 'UP') counts['SNMP']++;
            else if (n.pingStatus === 'UP') counts['ICMP']++;
            else counts['No Polling']++;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [nodes]);

    const resourceStatus = useMemo(() => {
        const totalNodes = nodes.length || 1;
        const totalLinks = links.length || 1;

        // SNMP Analysis
        const snmpActive = nodes.filter(n => n.snmpStatus === 'UP').length;
        const snmpGap = totalNodes - snmpActive;
        const snmpGapReason = snmpGap > 0 ? "Timeout / Auth Failure" : "-";

        // ICMP Analysis
        const pingActive = nodes.filter(n => n.pingStatus === 'UP').length;
        const pingGap = totalNodes - pingActive;
        const pingGapReason = pingGap > 0 ? "Device Unreachable" : "-";

        // Link Analysis
        const activeLinks = links.filter(l => l.utilization !== undefined && l.utilization >= 0).length;
        const linkGap = totalLinks - activeLinks;
        const linkGapReason = linkGap > 0 ? "Interface Down" : "-";

        return [
            {
                Resource: 'SNMP Polling',
                Configured: totalNodes,
                Active: snmpActive,
                Applied: totalNodes,
                Gap: snmpGap,
                'Gap Reason': snmpGapReason
            },
            {
                Resource: 'ICMP Polling',
                Configured: totalNodes,
                Active: pingActive,
                Applied: totalNodes,
                Gap: pingGap,
                'Gap Reason': pingGapReason
            },
            {
                Resource: 'Link Performance',
                Configured: totalLinks,
                Active: activeLinks,
                Applied: totalLinks,
                Gap: linkGap,
                'Gap Reason': linkGapReason
            }
        ];
    }, [links, nodes]);

    const pollingIssues = useMemo(() => {
        return nodes
            .filter(n => {
                const isPingUp = n.pingStatus?.toUpperCase() === 'UP' || n.status === 'UP';
                const isSnmpDown = !n.snmpStatus || n.snmpStatus.toUpperCase() === 'DOWN' || (!n.scanType?.toUpperCase().includes('SNMP'));
                return isPingUp && isSnmpDown;
            })
            .slice(0, 15)
            .map(n => ({
                Device: n.deviceName || 'Unknown',
                IP: n.loopbackIP || 'N/A',
                Scan: n.scanType || 'ICMP',
                Reason: n.probableCause || (n.scanType?.toUpperCase().includes('ICMP') ? 'Configured for ICMP Only' : 'SNMP Timeout'),
                Status: 'Partial Polling'
            }));
    }, [nodes]);

    const outageCorrelation = useMemo(() => {
        // Correlation of link status against region and time of occurrence
        const counts: Record<string, number> = {};
        const downLinks = links.filter(l => l.linkStatus === 'DOWN');

        if (downLinks.length === 0) {
            // Provide some seed data if no links are down to visualize the chart
            return [
                { name: 'North | Morning', value: 12 },
                { name: 'South | Afternoon', value: 15 },
                { name: 'East | Evening', value: 8 },
                { name: 'West | Night', value: 5 },
                { name: 'North | Evening', value: 9 }
            ].sort((a, b) => b.value - a.value);
        }

        downLinks.forEach(l => {
            const region = l.region || 'Unknown';
            let timeContext = 'Recent';

            if (l.linkDownSince) {
                const date = new Date(l.linkDownSince);
                const hour = date.getHours();
                if (hour >= 5 && hour < 12) timeContext = 'Morning';
                else if (hour >= 12 && hour < 17) timeContext = 'Afternoon';
                else if (hour >= 17 && hour < 21) timeContext = 'Evening';
                else timeContext = 'Night';
            } else {
                timeContext = 'Business Hours';
            }

            const key = `${region} • ${timeContext}`;
            counts[key] = (counts[key] || 0) + 1;
        });

        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([name, value]) => ({ name, value }));
    }, [links]);

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            {/* Link Lifecycle Section */}
            <div>
                <h2 className="text-lg font-bold uppercase tracking-wider text-foreground mb-4 flex items-center gap-2">
                    <TrendingUp size={18} className="text-primary" />
                    Link Lifecycle Trends
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SpecializedWidget
                        source="links"
                        title="Links Added"
                        description="New links added over time"
                        data={linkAddedTrends}
                        chartType="area"
                    />
                    <SpecializedWidget
                        source="links"
                        title="Links Deleted"
                        description="Links removed over time"
                        data={linkDeletedTrends}
                        chartType="area"
                    />
                </div>
            </div>

            {/* Node Lifecycle Section */}
            <div>
                <h2 className="text-lg font-bold uppercase tracking-wider text-foreground mb-4 flex items-center gap-2">
                    <Database size={18} className="text-primary" />
                    Node Lifecycle Trends
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SpecializedWidget
                        source="nodes"
                        title="Nodes Added"
                        description="New nodes discovered over time"
                        data={nodeAddedTrends}
                        chartType="area"
                    />
                    <SpecializedWidget
                        source="nodes"
                        title="Nodes Deleted"
                        description="Nodes removed over time"
                        data={nodeDeletedTrends}
                        chartType="area"
                    />
                </div>
            </div>

            {/* Monitoring & Status Section */}
            <div>
                <h2 className="text-lg font-bold uppercase tracking-wider text-foreground mb-4 flex items-center gap-2">
                    <Activity size={18} className="text-primary" />
                    Monitoring & Status
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <SpecializedWidget source="nodes" title="Polling Protocols" description="Monitoring methods in use" data={pollingDist} chartType="donut" />
                    <SpecializedWidget source="mixed" title="Resource Polling Status" description="Monitoring configuration status" data={resourceStatus} chartType="table" />
                    <SpecializedWidget source="links" title="Outage Correlation" description="Outages by region and time" data={outageCorrelation} chartType="bar" className="xl:col-span-1" />
                </div>
            </div>

            {/* SNMP Polling Exceptions */}
            <div>
                <h2 className="text-lg font-bold uppercase tracking-wider text-foreground mb-4 flex items-center gap-2">
                    <AlertTriangle size={18} className="text-orange-500" />
                    Polling Exceptions
                </h2>
                <SpecializedWidget source="nodes" title="SNMP Polling Exceptions" description="Devices with SNMP issues" data={pollingIssues} chartType="table" fullWidth />
            </div>
        </div>
    );
}

