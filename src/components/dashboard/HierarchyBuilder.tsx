import { useMemo } from 'react';
import { GripVertical, X, Plus } from 'lucide-react';
import { useInventoryStore } from '@/store/inventoryStore';
import type { HierarchyLevel, NodeData } from '@/types/inventory';

const availableFields: { field: keyof NodeData; label: string }[] = [
  { field: 'status', label: 'Status' },
  { field: 'serviceFlavor', label: 'Service Flavour' },
  { field: 'make', label: 'Make' },
  { field: 'region', label: 'Region' },
  { field: 'scanType', label: 'Scan Type' },
];

export function HierarchyBuilder() {
  const { hierarchyLevels, setHierarchyLevels } = useInventoryStore();

  const unusedFields = useMemo(() => {
    const usedFields = new Set(hierarchyLevels.map((l) => l.field));
    return availableFields.filter((f) => !usedFields.has(f.field));
  }, [hierarchyLevels]);

  const removeLevel = (id: string) => {
    setHierarchyLevels(hierarchyLevels.filter((l) => l.id !== id));
  };

  const addLevel = (field: keyof NodeData, label: string) => {
    const newLevel: HierarchyLevel = {
      id: String(Date.now()),
      label,
      field,
    };
    setHierarchyLevels([...hierarchyLevels, newLevel]);
  };

  const moveLevel = (fromIndex: number, toIndex: number) => {
    const newLevels = [...hierarchyLevels];
    const [removed] = newLevels.splice(fromIndex, 1);
    newLevels.splice(toIndex, 0, removed);
    setHierarchyLevels(newLevels);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Hierarchy Builder</h3>
      </div>

      <div className="space-y-1">
        {hierarchyLevels.map((level, index) => (
          <div
            key={level.id}
            className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-2 py-1.5"
            draggable
            onDragStart={(e) => e.dataTransfer.setData('index', String(index))}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const fromIndex = parseInt(e.dataTransfer.getData('index'));
              moveLevel(fromIndex, index);
            }}
          >
            <GripVertical size={14} className="cursor-grab text-muted-foreground" />
            <span className="flex-1 text-sm">{level.label}</span>
            <button
              onClick={() => removeLevel(level.id)}
              className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>

      {unusedFields.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {unusedFields.map((field) => (
            <button
              key={field.field}
              onClick={() => addLevel(field.field, field.label)}
              className="flex items-center gap-1 rounded-md border border-dashed border-border px-2 py-1 text-xs text-muted-foreground hover:border-primary hover:text-primary"
            >
              <Plus size={10} />
              {field.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
