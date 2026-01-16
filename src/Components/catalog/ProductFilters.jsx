import React from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
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
    SheetClose
} from "../ui/sheet";

function FilterContent({
    filters,
    categorias = [],
    marcas = [],
    series = [],
    modelos = [],
    onFilterChange,
    onClearFilters
}) {
    const hasActiveFilters =
        filters.id_marca?.length > 0 ||
        filters.id_categoria?.length > 0 ||
        filters.id_serie?.length > 0 ||
        filters.id_modelo?.length > 0;

    const toggleFilter = (key, id, checked) => {
        const currentList = filters[key] || [];
        let newList;
        if (checked) {
            newList = [...currentList, id];
        } else {
            newList = currentList.filter(item => item !== id);
        }
        onFilterChange(key, newList);
    };

    // Helper seguro para checar se está selecionado (String vs Number safe)
    const isChecked = (list, id) => {
        if (!list) return false;
        return list.some(item => String(item) === String(id));
    };

    // Filtragem de dependências
    const filteredSeries = React.useMemo(() => {
        if (!filters.id_marca || filters.id_marca.length === 0) return [];
        return series.filter(s => isChecked(filters.id_marca, s.id_marca));
    }, [series, filters.id_marca]);

    const filteredModels = React.useMemo(() => {
        if (!filters.id_marca || filters.id_marca.length === 0) return [];
        return modelos.filter(m => {
            const matchMarca = isChecked(filters.id_marca, m.id_marca);
            if (!matchMarca) return false;
            if (filters.id_serie && filters.id_serie.length > 0) {
                if (!m.id_serie || !isChecked(filters.id_serie, m.id_serie)) {
                    return false;
                }
            }
            return true;
        });
    }, [modelos, filters.id_marca, filters.id_serie]);


    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 font-black uppercase text-[10px] tracking-widest h-8 px-0"
                    onClick={onClearFilters}
                >
                    <X className="w-3 h-3 mr-2" />
                    Limpar Filtros
                </Button>
            )}

            <Accordion type="multiple" defaultValue={['categoria', 'marca', 'modelo', 'serie']} className="w-full">

                {/* CATEGORIA */}
                <AccordionItem value="categoria" className="border-b border-gray-100 last:border-0">
                    <AccordionTrigger className="text-[11px] font-black uppercase tracking-widest text-gray-700 hover:text-orange-600 hover:no-underline py-4">
                        Categoria
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-3 pt-2 pb-4">
                            {categorias.map((cat) => (
                                <div key={cat.id_categoria} className="flex items-center space-x-3 group">
                                    <Checkbox
                                        id={`cat-${cat.id_categoria}`}
                                        // CORREÇÃO: Usando o helper seguro
                                        checked={isChecked(filters.id_categoria, cat.id_categoria)}
                                        onCheckedChange={(checked) => toggleFilter('id_categoria', cat.id_categoria, checked)}
                                        className="border-gray-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                                    />
                                    <Label htmlFor={`cat-${cat.id_categoria}`} className="text-xs font-bold text-gray-500 cursor-pointer group-hover:text-orange-600 uppercase">
                                        {cat.ds_categoria}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* MARCA */}
                <AccordionItem value="marca" className="border-b border-gray-100 last:border-0">
                    <AccordionTrigger className="text-[11px] font-black uppercase tracking-widest text-gray-700 hover:text-orange-600 hover:no-underline py-4">
                        Marca
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-3 pt-2 pb-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                            {marcas.map((marca) => (
                                <div key={marca.id_marca} className="flex items-center space-x-3 group">
                                    <Checkbox
                                        id={`marca-${marca.id_marca}`}
                                        checked={isChecked(filters.id_marca, marca.id_marca)}
                                        onCheckedChange={(checked) => toggleFilter('id_marca', marca.id_marca, checked)}
                                        className="border-gray-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                                    />
                                    <Label htmlFor={`marca-${marca.id_marca}`} className="text-xs font-bold text-gray-500 cursor-pointer group-hover:text-orange-600 uppercase">
                                        {marca.ds_marca}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* SÉRIE */}
                {filters.id_marca?.length > 0 && filteredSeries.length > 0 && (
                    <AccordionItem value="serie" className="border-b border-gray-100 last:border-0">
                        <AccordionTrigger className="text-[11px] font-black uppercase tracking-widest text-gray-700 hover:text-orange-600 hover:no-underline py-4">
                            Série
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-3 pt-2 pb-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                                {filteredSeries.map((serie) => (
                                    <div key={serie.id_serie} className="flex items-center space-x-3 group">
                                        <Checkbox
                                            id={`serie-${serie.id_serie}`}
                                            checked={isChecked(filters.id_serie, serie.id_serie)}
                                            onCheckedChange={(checked) => toggleFilter('id_serie', serie.id_serie, checked)}
                                            className="border-gray-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                                        />
                                        <Label htmlFor={`serie-${serie.id_serie}`} className="text-xs font-bold text-gray-500 cursor-pointer group-hover:text-orange-600 uppercase">
                                            {serie.ds_serie}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                )}

                {/* MODELO */}
                <AccordionItem value="modelo" className="border-b border-gray-100 last:border-0">
                    <AccordionTrigger className="text-[11px] font-black uppercase tracking-widest text-gray-700 hover:text-orange-600 hover:no-underline py-4">
                        Modelo
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-3 pt-2 pb-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                            {(!filters.id_marca || filters.id_marca.length === 0) ? (
                                <p className="text-[10px] text-gray-400 italic">Selecione uma marca para ver os modelos.</p>
                            ) : filteredModels.length === 0 ? (
                                <p className="text-[10px] text-gray-400 italic">Nenhum modelo encontrado para os filtros atuais.</p>
                            ) : (
                                filteredModels.map((mod) => (
                                    <div key={mod.id_modelo} className="flex items-center space-x-3 group">
                                        <Checkbox
                                            id={`mod-${mod.id_modelo}`}
                                            checked={isChecked(filters.id_modelo, mod.id_modelo)}
                                            onCheckedChange={(checked) => toggleFilter('id_modelo', mod.id_modelo, checked)}
                                            className="border-gray-300 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                                        />
                                        <Label htmlFor={`mod-${mod.id_modelo}`} className="text-xs font-bold text-gray-500 cursor-pointer group-hover:text-orange-600 uppercase">
                                            {mod.ds_modelo}
                                        </Label>
                                    </div>
                                ))
                            )}
                        </div>
                    </AccordionContent>
                </AccordionItem>

            </Accordion>
        </div>
    );
}

export default function ProductFilters(props) {
    // ... (o restante do componente ProductFilters exportado permanece igual)
    // Apenas copiei o FilterContent acima que tem a lógica
    return (
        <>
            <div className="hidden lg:block">
                <FilterContent {...props} />
            </div>
            <div className="lg:hidden w-full mb-6">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="w-full bg-white border border-gray-200 text-gray-700 font-black uppercase text-[10px] tracking-widest h-12 shadow-sm flex items-center justify-center gap-2">
                            <Filter className="w-4 h-4 text-orange-500" />
                            Filtrar Produtos
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] border-r border-gray-100 p-6 overflow-y-auto z-[9999]">
                        <SheetHeader className="border-b border-gray-100 pb-6 mb-6">
                            <SheetTitle className="flex items-center gap-3 font-black uppercase text-sm tracking-widest text-gray-900">
                                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <Filter className="w-4 h-4 text-orange-600" />
                                </div>
                                Filtros
                            </SheetTitle>
                        </SheetHeader>
                        <FilterContent {...props} />
                        <div className="mt-6 sticky bottom-0 bg-white pt-4 border-t border-gray-100">
                            <SheetClose asChild>
                                <Button className="w-full bg-gray-900 text-white font-bold uppercase text-xs h-10">
                                    Ver Resultados
                                </Button>
                            </SheetClose>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </>
    );
}