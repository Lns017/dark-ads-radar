import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Edit, Trash2, Plus, DollarSign, ShoppingCart } from 'lucide-react';

// Define schema for creating a new campaign
const campaignSchema = z.object({
  nome_campanha: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
  pixel_id: z.string({
    required_error: 'Selecione um pixel',
  }),
  investimento: z.coerce.number().min(0, 'O investimento não pode ser negativo'),
  conversoes: z.coerce.number().min(0, 'O número de conversões não pode ser negativo'),
});

type CampaignFormValues = z.infer<typeof campaignSchema>;

interface Campaign {
  id: string;
  pixel_id: string;
  nome_campanha: string;
  investimento: number;
  conversoes: number;
  custo_por_conversao: number;
  data: string;
}

interface Pixel {
  id: string;
  nome_pixel: string;
  plataforma: string;
}

const Campaigns = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      nome_campanha: '',
      pixel_id: '',
      investimento: 0,
      conversoes: 0,
    },
  });

  const editForm = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      nome_campanha: '',
      pixel_id: '',
      investimento: 0,
      conversoes: 0,
    },
  });

  // Fetch campaigns with pixel info
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campanhas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campanhas')
        .select(`
          id,
          pixel_id,
          nome_campanha,
          investimento,
          conversoes,
          custo_por_conversao,
          data,
          pixels (id, nome_pixel, plataforma)
        `)
        .order('data', { ascending: false });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    },
    enabled: !!user,
  });

  // Fetch pixels for dropdown
  const { data: pixels } = useQuery({
    queryKey: ['pixels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pixels')
        .select('id, nome_pixel, plataforma')
        .order('criado_em', { ascending: false });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data as Pixel[];
    },
    enabled: !!user,
  });

  // Add new campaign mutation
  const addCampaignMutation = useMutation({
    mutationFn: async (values: CampaignFormValues) => {
      // Calculate cost per conversion
      const custo_por_conversao = values.conversoes > 0
        ? values.investimento / values.conversoes
        : 0;

      const { data, error } = await supabase
        .from('campanhas')
        .insert({
          nome_campanha: values.nome_campanha,
          pixel_id: values.pixel_id,
          investimento: values.investimento,
          conversoes: values.conversoes,
          custo_por_conversao
        })
        .select();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campanhas'] });
      setIsAddDialogOpen(false);
      form.reset();
      toast.success('Campanha adicionada com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao adicionar campanha: ${error.message}`);
    },
  });

  // Update campaign mutation
  const updateCampaignMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string, values: CampaignFormValues }) => {
      // Calculate cost per conversion
      const custo_por_conversao = values.conversoes > 0
        ? values.investimento / values.conversoes
        : 0;

      const { data, error } = await supabase
        .from('campanhas')
        .update({
          nome_campanha: values.nome_campanha,
          pixel_id: values.pixel_id,
          investimento: values.investimento,
          conversoes: values.conversoes,
          custo_por_conversao
        })
        .eq('id', id)
        .select();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campanhas'] });
      setIsEditDialogOpen(false);
      setSelectedCampaign(null);
      toast.success('Campanha atualizada com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar campanha: ${error.message}`);
    },
  });

  // Delete campaign mutation
  const deleteCampaignMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('campanhas')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campanhas'] });
      setIsDeleteDialogOpen(false);
      setSelectedCampaign(null);
      toast.success('Campanha excluída com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao excluir campanha: ${error.message}`);
    },
  });

  // Handle form submission for adding a new campaign
  const onAddSubmit = (values: CampaignFormValues) => {
    addCampaignMutation.mutate(values);
  };

  // Handle form submission for editing a campaign
  const onEditSubmit = (values: CampaignFormValues) => {
    if (selectedCampaign) {
      updateCampaignMutation.mutate({ id: selectedCampaign.id, values });
    }
  };

  // Handle opening the edit dialog
  const handleEditClick = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    editForm.reset({
      nome_campanha: campaign.nome_campanha,
      pixel_id: campaign.pixel_id,
      investimento: campaign.investimento,
      conversoes: campaign.conversoes,
    });
    setIsEditDialogOpen(true);
  };

  // Handle opening the delete dialog
  const handleDeleteClick = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsDeleteDialogOpen(true);
  };

  // Handle confirming the deletion of a campaign
  const confirmDelete = () => {
    if (selectedCampaign) {
      deleteCampaignMutation.mutate(selectedCampaign.id);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        
        <main className="p-4 lg:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Minhas Campanhas</h2>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus size={16} />
                  <span>Adicionar Campanha</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Adicionar Nova Campanha</DialogTitle>
                  <DialogDescription>
                    Cadastre uma nova campanha vinculada a um pixel.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onAddSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="nome_campanha"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Campanha</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Campanha Black Friday" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pixel_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Pixel</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um pixel" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {pixels?.map((pixel) => (
                                <SelectItem key={pixel.id} value={pixel.id}>
                                  {pixel.nome_pixel} ({pixel.plataforma})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="investimento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Investimento (R$)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="conversoes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Conversões</FormLabel>
                          <FormControl>
                            <Input type="number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <Button 
                        type="submit" 
                        disabled={addCampaignMutation.isPending}
                      >
                        {addCampaignMutation.isPending ? 'Salvando...' : 'Salvar'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="rounded-lg border bg-card">
            {isLoading ? (
              <div className="py-10 text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
                <p className="mt-2 text-muted-foreground">Carregando campanhas...</p>
              </div>
            ) : campaigns && campaigns.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome da Campanha</TableHead>
                      <TableHead>Pixel</TableHead>
                      <TableHead>Investimento</TableHead>
                      <TableHead>Conversões</TableHead>
                      <TableHead>CPA</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign: any) => (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">{campaign.nome_campanha}</TableCell>
                        <TableCell>{campaign.pixels?.nome_pixel}</TableCell>
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
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => handleEditClick(campaign)}
                            >
                              <Edit size={16} />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="icon" 
                              onClick={() => handleDeleteClick(campaign)}
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="py-10 text-center">
                <p className="text-muted-foreground">Você ainda não possui campanhas cadastradas.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  <Plus size={16} className="mr-2" />
                  Adicionar sua primeira campanha
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Edit Campaign Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Campanha</DialogTitle>
            <DialogDescription>
              Altere as informações da campanha selecionada.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="nome_campanha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Campanha</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Campanha Black Friday" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="pixel_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pixel</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um pixel" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {pixels?.map((pixel) => (
                          <SelectItem key={pixel.id} value={pixel.id}>
                            {pixel.nome_pixel} ({pixel.plataforma})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="investimento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Investimento (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="conversoes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conversões</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={updateCampaignMutation.isPending}
                >
                  {updateCampaignMutation.isPending ? 'Atualizando...' : 'Atualizar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Campaign Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Excluir Campanha</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta campanha? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row justify-between sm:justify-between">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteCampaignMutation.isPending}
            >
              {deleteCampaignMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Campaigns;
