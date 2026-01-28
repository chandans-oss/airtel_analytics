import { ChartType } from '@/types/inventory';

export interface ChartRecommendation {
    type: ChartType;
    label: string;
    icon: string;
    reason: string;
    compatibility: 'excellent' | 'good' | 'fair' | 'poor';
}

export function analyzeAllChartTypes(data: any[]): { recommendations: ChartRecommendation[], others: ChartRecommendation[] } {
    if (!data || data.length === 0) {
        return { recommendations: [], others: [] };
    }

    const allTypes: ChartType[] = ['bar', 'pie', 'donut', 'line', 'table', 'treemap', 'scatter'];
    const categoryCount = data.length;
    const hasNumericValues = data.every(item => typeof item.value === 'number');
    const hasScatterData = data.every(item => 'x' in item && 'y' in item);

    const results: ChartRecommendation[] = allTypes.map(type => {
        let label = '';
        let icon = '';
        let reason = '';
        let compatibility: 'excellent' | 'good' | 'fair' | 'poor' = 'good';

        switch (type) {
            case 'bar':
                label = 'Bar Chart';
                icon = '📊';
                reason = 'Best for comparing categories';
                compatibility = 'excellent';
                break;
            case 'pie':
                label = 'Pie Chart';
                icon = '🥧';
                reason = 'Shows proportions of a whole';
                if (categoryCount > 6) {
                    compatibility = 'poor';
                    reason = 'Too many segments (>6)';
                } else if (categoryCount <= 4) {
                    compatibility = 'excellent';
                }
                break;
            case 'donut':
                label = 'Donut Chart';
                icon = '🍩';
                reason = 'Modern alternative to pie';
                if (categoryCount > 6) {
                    compatibility = 'poor';
                    reason = 'Too many segments (>6)';
                } else if (categoryCount <= 4) {
                    compatibility = 'excellent';
                }
                break;
            case 'line':
                label = 'Line Chart';
                icon = '📈';
                reason = 'Shows trends or sequences';
                compatibility = 'fair';
                break;
            case 'table':
                label = 'Table View';
                icon = '📋';
                reason = 'Precise values and details';
                compatibility = categoryCount > 10 ? 'excellent' : 'good';
                break;
            case 'treemap':
                label = 'Treemap';
                icon = '🔲';
                reason = 'Hierarchy & dense categorization';
                compatibility = categoryCount > 8 ? 'good' : 'fair';
                break;
            case 'scatter':
                label = 'Scatter Plot';
                icon = '✨';
                reason = 'Correlation between two variables';
                compatibility = hasScatterData ? 'excellent' : 'poor';
                break;
        }

        return { type, label, icon, reason, compatibility };
    });

    return {
        recommendations: results.filter(r => r.compatibility === 'excellent' || r.compatibility === 'good'),
        others: results.filter(r => r.compatibility === 'fair' || r.compatibility === 'poor')
    };
}

export function getCompatibilityColor(compatibility: 'excellent' | 'good' | 'fair' | 'poor'): string {
    const colors = {
        excellent: 'hsl(160, 84%, 39%)', // Green
        good: 'hsl(174, 72%, 45%)',      // Teal
        fair: 'hsl(38, 92%, 50%)',       // Orange
        poor: 'hsl(12, 85%, 55%)'        // Red
    };
    return colors[compatibility];
}
