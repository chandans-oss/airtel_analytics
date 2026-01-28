import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: LucideIcon;
  variant?: 'default' | 'online' | 'offline' | 'neutral';
  onClick?: () => void;
  extra?: React.ReactNode;
  sparklineData?: { value: number }[];
}

export function KPICard({
  title,
  value,
  subtitle,
  trend,
  trendValue,
  extra,
  icon: Icon,
  variant = 'default',
  onClick,
  sparklineData
}: KPICardProps) {
  const cardClass = {
    default: 'kpi-card',
    online: 'kpi-card-online',
    offline: 'kpi-card-offline',
    neutral: 'kpi-card-neutral',
  }[variant];

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-success' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground';

  const sparkColor = {
    default: 'hsl(var(--primary))',
    online: 'hsl(var(--success))',
    offline: 'hsl(var(--destructive))',
    neutral: 'hsl(var(--accent))',
  }[variant];

  return (
    <div
      className={cn(
        cardClass,
        "h-full flex flex-col justify-between transition-all duration-500 overflow-hidden relative group",
        onClick && 'cursor-pointer hover:border-primary/50 hover:shadow-2xl hover:-translate-y-1'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between w-full relative z-10">
        <div className="space-y-0.5">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-70 font-display">
            {title}
          </p>
          <p className="text-2xl font-black tracking-tighter text-foreground font-display">{value}</p>
          {subtitle && (
            <p className="text-[10px] text-muted-foreground font-semibold">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/50 border border-border/50 transition-transform group-hover:scale-110 duration-500">
            <Icon size={18} className="text-primary" />
          </div>
        )}
      </div>

      <div className="relative flex-1 min-h-[40px] mt-2 group-hover:opacity-100 transition-opacity">
        {sparklineData && (
          <div className="absolute inset-x-0 bottom-0 h-full opacity-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparklineData}>
                <defs>
                  <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={sparkColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={sparkColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={sparkColor}
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill={`url(#grad-${title})`}
                  isAnimationActive={true}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="mt-2 relative z-10">
        {extra && (
          <div className="space-y-1 border-t border-border/20 pt-2">
            {extra}
          </div>
        )}

        {trend && trendValue && (
          <div className={cn('mt-2 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-tighter', trendColor)}>
            <TrendIcon size={12} />
            <span>{trendValue}</span>
          </div>
        )}
      </div>
    </div>
  );
}
