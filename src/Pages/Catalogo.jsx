import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom'; // IMPORTANTE
import { __ddmDatabase } from '../api/MysqlServer.js';
import { useQuery } from '@tanstack/react-query';
import { Search, Grid, List, SlidersHorizontal, Package, Loader2, Filter } from 'lucide-react';
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
    // Usar o hook do React Router para escutar mudanças na URL
    const [searchParams, setSearchParams] = useSearchParams();

    const [filters, setFilters] = useState({
        id_categoria: [],
        id_marca: [],
        id_serie: [],
        id_modelo: []
    });

    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('ds_nome');
    const [viewMode, setViewMode] = useState('grid');

    const sortLabels = {
        'ds_nome': 'Nome (A-Z)',
        'nu_ddm': 'Código DDM',
        'preco_asc': 'Menor Preço',
        'preco_desc': 'Maior Preço'
    };

    // --- SINCRONIZAR URL COM ESTADO DE FILTROS ---
    useEffect(() => {
        const catId = searchParams.get('id_categoria');
        const marcaId = searchParams.get('id_marca');

        setFilters(prev => ({
            ...prev,
            // Converte para array de números se existir, senão array vazio
            id_categoria: catId ? [Number(catId)] : [],
            id_marca: marcaId ? [Number(marcaId)] : [],
            // Mantém os outros filtros se quiser, ou reseta. Aqui mantemos resetados ao trocar URL principal.
        }));
    }, [searchParams]);

    // --- BUSCAR DADOS ---
    const { data: products = [], isLoading } = useQuery({
        queryKey: ['products'],
        queryFn: () => __ddmDatabase.entities.Produtos.list()
    });

    const { data: categorias = [] } = useQuery({ queryKey: ['aux', 'categoria'], queryFn: () => __ddmDatabase.entities.Auxiliary.getList('categoria') });
    const { data: marcas = [] } = useQuery({ queryKey: ['aux', 'marca'], queryFn: () => __ddmDatabase.entities.Auxiliary.getList('marca') });
    const { data: series = [] } = useQuery({ queryKey: ['aux', 'series'], queryFn: () => __ddmDatabase.entities.Auxiliary.getList('series') });
    const { data: modelos = [] } = useQuery({ queryKey: ['aux', 'modelos'], queryFn: () => __ddmDatabase.entities.Auxiliary.getList('modelos') });

    // --- LÓGICA DE FILTRAGEM ---
    const filteredProducts = products.filter(product => {
        // 1. Filtro Categoria
        if (filters.id_categoria.length > 0) {
            // Conversão segura para String para comparar
            const catMatch = filters.id_categoria.some(id => String(id) === String(product.id_categoria_produto));
            if (!catMatch) return false;
        }

        // Função auxiliar para verificar IDs em strings (ex: "1,2,3")
        const checkCompatibility = (productIdsString, filterIdsArray) => {
            if (!productIdsString) return false;
            const productIds = String(productIdsString).split(',').map(s => s.trim()); // Array de Strings
            // Verifica se algum ID do filtro (convertido pra string) está na lista do produto
            return filterIdsArray.some(filterId => productIds.includes(String(filterId)));
        };

        if (filters.id_marca.length > 0 && !checkCompatibility(product.marcas_ids, filters.id_marca)) return false;
        if (filters.id_serie.length > 0 && !checkCompatibility(product.series_ids, filters.id_serie)) return false;
        if (filters.id_modelo.length > 0 && !checkCompatibility(product.modelos_ids, filters.id_modelo)) return false;

        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            return (
                String(product.ds_nome || '').toLowerCase().includes(search) ||
                String(product.nu_ddm || '').toLowerCase().includes(search) ||
                String(product.marcas_ids || '').includes(search) ||
                String(product.id_produto) === search
            );
        }
        return true;
    });

    // --- ORDENAÇÃO ---
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortBy === 'ds_nome') return (a.ds_nome || '').localeCompare(b.ds_nome || '');
        if (sortBy === 'nu_ddm') return String(a.nu_ddm || '').localeCompare(String(b.nu_ddm || ''));
        if (sortBy === 'preco_asc') return parseFloat(a.nu_preco_venda_atual) - parseFloat(b.nu_preco_venda_atual);
        if (sortBy === 'preco_desc') return parseFloat(b.nu_preco_venda_atual) - parseFloat(a.nu_preco_venda_atual);
        return 0;
    });

    const handleFilterChange = (filterType, newArrayValues) => {
        setFilters(prev => ({ ...prev, [filterType]: newArrayValues }));

        // Opcional: Atualizar a URL quando o usuário filtrar manualmente (para poder compartilhar o link)
        // Se for categoria ou marca unica, podemos setar no URL, se for multiplo, url fica complexa.
        // Por enquanto, deixamos apenas o estado local gerenciar para não complicar a URL.
    };

    const handleClearFilters = () => {
        setFilters({ id_categoria: [], id_marca: [], id_serie: [], id_modelo: [] });
        setSearchTerm('');
        setSearchParams({}); // Limpa a URL também
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans pb-24">

            <section className="relative py-12 md:py-24 bg-gray-950 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800 via-gray-950 to-gray-950 opacity-40 pointer-events-none" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light pointer-events-none" />

                <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-6 backdrop-blur-md shadow-lg">
                        <Package className="w-3.5 h-3.5 text-orange-500" />
                        <span className="text-orange-400 text-[10px] font-black uppercase tracking-[0.2em]">Linha Completa</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-white mb-4 uppercase italic tracking-tighter leading-none">
                        Catálogo <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Técnico</span>
                    </h1>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 md:px-6 -mt-8 relative z-20">
                <div className="flex flex-col lg:flex-row gap-6 items-start">

                    {/* Filtros Lateral (Desktop) */}
                    <aside className="hidden lg:block w-72 flex-shrink-0 sticky top-24">
                        <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 p-6 border border-gray-100">
                            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-50">
                                <Filter className="w-4 h-4 text-orange-500" />
                                <h3 className="font-black text-gray-900 uppercase text-xs tracking-widest">Filtrar Por</h3>
                            </div>

                            <ProductFilters
                                filters={filters}
                                categorias={categorias}
                                marcas={marcas}
                                series={series}
                                modelos={modelos}
                                onFilterChange={handleFilterChange}
                                onClearFilters={handleClearFilters}
                            />
                        </div>
                    </aside>

                    {/* Área Principal */}
                    <main className="flex-1 w-full">

                        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-4 border border-gray-100 mb-6 flex flex-col gap-4">

                            {/* Filtro Mobile */}
                            <div className="lg:hidden">
                                <ProductFilters
                                    filters={filters}
                                    categorias={categorias}
                                    marcas={marcas}
                                    series={series}
                                    modelos={modelos}
                                    onFilterChange={handleFilterChange}
                                    onClearFilters={handleClearFilters}
                                />
                            </div>

                            <div className="flex flex-col md:flex-row gap-4 items-center">
                                {/* Barra de Busca */}
                                <div className="relative flex-1 w-full group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Search className="h-4 w-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                                    </div>
                                    <Input
                                        placeholder="Buscar..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-11 h-11 rounded-xl border-gray-100 bg-gray-50 focus:bg-white text-sm"
                                    />
                                </div>

                                {/* Linha de Ordenação e View Mode */}
                                <div className="flex gap-2 w-full md:w-auto">
                                    <div className="flex-1 md:w-48">
                                        <Select value={sortBy} onValueChange={setSortBy}>
                                            <SelectTrigger className="w-full h-11 rounded-xl border-gray-100 bg-gray-50 font-black uppercase text-[10px] tracking-widest text-gray-600">
                                                <div className="flex items-center gap-2 overflow-hidden w-full">
                                                    <SlidersHorizontal className="w-3 h-3 text-orange-500 flex-shrink-0" />
                                                    <span className="truncate">{sortLabels[sortBy]}</span>
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="ds_nome">Nome (A-Z)</SelectItem>
                                                <SelectItem value="nu_ddm">Código DDM</SelectItem>
                                                <SelectItem value="preco_asc">Menor Preço</SelectItem>
                                                <SelectItem value="preco_desc">Maior Preço</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Botões de View */}
                                    <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100 shrink-0">
                                        <Button variant="ghost" size="icon" className={`h-9 w-9 rounded-lg ${viewMode === 'grid' ? 'bg-white shadow-sm text-orange-500' : 'text-gray-400'}`} onClick={() => setViewMode('grid')}><Grid className="w-4 h-4" /></Button>
                                        <Button variant="ghost" size="icon" className={`h-9 w-9 rounded-lg ${viewMode === 'list' ? 'bg-white shadow-sm text-orange-500' : 'text-gray-400'}`} onClick={() => setViewMode('list')}><List className="w-4 h-4" /></Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* LISTA DE PRODUTOS */}
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2rem] border border-dashed border-gray-200">
                                <Loader2 className="w-12 h-12 animate-spin text-orange-500 mb-4" />
                                <p className="font-black uppercase text-[10px] tracking-widest text-gray-400 animate-pulse">Carregando...</p>
                            </div>
                        ) : sortedProducts.length > 0 ? (
                            <div className={`grid gap-3 md:gap-6 ${
                                viewMode === 'grid'
                                    ? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
                                    : 'grid-cols-1'
                            }`}>
                                {sortedProducts.map((product) => (
                                    <ProductCard key={product.id_produto} product={product} viewMode={viewMode} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-[2rem] border border-dashed border-gray-200 py-32 text-center shadow-sm">
                                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-black text-gray-900 uppercase italic mb-2">Nada encontrado</h3>
                                <Button onClick={handleClearFilters} className="bg-gray-900 text-white font-black uppercase text-[10px] h-10 px-6 rounded-xl">
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