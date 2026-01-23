import { useMemo, useState } from 'react';
import { useInventoryStore } from '@/store/inventoryStore';
import {
    Search,
    Zap,
    History,
    PlusCircle,
    ArrowRight,
    SearchCode,
    Network,
    RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
    Cell, CartesianGrid, AreaChart, Area
} from 'recharts';

export function DiscoveryDashboard() {
    const { nodes, links, configCalendar } = useInventoryStore();
    const [searchTerm, setSearchTerm] = useState('');

    // Recent Additions (Mocking by taking last N items)
    const recentNodes = useMemo(() => nodes.slice(-5).reverse(), [nodes]);
    const recentLinks = useMemo(() => links.slice(-5).reverse(), [links]);

    // Node Type Distribution
    const nodeTypeData = useMemo(() => {
        const counts: Record<string, number> = {};
        nodes.forEach(n => {
            const type = n.deviceType || 'Unknown';
            counts[type] = (counts[type] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [nodes]);

    // Discovery Trend (Generic data for visualization)
    const discoveryTrend = [
        { day: 'Mon', new: 12, changes: 45 },
        { day: 'Tue', new: 8, changes: 38 },
        { day: 'Wed', new: 15, changes: 52 },
        { day: 'Thu', new: 22, changes: 61 },
        { day: 'Fri', new: 18, changes: 48 },
        { day: 'Sat', new: 5, changes: 12 },
        { day: 'Sun', new: 3, changes: 15 },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-widest text-foreground">
                        Discovery & Change
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Network expansion tracking and infrastructure modifications.
                    </p>
                </div>
                <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-lg hover:bg-primary/90 transition-all">
                    <RefreshCw size={14} />
                    Run Discovery Scan
                </button>
            </div>

            {/* Discovery Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border border-border/50 bg-card/50 p-6 flex items-center gap-6">
                    <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <PlusCircle size={32} />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">New Discoveries</span>
                        <div className="text-3xl font-black">{nodes.length > 50 ? '34' : '12'}</div>
                        <p className="text-[10px] text-emerald-500 font-bold">+12% from last week</p>
                    </div>
                </div>
                <div className="rounded-xl border border-border/50 bg-card/50 p-6 flex items-center gap-6">
                    <div className="h-16 w-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <Zap size={32} />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Configuration Changes</span>
                        <div className="text-3xl font-black">{configCalendar.length}</div>
                        <p className="text-[10px] text-blue-500 font-bold">Real-time tracking active</p>
                    </div>
                </div>
                <div className="rounded-xl border border-border/50 bg-card/50 p-6 flex items-center gap-6">
                    <div className="h-16 w-16 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                        <Network size={32} />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Topology Updates</span>
                        <div className="text-3xl font-black">{links.length > 20 ? '8' : '3'}</div>
                        <p className="text-[10px] text-muted-foreground">Last updated 1h ago</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Discovery Trend */}
                <div className="col-span-12 lg:col-span-8">
                    <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
                        <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                            Activity Timeline
                        </h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={discoveryTrend}>
                                    <defs>
                                        <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorChanges" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(210, 100%, 55%)" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(210, 100%, 55%)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                                    <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                                    />
                                    <Area type="monotone" dataKey="new" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorNew)" strokeWidth={3} />
                                    <Area type="monotone" dataKey="changes" stroke="hsl(210, 100%, 55%)" fillOpacity={1} fill="url(#colorChanges)" strokeWidth={3} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Node Types */}
                <div className="col-span-12 lg:col-span-4">
                    <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm h-full">
                        <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                            Infrastructure Mix
                        </h3>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={nodeTypeData} layout="vertical">
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                        width={100}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                                    />
                                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={12} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Recent Discoveries */}
                <div className="col-span-12 lg:col-span-6">
                    <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
                        <div className="border-b border-border/50 bg-muted/30 px-4 py-3 flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <SearchCode size={14} className="text-primary" />
                                Recently Discovered Nodes
                            </h3>
                        </div>
                        <div className="divide-y divide-border/30">
                            {recentNodes.map((node, idx) => (
                                <div key={idx} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                            {node.make[0]}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-foreground">{node.deviceName}</span>
                                            <span className="text-[10px] text-muted-foreground uppercase">{node.deviceType} • {node.make}</span>
                                        </div>
                                    </div>
                                    <button className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground">
                                        <ArrowRight size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Discovery Log */}
                <div className="col-span-12 lg:col-span-6">
                    <div className="rounded-xl border border-border/50 bg-card overflow-hidden h-full">
                        <div className="border-b border-border/50 bg-muted/30 px-4 py-3 flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <History size={14} className="text-blue-500" />
                                Discovery Event Log
                            </h3>
                        </div>
                        <div className="p-4 space-y-4">
                            {discoveryTrend.slice(0, 4).map((_, idx) => (
                                <div key={idx} className="flex gap-4">
                                    <div className="relative mt-1">
                                        <div className="h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-primary/10" />
                                        {idx !== 3 && <div className="absolute left-1.25 top-2.5 h-10 w-0.5 bg-border/50" />}
                                    </div>
                                    <div className="flex flex-col pb-6">
                                        <span className="text-xs font-bold text-foreground">Topology scan completed</span>
                                        <span className="text-[10px] text-muted-foreground">Discovered 4 new links and updated 2 routing paths in NORTH region.</span>
                                        <span className="text-[9px] text-primary/70 font-mono mt-1">Today, 10:45 AM</span>
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
