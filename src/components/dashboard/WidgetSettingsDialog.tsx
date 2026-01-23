import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useInventoryStore } from '@/store/inventoryStore';
import type { ChartType, WidgetConfig } from '@/types/inventory';
import { BarChart3, PieChart, Table, LineChart, Hash } from 'lucide-react';

interface WidgetSettingsDialogProps {
    id: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function WidgetSettingsDialog({ id, open, onOpenChange }: WidgetSettingsDialogProps) {
    const { widgetConfigs, updateWidgetConfig } = useInventoryStore();
    const currentConfig = widgetConfigs[id] || {
        id,
        title: id,
        chartType: 'pie',
        timeframe: '1h'
    };

    const [title, setTitle] = useState(currentConfig.title);
    const [chartType, setChartType] = useState<ChartType>(currentConfig.chartType);
    const [timeframe, setTimeframe] = useState(currentConfig.timeframe);

    const handleSave = () => {
        updateWidgetConfig(id, { title, chartType, timeframe });
        onOpenChange(false);
    };

    const chartOptions: { value: ChartType; label: string; icon: any }[] = [
        { value: 'pie', label: 'Pie Chart', icon: PieChart },
        { value: 'donut', label: 'Donut Chart', icon: PieChart },
        { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
        { value: 'histogram', label: 'Histogram', icon: Hash },
        { value: 'line', label: 'Line Chart', icon: LineChart },
        { value: 'table', label: 'Table View', icon: Table },
    ];

    const timeframeOptions = [
        { value: '1h', label: 'Last 1 Hour' },
        { value: '3h', label: 'Last 3 Hours' },
        { value: '6h', label: 'Last 6 Hours' },
        { value: '1d', label: 'Last 24 Hours' },
        { value: '7d', label: 'Last 7 Days' },
        { value: '1m', label: 'Last Month' },
        { value: '1q', label: 'Last Quarter' },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Widget Settings</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Widget Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="col-span-3"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label>Chart Type</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {chartOptions.map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setChartType(opt.value)}
                                    className={`flex flex-col items-center justify-center rounded-lg border p-3 transition-colors ${chartType === opt.value
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-border bg-card hover:bg-muted/50'
                                        }`}
                                >
                                    <opt.icon className="h-5 w-5 mb-1" />
                                    <span className="text-[10px] font-medium">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="timeframe">Timeframe</Label>
                        <Select value={timeframe} onValueChange={setTimeframe}>
                            <SelectTrigger id="timeframe">
                                <SelectValue placeholder="Select timeframe" />
                            </SelectTrigger>
                            <SelectContent>
                                {timeframeOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
