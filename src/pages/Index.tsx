
import React, { useState } from 'react';
import Header from '@/components/dashboard/Header';
import Sidebar from '@/components/dashboard/Sidebar';
import DashboardContainer from '@/components/dashboard/DashboardContainer';
import { Campaign } from '@/components/dashboard/CampaignTable';

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

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        
        <DashboardContainer
          facebookCampaigns={mockFacebookCampaigns}
          googleCampaigns={mockGoogleCampaigns}
          performanceData={mockPerformanceData}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </div>
    </div>
  );
};

export default Dashboard;
