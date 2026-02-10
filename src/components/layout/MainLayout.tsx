import { ReactNode, useState } from 'react';
import { AppSidebar } from './AppSidebar';
import { ToolSidebar } from './ToolSidebar';
import { User, SlidersHorizontal, LayoutGrid, Network, Sun, Moon } from 'lucide-react';
import { useInventoryStore } from '@/store/inventoryStore';
import { cn } from '@/lib/utils';
import { useTheme } from '@/components/theme-provider';

import { HeaderKPIs } from '../dashboard/HeaderKPIs';


interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { theme, setTheme } = useTheme();
  const {
    toolSidebarOpen,
    setToolSidebarOpen,
    selectedModule,
    showNetworkMetrics,
    showAppMetrics,
    toggleNetworkMetrics,
    toggleAppMetrics
  } = useInventoryStore();

  const isToolModule = ['inventory', 'events', 'config'].includes(selectedModule);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <ToolSidebar />

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



            {/* KPI Header Stats (Replacing Search) */}
            <HeaderKPIs />
          </div>

          <div className="flex items-center gap-4">
            {/* Network Toggle */}
            <div
              className="flex items-center gap-2 cursor-pointer group select-none"
              onClick={toggleNetworkMetrics}
              title="Toggle Network Metrics"
            >
              <div className={cn(
                "w-9 h-5 rounded-full relative transition-colors duration-300 shadow-inner",
                showNetworkMetrics ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"
              )}>
                <div className={cn(
                  "absolute top-1 left-1 bg-white h-3 w-3 rounded-full shadow-sm transition-all duration-300",
                  showNetworkMetrics ? "translate-x-4" : "translate-x-0"
                )} />
              </div>
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest transition-colors",
                showNetworkMetrics ? "text-emerald-600" : "text-muted-foreground"
              )}>
                Network
              </span>
            </div>

            {/* App Toggle */}
            <div
              className="flex items-center gap-2 cursor-pointer group select-none ml-2"
              onClick={toggleAppMetrics}
              title="Toggle Application Metrics"
            >
              <div className={cn(
                "w-9 h-5 rounded-full relative transition-colors duration-300 shadow-inner",
                showAppMetrics ? "bg-sky-500" : "bg-slate-200 dark:bg-slate-700"
              )}>
                <div className={cn(
                  "absolute top-1 left-1 bg-white h-3 w-3 rounded-full shadow-sm transition-all duration-300",
                  showAppMetrics ? "translate-x-4" : "translate-x-0"
                )} />
              </div>
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest transition-colors",
                showAppMetrics ? "text-sky-600" : "text-muted-foreground"
              )}>
                Application
              </span>
            </div>

            {/* Theme Toggle (Icon only) */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl transition-all ml-2",
                theme === 'dark'
                  ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20"
                  : "bg-primary/5 text-primary border border-primary/20 hover:bg-primary/10"
              )}
              title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {theme === 'dark' ? <Sun size={18} strokeWidth={2.5} /> : <Moon size={18} strokeWidth={2.5} />}
            </button>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors" title="NOC Admin">
              <User size={16} />
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
