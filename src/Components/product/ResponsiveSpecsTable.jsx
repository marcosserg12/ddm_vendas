import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
} from "../ui/table";

/**
 * MAPEAMENTO DE CAMPOS DDM
 * Estes nomes (keys) devem ser os aliases usados no seu SELECT do backend
 * para que tragam o TEXTO (ds_) e não apenas o ID.
 */
const SPEC_LABELS = {
    nu_ddm: 'Código DDM',
    nu_referencia: 'Referência Original',
    nu_sku: 'SKU / Part Number',
    ds_categoria: 'Categoria',
    ds_material: 'Material / Composto',
    ds_dureza: 'Dureza (Shore A)',
    ds_cor: 'Cor / Acabamento',
    ds_rosca: 'Tipo de Rosca',
    ds_porca: 'Porca Compatível',
    ds_parafuso: 'Parafuso Compatível',
    nu_diametro: 'Diâmetro (mm)',
    nu_diametro_interno: 'Diâmetro Interno (mm)',
    nu_diametro_maior: 'Diâmetro Maior (mm)',
    nu_diametro_menor: 'Diâmetro Menor (mm)',
    nu_altura: 'Altura (mm)',
    nu_largura: 'Largura (mm)',
    nu_comprimento: 'Comprimento (mm)',
    nu_peso: 'Peso Estimado (kg)',
};

export default function ResponsiveSpecsTable({ product }) {
    if (!product) return null;

    // Filtra para exibir apenas campos que possuem valor real no banco
    const specs = Object.entries(SPEC_LABELS)
        .map(([key, label]) => ({
            key,
            label,
            value: product[key]
        }))
        .filter(spec => 
            spec.value !== null && 
            spec.value !== undefined && 
            spec.value !== '' && 
            spec.value !== 0 &&
            spec.value !== '0' &&
            spec.value !== 'null'
        );

    if (specs.length === 0) {
        return (
            <div className="bg-gray-50 p-8 rounded-2xl border-2 border-dashed border-gray-200 text-center">
                <p className="text-gray-400 text-xs font-black uppercase tracking-widest leading-relaxed">
                    Especificações dimensionais detalhadas sob consulta <br/>
                    com nosso departamento de engenharia técnica.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-2 h-6 bg-orange-600 rounded-full shadow-sm shadow-orange-500/20" />
                <h3 className="font-black text-gray-900 uppercase text-xs tracking-[0.2em]">
                    Ficha Técnica do Produto
                </h3>
            </div>

            {/* Desktop: Tabela de Alta Precisão */}
            <div className="hidden md:block overflow-hidden rounded-2xl border-2 border-gray-100 shadow-sm">
                <Table>
                    <TableBody>
                        {specs.map((spec, idx) => (
                            <TableRow 
                                key={spec.key} 
                                className={`transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'} hover:bg-orange-50/30`}
                            >
                                <TableCell className="font-black text-gray-400 w-1/3 border-r border-gray-100 py-4 px-6 text-[10px] uppercase tracking-widest">
                                    {spec.label}
                                </TableCell>
                                <TableCell className="text-gray-900 font-bold py-4 px-6 text-sm italic">
                                    {spec.value}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile: Grid de Cards Técnicos */}
            <div className="grid grid-cols-2 gap-3 md:hidden">
                {specs.map((spec) => (
                    <div key={spec.key} className="bg-white p-4 rounded-2xl border-2 border-gray-50 shadow-sm flex flex-col justify-center min-h-[80px]">
                        <p className="text-[9px] text-orange-600 font-black uppercase tracking-tighter mb-1.5 opacity-80">
                            {spec.label}
                        </p>
                        <p className="font-black text-gray-900 text-xs tracking-tight">
                            {spec.value}
                        </p>
                    </div>
                ))}
            </div>
            
            <p className="text-[9px] text-gray-400 font-bold italic px-2">
                * Valores nominais. Sujeito a tolerâncias normativas de fabricação.
            </p>
        </div>
    );
}