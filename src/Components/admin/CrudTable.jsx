import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../ui/table';
import { Button } from '../ui/button';
import { Pencil, Trash2 } from 'lucide-react';

export default function CrudTable({ data = [], columns = [], onEdit, onDelete, idAccessor }) {
    if (data.length === 0) {
        return (
            <div className="border border-dashed border-gray-300 rounded-xl p-8 text-center">
                <p className="text-gray-500">Nenhum item encontrado.</p>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <Table>
                <TableHeader className="bg-gray-50/80">
                    <TableRow>
                        {columns.map((col) => (
                            <TableHead key={col.accessor} className="font-black text-gray-400 uppercase text-[9px] tracking-widest py-4">
                                {col.Header}
                            </TableHead>
                        ))}
                        <TableHead className="text-right font-black text-gray-400 uppercase text-[9px] tracking-widest pr-6">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {data.map((row) => (
                        <TableRow key={row[idAccessor]} className="hover:bg-gray-50/80 transition-colors group border-b border-gray-50 last:border-0">
                            {columns.map((col) => (
                                <TableCell key={col.accessor} className="font-medium text-sm text-gray-800 py-4">
                                    {row[col.accessor]}
                                </TableCell>
                            ))}
                            <TableCell className="text-right pr-4">
                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-white border border-gray-200 hover:border-orange-300 hover:text-orange-600 shadow-sm" onClick={() => onEdit(row)}>
                                      <Pencil className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-white border border-gray-200 hover:border-red-300 hover:text-red-600 shadow-sm" onClick={() => onDelete(row)}>
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
