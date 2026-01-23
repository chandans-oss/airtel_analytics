import { create } from 'zustand';
import type {
  NodeData,
  LinkData,
  InventoryStats,
  FilterState,
  HierarchyLevel,
  UploadedFile,
  DataCategory,
  EventData,
  RAInventoryData,
  ConfigCalendarData,
  ConfigFailureData,
  CustomerData,
  WidgetConfig,
  ChartType
} from '@/types/inventory';

interface InventoryState {
  // Data
  nodes: NodeData[];
  links: LinkData[];
  activeEvents: EventData[];
  allEvents: EventData[];
  raInventory: RAInventoryData[];
  configCalendar: ConfigCalendarData[];
  configFailure: ConfigFailureData[];
  customers: CustomerData[];
  uploadedFiles: UploadedFile[];

  // UI State
  isProcessing: boolean;
  activeFilters: FilterState; // Kept for backward compatibility if needed, but we'll use node/link filters
  nodeFilters: FilterState;
  linkFilters: FilterState;
  hierarchyLevels: HierarchyLevel[];
  widgetConfigs: Record<string, WidgetConfig>;
  selectedModule: string;
  sidebarOpen: boolean;

  // Actions
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setNodes: (nodes: NodeData[]) => void;
  setLinks: (links: LinkData[]) => void;
  setActiveEvents: (events: EventData[]) => void;
  setAllEvents: (events: EventData[]) => void;
  setRAInventory: (ra: RAInventoryData[]) => void;
  setConfigCalendar: (config: ConfigCalendarData[]) => void;
  setConfigFailure: (config: ConfigFailureData[]) => void;
  setCustomers: (customers: CustomerData[]) => void;
  addUploadedFile: (file: UploadedFile) => void;
  setIsProcessing: (processing: boolean) => void;
  setActiveFilters: (filters: FilterState) => void;
  setNodeFilters: (filters: FilterState) => void;
  setLinkFilters: (filters: FilterState) => void;
  addFilter: (field: string, value: string, type?: 'nodes' | 'links') => void;
  toggleFilter: (field: string, value: string, type?: 'nodes' | 'links') => void;
  removeFilter: (field: string, value: string, type?: 'nodes' | 'links') => void;
  clearFilters: (type?: 'nodes' | 'links') => void;
  setHierarchyLevels: (levels: HierarchyLevel[]) => void;
  updateWidgetConfig: (id: string, config: Partial<WidgetConfig>) => void;
  setSelectedModule: (module: string) => void;

  // Computed
  getStats: () => InventoryStats;
  getFilteredNodes: () => NodeData[];
  getFilteredLinks: () => LinkData[];
  getFilteredNodesExcluding: (excludeField?: string) => NodeData[];
  getFilteredLinksExcluding: (excludeField?: string) => LinkData[];
}

const defaultHierarchyLevels: HierarchyLevel[] = [
  {
    id: 'status',
    label: 'Status',
    field: 'status',
    linkField: 'linkStatus',
    expectedValues: ['UP', 'DOWN']
  },
  {
    id: 'flavor',
    label: 'Service Flavour',
    field: 'serviceFlavor',
    linkField: 'serviceFlavor',
    expectedValues: ['Fully Managed', 'Partially Managed']
  },
  {
    id: 'make',
    label: 'Make',
    field: 'make',
    linkField: 'make',
    expectedValues: ['Cisco', 'Fortinet', 'Huawei', 'Others']
  },
  {
    id: 'region',
    label: 'Region',
    field: 'region',
    linkField: 'region',
    expectedValues: ['North', 'South', 'East', 'West']
  },
  {
    id: 'scanType',
    label: 'Scan Type',
    field: 'scanType',
    linkField: 'scanType',
    expectedValues: ['SNMP', 'ICMP']
  },
];

export const useInventoryStore = create<InventoryState>((set, get) => ({
  nodes: [],
  links: [],
  activeEvents: [],
  allEvents: [],
  raInventory: [],
  configCalendar: [],
  configFailure: [],
  customers: [],
  uploadedFiles: [],
  isProcessing: false,
  activeFilters: {},
  nodeFilters: {},
  linkFilters: {},
  hierarchyLevels: defaultHierarchyLevels,
  widgetConfigs: {},
  selectedModule: 'inventory',
  sidebarOpen: false,

  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setNodes: (nodes) => set({ nodes }),
  setLinks: (links) => set({ links }),
  setActiveEvents: (activeEvents) => set({ activeEvents }),
  setAllEvents: (allEvents) => set({ allEvents }),
  setRAInventory: (raInventory) => set({ raInventory }),
  setConfigCalendar: (configCalendar) => set({ configCalendar }),
  setConfigFailure: (configFailure) => set({ configFailure }),
  setCustomers: (customers) => set({ customers }),
  addUploadedFile: (file) => set((state) => ({
    uploadedFiles: [...state.uploadedFiles, file]
  })),
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  setActiveFilters: (activeFilters) => set({ activeFilters }),
  setNodeFilters: (nodeFilters) => set({ nodeFilters }),
  setLinkFilters: (linkFilters) => set({ linkFilters }),

  addFilter: (field, value, type) => set((state) => {
    const filterKey = type === 'links' ? 'linkFilters' : (type === 'nodes' ? 'nodeFilters' : 'activeFilters');
    const currentFilters = state[filterKey];
    const currentValues = currentFilters[field] || [];
    if (currentValues.includes(value)) return state;
    return {
      [filterKey]: {
        ...currentFilters,
        [field]: [...currentValues, value],
      },
    };
  }),

  toggleFilter: (field, value, type) => {
    const { nodeFilters, linkFilters, activeFilters, addFilter, removeFilter } = get();
    const currentFilters = type === 'links' ? linkFilters : (type === 'nodes' ? nodeFilters : activeFilters);
    const currentValues = currentFilters[field] || [];
    if (currentValues.includes(value)) {
      removeFilter(field, value, type);
    } else {
      addFilter(field, value, type);
    }
  },

  removeFilter: (field, value, type) => set((state) => {
    const filterKey = type === 'links' ? 'linkFilters' : (type === 'nodes' ? 'nodeFilters' : 'activeFilters');
    const currentFilters = state[filterKey];
    const currentValues = currentFilters[field] || [];
    const newValues = currentValues.filter((v) => v !== value);
    const newFilters = { ...currentFilters };
    if (newValues.length === 0) {
      delete newFilters[field];
    } else {
      newFilters[field] = newValues;
    }
    return { [filterKey]: newFilters };
  }),

  clearFilters: (type) => {
    if (type === 'nodes') set({ nodeFilters: {} });
    else if (type === 'links') set({ linkFilters: {} });
    else set({ activeFilters: {}, nodeFilters: {}, linkFilters: {}, sidebarOpen: false });
  },
  setHierarchyLevels: (hierarchyLevels) => set({ hierarchyLevels }),
  updateWidgetConfig: (id, config) => set((state) => ({
    widgetConfigs: {
      ...state.widgetConfigs,
      [id]: { ...(state.widgetConfigs[id] || { id, title: id, chartType: 'pie', timeframe: '1h' }), ...config }
    }
  })),
  setSelectedModule: (selectedModule) => set({ selectedModule }),

  getStats: () => {
    const { nodes, links } = get();
    const onlineNodes = nodes.filter((n) => n.status === 'UP').length;
    const onlineLinks = links.filter((l) => l.linkStatus === 'UP').length;

    const nodeLoopbacks = new Set(nodes.map((n) => n.loopbackIP));
    const linkLoopbacks = new Set(links.map((l) => l.loopbackIP));
    const linkedNodes = nodes.filter((n) => linkLoopbacks.has(n.loopbackIP)).length;

    return {
      totalNodes: nodes.length,
      onlineNodes,
      offlineNodes: nodes.length - onlineNodes,
      totalLinks: links.length,
      onlineLinks,
      offlineLinks: links.length - onlineLinks,
      uniqueMakes: [...new Set(nodes.map((n) => n.make).filter(Boolean))],
      uniqueRegions: [...new Set(links.map((l) => l.region).filter(Boolean))],
      uniqueStates: [...new Set(links.map((l) => l.state).filter(Boolean))],
      uniqueServiceFlavors: [...new Set(links.map((l) => l.serviceFlavor).filter(Boolean))],
      linkedNodes,
      unlinkedNodes: nodes.length - linkedNodes,
      activeEventsCount: get().activeEvents.length,
    };
  },

  getFilteredNodes: () => {
    const { nodes, nodeFilters } = get();
    if (Object.keys(nodeFilters).length === 0) return nodes;

    return nodes.filter((node) => {
      return Object.entries(nodeFilters).every(([field, values]) => {
        const nodeValue = node[field as keyof NodeData];
        return values.includes(String(nodeValue));
      });
    });
  },

  getFilteredLinks: () => {
    const { links, linkFilters } = get();
    if (Object.keys(linkFilters).length === 0) return links;

    return links.filter((link) => {
      return Object.entries(linkFilters).every(([field, values]) => {
        const linkValue = link[field as keyof LinkData];
        return values.includes(String(linkValue));
      });
    });
  },

  getFilteredNodesExcluding: (excludeField) => {
    const { nodes, nodeFilters } = get();
    const filtersToApply = { ...nodeFilters };
    if (excludeField) delete filtersToApply[excludeField];

    if (Object.keys(filtersToApply).length === 0) return nodes;

    return nodes.filter((node) => {
      return Object.entries(filtersToApply).every(([field, values]) => {
        const nodeValue = node[field as keyof NodeData];
        return values.includes(String(nodeValue));
      });
    });
  },

  getFilteredLinksExcluding: (excludeField) => {
    const { links, linkFilters } = get();
    const filtersToApply = { ...linkFilters };
    if (excludeField) delete filtersToApply[excludeField];

    if (Object.keys(filtersToApply).length === 0) return links;

    return links.filter((link) => {
      return Object.entries(filtersToApply).every(([field, values]) => {
        const linkValue = link[field as keyof LinkData];
        return values.includes(String(linkValue));
      });
    });
  },
}));
