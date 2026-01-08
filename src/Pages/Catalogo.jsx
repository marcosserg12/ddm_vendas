import React, { useState } from 'react';
// CORREÇÃO: Caminho da API
import { base44 } from '../api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Search, Grid, List, SlidersHorizontal, Package, Loader2 } from 'lucide-react';

// CORREÇÃO: Caminhos dos componentes UI (Maiúscula em Components)
import { Input } from '../Components/ui/input';
import { Button } from '../Components/ui/button';

// import { Skeleton } from '@/components/ui/skeleton'; // Removido para não dar erro
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../Components/ui/select";

// CORREÇÃO: Caminhos dos componentes do Catálogo
import ProductFilters from '../Components/catalog/ProductFilters';
import ProductCard from '../Components/catalog/ProductCard';

export default function Catalogo() {
    const urlParams = new URLSearchParams(window.location.search);
    const initialCategoria = urlParams.get('categoria');
    const initialMarca = urlParams.get('marca');

    const [filters, setFilters] = useState({
        categoria: initialCategoria || null,
        marca: initialMarca || null,
        serie: null,
        modelo: null
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('nome');
    const [viewMode, setViewMode] = useState('grid');

    const { data: products, isLoading } = useQuery({
        queryKey: ['products'],
        queryFn: () => base44.entities.Product.list(), // .list() simples
        initialData: []
    });

    // Filter products
    const filteredProducts = products.filter(product => {
        // Category filter
        if (filters.categoria && product.categoria !== filters.categoria) return false;

        // Brand filter
        if (filters.marca && product.marca !== filters.marca) return false;

        // Serie filter
        if (filters.serie && product.serie !== filters.serie) return false;

        // Model filter
        if (filters.modelo) {
            if (!product.modelos_compativeis?.includes(filters.modelo)) return false;
        }

        // Search filter
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            const matchesSearch =
                product.nome?.toLowerCase().includes(search) ||
                product.num_ddm?.toLowerCase().includes(search) ||
                product.num_figura?.toLowerCase().includes(search) ||
                product.modelos_compativeis?.some(m => m.toLowerCase().includes(search));
            if (!matchesSearch) return false;
        }

        return true;
    });

    // Sort products
    const sortedProducts = [...filteredProducts].sort((a, b) => {
        switch (sortBy) {
            case 'nome':
                return (a.nome || '').localeCompare(b.nome || '');
            case 'num_ddm':
                return (a.num_ddm || '').localeCompare(b.num_ddm || '');
            case 'marca':
                return (a.marca || '').localeCompare(b.marca || '');
            case 'recente':
                // Proteção para data
                const dateA = a.created_date ? new Date(a.created_date) : new Date(0);
                const dateB = b.created_date ? new Date(b.created_date) : new Date(0);
                return dateB - dateA;
            default:
                return 0;
        }
    });

    const handleFilterChange = (filterType, value) => {
        setFilters(prev => ({
            ...prev,
            [filterType]: value
        }));
    };

    const handleClearFilters = () => {
        setFilters({
            categoria: null,
            marca: null,
            serie: null,
            modelo: null
        });
        setSearchTerm('');
    };

    const categoryTitles = {
        sapatas: 'Sapatas para Compactadores',
        coxins_batentes: 'Coxins e Batentes',
        protecoes_sanfonadas: 'Proteções Sanfonadas',
        molas: 'Molas',
        outros: 'Outros Produtos'
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header */}
            <section className="bg-gray-900 py-12">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        {filters.categoria ? categoryTitles[filters.categoria] : 'Catálogo de Produtos'}
                    </h1>
                    <p className="text-gray-400">
                        Encontre peças por marca, série e modelo do seu equipamento
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <aside className="lg:w-72 flex-shrink-0">
                        <ProductFilters
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            onClearFilters={handleClearFilters}
                        />
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1">
                        {/* Search and Sort Bar */}
                        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
                            <div className="flex flex-col md:flex-row gap-4">
                                {/* Search */}
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        placeholder="Buscar por nome, código DDM ou modelo..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 h-11"
                                    />
                                </div>

                                {/* Sort */}
                                <div className="flex gap-3">
                                    <Select value={sortBy} onValueChange={setSortBy}>
                                        <SelectTrigger className="w-44 h-11">
                                            <SlidersHorizontal className="w-4 h-4 mr-2" />
                                            <SelectValue placeholder="Ordenar por" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="nome">Nome (A-Z)</SelectItem>
                                            <SelectItem value="num_ddm">Código DDM</SelectItem>
                                            <SelectItem value="marca">Marca</SelectItem>
                                            <SelectItem value="recente">Mais Recentes</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* View Toggle */}
                                    <div className="hidden sm:flex border rounded-lg">
                                        <Button
                                            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                            size="icon"
                                            className="rounded-r-none"
                                            onClick={() => setViewMode('grid')}
                                        >
                                            <Grid className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                            size="icon"
                                            className="rounded-l-none"
                                            onClick={() => setViewMode('list')}
                                        >
                                            <List className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Active Filters */}
                        {(filters.marca || filters.serie || filters.modelo || filters.categoria) && (
                            <div className="flex flex-wrap gap-2 mb-6 pt-4 border-t">
                                <span className="text-sm text-gray-500">Filtros ativos:</span>
                                {filters.categoria && (
                                    <span className="bg-orange-100 text-orange-700 text-xs px-3 py-1 rounded-full font-medium">
                                        {categoryTitles[filters.categoria]}
                                    </span>
                                )}
                                {filters.marca && (
                                    <span className="bg-orange-100 text-orange-700 text-xs px-3 py-1 rounded-full font-medium">
                                        {filters.marca}
                                    </span>
                                )}
                                {filters.serie && (
                                    <span className="bg-orange-100 text-orange-700 text-xs px-3 py-1 rounded-full font-medium">
                                        Série: {filters.serie}
                                    </span>
                                )}
                                {filters.modelo && (
                                    <span className="bg-orange-100 text-orange-700 text-xs px-3 py-1 rounded-full font-medium">
                                        Modelo: {filters.modelo}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Results Count */}
                        <div className="mb-6">
                            <p className="text-gray-600">
                                <span className="font-semibold text-gray-900">{sortedProducts.length}</span> produtos encontrados
                            </p>
                        </div>

                        {/* Products Grid */}
                        {isLoading ? (
                            <div className="w-full h-64 flex flex-col items-center justify-center text-gray-500">
                                <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-4" />
                                <p>Carregando catálogo...</p>
                            </div>
                        ) : sortedProducts.length > 0 ? (
                            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                                {sortedProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
                                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Nenhum produto encontrado
                                </h3>
                                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                    Tente ajustar os filtros ou realizar uma nova busca.
                                    Se não encontrar o que procura, entre em contato conosco.
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={handleClearFilters}
                                >
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