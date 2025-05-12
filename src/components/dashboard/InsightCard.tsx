
import React from 'react';
import { AlertTriangle, CheckCircle2, LineChart, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InsightCardProps {
  type: 'success' | 'warning' | 'danger' | 'info';
  title: string;
  description: string;
  metric?: string;
}

const InsightCard: React.FC<InsightCardProps> = ({ type, title, description, metric }) => {
  return (
    <div className={cn(
      'insight-card',
      type === 'success' ? 'border-l-success' :
      type === 'warning' ? 'border-l-warning' :
      type === 'danger' ? 'border-l-danger' :
      'border-l-info'
    )}>
      <div className="flex items-start p-4">
        <div className={cn(
          'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
          type === 'success' ? 'bg-success/10 text-success' :
          type === 'warning' ? 'bg-warning/10 text-warning' :
          type === 'danger' ? 'bg-danger/10 text-danger' :
          'bg-info/10 text-info'
        )}>
          {type === 'success' && <TrendingUp size={20} />}
          {type === 'warning' && <AlertTriangle size={20} />}
          {type === 'danger' && <TrendingDown size={20} />}
          {type === 'info' && <LineChart size={20} />}
        </div>
        <div className="ml-4 flex-1">
          <h4 className="text-sm font-medium">{title}</h4>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          {metric && (
            <div className="mt-2 text-lg font-semibold">{metric}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InsightCard;
