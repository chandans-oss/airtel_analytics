import { useEffect } from 'react';
import { useInventoryStore } from '@/store/inventoryStore';
import { parseFullInventoryWorkbook } from '@/utils/dataParser';
import { toast } from 'sonner';

export function useDataInitialization() {
    const {
        setNodes,
        setLinks,
        setActiveEvents,
        setAllEvents,
        setRAInventory,
        setConfigCalendar,
        setConfigFailure,
        setCustomers,
        setIsProcessing
    } = useInventoryStore();

    useEffect(() => {
        const loadDefaultData = async () => {
            setIsProcessing(true);
            try {
                const filePath = '/data/Network Data.xlsx';

                // Check if the file exists first
                const checkResponse = await fetch(filePath, { method: 'HEAD' });
                if (!checkResponse.ok) {
                    console.warn('Network Data.xlsx not found in /public/data/');
                    setIsProcessing(false);
                    return;
                }

                const data = await parseFullInventoryWorkbook(filePath);

                if (data['Node Inventory']) setNodes(data['Node Inventory']);
                if (data['Link Inventory']) setLinks(data['Link Inventory']);
                if (data['Active Events']) setActiveEvents(data['Active Events']);
                if (data['All Events']) setAllEvents(data['All Events']);
                if (data['RA Inventory']) setRAInventory(data['RA Inventory']);
                if (data['Config Calendar View']) setConfigCalendar(data['Config Calendar View']);
                if (data['Config Failure']) setConfigFailure(data['Config Failure']);
                if (data['Customers']) setCustomers(data['Customers']);

                toast.success('Data workbook loaded successfully');
            } catch (error) {
                console.error('Data initialization error:', error);
                toast.error('Failed to load Data.xlsx');
            } finally {
                setIsProcessing(false);
            }
        };

        loadDefaultData();
    }, [
        setNodes,
        setLinks,
        setActiveEvents,
        setAllEvents,
        setRAInventory,
        setConfigCalendar,
        setConfigFailure,
        setCustomers,
        setIsProcessing
    ]);
}
