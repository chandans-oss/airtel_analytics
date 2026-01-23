import { useInventoryStore } from '@/store/inventoryStore';
import { KPISummary } from './KPISummary';
import { HierarchyBuilder } from './HierarchyBuilder';
import { HierarchyTree } from './HierarchyTree';
import { ActiveFilters } from './ActiveFilters';
import {
  DynamicDistributionChart,
  StateTreemap,
  LinkStatusChart,
} from './DistributionCharts';
import { Link } from 'react-router-dom';
import { Upload, Database, Play } from 'lucide-react';
import { useDemoData } from '@/hooks/useDemoData';
import { DataSidebar } from './DataSidebar';
import { DrilldownHierarchy } from './DrilldownHierarchy';
import { InterdependentAnalytics } from './InterdependentAnalytics';

export function InventoryDashboard() {
  const { nodes, links, hierarchyLevels } = useInventoryStore();
  const { loadDemoData, isLoading } = useDemoData();
  const hasData = nodes.length > 0 || links.length > 0;

  if (!hasData) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
          <Database size={40} className="text-primary" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold">Initializing Dashboard</h2>
          <p className="mt-2 text-muted-foreground">
            Please ensure <code className="bg-muted px-1.5 py-0.5 rounded text-primary">Airtel Data.xlsx</code> is present in the <code className="bg-muted px-1.5 py-0.5 rounded text-primary">public/data/</code> folder.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Detail Sidebar */}
      <DataSidebar />

      {/* Active Filters */}
      <ActiveFilters />

      {/* KPI Summary */}
      <KPISummary />

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Panel - Hierarchy */}
        <div className="col-span-12 space-y-4 lg:col-span-3">
          <div className="rounded-lg border border-border bg-card p-4">
            <HierarchyBuilder />
          </div>
        </div>

        {/* Right Panel - Charts */}
        <div className="col-span-12 lg:col-span-9">
          <div className="mb-6">
            <DrilldownHierarchy />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {hierarchyLevels.map((level) => (
              <DynamicDistributionChart
                key={level.id}
                field={level.field}
                label={level.label}
              />
            ))}
            <LinkStatusChart />
          </div>

          {/* Treemap - Full Width for Geographical Distribution */}
          <div className="mt-4">
            <StateTreemap />
          </div>

        </div>
      </div>

      {/* Interdependent Business Intelligence Section - Full Width */}
      <InterdependentAnalytics />
    </div>
  );
}
