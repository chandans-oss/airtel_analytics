import { useEffect, useState } from 'react';
import { useInventoryStore } from '@/store/inventoryStore';
import type { NodeData, LinkData } from '@/types/inventory';

// Sample data from the uploaded files
const sampleNodes: NodeData[] = [
  { deviceName: 'ECLT-GDG156-RTR15682', status: 'UP', loopbackIP: '172.46.87.177', deviceType: 'Router', make: 'CISCO', model: 'C900-UNIVERSALK9-M', osVersion: '15.8(3)M6' },
  { deviceName: 'ECLT-PUN1334-RTR16949', status: 'UP', loopbackIP: '172.46.156.120', deviceType: 'Router', make: 'CISCO', model: 'C900-UNIVERSALK9-M', osVersion: '15.8(3)M6' },
  { deviceName: 'ECLT-ANP110-RTR7967', status: 'UP', loopbackIP: '172.42.223.83', deviceType: 'Router', make: 'Cisco', model: 'cisco841', osVersion: '15.8(3)M1a' },
  { deviceName: 'ECLT-KOL216-RTR7254', status: 'UP', loopbackIP: '172.42.195.37', deviceType: 'Router', make: 'Cisco', model: 'cisco841', osVersion: '15.8(3)M1a' },
  { deviceName: 'ECLT-KOG104-RTR7120', status: 'UP', loopbackIP: '172.43.13.138', deviceType: 'Router', make: 'Cisco', model: 'cisco841', osVersion: '15.8(3)M1a' },
  { deviceName: 'ECLT-HYD111-RTR9211', status: 'UP', loopbackIP: '172.38.245.127', deviceType: 'Router', make: 'Cisco', model: 'cisco841', osVersion: '15.5(3)M5' },
  { deviceName: 'ECLT-KOL240-RTR7584', status: 'UP', loopbackIP: '172.42.218.146', deviceType: 'Router', make: 'Cisco', model: 'cisco841', osVersion: '15.8(3)M1a' },
  { deviceName: 'ECLT-VJW131-RTR5201', status: 'UP', loopbackIP: '172.42.72.135', deviceType: 'Router', make: 'Cisco', model: 'cisco841', osVersion: '15.5(3)M5' },
  { deviceName: 'ECLT-BLR475-RTR4740', status: 'UP', loopbackIP: '172.42.44.107', deviceType: 'Router', make: 'Cisco', model: 'cisco841', osVersion: '15.8(3)M' },
  { deviceName: 'ECLT-HYL469-RTR5510', status: 'UP', loopbackIP: '172.42.72.178', deviceType: 'Router', make: 'Cisco', model: 'cisco841', osVersion: '15.5(3)M5' },
  { deviceName: 'ECLT-NND102-RTR5801', status: 'UP', loopbackIP: '172.42.154.32', deviceType: 'Router', make: 'Cisco', model: 'cisco841', osVersion: '15.5(3)M5' },
  { deviceName: 'ECLT-BLR791-RTR6848', status: 'UP', loopbackIP: '172.43.20.115', deviceType: 'Router', make: 'Cisco', model: 'cisco841', osVersion: '15.8(3)M1a' },
  { deviceName: 'SBIRRB_APGVB_1112874', status: 'DOWN', loopbackIP: '172.46.187.102', deviceType: 'Router', make: 'Cisco', model: 'ISR1100X-4G', osVersion: '17.6.3a' },
  { deviceName: 'ECLT-ERD134-RTR16174', status: 'UP', loopbackIP: '172.46.116.128', deviceType: 'Router', make: 'CISCO', model: 'C900-UNIVERSALK9-M', osVersion: '15.8(3)M6' },
  { deviceName: 'ECLT-TZP106-RTR15153', status: 'UP', loopbackIP: '172.46.138.46', deviceType: 'Router', make: 'Cisco', model: 'cisco841', osVersion: '15.8(3)M6' },
  { deviceName: 'ECLT-HYD1167-RTR8852', status: 'UP', loopbackIP: '172.42.223.253', deviceType: 'Router', make: 'Cisco', model: 'cisco841', osVersion: '15.8(3)M1a' },
  { deviceName: 'ECLT-TCY130-RTR15763', status: 'UP', loopbackIP: '172.46.87.90', deviceType: 'Router', make: 'CISCO', model: 'C900-UNIVERSALK9-M', osVersion: '15.8(3)M6' },
  { deviceName: 'ECLT-MUM1578-RTR15786', status: 'UP', loopbackIP: '172.46.186.103', deviceType: 'Router', make: 'CISCO', model: 'C900-UNIVERSALK9-M', osVersion: '15.8(3)M6' },
  { deviceName: 'ECLT-AMR223-RTR16147', status: 'UP', loopbackIP: '172.46.32.87', deviceType: 'Router', make: 'CISCO', model: 'C900-UNIVERSALK9-M', osVersion: '15.8(3)M6' },
  { deviceName: 'ECLT-RED543-RTR9634', status: 'UP', loopbackIP: '172.42.99.44', deviceType: 'Router', make: 'Cisco', model: 'cisco841', osVersion: '15.5(3)M5' },
  { deviceName: 'ECLT-VJW137-RTR5401', status: 'UP', loopbackIP: '172.42.72.35', deviceType: 'Router', make: 'Cisco', model: 'cisco841', osVersion: '15.5(3)M5' },
  { deviceName: 'ECLT-PUN269-RTR7172', status: 'UP', loopbackIP: '172.42.202.74', deviceType: 'Router', make: 'Cisco', model: 'cisco841', osVersion: '15.5(3)M5' },
  { deviceName: 'ECLT-BDN196-RTR7187', status: 'UP', loopbackIP: '172.38.150.120', deviceType: 'Router', make: 'Cisco', model: 'cisco841', osVersion: '15.8(3)M1a' },
  { deviceName: 'ECLT-TMU101-RTR6931', status: 'UP', loopbackIP: '172.43.20.217', deviceType: 'Router', make: 'Cisco', model: 'cisco841', osVersion: '15.8(3)M1a' },
  { deviceName: 'ECLT-BLR740-RTR6093', status: 'UP', loopbackIP: '172.42.149.133', deviceType: 'Router', make: 'Cisco', model: 'cisco841', osVersion: '15.5(3)M5' },
  { deviceName: 'ECLT-HYD145-RTR9245', status: 'UP', loopbackIP: '172.42.119.254', deviceType: 'Router', make: 'Cisco', model: 'cisco841', osVersion: '15.5(3)M5' },
  { deviceName: 'ECLT-ASN104-RTR6745', status: 'UP', loopbackIP: '172.43.13.57', deviceType: 'Router', make: 'Cisco', model: 'cisco841', osVersion: '15.8(3)M1a' },
  { deviceName: 'ECLT-KOL353-RTR8988', status: 'UP', loopbackIP: '172.43.142.41', deviceType: 'Router', make: 'Cisco', model: 'cisco841', osVersion: '15.8(3)M1a' },
  { deviceName: 'ECLT-HSN123-RTR15791', status: 'UP', loopbackIP: '172.46.232.99', deviceType: 'Router', make: 'CISCO', model: 'C900-UNIVERSALK9-M', osVersion: '15.8(3)M6' },
  { deviceName: 'ECLT-TCN113-RTR16633', status: 'UP', loopbackIP: '172.45.253.225', deviceType: 'Router', make: 'CISCO', model: 'C900-UNIVERSALK9-M', osVersion: '15.8(3)M6' },
  { deviceName: 'DEVICE-DOWN-TEST-001', status: 'DOWN', loopbackIP: '172.45.100.1', deviceType: 'Router', make: 'Huawei', model: 'NE40E', osVersion: '8.200' },
  { deviceName: 'DEVICE-DOWN-TEST-002', status: 'DOWN', loopbackIP: '172.45.100.2', deviceType: 'Router', make: 'Juniper', model: 'MX480', osVersion: '21.4R1' },
];

const sampleLinks: LinkData[] = [
  { customerCode: '003QN', loopbackIP: '122.187.126.135', wanIP: '122.185.100.154', bandwidth: 10240, ecrmProduct: 'Managed Internet', deviceType: 'Router', make: 'Huawei', serviceFlavor: 'Fully Managed', businessProfile: 'MTWTF[1000-1800]', region: 'South', state: 'Tamil Nadu', location: 'Kanchipuram', linkType: '', serviceType: 'Internet', scanType: 'SNMP', linkStatus: 'UP' },
  { customerCode: '25OA9', loopbackIP: '182.79.126.106', wanIP: '125.20.224.170', bandwidth: 51200, ecrmProduct: 'Managed Internet', deviceType: 'Router', make: 'Fortinet', serviceFlavor: 'Fully Managed', businessProfile: '24*7', region: 'West', state: 'Rajasthan', location: 'Jaipur', linkType: '', serviceType: 'Internet Lease Line', scanType: 'SNMP', linkStatus: 'UP' },
  { customerCode: '20AV', loopbackIP: '122.187.223.47', wanIP: '182.79.53.142', bandwidth: 30720, ecrmProduct: 'Managed Internet', deviceType: 'Router', make: 'Fortinet', serviceFlavor: 'Fully Managed', businessProfile: 'MTWTF[1000-1800]', region: 'West', state: 'Maharashtra', location: 'Mumbai', linkType: '', serviceType: 'Internet', scanType: 'SNMP', linkStatus: 'UP' },
  { customerCode: 'PIY3', loopbackIP: '182.79.92.111', wanIP: '182.79.86.18', bandwidth: 10240, ecrmProduct: 'Managed Internet', deviceType: 'Router', make: 'Inventum', serviceFlavor: 'Fully Managed', businessProfile: '24*7', region: 'East', state: 'Assam', location: 'Barpeta', linkType: '', serviceType: 'Internet', scanType: 'SNMP', linkStatus: 'UP' },
  { customerCode: '01A6A', loopbackIP: '125.20.255.172', wanIP: '125.20.253.50', bandwidth: 102400, ecrmProduct: 'Managed Internet', deviceType: 'Router', make: 'Fortinet', serviceFlavor: 'Fully Managed', businessProfile: 'SMTWTFS[1000-1800]', region: 'East', state: 'Bihar', location: 'Madhubani', linkType: '', serviceType: 'Internet Lease Line', scanType: 'SNMP', linkStatus: 'UP' },
  { customerCode: 'PIPZ', loopbackIP: '172.38.249.1', wanIP: '172.42.193.246', bandwidth: 20480, ecrmProduct: 'SD WAN-MPLS', deviceType: 'Router', make: 'Cisco', serviceFlavor: 'Fully Managed', businessProfile: 'MTWTFS[00:00-23:59]', region: 'East', state: 'West Bengal', location: 'Kolkata', linkType: '', serviceType: 'MPLS', scanType: 'SNMP', linkStatus: 'DOWN', linkDownSince: '31 days, 18:11:57' },
  { customerCode: 'PIPZ', loopbackIP: '172.37.229.143', wanIP: '172.37.24.102', bandwidth: 2048, ecrmProduct: 'Managed MPLS', deviceType: 'Router', make: 'Cisco', serviceFlavor: 'Fully Managed', businessProfile: 'MTWTFS[1000-1700]', region: 'East', state: 'West Bengal', location: 'Siliguri', linkType: '', serviceType: 'MPLS', scanType: 'SNMP', linkStatus: 'DOWN', linkDownSince: '67 days, 1:59:17' },
  { customerCode: 'PIPZ', loopbackIP: '172.38.207.194', wanIP: '172.38.206.142', bandwidth: 5120, ecrmProduct: 'Managed MPLS', deviceType: 'Router', make: 'Cisco', serviceFlavor: 'Fully Managed', businessProfile: 'MTWTFS[1000-1700]', region: 'North', state: 'Jammu and Kashmir', location: 'Jammu', linkType: '', serviceType: 'MPLS', scanType: 'SNMP', linkStatus: 'DOWN', linkDownSince: '60 days, 3:00:07' },
  { customerCode: 'LINK-A', loopbackIP: '172.38.100.1', wanIP: '172.38.100.2', bandwidth: 100000, ecrmProduct: 'Managed MPLS', deviceType: 'Router', make: 'Cisco', serviceFlavor: 'Partially Managed', businessProfile: '24*7', region: 'North', state: 'Delhi', location: 'New Delhi', linkType: '', serviceType: 'MPLS', scanType: 'ICMP', linkStatus: 'UP' },
  { customerCode: 'LINK-B', loopbackIP: '172.38.100.3', wanIP: '172.38.100.4', bandwidth: 50000, ecrmProduct: 'Managed Internet', deviceType: 'Router', make: 'Huawei', serviceFlavor: 'Partially Managed', businessProfile: 'MTWTF[0900-1800]', region: 'South', state: 'Karnataka', location: 'Bangalore', linkType: '', serviceType: 'Internet', scanType: 'SNMP', linkStatus: 'UP' },
  { customerCode: 'LINK-C', loopbackIP: '172.38.100.5', wanIP: '172.38.100.6', bandwidth: 25000, ecrmProduct: 'SD WAN-MPLS', deviceType: 'Router', make: 'Juniper', serviceFlavor: 'Fully Managed', businessProfile: '24*7', region: 'South', state: 'Telangana', location: 'Hyderabad', linkType: '', serviceType: 'MPLS', scanType: 'SNMP', linkStatus: 'UP' },
  { customerCode: 'LINK-D', loopbackIP: '172.38.100.7', wanIP: '172.38.100.8', bandwidth: 15000, ecrmProduct: 'Managed Internet', deviceType: 'Router', make: 'Fortinet', serviceFlavor: 'Fully Managed', businessProfile: 'MTWTFS[0800-2000]', region: 'West', state: 'Gujarat', location: 'Ahmedabad', linkType: '', serviceType: 'Internet', scanType: 'ICMP', linkStatus: 'DOWN', linkDownSince: '5 days, 12:30:00' },
];

export function useDemoData() {
  const { nodes, links, setNodes, setLinks } = useInventoryStore();
  const [isLoading, setIsLoading] = useState(false);

  const loadDemoData = () => {
    setIsLoading(true);
    // Simulate processing delay
    setTimeout(() => {
      setNodes(sampleNodes);
      setLinks(sampleLinks);
      setIsLoading(false);
    }, 1000);
  };

  const hasData = nodes.length > 0 || links.length > 0;

  return { loadDemoData, isLoading, hasData };
}
