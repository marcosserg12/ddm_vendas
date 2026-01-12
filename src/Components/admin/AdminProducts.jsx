import React, { useState } from 'react';
import { __ddmDatabase } from '../../api/MysqlServer.js';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search, Loader2, Package } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: Produtos = [], isLoading } = useQuery({
    queryKey: ['TodosProdutos'],
    queryFn: () => __ddmDatabase.entities.Produtos.list()
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => __ddmDatabase.entities.Produtos.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['TodosProdutos'] });
      toast.success('Produto excluído com sucesso!');
    }
  });

  const filtered = Produtos.filter(p => p.ds_nome?.toLowerCase().includes(searchTerm.toLowerCase()) || p.nu_ddm?.toString().includes(searchTerm));

  return (
    <Card className="rounded-2xl border-2 shadow-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between bg-gray-50/50 border-b p-6">
        <CardTitle className="font-black uppercase text-sm flex items-center gap-2">
          <Package className="w-5 h-5 text-orange-500" /> Inventário de Peças
        </CardTitle>
        <Button className="bg-orange-500 hover:bg-orange-600 font-bold uppercase text-xs">Novo Produto</Button>
      </CardHeader>
      <CardContent className="p-6">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Buscar por nome ou código DDM..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 h-12 rounded-xl border-2" />
        </div>
        <div className="rounded-xl border-2 overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="font-bold text-gray-900 uppercase text-[10px]">Produto / DDM</TableHead>
                <TableHead className="font-bold text-gray-900 uppercase text-[10px]">Preço Venda</TableHead>
                <TableHead className="font-bold text-gray-900 uppercase text-[10px]">Estoque</TableHead>
                <TableHead className="font-bold text-gray-900 uppercase text-[10px]">Status</TableHead>
                <TableHead className="text-right font-bold text-gray-900 uppercase text-[10px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-12"><Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500" /></TableCell></TableRow>
              ) : filtered.map((p) => (
                <TableRow key={p.id_produto} className="hover:bg-gray-50 transition-colors">
                  <TableCell>
                    <p className="font-black text-gray-900 text-sm uppercase">{p.ds_nome}</p>
                    <p className="font-mono text-[10px] text-orange-600 font-bold">Cód: {p.nu_ddm}</p>
                  </TableCell>
                  <TableCell className="font-black text-gray-800">R$ {p.nu_preco_venda_atual}</TableCell>
                  <TableCell><Badge variant={p.nu_estoque_atual > 5 ? "secondary" : "destructive"}>{p.nu_estoque_atual} UN</Badge></TableCell>
                  <TableCell>{p.st_ativo === 'S' ? <Badge className="bg-green-100 text-green-700">Ativo</Badge> : <Badge className="bg-gray-100 text-gray-400">Inativo</Badge>}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon"><Pencil className="w-4 h-4 text-gray-400" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(p.id_produto)}><Trash2 className="w-4 h-4 text-red-400" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}