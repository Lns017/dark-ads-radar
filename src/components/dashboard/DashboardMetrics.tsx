
import React from 'react';
import { BarChart3, CreditCard, DollarSign, LineChart, MousePointerClick, Percent, PieChart, ShoppingCart } from 'lucide-react';
import MetricCard from './MetricCard';

interface DashboardMetricsProps {
  totalInvestment: number;
  totalConversions: number;
  totalCPA: number;
  totalROAS: number;
  totalRevenue: number;
  totalImpressions: number;
}

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  totalInvestment,
  totalConversions,
  totalCPA,
  totalROAS,
  totalRevenue,
  totalImpressions
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <MetricCard 
        title="Investimento Total" 
        value={totalInvestment.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        icon={<DollarSign size={18} />}
        change={{ value: 8.5, type: 'increase' }}
      />
      <MetricCard 
        title="Conversões" 
        value={totalConversions}
        icon={<ShoppingCart size={18} />}
        change={{ value: 12.3, type: 'increase' }}
      />
      <MetricCard 
        title="Custo por Conversão" 
        value={totalCPA.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        icon={<CreditCard size={18} />}
        change={{ value: 3.2, type: 'decrease' }}
      />
      <MetricCard 
        title="ROAS" 
        value={totalROAS.toFixed(2) + 'x'}
        icon={<PieChart size={18} />}
        change={{ value: 5.7, type: 'increase' }}
      />
      <MetricCard 
        title="Faturamento" 
        value={totalRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        icon={<BarChart3 size={18} />}
        change={{ value: 15.4, type: 'increase' }}
      />
      <MetricCard 
        title="Taxa de Conversão" 
        value="2.8%"
        icon={<Percent size={18} />}
        change={{ value: 0.4, type: 'increase' }}
      />
      <MetricCard 
        title="Impressões" 
        value={totalImpressions.toLocaleString()}
        icon={<LineChart size={18} />}
        change={{ value: 7.2, type: 'increase' }}
      />
      <MetricCard 
        title="Cliques" 
        value="15,320"
        icon={<MousePointerClick size={18} />}
        change={{ value: 9.5, type: 'increase' }}
      />
    </div>
  );
};

export default DashboardMetrics;
