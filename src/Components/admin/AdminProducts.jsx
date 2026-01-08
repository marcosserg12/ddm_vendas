import React, { useState } from 'react';
import { base44 } from '../../api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Pencil, Trash2, Search, Loader2,
  Package, Eye, EyeOff, X
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Checkbox } from '../ui/checkbox';

// IMPORTANTE: O novo componente de upload
import MultiImageUpload from './MultiImageUpload';

const CATEGORIAS = [
  { id: 'sapatas', name: 'Sapatas para Compactadores' },
  { id: 'coxins_batentes', name: 'Coxins e Batentes' },
  { id: 'protecoes_sanfonadas', name: 'Proteções Sanfonadas' },
  { id: 'molas', name: 'Molas' },
  { id: 'outros', name: 'Outros' }
];

const MARCAS = [
  'Wacker', 'Weber', 'Dynapac/Vipart', 'Claridon', 'Hoffmann',
  'Mikasa/Multiquip', 'Petrotec', 'Bomaq', 'Komatsu',
  'Ingersoll-Rand', 'Stone', 'Peças Motor', 'Bombas', 'Masalta'
];

const SERIES_POR_MARCA = {
  'Wacker': ['BS', 'DPU', 'VP', 'VPG', 'WP', 'R'],
  'Weber': ['CF', 'CR', 'MT', 'SRV'],
  'Dynapac/Vipart': ['CC', 'CP', 'LP', 'LT'],
  'Bomaq': ['BPR', 'BW', 'BVP'],
  'Mikasa/Multiquip': ['MVC', 'MVH', 'MTX'],
  'Komatsu': ['PC', 'WA'],
  'Ingersoll-Rand': ['DD', 'SD'],
  'Stone': ['SG', 'SVR'],
  'Masalta': ['MS', 'MR'],
};

const MODELOS_POR_SERIE = {
  'BS': ['BS-50', 'BS-500', 'BS-52', 'BS-60', 'BS-600', 'BS-62', 'BS-62Y', 'BS-700', 'BS-70', 'BS-65Y'],
  'DPU': ['DPU-2540', 'DPU-2550', 'DPU-2560', 'DPU-3050', 'DPU-3060', 'DPU-4045', 'DPU-5045'],
  'VP': ['VP-1135', 'VP-1340', 'VP-1550', 'VP-2050'],
  'VPG': ['VPG-155', 'VPG-160', 'VPG-165'],
  'WP': ['WP-1540', 'WP-1550', 'WP-2050'],
  'CF': ['CF-2', 'CF-3'],
  'CR': ['CR-1', 'CR-2', 'CR-3', 'CR-6'],
  'MT': ['MT-52', 'MT-54'],
  'CC': ['CC-1000', 'CC-1100', 'CC-900'],
  'CP': ['CP-132', 'CP-142', 'CP-271'],
  'BPR': ['BPR-25/40', 'BPR-35/60'],
  'BW': ['BW-55', 'BW-65'],
  'MVC': ['MVC-80', 'MVC-90', 'MVC-100'],
  'PC': ['PC-200', 'PC-300'],
};

const emptyProduct = {
  nome: '',
  num_figura: '',
  referencia: '',
  num_ddm: '',
  categoria: 'sapatas',
  marca: 'Wacker',
  serie: '',
  modelos_compativeis: [],
  imagem_url: '',
  imagens: [], // Array para múltiplas imagens
  preco: 0,
  preco_promocional: null,
  estoque: 0,
  peso_kg: 0.5,
  rosca: '',
  diametro_mm: '',
  altura: '',
  comprimento: '',
  diametro_menor: '',
  porca: '',
  parafuso: '',
  dureza: '',
  diametro_maior: '',
  diametro_interno: '',
  material: '',
  cor: '',
  destaque: false,
  ativo: true
};

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(emptyProduct);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: products, isLoading } = useQuery({
    queryKey: ['allProducts'],
    queryFn: () => base44.entities.Product.list(),
    initialData: []
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Product.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allProducts'] });
      setDialogOpen(false);
      resetForm();
      toast.success('Produto criado com sucesso!');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Product.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allProducts'] });
      setDialogOpen(false);
      resetForm();
      toast.success('Produto atualizado!');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Product.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allProducts'] });
      toast.success('Produto excluído!');
    }
  });

  const resetForm = () => {
    setFormData(emptyProduct);
    setEditingProduct(null);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      ...emptyProduct,
      ...product,
      // Garante que imagens seja um array
      imagens: Array.isArray(product.imagens) ? product.imagens : []
    });
    setDialogOpen(true);
  };

  const handleNew = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    const data = { ...formData };
    if (data.preco_promocional === '') data.preco_promocional = null;

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleModelToggle = (modelo) => {
    setFormData(prev => {
      const current = prev.modelos_compativeis || [];
      if (current.includes(modelo)) {
        return { ...prev, modelos_compativeis: current.filter(m => m !== modelo) };
      } else {
        return { ...prev, modelos_compativeis: [...current, modelo] };
      }
    });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const filteredProducts = products.filter(p =>
    p.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.num_ddm?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableSeries = SERIES_POR_MARCA[formData.marca] || [];
  const availableModels = MODELOS_POR_SERIE[formData.serie] || [];

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gerenciar Produtos</CardTitle>
          <Button onClick={handleNew} className="bg-orange-500 hover:bg-orange-600">
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </Button>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou código DDM..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Products Table */}
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-16">Imagem</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Código DDM</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Nenhum produto encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="relative w-12 h-12 bg-gray-100 rounded overflow-hidden">
                          {product.imagem_url ? (
                            <img src={product.imagem_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-300" />
                            </div>
                          )}
                          {/* Badge indicando mais imagens */}
                          {product.imagens && product.imagens.length > 0 && (
                             <div className="absolute top-0 right-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" title={`+${product.imagens.length} imagens`}></div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-gray-900 line-clamp-1">{product.nome}</p>
                        <p className="text-xs text-gray-500">{CATEGORIAS.find(c => c.id === product.categoria)?.name}</p>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{product.num_ddm}</TableCell>
                      <TableCell>{product.marca}</TableCell>
                      <TableCell>
                        {product.preco_promocional ? (
                          <div>
                            <span className="line-through text-gray-400 text-xs">{formatCurrency(product.preco)}</span>
                            <br />
                            <span className="font-semibold text-green-600">{formatCurrency(product.preco_promocional)}</span>
                          </div>
                        ) : (
                          <span className="font-semibold">{formatCurrency(product.preco)}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={product.estoque > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                          {product.estoque || 0}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {product.ativo !== false ? (
                          <Badge className="bg-green-100 text-green-700">
                            <Eye className="w-3 h-3 mr-1" />
                            Ativo
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-700">
                            <EyeOff className="w-3 h-3 mr-1" />
                            Inativo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(product)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => {
                              if (confirm('Deseja excluir este produto?')) {
                                deleteMutation.mutate(product.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Product Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Editar Produto' : 'Novo Produto'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Nome do Produto *</Label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Sapata para Compactador BS-60"
                />
              </div>

              <div className="space-y-2">
                <Label>Código DDM *</Label>
                <Input
                  value={formData.num_ddm}
                  onChange={(e) => setFormData(prev => ({ ...prev, num_ddm: e.target.value }))}
                  placeholder="Ex: DDM-001"
                />
              </div>

              <div className="space-y-2">
                <Label>Nº Figura</Label>
                <Input
                  value={formData.num_figura}
                  onChange={(e) => setFormData(prev => ({ ...prev, num_figura: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Referência</Label>
                <Input
                  value={formData.referencia}
                  onChange={(e) => setFormData(prev => ({ ...prev, referencia: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Categoria *</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, categoria: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* AQUI ESTÁ O NOVO COMPONENTE DE UPLOAD */}
            <div className="space-y-2">
               <MultiImageUpload
                  mainImage={formData.imagem_url}
                  images={formData.imagens || []}
                  onMainImageChange={(url) => setFormData(prev => ({ ...prev, imagem_url: url }))}
                  onImagesChange={(imgs) => setFormData(prev => ({ ...prev, imagens: imgs }))}
               />
            </div>

            {/* Brand & Compatibility */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <h3 className="font-semibold text-gray-900">Compatibilidade (Máquinas)</h3>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Marca *</Label>
                  <Select
                    value={formData.marca}
                    onValueChange={(v) => setFormData(prev => ({
                      ...prev,
                      marca: v,
                      serie: '',
                      modelos_compativeis: []
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MARCAS.map((marca) => (
                        <SelectItem key={marca} value={marca}>{marca}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Série</Label>
                  <Select
                    value={formData.serie}
                    onValueChange={(v) => setFormData(prev => ({
                      ...prev,
                      serie: v,
                      modelos_compativeis: []
                    }))}
                    disabled={availableSeries.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSeries.map((serie) => (
                        <SelectItem key={serie} value={serie}>{serie}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Models Checkboxes */}
              {availableModels.length > 0 && (
                <div className="space-y-2">
                  <Label>Modelos Compatíveis</Label>
                  <div className="grid grid-cols-4 gap-2 p-3 bg-white rounded-lg border">
                    {availableModels.map((modelo) => (
                      <label key={modelo} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={(formData.modelos_compativeis || []).includes(modelo)}
                          onCheckedChange={() => handleModelToggle(modelo)}
                        />
                        <span className="text-sm">{modelo}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {formData.modelos_compativeis?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-500">Selecionados:</span>
                  {formData.modelos_compativeis.map((m) => (
                    <Badge key={m} className="bg-orange-100 text-orange-700">
                      {m}
                      <button
                        type="button"
                        onClick={() => handleModelToggle(m)}
                        className="ml-1 hover:text-orange-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Preço (R$) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.preco}
                  onChange={(e) => setFormData(prev => ({ ...prev, preco: parseFloat(e.target.value) || 0 }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Preço Promocional (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.preco_promocional || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    preco_promocional: e.target.value ? parseFloat(e.target.value) : null
                  }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Estoque</Label>
                <Input
                  type="number"
                  value={formData.estoque}
                  onChange={(e) => setFormData(prev => ({ ...prev, estoque: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Peso (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.peso_kg}
                  onChange={(e) => setFormData(prev => ({ ...prev, peso_kg: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>

            {/* Technical Specs */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Especificações Técnicas</h3>
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Rosca</Label>
                  <Input
                    value={formData.rosca}
                    onChange={(e) => setFormData(prev => ({ ...prev, rosca: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Diâmetro MM</Label>
                  <Input
                    value={formData.diametro_mm}
                    onChange={(e) => setFormData(prev => ({ ...prev, diametro_mm: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Altura</Label>
                  <Input
                    value={formData.altura}
                    onChange={(e) => setFormData(prev => ({ ...prev, altura: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Comprimento</Label>
                  <Input
                    value={formData.comprimento}
                    onChange={(e) => setFormData(prev => ({ ...prev, comprimento: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Diâmetro Maior</Label>
                  <Input
                    value={formData.diametro_maior}
                    onChange={(e) => setFormData(prev => ({ ...prev, diametro_maior: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Diâmetro Menor</Label>
                  <Input
                    value={formData.diametro_menor}
                    onChange={(e) => setFormData(prev => ({ ...prev, diametro_menor: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Dureza</Label>
                  <Input
                    value={formData.dureza}
                    onChange={(e) => setFormData(prev => ({ ...prev, dureza: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Material</Label>
                  <Input
                    value={formData.material}
                    onChange={(e) => setFormData(prev => ({ ...prev, material: e.target.value }))}
                    placeholder="Ex: Borracha Natural"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cor</Label>
                  <Input
                    value={formData.cor}
                    onChange={(e) => setFormData(prev => ({ ...prev, cor: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Porca</Label>
                  <Input
                    value={formData.porca}
                    onChange={(e) => setFormData(prev => ({ ...prev, porca: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Parafuso</Label>
                  <Input
                    value={formData.parafuso}
                    onChange={(e) => setFormData(prev => ({ ...prev, parafuso: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Flags */}
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={formData.destaque}
                  onCheckedChange={(v) => setFormData(prev => ({ ...prev, destaque: v }))}
                />
                <span className="text-sm">Produto em Destaque</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={formData.ativo !== false}
                  onCheckedChange={(v) => setFormData(prev => ({ ...prev, ativo: v }))}
                />
                <span className="text-sm">Produto Ativo (visível na loja)</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-orange-500 hover:bg-orange-600"
                disabled={createMutation.isPending || updateMutation.isPending || !formData.nome || !formData.num_ddm}
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {editingProduct ? 'Salvar Alterações' : 'Criar Produto'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}