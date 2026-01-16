import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { __ddmDatabase } from '../../api/MysqlServer.js';
import { Search, Eye, FileText, Loader2, Calendar, DollarSign } from 'lucide-react';
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

  const filtered = Vendas.filter(v =>
    v.nu_venda?.toString().includes(searchTerm) ||
    v.ds_nome?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 shadow-sm overflow-hidden">

      {/* --- HEADER (Responsivo) --- */}
      <div className="p-6 border-b bg-gray-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-sm font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
          <FileText className="w-5 h-5 text-orange-500" /> Histórico de Vendas
        </h2>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Buscar pedido..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 h-11 rounded-xl border-2 bg-white focus:bg-white transition-all"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : (
        <>
          {/* --- VIEW DESKTOP (Tabela) --- */}
          <div className="hidden md:block">
            <Table>
                <TableHeader className="bg-gray-50">
                <TableRow>
                    <TableHead className="font-black text-gray-900 uppercase text-[10px] tracking-wider">Venda</TableHead>
                    <TableHead className="font-black text-gray-900 uppercase text-[10px] tracking-wider">Data</TableHead>
                    <TableHead className="font-black text-gray-900 uppercase text-[10px] tracking-wider">Total</TableHead>
                    <TableHead className="font-black text-gray-900 uppercase text-[10px] tracking-wider">Status</TableHead>
                    <TableHead className="text-right font-black text-gray-900 uppercase text-[10px] tracking-wider">Ação</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {filtered.map((v) => (
                    <TableRow key={v.id_venda} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-black text-gray-900 text-xs">#VN-{v.nu_venda}</TableCell>
                    <TableCell className="text-xs font-bold text-gray-500">{new Date(v.dt_venda).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="font-black text-gray-900 text-xs">R$ {v.nu_valor_total_nota}</TableCell>
                    <TableCell>
                        <Badge className={`text-[9px] font-black uppercase border ${getStatusColor(v.st_venda)}`}>
                            {v.st_venda?.toUpperCase()}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-orange-600 hover:bg-orange-50"><Eye className="w-4 h-4" /></Button>
                    </TableCell>
                    </TableRow>
                ))}
                {filtered.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-gray-400 text-xs font-bold uppercase">Nenhuma venda encontrada</TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
          </div>

          {/* --- VIEW MOBILE (Cards) --- */}
          <div className="block md:hidden bg-gray-50/30">
            {filtered.length > 0 ? (
                <div className="divide-y divide-gray-100">
                    {filtered.map((v) => (
                        <div key={v.id_venda} className="p-4 bg-white flex flex-col gap-3">
                            {/* Linha 1: ID e Status */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Pedido</p>
                                    <p className="text-sm font-black text-gray-900">#VN-{v.nu_venda}</p>
                                </div>
                                <Badge className={`text-[9px] font-black uppercase border ${getStatusColor(v.st_venda)}`}>
                                    {v.st_venda}
                                </Badge>
                            </div>

                            {/* Linha 2: Detalhes Grid */}
                            <div className="grid grid-cols-2 gap-4 py-2 border-t border-b border-gray-50 border-dashed my-1">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                    <span className="text-xs font-bold text-gray-600">{new Date(v.dt_venda).toLocaleDateString('pt-BR')}</span>
                                </div>
                                <div className="flex items-center gap-2 justify-end">
                                    <DollarSign className="w-3.5 h-3.5 text-gray-400" />
                                    <span className="text-sm font-black text-gray-900">R$ {v.nu_valor_total_nota}</span>
                                </div>
                            </div>

                            {/* Linha 3: Botão */}
                            <Button variant="outline" className="w-full h-10 border-gray-200 text-gray-600 font-bold uppercase text-[10px] tracking-widest hover:text-orange-600 hover:border-orange-200">
                                Ver Detalhes
                            </Button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-10 text-center text-gray-400 text-xs font-bold uppercase">
                    Nenhuma venda encontrada
                </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}