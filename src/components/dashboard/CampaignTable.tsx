
import React from 'react';
import { MoreHorizontal, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'ended';
  platform: 'facebook' | 'google';
  investment: number;
  conversions: number;
  cpa: number;
  pixelStatus: 'active' | 'inactive';
  events: string[];
}

interface CampaignTableProps {
  data: Campaign[];
  title: string;
  platform: 'facebook' | 'google';
}

const CampaignTable: React.FC<CampaignTableProps> = ({ data, title, platform }) => {
  return (
    <div className="table-container">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-base font-medium">{title}</h3>
        <Button variant="outline" size="sm">
          Ver Todas
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Campanha</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Investimento</TableHead>
              <TableHead className="text-right">Conversões</TableHead>
              <TableHead className="text-right">CPA</TableHead>
              <TableHead>Status Pixel</TableHead>
              <TableHead>Eventos</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      campaign.status === 'active' ? 'bg-success' : 
                      campaign.status === 'paused' ? 'bg-warning' : 'bg-muted-foreground'
                    }`}></div>
                    <span className="font-medium">{campaign.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={
                    campaign.status === 'active' ? 'default' : 
                    campaign.status === 'paused' ? 'outline' : 'secondary'
                  }>
                    {campaign.status === 'active' ? 'Ativa' : 
                     campaign.status === 'paused' ? 'Pausada' : 'Finalizada'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">R$ {campaign.investment.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                <TableCell className="text-right">{campaign.conversions}</TableCell>
                <TableCell className="text-right">R$ {campaign.cpa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                <TableCell>
                  {campaign.pixelStatus === 'active' ? (
                    <div className="status-active">
                      <CheckCircle size={14} className="mr-1" />
                      Ativo
                    </div>
                  ) : (
                    <div className="status-inactive">
                      <AlertCircle size={14} className="mr-1" />
                      Inativo
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {campaign.events.map((event, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {event}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <ExternalLink size={14} className="mr-2" />
                        Ver detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        Verificar pixel
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CampaignTable;
