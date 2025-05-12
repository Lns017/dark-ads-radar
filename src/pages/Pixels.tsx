
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
import { Badge } from '@/components/ui/badge';
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
import { Edit, Trash2, Plus, Facebook, BarChart3 } from 'lucide-react';

// Define schema for creating a new pixel
const pixelSchema = z.object({
  nome_pixel: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
  plataforma: z.enum(['facebook', 'google'], {
    required_error: 'Selecione uma plataforma',
  }),
  status: z.enum(['ativo', 'inativo'], {
    required_error: 'Selecione um status',
  }),
  eventos_capturados: z.array(z.string()).default([]),
});

type PixelFormValues = z.infer<typeof pixelSchema>;

interface Pixel {
  id: string;
  nome_pixel: string;
  plataforma: 'facebook' | 'google';
  status: 'ativo' | 'inativo';
  eventos_capturados: string[];
  criado_em: string;
}

const Pixels = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPixel, setSelectedPixel] = useState<Pixel | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const form = useForm<PixelFormValues>({
    resolver: zodResolver(pixelSchema),
    defaultValues: {
      nome_pixel: '',
      plataforma: 'facebook',
      status: 'ativo',
      eventos_capturados: [],
    },
  });

  const editForm = useForm<PixelFormValues>({
    resolver: zodResolver(pixelSchema),
    defaultValues: {
      nome_pixel: '',
      plataforma: 'facebook',
      status: 'ativo',
      eventos_capturados: [],
    },
  });

  // Fetch pixels for the current user
  const { data: pixels, isLoading } = useQuery({
    queryKey: ['pixels'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pixels')
        .select('*')
        .order('criado_em', { ascending: false });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data as Pixel[];
    },
    enabled: !!user,
  });

  // Add new pixel mutation
  const addPixelMutation = useMutation({
    mutationFn: async (values: PixelFormValues) => {
      const { data, error } = await supabase
        .from('pixels')
        .insert({
          nome_pixel: values.nome_pixel,
          plataforma: values.plataforma,
          status: values.status,
          user_id: user!.id,
          eventos_capturados: values.eventos_capturados
        })
        .select();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pixels'] });
      setIsAddDialogOpen(false);
      form.reset();
      toast.success('Pixel adicionado com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao adicionar pixel: ${error.message}`);
    },
  });

  // Update pixel mutation
  const updatePixelMutation = useMutation({
    mutationFn: async ({ id, values }: { id: string, values: PixelFormValues }) => {
      const { data, error } = await supabase
        .from('pixels')
        .update({
          nome_pixel: values.nome_pixel,
          plataforma: values.plataforma,
          status: values.status,
          eventos_capturados: values.eventos_capturados
        })
        .eq('id', id)
        .select();
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pixels'] });
      setIsEditDialogOpen(false);
      setSelectedPixel(null);
      toast.success('Pixel atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar pixel: ${error.message}`);
    },
  });

  // Delete pixel mutation
  const deletePixelMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('pixels')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pixels'] });
      setIsDeleteDialogOpen(false);
      setSelectedPixel(null);
      toast.success('Pixel excluído com sucesso!');
    },
    onError: (error) => {
      toast.error(`Erro ao excluir pixel: ${error.message}`);
    },
  });

  // Handle form submission for adding a new pixel
  const onAddSubmit = (values: PixelFormValues) => {
    addPixelMutation.mutate(values);
  };

  // Handle form submission for editing a pixel
  const onEditSubmit = (values: PixelFormValues) => {
    if (selectedPixel) {
      updatePixelMutation.mutate({ id: selectedPixel.id, values });
    }
  };

  // Handle opening the edit dialog
  const handleEditClick = (pixel: Pixel) => {
    setSelectedPixel(pixel);
    editForm.reset({
      nome_pixel: pixel.nome_pixel,
      plataforma: pixel.plataforma,
      status: pixel.status,
      eventos_capturados: pixel.eventos_capturados || [],
    });
    setIsEditDialogOpen(true);
  };

  // Handle opening the delete dialog
  const handleDeleteClick = (pixel: Pixel) => {
    setSelectedPixel(pixel);
    setIsDeleteDialogOpen(true);
  };

  // Handle confirming the deletion of a pixel
  const confirmDelete = () => {
    if (selectedPixel) {
      deletePixelMutation.mutate(selectedPixel.id);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <Header collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
        
        <main className="p-4 lg:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Meus Pixels</h2>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus size={16} />
                  <span>Adicionar Pixel</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Pixel</DialogTitle>
                  <DialogDescription>
                    Cadastre um novo pixel para monitoramento.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onAddSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="nome_pixel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Pixel</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Pixel Facebook Loja" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="plataforma"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plataforma</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a plataforma" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="facebook">Facebook</SelectItem>
                              <SelectItem value="google">Google</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ativo">Ativo</SelectItem>
                              <SelectItem value="inativo">Inativo</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <Button 
                        type="submit" 
                        disabled={addPixelMutation.isPending}
                      >
                        {addPixelMutation.isPending ? 'Salvando...' : 'Salvar'}
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
                <p className="mt-2 text-muted-foreground">Carregando pixels...</p>
              </div>
            ) : pixels && pixels.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Plataforma</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pixels.map((pixel) => (
                      <TableRow key={pixel.id}>
                        <TableCell className="font-medium">{pixel.nome_pixel}</TableCell>
                        <TableCell>
                          {pixel.plataforma === 'facebook' ? (
                            <div className="flex items-center gap-2">
                              <Facebook size={16} className="text-facebook" />
                              <span>Facebook</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <BarChart3 size={16} className="text-google" />
                              <span>Google</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={pixel.status === 'ativo' ? 'default' : 'secondary'}>
                            {pixel.status === 'ativo' ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(pixel.criado_em).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="icon" 
                              onClick={() => handleEditClick(pixel)}
                            >
                              <Edit size={16} />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="icon" 
                              onClick={() => handleDeleteClick(pixel)}
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
                <p className="text-muted-foreground">Você ainda não possui pixels cadastrados.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  <Plus size={16} className="mr-2" />
                  Adicionar seu primeiro pixel
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Edit Pixel Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Pixel</DialogTitle>
            <DialogDescription>
              Altere as informações do pixel selecionado.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="nome_pixel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Pixel</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Pixel Facebook Loja" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="plataforma"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plataforma</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a plataforma" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="google">Google</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={updatePixelMutation.isPending}
                >
                  {updatePixelMutation.isPending ? 'Atualizando...' : 'Atualizar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Pixel Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Excluir Pixel</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este pixel? Esta ação não pode ser desfeita.
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
              disabled={deletePixelMutation.isPending}
            >
              {deletePixelMutation.isPending ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pixels;
