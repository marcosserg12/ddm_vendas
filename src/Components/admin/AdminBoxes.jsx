import React, { useState, useEffect } from 'react';
import { Package, Plus, Trash2, Save, Power, Ruler, Weight } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent } from '../ui/card';
import { __ddmDatabase } from '../../api/MysqlServer';
import { toast } from 'sonner';

export default function AdminBoxes() {
    const [boxes, setBoxes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBoxes();
    }, []);

    const loadBoxes = async () => {
        try {
            const data = await __ddmDatabase.entities.Embalagens.list();
            setBoxes(data);
        } catch (error) {
            toast.error("Erro ao carregar embalagens");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (box) => {
        const newStatus = box.st_ativo === 'S' ? 'N' : 'S';
        try {
            await __ddmDatabase.entities.Embalagens.update(box.id_embalagem, { st_ativo: newStatus });
            toast.success("Status atualizado");
            loadBoxes();
        } catch (error) {
            toast.error("Erro ao atualizar status");
        }
    };

    return (
        <div className="space-y-6"> {/* Remove p-6 para usar o padding do container pai */}

            {/* Header Responsivo */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-tighter italic leading-none mb-1">
                        Gestão de <span className="text-orange-600">Embalagens</span>
                    </h2>
                    <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-widest">
                        Controle de Cubagem Logística DDM
                    </p>
                </div>
                <Button className="w-full md:w-auto bg-gray-900 hover:bg-black text-orange-500 font-black px-6 h-12 md:h-10 rounded-xl text-[10px] md:text-xs tracking-widest uppercase shadow-lg shadow-gray-900/20">
                    <Plus className="w-4 h-4 mr-2" /> Nova Caixa
                </Button>
            </div>

            {/* Grid Responsivo (1 col mobile, 2 tablet, 3 desktop) */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {boxes.map((box) => (
                    <Card key={box.id_embalagem} className="border-2 border-gray-100 rounded-2xl overflow-hidden hover:border-orange-200 transition-all group hover:-translate-y-1 duration-300">
                        <CardContent className="p-0">
                            {/* Topo do Card */}
                            <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
                                        <Package className="w-5 h-5 text-gray-700" />
                                    </div>
                                    <span className="font-black text-gray-900 uppercase text-xs md:text-sm tracking-tight truncate">
                                        {box.ds_embalagem}
                                    </span>
                                </div>
                                <Button
                                    onClick={() => handleToggleStatus(box)}
                                    variant="ghost"
                                    size="sm"
                                    className={`h-7 px-3 rounded-lg font-black text-[9px] uppercase tracking-widest shrink-0 ${box.st_ativo === 'S' ? 'text-green-600 bg-green-100/50 hover:bg-green-100' : 'text-red-600 bg-red-100/50 hover:bg-red-100'}`}
                                >
                                    <Power className="w-3 h-3 mr-1.5" /> {box.st_ativo === 'S' ? 'Ativa' : 'Inativa'}
                                </Button>
                            </div>

                            {/* Detalhes Técnicos */}
                            <div className="p-5 grid grid-cols-3 gap-2 text-center md:text-left">
                                <div className="space-y-1">
                                    <div className="flex flex-col md:flex-row items-center md:items-start gap-1 text-gray-400 justify-center md:justify-start">
                                        <Ruler className="w-3 h-3" />
                                        <span className="text-[8px] md:text-[9px] font-black uppercase">Dimensões</span>
                                    </div>
                                    <p className="text-xs font-bold text-gray-700">
                                        {box.nu_comprimento}x{box.nu_largura}x{box.nu_altura}
                                    </p>
                                </div>

                                <div className="space-y-1 border-l border-gray-100 pl-2 md:pl-4 md:border-none">
                                    <div className="flex flex-col md:flex-row items-center md:items-start gap-1 text-gray-400 justify-center md:justify-start">
                                        <Weight className="w-3 h-3" />
                                        <span className="text-[8px] md:text-[9px] font-black uppercase">Capacidade</span>
                                    </div>
                                    <p className="text-xs font-bold text-gray-700">Até {box.nu_peso_maximo}kg</p>
                                </div>

                                <div className="space-y-1 text-center md:text-right border-l border-gray-100 pl-2 md:pl-0 md:border-none">
                                    <div className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase">Tara</div>
                                    <p className="text-xs font-bold text-orange-600">+{box.nu_peso_caixa}kg</p>
                                </div>
                            </div>

                            {/* Ações */}
                            <div className="px-5 pb-5 flex gap-2">
                                <Button variant="outline" className="flex-1 h-9 md:h-10 border-gray-200 font-bold text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-gray-100 hover:text-gray-900 transition-colors">
                                    Editar Medidas
                                </Button>
                                <Button variant="outline" className="w-9 h-9 md:w-10 md:h-10 p-0 border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-100 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}