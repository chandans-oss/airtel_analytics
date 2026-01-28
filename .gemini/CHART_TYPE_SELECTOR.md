# Intelligent Chart Type Selector - Feature Documentation

## 🎯 Overview

The Chart Type Selector is an intelligent UI component that analyzes your data and recommends the most suitable chart types. It appears on hover in each analytics widget, allowing users to switch between different visualizations while ensuring data compatibility.

## ✨ Key Features

### 1. **Data-Driven Recommendations**
- Automatically analyzes data structure (category count, values, distribution)
- Only shows chart types that are compatible with your data
- Ranks recommendations as "EXCELLENT", "GOOD", or "FAIR"

### 2. **Smart Compatibility Logic**

#### Bar Chart (Always Excellent)
- **Best for:** Comparing categories
- **Always available:** Works with any categorical data
- **Compatibility:** EXCELLENT

#### Pie & Donut Charts
- **Best for:** Showing proportions of a whole
- **Available when:** 
  - 6 or fewer categories
  - All values are numeric
  - Total value > 0
- **Compatibility:** 
  - EXCELLENT for 2-4 categories
  - GOOD for 5-6 categories
- **Not shown when:** Too many categories (>6)

#### Table View
- **Best for:** Precise values and many categories
- **Always available:** Works with any data
- **Compatibility:**
  - EXCELLENT for 10+ categories
  - GOOD for fewer categories

#### Line Chart
- **Best for:** Trends over time or ordered sequences
- **Available when:** 3+ data points
- **Compatibility:** FAIR (since our data is categorical, not temporal)

### 3. **Interactive UI**

**Trigger:**
- Hover over the small chart icon in the widget header
- Icon appears on widget hover (opacity transition)

**Popup Panel:**
- Appears instantly on hover
- Stays open while hovering over icon or panel
- Closes when mouse leaves both

**Visual Feedback:**
- Current chart type is highlighted with teal border
- "ACTIVE" badge on selected type
- Compatibility bars color-coded:
  - Green = EXCELLENT
  - Teal = GOOD
  - Orange = FAIR

## 📊 Usage Examples

### Example 1: Status Chart (2 categories: UP, DOWN)
**Recommendations:**
1. ✅ Bar Chart - EXCELLENT
2. ✅ Pie Chart - EXCELLENT (perfect for 2 categories)
3. ✅ Donut Chart - EXCELLENT
4. ✅ Table View - GOOD

### Example 2: Make Chart (4 categories: Cisco, Fortinet, Huawei, Others)
**Recommendations:**
1. ✅ Bar Chart - EXCELLENT
2. ✅ Pie Chart - EXCELLENT
3. ✅ Donut Chart - EXCELLENT
4. ✅ Table View - GOOD
5. ✅ Line Chart - FAIR

### Example 3: Region Chart (15 regions)
**Recommendations:**
1. ✅ Bar Chart - EXCELLENT
2. ✅ Table View - EXCELLENT (best for many categories)
3. ✅ Line Chart - FAIR
4. ❌ Pie Chart - NOT SHOWN (too many categories)
5. ❌ Donut Chart - NOT SHOWN (too many categories)

## 🎨 Visual Design

### Popup Structure
```
┌─────────────────────────────────┐
│ CHART TYPE OPTIONS              │ ← Header (teal bg)
│ Based on your data structure    │
├─────────────────────────────────┤
│ 📊 Bar Chart          [ACTIVE]  │ ← Active (teal border)
│ Excellent for comparing...      │
│ ████████ EXCELLENT              │
├─────────────────────────────────┤
│ 🥧 Pie Chart                    │ ← Hover effect
│ Shows proportions clearly       │
│ ████████ GOOD                   │
├─────────────────────────────────┤
│ 🍩 Donut Chart                  │
│ Modern alternative to pie       │
│ ████████ GOOD                   │
├─────────────────────────────────┤
│ 📋 Table View                   │
│ Precise values                  │
│ ████████ GOOD                   │
├─────────────────────────────────┤
│ 💡 Tip: Chart types filtered... │ ← Footer
└─────────────────────────────────┘
```

### Color Scheme
- **Primary (Teal):** `hsl(174, 72%, 45%)`
- **Excellent (Green):** `hsl(160, 84%, 39%)`
- **Good (Teal):** `hsl(174, 72%, 45%)`
- **Fair (Orange):** `hsl(38, 92%, 50%)`

## 🔧 Technical Implementation

### Files Created

#### `src/utils/chartRecommendations.ts`
- `analyzeDataCompatibility(data)` - Main analysis function
- `getChartTypeIcon(type)` - Returns emoji for chart type
- `getCompatibilityColor(level)` - Returns color for compatibility level

#### `src/components/common/ChartTypeSelector.tsx`
- Main selector component
- Hover state management
- Chart type switching logic

### Integration Points

#### `InterdependentAnalytics.tsx`
```tsx
// Local state for each widget
const [chartType, setChartType] = useState<ChartType>('bar');

// In widget header
<ChartTypeSelector
    data={chartData}
    currentType={chartType}
    onTypeChange={setChartType}
    variant="mini"
/>

// Pass to renderer
<UniversalChartRenderer
    chartType={chartType}  // Dynamic!
    ...
/>
```

## 🎯 User Benefits

1. **Discover Better Visualizations**
   - Users can explore different ways to view the same data
   - Recommendations guide them to the most effective chart types

2. **Prevent Invalid Selections**
   - Pie charts won't appear for 20+ categories
   - System ensures data compatibility

3. **Learn Data Visualization Best Practices**
   - Compatibility ratings teach what works best
   - Descriptions explain when to use each type

4. **Flexible Analysis**
   - Switch between table (precise) and charts (visual)
   - Compare same data in different formats

## 🚀 Future Enhancements

### Potential Additions:
1. **More Chart Types:**
   - Stacked bar charts
   - Grouped bar charts
   - Area charts (for temporal data)

2. **Smart Defaults:**
   - Auto-select best chart type based on data
   - Remember user preferences per field

3. **Advanced Recommendations:**
   - Consider data distribution (skewed, uniform)
   - Suggest based on user's goal (comparison vs. composition)

4. **Export with Chart Type:**
   - Include chart type in CSV metadata
   - Export as image in selected format

## 📝 Code Example

### Basic Usage
```tsx
import { ChartTypeSelector } from '@/components/common/ChartTypeSelector';

function MyWidget() {
    const [chartType, setChartType] = useState<ChartType>('bar');
    const data = [
        { name: 'A', value: 10 },
        { name: 'B', value: 20 },
        { name: 'C', value: 15 }
    ];

    return (
        <div className="widget">
            <div className="header">
                <ChartTypeSelector
                    data={data}
                    currentType={chartType}
                    onTypeChange={setChartType}
                />
            </div>
            <UniversalChartRenderer
                data={data}
                chartType={chartType}
                onPointClick={handleClick}
            />
        </div>
    );
}
```

## 🎓 Best Practices

### When to Use Each Chart Type:

**Bar Charts:**
- ✅ Comparing quantities across categories
- ✅ Ranking items
- ✅ Any number of categories

**Pie/Donut Charts:**
- ✅ Showing parts of a whole
- ✅ 2-6 categories maximum
- ✅ When percentages matter
- ❌ Avoid for many categories
- ❌ Avoid when values are similar

**Table View:**
- ✅ Precise values needed
- ✅ Many categories (10+)
- ✅ Multiple data dimensions
- ✅ When users need to copy/reference exact numbers

**Line Charts:**
- ✅ Trends over time
- ✅ Sequential data
- ⚠️ Less suitable for unordered categories

## 🔍 Compatibility Algorithm

```typescript
function analyzeDataCompatibility(data: any[]) {
    const categoryCount = data.length;
    const hasNumericValues = data.every(item => typeof item.value === 'number');
    const totalValue = data.reduce((sum, item) => sum + item.value, 0);
    
    // Bar: Always excellent
    recommendations.push({ type: 'bar', compatibility: 'excellent' });
    
    // Pie/Donut: Only if ≤6 categories
    if (categoryCount <= 6 && hasNumericValues && totalValue > 0) {
        const compat = categoryCount <= 4 ? 'excellent' : 'good';
        recommendations.push({ type: 'pie', compatibility: compat });
        recommendations.push({ type: 'donut', compatibility: compat });
    }
    
    // Table: Better for many categories
    const tableCompat = categoryCount > 10 ? 'excellent' : 'good';
    recommendations.push({ type: 'table', compatibility: tableCompat });
    
    return recommendations;
}
```

## 🎉 Summary

The Intelligent Chart Type Selector transforms static analytics widgets into flexible, user-driven visualizations. By analyzing data structure and providing smart recommendations, it empowers users to explore their data in the most effective way while preventing incompatible chart selections.

**Key Innovation:** The system doesn't just offer all chart types—it intelligently filters and ranks them based on actual data compatibility, making it easier for users to make the right visualization choice.
