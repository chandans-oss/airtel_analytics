import { describe, it, expect, beforeEach } from 'vitest';
import { useInventoryStore } from '@/store/inventoryStore';
import type { LinkData, NodeData } from '@/types/inventory';

/**
 * Integration tests for the complete filter workflow
 * Tests the interaction between filters, store, and data filtering
 */
describe('Filter Workflow Integration', () => {
    beforeEach(() => {
        // Reset store
        const store = useInventoryStore.getState();
        store.setNodes([]);
        store.setLinks([]);
        store.clearFilters();
        store.setHierarchyPath([]);
    });

    describe('End-to-End Filter Application', () => {
        it('should filter links through complete workflow', () => {
            const store = useInventoryStore.getState();

            // Step 1: Load test data
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
                    region: 'South',
                    state: 'Karnataka',
                    linkStatus: 'DOWN',
                },
                {
                    customerCode: 'CUST003',
                    loopbackIP: '10.0.0.3',
                    wanIP: '192.168.1.3',
                    bandwidth: 200,
                    deviceType: 'Router',
                    make: 'Cisco',
                    serviceFlavor: 'MPLS',
                    region: 'North',
                    state: 'Punjab',
                    linkStatus: 'UP',
                },
            ];

            store.setLinks(mockLinks);

            // Step 2: Apply single filter
            store.toggleFilter('region', 'North', 'links');
            let filtered = useInventoryStore.getState().getFilteredLinks();
            expect(filtered).toHaveLength(2);

            // Step 3: Apply additional filter
            store.toggleFilter('make', 'Cisco', 'links');
            filtered = useInventoryStore.getState().getFilteredLinks();
            expect(filtered).toHaveLength(2);
            expect(filtered.every(l => l.region === 'North' && l.make === 'Cisco')).toBe(true);

            // Step 4: Add third filter
            store.toggleFilter('linkStatus', 'UP', 'links');
            filtered = useInventoryStore.getState().getFilteredLinks();
            expect(filtered).toHaveLength(2);

            // Step 5: Remove one filter
            store.removeFilter('linkStatus', 'UP', 'links');
            filtered = useInventoryStore.getState().getFilteredLinks();
            expect(filtered).toHaveLength(2);

            // Step 6: Clear all filters
            store.clearFilters('links');
            filtered = useInventoryStore.getState().getFilteredLinks();
            expect(filtered).toHaveLength(3);
        });

        it('should handle hierarchy drill-down with filters', () => {
            const store = useInventoryStore.getState();

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
                    city: 'New Delhi',
                    linkStatus: 'UP',
                },
                {
                    customerCode: 'CUST002',
                    loopbackIP: '10.0.0.2',
                    wanIP: '192.168.1.2',
                    bandwidth: 50,
                    deviceType: 'Router',
                    make: 'Cisco',
                    serviceFlavor: 'MPLS',
                    region: 'North',
                    state: 'Delhi',
                    city: 'Gurgaon',
                    linkStatus: 'UP',
                },
                {
                    customerCode: 'CUST003',
                    loopbackIP: '10.0.0.3',
                    wanIP: '192.168.1.3',
                    bandwidth: 200,
                    deviceType: 'Switch',
                    make: 'Juniper',
                    serviceFlavor: 'Internet',
                    region: 'South',
                    state: 'Karnataka',
                    city: 'Bangalore',
                    linkStatus: 'DOWN',
                },
            ];

            store.setLinks(mockLinks);

            // Drill down: Region -> State -> City
            store.setHierarchyPath([
                { field: 'region', linkField: 'region', value: 'North', label: 'North' },
            ]);
            let filtered = useInventoryStore.getState().getFilteredLinks();
            expect(filtered).toHaveLength(2);

            store.setHierarchyPath([
                { field: 'region', linkField: 'region', value: 'North', label: 'North' },
                { field: 'state', linkField: 'state', value: 'Delhi', label: 'Delhi' },
            ]);
            filtered = useInventoryStore.getState().getFilteredLinks();
            expect(filtered).toHaveLength(2);

            // Apply additional filter on top of hierarchy
            store.toggleFilter('make', 'Cisco', 'links');
            filtered = useInventoryStore.getState().getFilteredLinks();
            expect(filtered).toHaveLength(2);
            expect(filtered.every(l => l.state === 'Delhi' && l.make === 'Cisco')).toBe(true);
        });

        it('should handle cross-module filtering (nodes and links)', () => {
            const store = useInventoryStore.getState();

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
            ];

            store.setNodes(mockNodes);
            store.setLinks(mockLinks);

            // Filter nodes
            store.toggleFilter('region', 'North', 'nodes');
            let filteredNodes = useInventoryStore.getState().getFilteredNodes();
            expect(filteredNodes).toHaveLength(1);

            // Filter links independently
            store.toggleFilter('linkStatus', 'UP', 'links');
            let filteredLinks = useInventoryStore.getState().getFilteredLinks();
            expect(filteredLinks).toHaveLength(1);

            // Verify independence
            expect(filteredNodes[0].deviceName).toBe('Router1');
            expect(filteredLinks[0].customerCode).toBe('CUST001');
        });

        it('should update stats after filtering', () => {
            const store = useInventoryStore.getState();

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

            useInventoryStore.getState().setNodes(mockNodes);

            // Check initial stats
            let stats = useInventoryStore.getState().getStats();
            expect(stats.totalNodes).toBe(3);
            expect(stats.onlineNodes).toBe(2);
            expect(stats.offlineNodes).toBe(1);

            // Stats SHOULD change with filters because getStats uses getFilteredNodes()
            useInventoryStore.getState().toggleFilter('region', 'North', 'nodes');

            stats = useInventoryStore.getState().getStats();
            expect(stats.totalNodes).toBe(2); // Filtered to North only
            expect(stats.onlineNodes).toBe(2); // Both North nodes are UP
            expect(stats.offlineNodes).toBe(0); // No offline nodes in North
        });
    });

    describe('Filter State Persistence', () => {
        it('should maintain filter state across module changes', () => {
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
            ];

            useInventoryStore.getState().setLinks(mockLinks);
            useInventoryStore.getState().toggleFilter('region', 'North', 'links');

            // Change module
            useInventoryStore.getState().setSelectedModule('events');

            // Verify filter persists
            expect(useInventoryStore.getState().linkFilters.region).toEqual(['North']);

            // Change back
            useInventoryStore.getState().setSelectedModule('inventory');

            // Filter should still be there
            const filtered = useInventoryStore.getState().getFilteredLinks();
            expect(filtered).toHaveLength(1);
        });
    });

    describe('Edge Cases', () => {
        it('should handle filtering with no data', () => {
            useInventoryStore.getState().toggleFilter('region', 'North', 'links');
            const filtered = useInventoryStore.getState().getFilteredLinks();

            expect(filtered).toEqual([]);
        });

        it('should handle filter values that dont match any data', () => {
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
            ];

            useInventoryStore.getState().setLinks(mockLinks);
            useInventoryStore.getState().toggleFilter('region', 'NonExistent', 'links');

            const filtered = useInventoryStore.getState().getFilteredLinks();
            expect(filtered).toEqual([]);
        });

        it('should handle rapid filter toggling', () => {
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
            ];

            useInventoryStore.getState().setLinks(mockLinks);

            // Rapidly toggle the same filter
            useInventoryStore.getState().toggleFilter('region', 'North', 'links');
            useInventoryStore.getState().toggleFilter('region', 'North', 'links');
            useInventoryStore.getState().toggleFilter('region', 'North', 'links');

            const filtered = useInventoryStore.getState().getFilteredLinks();
            // Should end in "on" state (odd number of toggles)
            expect(filtered).toHaveLength(1);
        });
    });
});
