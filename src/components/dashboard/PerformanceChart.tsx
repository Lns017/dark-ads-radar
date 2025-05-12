
import React, { useState } from 'react';
import { 
  Area, 
  AreaChart, 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Legend, 
  Line, 
  LineChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PerformanceData {
  date: string;
  investment: number;
  conversions: number;
  cpc: number;
  ctr: number;
  impressions: number;
}

interface PerformanceChartProps {
  data: PerformanceData[];
  title: string;
  className?: string;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ data, title, className }) => {
  const [chartMetrics, setChartMetrics] = useState<'investment' | 'conversions'>('investment');
  
  return (
    <div className={`chart-container p-5 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-medium">{title}</h3>
        <Tabs defaultValue="investment" className="w-[250px]" onValueChange={(val) => setChartMetrics(val as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="investment">Investimento</TabsTrigger>
            <TabsTrigger value="conversions">Conversões</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 5,
              right: 5,
              left: 5,
              bottom: 5,
            }}
          >
            <defs>
              <linearGradient id="colorInvestment" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12, fill: '#64748b' }} 
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis 
              tick={{ fontSize: 12, fill: '#64748b' }} 
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              tickFormatter={(value) => chartMetrics === 'investment' ? `R$${value}` : value}
            />
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1e293b', 
                borderColor: '#475569',
                borderRadius: '4px',
                fontSize: '12px',
              }} 
              labelStyle={{ color: '#f8fafc' }}
              formatter={(value, name) => {
                if (name === 'investment') return [`R$ ${value}`, 'Investimento'];
                if (name === 'conversions') return [value, 'Conversões'];
                return [value, name];
              }}
            />
            {chartMetrics === 'investment' ? (
              <Area 
                type="monotone" 
                dataKey="investment" 
                stroke="#8b5cf6" 
                fillOpacity={1} 
                fill="url(#colorInvestment)" 
                strokeWidth={2}
              />
            ) : (
              <Area 
                type="monotone" 
                dataKey="conversions" 
                stroke="#22c55e" 
                fillOpacity={1} 
                fill="url(#colorConversions)" 
                strokeWidth={2}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PerformanceChart;
