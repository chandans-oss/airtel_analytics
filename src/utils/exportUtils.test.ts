import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportToCSV } from './exportUtils';
import Papa from 'papaparse';

// Mock Papa.unparse
vi.mock('papaparse', () => ({
    default: {
        unparse: vi.fn((data) => 'mocked,csv,data'),
    },
}));

describe('exportUtils', () => {
    describe('exportToCSV', () => {
        let createElementSpy: any;
        let appendChildSpy: any;
        let removeChildSpy: any;
        let mockLink: any;

        beforeEach(() => {
            // Mock DOM methods
            mockLink = {
                setAttribute: vi.fn(),
                click: vi.fn(),
                style: {},
            };

            createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
            appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink);
            removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink);

            // Mock URL.createObjectURL
            global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
            global.Blob = vi.fn() as any;
        });

        afterEach(() => {
            vi.restoreAllMocks();
        });

        it('should export data to CSV with default settings', () => {
            const testData = [
                { name: 'Device1', status: 'UP', ip: '10.0.0.1' },
                { name: 'Device2', status: 'DOWN', ip: '10.0.0.2' },
            ];

            exportToCSV(testData, 'test-export');

            expect(Papa.unparse).toHaveBeenCalledWith(testData);
            expect(createElementSpy).toHaveBeenCalledWith('a');
            expect(mockLink.setAttribute).toHaveBeenCalledWith('href', 'blob:mock-url');
            expect(mockLink.setAttribute).toHaveBeenCalledWith('download', 'test-export.csv');
            expect(mockLink.click).toHaveBeenCalled();
            expect(appendChildSpy).toHaveBeenCalled();
            expect(removeChildSpy).toHaveBeenCalled();
        });

        it('should filter data by columns when specified', () => {
            const testData = [
                { name: 'Device1', status: 'UP', ip: '10.0.0.1', extra: 'data' },
                { name: 'Device2', status: 'DOWN', ip: '10.0.0.2', extra: 'data' },
            ];

            const columns = [
                { header: 'Name', dataKey: 'name' },
                { header: 'Status', dataKey: 'status' },
            ];

            exportToCSV(testData, 'filtered-export', columns);

            expect(Papa.unparse).toHaveBeenCalledWith([
                { Name: 'Device1', Status: 'UP' },
                { Name: 'Device2', Status: 'DOWN' },
            ]);
        });

        it('should handle empty data array', () => {
            const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

            exportToCSV([], 'empty-export');

            expect(consoleWarnSpy).toHaveBeenCalledWith('No data to export');
            expect(Papa.unparse).not.toHaveBeenCalled();
            expect(createElementSpy).not.toHaveBeenCalled();

            consoleWarnSpy.mockRestore();
        });

        it('should handle null data', () => {
            const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

            exportToCSV(null as any, 'null-export');

            expect(consoleWarnSpy).toHaveBeenCalledWith('No data to export');
            expect(Papa.unparse).not.toHaveBeenCalled();

            consoleWarnSpy.mockRestore();
        });

        it('should create Blob with correct MIME type', () => {
            const testData = [{ id: 1, value: 'test' }];

            exportToCSV(testData, 'test');

            expect(global.Blob).toHaveBeenCalledWith(
                ['mocked,csv,data'],
                { type: 'text/csv;charset=utf-8;' }
            );
        });

        it('should set link visibility to hidden', () => {
            const testData = [{ id: 1 }];

            exportToCSV(testData, 'test');

            expect(mockLink.style.visibility).toBe('hidden');
        });
    });
});
