import { cn } from '@/lib/utils';
import { useInventoryStore } from '@/store/inventoryStore';
import {
    LayoutDashboard,
    Activity,
    ShieldCheck,
    Map,
    Users,
    Cpu,
    Zap,
    ChevronLeft,
    TrendingUp,
    Link2,
    BarChart3
} from 'lucide-react';

const inventorySubModules = [
    { id: 'links', label: 'Links Analysis', icon: Link2 },
    { id: 'nodes', label: 'Nodes Analysis', icon: Cpu },
];

export function InventorySidebar() {
    const {
        selectedModule,
        selectedSubModule,
        setSelectedSubModule,
        inventorySidebarOpen,
        setInventorySidebarOpen
    } = useInventoryStore();

    if (selectedModule !== 'inventory') return null;

    return (
        <aside
            className={cn(
                "flex flex-col border-r border-border bg-card/10 backdrop-blur-md transition-all duration-500 ease-in-out relative shrink-0",
                inventorySidebarOpen ? "w-64" : "w-0 overflow-hidden opacity-0 pointer-events-none"
            )}
        >
            <div className="flex h-14 items-center justify-between px-5 border-b border-border/50 shrink-0">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                        <Zap size={14} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.1em] text-foreground font-display">Dashboards</span>
                </div>
                <button
                    onClick={() => setInventorySidebarOpen(false)}
                    className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-all"
                >
                    <ChevronLeft size={16} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
                {inventorySubModules.map((sub) => {
                    const isActive = selectedSubModule === sub.id;
                    return (
                        <button
                            key={sub.id}
                            onClick={() => setSelectedSubModule(sub.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group",
                                isActive
                                    ? "bg-primary/10 text-primary shadow-sm border border-primary/20"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
                            )}
                        >
                            <sub.icon size={16} className={cn("transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")} />
                            <span className={cn("text-xs font-bold transition-colors", isActive ? "text-foreground" : "")}>
                                {sub.label}
                            </span>
                            {isActive && (
                                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(0,165,142,0.6)]" />
                            )}
                        </button>
                    );
                })}
            </div>
        </aside>
    );
}
