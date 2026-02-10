import { useInventoryStore } from '@/store/inventoryStore';
import { AlertCircle, Clock, MapPin, Server } from 'lucide-react';

export function CriticalEventsTable() {
    const { activeEvents } = useInventoryStore();

    const criticalEvents = Array.from(activeEvents)
        .sort((a, b) => {
            const priority: Record<string, number> = { 'CRITICAL': 0, 'MAJOR': 1, 'MINOR': 2, 'WARNING': 3 };
            return (priority[a.severity] ?? 4) - (priority[b.severity] ?? 4);
        })
        .slice(0, 10);

    if (activeEvents.length === 0) return null;

    return (
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm">
            <div className="border-b border-border/50 bg-muted/30 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                        Critical Network Events
                    </h3>
                </div>
                <span className="text-[10px] font-bold bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">
                    {activeEvents.filter(e => e.severity === 'CRITICAL').length} CRITICAL
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead className="bg-muted/10 font-bold uppercase tracking-wider text-muted-foreground">
                        <tr>
                            <th className="px-4 py-3">Severity</th>
                            <th className="px-4 py-3">Device / Node</th>
                            <th className="px-4 py-3">Fault Name / Description</th>
                            <th className="px-4 py-3">Start Time</th>
                            <th className="px-4 py-3 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                        {criticalEvents.map((event, idx) => (
                            <tr key={idx} className="hover:bg-muted/20 transition-colors">
                                <td className="px-4 py-3">
                                    <span className={`inline-flex items-center gap-1 font-bold ${event.severity === 'CRITICAL' ? 'text-destructive' : 'text-orange-500'
                                        }`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${event.severity === 'CRITICAL' ? 'bg-destructive' : 'bg-orange-500'
                                            }`} />
                                        {event.severity}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-foreground flex items-center gap-1">
                                            <Server size={12} className="text-muted-foreground" />
                                            {event.deviceName}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground">{event.ip}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="max-w-[300px] truncate" title={event.faultName}>
                                        {event.faultName || 'Network Link Down / Reachability Failure'}
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="flex items-center gap-1 text-muted-foreground">
                                        <Clock size={12} />
                                        {event.startTime}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground capitalize">
                                        {event.status || 'Active'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {activeEvents.length > 10 && (
                <div className="bg-muted/10 px-4 py-2 border-t border-border/30 text-center">
                    <button className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">
                        View All {activeEvents.length} Active Events
                    </button>
                </div>
            )}
        </div>
    );
}
