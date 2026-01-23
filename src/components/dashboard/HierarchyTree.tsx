import { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, Folder, File } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useInventoryStore } from '@/store/inventoryStore';
import type { NodeData, HierarchyNode as HierarchyNodeType } from '@/types/inventory';

function buildHierarchy(
  nodes: NodeData[],
  levels: { field: keyof NodeData }[],
  currentLevel = 0
): HierarchyNodeType[] {
  if (currentLevel >= levels.length || nodes.length === 0) {
    return [];
  }

  const field = levels[currentLevel].field;
  const groups = new Map<string, NodeData[]>();

  nodes.forEach((node) => {
    const value = String(node[field] || 'Unknown');
    if (!groups.has(value)) {
      groups.set(value, []);
    }
    groups.get(value)!.push(node);
  });

  return Array.from(groups.entries()).map(([name, items]) => ({
    name,
    value: items.length,
    field: field as string,
    children: buildHierarchy(items, levels, currentLevel + 1),
    items: currentLevel === levels.length - 1 ? items : undefined,
  }));
}

interface TreeNodeProps {
  node: HierarchyNodeType;
  level: number;
  onSelect: (field: string, value: string) => void;
}

function TreeNode({ node, level, onSelect }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(level < 2);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <div
        className={cn(
          'hierarchy-node',
          'group'
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => {
          if (hasChildren) setExpanded(!expanded);
          onSelect(node.field, node.name);
        }}
      >
        <span className="flex h-4 w-4 items-center justify-center text-muted-foreground">
          {hasChildren ? (
            expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : (
            <File size={12} />
          )}
        </span>
        {hasChildren && <Folder size={14} className="text-primary/70" />}
        <span className="flex-1 truncate">{node.name}</span>
        <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
          {node.value}
        </span>
      </div>

      {expanded && hasChildren && (
        <div>
          {node.children!.map((child, index) => (
            <TreeNode
              key={`${child.name}-${index}`}
              node={child}
              level={level + 1}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function HierarchyTree() {
  const { nodes, hierarchyLevels, addFilter } = useInventoryStore();

  const hierarchy = useMemo(() => {
    const levels = hierarchyLevels.map((l) => ({ field: l.field as keyof NodeData }));
    return buildHierarchy(nodes, levels);
  }, [nodes, hierarchyLevels]);

  const handleSelect = (field: string, value: string) => {
    addFilter(field, value);
  };

  if (nodes.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <p className="text-sm">No data loaded. Upload inventory files to see hierarchy.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {hierarchy.map((node, index) => (
        <TreeNode
          key={`${node.name}-${index}`}
          node={node}
          level={0}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
}
