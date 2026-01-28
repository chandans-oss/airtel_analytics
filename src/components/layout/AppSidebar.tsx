import {
  LayoutDashboard,
  Database,
  Activity,
  Search,
  Settings,
  Link2,
  BarChart3,
  FileText,
  Radio,
  Cpu,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useInventoryStore } from '@/store/inventoryStore';
import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';

const dashboardSubModules = [
  { id: 'inventory', label: 'Inventory', icon: Cpu },
  { id: 'events', label: 'Events', icon: Activity },
  { id: 'discovery', label: 'Discovery & Change', icon: Search },
  { id: 'config', label: 'Config Mgmt', icon: Settings },
  { id: 'ra', label: 'RA', icon: FileText },
  { id: 'performance', label: 'Performance', icon: BarChart3 },
];

const mainModules = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/', hasChildren: true },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const location = useLocation();
  const { selectedModule, setSelectedModule } = useInventoryStore();
  const [dashboardExpanded, setDashboardExpanded] = useState(true);

  const isActive = (path: string) => location.pathname === path;
  const isModuleActive = (id: string) => selectedModule === id;

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-sidebar-border bg-gradient-sidebar transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4 overflow-hidden">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background shadow-sm border border-border/50">
          <img src="/airtel-logo-icon.svg" alt="Airtel Logo" className="h-6 w-6 object-contain" />
        </div>
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold uppercase tracking-tight text-muted-foreground/80 truncate font-display">
              Airtel Analytics
            </span>
            <span className="text-[10px] font-medium text-primary/70 leading-none font-display">
              by INFRAON
            </span>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={onToggle}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <PanelLeftClose size={18} />
          </button>
        )}
      </div>

      {collapsed && (
        <div className="flex items-center justify-center py-4 border-b border-sidebar-border/50 bg-background/20">
          <button
            onClick={onToggle}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <PanelLeft size={18} />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {mainModules.map((module) => (
          <div key={module.id}>
            {module.hasChildren ? (
              <>
                <button
                  onClick={() => {
                    setDashboardExpanded(!dashboardExpanded);
                    setSelectedModule('inventory');
                  }}
                  className={cn(
                    "sidebar-module w-full justify-between",
                    (isActive('/') || location.pathname.startsWith('/dashboard')) && "sidebar-module-active"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <module.icon size={18} />
                    {!collapsed && <span>{module.label}</span>}
                  </div>
                  {!collapsed && (
                    dashboardExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                  )}
                </button>

                {/* Sub-modules */}
                {dashboardExpanded && !collapsed && (
                  <div className="ml-4 mt-1 space-y-0.5 border-l border-sidebar-border pl-3">
                    {dashboardSubModules.map((sub) => (
                      <Link
                        key={sub.id}
                        to="/"
                        onClick={() => setSelectedModule(sub.id)}
                        className={cn(
                          "sidebar-module text-xs",
                          isModuleActive(sub.id) && "sidebar-module-active"
                        )}
                      >
                        <sub.icon size={14} />
                        <span>{sub.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                to={module.path}
                className={cn(
                  "sidebar-module",
                  isActive(module.path) && "sidebar-module-active"
                )}
              >
                <module.icon size={18} />
                {!collapsed && <span>{module.label}</span>}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3">
        <div className={cn(
          "flex items-center gap-3 rounded-lg bg-primary/10 p-3",
          collapsed && "justify-center p-2"
        )}>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
            <Radio size={14} className="text-primary pulse-live" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-xs font-medium text-primary">System Active</span>
              <span className="text-xs text-muted-foreground">All services online</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
