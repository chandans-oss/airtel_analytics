import { InventoryDashboard } from '@/components/dashboard/InventoryDashboard';
import { EventsDashboard } from '@/components/dashboard/EventsDashboard';
import { RADashboard } from '@/components/dashboard/RADashboard';

import { DiscoveryDashboard } from '@/components/dashboard/DiscoveryDashboard';
import { PerformanceDashboard } from '@/components/dashboard/PerformanceDashboard';
import { UnifiedMainDashboard } from '@/components/dashboard/UnifiedMainDashboard';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProcessingOverlay } from '@/components/data/ProcessingOverlay';
import { useInventoryStore } from '@/store/inventoryStore';
import { useDataInitialization } from '@/hooks/useDataInitialization';

const Index = () => {
  const { isProcessing, selectedModule } = useInventoryStore();
  useDataInitialization();

  const renderContent = () => {
    if (selectedModule === 'unified') {
      return <UnifiedMainDashboard />;
    }

    if (['inventory', 'events', 'config', 'filteredEvents', 'filteredConfig'].includes(selectedModule)) {
      return <InventoryDashboard />;
    }

    if (selectedModule === 'ra') {
      return <RADashboard />;
    }

    if (selectedModule === 'discovery') {
      return <DiscoveryDashboard />;
    }

    if (selectedModule === 'performance') {
      return <PerformanceDashboard />;
    }

    return (
      <div className="flex h-[70vh] flex-col items-center justify-center p-8 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
        <h2 className="mb-2 text-2xl font-bold tracking-tight">Module Under Construction</h2>
        <p className="max-w-md text-muted-foreground mb-6">
          The <span className="font-semibold text-primary capitalize">{selectedModule}</span> analytics module is currently being optimized for NOC performance.
        </p>
        <button
          onClick={() => useInventoryStore.getState().setSelectedModule('inventory')}
          className="flex items-center gap-2 px-6 py-2 rounded-xl bg-primary text-primary-foreground font-bold hover:shadow-lg transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          Back to Dashboard
        </button>
      </div>
    );
  };

  return (
    <MainLayout>
      {isProcessing && <ProcessingOverlay />}
      {renderContent()}
    </MainLayout>
  );
};

export default Index;
