import { describe, it, expect, beforeEach } from 'vitest';
import { useInventoryStore } from './inventoryStore';
import type { NodeData, LinkData, EventData } from '@/types/inventory';

describe('inventoryStore', () => {
    beforeEach(() => {
        // Reset store before each test
        const store = useInventoryStore.getState();
        store.setNodes([]);
        store.setLinks([]);
        store.setAllEvents([]);
        store.clearFilters();
        store.setHierarchyPath([]);
    });

    describe('State Initialization', () => {
        it('should initialize with empty arrays', () => {
            const state = useInventoryStore.getState();
            expect(state.nodes).toEqual([]);
            expect(state.links).toEqual([]);
            expect(state.allEvents).toEqual([]);
        });

        it('should initialize with default filter states', () => {
            const state = useInventoryStore.getState();
            expect(state.nodeFilters).toEqual({});
            expect(state.linkFilters).toEqual({});
            expect(state.activeFilters).toEqual({});
        });

        it('should initialize with default UI states', () => {
            const state = useInventoryStore.getState();
            expect(state.selectedModule).toBe('unified');
            expect(state.sidebarOpen).toBe(false);
            expect(state.toolSidebarOpen).toBe(false);
            expect(state.isProcessing).toBe(false);
        });
    });

    describe('Data Management', () => {
        it('should set nodes data', () => {
            const mockNodes: NodeData[] = [
                {
                    deviceName: 'Router1',
                    status: 'UP',
                    loopbackIP: '10.0.0.1',
                    deviceType: 'Router',
                    make: 'Cisco',
                    model: 'ASR9000',
                    osVersion: 'IOS-XR 7.0',
                    region: 'North',
                },
                {
                    deviceName: 'Switch1',
                    status: 'DOWN',
                    loopbackIP: '10.0.0.2',
                    deviceType: 'Switch',
                    make: 'Juniper',
                    model: 'EX4300',
                    osVersion: 'Junos 18.4',
                    region: 'South',
                },
            ];

            useInventoryStore.getState().setNodes(mockNodes);

            expect(useInventoryStore.getState().nodes).toEqual(mockNodes);
            expect(useInventoryStore.getState().nodes).toHaveLength(2);
        });

        it('should set links data', () => {
            const mockLinks: LinkData[] = [
                {
                    customerCode: 'CUST001',
                    customerName: 'Customer 1',
                    loopbackIP: '10.0.0.1',
                    wanIP: '192.168.1.1',
                    bandwidth: 100,
                    deviceType: 'Router',
                    make: 'Cisco',
                    serviceFlavor: 'MPLS',
                    region: 'North',
                    state: 'UP',
                    linkStatus: 'UP',
                },
            ];

            useInventoryStore.getState().setLinks(mockLinks);

            expect(useInventoryStore.getState().links).toEqual(mockLinks);
            expect(useInventoryStore.getState().links).toHaveLength(1);
        });

        it('should set events data', () => {
            const mockEvents: EventData[] = [
                {
                    eventId: 'EVT001',
                    eventType: 'Link Down',
                    deviceName: 'Router1',
                    ip: '10.0.0.1',
                    severity: 'CRITICAL',
                    startTime: '2026-02-01T10:00:00Z',
                },
            ];

            useInventoryStore.getState().setAllEvents(mockEvents);

            expect(useInventoryStore.getState().allEvents).toEqual(mockEvents);
        });
    });

    describe('Filter Management', () => {
        beforeEach(() => {
            // Setup test data
            const mockLinks: LinkData[] = [
                {
                    customerCode: 'CUST001',
                    loopbackIP: '10.0.0.1',
                    wanIP: '192.168.1.1',
                    bandwidth: 100,
                    deviceType: 'Router',
                    make: 'Cisco',
                    serviceFlavor: 'MPLS',
                    region: 'North',
                    state: 'UP',
                    linkStatus: 'UP',
                },
                {
                    customerCode: 'CUST002',
                    loopbackIP: '10.0.0.2',
                    wanIP: '192.168.1.2',
                    bandwidth: 50,
                    deviceType: 'Switch',
                    make: 'Juniper',
                    serviceFlavor: 'Internet',
                    region: 'South',
                    state: 'UP',
                    linkStatus: 'DOWN',
                },
            ];

            useInventoryStore.getState().setLinks(mockLinks);
        });

        it('should toggle filter on', () => {
            useInventoryStore.getState().toggleFilter('region', 'North', 'links');

            expect(useInventoryStore.getState().linkFilters.region).toEqual(['North']);
        });

        it('should toggle filter off when clicked again', () => {
            useInventoryStore.getState().toggleFilter('region', 'North', 'links');
            useInventoryStore.getState().toggleFilter('region', 'North', 'links');

            expect(useInventoryStore.getState().linkFilters.region).toBeUndefined();
        });

        it('should support multiple filter values for same field', () => {
            useInventoryStore.getState().addFilter('region', 'North', 'links');
            useInventoryStore.getState().addFilter('region', 'South', 'links');

            expect(useInventoryStore.getState().linkFilters.region).toEqual(['North', 'South']);
        });

        it('should remove specific filter value', () => {
            useInventoryStore.getState().addFilter('region', 'North', 'links');
            useInventoryStore.getState().addFilter('region', 'South', 'links');

            useInventoryStore.getState().removeFilter('region', 'North', 'links');

            expect(useInventoryStore.getState().linkFilters.region).toEqual(['South']);
        });

        it('should clear all filters for a field', () => {
            useInventoryStore.getState().toggleFilter('region', 'North', 'links');
            useInventoryStore.getState().toggleFilter('make', 'Cisco', 'links');

            useInventoryStore.getState().clearFilterField('region', 'links');

            expect(useInventoryStore.getState().linkFilters.region).toBeUndefined();
            expect(useInventoryStore.getState().linkFilters.make).toEqual(['Cisco']);
        });

        it('should clear all filters', () => {
            useInventoryStore.getState().toggleFilter('region', 'North', 'links');
            useInventoryStore.getState().toggleFilter('make', 'Cisco', 'links');

            useInventoryStore.getState().clearFilters('links');

            expect(useInventoryStore.getState().linkFilters).toEqual({});
        });
    });

    describe('Computed Selectors', () => {
        beforeEach(() => {
            const mockNodes: NodeData[] = [
                {
                    deviceName: 'Router1',
                    status: 'UP',
                    loopbackIP: '10.0.0.1',
                    deviceType: 'Router',
                    make: 'Cisco',
                    model: 'ASR9000',
                    osVersion: 'IOS-XR 7.0',
                    region: 'North',
                },
                {
                    deviceName: 'Switch1',
                    status: 'DOWN',
                    loopbackIP: '10.0.0.2',
                    deviceType: 'Switch',
                    make: 'Juniper',
                    model: 'EX4300',
                    osVersion: 'Junos 18.4',
                    region: 'South',
                },
                {
                    deviceName: 'Router2',
                    status: 'UP',
                    loopbackIP: '10.0.0.3',
                    deviceType: 'Router',
                    make: 'Cisco',
                    model: 'ASR9000',
                    osVersion: 'IOS-XR 7.0',
                    region: 'North',
                },
            ];

            const mockLinks: LinkData[] = [
                {
                    customerCode: 'CUST001',
                    loopbackIP: '10.0.0.1',
                    wanIP: '192.168.1.1',
                    bandwidth: 100,
                    deviceType: 'Router',
                    make: 'Cisco',
                    serviceFlavor: 'MPLS',
                    region: 'North',
                    state: 'UP',
                    linkStatus: 'UP',
                },
                {
                    customerCode: 'CUST002',
                    loopbackIP: '10.0.0.2',
                    wanIP: '192.168.1.2',
                    bandwidth: 50,
                    deviceType: 'Switch',
                    make: 'Juniper',
                    serviceFlavor: 'Internet',
                    region: 'South',
                    state: 'UP',
                    linkStatus: 'DOWN',
                },
            ];

            useInventoryStore.getState().setNodes(mockNodes);
            useInventoryStore.getState().setLinks(mockLinks);
        });

        it('should return all nodes when no filters applied', () => {
            const filteredNodes = useInventoryStore.getState().getFilteredNodes();
            expect(filteredNodes).toHaveLength(3);
        });

        it('should filter nodes by region', () => {
            useInventoryStore.getState().toggleFilter('region', 'North', 'nodes');

            const filteredNodes = useInventoryStore.getState().getFilteredNodes();
            expect(filteredNodes).toHaveLength(2);
            expect(filteredNodes.every(node => node.region === 'North')).toBe(true);
        });

        it('should filter nodes by multiple criteria', () => {
            useInventoryStore.getState().toggleFilter('region', 'North', 'nodes');
            useInventoryStore.getState().toggleFilter('make', 'Cisco', 'nodes');

            const filteredNodes = useInventoryStore.getState().getFilteredNodes();
            expect(filteredNodes).toHaveLength(2);
            expect(filteredNodes.every(node => node.region === 'North' && node.make === 'Cisco')).toBe(true);
        });

        it('should filter links by status', () => {
            useInventoryStore.getState().toggleFilter('linkStatus', 'DOWN', 'links');

            const filteredLinks = useInventoryStore.getState().getFilteredLinks();
            expect(filteredLinks).toHaveLength(1);
            expect(filteredLinks[0].linkStatus).toBe('DOWN');
        });

        it('should return stats correctly', () => {
            const stats = useInventoryStore.getState().getStats();

            expect(stats.totalNodes).toBe(3);
            expect(stats.onlineNodes).toBe(2);
            expect(stats.offlineNodes).toBe(1);
            expect(stats.totalLinks).toBe(2);
            expect(stats.onlineLinks).toBe(1);
            expect(stats.offlineLinks).toBe(1);
            expect(stats.totalCustomers).toBe(5); // Hardcoded in store
            expect(stats.totalSites).toBe(51); // Hardcoded in store
        });
    });

    describe('Hierarchy Management', () => {
        beforeEach(() => {
            const mockLinks: LinkData[] = [
                {
                    customerCode: 'CUST001',
                    loopbackIP: '10.0.0.1',
                    wanIP: '192.168.1.1',
                    bandwidth: 100,
                    deviceType: 'Router',
                    make: 'Cisco',
                    serviceFlavor: 'MPLS',
                    region: 'North',
                    state: 'Delhi',
                    linkStatus: 'UP',
                },
                {
                    customerCode: 'CUST002',
                    loopbackIP: '10.0.0.2',
                    wanIP: '192.168.1.2',
                    bandwidth: 50,
                    deviceType: 'Switch',
                    make: 'Juniper',
                    serviceFlavor: 'Internet',
                    region: 'North',
                    state: 'Punjab',
                    linkStatus: 'DOWN',
                },
            ];

            useInventoryStore.getState().setLinks(mockLinks);
        });

        it('should apply hierarchy path filters', () => {
            useInventoryStore.getState().setHierarchyPath([
                { field: 'region', linkField: 'region', value: 'North', label: 'North' },
            ]);

            const filteredLinks = useInventoryStore.getState().getFilteredLinks();
            expect(filteredLinks).toHaveLength(2);
            expect(filteredLinks.every(link => link.region === 'North')).toBe(true);
        });

        it('should apply multiple hierarchy levels', () => {
            useInventoryStore.getState().setHierarchyPath([
                { field: 'region', linkField: 'region', value: 'North', label: 'North' },
                { field: 'state', linkField: 'state', value: 'Delhi', label: 'Delhi' },
            ]);

            const filteredLinks = useInventoryStore.getState().getFilteredLinks();
            expect(filteredLinks).toHaveLength(1);
            expect(filteredLinks[0].state).toBe('Delhi');
        });

        it('should clear hierarchy path', () => {
            useInventoryStore.getState().setHierarchyPath([
                { field: 'region', linkField: 'region', value: 'North', label: 'North' },
            ]);
            useInventoryStore.getState().setHierarchyPath([]);

            const filteredLinks = useInventoryStore.getState().getFilteredLinks();
            expect(filteredLinks).toHaveLength(2);
        });
    });

    describe('UI State Management', () => {
        it('should toggle sidebar state', () => {
            // Reset to false first
            useInventoryStore.getState().setSidebarOpen(false);
            expect(useInventoryStore.getState().sidebarOpen).toBe(false);

            useInventoryStore.getState().toggleSidebar();
            expect(useInventoryStore.getState().sidebarOpen).toBe(true);

            useInventoryStore.getState().toggleSidebar();
            expect(useInventoryStore.getState().sidebarOpen).toBe(false);
        });

        it('should set selected module', () => {
            useInventoryStore.getState().setSelectedModule('events');

            expect(useInventoryStore.getState().selectedModule).toBe('events');
        });

        it('should toggle processing state', () => {
            useInventoryStore.getState().setIsProcessing(true);

            expect(useInventoryStore.getState().isProcessing).toBe(true);

            useInventoryStore.getState().setIsProcessing(false);
            expect(useInventoryStore.getState().isProcessing).toBe(false);
        });
    });

    describe('Event Filtering', () => {
        beforeEach(() => {
            // We need nodes for getFilteredEvents to work because it filters by available device names
            const mockNodes: NodeData[] = [
                {
                    deviceName: 'Router1',
                    status: 'UP',
                    loopbackIP: '10.0.0.1',
                    deviceType: 'Router',
                    make: 'Cisco',
                    model: 'ASR9000',
                    osVersion: 'IOS-XR 7.0',
                    region: 'North',
                },
                {
                    deviceName: 'Switch1',
                    status: 'UP',
                    loopbackIP: '10.0.0.2',
                    deviceType: 'Switch',
                    make: 'Juniper',
                    model: 'EX4300',
                    osVersion: 'Junos 18.4',
                    region: 'South',
                },
                {
                    deviceName: 'Router2',
                    status: 'UP',
                    loopbackIP: '10.0.0.3',
                    deviceType: 'Router',
                    make: 'Cisco',
                    model: 'ASR9000',
                    osVersion: 'IOS-XR 7.0',
                    region: 'North',
                },
            ];

            const mockEvents: EventData[] = [
                {
                    eventId: 'EVT001',
                    eventType: 'Link Down',
                    deviceName: 'Router1',
                    ip: '10.0.0.1',
                    severity: 'CRITICAL',
                    startTime: '2026-02-01T10:00:00Z',
                },
                {
                    eventId: 'EVT002',
                    eventType: 'Port Down',
                    deviceName: 'Switch1',
                    ip: '10.0.0.2',
                    severity: 'WARNING',
                    startTime: '2026-02-02T10:00:00Z',
                },
                {
                    eventId: 'EVT003',
                    eventType: 'CPU High',
                    deviceName: 'Router2',
                    ip: '10.0.0.3',
                    severity: 'CRITICAL',
                    startTime: '2026-02-03T10:00:00Z',
                },
            ];

            useInventoryStore.getState().setNodes(mockNodes);
            useInventoryStore.getState().setAllEvents(mockEvents);
        });

        it('should return events for filtered nodes', () => {
            // This tests that getFilteredEvents correctly joins with nodes
            const store = useInventoryStore.getState();
            const filteredEvents = store.getFilteredEvents();
            expect(filteredEvents).toHaveLength(3);
        });

        it('should update event filter state', () => {
            useInventoryStore.getState().setEventSeverities(['CRITICAL']);
            expect(useInventoryStore.getState().eventSeverities).toEqual(['CRITICAL']);
        });
    });
});
