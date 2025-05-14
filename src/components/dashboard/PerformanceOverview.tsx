
import React from 'react';
import PerformanceChart from './PerformanceChart';
import InsightsContainer from './InsightsContainer';

interface PerformanceDataPoint {
  date: string;
  investment: number;
  conversions: number;
  cpc: number;
  ctr: number;
  impressions: number;
}

interface PerformanceOverviewProps {
  performanceData: PerformanceDataPoint[];
}

const PerformanceOverview: React.FC<PerformanceOverviewProps> = ({ performanceData }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      <PerformanceChart data={performanceData} title="Performance por Dia" />
      
      <div className="grid grid-cols-1 gap-4">
        <InsightsContainer />
      </div>
    </div>
  );
};

export default PerformanceOverview;
