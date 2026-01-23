import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

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
}: KPICardProps) {
  const cardClass = {
    default: 'kpi-card',
    online: 'kpi-card-online',
    offline: 'kpi-card-offline',
    neutral: 'kpi-card-neutral',
  }[variant];

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  const trendColor = trend === 'up' ? 'text-success' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground';

  return (
    <div
      className={cn(
        cardClass,
        "h-full flex flex-col justify-between transition-all duration-300",
        onClick && 'cursor-pointer hover:border-primary/50 hover:shadow-lg hover:-translate-y-1'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between w-full">
        <div className="space-y-0.5">
          <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground/80">
            {title}
          </p>
          <p className="text-xl font-extrabold tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-[10px] text-muted-foreground font-medium">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/5">
            <Icon size={16} className="text-primary" />
          </div>
        )}
      </div>

      <div>
        {extra && (
          <div className="mt-2 space-y-1 border-t border-border/40 pt-2">
            {extra}
          </div>
        )}

        {trend && trendValue && (
          <div className={cn('mt-2 flex items-center gap-1 text-[9px] font-medium uppercase', trendColor)}>
            <TrendIcon size={10} />
            <span>{trendValue}</span>
          </div>
        )}
      </div>
    </div>
  );
}
