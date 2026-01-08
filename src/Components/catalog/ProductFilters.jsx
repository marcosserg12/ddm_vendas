import React from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

// Exportando os dados para poder usar na página de catálogo se precisar
export const FILTER_DATA = {
    marcas: [
        'Wacker', 'Weber', 'Dynapac/Vipart', 'Claridon', 'Hoffmann',
        'Mikasa/Multiquip', 'Petrotec', 'Bomaq', 'Komatsu',
        'Ingersoll-Rand', 'Stone', 'Peças Motor', 'Bombas', 'Masalta'
    ],
    series: {
        'Wacker': ['BS', 'DPU', 'VP', 'VPG', 'WP', 'R'],
        'Weber': ['CF', 'CR', 'MT', 'SRV'],
        'Dynapac/Vipart': ['CC', 'CP', 'LP', 'LT'],
        'Bomaq': ['BPR', 'BW', 'BVP'],
        'Mikasa/Multiquip': ['MVC', 'MVH', 'MTX'],
        'Komatsu': ['PC', 'WA'],
        'Ingersoll-Rand': ['DD', 'SD'],
        'Stone': ['SG', 'SVR'],
        'Masalta': ['MS', 'MR'],
    },
    modelos: {
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
    },
    categorias: [
        { id: 'sapatas', name: 'Sapatas para Compactadores' },
        { id: 'coxins_batentes', name: 'Coxins e Batentes' },
        { id: 'protecoes_sanfonadas', name: 'Proteções Sanfonadas' },
        { id: 'molas', name: 'Molas' },
        { id: 'outros', name: 'Outros' }
    ]
};

function FilterContent({
    filters,
    onFilterChange,
    onClearFilters,
    availableSeries,
    availableModelos
}) {
    const hasActiveFilters = filters.marca || filters.serie || filters.modelo || filters.categoria;

    return (
        <div className="space-y-6">
            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    className="w-full justify-start text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                    onClick={onClearFilters}
                >
                    <X className="w-4 h-4 mr-2" />
                    Limpar Filtros
                </Button>
            )}

            <Accordion type="multiple" defaultValue={['categoria', 'marca', 'serie', 'modelo']} className="w-full">
                {/* Categoria */}
                <AccordionItem value="categoria">
                    <AccordionTrigger>
                        Categoria
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-3 pt-2">
                            {FILTER_DATA.categorias.map((cat) => (
                                <div key={cat.id} className="flex items-center space-x-3">
                                    <Checkbox
                                        id={`cat-${cat.id}`}
                                        checked={filters.categoria === cat.id}
                                        onCheckedChange={(checked) =>
                                            onFilterChange('categoria', checked ? cat.id : null)
                                        }
                                    />
                                    <Label
                                        htmlFor={`cat-${cat.id}`}
                                        className="text-sm text-gray-600 cursor-pointer hover:text-gray-900"
                                    >
                                        {cat.name}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Marca */}
                <AccordionItem value="marca">
                    <AccordionTrigger>
                        Marca
                        {filters.marca && <span className="ml-2 text-orange-500 text-xs">({filters.marca})</span>}
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-3 pt-2 max-h-64 overflow-y-auto">
                            {FILTER_DATA.marcas.map((marca) => (
                                <div key={marca} className="flex items-center space-x-3">
                                    <Checkbox
                                        id={`marca-${marca}`}
                                        checked={filters.marca === marca}
                                        onCheckedChange={(checked) => {
                                            onFilterChange('marca', checked ? marca : null);
                                            if (!checked) {
                                                onFilterChange('serie', null);
                                                onFilterChange('modelo', null);
                                            }
                                        }}
                                    />
                                    <Label
                                        htmlFor={`marca-${marca}`}
                                        className="text-sm text-gray-600 cursor-pointer hover:text-gray-900"
                                    >
                                        {marca}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Série */}
                <AccordionItem value="serie" disabled={!filters.marca}>
                    <AccordionTrigger className={!filters.marca ? 'text-gray-400' : ''}>
                        Série
                        {filters.serie && <span className="ml-2 text-orange-500 text-xs">({filters.serie})</span>}
                    </AccordionTrigger>
                    <AccordionContent>
                        {availableSeries.length > 0 ? (
                            <div className="space-y-3 pt-2">
                                {availableSeries.map((serie) => (
                                    <div key={serie} className="flex items-center space-x-3">
                                        <Checkbox
                                            id={`serie-${serie}`}
                                            checked={filters.serie === serie}
                                            onCheckedChange={(checked) => {
                                                onFilterChange('serie', checked ? serie : null);
                                                if (!checked) onFilterChange('modelo', null);
                                            }}
                                        />
                                        <Label
                                            htmlFor={`serie-${serie}`}
                                            className="text-sm text-gray-600 cursor-pointer hover:text-gray-900"
                                        >
                                            {serie}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 pt-2">Selecione uma marca primeiro</p>
                        )}
                    </AccordionContent>
                </AccordionItem>

                {/* Modelo/Número */}
                <AccordionItem value="modelo" disabled={!filters.serie}>
                    <AccordionTrigger className={!filters.serie ? 'text-gray-400' : ''}>
                        Número/Modelo
                        {filters.modelo && <span className="ml-2 text-orange-500 text-xs">({filters.modelo})</span>}
                    </AccordionTrigger>
                    <AccordionContent>
                        {availableModelos.length > 0 ? (
                            <div className="space-y-3 pt-2 max-h-64 overflow-y-auto">
                                {availableModelos.map((modelo) => (
                                    <div key={modelo} className="flex items-center space-x-3">
                                        <Checkbox
                                            id={`modelo-${modelo}`}
                                            checked={filters.modelo === modelo}
                                            onCheckedChange={(checked) =>
                                                onFilterChange('modelo', checked ? modelo : null)
                                            }
                                        />
                                        <Label
                                            htmlFor={`modelo-${modelo}`}
                                            className="text-sm text-gray-600 cursor-pointer hover:text-gray-900"
                                        >
                                            {modelo}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 pt-2">Selecione uma série primeiro</p>
                        )}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}

export default function ProductFilters({ filters, onFilterChange, onClearFilters }) {
    const availableSeries = filters.marca ? (FILTER_DATA.series[filters.marca] || []) : [];
    const availableModelos = filters.serie ? (FILTER_DATA.modelos[filters.serie] || []) : [];

    return (
        <>
            {/* Desktop Filters */}
            <div className="hidden lg:block bg-white rounded-xl shadow-sm border p-6 h-fit sticky top-24">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b">
                    <Filter className="w-5 h-5 text-orange-500" />
                    <h3 className="font-semibold text-gray-900">Filtros</h3>
                </div>
                <FilterContent
                    filters={filters}
                    onFilterChange={onFilterChange}
                    onClearFilters={onClearFilters}
                    availableSeries={availableSeries}
                    availableModelos={availableModelos}
                />
            </div>

            {/* Mobile Filters */}
            <div className="lg:hidden mb-4">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="w-full">
                            <Filter className="w-4 h-4 mr-2" />
                            Filtros
                            {(filters.marca || filters.categoria) && (
                                <span className="ml-2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                                    Ativos
                                </span>
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80 overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle className="flex items-center gap-2">
                                <Filter className="w-5 h-5 text-orange-500" />
                                Filtros
                            </SheetTitle>
                        </SheetHeader>
                        <div className="mt-6">
                            <FilterContent
                                filters={filters}
                                onFilterChange={onFilterChange}
                                onClearFilters={onClearFilters}
                                availableSeries={availableSeries}
                                availableModelos={availableModelos}
                            />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </>
    );
}