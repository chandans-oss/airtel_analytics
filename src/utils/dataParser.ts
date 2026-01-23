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
  const jsonData = XLSX.utils.sheet_to_json(worksheet) as Record<string, any>[];

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

  const result: Record<string, any[]> = {};

  workbook.SheetNames.forEach(name => {
    const sheet = workbook.Sheets[name];
    const jsonData = XLSX.utils.sheet_to_json(sheet) as Record<string, any>[];
    const mapper = sheetMapping[name];
    if (mapper) {
      result[name] = mapper(jsonData);
    } else {
      result[name] = jsonData;
    }
  });

  return result;
}

function mapNodes(data: any[]): NodeData[] {
  return data.map(row => ({
    deviceName: normalize(row['DEVICE_NAME'] || row['Device name']),
    status: (String(row['STATUS'] || row['Status'] || 'DOWN').toUpperCase() === 'UP' ? 'UP' : 'DOWN') as 'UP' | 'DOWN',
    loopbackIP: normalize(row['LOOPBACK_IP'] || row['Loopback IP']),
    deviceType: normalize(row['DEVICE_TYPE'] || row['Device Type']),
    make: normalize(row['MAKE'] || row['Make']),
    model: normalize(row['MODEL'] || row['Model']),
    osVersion: normalize(row['OS_VERSION'] || row['OS Version']),
    serialNumber: normalize(row['SERIAL_NUMBER']),
    primaryIP: normalize(row['PRIMARY_IP']),
    mgmtIP: normalize(row['MGMT_IP']),
    pop: normalize(row['POP']),
    city: normalize(row['CITY']),
    siteName: normalize(row['SITE_NAME']),
    region: normalize(row['REGION'] || row['Region']),
    state: normalize(row['STATE'] || row['State']),
    serviceFlavor: normalize(row['SERVICE_FLAVOR'] || row['Service Flavor']),
    scanType: normalize(row['SCAN_TYPE'] || row['Scan Type']),
  }));
}

function mapLinks(data: any[]): LinkData[] {
  return data.map(row => ({
    customerCode: normalize(row['CUSTOMER_CODE']),
    customerName: normalize(row['CUSTOMER_NAME']),
    address: normalize(row['ADDRESS']),
    loopbackIP: normalize(row['LOOPBACK_IP']),
    wanIP: normalize(row['WAN_IP']),
    bandwidth: parseInt(String(row['BANDWIDTH'] || row['BANDWIDTH_IN_KBPS'] || '0').replace(/'/g, ''), 10),
    ecrmProduct: normalize(row['PRODUCT'] || row['ECRM_PRODUCT']),
    deviceType: normalize(row['DEVICE_TYPE']),
    deviceName: normalize(row['DEVICE_NAME']),
    make: normalize(row['MAKE']),
    serviceFlavor: normalize(row['SERVICE_FLAVOR']),
    businessProfile: normalize(row['BUSINESS_PROFILE']),
    region: normalize(row['REGION']),
    state: normalize(row['STATE']),
    location: normalize(row['LOCATION']),
    linkType: normalize(row['LINK_TYPE']),
    serviceType: normalize(row['SERVICE_TYPE']),
    scanType: normalize(row['SCAN_TYPE']),
    linkStatus: (String(row['LINK_STATUS'] || row['LINK_STATE'] || 'DOWN').toUpperCase() === 'UP' ? 'UP' : 'DOWN') as 'UP' | 'DOWN',
    interface: normalize(row['INTERFACE']),
    linkDescription: normalize(row['LINK_DESCRIPTION']),
    raNumber: normalize(row['RA_NUMBER']),
    lsi: normalize(row['LSI']),
    serialNumber: normalize(row['SERIAL_NUMBER']),
    linkState: normalize(row['LINK_STATE']),
    reachabilityStatus: normalize(row['REACHABILITY_STATUS']),
    primarySecondary: normalize(row['PRIMARY/SECONDARY']),
    peering: normalize(row['PEERING']),
    city: normalize(row['CITY']),
    pop: normalize(row['POP']),
    cost: parseFloat(String(row['COST'] || '0')),
    productPlan: normalize(row['PRODUCT PLAN']),
    contractData: normalize(row['CONTRACT DATA']),
  }));
}

function mapEvents(data: any[]): EventData[] {
  return data.map(row => ({
    eventId: normalize(row['EVENT_ID']),
    eventType: normalize(row['EVENT_TYPE']),
    deviceName: normalize(row['DEVICE_NAME']),
    ip: normalize(row['IP']),
    customer: normalize(row['CUSTOMER']),
    severity: (String(row['SEVERITY'] || '').toUpperCase() || 'MINOR') as any,
    startTime: normalize(row['START_TIME'] || row['FIRST_OCCURRENCE']),
    age: normalize(row['AGE']),
    lastUpdate: normalize(row['LAST_UPDATE']),
    rootCause: normalize(row['ROOT_CAUSE']),
    category: normalize(row['CATEGORY']),
    status: normalize(row['STATUS'] || row['ACTIVE']),
    firstOccurrence: normalize(row['FIRST_OCCURRENCE']),
    clearTime: normalize(row['CLEAR_TIME']),
    faultName: normalize(row['FAULT_NAME']),
    os: normalize(row['OS']),
    interface: normalize(row['INTERFACE']),
  }));
}

function mapRAInventory(data: any[]): RAInventoryData[] {
  return data.map(row => ({
    raNumber: normalize(row['RA_NUMBER']),
    status: normalize(row['STATUS']),
    type: normalize(row['TYPE']),
    customerCode: normalize(row['CUSTOMER_CODE']),
    customerName: normalize(row['CUSTOMER_NAME']),
    product: normalize(row['PRODUCT']),
    bandwidth: normalize(row['BANDWIDTH']),
    contract: normalize(row['CONTRACT']),
    linkIds: normalize(row['LINK_IDs']),
    cpeIds: normalize(row['CPE IDs']),
  }));
}

function mapConfigCalendar(data: any[]): ConfigCalendarData[] {
  return data.map(row => ({
    date: normalize(row['Change date/time']),
    event: (row['EVENT'] || '') as any,
    state: (row['STATE'] || '') as any,
    deviceName: normalize(row['DEVICE_NAME']),
    ip: normalize(row['IP']),
  }));
}

function mapConfigFailure(data: any[]): ConfigFailureData[] {
  return data.map(row => ({
    deviceName: normalize(row['device_name']),
    deviceType: normalize(row['device_type']),
    scanType: (row['scan_type'] || '') as any,
    failureReason: normalize(row['failure_reason']),
    status: 'FAILED',
    configurationProfile: normalize(row['configuration_profile']),
  }));
}

function mapCustomers(data: any[]): CustomerData[] {
  return data.map(row => ({
    customer: normalize(row['Customer']),
    customerCode: normalize(row['Customer Code']),
    noOfLinks: parseInt(String(row['No of Links'] || '0'), 10),
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
