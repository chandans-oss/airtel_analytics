import { useMemo, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Treemap,
  Legend,
  LineChart,
  Line,
  LabelList,
} from 'recharts';
import { useInventoryStore } from '@/store/inventoryStore';
import type { NodeData, LinkData, ChartType, WidgetConfig } from '@/types/inventory';
import { Settings } from 'lucide-react';
import { WidgetSettingsDialog } from './WidgetSettingsDialog';

const COLORS = {
  online: 'hsl(160, 84%, 39%)',
  offline: 'hsl(12, 85%, 55%)',
  primary: 'hsl(174, 72%, 45%)',
  accent: 'hsl(210, 100%, 55%)',
  warning: 'hsl(38, 92%, 50%)',
  neutral: [
    'hsl(174, 72%, 45%)',
    'hsl(210, 100%, 55%)',
    'hsl(38, 92%, 50%)',
    'hsl(280, 70%, 55%)',
    'hsl(320, 70%, 55%)',
    'hsl(140, 60%, 45%)',
    'hsl(20, 80%, 55%)',
    'hsl(200, 70%, 50%)',
  ],
};

const customTooltipStyle = {
  backgroundColor: 'hsl(var(--popover))',
  border: '1px solid hsl(var(--border))',
  borderRadius: '8px',
  color: 'hsl(var(--popover-foreground))',
};

const customItemStyle = { color: 'hsl(var(--popover-foreground))' };

interface ChartContainerProps {
  id: string;
  title: string;
  children: React.ReactNode;
}

export function ChartContainer({ id, title, children }: ChartContainerProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { widgetConfigs } = useInventoryStore();
  const config = widgetConfigs[id];
  const displayTitle = config?.title || title;

  return (
    <div className="chart-container group">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{displayTitle}</h3>
        <button
          onClick={() => setSettingsOpen(true)}
          className="rounded-md p-1 opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
        >
          <Settings size={14} className="text-muted-foreground" />
        </button>
      </div>
      <div className="flex w-full flex-col items-center justify-center min-h-[250px]">
        {children}
      </div>
      <WidgetSettingsDialog
        id={id}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />
    </div>
  );
}

interface CommonChartProps {
  data: any[];
  chartType: ChartType;
  onPointClick: (name: string) => void;
  variant?: 'default' | 'mini';
}

export function UniversalChartRenderer({ data, chartType, onPointClick, variant = 'default' }: CommonChartProps) {
  const isMini = variant === 'mini';
  const height = isMini ? 180 : 260;
  const yAxisWidth = isMini ? 70 : 100;
  const margin = isMini
    ? { top: 5, right: 10, left: 10, bottom: 5 }
    : { top: 5, right: 30, left: 40, bottom: 5 };

  switch (chartType) {
    case 'bar':
    case 'histogram':
      return (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={data}
            layout="vertical"
            margin={margin}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={isMini ? 45 : yAxisWidth}
              tick={{ fill: 'hsl(215, 15%, 55%)', fontSize: isMini ? 8 : 10 }}
              axisLine={false}
              tickLine={false}
              interval={0}
              textAnchor="end"
            />
            <Tooltip
              contentStyle={customTooltipStyle}
              itemStyle={customItemStyle}
              cursor={{ fill: 'transparent' }}
            />
            <Bar
              dataKey="value"
              fill={COLORS.primary}
              radius={[0, 4, 4, 0]}
              onClick={(entry) => onPointClick(entry.name)}
              style={{ cursor: 'pointer' }}
              barSize={isMini ? 12 : 16}
            >
              <LabelList
                dataKey="value"
                position="right"
                style={{ fill: 'hsl(var(--muted-foreground))', fontSize: isMini ? '9px' : '10px', fontWeight: 'bold' }}
                offset={8}
              />
              {data.map((entry: any, index: number) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || COLORS.neutral[index % COLORS.neutral.length]}
                  fillOpacity={entry.opacity ?? 1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    case 'line':
      return (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip contentStyle={customTooltipStyle} itemStyle={customItemStyle} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={COLORS.primary}
              strokeWidth={2}
              dot={{ r: 4, fill: COLORS.primary }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    case 'table':
      return (
        <div className="w-full overflow-hidden rounded-md border border-border">
          <table className="w-full text-left text-[10px]">
            <thead className="bg-muted/50 font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2 text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.map((row: any) => (
                <tr key={row.name} className="hover:bg-muted/30">
                  <td className="px-3 py-2 font-medium">{row.name}</td>
                  <td className="px-3 py-2 text-right">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'pie':
    case 'donut':
    default:
      return (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="40%"
              innerRadius={chartType === 'donut' ? 55 : 0}
              outerRadius={75}
              paddingAngle={2}
              dataKey="value"
              onClick={(entry) => onPointClick(entry.name)}
              style={{ cursor: 'pointer' }}
            >
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.color || COLORS.neutral[index % COLORS.neutral.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={customTooltipStyle} itemStyle={customItemStyle} />
            <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
          </PieChart>
        </ResponsiveContainer>
      );
  }
}

export function DynamicDistributionChart({ field, label }: { field: string; label: string }) {
  const { getFilteredNodes, getFilteredLinks, addFilter, widgetConfigs } = useInventoryStore();
  const nodes = getFilteredNodes();
  const links = getFilteredLinks();
  const config = widgetConfigs[field];

  const defaultType = (field.toLowerCase().includes('status') || (nodes.length + links.length) <= 4) ? 'pie' : 'bar';
  const chartType = config?.chartType || defaultType;

  const data = useMemo(() => {
    const groups = new Map<string, number>();
    const majorMakes = ['CISCO', 'FORTINET', 'HUAWEI'];

    nodes.forEach((item: any) => {
      const val = item[field];
      if (val && String(val).toUpperCase() !== 'UNKNOWN') {
        let key = String(val);
        if (field === 'make' && !majorMakes.includes(key.toUpperCase())) {
          key = 'Others';
        }
        groups.set(key, (groups.get(key) || 0) + 1);
      }
    });

    links.forEach((item: any) => {
      const val = item[field];
      if (val && String(val).toUpperCase() !== 'UNKNOWN') {
        let key = String(val);
        if (field === 'make' && !majorMakes.includes(key.toUpperCase())) {
          key = 'Others';
        }
        groups.set(key, (groups.get(key) || 0) + 1);
      }
    });

    return Array.from(groups.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => {
        if (a.name === 'Others') return 1;
        if (b.name === 'Others') return -1;
        return b.value - a.value;
      })
      .slice(0, 10);
  }, [nodes, links, field]);

  if (data.length === 0) return null;

  return (
    <ChartContainer id={field} title={label}>
      <UniversalChartRenderer
        data={data}
        chartType={chartType}
        onPointClick={(val) => addFilter(field, val)}
      />
    </ChartContainer>
  );
}

// Fixed-field mappers but with dynamic rendering
export function StatusPieChart() {
  const { getFilteredNodes, addFilter, widgetConfigs } = useInventoryStore();
  const nodes = getFilteredNodes();
  const config = widgetConfigs['status_dist'];
  const chartType = config?.chartType || 'pie';

  const data = useMemo(() => {
    const online = nodes.filter((n) => n.status === 'UP').length;
    const offline = nodes.filter((n) => n.status === 'DOWN').length;
    return [
      { name: 'Online', value: online, color: COLORS.online },
      { name: 'Offline', value: offline, color: COLORS.offline },
    ];
  }, [nodes]);

  if (nodes.length === 0) return null;

  return (
    <ChartContainer id="status_dist" title="Node Status Distribution">
      <UniversalChartRenderer
        data={data}
        chartType={chartType}
        onPointClick={(val) => addFilter('status', val === 'Online' ? 'UP' : 'DOWN')}
      />
    </ChartContainer>
  );
}

export function MakeBarChart() {
  const { getFilteredNodes, addFilter, widgetConfigs } = useInventoryStore();
  const nodes = getFilteredNodes();
  const config = widgetConfigs['make_dist'];
  const chartType = config?.chartType || 'bar';

  const data = useMemo(() => {
    const groups = new Map<string, number>();
    nodes.forEach((node) => {
      const make = node.make || 'Unknown';
      groups.set(make, (groups.get(make) || 0) + 1);
    });
    return Array.from(groups.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [nodes]);

  if (nodes.length === 0) return null;

  return (
    <ChartContainer id="make_dist" title="Devices by Make">
      <UniversalChartRenderer
        data={data}
        chartType={chartType}
        onPointClick={(val) => addFilter('make', val)}
      />
    </ChartContainer>
  );
}

export function RegionBarChart() {
  const { getFilteredLinks, addFilter, widgetConfigs } = useInventoryStore();
  const links = getFilteredLinks();
  const config = widgetConfigs['region_dist'];
  const chartType = config?.chartType || 'bar';

  const data = useMemo(() => {
    const groups = new Map<string, number>();
    links.forEach((link) => {
      const region = link.region || 'Unknown';
      groups.set(region, (groups.get(region) || 0) + 1);
    });
    return Array.from(groups.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [links]);

  if (links.length === 0) return null;

  return (
    <ChartContainer id="region_dist" title="Links by Region">
      <UniversalChartRenderer
        data={data}
        chartType={chartType}
        onPointClick={(val) => addFilter('region', val)}
      />
    </ChartContainer>
  );
}

export function ServiceFlavorDonut() {
  const { getFilteredLinks, addFilter, widgetConfigs } = useInventoryStore();
  const links = getFilteredLinks();
  const config = widgetConfigs['flavor_dist'];
  const chartType = config?.chartType || 'donut';

  const data = useMemo(() => {
    const groups = new Map<string, number>();
    links.forEach((link) => {
      const flavor = link.serviceFlavor || 'Unknown';
      groups.set(flavor, (groups.get(flavor) || 0) + 1);
    });
    return Array.from(groups.entries())
      .map(([name, value]) => ({ name, value }));
  }, [links]);

  if (links.length === 0) return null;

  return (
    <ChartContainer id="flavor_dist" title="Service Flavor Distribution">
      <UniversalChartRenderer
        data={data}
        chartType={chartType}
        onPointClick={(val) => addFilter('serviceFlavor', val)}
      />
    </ChartContainer>
  );
}

export function StateTreemap() {
  const { getFilteredLinks, addFilter, widgetConfigs } = useInventoryStore();
  const links = getFilteredLinks();
  const config = widgetConfigs['state_dist'];
  const chartType = config?.chartType || 'bar'; // Treemap uses bar settings for non-treemap types

  const data = useMemo(() => {
    const groups = new Map<string, number>();
    links.forEach((link) => {
      const state = link.state || 'Unknown';
      groups.set(state, (groups.get(state) || 0) + 1);
    });
    return Array.from(groups.entries())
      .map(([name, value]) => ({
        name,
        value,
        size: value, // for treemap
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 15);
  }, [links]);

  if (links.length === 0) return null;

  if (chartType === 'pie' || chartType === 'donut' || chartType === 'table' || chartType === 'line') {
    return (
      <ChartContainer id="state_dist" title="Links by State">
        <UniversalChartRenderer
          data={data}
          chartType={chartType}
          onPointClick={(val) => addFilter('state', val)}
        />
      </ChartContainer>
    );
  }

  // Default specialized rendering for Treemap if it's the default or set to bar (we'll treat bar as Treemap here for this specific widget if not overridden)
  return (
    <ChartContainer id="state_dist" title="Links by State">
      <ResponsiveContainer width="100%" height={300}>
        <Treemap
          data={data}
          dataKey="size"
          aspectRatio={4 / 3}
          stroke="hsl(var(--border))"
          onClick={(entry) => entry && addFilter('state', entry.name)}
          style={{ cursor: 'pointer' }}
        >
          <Tooltip contentStyle={customTooltipStyle} itemStyle={customItemStyle} />
        </Treemap>
      </ResponsiveContainer>
    </ChartContainer>
  );
}

export function LinkStatusChart() {
  const { getFilteredLinks, addFilter, widgetConfigs } = useInventoryStore();
  const links = getFilteredLinks();
  const config = widgetConfigs['link_status_dist'];
  const chartType = config?.chartType || 'pie';

  const data = useMemo(() => {
    const online = links.filter((l) => l.linkStatus === 'UP').length;
    const offline = links.filter((l) => l.linkStatus === 'DOWN').length;
    return [
      { name: 'Active', value: online, color: COLORS.online },
      { name: 'Down', value: offline, color: COLORS.offline },
    ];
  }, [links]);

  if (links.length === 0) return null;

  return (
    <ChartContainer id="link_status_dist" title="Link Status">
      <UniversalChartRenderer
        data={data}
        chartType={chartType}
        onPointClick={(val) => addFilter('linkStatus', val === 'Active' ? 'UP' : 'DOWN')}
      />
    </ChartContainer>
  );
}
