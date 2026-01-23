import { X } from 'lucide-react';
import { useInventoryStore } from '@/store/inventoryStore';
import { cn } from '@/lib/utils';

export function ActiveFilters() {
  const { activeFilters, nodeFilters, linkFilters, removeFilter, clearFilters } = useInventoryStore();

  const filterEntries = [
    ...Object.entries(activeFilters).flatMap(([field, values]) =>
      values.map((value) => ({ field, value, type: undefined as any }))
    ),
    ...Object.entries(nodeFilters).flatMap(([field, values]) =>
      values.map((value) => ({ field, value, type: 'nodes' as const }))
    ),
    ...Object.entries(linkFilters).flatMap(([field, values]) =>
      values.map((value) => ({ field, value, type: 'links' as const }))
    )
  ];

  if (filterEntries.length === 0) return null;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
      <span className="text-xs font-medium text-muted-foreground">Active Filters:</span>
      <div className="flex flex-wrap gap-1">
        {filterEntries.map(({ field, value, type }) => (
          <span
            key={`${type || 'global'}-${field}-${value}`}
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium border",
              type === 'nodes' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                type === 'links' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                  "bg-primary/10 text-primary border-primary/20"
            )}
          >
            <span className="opacity-70">{type ? `${type}: ` : ''}{field}:</span>
            {value}
            <button
              onClick={() => removeFilter(field, value, type)}
              className="ml-0.5 hover:text-destructive transition-colors"
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <button
        onClick={() => clearFilters()}
        className="ml-2 text-xs text-muted-foreground hover:text-foreground font-medium"
      >
        Clear all
      </button>
    </div>
  );
}
