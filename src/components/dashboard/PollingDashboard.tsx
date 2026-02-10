import { useMemo } from 'react';
import { useInventoryStore } from '@/store/inventoryStore';
import {
    Database,
    AlertTriangle,
    Wifi,
    WifiOff,
    ChevronLeft,
    Clock,
    Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    ResponsiveContainer, Tooltip,
    Cell, PieChart, Pie
} from 'recharts';

// Polling Parameters Data
const POLLING_DATA = [
    {
        parameter: 'Jitter',
        configured: 50000,
        resources: 200000,
        snmpUp: 190000,
        polling: 180000,
        color: 'hsl(280, 70%, 55%)'
    },
    {
        parameter: 'Packet Loss',
        configured: 50000,
        resources: 200000,
        snmpUp: 190000,
        polling: 180000,
        color: 'hsl(12, 85%, 55%)'
    },
    {
        parameter: 'Latency',
        configured: 50000,
        resources: 200000,
        snmpUp: 190000,
        polling: 180000,
        color: 'hsl(38, 92%, 50%)'
    },
    {
        parameter: 'Utilization',
        configured: 95000,
        resources: 110000,
        snmpUp: 100000,
        polling: 90000,
        color: 'hsl(210, 100%, 55%)'
    }
];

// Polling Failure Reasons
const POLLING_FAILURES = [
    { reason: 'SNMP Timeout', count: 8500, percentage: 42.5, color: 'hsl(12, 85%, 55%)' },
    { reason: 'Device Unreachable', count: 5200, percentage: 26, color: 'hsl(38, 92%, 50%)' },
    { reason: 'Authentication Failed', count: 3800, percentage: 19, color: 'hsl(280, 70%, 55%)' },
    { reason: 'Configuration Error', count: 2500, percentage: 12.5, color: 'hsl(210, 100%, 55%)' }
];

export function PollingDashboard() {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
                    <div>
                        <h1 className="text-[12px] font-black uppercase tracking-[0.15em] text-foreground/90 leading-tight">
                            Polling Analytics
                        </h1>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary/40 animate-pulse" />
                            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Status & Failure Analysis</span>
                        </div>
                    </div>
                </div>
                <div className="h-[1px] flex-1 mx-4 bg-gradient-to-r from-border/50 to-transparent" />
            </div>

            {/* Polling Statistics */}
            <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <Database size={14} className="text-primary" />
                            Polling Parameters Statistics
                        </h3>
                        <p className="text-[10px] text-muted-foreground mt-1">Configured devices vs actual polling status</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-muted/50 font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50">
                            <tr>
                                <th className="px-4 py-3">Parameter</th>
                                <th className="px-4 py-3 text-right">Devices Configured</th>
                                <th className="px-4 py-3 text-right">No of Resources</th>
                                <th className="px-4 py-3 text-right">SNMP Up</th>
                                <th className="px-4 py-3 text-right">Polling</th>
                                <th className="px-4 py-3 text-right">Success Rate</th>
                                <th className="px-4 py-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {POLLING_DATA.map((item, idx) => {
                                const successRate = ((item.polling / item.resources) * 100).toFixed(1);

                                return (
                                    <tr key={idx} className="hover:bg-muted/20 transition-colors group">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                                                <span className="font-bold text-foreground">{item.parameter}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-right font-semibold tabular-nums">{item.configured.toLocaleString()}</td>
                                        <td className="px-4 py-4 text-right font-semibold tabular-nums">{item.resources.toLocaleString()}</td>
                                        <td className="px-4 py-4 text-right font-semibold tabular-nums text-blue-500">{item.snmpUp.toLocaleString()}</td>
                                        <td className="px-4 py-4 text-right font-bold tabular-nums text-emerald-500">{item.polling.toLocaleString()}</td>
                                        <td className="px-4 py-4 text-right">
                                            <span className={cn(
                                                "font-black tabular-nums",
                                                parseFloat(successRate) > 90 ? "text-emerald-500" :
                                                    parseFloat(successRate) > 80 ? "text-orange-500" : "text-red-500"
                                            )}>
                                                {successRate}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            {parseFloat(successRate) > 90 ? (
                                                <Wifi size={16} className="inline text-emerald-500" />
                                            ) : (
                                                <WifiOff size={16} className="inline text-orange-500" />
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Polling Failure Analysis */}
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-6">
                    <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm h-full">
                        <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <AlertTriangle size={14} className="text-orange-500" />
                            Polling Failure Reasons
                        </h3>
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={POLLING_FAILURES}
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={5}
                                        dataKey="count"
                                        label={({ reason, percentage }) => `${reason}: ${percentage}%`}
                                        labelLine={{ stroke: 'hsl(var(--border))' }}
                                    >
                                        {POLLING_FAILURES.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="col-span-12 lg:col-span-6">
                    <div className="rounded-xl border border-border/50 bg-card p-6 shadow-sm h-full">
                        <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-muted-foreground">
                            Failure Breakdown
                        </h3>
                        <div className="space-y-4">
                            {POLLING_FAILURES.map((failure, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: failure.color }} />
                                            <span className="text-xs font-bold text-foreground">{failure.reason}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-muted-foreground">{failure.count.toLocaleString()} devices</span>
                                            <span className="text-sm font-black" style={{ color: failure.color }}>{failure.percentage}%</span>
                                        </div>
                                    </div>
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                backgroundColor: failure.color,
                                                width: `${failure.percentage}%`
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-4 border-t border-border/30">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-muted-foreground">Total Failures</span>
                                <span className="text-lg font-black text-red-500">
                                    {POLLING_FAILURES.reduce((sum, f) => sum + f.count, 0).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
