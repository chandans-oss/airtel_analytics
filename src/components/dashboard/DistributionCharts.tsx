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
  AreaChart,
  Area,
  CartesianGrid,
  LabelList,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import { cn } from '@/lib/utils';
import { useInventoryStore } from '@/store/inventoryStore';
import type { NodeData, LinkData, ChartType, WidgetConfig } from '@/types/inventory';
import { Settings, Download } from 'lucide-react';
import { WidgetSettingsDialog } from './WidgetSettingsDialog';

const COLORS = {
  online: '#34C759',
  offline: '#FF3B30',
  primary: '#00A58E',
  accent: '#2196F3',
  warning: '#FF9800',
  neutral: [
    '#00A58E',
    '#2196F3',
    '#FF9800',
    '#9C27B0',
    '#E91E63',
    '#4CAF50',
    '#FF5722',
    '#00BCD4',
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

const CustomBarLabel = (props: any) => {
  const { x, y, width, height, value, onExport, isMini } = props;
  const categoryName = props.payload?.name;

  // Determine if we fit inside the bar
  const isInside = width > 70;
  const margin = isMini ? 6 : 8;
  const opacity = props.payload?.opacity ?? 1;

  if (opacity < 1) return null;

  // If inside: align end (right) against the bar end.
  // If outside: align start (left) after the bar end.
  const xPos = isInside ? (x + width - margin) : (x + width + margin);
  const anchor = isInside ? "end" : "start";
  // For download icon offset:
  // If inside: we need to move it to the LEFT of the text.
  // If outside: we need to move it to the RIGHT of the text.
  const textLengthEstimate = String(value).length * (isMini ? 7 : 9);
  const iconOffset = isInside
    ? -(textLengthEstimate + 12)
    : (textLengthEstimate + 8);

  return (
    <g transform={`translate(${xPos}, ${y + (height ? height / 2 : 0)})`}>
      <text
        x={0}
        y={0}
        dy={4}
        textAnchor={anchor}
        fill={isInside ? "#fff" : "hsl(var(--foreground))"}
        fontSize={isMini ? 10 : 12}
        fontWeight="bold"
        className="tabular-nums"
        style={{ textShadow: isInside ? '0 1px 2px rgba(0,0,0,0.4)' : 'none' }}
      >
        {value}
      </text>
      {onExport && (
        <g
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onExport(categoryName);
          }}
          style={{ cursor: 'pointer', pointerEvents: 'all' }}
          transform={`translate(${iconOffset}, -6)`}
          className="opacity-70 hover:opacity-100 hover:scale-110 transition-all"
        >
          <rect x="-6" y="-6" width="20" height="20" fill="transparent" />
          <Download
            size={isMini ? 10 : 12}
            className={isInside ? "text-white drop-shadow-md" : "text-muted-foreground"}
            strokeWidth={2.5}
          />
        </g>
      )}
    </g>
  );
};

interface CustomTreemapContentProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  value?: number;
  onExport?: (name: string) => void;
  // Recharts specific props that are injected
  depth?: number;
  index?: number;
  colors?: string[];
  [key: string]: any;
}

const CustomTreemapContent = (props: CustomTreemapContentProps) => {
  const { x, y, width, height, name, value, onExport, depth } = props;

  // Basic bounds check to avoid rendering in tiny boxes
  if (!width || !height || width < 40 || height < 40) return null;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: props.fill || '#00A58E',
          stroke: '#fff',
          strokeWidth: 2,
        }}
      />

      {/* Name Link/Text */}
      <text
        x={(x || 0) + (width / 2)}
        y={(y || 0) + (height / 2) - 8}
        textAnchor="middle"
        fill="#fff"
        fontSize={10}
        fontWeight="bold"
        style={{ pointerEvents: 'none' }}
      >
        {name?.substring(0, width / 7)}
      </text>

      {/* Value */}
      <text
        x={(x || 0) + (width / 2)}
        y={(y || 0) + (height / 2) + 6}
        textAnchor="middle"
        fill="#fff"
        fontSize={12}
        fontWeight="black"
        style={{ pointerEvents: 'none' }}
      >
        {value}
      </text>

      {/* Export Icon */}
      {onExport && name && (
        <g
          transform={`translate(${(x || 0) + (width / 2) - 6}, ${(y || 0) + (height / 2) + 14})`}
          onClick={(e) => {
            e.stopPropagation();
            onExport(name);
          }}
          className="cursor-pointer opacity-70 hover:opacity-100"
          style={{ pointerEvents: 'all' }}
        >
          <rect x="-4" y="-4" width="20" height="20" fill="transparent" />
          <Download size={12} className="text-white" />
        </g>
      )}
    </g>
  );
};

interface CommonChartProps {
  data: any[];
  chartType: ChartType;
  onPointClick: (name: string) => void;
  variant?: 'default' | 'mini';
  onPointExport?: (name: string) => void;
  onContextMenu?: (e: React.MouseEvent, name: string) => void;
}

export function UniversalChartRenderer({ data, chartType, onPointClick, variant = 'default', onPointExport, onContextMenu }: CommonChartProps) {
  const isMini = variant === 'mini';
  const height = isMini ? 190 : 260; // Perfectly fits 240px widget with 40px header
  const yAxisWidth = isMini ? 110 : 120;
  const margin = isMini
    ? { top: 5, right: 65, left: 15, bottom: 5 }
    : { top: 20, right: 120, left: 40, bottom: 20 };

  switch (chartType) {
    case 'bar':
    case 'histogram':
      return (
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ ...margin, right: (margin.right || 0) + 20 }}
            barCategoryGap={isMini ? "10%" : "20%"}
            barGap={2}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={yAxisWidth}
              tick={(tickProps) => {
                const { x, y, payload } = tickProps;
                const entry = data.find((d: any) => d.name === payload.value);
                const opacity = entry?.opacity ?? 1;
                return (
                  <text
                    x={x}
                    y={y}
                    dy={4}
                    fill="hsl(var(--foreground))"
                    fontSize={isMini ? 9 : 10}
                    fontWeight="600"
                    textAnchor="end"
                    fillOpacity={opacity}
                  >
                    {payload.value}
                  </text>
                );
              }}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <Tooltip
              contentStyle={customTooltipStyle}
              itemStyle={customItemStyle}
              cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
            />
            <Bar
              dataKey="value"
              fill={COLORS.primary}
              radius={[0, 6, 6, 0]}
              onClick={(entry) => onPointClick(entry.name)}
              onContextMenu={(data: any, index: number, e: any) => onContextMenu && onContextMenu(e, data.name)}
              style={{ cursor: 'pointer' }}
              barSize={isMini ? 24 : 32}
            >
              <LabelList
                dataKey="value"
                position="right"
                content={(props: any) => {
                  const entry = data[props.index];
                  return (
                    <CustomBarLabel
                      {...props}
                      payload={entry}
                      onExport={onPointExport}
                      isMini={isMini}
                    />
                  );
                }}
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
    case 'area':
      return (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={customTooltipStyle} itemStyle={customItemStyle} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={COLORS.primary}
              strokeWidth={2}
              fill="url(#colorValue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      );
    case 'treemap':
      return (
        <ResponsiveContainer width="100%" height={height}>
          <Treemap
            data={data}
            dataKey="value"
            aspectRatio={4 / 3}
            stroke="#fff"
            fill={COLORS.primary}
            content={<CustomTreemapContent onExport={onPointExport} />}
          >
            <Tooltip contentStyle={customTooltipStyle} itemStyle={customItemStyle} />
          </Treemap>
        </ResponsiveContainer>
      );
    case 'scatter':
      return (
        <ResponsiveContainer width="100%" height={height}>
          <ScatterChart margin={margin}>
            <XAxis type="number" dataKey="x" name="Bandwidth" unit="M" tick={{ fontSize: 9 }} />
            <YAxis type="number" dataKey="y" name="Value" tick={{ fontSize: 9 }} />
            <ZAxis type="number" dataKey="z" range={[50, 400]} name="Size" />
            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={customTooltipStyle} />
            <Scatter name="Data" data={data} fill={COLORS.primary}>
              {data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={entry.color || COLORS.neutral[index % COLORS.neutral.length]} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      );
    case 'pie':
    case 'donut':
    default:
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={chartType === 'donut' ? 40 : 0}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              onClick={(entry) => onPointClick(entry.name)}
              onContextMenu={(data: any, index: number, e: any) => onContextMenu && onContextMenu(e, data.name)}
              style={{ cursor: 'pointer' }}
              labelLine={false}
              label={({ cx, cy, midAngle, innerRadius, outerRadius, value, name, percent, index }) => {
                const RADIAN = Math.PI / 180;
                // Position inside the slice
                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                const y = cy + radius * Math.sin(-midAngle * RADIAN);

                // Only render if same slice is big enough
                if (percent < 0.05) return null;

                return (
                  <g transform={`translate(${x}, ${y})`}>
                    <text
                      x={0}
                      y={-6}
                      fill="white"
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={isMini ? 12 : 14}
                      fontWeight="black"
                      style={{ pointerEvents: 'none', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                    >
                      {value}
                    </text>
                    {onPointExport && (
                      <g
                        transform={`translate(-6, 4)`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onPointExport(name);
                        }}
                        className="opacity-80 hover:opacity-100 cursor-pointer"
                        style={{ pointerEvents: 'all' }}
                      >
                        <rect x="-4" y="-4" width="20" height="20" fill="transparent" />
                        <Download size={12} className="text-white drop-shadow-md" strokeWidth={3} />
                      </g>
                    )}
                  </g>
                );
              }}
            >
              {data.map((entry: any, index: number) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || COLORS.neutral[index % COLORS.neutral.length]}
                  fillOpacity={entry.opacity ?? 1}
                />
              ))}
            </Pie>
            <Tooltip contentStyle={customTooltipStyle} itemStyle={customItemStyle} />
            <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ paddingTop: '5px', fontSize: '10px' }} />
          </PieChart>
        </ResponsiveContainer>
      );
    case 'table':
      return (
        <div className="w-full overflow-hidden rounded-lg border border-border bg-card/50">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-muted/50 font-bold uppercase tracking-wider text-muted-foreground/80 border-b border-border/50">
              <tr>
                <th className="px-4 py-2.5">Category</th>
                <th className="px-4 py-2.5 text-right">Count</th>
                <th className="px-4 py-2.5 text-center">Export</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {data.map((row: any) => (
                <tr
                  key={row.name}
                  className={cn(
                    "hover:bg-primary/5 transition-all cursor-pointer group/row",
                    row.opacity < 1 && "opacity-20 grayscale-[0.5]"
                  )}
                  style={{ opacity: row.opacity ?? 1 }}
                  onClick={() => onPointClick(row.name)}
                >
                  <td className="px-4 py-2.5 font-semibold text-foreground/90">{row.name}</td>
                  <td className="px-4 py-2.5 text-right font-black text-primary">{row.value}</td>
                  <td className="px-4 py-2.5 text-center">
                    {onPointExport && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPointExport(row.name);
                        }}
                        className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all opacity-0 group-hover/row:opacity-100"
                      >
                        <Download size={12} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
