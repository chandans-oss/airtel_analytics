import { ReactNode, useState } from 'react';
import { AppSidebar } from './AppSidebar';
import { ToolSidebar } from './ToolSidebar';
import { Bell, User, Search, SlidersHorizontal, LayoutDashboard } from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';
import { useInventoryStore } from '@/store/inventoryStore';
import { cn } from '@/lib/utils';

import { HeaderKPIs } from '../dashboard/HeaderKPIs';
import { InventorySidebar } from './InventorySidebar';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const {
    toolSidebarOpen,
    setToolSidebarOpen,
    inventorySidebarOpen,
    setInventorySidebarOpen,
    selectedModule
  } = useInventoryStore();

  const isToolModule = ['inventory', 'events', 'config'].includes(selectedModule);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <ToolSidebar />
      <InventorySidebar />

      <div className="flex flex-1 flex-col overflow-auto bg-background/50">
        {/* Top Header */}
        <header className="flex h-14 items-center justify-between border-b border-border bg-card/50 px-6 shrink-0 z-30 relative">
          <div className="flex items-center gap-4">
            {isToolModule && !toolSidebarOpen && (
              <button
                onClick={() => setToolSidebarOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all shadow-sm group"
                title="Configuration & Filters"
              >
                <SlidersHorizontal size={14} className="group-hover:rotate-180 transition-transform duration-500" />
              </button>
            )}

            {selectedModule === 'inventory' && !inventorySidebarOpen && (
              <button
                onClick={() => setInventorySidebarOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-all shadow-sm group"
                title="Inventory Dashboards"
              >
                <LayoutDashboard size={14} className="group-hover:scale-110 transition-transform" />
              </button>
            )}

            {/* KPI Header Stats (Replacing Search) */}
            <HeaderKPIs />
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <Bell size={18} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
            </button>
            <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/20">
                <User size={14} className="text-primary" />
              </div>
              <span className="text-sm font-medium">NOC Admin</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
