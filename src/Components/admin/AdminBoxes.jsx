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
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter italic">
                        Gestão de <span className="text-orange-600">Embalagens</span>
                    </h2>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Controle de Cubagem Logística DDM</p>
                </div>
                <Button className="bg-gray-900 hover:bg-black text-orange-500 font-black px-6 rounded-xl">
                    <Plus className="w-4 h-4 mr-2" /> NOVA CAIXA
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {boxes.map((box) => (
                    <Card key={box.id_embalagem} className="border-2 border-gray-100 rounded-2xl overflow-hidden hover:border-orange-200 transition-all">
                        <CardContent className="p-0">
                            <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        <Package className="w-5 h-5 text-gray-700" />
                                    </div>
                                    <span className="font-black text-gray-900 uppercase text-sm tracking-tight">{box.ds_embalagem}</span>
                                </div>
                                <Button 
                                    onClick={() => handleToggleStatus(box)}
                                    variant="ghost" 
                                    className={`h-8 px-3 rounded-lg font-black text-[10px] uppercase tracking-widest ${box.st_ativo === 'S' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}
                                >
                                    <Power className="w-3 h-3 mr-1" /> {box.st_ativo === 'S' ? 'Ativa' : 'Inativa'}
                                </Button>
                            </div>

                            <div className="p-5 grid grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-gray-400">
                                        <Ruler className="w-3 h-3" />
                                        <span className="text-[9px] font-black uppercase">Dimensões (mm)</span>
                                    </div>
                                    <p className="text-xs font-bold text-gray-700">
                                        {box.nu_comprimento}x{box.nu_largura}x{box.nu_altura}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-gray-400">
                                        <Weight className="w-3 h-3" />
                                        <span className="text-[9px] font-black uppercase">Capacidade</span>
                                    </div>
                                    <p className="text-xs font-bold text-gray-700">Até {box.nu_peso_maximo}kg</p>
                                </div>

                                <div className="space-y-1 text-right">
                                    <div className="text-[9px] font-black text-gray-400 uppercase">Tara da Caixa</div>
                                    <p className="text-xs font-bold text-orange-600">+{box.nu_peso_caixa}kg</p>
                                </div>
                            </div>

                            <div className="px-5 pb-5 flex gap-2">
                                <Button variant="outline" className="flex-1 h-10 border-gray-200 font-bold text-[10px] uppercase tracking-widest hover:bg-gray-100">
                                    Editar Medidas
                                </Button>
                                <Button variant="outline" className="w-10 h-10 p-0 border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-100">
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