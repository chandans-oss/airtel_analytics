import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useInventoryStore } from '@/store/inventoryStore';

import { Database, Activity, FileText, ChevronLeft, Map as MapIcon, Table as TableIcon, Download } from 'lucide-react';
import { DataSidebar } from './DataSidebar';
import { DrilldownHierarchy } from './DrilldownHierarchy';
import { InterdependentAnalytics } from './InterdependentAnalytics';
import { DataTable } from './DataTable';
import { ProbableCauseAnalytics } from './ProbableCauseAnalytics';
import { ConfigDownloadAnalytics } from './ConfigDownloadAnalytics';
import {
  InventoryOpsModule,
  InventoryBusinessModule,
  InventoryGeographyModule,
  InventoryTechModule,
  InventoryLifeCycleModule
} from './InventorySpecializedDashboards';


export type DashboardView = 'inventory' | 'events' | 'config' | 'filteredEvents' | 'filteredConfig';

export function InventoryDashboard() {
  const {
    nodes,
    links,
    hierarchyLevels,
    selectedModule,
    selectedSubModule,
    setSelectedModule,
    showTable,
    setShowTable,
    activeTopologyView,
    setActiveTopologyView
  } = useInventoryStore();
  const [tableType, setTableType] = useState<'nodes' | 'links'>('nodes');

  const hasData = nodes.length > 0 || links.length > 0;

  if (!hasData) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
          <Database size={40} className="text-primary" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold">Initializing Unified Dashboard</h2>
          <p className="mt-2 text-muted-foreground">
            Loading Airtel Network Inventory & Events data...
          </p>
        </div>
      </div>
    );
  }

  const renderActiveModule = () => {
    switch (selectedModule) {
      case 'events':
        return <ProbableCauseAnalytics />;
      case 'filteredEvents':
        return <ProbableCauseAnalytics filteredContext={true} />;
      case 'config':
        return <ConfigDownloadAnalytics />;
      case 'filteredConfig':
        return <ConfigDownloadAnalytics filteredContext={true} />;
      default:
        // Handle Inventory Sub-modules
        if (selectedModule === 'inventory') {
          switch (selectedSubModule) {
            case 'ops': return <InventoryOpsModule />;
            case 'business': return <InventoryBusinessModule />;
            case 'geography': return <InventoryGeographyModule />;
            case 'tech': return <InventoryTechModule />;
            case 'lifecycle': return <InventoryLifeCycleModule />;
            default:
              return (
                <div className="flex flex-col gap-4">
                  {/* Row 0: Interdependent Business Intelligence (Moved to Top) */}
                  <div className="w-full">
                    <InterdependentAnalytics />
                  </div>

                  {/* Row 1: Network Topology Explorer (Full Width) */}
                  <div className="w-full">
                    <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-md p-6 shadow-xl min-h-[600px] flex flex-col">
                      <div className="pr-2 flex-1">
                        <DrilldownHierarchy entityType={activeTopologyView} setEntityType={setActiveTopologyView} />
                      </div>
                    </div>
                  </div>
                </div>
              );
          }
        }
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-2 pb-8 animate-in fade-in duration-700">
      {/* Detail Sidebar */}
      <DataSidebar />

      {/* Top Header Section */}
      <div className="hidden flex-col md:flex-row md:items-center justify-between gap-2 px-1">
        <div />

        <div className="flex items-center gap-3">
        </div>
      </div>

      {/* KPI Section - Only show on main inventory page */}

      <div className="w-full">
        {renderActiveModule()}
      </div>


      {/* Expandable Data Table */}
      {showTable && (
        <div className="col-span-12 rounded-2xl border border-border bg-card/20 shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-500 backdrop-blur-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-muted/10">
            <div className="flex gap-6">
              <button
                onClick={() => setTableType('nodes')}
                className={cn(
                  "relative py-1 text-[10px] font-black uppercase tracking-widest transition-all",
                  tableType === 'nodes' ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Node Details
                {tableType === 'nodes' && <div className="absolute -bottom-4 left-0 right-0 h-1 bg-primary rounded-full" />}
              </button>
              <button
                onClick={() => setTableType('links')}
                className={cn(
                  "relative py-1 text-[10px] font-black uppercase tracking-widest transition-all",
                  tableType === 'links' ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                Link Details
                {tableType === 'links' && <div className="absolute -bottom-4 left-0 right-0 h-1 bg-primary rounded-full" />}
              </button>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 text-[9px] px-4 py-2 rounded-lg bg-primary/10 text-primary uppercase font-black hover:bg-primary/20 transition-all border border-primary/20 shadow-sm">
                <Download size={12} />
                Export Dataset (CSV)
              </button>
            </div>
          </div>
          <div className="p-4">
            <DataTable type={tableType} />
          </div>
        </div>
      )}
    </div>
  );
}



