import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
} from "../ui/table";

const SPEC_LABELS = {
    rosca: 'Rosca',
    diametro_mm: 'Diâmetro (mm)',
    altura: 'Altura (mm)',
    comprimento: 'Comprimento (mm)',
    diametro_menor: 'Diâmetro Menor',
    porca: 'Porca',
    parafuso: 'Parafuso',
    dureza: 'Dureza (Shore A)',
    diametro_maior: 'Diâmetro Maior',
    diametro_interno: 'Diâmetro Interno',
    diametro_interno_maior: 'Ø Int. Maior',
    diametro_interno_boca: 'Ø Int. Boca',
    diametro_interno_boca_maior: 'Ø Int. Boca Maior',
    diametro_interno_boca_menor: 'Ø Int. Boca Menor',
    dim_cxlxh: 'Dimensões (CxLxH)',
    material: 'Material',
    cor: 'Cor'
};

export default function ResponsiveSpecsTable({ product }) {
    // Filtra apenas especificações que têm valor preenchido
    const specs = Object.entries(SPEC_LABELS)
        .map(([key, label]) => ({
            key,
            label,
            value: product[key]
        }))
        .filter(spec => spec.value && spec.value !== '--' && spec.value !== '');

    if (specs.length === 0) {
        return <p className="text-gray-500">Nenhuma especificação adicional disponível.</p>;
    }

    return (
        <>
            {/* Visão Desktop (Tabela) */}
            <div className="hidden md:block overflow-x-auto rounded-lg border">
                <Table>
                    <TableBody>
                        {specs.map((spec, idx) => (
                            <TableRow key={spec.key} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <TableCell className="font-medium text-gray-700 w-1/3 border-r">
                                    {spec.label}
                                </TableCell>
                                <TableCell className="text-gray-900 font-medium">
                                    {spec.value}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Visão Mobile (Grid/Cards) */}
            <div className="grid grid-cols-2 gap-3 md:hidden">
                {specs.map((spec) => (
                    <div key={spec.key} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                            {spec.label}
                        </p>
                        <p className="font-semibold text-gray-900 text-sm">
                            {spec.value}
                        </p>
                    </div>
                ))}
            </div>
        </>
    );
}