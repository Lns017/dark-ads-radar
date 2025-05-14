
import React, { useState } from 'react';
import Header from '@/components/dashboard/Header';
import Sidebar from '@/components/dashboard/Sidebar';
import MetricCard from '@/components/dashboard/MetricCard';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import CampaignTable, { Campaign } from '@/components/dashboard/CampaignTable';
import PlatformToggle from '@/components/dashboard/PlatformToggle';
import InsightCard from '@/components/dashboard/InsightCard';
import { 
  BarChart3, 
  CreditCard, 
  DollarSign, 
  LineChart, 
  MousePointerClick, 
  Percent, 
  PieChart, 
  ShoppingCart 
} from 'lucide-react';
import FacebookDashboard from '@/components/facebook/FacebookDashboard';

// Mock data for demonstration purposes
const mockPerformanceData = [
  { date: '01/05', investment: 1200, conversions: 42, cpc: 2.5, ctr: 3.2, impressions: 15000 },
  { date: '02/05', investment: 1150, conversions: 38, cpc: 2.3, ctr: 3.0, impressions: 14500 },
  { date: '03/05', investment: 1300, conversions: 45, cpc: 2.6, ctr: 3.4, impressions: 16000 },
  { date: '04/05', investment: 1250, conversions: 40, cpc: 2.4, ctr: 3.1, impressions: 15500 },
  { date: '05/05', investment: 1400, conversions: 48, cpc: 2.7, ctr: 3.5, impressions: 17000 },
  { date: '06/05', investment: 1350, conversions: 46, cpc: 2.6, ctr: 3.3, impressions: 16500 },
  { date: '07/05', investment: 1500, conversions: 52, cpc: 2.8, ctr: 3.6, impressions: 18000 },
  { date: '08/05', investment: 1450, conversions: 50, cpc: 2.7, ctr: 3.4, impressions: 17500 },
  { date: '09/05', investment: 1600, conversions: 55, cpc: 2.9, ctr: 3.7, impressions: 19000 },
  { date: '10/05', investment: 1550, conversions: 53, cpc: 2.8, ctr: 3.5, impressions: 18500 },
  { date: '11/05', investment: 1700, conversions: 58, cpc: 3.0, ctr: 3.8, impressions: 20000 },
  { date: '12/05', investment: 1650, conversions: 56, cpc: 2.9, ctr: 3.6, impressions: 19500 },
  { date: '13/05', investment: 1750, conversions: 60, cpc: 3.1, ctr: 3.9, impressions: 21000 },
  { date: '14/05', investment: 1700, conversions: 58, cpc: 3.0, ctr: 3.7, impressions: 20500 },
];

const mockFacebookCampaigns: Campaign[] = [
  { 
    id: '1', 
    name: 'Campanha Conversão - Leads', 
    status: 'active', 
    platform: 'facebook',
    investment: 1200.50, 
    conversions: 42, 
    cpa: 28.58, 
    pixelStatus: 'active',
    events: ['ViewContent', 'Lead']
  },
  { 
    id: '2', 
    name: 'Remarketing - Abandono Carrinho', 
    status: 'active', 
    platform: 'facebook',
    investment: 850.75, 
    conversions: 38, 
    cpa: 22.39, 
    pixelStatus: 'active',
    events: ['AddToCart', 'Purchase'] 
  },
  { 
    id: '3', 
    name: 'Campanha Brand Awareness', 
    status: 'paused', 
    platform: 'facebook',
    investment: 450.25, 
    conversions: 10, 
    cpa: 45.03, 
    pixelStatus: 'inactive',
    events: ['ViewContent'] 
  },
  { 
    id: '4', 
    name: 'Tráfego - Blog', 
    status: 'active', 
    platform: 'facebook',
    investment: 300.00, 
    conversions: 15, 
    cpa: 20.00, 
    pixelStatus: 'active',
    events: ['ViewContent', 'Lead'] 
  },
];

const mockGoogleCampaigns: Campaign[] = [
  { 
    id: '5', 
    name: 'Search - Palavras-chave Principais', 
    status: 'active', 
    platform: 'google',
    investment: 980.50, 
    conversions: 32, 
    cpa: 30.64, 
    pixelStatus: 'active',
    events: ['click', 'conversion'] 
  },
  { 
    id: '6', 
    name: 'Display - Remarketing', 
    status: 'active', 
    platform: 'google',
    investment: 560.75, 
    conversions: 18, 
    cpa: 31.15, 
    pixelStatus: 'active',
    events: ['impression', 'click', 'conversion'] 
  },
  { 
    id: '7', 
    name: 'YouTube - Brand Awareness', 
    status: 'ended', 
    platform: 'google',
    investment: 800.25, 
    conversions: 12, 
    cpa: 66.69, 
    pixelStatus: 'inactive',
    events: ['view', 'click'] 
  },
];

const Dashboard = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'facebook' | 'google'>('all');

  const totalInvestment = mockFacebookCampaigns.reduce((acc, campaign) => acc + campaign.investment, 0) + 
                          mockGoogleCampaigns.reduce((acc, campaign) => acc + campaign.investment, 0);
  
  const totalConversions = mockFacebookCampaigns.reduce((acc, campaign) => acc + campaign.conversions, 0) + 
                          mockGoogleCampaigns.reduce((acc, campaign) => acc + campaign.conversions, 0);

  const totalCPA = totalInvestment / totalConversions;
  const totalRevenue = totalConversions * 100; // Assuming average value per conversion
  const totalROAS = totalRevenue / totalInvestment;
  const totalImpressions = mockPerformanceData.reduce((acc, day) => acc + day.impressions, 0);
  
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        
        <main className="p-4 lg:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Visão Geral da Performance</h2>
            <PlatformToggle activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
          
          {/* Metrics Summary */}
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

          {/* Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <PerformanceChart data={mockPerformanceData} title="Performance por Dia" />
            
            <div className="grid grid-cols-1 gap-4">
              <div className="dashboard-card p-4">
                <h3 className="text-base font-medium mb-4">Insights e Alertas</h3>
                <div className="space-y-3">
                  <InsightCard 
                    type="success" 
                    title="Melhor Campanha" 
                    description="Remarketing - Abandono de Carrinho tem o melhor CPA"
                    metric="R$ 22,39" 
                  />
                  <InsightCard 
                    type="danger" 
                    title="Pixel Inativo" 
                    description="Campanha YouTube - Brand Awareness está com o pixel desativado"
                  />
                  <InsightCard 
                    type="warning" 
                    title="CPC Aumentando" 
                    description="O CPC aumentou 15% em relação ao período anterior"
                    metric="R$ 2,80 → R$ 3,22" 
                  />
                  <InsightCard 
                    type="info" 
                    title="ROAS Positivo" 
                    description="Seu retorno sobre investimento está acima da média do setor"
                    metric="2.83x" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Facebook Data Section */}
          {(activeTab === 'all' || activeTab === 'facebook') && (
            <div className="mb-6">
              <FacebookDashboard />
            </div>
          )}

          {/* Platform Specific Sections */}
          {(activeTab === 'all' || activeTab === 'facebook') && (
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
                  value={mockFacebookCampaigns.reduce((acc, campaign) => acc + campaign.investment, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  icon={<DollarSign size={18} />}
                  className="bg-facebook/5 border-facebook/10"
                />
                <MetricCard 
                  title="Conversões" 
                  value={mockFacebookCampaigns.reduce((acc, campaign) => acc + campaign.conversions, 0)}
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
              <CampaignTable data={mockFacebookCampaigns} title="Campanhas do Facebook Ads" platform="facebook" />
            </div>
          )}

          {/* Google Ads Section */}
          {(activeTab === 'all' || activeTab === 'google') && (
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
                  value={mockGoogleCampaigns.reduce((acc, campaign) => acc + campaign.investment, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  icon={<DollarSign size={18} />}
                  className="bg-google/5 border-google/10"
                />
                <MetricCard 
                  title="Conversões" 
                  value={mockGoogleCampaigns.reduce((acc, campaign) => acc + campaign.conversions, 0)}
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
              <CampaignTable data={mockGoogleCampaigns} title="Campanhas do Google Ads" platform="google" />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
