import { useInventoryStore } from '@/store/inventoryStore';
import {
    Server,
    Link2,
    ArrowUp,
    ArrowDown,
    Users,
    MapPin
} from 'lucide-react';

export function HeaderKPIs() {
    const { getStats, toggleFilter, clearFilterField } = useInventoryStore();
    const stats = getStats();

    return (
        <div className="flex items-center gap-6 xl:gap-8 px-2">
            {/* Active Nodes */}
            <div className="flex items-center gap-2.5 group">
                <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 cursor-pointer hover:bg-blue-500/20 transition-colors"
                    onClick={() => clearFilterField('status', 'nodes')} // Toggle off or clear
                    title="Clear Node Status Filter"
                >
                    <Server size={16} />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-black tracking-wider text-muted-foreground/70">Nodes</span>
                    <div className="flex items-center gap-1.5 h-5">
                        <span
                            className="text-lg font-black text-foreground cursor-pointer hover:text-primary transition-colors"
                            onClick={() => clearFilterField('status', 'nodes')}
                            title="Total Nodes"
                        >
                            {stats.totalNodes}
                        </span>
                        <div className="flex items-center gap-1 pl-1 border-l border-border/50">
                            <button
                                onClick={() => toggleFilter('status', 'UP', 'nodes')}
                                className="text-[10px] font-bold text-emerald-500 flex items-center hover:bg-emerald-500/10 rounded px-1 transition-colors"
                                title="Filter Online Nodes"
                            >
                                <ArrowUp size={8} className="mr-0.5" /> {stats.onlineNodes}
                            </button>
                            <button
                                onClick={() => toggleFilter('status', 'DOWN', 'nodes')}
                                className="text-[10px] font-bold text-rose-500 flex items-center hover:bg-rose-500/10 rounded px-1 transition-colors"
                                title="Filter Offline Nodes"
                            >
                                <ArrowDown size={8} className="mr-0.5" /> {stats.offlineNodes}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="h-6 w-px bg-border/50 hidden sm:block" />

            {/* Provisioned Links */}
            <div className="flex items-center gap-2.5 group">
                <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10 text-violet-500 cursor-pointer hover:bg-violet-500/20 transition-colors"
                    onClick={() => clearFilterField('linkStatus', 'links')}
                    title="Clear Link Status Filter"
                >
                    <Link2 size={16} />
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-black tracking-wider text-muted-foreground/70">Links</span>
                    <div className="flex items-center gap-1.5 h-5">
                        <span
                            className="text-lg font-black text-foreground cursor-pointer hover:text-primary transition-colors"
                            onClick={() => clearFilterField('linkStatus', 'links')}
                            title="Total Links"
                        >
                            {stats.totalLinks}
                        </span>
                        <div className="flex items-center gap-1 pl-1 border-l border-border/50">
                            <button
                                onClick={() => toggleFilter('linkStatus', 'UP', 'links')}
                                className="text-[10px] font-bold text-emerald-500 flex items-center hover:bg-emerald-500/10 rounded px-1 transition-colors"
                                title="Filter Online Links"
                            >
                                <ArrowUp size={8} className="mr-0.5" /> {stats.onlineLinks}
                            </button>
                            <button
                                onClick={() => toggleFilter('linkStatus', 'DOWN', 'links')}
                                className="text-[10px] font-bold text-rose-500 flex items-center hover:bg-rose-500/10 rounded px-1 transition-colors"
                                title="Filter Offline Links"
                            >
                                <ArrowDown size={8} className="mr-0.5" /> {stats.offlineLinks}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="h-6 w-px bg-border/50 hidden sm:block" />

            {/* Total Customers */}
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 shadow-sm border border-orange-500/10">
                    <Users size={18} />
                </div>
                <div className="flex flex-col justify-center">
                    <span className="text-[10px] uppercase font-black tracking-[0.1em] text-muted-foreground/60 leading-none mb-1">Customers</span>
                    <span className="text-2xl font-black text-foreground leading-none tracking-tighter">
                        {stats.totalCustomers}
                    </span>
                </div>
            </div>

            <div className="h-10 w-px bg-border/40 mx-2 hidden sm:block" />

            {/* Total Sites */}
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 shadow-sm border border-emerald-500/10">
                    <MapPin size={18} />
                </div>
                <div className="flex flex-col justify-center">
                    <span className="text-[10px] uppercase font-black tracking-[0.1em] text-muted-foreground/60 leading-none mb-1">Sites</span>
                    <span className="text-2xl font-black text-foreground leading-none tracking-tighter">
                        {stats.totalSites}
                    </span>
                </div>
            </div>
        </div>
    );
}
