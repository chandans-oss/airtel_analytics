import { useState } from 'react';
import { ChartType } from '@/types/inventory';
import { analyzeAllChartTypes, getCompatibilityColor } from '@/utils/chartRecommendations';
import { BarChart3, PieChart, List, TrendingUp, Circle, Settings2, Check, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
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

interface ChartTypeSelectorProps {
    data: any[];
    currentType: ChartType;
    onTypeChange: (type: ChartType) => void;
    title: string;
    onTitleChange: (title: string) => void;
    variant?: 'default' | 'mini';
}

const CHART_TYPE_ICONS: Record<string, any> = {
    bar: BarChart3,
    histogram: BarChart3,
    pie: PieChart,
    donut: Circle,
    line: TrendingUp,
    table: List,
    treemap: LayoutDashboard,
    scatter: Circle
};

export function ChartTypeSelector({ data, currentType, onTypeChange, title, onTitleChange, variant = 'default' }: ChartTypeSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [tempTitle, setTempTitle] = useState(title);
    const [tempType, setTempType] = useState<ChartType>(currentType);

    const { recommendations, others } = analyzeAllChartTypes(data);
    const isMini = variant === 'mini';

    const handleOpen = () => {
        setTempTitle(title);
        setTempType(currentType);
        setIsOpen(true);
    };

    const handleSave = () => {
        onTitleChange(tempTitle);
        onTypeChange(tempType);
        setIsOpen(false);
    };

    return (
        <>
            <button
                onClick={handleOpen}
                className="rounded-lg p-2 transition-all hover:bg-muted text-muted-foreground hover:text-primary border border-transparent hover:border-border shadow-sm"
                title="Customize Chart"
            >
                <Settings2 size={14} />
            </button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[400px] gap-0 p-0 overflow-hidden rounded-2xl">
                    <DialogHeader className="p-5 border-b">
                        <DialogTitle className="text-lg font-bold">Chart Settings</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 p-5 max-h-[70vh] overflow-y-auto">
                        <div className="space-y-1.5">
                            <Label htmlFor="title" className="text-[10px] font-black uppercase text-muted-foreground/70 tracking-widest">Widget Title</Label>
                            <Input
                                id="title"
                                value={tempTitle}
                                onChange={(e) => setTempTitle(e.target.value)}
                                className="h-9 font-medium text-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase text-muted-foreground/70 tracking-widest">Recommended</Label>
                            <div className="grid grid-cols-1 gap-2">
                                {recommendations.map((rec) => {
                                    const Icon = CHART_TYPE_ICONS[rec.type];
                                    const isActive = tempType === rec.type;
                                    const compatColor = getCompatibilityColor(rec.compatibility);

                                    return (
                                        <button
                                            key={rec.type}
                                            onClick={() => setTempType(rec.type)}
                                            className={cn(
                                                "w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between group",
                                                isActive ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-primary/30"
                                            )}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div className={cn("p-1.5 rounded-lg", isActive ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                                                    <Icon size={16} />
                                                </div>
                                                <div>
                                                    <p className={cn("text-xs font-bold", isActive ? "text-primary" : "text-foreground")}>{rec.label}</p>
                                                    <p className="text-[9px] text-muted-foreground leading-none">{rec.reason}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[8px] font-black uppercase" style={{ color: compatColor }}>{rec.compatibility}</span>
                                                {isActive && <Check size={12} className="text-primary" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {others.length > 0 && (
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase text-muted-foreground/50 tracking-widest">Alternative Views</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {others.map((rec) => {
                                        const Icon = CHART_TYPE_ICONS[rec.type];
                                        const isActive = tempType === rec.type;
                                        return (
                                            <button
                                                key={rec.type}
                                                onClick={() => setTempType(rec.type)}
                                                className={cn(
                                                    "text-left p-2 rounded-lg border transition-all flex items-center gap-2",
                                                    isActive ? "border-primary bg-primary/5" : "border-border"
                                                )}
                                            >
                                                <Icon size={13} className={isActive ? "text-primary" : "text-muted-foreground"} />
                                                <span className={cn("text-xs font-medium", isActive ? "text-primary" : "text-foreground")}>{rec.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="p-4 bg-muted/30 border-t flex sm:justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setIsOpen(false)} className="h-8 text-xs">Cancel</Button>
                        <Button onClick={handleSave} size="sm" className="h-8 text-xs bg-primary hover:bg-primary/90">Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
