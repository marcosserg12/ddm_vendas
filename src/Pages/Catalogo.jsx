import React, { useState } from 'react';
import { __ddmDatabase } from '../api/MysqlServer.js';
import { useQuery } from '@tanstack/react-query';
import { Search, Grid, List, SlidersHorizontal, Package, Loader2 } from 'lucide-react';
import { Input } from '../Components/ui/input';
import { Button } from '../Components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../Components/ui/select";
import ProductFilters from '../Components/catalog/ProductFilters';
import ProductCard from '../Components/catalog/ProductCard';

export default function Catalogo() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Agora capturamos IDs numéricos conforme o banco
    const initialCategoria = urlParams.get('id_categoria');
    const initialMarca = urlParams.get('id_marca');

    const [filters, setFilters] = useState({
        id_categoria: initialCategoria ? parseInt(initialCategoria) : null,
        id_marca: initialMarca ? parseInt(initialMarca) : null,
        id_serie: null,
        id_modelo: null
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('ds_nome');
    const [viewMode, setViewMode] = useState('grid');

    // Busca de produtos sincronizada com o backend
    const { data: products = [], isLoading } = useQuery({
        queryKey: ['products'],
        queryFn: () => __ddmDatabase.entities.Produtos.list()
    });

    // Lógica de Filtragem no Frontend (Respeitando os IDs do Banco)
    const filteredProducts = products.filter(product => {
        if (filters.id_categoria && product.id_categoria !== filters.id_categoria) return false;
        if (filters.id_marca && product.id_marca !== filters.id_marca) return false;
        if (filters.id_serie && product.id_serie !== filters.id_serie) return false;
        if (filters.id_modelo && product.id_modelo !== filters.id_modelo) return false;

        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            return (
                product.ds_nome?.toLowerCase().includes(search) ||
                product.nu_ddm?.toLowerCase().includes(search) ||
                product.ds_marca?.toLowerCase().includes(search)
            );
        }
        return true;
    });

    // Ordenação Industrial
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortBy === 'ds_nome') return (a.ds_nome || '').localeCompare(b.ds_nome || '');
        if (sortBy === 'nu_ddm') return (a.nu_ddm || '').localeCompare(b.nu_ddm || '');
        if (sortBy === 'preco_asc') return a.nu_preco_venda_atual - b.nu_preco_venda_atual;
        if (sortBy === 'preco_desc') return b.nu_preco_venda_atual - a.nu_preco_venda_atual;
        return 0;
    });

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({ ...prev, [filterType]: value }));
    };

    const handleClearFilters = () => {
        setFilters({ id_categoria: null, id_marca: null, id_serie: null, id_modelo: null });
        setSearchTerm('');
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Header Dark DDM */}
            <section className="bg-gray-900 py-16 border-b-4 border-orange-600">
                <div className="max-w-7xl mx-auto px-6">
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-4 uppercase tracking-tighter italic">
                        Catálogo <span className="text-orange-500">Técnico</span>
                    </h1>
                    <p className="text-gray-400 font-bold uppercase text-xs tracking-[0.3em] max-w-xl">
                        Componentes de alta performance para compactação e isolamento de vibração.
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-6 py-10">
                <div className="flex flex-col lg:flex-row gap-10">
                    
                    {/* Filtros Lateral */}
                    <aside className="lg:w-80 flex-shrink-0">
                        <ProductFilters
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            onClearFilters={handleClearFilters}
                        />
                    </aside>

                    {/* Área de Produtos */}
                    <main className="flex-1">
                        {/* Toolbar de Busca e Ordenação */}
                        <div className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 p-6 mb-8 flex flex-col md:flex-row gap-4 items-center">
                            <div className="relative flex-1 w-full">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Buscar por descrição, código DDM ou marca..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-12 h-12 border-gray-100 bg-gray-50 focus-visible:ring-orange-500 font-bold text-xs"
                                />
                            </div>

                            <div className="flex gap-3 w-full md:w-auto">
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="w-full md:w-56 h-12 border-2 border-gray-100 font-black uppercase text-[10px] tracking-widest">
                                        <SlidersHorizontal className="w-3 h-3 mr-2 text-orange-500" />
                                        <SelectValue placeholder="Ordenar" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ds_nome">Nome (A-Z)</SelectItem>
                                        <SelectItem value="nu_ddm">Código DDM</SelectItem>
                                        <SelectItem value="preco_asc">Menor Preço</SelectItem>
                                        <SelectItem value="preco_desc">Maior Preço</SelectItem>
                                    </SelectContent>
                                </Select>

                                <div className="hidden sm:flex border-2 border-gray-100 rounded-xl overflow-hidden">
                                    <Button
                                        variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                        size="icon"
                                        className="rounded-none h-12 w-12"
                                        onClick={() => setViewMode('grid')}
                                    >
                                        <Grid className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                        size="icon"
                                        className="rounded-none h-12 w-12"
                                        onClick={() => setViewMode('list')}
                                    >
                                        <List className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Estado de Carregamento */}
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                <Loader2 className="w-12 h-12 animate-spin text-orange-500 mb-4" />
                                <p className="font-black uppercase text-[10px] tracking-widest">Acessando Banco de Dados DDM...</p>
                            </div>
                        ) : sortedProducts.length > 0 ? (
                            <div className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                                {sortedProducts.map((product) => (
                                    <ProductCard key={product.id_produto} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-3xl border-2 border-dashed border-gray-200 py-20 text-center">
                                <Package className="w-20 h-20 text-gray-100 mx-auto mb-6" />
                                <h3 className="text-xl font-black text-gray-900 uppercase italic mb-2">Sem resultados</h3>
                                <p className="text-gray-400 text-xs font-bold uppercase mb-8">Não encontramos peças para esses filtros.</p>
                                <Button variant="outline" onClick={handleClearFilters} className="border-2 font-black uppercase text-[10px] tracking-widest">
                                    Limpar Filtros
                                </Button>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}