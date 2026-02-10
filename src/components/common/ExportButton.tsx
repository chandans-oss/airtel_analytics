import { Download } from 'lucide-react';
import Papa from 'papaparse';
import { exportToCSV } from '@/utils/exportUtils';

interface ExportButtonProps {
    data: any[];
    filename?: string;
    title?: string;
    columns?: { header: string; dataKey: string }[];
}

export function ExportButton({ data, filename = 'export', columns }: ExportButtonProps) {
    const handleExport = () => {
        exportToCSV(data, filename, columns);
    };

    return (
        <button
            onClick={handleExport}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all opacity-70 hover:opacity-100"
            title="Export to CSV"
        >
            <Download size={14} />
        </button>
    );
}
