import { useState, useMemo } from 'react';
import {
  ChevronUp,
  ChevronDown,
  Download,
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useInventoryStore } from '@/store/inventoryStore';
import { cn } from '@/lib/utils';
import type { NodeData, LinkData } from '@/types/inventory';

type SortDirection = 'asc' | 'desc' | null;

interface DataTableProps {
  type: 'nodes' | 'links';
}

export function DataTable({ type }: DataTableProps) {
  const { getFilteredNodes, getFilteredLinks } = useInventoryStore();
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const data = type === 'nodes' ? getFilteredNodes() : getFilteredLinks();
  const columns = type === 'nodes'
    ? ['deviceName', 'status', 'loopbackIP', 'make', 'model', 'deviceType', 'scanType', 'serviceFlavor']
    : ['customerCode', 'loopbackIP', 'region', 'state', 'serviceFlavor', 'linkStatus', 'bandwidth'];

  const columnLabels: Record<string, string> = {
    deviceName: 'Device Name',
    status: 'Status',
    loopbackIP: 'Loopback IP',
    make: 'Make',
    model: 'Model',
    deviceType: 'Device Type',
    scanType: 'Scan Type',
    customerCode: 'Customer Code',
    region: 'Region',
    state: 'State',
    serviceFlavor: 'Service Flavor',
    linkStatus: 'Link Status',
    bandwidth: 'Bandwidth (Mbps)',
  };

  const filteredData = useMemo(() => {
    let result = [...data];

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter((item) =>
        Object.values(item).some((value) =>
          String(value).toLowerCase().includes(lowerSearch)
        )
      );
    }

    if (sortField && sortDirection) {
      result.sort((a, b) => {
        const aValue = (a as unknown as Record<string, unknown>)[sortField];
        const bValue = (b as unknown as Record<string, unknown>)[sortField];
        const comparison = String(aValue).localeCompare(String(bValue));
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [data, searchTerm, sortField, sortDirection]);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / pageSize);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(
        sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? null : 'asc'
      );
      if (sortDirection === 'desc') setSortField(null);
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const exportCSV = () => {
    const headers = columns.map((col) => columnLabels[col] || col).join(',');
    const rows = filteredData.map((item) =>
      columns.map((col) => `"${(item as unknown as Record<string, unknown>)[col] || ''}"`).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}_export.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (data.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <h3 className="font-medium">
          {type === 'nodes' ? 'Node Inventory' : 'Link Inventory'}
          <span className="ml-2 text-sm text-muted-foreground">
            ({filteredData.length} records)
          </span>
        </h3>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="h-8 w-48 rounded-md border border-border bg-muted/50 pl-8 pr-3 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <button
            onClick={exportCSV}
            className="flex h-8 items-center gap-1.5 rounded-md border border-border bg-muted/50 px-3 text-sm text-muted-foreground hover:text-foreground"
          >
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {columns.map((col) => (
                <th
                  key={col}
                  onClick={() => handleSort(col)}
                  className="cursor-pointer whitespace-nowrap px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground"
                >
                  <div className="flex items-center gap-1">
                    {columnLabels[col] || col}
                    {sortField === col && (
                      sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <tr
                key={index}
                className="border-b border-border/50 hover:bg-muted/30"
              >
                {columns.map((col) => {
                  const value = (item as unknown as Record<string, unknown>)[col];
                  const isStatus = col === 'status' || col === 'linkStatus';
                  const isUp = String(value).toUpperCase() === 'UP';

                  return (
                    <td key={col} className="whitespace-nowrap px-4 py-3 text-sm">
                      {isStatus ? (
                        <span className={cn(
                          isUp ? 'status-online' : 'status-offline'
                        )}>
                          <span className={cn(
                            'h-1.5 w-1.5 rounded-full',
                            isUp ? 'bg-success' : 'bg-destructive'
                          )} />
                          {isUp ? 'UP' : 'DOWN'}
                        </span>
                      ) : (
                        String(value || '-')
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-border p-3">
        <p className="text-sm text-muted-foreground">
          Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length}
        </p>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <ChevronLeft size={16} />
          </button>

          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
            if (page > totalPages) return null;
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-md text-sm',
                  currentPage === page
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border text-muted-foreground hover:text-foreground'
                )}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground disabled:opacity-50"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
