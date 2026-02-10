import { X, Filter, Trash2 } from 'lucide-react';
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

  if (filterEntries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-muted-foreground opacity-30 gap-2">
        <Filter size={24} />
        <p className="text-[10px] font-bold uppercase tracking-wider font-display">No Active Filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {filterEntries.map(({ field, value, type }) => (
          <div
            key={`${type || 'global'}-${field}-${value}`}
            className={cn(
              "group flex items-center gap-1.5 rounded-full pl-3 pr-1 py-1 text-[10px] font-bold uppercase tracking-tight border shadow-sm transition-all animate-in zoom-in-95 duration-200",
              type === 'nodes' ? "bg-blue-500/5 text-blue-500 border-blue-500/20 hover:border-blue-500/50" :
                type === 'links' ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/20 hover:border-emerald-500/50" :
                  "bg-primary/5 text-primary border-primary/20 hover:border-primary/50"
            )}
          >
            <span className="opacity-50">{field}:</span>
            <span className="font-bold">{value}</span>
            <button
              onClick={() => removeFilter(field, value, type)}
              className="ml-1 p-0.5 rounded-full hover:bg-foreground/10 transition-colors"
            >
              <X size={10} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => clearFilters()}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:bg-destructive/5 hover:text-destructive transition-all border border-transparent hover:border-destructive/20 font-display"
      >
        <Trash2 size={12} />
        Reset Environment
      </button>
    </div>
  );
}
