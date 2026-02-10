import { useMemo, useState } from 'react';
import { useInventoryStore } from '@/store/inventoryStore';
import {
    FileText,
    TrendingUp,
    Users,
    Zap,
    Search,
    Download,
    Package,
    ShieldCheck,
    LayoutDashboard,
    MoreVertical,
    Map,
    ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
    PieChart, Pie, Cell, CartesianGrid, LabelList
} from 'recharts';
import { exportToCSV } from '@/utils/exportUtils';

const COLORS = {
    primary: 'hsl(var(--primary))',
    secondary: 'hsl(var(--secondary))',
    accent: 'hsl(var(--accent))',
    emerald: '#10b981',
    blue: '#3b82f6',
    orange: '#f59e0b',
    rose: '#f43f5e',
    violet: '#8b5cf6',
};

const STATUS_COLORS: Record<string, string> = {
    'Active': COLORS.emerald,
    'LIVE': COLORS.emerald,
    'Pending': COLORS.orange,
    'NEW': COLORS.blue,
    'Cancelled': COLORS.rose,
    'Decommissioned': 'hsl(var(--muted-foreground))',
};

// Helper to parse bandwidth string like "10 Mbps" or "2 Gbps" to numeric Kbps
const parseBwToKbps = (bwStr: string): number => {
    if (!bwStr) return 0;
    const cleaned = bwStr.toLowerCase().replace(/[^0-9.a-z]/g, '');
    const num = parseFloat(cleaned);
    if (isNaN(num)) return 0;

    if (cleaned.includes('gbps')) return num * 1024 * 1024;
    if (cleaned.includes('mbps')) return num * 1024;
    if (cleaned.includes('kbps')) return num;
    return num; // assume kbps if no unit
};

export function RADashboard() {
    const { raInventory } = useInventoryStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'customers'>('overview');

    // --- DATA PROCESSING ---

    // 1. KPI Stats
    const stats = useMemo(() => {
        const total = raInventory.length;
        const active = raInventory.filter(ra =>
            ['Active', 'LIVE', 'UP'].includes(ra.status || '')
        ).length;
        const pending = raInventory.filter(ra =>
            ['Pending', 'IN PROGRESS', 'NEW'].includes(ra.status || '')
        ).length;
        const uniqueCustomers = new Set(raInventory.map(ra => ra.customerCode)).size;

        return {
            total,
            active,
            activePercent: total > 0 ? Math.round((active / total) * 100) : 0,
            pending,
            customers: uniqueCustomers
        };
    }, [raInventory]);


    // 3. Status Split
    const statusData = useMemo(() => {
        const counts: Record<string, number> = {};
        raInventory.forEach(ra => {
            const s = ra.status || 'Others';
            counts[s] = (counts[s] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({
            name,
            value,
            color: STATUS_COLORS[name] || `hsl(${Math.random() * 360}, 70%, 50%)`
        })).sort((a, b) => b.value - a.value);
    }, [raInventory]);

    // 4. Top Customers by Allocation
    const customerAllocation = useMemo(() => {
        const custData: Record<string, { count: number, bw: number }> = {};
        raInventory.forEach(ra => {
            const name = ra.customerName || ra.customerCode || 'Unknown';
            if (!custData[name]) custData[name] = { count: 0, bw: 0 };
            custData[name].count++;
            custData[name].bw += parseBwToKbps(ra.bandwidth);
        });

        return Object.entries(custData)
            .map(([name, data]) => ({
                name,
                count: data.count,
                bandwidth: Math.round(data.bw / 1024) // Convert back to Mbps for chart
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }, [raInventory]);

    // 5. Product Distribution
    const productData = useMemo(() => {
        const counts: Record<string, number> = {};
        raInventory.forEach(ra => {
            const p = ra.product || 'Others';
            counts[p] = (counts[p] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [raInventory]);

    // 6. Regional Distribution
    const regionData = useMemo(() => {
        const counts: Record<string, number> = {};
        raInventory.forEach(ra => {
            const r = ra.region || 'Unassigned';
            counts[r] = (counts[r] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
    }, [raInventory]);


    // 8. Filtered List
    const filteredRAs = useMemo(() => {
        const q = searchTerm.toLowerCase();
        return raInventory.filter(ra =>
            ra.raNumber.toLowerCase().includes(q) ||
            ra.customerName.toLowerCase().includes(q) ||
            ra.customerCode.toLowerCase().includes(q) ||
            ra.product.toLowerCase().includes(q) ||
            (ra.region || '').toLowerCase().includes(q)
        );
    }, [raInventory, searchTerm]);

    // 9. LSI vs Health Status
    const lsiHealthData = useMemo(() => {
        const counts: Record<string, number> = {};
        raInventory.forEach(ra => {
            const status = ra.status || 'Unknown';
            const lsis = (ra.linkIds || '').split(/[,;]/).map(s => s.trim()).filter(Boolean);
            const weight = lsis.length > 0 ? lsis.length : 1;
            counts[status] = (counts[status] || 0) + weight;
        });
        return Object.entries(counts).map(([name, value]) => ({
            name,
            value,
            color: STATUS_COLORS[name] || `hsl(${Math.random() * 360}, 70%, 50%)`
        })).sort((a, b) => b.value - a.value);
    }, [raInventory]);

    return (
        <div className="space-y-4 animate-in fade-in duration-700">
            {/* --- HEADER --- */}
            <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => useInventoryStore.getState().setSelectedModule('unified')}
                        className="p-1 rounded-lg hover:bg-primary/10 text-primary transition-all flex items-center justify-center"
                        title="Back to Overview"
                    >
                        <ChevronLeft size={20} strokeWidth={2.5} />
                    </button>
                    <div className="h-5 w-1 bg-primary rounded-full shadow-[0_0_8px_rgba(0,165,142,0.4)]" />
                    <h1 className="text-[12px] font-black uppercase tracking-[0.15em] text-foreground/90">
                        RA Inventory Analytics
                    </h1>
                </div>
                <div className="h-[1px] flex-1 mx-4 bg-gradient-to-r from-border/50 to-transparent" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                    { label: 'Total RA Records', value: stats.total, icon: FileText, color: COLORS.blue, sub: 'Network-wide' },
                    { label: 'Active Allocation', value: stats.active, icon: ShieldCheck, color: COLORS.emerald, sub: `${stats.activePercent}% of total` },
                    { label: 'Total Customers', value: stats.customers, icon: Users, color: COLORS.violet, sub: 'Unique Enterprise codes' },
                ].map((kpi, i) => (
                    <div key={i} className="group relative rounded-xl border border-border/50 bg-card/50 p-3 shadow-sm hover:shadow-md transition-all hover:border-primary/20 overflow-hidden">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">{kpi.label}</span>
                            <div className="p-1.5 rounded-md bg-muted group-hover:bg-primary/10 transition-colors" style={{ color: kpi.color }}>
                                <kpi.icon size={14} />
                            </div>
                        </div>
                        <div className="text-xl font-black tracking-tight">{kpi.value}</div>
                        <div className="mt-0.5 text-[8px] font-medium text-muted-foreground opacity-80">{kpi.sub}</div>
                        <div className="absolute -right-1 -bottom-1 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                            <kpi.icon size={50} strokeWidth={3} />
                        </div>
                    </div>
                ))}
            </div>

            {/* --- INSIGHTS TABS --- */}
            <div className="space-y-6">
                <div className="flex items-center gap-1 p-0.5 bg-muted/50 rounded-lg w-fit border border-border/50">
                    {(['overview', 'customers'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "px-4 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all",
                                activeTab === tab
                                    ? "bg-primary text-primary-foreground shadow-sm"
                                    : "text-muted-foreground hover:text-foreground hover:bg-background/80"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {activeTab === 'overview' && (
                    <div className="grid grid-cols-12 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                        {/* Primary Charts */}
                        <div className="col-span-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-4 shadow-sm flex flex-col h-[280px]">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                        <Package size={14} className="text-primary" />
                                        Product Distribution
                                    </h3>
                                    <button
                                        onClick={() => exportToCSV(filteredRAs, 'RA_Product_Distribution')}
                                        className="p-1 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                                    >
                                        <Download size={12} />
                                    </button>
                                </div>
                                <div className="flex-1 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={productData} layout="vertical" margin={{ left: 10, right: 30 }}>
                                            <XAxis type="number" hide />
                                            <YAxis
                                                dataKey="name"
                                                type="category"
                                                width={100}
                                                tick={{ fontSize: 9, fontWeight: '700', fill: 'hsl(var(--foreground))' }}
                                                axisLine={false}
                                                tickLine={false}
                                            />
                                            <Tooltip
                                                cursor={{ fill: 'hsl(var(--primary)/5%)' }}
                                                contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                                            />
                                            <Bar dataKey="value" fill={COLORS.primary} radius={[0, 4, 4, 0]} barSize={24}>
                                                {productData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fillOpacity={1 - (index * 0.1)} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Regional Breakdown */}
                            <div className="rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-4 shadow-sm flex flex-col h-[280px]">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                        <Map size={14} className="text-blue-500" />
                                        Regional Footprint
                                    </h3>
                                    <button
                                        onClick={() => exportToCSV(filteredRAs, 'RA_Regional_Footprint')}
                                        className="p-1 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                                    >
                                        <Download size={12} />
                                    </button>
                                </div>
                                <div className="flex-1 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={regionData}
                                                cx="50%" cy="50%"
                                                innerRadius={65}
                                                outerRadius={90}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {regionData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={[COLORS.blue, COLORS.emerald, COLORS.violet, COLORS.orange][index % 4]} stroke="none" />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex flex-wrap justify-center gap-3 mt-4">
                                    {regionData.map((r, i) => (
                                        <div key={r.name} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted/30">
                                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: [COLORS.blue, COLORS.emerald, COLORS.violet, COLORS.orange][i % 4] }} />
                                            <span className="text-[9px] font-bold uppercase">{r.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                )}

                {activeTab === 'customers' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in zoom-in-95 duration-500">
                        {/* Top Customers by Count */}
                        <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 shadow-sm h-[400px]">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                    <Users size={16} className="text-primary" />
                                    Top Clients by Volume
                                </h3>
                                <button
                                    onClick={() => exportToCSV(filteredRAs, 'RA_Top_Clients_By_Volume')}
                                    className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                                >
                                    <Download size={14} />
                                </button>
                            </div>
                            <ResponsiveContainer width="100%" height="90%">
                                <BarChart data={customerAllocation} layout="vertical">
                                    <CartesianGrid strokeDasharray="2 2" horizontal={false} opacity={0.3} />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        width={120}
                                        tick={{ fontSize: 8, fontWeight: '700' }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'hsl(var(--primary)/2%)' }}
                                        contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderRadius: '12px' }}
                                    />
                                    <Bar dataKey="count" fill={COLORS.primary} radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Top Customers by BW */}
                        <div className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 shadow-sm h-[400px]">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                    <TrendingUp size={16} className="text-emerald-500" />
                                    Top Clients by Bandwidth Allocation
                                </h3>
                                <button
                                    onClick={() => exportToCSV(filteredRAs, 'RA_Top_Clients_By_Bandwidth')}
                                    className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                                >
                                    <Download size={14} />
                                </button>
                            </div>
                            <ResponsiveContainer width="100%" height="90%">
                                <BarChart data={customerAllocation} layout="vertical">
                                    <CartesianGrid strokeDasharray="2 2" horizontal={false} opacity={0.3} />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        width={120}
                                        tick={{ fontSize: 8, fontWeight: '700' }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'hsl(var(--primary)/2%)' }}
                                        formatter={(val) => [`${val} Mbps`, 'Bandwidth']}
                                        contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderRadius: '12px' }}
                                    />
                                    <Bar dataKey="bandwidth" fill={COLORS.emerald} radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

            </div>

            {/* --- LSI vs HEALTH STATUS PLOT --- */}
            <div className="rounded-2xl border border-border/50 bg-card shadow-lg p-6 flex flex-col h-[450px]">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <Zap size={18} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-foreground">LSI vs Health Status</h3>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider opacity-60">Distribution of allocated LSIs across current health states</p>
                        </div>
                    </div>
                    <button
                        onClick={() => exportToCSV(lsiHealthData, 'LSI_Health_status_Export')}
                        className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                    >
                        <Download size={14} />
                        Export LSI Summary
                    </button>
                </div>

                <div className="flex-1 w-full relative pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={lsiHealthData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 10, fontWeight: '800', fill: 'hsl(var(--foreground))' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 10, fontWeight: '700', fill: 'hsl(var(--foreground))' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                cursor={{ fill: 'hsl(var(--primary)/5%)' }}
                                contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                            />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={60}>
                                {lsiHealthData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                                <LabelList dataKey="value" position="top" style={{ fontSize: '12px', fontWeight: '900', fill: 'hsl(var(--foreground))' }} offset={10} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
