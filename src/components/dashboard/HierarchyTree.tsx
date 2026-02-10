import { useState, useMemo, useEffect } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  File,
  MoreHorizontal,
  Activity,
  Database,
  ExternalLink,
  Settings2,
  Zap,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useInventoryStore } from '@/store/inventoryStore';
import type { NodeData, HierarchyNode as HierarchyNodeType } from '@/types/inventory';

function buildHierarchy(
  nodes: NodeData[],
  levels: { field: string }[],
  currentLevel = 0
): any[] {
  if (currentLevel >= levels.length || nodes.length === 0) {
    return [];
  }

  const field = levels[currentLevel].field;
  const groups = new Map<string, NodeData[]>();

  nodes.forEach((node) => {
    const value = String((node as any)[field] || 'Unknown');
    if (!groups.has(value)) {
      groups.set(value, []);
    }
    groups.get(value)!.push(node);
  });

  return Array.from(groups.entries()).map(([name, items]) => ({
    name,
    value: items.length,
    field: field,
    children: buildHierarchy(items, levels, currentLevel + 1),
    items: currentLevel === levels.length - 1 ? items : undefined,
  })).sort((a, b) => b.value - a.value);
}

interface TreeNodeProps {
  node: any;
  level: number;
  onSelect: (field: string, value: string) => void;
}

function TreeNode({ node, level, onSelect }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(level < 1);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);
  const { setSelectedModule, addFilter } = useInventoryStore();

  const hasChildren = node.children && node.children.length > 0;

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="relative">
      {contextMenu && (
        <div
          className="fixed z-[100] w-64 bg-background border border-border shadow-2xl rounded-2xl overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <div className="px-4 py-2 border-b border-border/50 bg-primary/5 mb-2">
            <p className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
              <Settings2 size={10} />
              Node Context
            </p>
            <p className="text-xs font-bold text-foreground truncate mt-0.5">{node.name}</p>
          </div>

          <button
            onClick={() => {
              onSelect(node.field, node.name);
              setSelectedModule('events');
            }}
            className="w-full text-left px-4 py-3 text-xs hover:bg-primary hover:text-primary-foreground transition-all flex items-center gap-3 group"
          >
            <div className="p-1.5 rounded-lg bg-primary/10 group-hover:bg-white/20">
              <Activity size={14} className="text-primary group-hover:text-primary-foreground" />
            </div>
            <div>
              <p className="font-bold">Event Analysis</p>
              <p className="text-[9px] opacity-70">Check Probable Cause</p>
            </div>
          </button>

          <button
            onClick={() => {
              onSelect(node.field, node.name);
              setSelectedModule('config');
            }}
            className="w-full text-left px-4 py-3 text-xs hover:bg-blue-600 hover:text-white transition-all flex items-center gap-3 group"
          >
            <div className="p-1.5 rounded-lg bg-blue-500/10 group-hover:bg-white/20">
              <Database size={14} className="text-blue-500 group-hover:text-white" />
            </div>
            <div>
              <p className="font-bold">Config Issues</p>
              <p className="text-[9px] opacity-70">Download & Compliance</p>
            </div>
          </button>

          <div className="border-t border-border/50 mt-2 pt-2">
            <button
              onClick={() => addFilter(node.field, node.name)}
              className="w-full text-left px-4 py-2 text-xs hover:bg-muted text-muted-foreground flex items-center gap-3 group transition-colors"
            >
              <ExternalLink size={14} className="opacity-50 group-hover:opacity-100" />
              <span>Focus on this {node.field}</span>
            </button>
          </div>
        </div>
      )}

      <div
        className={cn(
          "flex items-center gap-3 px-4 py-3 cursor-pointer transition-all border-l-2",
          expanded ? "border-primary bg-primary/5 bg-gradient-to-r from-primary/10 to-transparent" : "border-transparent hover:bg-muted/50",
          level > 0 && "ml-4"
        )}
        onClick={() => {
          if (hasChildren) setExpanded(!expanded);
        }}
        onContextMenu={handleContextMenu}
      >
        <div className="flex h-5 w-5 items-center justify-center text-muted-foreground/50">
          {hasChildren ? (
            expanded ? <ChevronDown size={14} className="text-primary" /> : <ChevronRight size={14} />
          ) : (
            <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 ml-1" />
          )}
        </div>

        {hasChildren ? (
          <div className={cn("p-1.5 rounded-lg transition-colors", expanded ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground")}>
            <Folder size={14} />
          </div>
        ) : (
          <div className="p-1.5 rounded-lg bg-accent/10 text-accent-foreground">
            <File size={14} />
          </div>
        )}

        <div className="flex-1 flex flex-col">
          <span className={cn("text-xs transition-all", expanded ? "font-black text-foreground" : "font-bold text-muted-foreground")}>
            {node.name}
          </span>
          <span className="text-[9px] uppercase tracking-tighter opacity-40 font-black">{node.field}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-black text-muted-foreground shadow-sm">
            {node.value}
          </span>
          <button
            className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-muted transition-all"
            onClick={(e) => {
              e.stopPropagation();
              handleContextMenu(e as any);
            }}
          >
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>

      {expanded && hasChildren && (
        <div className="border-l border-border/50 ml-6 animate-in slide-in-from-top-2 duration-300">
          {node.children!.map((child: any, index: number) => (
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
    const levels = hierarchyLevels.map((l) => ({ field: l.field }));
    return buildHierarchy(nodes, levels);
  }, [nodes, hierarchyLevels]);

  const handleSelect = (field: string, value: string) => {
    addFilter(field, value);
  };

  if (nodes.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-muted-foreground opacity-30 gap-4">
        <Activity size={48} className="animate-pulse" />
        <p className="text-xs font-black uppercase tracking-widest">Awaiting Inventory Data</p>
      </div>
    );
  }

  return (
    <div className="space-y-0.5 py-2">
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
