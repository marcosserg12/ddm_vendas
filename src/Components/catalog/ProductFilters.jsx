import React from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { __ddmDatabase } from '../../api/MysqlServer.js';
import { useQuery } from '@tanstack/react-query';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "../ui/accordion";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "../ui/sheet";

function FilterContent({
    filters,
    onFilterChange,
    onClearFilters,
    data
}) {
    const hasActiveFilters = filters.id_marca || filters.id_serie || filters.id_modelo || filters.id_categoria;

    return (
        <div className="space-y-6">
            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    className="w-full justify-start text-orange-600 hover:text-orange-700 hover:bg-orange-50 font-black uppercase text-[10px] tracking-widest"
                    onClick={onClearFilters}
                >
                    <X className="w-3 h-3 mr-2" />
                    Limpar Filtros
                </Button>
            )}

            <Accordion type="multiple" defaultValue={['categoria', 'marca']} className="w-full">
                {/* Categoria */}
                <AccordionItem value="categoria" className="border-b-2">
                    <AccordionTrigger className="text-[11px] font-black uppercase tracking-tight">Categoria</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-3 pt-2">
                            {data.categorias.map((cat) => (
                                <div key={cat.id_categoria} className="flex items-center space-x-3 group">
                                    <Checkbox
                                        id={`cat-${cat.id_categoria}`}
                                        checked={filters.id_categoria === cat.id_categoria}
                                        onCheckedChange={(checked) =>
                                            onFilterChange('id_categoria', checked ? cat.id_categoria : null)
                                        }
                                        className="border-2 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                                    />
                                    <Label htmlFor={`cat-${cat.id_categoria}`} className="text-xs font-bold text-gray-600 cursor-pointer group-hover:text-orange-600 transition-colors uppercase">
                                        {cat.ds_categoria}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Marca */}
                <AccordionItem value="marca" className="border-b-2">
                    <AccordionTrigger className="text-[11px] font-black uppercase tracking-tight">Marca</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-3 pt-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                            {data.marcas.map((marca) => (
                                <div key={marca.id_marca} className="flex items-center space-x-3 group">
                                    <Checkbox
                                        id={`marca-${marca.id_marca}`}
                                        checked={filters.id_marca === marca.id_marca}
                                        onCheckedChange={(checked) => {
                                            onFilterChange('id_marca', checked ? marca.id_marca : null);
                                            onFilterChange('id_serie', null);
                                            onFilterChange('id_modelo', null);
                                        }}
                                        className="border-2 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                                    />
                                    <Label htmlFor={`marca-${marca.id_marca}`} className="text-xs font-bold text-gray-600 cursor-pointer group-hover:text-orange-600 uppercase">
                                        {marca.ds_marca}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Série - Dependente da Marca */}
                <AccordionItem value="serie" disabled={!filters.id_marca} className="border-b-2">
                    <AccordionTrigger className={`text-[11px] font-black uppercase tracking-tight ${!filters.id_marca ? 'opacity-30' : ''}`}>
                        Série
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-3 pt-2">
                            {data.series
                                .filter(s => s.id_marca === filters.id_marca)
                                .map((serie) => (
                                    <div key={serie.id_serie} className="flex items-center space-x-3 group">
                                        <Checkbox
                                            id={`serie-${serie.id_serie}`}
                                            checked={filters.id_serie === serie.id_serie}
                                            onCheckedChange={(checked) => {
                                                onFilterChange('id_serie', checked ? serie.id_serie : null);
                                                onFilterChange('id_modelo', null);
                                            }}
                                            className="border-2 data-[state=checked]:bg-orange-500"
                                        />
                                        <Label htmlFor={`serie-${serie.id_serie}`} className="text-xs font-bold text-gray-600 cursor-pointer uppercase">
                                            {serie.ds_serie}
                                        </Label>
                                    </div>
                                ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Modelo - Dependente da Série */}
                <AccordionItem value="modelo" disabled={!filters.id_serie} className="border-b-0">
                    <AccordionTrigger className={`text-[11px] font-black uppercase tracking-tight ${!filters.id_serie ? 'opacity-30' : ''}`}>
                        Modelo
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-3 pt-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                            {data.modelos
                                .filter(m => m.id_serie === filters.id_serie)
                                .map((mod) => (
                                    <div key={mod.id_modelo} className="flex items-center space-x-3 group">
                                        <Checkbox
                                            id={`mod-${mod.id_modelo}`}
                                            checked={filters.id_modelo === mod.id_modelo}
                                            onCheckedChange={(checked) =>
                                                onFilterChange('id_modelo', checked ? mod.id_modelo : null)
                                            }
                                            className="border-2 data-[state=checked]:bg-orange-500"
                                        />
                                        <Label htmlFor={`mod-${mod.id_modelo}`} className="text-xs font-bold text-gray-600 cursor-pointer uppercase">
                                            {mod.ds_modelo}
                                        </Label>
                                    </div>
                                ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}

export default function ProductFilters({ filters, onFilterChange, onClearFilters }) {
    // Sincronizado com os nomes das entidades em plural no MysqlServer.js
    const { data: categorias = [] } = useQuery({ queryKey: ['TodasCategorias'], queryFn: () => __ddmDatabase.entities.Categoria.list() });
    const { data: marcas = [] } = useQuery({ queryKey: ['TodasMarcas'], queryFn: () => __ddmDatabase.entities.Marca.list() });
    const { data: series = [] } = useQuery({ queryKey: ['TodasSeries'], queryFn: () => __ddmDatabase.entities.Series.list() });
    const { data: modelos = [] } = useQuery({ queryKey: ['TodosModelos'], queryFn: () => __ddmDatabase.entities.Modelos.list() });

    const combinedData = { categorias, marcas, series, modelos };

    return (
        <>
            {/* Desktop Side Bar */}
            <div className="hidden lg:block bg-white rounded-2xl shadow-sm border-2 border-gray-100 p-6 h-fit sticky top-24">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b-2 border-gray-50">
                    <Filter className="w-4 h-4 text-orange-500" />
                    <h3 className="font-black text-xs uppercase tracking-widest text-gray-900">Filtrar Peças</h3>
                </div>
                <FilterContent
                    filters={filters}
                    onFilterChange={onFilterChange}
                    onClearFilters={onClearFilters}
                    data={combinedData}
                />
            </div>

            {/* Mobile Sheet */}
            <div className="lg:hidden mb-4">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="w-full border-2 font-bold uppercase text-[10px] tracking-widest h-11">
                            <Filter className="w-4 h-4 mr-2 text-orange-500" />
                            Refinar Busca
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] sm:w-80 overflow-y-auto border-r-4 border-orange-500">
                        <SheetHeader className="border-b pb-4">
                            <SheetTitle className="flex items-center gap-2 font-black uppercase text-sm">
                                <Filter className="w-5 h-5 text-orange-500" />
                                Filtros
                            </SheetTitle>
                        </SheetHeader>
                        <div className="mt-6">
                            <FilterContent
                                filters={filters}
                                onFilterChange={onFilterChange}
                                onClearFilters={onClearFilters}
                                data={combinedData}
                            />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </>
    );
}