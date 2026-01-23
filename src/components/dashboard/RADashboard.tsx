import { useMemo, useState } from 'react';
import { useInventoryStore } from '@/store/inventoryStore';
import {
    FileText,
    Link2,
    User,
    Activity,
    Search,
    Download,
    Package,
    ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip,
    PieChart, Pie, Cell, CartesianGrid
} from 'recharts';

const STATUS_COLORS: Record<string, string> = {
    'Active': 'hsl(160, 84%, 39%)',
    'Inactive': 'hsl(0, 0%, 40%)',
    'Pending': 'hsl(38, 92%, 50%)',
    'Cancelled': 'hsl(12, 85%, 55%)',
};

export function RADashboard() {
    const { raInventory } = useInventoryStore();
    const [searchTerm, setSearchTerm] = useState('');

    // RA Stats
    const stats = useMemo(() => {
        const counts = {
            TOTAL: raInventory.length,
            ACTIVE: raInventory.filter(ra => ra.status === 'Active').length,
            PENDING: raInventory.filter(ra => ra.status === 'Pending').length,
            CUSTOMERS: new Set(raInventory.map(ra => ra.customerCode)).size
        };
        return counts;
    }, [raInventory]);

    // Product Distribution
    const productData = useMemo(() => {
        const counts: Record<string, number> = {};
        raInventory.forEach(ra => {
            const prod = ra.product || 'Others';
            counts[prod] = (counts[prod] || 0) + 1;
        });
        return Object.entries(counts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);
    }, [raInventory]);

    // Status Data
    const statusData = useMemo(() => {
        const counts: Record<string, number> = {};
        raInventory.forEach(ra => {
            const status = ra.status || 'Unknown';
            counts[status] = (counts[status] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({
            name,
            value,
            color: STATUS_COLORS[name] || 'hsl(var(--muted))'
        }));
    }, [raInventory]);

    // Filtered RAs
    const filteredRAs = useMemo(() => {
        return raInventory.filter(ra =>
            ra.raNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ra.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ra.product.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [raInventory, searchTerm]);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-widest text-foreground">
                        RA Inventory Analytics
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Revenue Assurance and Resource Allocation tracking.
                    </p>
                </div>
                <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-lg hover:bg-primary/90 transition-all">
                    <Download size={14} />
                    Export RA Data
                </button>
            </div>

            {/* Top KPIs */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-border/50 bg-card/50 p-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total RA Records</span>
                            <div className="text-3xl font-black">{stats.TOTAL}</div>
                        </div>
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                            <FileText size={20} />
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-border/50 bg-card/50 p-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Active RAs</span>
                            <div className="text-3xl font-black text-emerald-500">{stats.ACTIVE}</div>
                        </div>
                        <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-500">
                            <ShieldCheck size={20} />
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-border/50 bg-card/50 p-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Unique Customers</span>
                            <div className="text-3xl font-black text-blue-500">{stats.CUSTOMERS}</div>
                        </div>
                        <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500">
                            <User size={20} />
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-border/50 bg-card/50 p-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Pending RAs</span>
                            <div className="text-3xl font-black text-orange-500">{stats.PENDING}</div>
                        </div>
                        <div className="rounded-lg bg-orange-500/10 p-2 text-orange-500">
                            <Activity size={20} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {/* Charts */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
                        <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                            Product Breakdown
                        </h3>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={productData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                                    <XAxis dataKey="name" tick={{ fontSize: 9 }} hide />
                                    <YAxis tick={{ fontSize: 9 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                                    />
                                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
                        <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                            RA Status
                        </h3>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {statusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 flex flex-wrap justify-center gap-4 text-[10px] font-bold uppercase tracking-wider">
                            {statusData.map(s => (
                                <div key={s.name} className="flex items-center gap-1.5">
                                    <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: s.color }} />
                                    <span className="text-muted-foreground">{s.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RA List */}
                <div className="col-span-12 lg:col-span-8">
                    <div className="rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden flex flex-col h-full text-[10px]">
                        <div className="border-b border-border/50 bg-muted/30 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Search size={14} className="text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search by RA#, Customer, or Product..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-transparent border-none focus:outline-none w-64 p-1 rounded hover:bg-muted/50 transition-all font-medium"
                                />
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground">
                                {filteredRAs.length} RA RECORDS LOADED
                            </span>
                        </div>
                        <div className="overflow-auto max-h-[600px]">
                            <table className="w-full text-left">
                                <thead className="sticky top-0 z-10 bg-muted/90 backdrop-blur-md font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50">
                                    <tr>
                                        <th className="px-4 py-3">RA Number</th>
                                        <th className="px-4 py-3">Status</th>
                                        <th className="px-4 py-3">Customer Code</th>
                                        <th className="px-4 py-3">Customer Name</th>
                                        <th className="px-4 py-3">Product</th>
                                        <th className="px-4 py-3 text-right">RA Type</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/20">
                                    {filteredRAs.map((ra, idx) => (
                                        <tr key={idx} className="hover:bg-muted/30 transition-colors group">
                                            <td className="px-4 py-3 font-bold text-primary">{ra.raNumber}</td>
                                            <td className="px-4 py-3">
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded-full text-[9px] font-bold",
                                                    ra.status === 'Active' ? "bg-emerald-500/10 text-emerald-500" :
                                                        ra.status === 'Pending' ? "bg-orange-500/10 text-orange-500" :
                                                            "bg-muted text-muted-foreground"
                                                )}>
                                                    {ra.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">{ra.customerCode}</td>
                                            <td className="px-4 py-3 font-medium truncate max-w-[120px]">{ra.customerName}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5">
                                                    <Package size={10} className="text-muted-foreground" />
                                                    {ra.product}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right text-muted-foreground">{ra.type}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
