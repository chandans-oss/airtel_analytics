import { useInventoryStore } from '@/store/inventoryStore';
import { KPICard } from './KPICard';
import {
  Server,
  CheckCircle,
  XCircle,
  Building2,
  MapPin,
  Link2,
  Unlink,
  Wrench
} from 'lucide-react';

export function KPISummary() {
  const { getStats, addFilter } = useInventoryStore();
  const stats = getStats();

  const kpis = [
    {
      title: 'Nodes',
      value: stats.totalNodes,
      icon: Server,
      variant: 'neutral' as const,
      onClick: () => addFilter('status', 'UP'),
      extra: (
        <div className="flex items-center gap-2 text-[10px] font-bold">
          <button
            onClick={(e) => { e.stopPropagation(); addFilter('status', 'UP'); }}
            className="text-success hover:underline hover:scale-105 transition-transform"
          >
            UP: {stats.onlineNodes}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); addFilter('status', 'DOWN'); }}
            className="text-destructive hover:underline hover:scale-105 transition-transform"
          >
            Down: {stats.offlineNodes}
          </button>
        </div>
      )
    },
    {
      title: 'Links',
      value: stats.totalLinks,
      icon: Link2,
      variant: 'neutral' as const,
      onClick: () => addFilter('linkStatus', 'UP'),
      extra: (
        <div className="flex items-center gap-2 text-[10px] font-bold">
          <button
            onClick={(e) => { e.stopPropagation(); addFilter('linkStatus', 'UP'); }}
            className="text-success hover:underline hover:scale-105 transition-transform"
          >
            UP: {stats.onlineLinks}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); addFilter('linkStatus', 'DOWN'); }}
            className="text-destructive hover:underline hover:scale-105 transition-transform"
          >
            Down: {stats.offlineLinks}
          </button>
        </div>
      )
    },
    {
      title: 'Device Makes',
      value: stats.uniqueMakes.length,
      icon: Wrench,
      variant: 'neutral' as const,
    },
    {
      title: 'Geographic Regions',
      value: stats.uniqueRegions.length,
      icon: MapPin,
      variant: 'neutral' as const,
    },
    {
      title: 'Active States',
      value: stats.uniqueStates.length,
      icon: Building2,
      variant: 'neutral' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 items-stretch">
      {kpis.map((kpi) => (
        <KPICard key={kpi.title} {...kpi} />
      ))}
    </div>
  );
}
