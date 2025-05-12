
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/dashboard/Header';
import Sidebar from '@/components/dashboard/Sidebar';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import LoadingSpinner from '@/components/ui/loading-spinner';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import { ArrowLeft, Calendar, DollarSign, ShoppingCart, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateRangePicker } from '@/components/dashboard/DateRangePicker';
import { format } from 'date-fns';

interface Pixel {
  id: string;
  nome_pixel: string;
  plataforma: 'facebook' | 'google';
  status: 'ativo' | 'inativo';
  eventos_capturados: string[];
  criado_em: string;
}

interface Campaign {
  id: string;
  pixel_id: string;
  nome_campanha: string;
  investimento: number;
  conversoes: number;
  custo_por_conversao: number;
  data: string;
}

// Generate random performance data for demo purposes
const generatePerformanceData = (campaigns: Campaign[]) => {
  // Get last 14 days
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 13);
  
  const dates: string[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(format(currentDate, 'dd/MM'));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates.map(date => {
    // Generate random data based on campaigns
    const investment = Math.round(Math.random() * 1000 + 500);
    const conversions = Math.round(Math.random() * 50 + 10);
    
    return {
      date,
      investment,
      conversions,
      cpc: (investment / conversions / 100).toFixed(2),
      ctr: (Math.random() * 3 + 1).toFixed(1),
      impressions: Math.round(Math.random() * 10000 + 5000)
    };
  });
};

const PixelDetail = () => {
  const { pixelId } = useParams<{ pixelId: string }>();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sortBy, setSortBy] = useState<string>('data');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date()
  });
  
  const { user } = useAuth();
  
  // Fetch pixel details
  const { data: pixel, isLoading: isLoadingPixel } = useQuery({
    queryKey: ['pixel', pixelId],
    queryFn: async () => {
      if (!pixelId) throw new Error('Pixel ID não fornecido');
      
      const { data, error } = await supabase
        .from('pixels')
        .select('*')
        .eq('id', pixelId)
        .single();
      
      if (error) throw error;
      return data as Pixel;
    },
    enabled: !!pixelId,
  });
  
  // Fetch campaigns for this pixel
  const { data: campaigns, isLoading: isLoadingCampaigns } = useQuery({
    queryKey: ['campaigns', pixelId, sortBy, sortOrder, dateRange],
    queryFn: async () => {
      if (!pixelId) throw new Error('Pixel ID não fornecido');
      
      let query = supabase
        .from('campanhas')
        .select('*')
        .eq('pixel_id', pixelId)
        .gte('data', dateRange.from.toISOString())
        .lte('data', dateRange.to.toISOString());
        
      // Apply sorting
      if (sortBy) {
        query = query.order(sortBy, { ascending: sortOrder === 'asc' });
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Campaign[];
    },
    enabled: !!pixelId,
  });
  
  const performanceData = campaigns ? generatePerformanceData(campaigns) : [];
  
  const isLoading = isLoadingPixel || isLoadingCampaigns;
  
  // Calculate summary metrics
  const totalInvestment = campaigns?.reduce((acc, camp) => acc + camp.investimento, 0) || 0;
  const totalConversions = campaigns?.reduce((acc, camp) => acc + camp.conversoes, 0) || 0;
  const avgCPA = totalConversions > 0 ? totalInvestment / totalConversions : 0;
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <Header collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
          <main className="p-4 lg:p-6 flex justify-center items-center min-h-[calc(100vh-64px)]">
            <LoadingSpinner size="lg" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        <main className="p-4 lg:p-6">
          {/* Back button and title */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/pixels')}
                className="mb-2"
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para Pixels
              </Button>
              <div className="flex items-center">
                <h1 className="text-2xl font-bold">{pixel?.nome_pixel}</h1>
                <Badge 
                  variant={pixel?.status === 'ativo' ? 'default' : 'secondary'}
                  className="ml-3"
                >
                  {pixel?.status === 'ativo' ? 'Ativo' : 'Inativo'}
                </Badge>
                <Badge 
                  variant="outline"
                  className={`ml-2 ${pixel?.plataforma === 'facebook' ? 'text-facebook' : 'text-google'}`}
                >
                  {pixel?.plataforma === 'facebook' ? 'Facebook' : 'Google'}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">
                Criado em {new Date(pixel?.criado_em!).toLocaleDateString('pt-BR')}
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-2">
              <DateRangePicker
                date={dateRange}
                onDateChange={setDateRange}
              />
            </div>
          </div>

          {/* Metrics summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Investimento Total</p>
                  <p className="text-2xl font-bold mt-1">
                    {totalInvestment.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-primary/10">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Conversões</p>
                  <p className="text-2xl font-bold mt-1">{totalConversions}</p>
                </div>
                <div className="p-3 rounded-full bg-primary/10">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Custo por Aquisição</p>
                  <p className="text-2xl font-bold mt-1">
                    {avgCPA.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-primary/10">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
              </div>
            </Card>
          </div>

          {/* Performance chart */}
          <div className="mb-6">
            <PerformanceChart data={performanceData} title="Performance por Dia" />
          </div>

          {/* Campaigns tabs */}
          <div className="mb-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <h2 className="text-xl font-semibold">Campanhas</h2>
              
              <div className="flex gap-2 items-center">
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  <span className="text-sm mr-2">Ordenar por:</span>
                </div>
                <Select
                  value={sortBy}
                  onValueChange={setSortBy}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="data">Data</SelectItem>
                    <SelectItem value="nome_campanha">Nome</SelectItem>
                    <SelectItem value="investimento">Investimento</SelectItem>
                    <SelectItem value="conversoes">Conversões</SelectItem>
                    <SelectItem value="custo_por_conversao">CPA</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select
                  value={sortOrder}
                  onValueChange={(val) => setSortOrder(val as 'asc' | 'desc')}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asc">Crescente</SelectItem>
                    <SelectItem value="desc">Decrescente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-lg border bg-card">
              {campaigns && campaigns.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome da Campanha</TableHead>
                        <TableHead>Investimento</TableHead>
                        <TableHead>Conversões</TableHead>
                        <TableHead>CPA</TableHead>
                        <TableHead>Data</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campaigns.map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell className="font-medium">{campaign.nome_campanha}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <DollarSign size={16} className="text-emerald-500" />
                              <span>R$ {campaign.investimento.toFixed(2)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <ShoppingCart size={16} className="text-blue-500" />
                              <span>{campaign.conversoes}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            R$ {campaign.custo_por_conversao.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {new Date(campaign.data).toLocaleDateString('pt-BR')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-10 text-center">
                  <p className="text-muted-foreground">Nenhuma campanha encontrada para este pixel no período selecionado.</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => navigate('/campaigns')}
                  >
                    Adicionar uma campanha
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Pixel events */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Eventos Capturados</h2>
            <Card className="p-6">
              {pixel?.eventos_capturados && pixel.eventos_capturados.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {pixel.eventos_capturados.map((evento, index) => (
                    <Badge key={index} variant="outline">{evento}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhum evento capturado para este pixel.</p>
              )}
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PixelDetail;
