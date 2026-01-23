// ENOC Network Inventory Types

export interface NodeData {
  deviceName: string;
  status: 'UP' | 'DOWN';
  loopbackIP: string;
  deviceType: string;
  make: string;
  model: string;
  osVersion: string;
  serialNumber?: string;
  primaryIP?: string;
  mgmtIP?: string;
  pop?: string;
  city?: string;
  siteName?: string;
  region?: string;
  state?: string;
  serviceFlavor?: string;
  scanType?: string;
  customerCode?: string;
  customerName?: string;
  bandwidth?: number;
}

export interface LinkData {
  customerCode: string;
  customerName?: string;
  address?: string;
  loopbackIP: string;
  wanIP: string;
  bandwidth: number;
  ecrmProduct?: string;
  deviceType: string;
  deviceName?: string;
  make: string;
  serviceFlavor: string;
  businessProfile?: string;
  region: string;
  state: string;
  location?: string;
  linkType?: string;
  serviceType?: string;
  scanType?: string;
  linkStatus: 'UP' | 'DOWN';
  linkDownSince?: string;
  interface?: string;
  linkDescription?: string;
  raNumber?: string;
  lsi?: string;
  serialNumber?: string;
  linkState?: string;
  reachabilityStatus?: string;
  primarySecondary?: string;
  peering?: string;
  city?: string;
  pop?: string;
  cost?: number;
  productPlan?: string;
  contractData?: string;
}

export interface EventData {
  eventId: string;
  eventType: string;
  deviceName: string;
  ip: string;
  customer?: string;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR' | 'WARNING';
  startTime: string;
  age?: string;
  lastUpdate?: string;
  rootCause?: string;
  category?: string;
  status?: string; // ACTIVE, CLEARED, ACKNOWLEDGED
  firstOccurrence?: string;
  clearTime?: string;
  faultName?: string;
  os?: string;
  interface?: string;
}

export interface RAInventoryData {
  raNumber: string;
  status: string;
  type: string;
  customerCode: string;
  customerName: string;
  product: string;
  bandwidth: string;
  contract: string;
  linkIds?: string;
  cpeIds?: string;
}

export interface ConfigCalendarData {
  date: string;
  event: 'CONFIG_PUSH' | 'BACKUP' | 'DIFF';
  state: 'SUCCESS' | 'FAILED' | 'Scheduled';
  deviceName: string;
  ip: string;
}

export interface ConfigFailureData {
  deviceName: string;
  deviceType: string;
  scanType: 'BACKUP' | 'PUSH' | 'DIFF';
  failureReason: string;
  status: 'FAILED';
  configurationProfile: string;
}

export interface CustomerData {
  customer: string;
  customerCode: string;
  noOfLinks: number;
}

export interface InventoryStats {
  totalNodes: number;
  onlineNodes: number;
  offlineNodes: number;
  totalLinks: number;
  onlineLinks: number;
  offlineLinks: number;
  uniqueMakes: string[];
  uniqueRegions: string[];
  uniqueStates: string[];
  uniqueServiceFlavors: string[];
  linkedNodes: number;
  unlinkedNodes: number;
  activeEventsCount: number;
}

export interface HierarchyLevel {
  id: string;
  label: string;
  field: keyof NodeData | keyof LinkData;
  linkField?: string;
  expectedValues?: string[];
}

export interface HierarchyNode {
  name: string;
  value: number;
  field: string;
  children?: HierarchyNode[];
  items?: NodeData[];
}

export interface FilterState {
  [key: string]: string[];
}

export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export type DataCategory =
  | 'inventory'
  | 'discovery'
  | 'events'
  | 'config'
  | 'links'
  | 'ra'
  | 'customers'
  | 'configFailure'
  | 'configCalendar';

export type ChartType = 'pie' | 'donut' | 'bar' | 'histogram' | 'line' | 'table';

export interface WidgetConfig {
  id: string;
  title: string;
  chartType: ChartType;
  timeframe: string;
}

export interface UploadedFile {
  name: string;
  size: number;
  type: string;
  category: DataCategory;
  data: any[];
  uploadedAt: Date;
}
