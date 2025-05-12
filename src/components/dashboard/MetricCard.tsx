
import React from 'react';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  className?: string;
  prefix?: string;
  suffix?: string;
  isLoading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  change,
  className,
  prefix,
  suffix,
  isLoading = false,
}) => {
  return (
    <div className={cn('metric-card group', className)}>
      {isLoading ? (
        <>
          <div className="flex justify-between">
            <div className="h-5 w-24 bg-muted rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
          </div>
          <div className="h-8 w-32 bg-muted rounded mt-2 animate-pulse"></div>
          <div className="h-5 w-16 bg-muted rounded mt-2 animate-pulse"></div>
        </>
      ) : (
        <>
          <div className="flex justify-between">
            <h3 className="metric-label">{title}</h3>
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
              {icon}
            </div>
          </div>
          <div className="metric-value">
            {prefix}
            {value}
            {suffix}
          </div>
          {change && (
            <div className={cn(
              change.type === 'increase' ? 'positive-change' : 
              change.type === 'decrease' ? 'negative-change' : 
              'neutral-change'
            )}>
              {change.type === 'increase' ? (
                <ArrowUp size={14} className="mr-1" />
              ) : change.type === 'decrease' ? (
                <ArrowDown size={14} className="mr-1" />
              ) : (
                <Minus size={14} className="mr-1" />
              )}
              {Math.abs(change.value)}%
              <span className="text-muted-foreground ml-1">vs. período anterior</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MetricCard;
