import { useMemo } from 'react';
import { useInventoryStore } from '@/store/inventoryStore';
import {
    Gauge,
    Activity,
    TrendingUp,
    Zap,
    Globe,
    ArrowUpRight,
    ArrowDownRight,
    Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
    Cell, CartesianGrid, LineChart, Line, AreaChart, Area
} from 'recharts';

export function PerformanceDashboard() {
    const { links, nodes } = useInventoryStore();

    // Top Links by Bandwidth
    const topBandwidthLinks = useMemo(() => {
        return [...links]
            .sort((a, b) => (b.bandwidth || 0) - (a.bandwidth || 0))
            .slice(0, 10);
    }, [links]);


    // Regional Latency (Modeling)
    const regionalPerformance = useMemo(() => {
        const regions = ['North', 'South', 'East', 'West'];
        return regions.map(r => ({
            name: r,
            latency: 20 + Math.random() * 30,
            packetLoss: Math.random() * 0.5,
            jitter: 2 + Math.random() * 5
        }));
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-widest text-foreground">
                        Network Performance
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        End-to-end telemetry, bandwidth utilization, and regional health.
                    </p>
                </div>
                <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-black uppercase">
                            OP{i}
                        </div>
                    ))}
                    <div className="h-8 w-8 rounded-full border-2 border-background bg-primary flex items-center justify-center text-[10px] font-black uppercase text-primary-foreground">
                        +5
                    </div>
                </div>
            </div>

            {/* Performance KPIs */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-border/50 bg-card/50 p-6 flex flex-col gap-2 relative overflow-hidden group">
                    <div className="flex items-center justify-between z-10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Avg Latency</span>
                        <ArrowDownRight size={14} className="text-emerald-500" />
                    </div>
                    <div className="text-3xl font-black tabular-nums z-10">24.5<span className="text-sm font-medium ml-1">ms</span></div>
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Activity size={80} />
                    </div>
                </div>
                <div className="rounded-xl border border-border/50 bg-card/50 p-6 flex flex-col gap-2 relative overflow-hidden group">
                    <div className="flex items-center justify-between z-10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Packet Loss</span>
                        <ArrowUpRight size={14} className="text-destructive font-black" />
                    </div>
                    <div className="text-3xl font-black tabular-nums z-10">0.02<span className="text-sm font-medium ml-1">%</span></div>
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Globe size={80} />
                    </div>
                </div>
                <div className="rounded-xl border border-border/50 bg-card/50 p-6 flex flex-col gap-2 relative overflow-hidden group">
                    <div className="flex items-center justify-between z-10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active Bandwidth</span>
                        <TrendingUp size={14} className="text-primary" />
                    </div>
                    <div className="text-3xl font-black tabular-nums z-10">1.2<span className="text-sm font-medium ml-1">Tbps</span></div>
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Zap size={80} />
                    </div>
                </div>
                <div className="rounded-xl border border-border/50 bg-card/50 p-6 flex flex-col gap-2 relative overflow-hidden group">
                    <div className="flex items-center justify-between z-10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Network Load</span>
                        <Gauge size={14} className="text-orange-500" />
                    </div>
                    <div className="text-3xl font-black tabular-nums z-10">68<span className="text-sm font-medium ml-1">%</span></div>
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Gauge size={80} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Horizontal Bandwidth Chart */}
                <div className="col-span-12 lg:col-span-12">
                    <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
                        <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                            Top Provider Links by Bandwidth Capacity
                        </h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topBandwidthLinks} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.5} />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="customerCode"
                                        type="category"
                                        tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                                        width={80}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                                        formatter={(value) => [`${value} Kbps`, 'Bandwidth']}
                                    />
                                    <Bar dataKey="bandwidth" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20}>
                                        {topBandwidthLinks.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fillOpacity={1 - (index * 0.08)} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Regional Health Matrix */}
                <div className="col-span-12">
                    <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm h-full">
                        <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                            Regional Latency Heatmap (ms)
                        </h3>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {regionalPerformance.map((rp) => (
                                <div key={rp.name} className="p-4 rounded-xl border border-border/50 bg-muted/20 flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-foreground">{rp.name}</span>
                                        <div className={cn(
                                            "h-2 w-2 rounded-full shadow-[0_0_8px]",
                                            rp.latency < 30 ? "bg-emerald-500 shadow-emerald-500/50" : "bg-orange-500 shadow-orange-500/50"
                                        )} />
                                    </div>
                                    <div className="text-2xl font-black tabular-nums">{rp.latency.toFixed(1)}</div>
                                    <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
                                        <span>Jitter: {rp.jitter.toFixed(1)}ms</span>
                                        <span>Loss: {rp.packetLoss.toFixed(2)}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
