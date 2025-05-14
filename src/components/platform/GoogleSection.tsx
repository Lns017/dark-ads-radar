
import React from 'react';
import { DollarSign, ShoppingCart, MousePointerClick, Percent } from 'lucide-react';
import MetricCard from '@/components/dashboard/MetricCard';
import CampaignTable from '@/components/dashboard/CampaignTable';
import { Campaign } from '@/components/dashboard/CampaignTable';

interface GoogleSectionProps {
  campaigns: Campaign[];
}

const GoogleSection: React.FC<GoogleSectionProps> = ({ campaigns }) => {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium mb-4 flex items-center">
        <svg viewBox="0 0 24 24" className="h-5 w-5 mr-2">
          <path d="M22.5 12c0-.786-.07-1.557-.195-2.306h-10.11v4.363h5.88c-.252 1.367-1.04 2.53-2.215 3.3v2.745h3.588C21.284 18.092 22.5 15.3 22.5 12z" fill="#4285F4" />
          <path d="M12.195 22.5c2.998 0 5.508-.99 7.353-2.678l-3.588-2.745c-.99.66-2.26 1.05-3.765 1.05-2.893 0-5.34-1.935-6.218-4.527H2.265v2.835C4.095 20.115 7.785 22.5 12.195 22.5z" fill="#34A853" />
          <path d="M5.977 13.6c-.225-.66-.345-1.365-.345-2.1s.12-1.44.345-2.1V6.565H2.265C1.485 8.1 1.05 9.975 1.05 12s.435 3.9 1.215 5.435l3.712-2.835z" fill="#FBBC05" />
          <path d="M12.195 5.373c1.635 0 3.09.57 4.245 1.665l3.180-3.135C17.655 1.95 15.15.75 12.195.75c-4.41 0-8.1 2.385-10.155 5.85l3.712 2.835c.885-2.595 3.323-4.527 6.218-4.527z" fill="#EA4335" />
        </svg>
        Google Ads
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <MetricCard 
          title="Investimento" 
          value={campaigns.reduce((acc, campaign) => acc + campaign.investment, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          icon={<DollarSign size={18} />}
          className="bg-google/5 border-google/10"
        />
        <MetricCard 
          title="Conversões" 
          value={campaigns.reduce((acc, campaign) => acc + campaign.conversions, 0)}
          icon={<ShoppingCart size={18} />}
          className="bg-google/5 border-google/10"
        />
        <MetricCard 
          title="Custo por Clique" 
          value="R$ 2,80"
          icon={<MousePointerClick size={18} />}
          className="bg-google/5 border-google/10"
        />
        <MetricCard 
          title="Taxa de Conversão" 
          value="2.5%"
          icon={<Percent size={18} />}
          className="bg-google/5 border-google/10"
        />
      </div>
      
      <CampaignTable data={campaigns} title="Campanhas do Google Ads" platform="google" />
    </div>
  );
};

export default GoogleSection;
