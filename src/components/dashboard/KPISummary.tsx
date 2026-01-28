import { useInventoryStore } from '@/store/inventoryStore';
import { KPICard } from './KPICard';
import {
  Server,
  Building2,
  MapPin,
  Link2,
  Wrench,
  Activity,
  Zap,
  TrendingUp,
  Percent,
  Users,
  Building
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function KPISummary() {
  const { getStats, addFilter, getFilteredNodes, getFilteredLinks } = useInventoryStore();
  const stats = getStats();
  const nodes = getFilteredNodes();
  const links = getFilteredLinks();

  const reachabilityScore = Math.round(
    ((stats.onlineNodes + stats.onlineLinks) / (stats.totalNodes + stats.totalLinks || 1)) * 100
  );

  const kpis = [
    {
      title: 'Active Nodes',
      value: stats.totalNodes,
      icon: Server,
      variant: 'online' as const,
      trend: 'up' as const,
      trendValue: '+2.4%',
      sparklineData: Array.from({ length: 10 }, () => ({ value: Math.floor(Math.random() * 20) + 80 })),
      onClick: () => addFilter('status', 'UP'),
      extra: (
        <div className="flex items-center gap-3 mt-1">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-black text-success">{stats.onlineNodes} UP</span>
            <div className="h-1 w-8 bg-success/20 rounded-full mt-0.5 overflow-hidden">
              <div className="h-full bg-success" style={{ width: `${(stats.onlineNodes / stats.totalNodes) * 100}%` }} />
            </div>
          </div>
          <div className="flex flex-col border-l border-border/50 pl-3">
            <span className="text-[10px] uppercase font-black text-destructive">{stats.offlineNodes} DOWN</span>
            <div className="h-1 w-8 bg-destructive/20 rounded-full mt-0.5 overflow-hidden">
              <div className="h-full bg-destructive" style={{ width: `${(stats.offlineNodes / (stats.totalNodes || 1)) * 100}%` }} />
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Provisioned Links',
      value: stats.totalLinks,
      icon: Link2,
      variant: 'online' as const,
      trend: 'up' as const,
      trendValue: '+0.8%',
      sparklineData: Array.from({ length: 10 }, () => ({ value: Math.floor(Math.random() * 20) + 80 })),
      onClick: () => addFilter('linkStatus', 'UP'),
      extra: (
        <div className="flex items-center gap-3 mt-1">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-black text-success">{stats.onlineLinks} UP</span>
            <div className="h-1 w-8 bg-success/20 rounded-full mt-0.5 overflow-hidden">
              <div className="h-full bg-success" style={{ width: `${(stats.onlineLinks / (stats.totalLinks || 1)) * 100}%` }} />
            </div>
          </div>
          <div className="flex flex-col border-l border-border/50 pl-3">
            <span className="text-[10px] uppercase font-black text-destructive">{stats.offlineLinks} DOWN</span>
            <div className="h-1 w-8 bg-destructive/20 rounded-full mt-0.5 overflow-hidden">
              <div className="h-full bg-destructive" style={{ width: `${(stats.offlineLinks / (stats.totalLinks || 1)) * 100}%` }} />
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      icon: Users,
      variant: 'neutral' as const,
      sparklineData: Array.from({ length: 10 }, () => ({ value: stats.totalCustomers })),
      extra: (
        <div className="text-[9px] font-bold text-muted-foreground uppercase mt-1">
          Registered Business Accounts
        </div>
      )
    },
    {
      title: 'Total Sites',
      value: stats.totalSites,
      icon: Building,
      variant: 'neutral' as const,
      sparklineData: Array.from({ length: 10 }, () => ({ value: stats.totalSites })),
      extra: (
        <div className="text-[9px] font-bold text-muted-foreground uppercase mt-1">
          Unique Geographic Sites
        </div>
      )
    },
    {
      title: 'Network Reachability',
      value: `${reachabilityScore}%`,
      icon: Activity,
      variant: (reachabilityScore > 90 ? 'online' : 'neutral') as 'online' | 'neutral',
      trendValue: reachabilityScore > 95 ? 'Stable' : 'Volatile',
      sparklineData: Array.from({ length: 10 }, () => ({ value: Math.floor(Math.random() * 10) + 90 })),
      extra: (
        <div className="flex items-center gap-1 mt-1">
          <TrendingUp size={10} className="text-success" />
          <span className="text-[9px] font-bold text-success uppercase">Optimal Range</span>
        </div>
      )
    },
    {
      title: 'Geographic Scale',
      value: stats.uniqueRegions.length,
      icon: MapPin,
      variant: 'neutral' as const,
      sparklineData: Array.from({ length: 10 }, () => ({ value: stats.uniqueRegions.length })),
      extra: (
        <div className="text-[9px] font-bold text-muted-foreground uppercase flex items-center gap-1.5 mt-1">
          <Building2 size={10} />
          <span>{stats.uniqueStates.length} Active States</span>
        </div>
      )
    },
    {
      title: 'Asset Diversity',
      value: stats.uniqueMakes.length,
      icon: Wrench,
      variant: 'neutral' as const,
      sparklineData: Array.from({ length: 10 }, () => ({ value: stats.uniqueMakes.length })),
      extra: (
        <div className="text-[9px] font-bold text-muted-foreground uppercase mt-1">
          Across {nodes.length} Physical Assets
        </div>
      )
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-7 items-stretch animate-in slide-in-from-top duration-700">
      {kpis.map((kpi) => (
        <KPICard key={kpi.title} {...kpi} />
      ))}
    </div>
  );
}

