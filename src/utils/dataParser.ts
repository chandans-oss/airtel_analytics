import type {
  NodeData,
  LinkData,
  EventData,
  RAInventoryData,
  ConfigCalendarData,
  ConfigFailureData,
  CustomerData
} from '@/types/inventory';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

// Helper to normalize strings for consistent hierarchy and plots
const normalize = (val: any): string => {
  if (val === null || val === undefined) return '';
  const str = String(val).trim();
  if (str.toLowerCase() === 'unknown' || str === '-') return '';
  // Convert common manufacturer names to Standard casing
  const manufacturers: Record<string, string> = {
    'cisco': 'Cisco',
    'cisco systems': 'Cisco',
    'huawei': 'Huawei',
    'fortinet': 'Fortinet',
    'juniper': 'Juniper',
    'nokia': 'Nokia',
  };
  const lower = str.toLowerCase();
  if (manufacturers[lower]) return manufacturers[lower];

  // Default: capitalize first letter of each word for consistency
  return str.replace(/\b\w/g, char => char.toUpperCase());
};

export async function parseCSV(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const result = await processCSVContent(text);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export async function parseCSVFromUrl(url: string): Promise<any[]> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch data from ${url}`);
  const text = await response.text();
  return processCSVContent(text);
}

async function processCSVContent(content: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(content, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as Record<string, string>[];
        if (data.length === 0) {
          resolve([]);
          return;
        }

        // Basic detection logic (can be expanded)
        const firstRow = data[0];
        if ('Device name' in firstRow || 'DEVICE_NAME' in firstRow) {
          resolve(mapNodes(data));
        } else if ('LOOPBACK_IP' in firstRow && 'WAN_IP' in firstRow) {
          resolve(mapLinks(data));
        } else {
          resolve(data);
        }
      },
      error: (error) => reject(error),
    });
  });
}

export async function parseExcel(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const buffer = e.target?.result as ArrayBuffer;
        const result = await processExcelBuffer(buffer);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsArrayBuffer(file);
  });
}

export async function parseExcelFromUrl(url: string): Promise<any[]> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch data from ${url}`);
  const buffer = await response.arrayBuffer();
  return processExcelBuffer(buffer);
}

async function processExcelBuffer(buffer: ArrayBuffer): Promise<any[]> {
  const data = new Uint8Array(buffer);
  const workbook = XLSX.read(data, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  // Read raw data first to find headers
  const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
  if (rawData.length === 0) return [];

  const headerRowIdx = findHeaderRow(rawData, ['Device Name', 'DEVICE_NAME', 'Loopback IP', 'WAN_IP']);

  // Re-parse with correct header row
  const jsonData = XLSX.utils.sheet_to_json(worksheet, {
    range: headerRowIdx // Start from the distinct header row
  }) as Record<string, any>[];

  if (jsonData.length === 0) return [];

  const firstRow = jsonData[0];
  if ('Device name' in firstRow || 'DEVICE_NAME' in firstRow) {
    return mapNodes(jsonData);
  } else {
    return mapLinks(jsonData);
  }
}

export async function parseFullInventoryWorkbook(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch workbook from ${url}`);
  const buffer = await response.arrayBuffer();
  const data = new Uint8Array(buffer);
  const workbook = XLSX.read(data, { type: 'array' });

  const sheetMapping: Record<string, (data: any[]) => any[]> = {
    'Link Inventory': mapLinks,
    'Node Inventory': mapNodes,
    'Active Events': mapEvents,
    'All Events': mapEvents,
    'RA Inventory': mapRAInventory,
    'Config Calendar View': mapConfigCalendar,
    'Config Failure': mapConfigFailure,
    'Customers': mapCustomers,
  };

  // Fuzzy match sheet names to standard keys
  const normalizeSheetName = (name: string): string => {
    const n = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (n.includes('node')) return 'Node Inventory';
    if (n.includes('link')) return 'Link Inventory';
    if (n.includes('active') && n.includes('event')) return 'Active Events';
    if (n.includes('event')) return 'All Events';
    if (n.includes('ra')) return 'RA Inventory';
    if (n.includes('config') && n.includes('calendar')) return 'Config Calendar View';
    if (n.includes('config')) return 'Config Failure';
    if (n.includes('customer')) return 'Customers';
    return name;
  };

  const result: Record<string, any[]> = {};

  workbook.SheetNames.forEach(name => {
    const stdName = normalizeSheetName(name);
    const sheet = workbook.Sheets[name];

    // Smart Header Detection
    const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    if (rawData.length === 0) return;

    // Detect mapper based on normalized name
    const mapper = sheetMapping[stdName];

    // Detect header row based on expected columns for this type
    let headerRowIdx = 0;
    if (stdName === 'Node Inventory') headerRowIdx = findHeaderRow(rawData, ['Device Name', 'DEVICE_NAME', 'IP Address']);
    else if (stdName === 'Link Inventory') headerRowIdx = findHeaderRow(rawData, ['WAN_IP', 'Loopback IP', 'Circuit ID']);
    else headerRowIdx = findHeaderRow(rawData, ['Event ID', 'Customer', 'Date', 'Time']);

    const jsonData = XLSX.utils.sheet_to_json(sheet, { range: headerRowIdx }) as Record<string, any>[];

    if (mapper) {
      result[stdName] = mapper(jsonData);
    } else {
      result[stdName] = jsonData;
    }
  });

  return result;
}

// Helper to find the index of the header row
const findHeaderRow = (data: any[][], keywords: string[]): number => {
  for (let i = 0; i < Math.min(data.length, 20); i++) { // Check first 20 rows
    const rowStr = JSON.stringify(data[i]).toLowerCase();
    // If row contains at least one key keyword
    if (keywords.some(k => rowStr.includes(k.toLowerCase()))) {
      return i;
    }
  }
  return 0; // Default to 0 if not found
};

// Helper to finding value with fuzzy key matching
const getValue = (row: any, keys: string[]): any => {
  const rowKeys = Object.keys(row);
  for (const key of keys) {
    // Exact match
    if (row[key] !== undefined) return row[key];

    // Fuzzy match (case-insensitive, ignore non-alphanumeric)
    const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    const foundKey = rowKeys.find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedKey);
    if (foundKey) return row[foundKey];
  }
  return undefined;
};

// Helper for string string values
const getStr = (row: any, keys: string[]): string => {
  return normalize(getValue(row, keys));
};

function mapNodes(data: any[]): NodeData[] {
  return data
    .filter(row => getValue(row, ['DEVICE_NAME', 'Device Name', 'DeviceName']))
    .map(row => ({
      deviceName: getStr(row, ['DEVICE_NAME', 'Device Name', 'DeviceName']),
      status: (['UP', 'ACTIVE', 'LIVE', 'OK'].includes(getStr(row, ['STATUS', 'Status', 'State']).toUpperCase()) ? 'UP' : 'DOWN') as 'UP' | 'DOWN',
      loopbackIP: getStr(row, ['LOOPBACK_IP', 'Loopback IP', 'IP Address']),
      deviceType: getStr(row, ['DEVICE_TYPE', 'Device Type']),
      make: getStr(row, ['MAKE', 'Make']),
      model: getStr(row, ['MODEL', 'Model']),
      osVersion: getStr(row, ['OS_VERSION', 'OS Version']),
      serialNumber: getStr(row, ['SERIAL_NUMBER', 'Serial Number']),
      primaryIP: getStr(row, ['PRIMARY_IP', 'Primary IP']),
      mgmtIP: getStr(row, ['MGMT_IP', 'Management IP']),
      pop: getStr(row, ['POP', 'PoP']),
      city: getStr(row, ['CITY', 'City']),
      siteName: getStr(row, ['SITE_NAME', 'Site Name']),
      region: getStr(row, ['REGION', 'Region']),
      state: getStr(row, ['STATE', 'State']),
      serviceFlavor: getStr(row, ['SERVICE_FLAVOR', 'Service Flavor']),
      scanType: getStr(row, ['SCAN_TYPE', 'Scan Type']),
      customerCode: getStr(row, ['CUSTOMER_CODE', 'Customer Code']),
      customerName: getStr(row, ['CUSTOMER_NAME', 'Customer Name']),
      bandwidth: parseInt(String(getValue(row, ['BANDWIDTH', 'Bandwidth']) || '0'), 10),
      snmpStatus: getStr(row, ['SNMP_STATUS', 'SNMP', 'SNMP Status', 'SCANNING_STATUS', 'POLLING_STATUS', 'SNMP_STATE']),
      pingStatus: getStr(row, ['PING_STATUS', 'PING', 'Ping Status', 'REACHABILITY', 'ICMP_STATUS']),
      utilization: parseFloat(String(getValue(row, ['UTILIZATION', 'Usage %', 'CPU_USAGE', 'Utilization']) || '0')),
      errors: parseInt(String(getValue(row, ['ERRORS', 'ERROR_COUNT', 'Interface Errors']) || '0'), 10),
      latency: parseFloat(String(getValue(row, ['LATENCY', 'Avg Latency', 'Response Time']) || '0')),
      addedDate: getStr(row, ['DATE_ADDED', 'DEVOPS_DATE', 'Created At', 'Added Date']),
      probableCause: getStr(row, ['PROBABLE_CAUSE', 'Reason', 'Failure Cause', 'REASON_FOR_DOWN', 'SCANNING_FAIL_REASON', 'COMMENT']),
    })).map(n => ({
      ...n,
      // Post-process fallback only if raw mapping failed
      snmpStatus: n.snmpStatus || (n.probableCause ? 'DOWN' : (n.status === 'UP' ? 'UP' : 'DOWN')),
      pingStatus: n.pingStatus || (n.status === 'UP' ? 'UP' : 'DOWN')
    }));
}

function mapLinks(data: any[]): LinkData[] {
  return data
    .filter(row =>
      getValue(row, ['LOOPBACK_IP', 'Loopback IP']) ||
      getValue(row, ['WAN_IP', 'WAN IP']) ||
      getValue(row, ['Customer Code', 'CUSTOMER_CODE'])
    )
    .map(row => ({
      customerCode: getStr(row, ['CUSTOMER_CODE', 'Customer Code']),
      customerName: getStr(row, ['CUSTOMER_NAME', 'Customer Name']),
      address: getStr(row, ['ADDRESS', 'Address']),
      loopbackIP: getStr(row, ['LOOPBACK_IP', 'Loopback IP']),
      wanIP: getStr(row, ['WAN_IP', 'WAN IP']),
      bandwidth: parseInt(String(getValue(row, ['BANDWIDTH', 'BANDWIDTH_IN_KBPS', 'Bandwidth']) || '0').replace(/[^0-9]/g, ''), 10),
      ecrmProduct: getStr(row, ['PRODUCT', 'ECRM_PRODUCT', 'Product']),
      deviceType: getStr(row, ['DEVICE_TYPE', 'Device Type']),
      deviceName: getStr(row, ['DEVICE_NAME', 'Device Name']),
      make: getStr(row, ['MAKE', 'Make']),
      serviceFlavor: getStr(row, ['SERVICE_FLAVOR', 'Service Flavor']),
      businessProfile: getStr(row, ['BUSINESS_PROFILE', 'Business Profile']),
      region: getStr(row, ['REGION', 'Region']),
      state: getStr(row, ['STATE', 'State']),
      location: getStr(row, ['LOCATION', 'Location']),
      linkType: getStr(row, ['LINK_TYPE', 'Link Type']),
      serviceType: getStr(row, ['SERVICE_TYPE', 'Service Type']),
      scanType: getStr(row, ['SCAN_TYPE', 'Scan Type']),
      linkStatus: (['UP', 'ACTIVE', 'LIVE', 'OK'].includes(getStr(row, ['LINK_STATUS', 'LINK_STATE', 'Link Status', 'Status', 'State']).toUpperCase()) ? 'UP' : 'DOWN') as 'UP' | 'DOWN',
      interface: getStr(row, ['INTERFACE', 'Interface']),
      linkDescription: getStr(row, ['LINK_DESCRIPTION', 'Link Description']),
      raNumber: getStr(row, ['RA_NUMBER', 'RA Number']),
      lsi: getStr(row, ['LSI']),
      serialNumber: getStr(row, ['SERIAL_NUMBER', 'Serial Number']),
      linkState: getStr(row, ['LINK_STATE', 'Link State']),
      reachabilityStatus: getStr(row, ['REACHABILITY_STATUS', 'Reachability Status']),
      primarySecondary: getStr(row, ['PRIMARY/SECONDARY', 'Primary/Secondary']),
      peering: getStr(row, ['PEERING', 'Peering']),
      city: getStr(row, ['CITY', 'City']),
      pop: getStr(row, ['POP', 'PoP']),
      cost: parseFloat(String(getValue(row, ['COST', 'Cost']) || '0')),
      productPlan: getStr(row, ['PRODUCT PLAN', 'Product Plan']),
      contractData: getStr(row, ['CONTRACT DATA', 'Contract Data']),
      siteName: getStr(row, ['SITE_NAME', 'Site Name', 'Site']),
      linkId: getStr(row, ['LINK_ID', 'Link ID', 'Link', 'CIRCUIT_ID', 'LSI']),
      snmpStatus: getStr(row, ['SNMP_STATUS', 'SNMP', 'SNMP Status', 'SCANNING_STATUS', 'POLLING_STATUS', 'SNMP_STATE']),
      pingStatus: getStr(row, ['PING_STATUS', 'PING', 'Ping Status', 'REACHABILITY', 'ICMP_STATUS']),
      utilization: parseFloat(String(getValue(row, ['UTILIZATION', 'Usage %', 'Link Utilization']) || '0')),
      errors: parseInt(String(getValue(row, ['ERRORS', 'Link Errors']) || '0'), 10),
      performanceScore: parseFloat(String(getValue(row, ['PERFORMANCE_SCORE', 'Health Score']) || '0')),
      addedDate: getStr(row, ['DATE_ADDED', 'Added Date']),
      deletedDate: getStr(row, ['DATE_DELETED', 'Deleted Date']),
      probableCause: getStr(row, ['PROBABLE_CAUSE', 'Reason', 'Down Reason', 'REASON_FOR_DOWN', 'COMMENT']),
    })).map(l => ({
      ...l,
      // Post-process fallback
      snmpStatus: l.snmpStatus || (l.probableCause ? 'DOWN' : (l.linkStatus === 'UP' ? 'UP' : 'DOWN')),
      pingStatus: l.pingStatus || (l.linkStatus === 'UP' ? 'UP' : 'DOWN')
    }));
}

function mapEvents(data: any[]): EventData[] {
  return data.map(row => ({
    eventId: getStr(row, ['EVENT_ID', 'Event ID']),
    eventType: getStr(row, ['EVENT_TYPE', 'Event Type', 'Event Ty']),
    deviceName: getStr(row, ['DEVICE_NAME', 'Device Name', 'Node']),
    ip: getStr(row, ['IP', 'IP Address', 'IP Addre']),
    customer: getStr(row, ['CUSTOMER', 'Customer']),
    severity: (getStr(row, ['SEVERITY', 'Severity']).toUpperCase() || 'MINOR') as any,
    startTime: getStr(row, ['START_TIME', 'FIRST_OCCURRENCE', 'Start Time', 'Date', 'First Event Time']),
    age: getStr(row, ['AGE', 'Age']),
    lastUpdate: getStr(row, ['LAST_UPDATE', 'Last Update', 'Last Event Time']),
    rootCause: getStr(row, ['ROOT_CAUSE', 'Root Cause']),
    category: getStr(row, ['CATEGORY', 'Category']),
    status: getStr(row, ['STATUS', 'ACTIVE', 'Status']),
    firstOccurrence: getStr(row, ['FIRST_OCCURRENCE', 'First Occurrence', 'First Event Time']),
    clearTime: getStr(row, ['CLEAR_TIME', 'Clear Time']),
    faultName: getStr(row, ['FAULT_NAME', 'Fault Name', 'Issue']),
    os: getStr(row, ['OS']),
    interface: getStr(row, ['INTERFACE', 'Interface', 'Resource']),
    vendor: getStr(row, ['VENDOR', 'Vendor']),
    location: getStr(row, ['LOCATION', 'Location']),
    state: getStr(row, ['STATE', 'State']),
    bandwidth: getStr(row, ['BANDWIDTH', 'Bandwidth']),
    business: getStr(row, ['BUSINESS', 'Business']),
    isPremium: getStr(row, ['PREMIUM', 'Premium']),
    isSuppressed: getStr(row, ['SUPPRESSED', 'Suppressed', 'Suppress', 'Suppres']),
    isGrouped: getStr(row, ['GROUPED', 'Grouped']),
    srStatus: getStr(row, ['SR_STATUS', 'SR Status']),
    srNumber: getStr(row, ['SR_NUMBER', 'SR Number', 'Ticket Number', 'SR Numb', 'NSTT Nu']),
  }));
}

function mapRAInventory(data: any[]): RAInventoryData[] {
  return data.map(row => ({
    raNumber: getStr(row, ['RA_NUMBER', 'RA Number', 'Reference No']),
    status: getStr(row, ['STATUS', 'Status', 'Current State']),
    type: getStr(row, ['TYPE', 'Type', 'RA Type', 'Category']),
    customerCode: getStr(row, ['CUSTOMER_CODE', 'Customer Code', 'Cust Code']),
    customerName: getStr(row, ['CUSTOMER_NAME', 'Customer Name', 'Customer']),
    product: getStr(row, ['PRODUCT', 'Product', 'Service Type']),
    bandwidth: getStr(row, ['BANDWIDTH', 'Bandwidth', 'Capacity']),
    contract: getStr(row, ['CONTRACT', 'Contract', 'Period']),
    linkIds: getStr(row, ['LINK_IDs', 'Link IDs', 'LSI List']),
    cpeIds: getStr(row, ['CPE IDs', 'CPE IDs', 'Serial Nos']),
    createdDate: getStr(row, ['CREATED_AT', 'Date Added', 'Order Date', 'RA Date', 'Created Date']),
    region: getStr(row, ['REGION', 'Region', 'Zone']),
  }));
}

function mapConfigCalendar(data: any[]): ConfigCalendarData[] {
  return data.map(row => ({
    date: getStr(row, ['Change date/time', 'Date']),
    event: (getValue(row, ['EVENT', 'Event']) || '') as any,
    state: (getValue(row, ['STATE', 'State']) || '') as any,
    deviceName: getStr(row, ['DEVICE_NAME', 'Device Name']),
    ip: getStr(row, ['IP']),
  }));
}

function mapConfigFailure(data: any[]): ConfigFailureData[] {
  return data.map(row => ({
    ...row,
    deviceName: getStr(row, ['device_name', 'Device Name', 'DeviceName', 'ip_address', 'Link IP']),
    ipAddress: getStr(row, ['ip_address', 'Link IP', 'IP Address', 'LOOPBACK_IP', 'Loopback IP']),
    vendor: getStr(row, ['vendor', 'VENDOR']),
    make: getStr(row, ['make', 'MAKE']),
    osName: getStr(row, ['os_name', 'OS_NAME', 'OS Version', 'osVersion']),
    deviceType: getStr(row, ['device_type', 'Device Type', 'DEVICE_TYPE']),
    scanType: (getValue(row, ['scan_type', 'Scan Type', 'SCAN_TYPE']) || '') as any,
    failureReason: getStr(row, ['failure_reason', 'Failure Reason', 'FAILURE_REASON']),
    status: getStr(row, ['status', 'Status', 'STATUS']) || 'FAILED',
    configurationProfile: getStr(row, ['configuration_profile', 'Configuration Profile', 'CONFIGURATION_PROFILE']),
  }));
}

function mapCustomers(data: any[]): CustomerData[] {
  return data.map(row => ({
    customer: getStr(row, ['Customer']),
    customerCode: getStr(row, ['Customer Code']),
    noOfLinks: parseInt(String(getValue(row, ['No of Links']) || '0'), 10),
  }));
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatBandwidth(kbps: number): string {
  if (kbps >= 1000000) {
    return `${(kbps / 1000000).toFixed(1)} Gbps`;
  } else if (kbps >= 1000) {
    return `${(kbps / 1000).toFixed(1)} Mbps`;
  }
  return `${kbps} Kbps`;
}
