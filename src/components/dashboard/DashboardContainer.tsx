
import React from 'react';
import { Campaign } from '@/components/dashboard/CampaignTable';
import DashboardMetrics from './DashboardMetrics';
import PerformanceOverview from './PerformanceOverview';
import FacebookSection from '@/components/platform/FacebookSection';
import GoogleSection from '@/components/platform/GoogleSection';
import PlatformToggle from './PlatformToggle';

interface PerformanceDataPoint {
  date: string;
  investment: number;
  conversions: number;
  cpc: number;
  ctr: number;
  impressions: number;
}

interface DashboardContainerProps {
  facebookCampaigns: Campaign[];
  googleCampaigns: Campaign[];
  performanceData: PerformanceDataPoint[];
  activeTab: 'all' | 'facebook' | 'google';
  setActiveTab: (tab: 'all' | 'facebook' | 'google') => void;
}

const DashboardContainer: React.FC<DashboardContainerProps> = ({
  facebookCampaigns,
  googleCampaigns,
  performanceData,
  activeTab,
  setActiveTab
}) => {
  // Calculate total metrics
  const totalInvestment = facebookCampaigns.reduce((acc, campaign) => acc + campaign.investment, 0) + 
                         googleCampaigns.reduce((acc, campaign) => acc + campaign.investment, 0);
  
  const totalConversions = facebookCampaigns.reduce((acc, campaign) => acc + campaign.conversions, 0) + 
                           googleCampaigns.reduce((acc, campaign) => acc + campaign.conversions, 0);

  const totalCPA = totalInvestment / totalConversions;
  const totalRevenue = totalConversions * 100; // Assuming average value per conversion
  const totalROAS = totalRevenue / totalInvestment;
  const totalImpressions = performanceData.reduce((acc, day) => acc + day.impressions, 0);

  return (
    <main className="p-4 lg:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Visão Geral da Performance</h2>
        <PlatformToggle activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      
      {/* Metrics Summary */}
      <DashboardMetrics 
        totalInvestment={totalInvestment}
        totalConversions={totalConversions}
        totalCPA={totalCPA}
        totalROAS={totalROAS}
        totalRevenue={totalRevenue}
        totalImpressions={totalImpressions}
      />

      {/* Performance Charts */}
      <PerformanceOverview performanceData={performanceData} />

      {/* Platform Specific Sections */}
      {(activeTab === 'all' || activeTab === 'facebook') && (
        <FacebookSection campaigns={facebookCampaigns} />
      )}

      {(activeTab === 'all' || activeTab === 'google') && (
        <GoogleSection campaigns={googleCampaigns} />
      )}
    </main>
  );
};

export default DashboardContainer;
