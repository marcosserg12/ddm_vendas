import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { __ddmDatabase } from '../../api/MysqlServer.js';
import { Search, Eye, FileText, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

export default function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: Vendas = [], isLoading } = useQuery({
    queryKey: ['TodasVendas'],
    queryFn: () => __ddmDatabase.entities.Vendas.list()
  });

  const getStatusColor = (s) => {
    switch (s) {
      case 'Paga': return 'bg-green-100 text-green-700 border-green-200';
      case 'Pendente': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Cancelada': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  const filtered = Vendas.filter(v => v.nu_venda?.toString().includes(searchTerm) || v.ds_nome?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b bg-gray-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-sm font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
          <FileText className="w-5 h-5 text-orange-500" /> Histórico de Vendas
        </h2>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Buscar por Nº da Venda..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 h-11 rounded-xl border-2" />
        </div>
      </div>
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="font-black text-gray-900 uppercase text-[10px]">Venda</TableHead>
            <TableHead className="font-black text-gray-900 uppercase text-[10px]">Data</TableHead>
            <TableHead className="font-black text-gray-900 uppercase text-[10px]">Total</TableHead>
            <TableHead className="font-black text-gray-900 uppercase text-[10px]">Status</TableHead>
            <TableHead className="text-right font-black text-gray-900 uppercase text-[10px]">Ver</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow><TableCell colSpan={5} className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500" /></TableCell></TableRow>
          ) : filtered.map((v) => (
            <TableRow key={v.id_venda} className="hover:bg-gray-50 transition-colors">
              <TableCell className="font-black text-gray-900">#VN-{v.nu_venda}</TableCell>
              <TableCell className="text-xs font-bold text-gray-500">{new Date(v.dt_venda).toLocaleDateString('pt-BR')}</TableCell>
              <TableCell className="font-black text-gray-900">R$ {v.nu_valor_total_nota}</TableCell>
              <TableCell><Badge className={getStatusColor(v.st_venda)}>{v.st_venda?.toUpperCase()}</Badge></TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" className="hover:text-orange-600"><Eye className="w-5 h-5" /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}