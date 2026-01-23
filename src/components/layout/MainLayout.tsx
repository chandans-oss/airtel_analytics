import { ReactNode, useState } from 'react';
import { AppSidebar } from './AppSidebar';
import { Bell, User, Search } from 'lucide-react';
import { ThemeToggle } from '../ThemeToggle';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <AppSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-14 items-center justify-between border-b border-border bg-card/50 px-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search nodes, links, events..."
                className="h-9 w-80 rounded-lg border border-border bg-muted/50 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
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
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
