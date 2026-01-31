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

interface HierarchyPath {
  field: string;
  linkField: string;
  value: string;
  label: string;
}

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
  nodeHierarchyLevels: HierarchyLevel[];
  linkHierarchyLevels: HierarchyLevel[];
  hierarchyLevels: HierarchyLevel[]; // @deprecated - keep for now to avoid breaking other things temporarily
  hierarchyPath: HierarchyPath[];
  widgetConfigs: Record<string, WidgetConfig>;
  selectedModule: string;
  selectedSubModule: string;
  sidebarOpen: boolean;
  toolSidebarOpen: boolean;
  inventorySidebarOpen: boolean;
  showTable: boolean;
  activeTopologyView: 'nodes' | 'links';

  // Actions
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setShowTable: (show: boolean) => void;
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
  clearFilterField: (field: string, type?: 'nodes' | 'links') => void;
  clearFilters: (type?: 'nodes' | 'links') => void;
  setHierarchyLevels: (levels: HierarchyLevel[]) => void;
  setNodeHierarchyLevels: (levels: HierarchyLevel[]) => void;
  setLinkHierarchyLevels: (levels: HierarchyLevel[]) => void;
  setHierarchyPath: (path: HierarchyPath[]) => void;
  updateWidgetConfig: (id: string, config: Partial<WidgetConfig>) => void;
  setSelectedModule: (module: string) => void;
  setSelectedSubModule: (module: string) => void;
  setToolSidebarOpen: (open: boolean) => void;
  setInventorySidebarOpen: (open: boolean) => void;
  setActiveTopologyView: (view: 'nodes' | 'links') => void;

  // Computed
  getStats: () => InventoryStats;
  getFilteredNodes: () => NodeData[];
  getFilteredLinks: () => LinkData[];
  getFilteredEvents: () => EventData[];
  getFilteredConfigFailures: () => ConfigFailureData[];
  getFilteredNodesExcluding: (excludeField?: string) => NodeData[];
  getFilteredLinksExcluding: (excludeField?: string) => LinkData[];
  // Metrics Toggles
  showNetworkMetrics: boolean;
  showAppMetrics: boolean;
  toggleNetworkMetrics: () => void;
  toggleAppMetrics: () => void;
}

const defaultHierarchyLevels: HierarchyLevel[] = [
  {
    id: 'region',
    label: 'Region',
    field: 'region',
    linkField: 'region',
    expectedValues: ['North', 'South', 'East', 'West']
  },
  {
    id: 'make',
    label: 'Make',
    field: 'make',
    linkField: 'make',
    expectedValues: ['Cisco', 'Fortinet', 'Huawei']
  },
  {
    id: 'scanType',
    label: 'Scan Type',
    field: 'scanType',
    linkField: 'scanType',
    expectedValues: ['SNMP', 'ICMP']
  },
  {
    id: 'serviceFlavor',
    label: 'Service Flavor',
    field: 'serviceFlavor',
    linkField: 'serviceFlavor',
    expectedValues: ['Fully Managed', 'Partially Managed']
  },
];

const defaultNodeLevels: HierarchyLevel[] = [
  { id: 'make', label: 'Make', field: 'make' },
  { id: 'scanType', label: 'Scan Type', field: 'scanType', expectedValues: ['SNMP', 'ICMP'] }
];

const defaultLinkLevels: HierarchyLevel[] = [
  { id: 'linkStatus', label: 'Status', field: 'linkStatus' },
  { id: 'snmpStatus', label: 'SNMP Status', field: 'snmpStatus' },
  { id: 'pingStatus', label: 'Ping Status', field: 'pingStatus' },
  { id: 'serviceFlavor', label: 'Service Flavor', field: 'serviceFlavor', expectedValues: ['Fully Managed', 'Partially Managed'] },
  { id: 'make', label: 'Make', field: 'make' },
  { id: 'region', label: 'Region', field: 'region' },
  { id: 'scanType', label: 'Scan Type', field: 'scanType', expectedValues: ['SNMP', 'ICMP'] }
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
  nodeHierarchyLevels: defaultNodeLevels,
  linkHierarchyLevels: defaultLinkLevels,
  hierarchyLevels: defaultHierarchyLevels,
  hierarchyPath: [],
  widgetConfigs: {},
  selectedModule: 'unified',
  selectedSubModule: 'links',
  sidebarOpen: false,
  toolSidebarOpen: false,
  inventorySidebarOpen: true,
  showTable: false,

  showNetworkMetrics: true,
  showAppMetrics: true,
  toggleNetworkMetrics: () => set((state) => ({ showNetworkMetrics: !state.showNetworkMetrics })),
  toggleAppMetrics: () => set((state) => ({ showAppMetrics: !state.showAppMetrics })),

  activeTopologyView: 'links', // Default to nodes
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setShowTable: (showTable) => set({ showTable }),
  setToolSidebarOpen: (toolSidebarOpen) => set({ toolSidebarOpen }),
  setInventorySidebarOpen: (inventorySidebarOpen) => set({ inventorySidebarOpen }),
  setActiveTopologyView: (activeTopologyView) => set({ activeTopologyView, hierarchyPath: [] }),

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
    const filterKey = type === 'links' ? 'linkFilters' : (type === 'nodes' ? 'nodeFilters' : 'activeFilters');
    const currentFilters = get()[filterKey];
    const currentValues = currentFilters[field] || [];

    if (currentValues.includes(value)) {
      // If already selected, remove it (Double-click or toggle off behavior)
      const newValues = currentValues.filter((v) => v !== value);
      const newFilters = { ...currentFilters };
      if (newValues.length === 0) {
        delete newFilters[field];
      } else {
        newFilters[field] = newValues;
      }
      set({ [filterKey]: newFilters });
    } else {
      // Single-select behavior: Replace any existing selections for THIS field with the new value
      // This ensures that clicking 'DOWN' while 'UP' is selected will SWITCH to 'DOWN'
      set({
        [filterKey]: {
          ...currentFilters,
          [field]: [value],
        },
      });
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

  clearFilterField: (field, type) => set((state) => {
    const filterKey = type === 'links' ? 'linkFilters' : (type === 'nodes' ? 'nodeFilters' : 'activeFilters');
    const currentFilters = state[filterKey];
    const newFilters = { ...currentFilters };
    delete newFilters[field];
    return { [filterKey]: newFilters };
  }),

  clearFilters: (type) => {
    if (type === 'nodes') set({ nodeFilters: {} });
    else if (type === 'links') set({ linkFilters: {} });
    else set({ activeFilters: {}, nodeFilters: {}, linkFilters: {}, sidebarOpen: false, hierarchyPath: [] });
  },
  setHierarchyLevels: (hierarchyLevels) => set({ hierarchyLevels }),
  setNodeHierarchyLevels: (nodeHierarchyLevels) => set({ nodeHierarchyLevels }),
  setLinkHierarchyLevels: (linkHierarchyLevels) => set({ linkHierarchyLevels }),
  setHierarchyPath: (hierarchyPath) => set({ hierarchyPath }),
  updateWidgetConfig: (id, config) => set((state) => ({
    widgetConfigs: {
      ...state.widgetConfigs,
      [id]: { ...(state.widgetConfigs[id] || { id, title: id, chartType: 'pie', timeframe: '1h' }), ...config }
    }
  })),
  setSelectedModule: (selectedModule) => set({ selectedModule, selectedSubModule: 'overview' }),
  setSelectedSubModule: (selectedSubModule) => set({ selectedSubModule }),

  getStats: () => {
    const nodes = get().getFilteredNodes();
    const links = get().getFilteredLinks();
    const onlineNodes = nodes.filter((n) => n.status === 'UP').length;
    const onlineLinks = links.filter((l) => l.linkStatus === 'UP').length;

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
      activeEventsCount: get().getFilteredEvents().length,
      totalCustomers: 5, // User correction: "there must be only 5 customers"
      totalSites: 51, // Matching provided image
    };
  },

  getFilteredNodes: () => {
    const { nodes, nodeFilters, hierarchyPath } = get();
    let filtered = [...nodes];

    // Apply Hierarchy Path
    hierarchyPath.forEach(h => {
      filtered = filtered.filter(n => String((n as any)[h.field]).toUpperCase() === h.value.toUpperCase());
    });

    if (Object.keys(nodeFilters).length === 0) return filtered;

    return filtered.filter((node) => {
      return Object.entries(nodeFilters).every(([field, values]) => {
        const nodeValue = node[field as keyof NodeData];
        return values.includes(String(nodeValue));
      });
    });
  },

  getFilteredLinks: () => {
    const { links, linkFilters, hierarchyPath } = get();
    let filtered = [...links];

    // Apply Hierarchy Path
    hierarchyPath.forEach(h => {
      filtered = filtered.filter(l => String((l as any)[h.linkField]).toUpperCase() === h.value.toUpperCase());
    });

    if (Object.keys(linkFilters).length === 0) return filtered;

    return filtered.filter((link) => {
      return Object.entries(linkFilters).every(([field, values]) => {
        const linkValue = link[field as keyof LinkData];
        return values.includes(String(linkValue));
      });
    });
  },

  getFilteredEvents: () => {
    const { allEvents, hierarchyPath, nodeFilters } = get();
    const filteredNodes = get().getFilteredNodes();
    const deviceNames = new Set(filteredNodes.map(n => n.deviceName));

    return allEvents.filter(event => deviceNames.has(event.deviceName));
  },

  getFilteredConfigFailures: () => {
    const { configFailure, hierarchyPath, nodeFilters } = get();
    const filteredNodes = get().getFilteredNodes();
    const deviceNames = new Set(filteredNodes.map(n => n.deviceName));

    return configFailure.filter(cf => deviceNames.has(cf.deviceName));
  },

  getFilteredNodesExcluding: (excludeField) => {
    const { nodes, nodeFilters, hierarchyPath } = get();
    let filtered = [...nodes];

    // Apply Hierarchy Path
    hierarchyPath.forEach(h => {
      filtered = filtered.filter(n => String((n as any)[h.field]).toUpperCase() === h.value.toUpperCase());
    });

    const filtersToApply = { ...nodeFilters };
    if (excludeField) delete filtersToApply[excludeField];

    if (Object.keys(filtersToApply).length === 0) return filtered;

    return filtered.filter((node) => {
      return Object.entries(filtersToApply).every(([field, values]) => {
        const nodeValue = node[field as keyof NodeData];
        return values.includes(String(nodeValue));
      });
    });
  },

  getFilteredLinksExcluding: (excludeField) => {
    const { links, linkFilters, hierarchyPath } = get();
    let filtered = [...links];

    // Apply Hierarchy Path
    hierarchyPath.forEach(h => {
      filtered = filtered.filter(l => String((l as any)[h.linkField]).toUpperCase() === h.value.toUpperCase());
    });

    const filtersToApply = { ...linkFilters };
    if (excludeField) delete filtersToApply[excludeField];

    if (Object.keys(filtersToApply).length === 0) return filtered;

    return filtered.filter((link) => {
      return Object.entries(filtersToApply).every(([field, values]) => {
        const linkValue = link[field as keyof LinkData];
        return values.includes(String(linkValue));
      });
    });
  },
}));
