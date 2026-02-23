import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, Plus, Trash2, Save, Power, Ruler, Weight, Loader2, X, Pencil, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent } from '../ui/card';
import { __ddmDatabase } from '../../api/MysqlServer';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "../ui/dialog";

const ConfirmDialog = ({ open, onOpenChange, onConfirm, title, description, loading }) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[400px] rounded-[2rem]">
            <DialogHeader className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <DialogTitle className="text-xl font-black uppercase italic tracking-tighter text-gray-900">
                    {title}
                </DialogTitle>
                <DialogDescription className="font-bold text-xs uppercase tracking-tight text-gray-500 mt-2">
                    {description}
                </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2 sm:gap-0 mt-6">
                <Button variant="outline" onClick={() => onOpenChange(false)} className="h-12 font-bold uppercase text-xs rounded-xl flex-1">
                    Cancelar
                </Button>
                <Button 
                    onClick={onConfirm} 
                    disabled={loading}
                    className="h-12 bg-red-600 text-white hover:bg-red-700 font-black uppercase text-xs shadow-lg transition-all rounded-xl flex-1"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                    Confirmar Exclusão
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);

export default function AdminBoxes() {
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [editingBox, setEditingBox] = useState(null);
    const [formData, setFormData] = useState({
        ds_embalagem: '',
        nu_comprimento: '',
        nu_largura: '',
        nu_altura: '',
        nu_peso_maximo: '',
        nu_peso_caixa: '',
        st_ativo: 'S'
    });

    const { data: boxes = [], isLoading } = useQuery({
        queryKey: ['TodasEmbalagens'],
        queryFn: () => __ddmDatabase.entities.Embalagens.list()
    });

    const mutation = useMutation({
        mutationFn: ({ id, data, method }) => {
            if (method === 'POST') return __ddmDatabase.entities.Embalagens.create(data);
            if (method === 'PUT') return __ddmDatabase.entities.Embalagens.update(id, data);
            if (method === 'DELETE') return __ddmDatabase.entities.Embalagens.delete(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['TodasEmbalagens'] });
            toast.success("Operação realizada com sucesso!");
            setIsDialogOpen(false);
            setIsConfirmOpen(false);
            setEditingBox(null);
            setDeletingId(null);
        },
        onError: (error) => {
            const message = error.message || "Erro ao processar requisição";
            if (message.includes("vinculado") || message.includes("1451") || message.includes("foreign key")) {
                toast.error(message.includes("vinculado") ? message : "Esta embalagem não pode ser excluída pois está em uso.");
            } else {
                toast.error(`Erro: ${message}`);
            }
        }
    });

    const handleOpenAdd = () => {
        setEditingBox(null);
        setFormData({
            ds_embalagem: '',
            nu_comprimento: '',
            nu_largura: '',
            nu_altura: '',
            nu_peso_maximo: '',
            nu_peso_caixa: '',
            st_ativo: 'S'
        });
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (box) => {
        setEditingBox(box);
        setFormData({ ...box });
        setIsDialogOpen(true);
    };

    const handleDelete = (id) => {
        setDeletingId(id);
        setIsConfirmOpen(true);
    };

    const confirmDelete = () => {
        if (deletingId) {
            mutation.mutate({ id: deletingId, method: 'DELETE' });
        }
    };

    const handleSave = () => {
        if (!formData.ds_embalagem || !formData.nu_comprimento || !formData.nu_largura || !formData.nu_altura) {
            toast.error("Nome e dimensões são obrigatórios!");
            return;
        }
        mutation.mutate({
            id: editingBox?.id_embalagem,
            data: formData,
            method: editingBox ? 'PUT' : 'POST'
        });
    };

    const handleToggleStatus = (box) => {
        const newStatus = box.st_ativo === 'S' ? 'N' : 'S';
        mutation.mutate({
            id: box.id_embalagem,
            data: { ...box, st_ativo: newStatus },
            method: 'PUT'
        });
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-4" />
                <p className="text-xs font-bold uppercase text-gray-400 tracking-widest">Carregando Embalagens...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-tighter italic leading-none mb-1">
                        Gestão de <span className="text-orange-600">Embalagens</span>
                    </h2>
                    <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-widest">
                        Controle de Cubagem Logística DDM
                    </p>
                </div>
                <Button onClick={handleOpenAdd} className="w-full md:w-auto bg-gray-900 hover:bg-black text-orange-500 font-black px-6 h-12 md:h-10 rounded-xl text-[10px] md:text-xs tracking-widest uppercase shadow-lg shadow-gray-900/20">
                    <Plus className="w-4 h-4 mr-2" /> Nova Caixa
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {boxes.map((box) => (
                    <Card key={box.id_embalagem} className="border-2 border-gray-100 rounded-2xl overflow-hidden hover:border-orange-200 transition-all group hover:-translate-y-1 duration-300">
                        <CardContent className="p-0">
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

                                <div className="space-y-1 border-l border-gray-100 pl-2 md:pl-4">
                                    <div className="flex flex-col md:flex-row items-center md:items-start gap-1 text-gray-400 justify-center md:justify-start">
                                        <Weight className="w-3 h-3" />
                                        <span className="text-[8px] md:text-[9px] font-black uppercase">Capacidade</span>
                                    </div>
                                    <p className="text-xs font-bold text-gray-700">Até {box.nu_peso_maximo}kg</p>
                                </div>

                                <div className="space-y-1 text-center md:text-right border-l border-gray-100 pl-2">
                                    <div className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase">Tara</div>
                                    <p className="text-xs font-bold text-orange-600">+{box.nu_peso_caixa}kg</p>
                                </div>
                            </div>

                            <div className="px-5 pb-5 flex gap-2">
                                <Button 
                                    variant="outline" 
                                    onClick={() => handleOpenEdit(box)}
                                    className="flex-1 h-9 md:h-10 border-gray-200 font-bold text-[9px] md:text-[10px] uppercase tracking-widest hover:bg-gray-100 hover:text-gray-900 transition-colors"
                                >
                                    <Pencil className="w-3 h-3 mr-2" /> Editar Medidas
                                </Button>
                                <Button 
                                    variant="outline" 
                                    onClick={() => handleDelete(box.id_embalagem)}
                                    className="w-9 h-9 md:w-10 md:h-10 p-0 border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-100 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase italic tracking-tighter">
                            {editingBox ? 'Editar Embalagem' : 'Nova Embalagem'}
                        </DialogTitle>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="ds_embalagem">Nome da Embalagem</Label>
                            <Input
                                id="ds_embalagem"
                                value={formData.ds_embalagem}
                                onChange={(e) => setFormData({ ...formData, ds_embalagem: e.target.value })}
                                className="h-12 font-bold"
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="grid gap-2">
                                <Label htmlFor="nu_comprimento">Comp.</Label>
                                <Input
                                    id="nu_comprimento"
                                    type="number"
                                    value={formData.nu_comprimento}
                                    onChange={(e) => setFormData({ ...formData, nu_comprimento: e.target.value })}
                                    className="h-12 font-bold"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="nu_largura">Larg.</Label>
                                <Input
                                    id="nu_largura"
                                    type="number"
                                    value={formData.nu_largura}
                                    onChange={(e) => setFormData({ ...formData, nu_largura: e.target.value })}
                                    className="h-12 font-bold"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="nu_altura">Alt.</Label>
                                <Input
                                    id="nu_altura"
                                    type="number"
                                    value={formData.nu_altura}
                                    onChange={(e) => setFormData({ ...formData, nu_altura: e.target.value })}
                                    className="h-12 font-bold"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="grid gap-2">
                                <Label htmlFor="nu_peso_maximo">Capacidade (kg)</Label>
                                <Input
                                    id="nu_peso_maximo"
                                    type="number"
                                    step="0.01"
                                    value={formData.nu_peso_maximo}
                                    onChange={(e) => setFormData({ ...formData, nu_peso_maximo: e.target.value })}
                                    className="h-12 font-bold"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="nu_peso_caixa">Tara (kg)</Label>
                                <Input
                                    id="nu_peso_caixa"
                                    type="number"
                                    step="0.01"
                                    value={formData.nu_peso_caixa}
                                    onChange={(e) => setFormData({ ...formData, nu_peso_caixa: e.target.value })}
                                    className="h-12 font-bold"
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="h-12 font-bold uppercase text-xs rounded-xl flex-1 sm:flex-none">
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} disabled={mutation.isPending} className="h-12 bg-gray-900 text-white hover:bg-orange-600 font-black uppercase text-xs shadow-lg transition-all rounded-xl flex-1 sm:flex-none">
                            {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Salvar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog 
                open={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                onConfirm={confirmDelete}
                loading={mutation.isPending}
                title="Excluir Embalagem"
                description="Tem certeza que deseja excluir esta embalagem? Esta ação não pode ser desfeita."
            />
        </div>
    );
}