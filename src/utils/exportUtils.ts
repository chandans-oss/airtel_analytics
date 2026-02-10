import Papa from 'papaparse';

export const exportToCSV = (data: any[], filename: string, columns?: { header: string; dataKey: string }[]) => {
    if (!data || data.length === 0) {
        console.warn("No data to export");
        return;
    }

    // Prepare data for CSV
    let csvData = data;

    // If columns are specified, filter and map the data accordingly
    if (columns) {
        csvData = data.map(item => {
            const row: Record<string, any> = {};
            columns.forEach(col => {
                row[col.header] = item[col.dataKey];
            });
            return row;
        });
    }

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
