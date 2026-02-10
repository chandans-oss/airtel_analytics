import React, { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area,
    Sankey,
    Rectangle,
    Layer
} from 'recharts';
import { useInventoryStore } from '@/store/inventoryStore';

const COLORS = {
    primary: 'hsl(174, 72%, 45%)',
    secondary: 'hsl(210, 100%, 55%)',
    warning: 'hsl(38, 92%, 50%)',
    danger: 'hsl(12, 85%, 55%)',
    success: 'hsl(160, 84%, 39%)',
    neutral: 'hsl(215, 15%, 65%)',
};

// --- 10. Line Chart: Trends over time ---
export function EventsTrendLineChart({ data, timeRange = '24H' }: { data: any[], timeRange?: string }) {
    const trendData = useMemo(() => {
        const result = [];
        const now = new Date();

        let intervals = 24;
        let stepMs = 60 * 60 * 1000; // 1 hour
        let format = (d: Date) => `${d.getHours().toString().padStart(2, '0')}:00`;

        if (timeRange === '3H') {
            intervals = 12; // 15 min intervals
            stepMs = 15 * 60 * 1000;
            format = (d: Date) => `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
        } else if (timeRange === '7D') {
            intervals = 7;
            stepMs = 24 * 60 * 60 * 1000;
            format = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }

        for (let i = intervals - 1; i >= 0; i--) {
            const startOfInterval = new Date(now.getTime() - (i + 1) * stepMs);
            const endOfInterval = new Date(now.getTime() - i * stepMs);

            const bucketEvents = data.filter(e => {
                if (!e.startTime) return false;
                const d = new Date(e.startTime);
                return d >= startOfInterval && d < endOfInterval;
            });

            result.push({
                time: format(endOfInterval),
                Events: bucketEvents.length,
            });
        }

        return result;
    }, [data, timeRange]);

    return (
        <div className="w-full h-[300px] bg-card/50 rounded-xl border border-border/50 p-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Event Trends ({timeRange === '24H' ? 'Last 24h' : timeRange})</h3>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} minTickGap={30} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                        itemStyle={{ fontSize: '11px' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="Events" stroke={COLORS.primary} strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

// --- 11. Stacked Area Chart: Trends + Composition ---
export function SeverityAreaChart({ data, timeRange = '24H' }: { data: any[], timeRange?: string }) {
    const areaData = useMemo(() => {
        const result = [];
        const now = new Date();

        let intervals = 12;
        let stepMs = 2 * 60 * 60 * 1000; // 2 hour intervals for 24h
        let format = (d: Date) => `${d.getHours().toString().padStart(2, '0')}:00`;

        if (timeRange === '3H') {
            intervals = 12; // 15 min intervals
            stepMs = 15 * 60 * 1000;
            format = (d: Date) => `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
        } else if (timeRange === '7D') {
            intervals = 7;
            stepMs = 24 * 60 * 60 * 1000;
            format = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }

        for (let i = intervals - 1; i >= 0; i--) {
            const startOfInterval = new Date(now.getTime() - (i + 1) * stepMs);
            const endOfInterval = new Date(now.getTime() - i * stepMs);

            const bucketEvents = data.filter(e => {
                if (!e.startTime) return false;
                const d = new Date(e.startTime);
                return d >= startOfInterval && d < endOfInterval;
            });

            result.push({
                time: format(endOfInterval),
                Critical: bucketEvents.filter(e => e.severity === 'CRITICAL').length,
                Major: bucketEvents.filter(e => e.severity === 'MAJOR').length,
                Minor: bucketEvents.filter(e => e.severity === 'MINOR').length,
                Info: bucketEvents.filter(e => e.severity === 'WARNING' || e.severity === 'INFO').length,
            });
        }

        return result;
    }, [data, timeRange]);

    return (
        <div className="w-full h-[300px] bg-card/50 rounded-xl border border-border/50 p-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Severity Composition ({timeRange === '24H' ? 'Last 24h' : timeRange})</h3>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <defs>
                        <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.danger} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={COLORS.danger} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorMajor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.warning} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={COLORS.warning} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorMinor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.secondary} stopOpacity={0.8} />
                            <stop offset="95%" stopColor={COLORS.secondary} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="time" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip
                        contentStyle={{ backgroundColor: 'hsl(var(--popover))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                        itemStyle={{ fontSize: '11px' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Area type="monotone" dataKey="Critical" stroke={COLORS.danger} fillOpacity={1} fill="url(#colorCritical)" stackId="1" />
                    <Area type="monotone" dataKey="Major" stroke={COLORS.warning} fillOpacity={1} fill="url(#colorMajor)" stackId="1" />
                    <Area type="monotone" dataKey="Minor" stroke={COLORS.secondary} fillOpacity={1} fill="url(#colorMinor)" stackId="1" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

// --- 12. Sankey Diagram: Scan Type -> Severity -> Cause ---
// Custom Link Component for coloring
const SankeyLink = (props: any) => {
    const { sourceX, targetX, sourceY, targetY, sourceControlX, targetControlX, linkWidth, fill } = props;
    return (
        <path
            d={`
                M${sourceX},${sourceY}
                C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}
                L${targetX},${targetY + linkWidth}
                C${targetControlX},${targetY + linkWidth} ${sourceControlX},${sourceY + linkWidth} ${sourceX},${sourceY + linkWidth}
                Z
            `}
            fill={fill}
            fillOpacity={0.4}
            stroke="none"
            className="hover:fill-opacity-80 transition-all duration-300 cursor-pointer"
        />
    );
};

// --- 12. Enhanced Sankey Diagrams (Meaningful & Colorful) ---

const GRADIENTS = [
    { id: 'grad1', start: '#3b82f6', end: '#8b5cf6' },
    { id: 'grad2', start: '#10b981', end: '#3b82f6' },
    { id: 'grad3', start: '#f59e0b', end: '#ef4444' },
    { id: 'gradCritical', start: '#ef4444', end: '#b91c1c' },
];

const CustomSankeyNode = ({ x, y, width, height, index, payload, containerWidth }: any) => {
    const isLeft = x < 150;
    const isRight = x > containerWidth - 150;
    const isMiddle = !isLeft && !isRight;

    // Adjust text styling based on position
    const textAnchor = isLeft ? 'end' : (isRight ? 'start' : 'middle');
    const textX = isLeft ? x - 8 : (isRight ? x + width + 8 : x + width / 2);
    const textY = y + height / 2;

    const showText = height > 10;
    const textColor = isMiddle ? '#ffffff' : 'hsl(var(--foreground))';
    const fontWeight = isMiddle ? '800' : '600';

    return (
        <Layer key={`node-${index}`}>
            <Rectangle
                x={x} y={y} width={width} height={height}
                fill={payload.color || '#888'}
                fillOpacity={0.9} // Slightly transparent bars
                radius={[4, 4, 4, 4]} // Slight rounding
            />

            {showText && (
                <text
                    x={textX}
                    y={textY}
                    textAnchor={textAnchor}
                    dy={4} // Vertically center approx
                    fontSize="10"
                    fill={textColor}
                    fontWeight={fontWeight}
                    style={{
                        textShadow: isMiddle ? '0 1px 2px rgba(0,0,0,0.5)' : 'none',
                        pointerEvents: 'none',
                        textTransform: 'uppercase',
                        letterSpacing: '0.02em'
                    }}
                >
                    {payload.name}
                </text>
            )}
        </Layer>
    );
};

const CustomSankeyLink = ({ sourceX, targetX, sourceY, targetY, linkWidth, index, source, target }: any) => {
    const color = source?.color || source?.payload?.color || '#999';

    return (
        <path
            d={`
                M${sourceX},${sourceY}
                C${sourceX + (targetX - sourceX) * 0.5},${sourceY}
                 ${sourceX + (targetX - sourceX) * 0.5},${targetY}
                 ${targetX},${targetY}
                L${targetX},${targetY + linkWidth}
                C${sourceX + (targetX - sourceX) * 0.5},${targetY + linkWidth}
                 ${sourceX + (targetX - sourceX) * 0.5},${sourceY + linkWidth}
                 ${sourceX},${sourceY + linkWidth}
                Z
            `}
            fill={color}
            fillOpacity={0.2}
            stroke="none"
            className="hover:fill-opacity-50 transition-all duration-300"
        />
    );
};

export function CausalFlowSankey({ data = [] }: { data: any[] }) {
    const sankeyData = useMemo(() => {
        if (!data || data.length === 0) {
            return { nodes: [], links: [] };
        }

        const nodesMap = new Map<string, { name: string, color: string }>();
        const linksMap = new Map<string, number>();

        const getSevColor = (sev: string) => {
            if (sev === 'CRITICAL') return '#ef4444';
            if (sev === 'MAJOR') return '#f97316';
            if (sev === 'MINOR') return '#facc15';
            return '#22c55e';
        };

        data.forEach(e => {
            const scan = e.scanType || 'SNMP Scan';
            const sev = e.severity || 'MAJOR';
            const cause = e.faultName?.split(' ')[0] || 'Unknown';

            const n1 = `scan:${scan}`;
            const n2 = `sev:${sev}`;
            const n3 = `cause:${cause}`;

            if (!nodesMap.has(n1)) nodesMap.set(n1, { name: scan, color: scan.includes('SNMP') ? '#3b82f6' : '#10b981' });
            if (!nodesMap.has(n2)) nodesMap.set(n2, { name: sev, color: getSevColor(sev) });
            if (!nodesMap.has(n3)) nodesMap.set(n3, { name: cause, color: '#8b5cf6' });

            const l1 = `${n1}->${n2}`;
            const l2 = `${n2}->${n3}`;

            linksMap.set(l1, (linksMap.get(l1) || 0) + 1);
            linksMap.set(l2, (linksMap.get(l2) || 0) + 1);
        });

        const nodesList = Array.from(nodesMap.entries()).map(([id, nodeData]) => ({ ...nodeData, id }));
        const linksList = Array.from(linksMap.entries()).map(([id, value]) => {
            const [src, tgt] = id.split('->');
            return {
                source: nodesList.findIndex(n => n.id === src),
                target: nodesList.findIndex(n => n.id === tgt),
                value
            };
        });

        return { nodes: nodesList, links: linksList };
    }, [data]);

    return (
        <div className="w-full h-[380px] bg-card/40 backdrop-blur-sm rounded-2xl border border-border/50 p-6 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground mb-1">Causal Flow Analysis</h3>
            <p className="text-[10px] text-muted-foreground mb-4">Correlation: Scan Type → Severity → Root Cause</p>
            <ResponsiveContainer width="100%" height="85%">
                {sankeyData.nodes.length > 0 ? (
                    <Sankey
                        data={sankeyData}
                        node={<CustomSankeyNode />}
                        link={<CustomSankeyLink />}
                        nodePadding={20}
                        nodeWidth={20}
                        margin={{ left: 100, right: 100, top: 20, bottom: 20 }}
                    >
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', fontSize: '10px' }} />
                    </Sankey>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center border border-dashed border-border/20 rounded-xl bg-muted/5 opacity-50">
                        <span className="text-[10px] font-bold uppercase tracking-widest">No Flow Data</span>
                    </div>
                )}
            </ResponsiveContainer>
        </div>
    );
}

export function MultiDimParallelSankey({ data = [] }: { data: any[] }) {
    const sankeyData = useMemo(() => {
        if (!data || data.length === 0) {
            return { nodes: [], links: [] };
        }

        const nodesMap = new Map<string, { name: string, color: string }>();
        const linksMap = new Map<string, number>();

        data.forEach(e => {
            const type = e.category || 'Event';
            const region = e.region || 'Unknown';
            const cause = e.probableCause || 'General Failure';

            const n1 = `type:${type}`;
            const n2 = `reg:${region}`;
            const n3 = `cause:${cause}`;

            if (!nodesMap.has(n1)) nodesMap.set(n1, { name: type, color: '#f43f5e' });
            if (!nodesMap.has(n2)) nodesMap.set(n2, { name: region, color: '#3b82f6' });
            if (!nodesMap.has(n3)) nodesMap.set(n3, { name: cause, color: '#10b981' });

            const l1 = `${n1}->${n2}`;
            const l2 = `${n2}->${n3}`;

            linksMap.set(l1, (linksMap.get(l1) || 0) + 1);
            linksMap.set(l2, (linksMap.get(l2) || 0) + 1);
        });

        const nodesList = Array.from(nodesMap.entries()).map(([id, nodeData]) => ({ ...nodeData, id }));
        const linksList = Array.from(linksMap.entries()).map(([id, value]) => {
            const [src, tgt] = id.split('->');
            return {
                source: nodesList.findIndex(n => n.id === src),
                target: nodesList.findIndex(n => n.id === tgt),
                value
            };
        });

        return { nodes: nodesList, links: linksList };
    }, [data]);

    return (
        <div className="w-full h-[380px] bg-card/40 backdrop-blur-sm rounded-2xl border border-border/50 p-6 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground mb-1">Multi-Dimensional Correlations</h3>
            <p className="text-[10px] text-muted-foreground mb-4">Flow: Event Type → Region → Probable Cause</p>
            <ResponsiveContainer width="100%" height="85%">
                {sankeyData.nodes.length > 0 ? (
                    <Sankey
                        data={sankeyData}
                        node={<CustomSankeyNode />}
                        link={<CustomSankeyLink />}
                        nodePadding={20}
                        nodeWidth={20}
                        margin={{ left: 100, right: 100, top: 20, bottom: 20 }}
                    >
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', fontSize: '10px' }} />
                    </Sankey>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center border border-dashed border-border/20 rounded-xl bg-muted/5 opacity-50">
                        <span className="text-[10px] font-bold uppercase tracking-widest">No Correlation Data</span>
                    </div>
                )}
            </ResponsiveContainer>
        </div>
    );
}
