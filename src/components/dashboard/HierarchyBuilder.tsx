import { useMemo, useState } from 'react';
import { GripVertical, X, Plus, Info, Settings2, ExternalLink } from 'lucide-react';
import { useInventoryStore } from '@/store/inventoryStore';
import type { HierarchyLevel, NodeData, LinkData } from '@/types/inventory';
import { cn } from '@/lib/utils';

const nodeFields: { field: keyof NodeData; label: string }[] = [
  { field: 'state', label: 'State' },
  { field: 'make', label: 'Make' },
  { field: 'scanType', label: 'Scan Type' },
  { field: 'serviceFlavor', label: 'Service Flavor' },
  { field: 'deviceType', label: 'Device Type' },
  { field: 'status', label: 'Status' },
];

const linkFields: { field: keyof LinkData; label: string }[] = [
  { field: 'linkStatus', label: 'Status' },
  { field: 'serviceFlavor', label: 'Service Flavor' },
  { field: 'make', label: 'Make' },
  { field: 'region', label: 'Region' },
  { field: 'scanType', label: 'Scan Type' },
];

export function HierarchyBuilder() {
  const {
    nodeHierarchyLevels,
    linkHierarchyLevels,
    setNodeHierarchyLevels,
    setLinkHierarchyLevels,
    activeTopologyView,
    setActiveTopologyView
  } = useInventoryStore();

  const currentLevels = activeTopologyView === 'nodes' ? nodeHierarchyLevels : linkHierarchyLevels;
  const setLevels = activeTopologyView === 'nodes' ? setNodeHierarchyLevels : setLinkHierarchyLevels;
  const currentFields = activeTopologyView === 'nodes' ? nodeFields : linkFields;

  const unusedFields = useMemo(() => {
    const usedFields = new Set(currentLevels.map((l) => l.field));
    return currentFields.filter((f) => !usedFields.has(f.field as any));
  }, [currentLevels, activeTopologyView]);

  const removeLevel = (id: string) => {
    setLevels(currentLevels.filter((l) => l.id !== id));
  };

  const addLevel = (field: string, label: string) => {
    const newLevel: HierarchyLevel = {
      id: String(Date.now()),
      label,
      field: field as any,
    };
    setLevels([...currentLevels, newLevel]);
  };

  const moveLevel = (fromIndex: number, toIndex: number) => {
    const newLevels = [...currentLevels];
    const [removed] = newLevels.splice(fromIndex, 1);
    newLevels.splice(toIndex, 0, removed);
    setLevels(newLevels);
  };

  return (
    <div className="space-y-4 pt-2">
      {/* Toggle */}
      <div className="flex bg-muted/50 p-1 rounded-lg border border-border/50">
        <button
          onClick={() => setActiveTopologyView('nodes')}
          className={cn(
            "flex-1 px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-all flex items-center justify-center gap-1.5",
            activeTopologyView === 'nodes' ? "bg-emerald-500 text-white shadow-md" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Settings2 size={10} /> Nodes Path
        </button>
        <button
          onClick={() => setActiveTopologyView('links')}
          className={cn(
            "flex-1 px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-all flex items-center justify-center gap-1.5",
            activeTopologyView === 'links' ? "bg-emerald-500 text-white shadow-md" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <ExternalLink size={10} /> Links Path
        </button>
      </div>

      {/* Hierarchy Levels List */}
      <div className="space-y-2">
        {currentLevels.length === 0 && (
          <div className="text-center py-4 text-xs text-muted-foreground opacity-50 italic">
            No levels configured for {activeTopologyView}. Add from below.
          </div>
        )}
        {currentLevels.map((level, index) => (
          <div
            key={level.id}
            className={cn(
              "group flex items-center gap-3 rounded-xl border border-border bg-card/40 px-3 py-2.5 transition-all hover:border-primary/50",
              "cursor-move shadow-sm active:scale-95 duration-200"
            )}
            draggable
            onDragStart={(e) => e.dataTransfer.setData('index', String(index))}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const fromIndex = parseInt(e.dataTransfer.getData('index'));
              moveLevel(fromIndex, index);
            }}
          >
            <div className="flex h-6 w-6 items-center justify-center rounded bg-muted/50 text-muted-foreground group-hover:text-primary transition-colors">
              <GripVertical size={14} />
            </div>

            <div className="flex-1 flex flex-col">
              <span className="text-[10px] font-black uppercase opacity-40">{index + 1}. Level</span>
              <span className="text-xs font-bold">{level.label}</span>
            </div>

            <button
              onClick={() => removeLevel(level.id)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {unusedFields.length > 0 && (
        <div className="pt-2 border-t border-border/50">
          <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Available to Add</p>
          <div className="flex flex-wrap gap-1.5 text-center">
            {unusedFields.map((field) => (
              <button
                key={field.field}
                onClick={() => addLevel(field.field as string, field.label)}
                className="flex items-center gap-1.5 rounded-full border border-border bg-muted/20 px-3 py-1 text-[10px] font-bold text-muted-foreground hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all uppercase tracking-tighter"
              >
                <Plus size={10} />
                {field.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

