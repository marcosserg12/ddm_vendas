import React, { useState } from "react";
import { __ddmDatabase } from "../../api/MysqlServer.js";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Loader2,
  Package,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import ProductForm from "./ProductForm";

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para controlar o Modal de Formulário
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // --- QUERY: Buscar Produtos ---
  const { data: Produtos = [], isLoading } = useQuery({
    queryKey: ["TodosProdutos"],
    queryFn: () => __ddmDatabase.entities.Produtos.list(),
  });

  // --- MUTATION: Deletar Produto ---
  const deleteMutation = useMutation({
    mutationFn: (id) => __ddmDatabase.entities.Produtos.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["TodosProdutos"] });
      toast.success("Produto excluído com sucesso!");
    },
    onError: (error) => {
      const message = error.message || "";
      if (message.includes("foreign key") || message.includes("1451")) {
        toast.error("Este produto não pode ser excluído pois possui registros de vendas ou outras dependências.");
      } else {
        toast.error("Erro ao excluir produto.");
      }
    },
  });

  // --- HANDLERS ---
  const handleNewProduct = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteProduct = (id) => {
    if (window.confirm("Tem certeza que deseja excluir este produto?")) {
      deleteMutation.mutate(id);
    }
  };

  // --- FILTRO ---
  const filtered = Produtos.filter(
    (p) =>
      p.ds_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nu_ddm?.toString().includes(searchTerm)
  );

  const formatPrice = (val) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  return (
    <>
      <Card className="rounded-[1.5rem] md:rounded-[2rem] border-none shadow-xl shadow-gray-200/50 overflow-hidden bg-white">

        {/* Header Responsivo */}
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6 p-6 md:p-8 border-b border-gray-100">
          <div>
            <CardTitle className="font-black uppercase text-sm flex items-center gap-3 tracking-widest text-gray-900">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-orange-600" />
              </div>
              Inventário de Peças
            </CardTitle>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-2 ml-14 hidden md:block">
              Gerenciamento total do catálogo
            </p>
          </div>

          <Button
            onClick={handleNewProduct}
            className="w-full md:w-auto bg-gray-900 hover:bg-orange-600 text-white font-black uppercase text-[10px] tracking-widest h-12 px-6 rounded-xl shadow-lg transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4 mr-2" /> Novo Produto
          </Button>
        </CardHeader>

        <CardContent className="p-4 md:p-8">
          {/* Barra de Busca */}
          <div className="relative mb-6 md:mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome, código DDM ou referência..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 md:h-14 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-medium text-sm"
            />
          </div>

          {isLoading ? (
             <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-4" />
                <p className="text-xs font-bold uppercase text-gray-400 tracking-widest">Carregando Inventário...</p>
             </div>
          ) : filtered.length === 0 ? (
             <div className="text-center py-20 text-gray-400 font-medium">Nenhum produto encontrado.</div>
          ) : (
            <>
              {/* --- VIEW MOBILE (Cards) --- */}
              <div className="block md:hidden space-y-4">
                {filtered.map((p) => (
                  <div key={p.id_produto} className="border border-gray-100 rounded-2xl p-5 bg-white shadow-sm flex flex-col gap-4">

                    {/* Topo do Card Mobile */}
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-[10px] font-black uppercase">DDM: {p.nu_ddm}</span>
                                {p.st_ativo === "S" ? (
                                    <Badge className="bg-green-500 text-[9px] font-bold h-5 px-1.5">ON</Badge>
                                ) : (
                                    <Badge variant="secondary" className="text-[9px] font-bold h-5 px-1.5">OFF</Badge>
                                )}
                            </div>
                            <h3 className="font-black text-gray-900 text-sm uppercase leading-tight line-clamp-2">{p.ds_nome}</h3>
                            {p.nu_referencia && <p className="text-[10px] text-gray-400 mt-1">Ref: {p.nu_referencia}</p>}
                        </div>
                    </div>

                    {/* Dados e Preço */}
                    <div className="flex justify-between items-end border-t border-gray-50 pt-3">
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Preço Venda</p>
                            <p className="text-lg font-black text-gray-900">{formatPrice(p.nu_preco_venda_atual)}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Estoque</p>
                            <Badge variant="outline" className={`border-0 ${p.nu_estoque_atual > 5 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"} font-bold`}>
                                {p.nu_estoque_atual} UN
                            </Badge>
                        </div>
                    </div>

                    {/* Ações Mobile (Botões Grandes) */}
                    <div className="grid grid-cols-2 gap-3 mt-1">
                        <Button
                            variant="outline"
                            className="h-10 border-gray-200 text-gray-600 font-bold uppercase text-[10px] tracking-widest hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200"
                            onClick={() => handleEditProduct(p)}
                        >
                            <Pencil className="w-3 h-3 mr-2" /> Editar
                        </Button>
                        <Button
                            variant="outline"
                            className="h-10 border-gray-200 text-red-500 font-bold uppercase text-[10px] tracking-widest hover:bg-red-50 hover:border-red-200"
                            onClick={() => handleDeleteProduct(p.id_produto)}
                        >
                            <Trash2 className="w-3 h-3 mr-2" /> Excluir
                        </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* --- VIEW DESKTOP (Tabela) --- */}
              <div className="hidden md:block rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                <Table>
                  <TableHeader className="bg-gray-50/80">
                    <TableRow>
                      <TableHead className="font-black text-gray-400 uppercase text-[9px] tracking-widest py-6">Produto / DDM</TableHead>
                      <TableHead className="font-black text-gray-400 uppercase text-[9px] tracking-widest">Preço Venda</TableHead>
                      <TableHead className="font-black text-gray-400 uppercase text-[9px] tracking-widest">Estoque</TableHead>
                      <TableHead className="font-black text-gray-400 uppercase text-[9px] tracking-widest">Status</TableHead>
                      <TableHead className="text-right font-black text-gray-400 uppercase text-[9px] tracking-widest pr-6">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((p) => (
                      <TableRow key={p.id_produto} className="hover:bg-gray-50/80 transition-colors group border-b border-gray-50 last:border-0">
                        <TableCell className="py-4">
                          <p className="font-black text-gray-900 text-xs uppercase tracking-tight">{p.ds_nome}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-[9px] font-mono font-bold text-gray-500">DDM: {p.nu_ddm}</span>
                            {p.nu_referencia && <span className="text-[9px] text-gray-400 font-medium">Ref: {p.nu_referencia}</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-gray-700 text-sm">{formatPrice(p.nu_preco_venda_atual)}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`border-0 ${p.nu_estoque_atual > 5 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"} font-bold`}>
                            {p.nu_estoque_atual} UN
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {p.st_ativo === "S" ? (
                            <Badge className="bg-green-500 hover:bg-green-600 text-white font-bold text-[9px] uppercase tracking-wider">Ativo</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-gray-400 font-bold text-[9px] uppercase tracking-wider">Inativo</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right pr-4">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-white border border-gray-200 hover:border-orange-300 hover:text-orange-600 shadow-sm" onClick={() => handleEditProduct(p)}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-white border border-gray-200 hover:border-red-300 hover:text-red-600 shadow-sm" onClick={() => handleDeleteProduct(p.id_produto)}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* --- MODAL DO FORMULÁRIO --- */}
      {isFormOpen && (
        <ProductForm
          productToEdit={editingProduct}
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </>
  );
}