
import React from 'react';
import { DollarSign, ShoppingCart, BarChart3, Percent } from 'lucide-react';
import MetricCard from '@/components/dashboard/MetricCard';
import CampaignTable from '@/components/dashboard/CampaignTable';
import FacebookDashboard from '@/components/facebook/FacebookDashboard';
import { Campaign } from '@/components/dashboard/CampaignTable';

interface FacebookSectionProps {
  campaigns: Campaign[];
}

const FacebookSection: React.FC<FacebookSectionProps> = ({ campaigns }) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-4 flex items-center">
        <svg viewBox="0 0 24 24" className="h-5 w-5 mr-2 fill-facebook">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        Facebook Ads
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <MetricCard 
          title="Investimento" 
          value={campaigns.reduce((acc, campaign) => acc + campaign.investment, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          icon={<DollarSign size={18} />}
          className="bg-facebook/5 border-facebook/10"
        />
        <MetricCard 
          title="Conversões" 
          value={campaigns.reduce((acc, campaign) => acc + campaign.conversions, 0)}
          icon={<ShoppingCart size={18} />}
          className="bg-facebook/5 border-facebook/10"
        />
        <MetricCard 
          title="CPM" 
          value="R$ 8,50"
          icon={<BarChart3 size={18} />}
          className="bg-facebook/5 border-facebook/10"
        />
        <MetricCard 
          title="CTR" 
          value="3.2%"
          icon={<Percent size={18} />}
          className="bg-facebook/5 border-facebook/10"
        />
      </div>
      
      <FacebookDashboard />
      
      <CampaignTable data={campaigns} title="Campanhas do Facebook Ads" platform="facebook" />
    </div>
  );
};

export default FacebookSection;
