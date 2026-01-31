import React, { useMemo, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
    PieChart, Pie, Legend
} from 'recharts';
import { Download, Filter, RefreshCw, X } from 'lucide-react';
import { exportToCSV } from '@/utils/exportUtils';
import { cn } from '@/lib/utils';

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
    const deviceTypes = ['Router', 'Switch', 'Firewall', 'Server'] as const;

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
    const subReasonData = aggregate('subReason');
    const deviceTypeData = aggregate('deviceType');
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
                    <div xmlns="http://www.w3.org/1999/xhtml"
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
    const ChartCard = ({ title, data, field, type = 'bar', color = COLORS.primary, width = '100%', yAxisWidth = 100 }: any) => (
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
            <div className={cn("w-full transition-all", type === 'pie' ? "h-[160px]" : "h-[250px]")}>
                <ResponsiveContainer width={width} height="100%">
                    {type === 'pie' ? (
                        <PieChart>
                            <Pie
                                data={data}
                                innerRadius={50} // Slightly reduced to fit better
                                outerRadius={70}
                                paddingAngle={2}
                                dataKey="value"
                                cursor="pointer"
                                onClick={(entry: any) => handleInteraction(field, entry.name || entry.payload?.name)}
                            >
                                {data.map((entry: any, index: number) => (
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
                        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 45, left: 0, bottom: 5 }} barCategoryGap={20}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" opacity={0.5} />
                            <XAxis type="number" domain={[0, 'auto']} tick={{ fontSize: 9 }} />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={yAxisWidth}
                                tick={{ fontSize: 9, fill: '#64748b', fontWeight: 600 }}
                                axisLine={false}
                                tickLine={false}
                                interval={0}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: '8px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <Bar
                                dataKey="value"
                                barSize={24}
                                radius={[0, 4, 4, 0]}
                                onClick={(entry: any) => handleInteraction(field, entry.name || entry.payload?.name)}
                                cursor="pointer"
                                label={(props) => <CustomBarLabel {...props} field={field} />}
                            >
                                {data.map((entry: any, index: number) => (
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
                <CustomPieLegend data={data} field={field} />
            )}

            {/* Footer Total */}
            {type !== 'pie' && (
                <div className="mt-3 flex justify-between items-center text-[9px] text-muted-foreground font-medium border-t border-border/30 pt-2">
                    <span>TOTAL: {data.reduce((a: number, b: any) => a + b.value, 0)}</span>
                    <span className="text-primary/70 uppercase">{filters[field] ? 'Filtered' : 'All Events'}</span>
                </div>
            )}
        </div>
    );

    // Debug Mount
    React.useEffect(() => {
        console.log("EventInterdependentPlots v3 (Custom Labels) Mounted");
    }, []);

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
                    color={COLORS.primary}
                    yAxisWidth={110}
                />

                {/* 2. Specific Failure Mode */}
                <ChartCard
                    title="Specific Failure Mode"
                    data={subReasonData}
                    field="subReason"
                    color={COLORS.secondary}
                    yAxisWidth={140}
                />

                {/* 3. Device Type */}
                <ChartCard
                    title="Device Type"
                    data={deviceTypeData}
                    field="deviceType"
                    type="pie"
                    color={COLORS.success}
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
        </div>
    );
}
