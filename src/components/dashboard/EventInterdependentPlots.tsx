import React, { useMemo, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
    PieChart, Pie, Legend
} from 'recharts';
import { Download, Filter, RefreshCw, X, Maximize2 } from 'lucide-react';
import { exportToCSV } from '@/utils/exportUtils';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// --- Types (Enriched based on Reference) ---
interface EventRecord {
    id: string; // Event ID
    severity: 'Critical' | 'Major' | 'Minor' | 'Warning' | 'Indeterminate';
    issueType: 'Link Down' | 'Node Down' | 'Interface Down'; // Issue
    rootCause: string;
    subReason: string;
    date: string; // First Event Time
    node: string;
    ipAddress: string;
    linkIpAddress: string;
    resource: string;
    vendor: 'Cisco' | 'Huawei' | 'Juniper' | 'Nokia'; // Make
    srNumber: string | 'Not Available';
    suppressionStatus: 'Yes' | 'No';
    srStatus: 'Open' | 'Closed' | 'Pending';
    customer: string;
    location: string;
    deviceType: 'Router' | 'Switch' | 'Firewall' | 'Server';
    region: 'North' | 'South' | 'East' | 'West';
}

// --- Mock Data Generator ---
const GENERATE_MOCK_DATA = (): EventRecord[] => {
    const records: EventRecord[] = [];
    const vendors = ['Cisco', 'Huawei', 'Juniper', 'Nokia'] as const;
    const regions = ['North', 'South', 'East', 'West'] as const;
    const severities = ['Critical', 'Major', 'Minor', 'Warning'] as const;
    const locations = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune'];
    const srStatuses = ['Open', 'Closed', 'Pending'] as const;
    const deviceTypes = ['Router', 'Switch', 'Firewall'] as const;

    // Helper to generate random IP
    const randIP = () => `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;

    const addRecords = (count: number, category: string, subReasons: string[], issueType: 'Link Down' | 'Node Down' | 'Interface Down') => {
        for (let i = 0; i < count; i++) {
            const region = regions[Math.floor(Math.random() * regions.length)];
            const idNum = 100000 + records.length;
            records.push({
                id: `EVT-${idNum}`,
                severity: severities[Math.floor(Math.random() * severities.length)],
                issueType: issueType,
                rootCause: category,
                subReason: subReasons[Math.floor(Math.random() * subReasons.length)],
                date: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toLocaleString(),
                node: `NODE-${region.substring(0, 2).toUpperCase()}-${Math.floor(Math.random() * 999)}`,
                ipAddress: randIP(),
                linkIpAddress: randIP(),
                resource: `Gi0/${Math.floor(Math.random() * 48)}`,
                vendor: vendors[Math.floor(Math.random() * vendors.length)],
                srNumber: Math.random() > 0.5 ? `SR-${Math.floor(Math.random() * 999999)}` : 'Not Available',
                suppressionStatus: Math.random() > 0.8 ? 'Yes' : 'No',
                srStatus: srStatuses[Math.floor(Math.random() * srStatuses.length)],
                customer: `Customer_${Math.floor(Math.random() * 50)}`,
                location: locations[Math.floor(Math.random() * locations.length)],
                deviceType: deviceTypes[Math.floor(Math.random() * deviceTypes.length)],
                region: region,
            });
        }
    };

    // 1. Reachability Issue (90)
    addRecords(90, 'Reachability Issue', ['Ping Failure', 'SNMP Timeout', 'Device Not Responding'], 'Link Down');
    // 2. Device Unreachable (50)
    addRecords(50, 'Device Unreachable', ['CPE Power Loss', 'Router Down', 'Hardware Fault', 'OS Crash'], 'Node Down');
    // 3. Interface Operational Down (40)
    addRecords(40, 'Interface Operational Down', ['Port Admin Down', 'Cable Disconnected', 'SFP Fault', 'CRC Errors'], 'Interface Down');
    // 4. Routing / Protocol Failure (70)
    addRecords(70, 'Routing / Protocol Failure', ['BGP Peer Down', 'OSPF Adjacency Loss', 'Route Withdrawal', 'BGP Flap'], 'Link Down');
    // 5. Provider End Unreachable (55)
    addRecords(55, 'Provider End Unreachable', ['Provider Edge Down', 'Gateway Unreachable', 'Upstream Loss'], 'Link Down');
    // 6. Physical / Last-Mile Failure (60)
    addRecords(60, 'Physical / Last-Mile Failure', ['Fiber Cut', 'Optical Signal Loss', 'Link Flap', 'Wavelength Drift'], 'Link Down');

    return records.sort(() => Math.random() - 0.5);
};

const MOCK_DATA = GENERATE_MOCK_DATA();

// --- Colors ---
const COLORS = {
    primary: '#0ea5e9',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    slate: '#64748b'
};

const PIE_COLORS = [COLORS.primary, COLORS.secondary, COLORS.success, COLORS.warning, COLORS.danger, COLORS.slate];

export function EventInterdependentPlots() {
    const [filters, setFilters] = useState<Partial<EventRecord>>({});
    const [expandedChartField, setExpandedChartField] = useState<string | null>(null);

    // --- Filter Logic ---
    const filteredData = useMemo(() => {
        return MOCK_DATA.filter(item => {
            return Object.entries(filters).every(([key, value]) => {
                return item[key as keyof EventRecord] === value;
            });
        });
    }, [filters]);

    // Handle Interdependent Filter ONLY (Export removed from here)
    const handleInteraction = (key: keyof EventRecord, value: string) => {
        console.log("Filtering by:", key, value);
        setFilters(prev => {
            if (prev[key] === value) {
                const { [key]: _, ...rest } = prev;
                return rest; // Toggle off
            }
            return { ...prev, [key]: value };
        });
    };

    const clearFilters = () => setFilters({});

    // --- Aggregation Helper ---
    const aggregate = (key: keyof EventRecord) => {
        const counts: Record<string, number> = {};
        filteredData.forEach(item => {
            const val = item[key];
            counts[val] = (counts[val] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    };

    // --- Derived Datasets ---
    const rootCauseData = aggregate('rootCause');

    const deviceTypeData = aggregate('deviceType').filter(d => d.name !== 'Server');
    const makeData = aggregate('vendor');
    const regionData = aggregate('region');

    // Handle Single Slice Export
    const handleSingleExport = (key: keyof EventRecord, value: string) => {
        const subsetToExport = filteredData.filter(item => item[key] === value);
        if (subsetToExport.length > 0) {
            exportToCSV(subsetToExport, `Events_${value.replace(/[^a-z0-9]/gi, '_')}_${new Date().getTime()}`);
        } else {
            console.warn("No items found to export for", key, value);
        }
    };

    // Custom Label with Download Icon
    const CustomBarLabel = (props: any) => {
        const { x, y, width, height, value, payload, field } = props;
        return (
            <g transform={`translate(${x + width + 5},${y + height / 2 - 7})`}>
                <text x={0} y={10} fill="#64748b" fontSize="9" fontWeight="bold">{value}</text>
                <foreignObject x={25} y={-2} width={16} height={16}>
                    <div
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        title="Download CSV"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleSingleExport(field, payload.name);
                        }}
                    >
                        <Download size={12} className="text-muted-foreground hover:text-primary transition-colors" />
                    </div>
                </foreignObject>
            </g>
        );
    };

    // Custom Interactive Legend for Pie Charts
    const CustomPieLegend = ({ data, field }: any) => {
        return (
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2 px-2 overflow-y-auto max-h-[100px] scrollbar-hide">
                {data.map((entry: any, index: number) => {
                    const isActive = filters[field as keyof EventRecord] === entry.name;
                    const isFiltered = Object.keys(filters).includes(field) && !isActive;

                    return (
                        <div
                            key={index}
                            className={cn(
                                "flex items-center justify-between p-1.5 rounded-md text-[10px] cursor-pointer transition-all border border-transparent",
                                isActive ? "bg-primary/10 border-primary/20 text-primary font-bold" : "hover:bg-muted text-muted-foreground",
                                isFiltered ? "opacity-40 grayscale" : "opacity-100"
                            )}
                            onClick={(e) => { e.stopPropagation(); handleInteraction(field, entry.name); }}
                        >
                            <div className="flex items-center gap-1.5 min-w-0">
                                <div
                                    className="w-2 h-2 rounded-full shrink-0"
                                    style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                                />
                                <span className="truncate">{entry.name}</span>
                            </div>
                            <div className="flex items-center gap-2 pl-2">
                                <span className="font-mono font-bold">{entry.value}</span>
                                <div
                                    role="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSingleExport(field, entry.name);
                                    }}
                                    className="p-1 hover:bg-background rounded-full hover:text-foreground transition-colors"
                                    title="Export this slice"
                                >
                                    <Download size={10} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    // --- Chart Components ---
    const ChartCard = ({ title, data, field, type = 'bar', layout = 'vertical', color = COLORS.primary, width = '100%', yAxisWidth = 100, limit }: any) => {
        const isTruncated = limit && data.length > limit;
        const displayData = isTruncated ? data.slice(0, limit) : data;

        return (
            <div className={cn(
                "rounded-xl border border-border/50 bg-card p-4 shadow-sm flex flex-col transition-all duration-300",
                Object.keys(filters).includes(field) ? "ring-2 ring-primary/50 bg-primary/5" : "hover:border-primary/30"
            )}>
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground truncate pr-2" title={title}>{title}</h4>
                    <div className="flex gap-1 shrink-0">
                        {filters[field as keyof EventRecord] && (
                            <button onClick={(e) => { e.stopPropagation(); handleInteraction(field, filters[field]!); }} className="p-1 hover:bg-destructive/10 text-destructive rounded transform hover:scale-110 transition-all">
                                <X size={10} />
                            </button>
                        )}
                        {/* Expand Button */}
                        {isTruncated && (
                            <button
                                onClick={(e) => { e.stopPropagation(); setExpandedChartField(field); }}
                                className="p-1 hover:bg-muted text-muted-foreground rounded transform hover:scale-110 transition-all"
                                title="Maximize Chart"
                            >
                                <Maximize2 size={10} />
                            </button>
                        )}
                        {/* Main Export for All Data in Chart */}
                        <button
                            onClick={(e) => { e.stopPropagation(); exportToCSV(data, `Event_Analysis_${field}_Summary`); }}
                            className="p-1 hover:bg-muted text-muted-foreground rounded transform hover:scale-110 transition-all"
                            title="Download Summary"
                        >
                            <Download size={10} />
                        </button>
                    </div>
                </div>
                {/* Chart Area */}
                <div className={cn("w-full transition-all", type === 'pie' ? "h-[160px]" : "h-[300px]")}>
                    <ResponsiveContainer width={width} height="100%">
                        {type === 'pie' ? (
                            <PieChart>
                                <Pie
                                    data={displayData}
                                    innerRadius={50} // Slightly reduced to fit better
                                    outerRadius={70}
                                    paddingAngle={2}
                                    dataKey="value"
                                    cursor="pointer"
                                    onClick={(entry: any) => handleInteraction(field, entry.name || entry.payload?.name)}
                                >
                                    {displayData.map((entry: any, index: number) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={filters[field] === entry.name ? '#000' : PIE_COLORS[index % PIE_COLORS.length]}
                                            opacity={filters[field] && filters[field] !== entry.name ? 0.3 : 1}
                                            stroke={filters[field] === entry.name ? COLORS.primary : 'none'}
                                            strokeWidth={2}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                            </PieChart>
                        ) : (
                            <BarChart data={displayData} layout={layout} margin={{ top: 5, right: 30, left: 10, bottom: layout === 'horizontal' ? 80 : 20 }} barCategoryGap={layout === 'vertical' ? 20 : 10}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={layout === 'horizontal'} vertical={layout === 'vertical'} stroke="#E5E7EB" opacity={0.5} />
                                {layout === 'vertical' ? (
                                    <>
                                        <XAxis type="number" domain={[0, 'auto']} tick={{ fontSize: 8 }} />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            width={yAxisWidth}
                                            tick={{ fontSize: 9, fill: '#64748b', fontWeight: 600 }}
                                            axisLine={false}
                                            tickLine={false}
                                            interval={0}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <XAxis
                                            dataKey="name"
                                            type="category"
                                            height={80}
                                            tick={{ fontSize: 8, fill: '#64748b', fontWeight: 600, angle: -45, textAnchor: 'end', dy: 10 } as any}
                                            axisLine={false}
                                            tickLine={false}
                                            interval={0}
                                        />
                                        <YAxis type="number" domain={[0, 'auto']} tick={{ fontSize: 8 }} />
                                    </>
                                )}
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                                />
                                <Bar
                                    dataKey="value"
                                    barSize={layout === 'vertical' ? 24 : undefined}
                                    radius={layout === 'vertical' ? [0, 4, 4, 0] : [4, 4, 0, 0]}
                                    onClick={(entry: any) => handleInteraction(field, entry.name || entry.payload?.name)}
                                    cursor="pointer"
                                    label={layout === 'vertical' ? (props) => <CustomBarLabel {...props} field={field} /> : undefined}
                                >
                                    {displayData.map((entry: any, index: number) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={Object.keys(filters).includes(field) && filters[field] !== entry.name ? '#e2e8f0' : color}
                                            fillOpacity={1}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        )}
                    </ResponsiveContainer>
                </div>

                {/* Custom Pie Legend */}
                {type === 'pie' && (
                    <CustomPieLegend data={displayData} field={field} />
                )}

                {/* Footer Total */}
                {type !== 'pie' && (
                    <div className="mt-3 flex justify-between items-center text-[9px] text-muted-foreground font-medium border-t border-border/30 pt-2">
                        <div className="flex items-center gap-2">
                            <span>TOTAL: {data.reduce((a: number, b: any) => a + b.value, 0)}</span>
                            {isTruncated && (
                                <span className="text-primary cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); setExpandedChartField(field); }}>
                                    (Top {limit} shown)
                                </span>
                            )}
                        </div>
                        <span className="text-primary/70 uppercase">{filters[field] ? 'Filtered' : 'All Events'}</span>
                    </div>
                )}
            </div>
        );
    };

    // Debug Mount
    React.useEffect(() => {
        console.log("EventInterdependentPlots v4 (Modal Supported) Mounted");
    }, []);

    // Get Data and Logic for Expanded View
    const getExpandedChartData = () => {
        if (!expandedChartField) return null;
        switch (expandedChartField) {
            case 'rootCause': return { data: rootCauseData, title: 'Down Count vs Issues', color: COLORS.primary };

            case 'deviceType': return { data: deviceTypeData, title: 'Device Type', color: COLORS.success, type: 'pie' };
            case 'vendor': return { data: makeData, title: 'Vendor / Make', color: COLORS.warning };
            case 'region': return { data: regionData, title: 'Region', color: COLORS.slate };
            default: return null;
        }
    };
    const expandedData = getExpandedChartData();

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-primary" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                        Event Root Cause Analysis
                    </h3>
                </div>
                {Object.keys(filters).length > 0 && (
                    <button
                        onClick={clearFilters}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-destructive/10 text-destructive text-[10px] font-bold uppercase hover:bg-destructive/20 transition-all"
                    >
                        <RefreshCw size={10} /> Clear Filters ({Object.keys(filters).length})
                    </button>
                )}
            </div>

            {/* Grid Layout - 3 Plots Per Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* 1. Down Count vs Issues */}
                <ChartCard
                    title="Down Count vs Issues"
                    data={rootCauseData}
                    field="rootCause"
                    layout="horizontal"
                    color={COLORS.primary}
                    yAxisWidth={110}
                />



                {/* 3. Device Type */}
                <ChartCard
                    title="Device Type"
                    data={deviceTypeData}
                    field="deviceType"
                    type="pie"
                    color={COLORS.secondary}
                />

                {/* 4. Vendor */}
                <ChartCard
                    title="Vendor / Make"
                    data={makeData}
                    field="vendor"
                    color={COLORS.warning}
                    yAxisWidth={80}
                />

                {/* 5. Region */}
                <ChartCard
                    title="Region"
                    data={regionData}
                    field="region"
                    color={COLORS.slate}
                    yAxisWidth={80}
                />

            </div>

            <div className="text-[10px] text-muted-foreground text-right italic px-1">
                * Click on charts to filter. Click the download icon next to bars to export specific data.
            </div>

            {/* Expanded Chart Modal */}
            <Dialog open={!!expandedChartField} onOpenChange={(o) => !o && setExpandedChartField(null)}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{expandedData?.title || 'Chart Details'}</DialogTitle>
                    </DialogHeader>
                    {expandedData && (
                        <div className="h-[500px] w-full mt-4">
                            {expandedData.type === 'pie' ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={expandedData.data}
                                            innerRadius={80}
                                            outerRadius={120}
                                            paddingAngle={2}
                                            dataKey="value"
                                            cursor="pointer"
                                            onClick={(entry: any) => {
                                                handleInteraction(expandedChartField as keyof EventRecord, entry.name);
                                                setExpandedChartField(null); // Close on selection to show filtered state
                                            }}
                                            label
                                        >
                                            {expandedData.data.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={expandedData.data}
                                        layout="vertical"
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                        barCategoryGap={10}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke="#E5E7EB" opacity={0.5} />
                                        <XAxis type="number" />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            width={180}
                                            tick={{ fontSize: 11, fontWeight: 600 }}
                                        />
                                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px' }} />
                                        <Bar
                                            dataKey="value"
                                            barSize={30}
                                            radius={[0, 4, 4, 0]}
                                            onClick={(entry: any) => {
                                                handleInteraction(expandedChartField as keyof EventRecord, entry.name);
                                                setExpandedChartField(null);
                                            }}
                                            cursor="pointer"
                                        >
                                            {expandedData.data.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={expandedData.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
