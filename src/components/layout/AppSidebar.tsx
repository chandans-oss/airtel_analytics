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
  PanelLeft,
  Signal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useInventoryStore } from '@/store/inventoryStore';
import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';

const dashboardSubModules = [
  { id: 'unified', label: 'Executive Overview', icon: LayoutDashboard },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: Database,
    children: [
      { id: 'links', label: 'Links Analysis', icon: Link2 },
      { id: 'nodes', label: 'Nodes Analysis', icon: Cpu },
    ]
  },
  { id: 'events', label: 'Events', icon: Activity },
  { id: 'discovery', label: 'Discovery & Change', icon: Search },
  { id: 'polling', label: 'Polling', icon: Signal },
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
  const { selectedModule, selectedSubModule, setSelectedModule, setSelectedSubModule } = useInventoryStore();
  const [dashboardExpanded, setDashboardExpanded] = useState(true);
  const [inventoryExpanded, setInventoryExpanded] = useState(true);

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
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-background shadow-sm border border-border/50 overflow-hidden">
          <img src="/infraon-logo.webp" alt="INFRAON Logo" className="h-full w-full object-cover" />
        </div>
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold uppercase tracking-tight text-muted-foreground/80 truncate font-display">
              INFRAON Analytics
            </span>
            <span className="text-[10px] font-medium text-primary/70 leading-none font-display">
              Data Insights Hub
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
                    setSelectedModule('unified');
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
                    {dashboardSubModules.map((sub: any) => {
                      const isModuleSelected = isModuleActive(sub.id);
                      const hasChildren = sub.children && sub.children.length > 0;

                      return (
                        <div key={sub.id} className="space-y-0.5">
                          {hasChildren ? (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedModule(sub.id);
                                  setSelectedSubModule('links'); // Default to links
                                  setInventoryExpanded(!inventoryExpanded);
                                }}
                                className={cn(
                                  "sidebar-module text-xs w-full justify-between transition-all duration-300",
                                  isModuleSelected && "sidebar-module-active font-bold"
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <sub.icon size={14} className={isModuleSelected ? "text-primary shadow-[0_0_8px_rgba(0,165,142,0.4)]" : "text-muted-foreground"} />
                                  <span>{sub.label}</span>
                                </div>
                                {inventoryExpanded ? (
                                  <ChevronDown size={12} className="opacity-50" />
                                ) : (
                                  <ChevronRight size={12} className="opacity-50" />
                                )}
                              </button>

                              {/* Nested Children */}
                              {inventoryExpanded && (
                                <div className="ml-3 mt-0.5 space-y-0.5 border-l border-primary/20 pl-3 animate-in slide-in-from-left-2 duration-300">
                                  {sub.children.map((child: any) => {
                                    const isChildActive = isModuleSelected && selectedSubModule === child.id;
                                    return (
                                      <Link
                                        key={child.id}
                                        to="/"
                                        onClick={() => {
                                          setSelectedModule(sub.id);
                                          setSelectedSubModule(child.id);
                                        }}
                                        className={cn(
                                          "sidebar-module text-[10px] py-1.5 transition-all duration-200 group/child flex items-center justify-between",
                                          isChildActive
                                            ? "text-primary font-black bg-primary/5"
                                            : "text-muted-foreground/80 hover:text-foreground hover:bg-muted/50"
                                        )}
                                      >
                                        <div className="flex items-center gap-2">
                                          <child.icon size={12} className={cn("transition-transform", isChildActive ? "scale-110" : "group-hover/child:scale-110")} />
                                          <span>{child.label}</span>
                                        </div>
                                        {isChildActive && (
                                          <div className="h-1 w-1 rounded-full bg-primary shadow-[0_0_4px_rgba(0,165,142,0.6)]" />
                                        )}
                                      </Link>
                                    );
                                  })}
                                </div>
                              )}
                            </>
                          ) : (
                            <Link
                              to="/"
                              onClick={() => setSelectedModule(sub.id)}
                              className={cn(
                                "sidebar-module text-xs",
                                isModuleSelected && "sidebar-module-active"
                              )}
                            >
                              <sub.icon size={14} />
                              <span>{sub.label}</span>
                            </Link>
                          )}
                        </div>
                      );
                    })}
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
