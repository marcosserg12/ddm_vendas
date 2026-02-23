import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { __ddmDatabase } from '../../api/MysqlServer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { PlusCircle, Loader2, Save, Trash2, AlertTriangle } from 'lucide-react';
import CrudTable from './CrudTable';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

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

const CrudManager = ({ entityName, queryKey, queryFn, columns, singleName, idAccessor, onEdit, onDelete, onAdd, extraData = {} }) => {
    const { data: rawData = [], isLoading } = useQuery({ 
        queryKey, 
        queryFn
    });

    // Enriquecimento dos dados: se o banco não trouxer ds_marca/ds_serie, buscamos nas listas locais (marcas/series)
    const data = useMemo(() => {
        if (!rawData.length) return [];
        
        return rawData.map(item => {
            const newItem = { ...item };
            
            // Se for modelo e não tiver ds_serie ou ds_marca, busca na lista extra
            if (queryKey.includes('allModelos')) {
                if (!newItem.ds_serie && extraData.series && newItem.id_serie) {
                    newItem.ds_serie = extraData.series.find(s => String(s.id_serie) === String(newItem.id_serie))?.ds_serie;
                }
                if (!newItem.ds_marca && extraData.marcas && newItem.id_marca) {
                    newItem.ds_marca = extraData.marcas.find(m => String(m.id_marca) === String(newItem.id_marca))?.ds_marca;
                }
            }
            
            // Se for série e não tiver ds_marca, busca na lista extra
            if (queryKey.includes('allSeries')) {
                if (!newItem.ds_marca && extraData.marcas && newItem.id_marca) {
                    newItem.ds_marca = extraData.marcas.find(m => String(m.id_marca) === String(newItem.id_marca))?.ds_marca;
                }
            }
            
            return newItem;
        });
    }, [rawData, queryKey, extraData]);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800 tracking-tight">Gerenciar {entityName}</h3>
                <Button onClick={onAdd} className="bg-gray-900 hover:bg-black text-white font-bold">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Adicionar {singleName}
                </Button>
            </div>
            {isLoading ? (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                </div>
            ) : (
                <CrudTable
                    data={data}
                    columns={columns}
                    idAccessor={idAccessor}
                    onEdit={onEdit}
                    onDelete={onDelete}
                />
            )}
        </div>
    );
};

export default function AdminTechnical() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('rosca');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [deletingItem, setDeletingItem] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({});

    const mutation = useMutation({
        mutationFn: ({ entity, id, data, method }) => {
            // Remove campos que vêm do JOIN (ds_marca, ds_serie) antes de enviar para o banco
            const cleanData = { ...data };
            delete cleanData.ds_marca;
            delete cleanData.ds_serie;

            if (method === 'POST') return __ddmDatabase.entities.Auxiliary.create(entity, cleanData);
            if (method === 'PUT') return __ddmDatabase.entities.Auxiliary.update(entity, id, cleanData);
            if (method === 'DELETE') return __ddmDatabase.entities.Auxiliary.delete(entity, id);
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['aux', variables.entity] });
            queryClient.invalidateQueries({ queryKey: [`all${variables.entity.charAt(0).toUpperCase() + variables.entity.slice(1)}`] });
            
            toast.success(`Operação realizada com sucesso!`);
            setIsDialogOpen(false);
            setIsConfirmOpen(false);
            setEditingItem(null);
            setDeletingItem(null);
            setFormData({});
        },
        onError: (error) => {
            toast.error(`Erro: ${error.message || "Erro na requisição"}`);
        },
    });

    const technicalOptions = useMemo(() => [
        {
            value: 'rosca',
            label: 'Roscas',
            idAccessor: 'id_rosca',
            queryKey: ['aux', 'rosca'],
            queryFn: () => __ddmDatabase.entities.Auxiliary.getList('rosca'),
            columns: [{ Header: 'Nome', accessor: 'ds_rosca' }],
            singleName: 'Rosca'
        },
        {
            value: 'material',
            label: 'Materiais',
            idAccessor: 'id_material',
            queryKey: ['aux', 'material'],
            queryFn: () => __ddmDatabase.entities.Auxiliary.getList('material'),
            columns: [{ Header: 'Nome', accessor: 'ds_material' }],
            singleName: 'Material'
        },
        {
            value: 'cor',
            label: 'Cores',
            idAccessor: 'id_cor',
            queryKey: ['aux', 'cor'],
            queryFn: () => __ddmDatabase.entities.Auxiliary.getList('cor'),
            columns: [{ Header: 'Nome', accessor: 'ds_cor' }],
            singleName: 'Cor'
        },
        {
            value: 'dureza',
            label: 'Durezas',
            idAccessor: 'id_dureza',
            queryKey: ['aux', 'dureza'],
            queryFn: () => __ddmDatabase.entities.Auxiliary.getList('dureza'),
            columns: [{ Header: 'Nome', accessor: 'ds_dureza' }],
            singleName: 'Dureza'
        },
        {
            value: 'categoria',
            label: 'Categorias',
            idAccessor: 'id_categoria',
            queryKey: ['aux', 'categoria'],
            queryFn: () => __ddmDatabase.entities.Auxiliary.getList('categoria'),
            columns: [{ Header: 'Nome', accessor: 'ds_categoria' }],
            singleName: 'Categoria'
        },
        {
            value: 'marcas',
            label: 'Marcas',
            idAccessor: 'id_marca',
            queryKey: ['allMarcas'],
            queryFn: () => __ddmDatabase.entities.Marcas.list(),
            columns: [{ Header: 'Marca', accessor: 'ds_marca' }],
            singleName: 'Marca'
        },
        {
            value: 'series',
            label: 'Séries',
            idAccessor: 'id_serie',
            queryKey: ['allSeries'],
            queryFn: () => __ddmDatabase.entities.Series.list(),
            columns: [
                { Header: 'Série', accessor: 'ds_serie' },
                { Header: 'Marca', accessor: 'ds_marca' } // Vindo do JOIN no backend
            ],
            singleName: 'Série'
        },
        {
            value: 'modelos',
            label: 'Modelos',
            idAccessor: 'id_modelo',
            queryKey: ['allModelos'],
            queryFn: () => __ddmDatabase.entities.Modelos.list(),
            columns: [
                { Header: 'Modelo', accessor: 'ds_modelo' },
                { Header: 'Série', accessor: 'ds_serie' }, // Vindo do JOIN no backend
                { Header: 'Marca', accessor: 'ds_marca' }  // Vindo do JOIN no backend
            ],
            singleName: 'Modelo'
        },
    ], []);

    const currentOption = useMemo(() => technicalOptions.find(o => o.value === activeTab), [activeTab, technicalOptions]);

    // Queries globais para os Selects nos modais (sempre habilitadas para evitar conflitos com a listagem)
    const { data: marcas = [] } = useQuery({
        queryKey: ['allMarcas'],
        queryFn: () => __ddmDatabase.entities.Marcas.list()
    });

    const { data: series = [] } = useQuery({
        queryKey: ['allSeries'],
        queryFn: () => __ddmDatabase.entities.Series.list()
    });

    // Lógica de prefixo para Modelos (Série-)
    useEffect(() => {
        if (activeTab === 'modelos' && formData.id_serie && !editingItem) {
            const selectedSerie = series.find(s => String(s.id_serie) === String(formData.id_serie));
            if (selectedSerie) {
                const prefix = `${selectedSerie.ds_serie}-`;
                if (!formData.ds_modelo || !formData.ds_modelo.startsWith(prefix)) {
                    setFormData(prev => ({ ...prev, ds_modelo: prefix }));
                }
            }
        }
    }, [formData.id_serie, series, activeTab, editingItem]);

    const handleSave = () => {
        if (activeTab === 'series' && (!formData.ds_serie || !formData.id_marca)) return toast.error("Marca e Série são obrigatórios");
        if (activeTab === 'modelos' && (!formData.ds_modelo || !formData.id_serie || !formData.id_marca)) return toast.error("Marca, Série e Modelo são obrigatórios");

        mutation.mutate({
            entity: activeTab,
            id: editingItem ? editingItem[currentOption.idAccessor] : null,
            data: formData,
            method: editingItem ? 'PUT' : 'POST'
        });
    };

    return (
        <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="bg-gray-100 border border-gray-200 h-auto p-1.5 shadow-inner rounded-full w-full flex-wrap justify-start gap-1">
                    {technicalOptions.map(option => (
                        <TabsTrigger key={option.value} value={option.value} className="flex-1 sm:flex-auto min-w-[100px] gap-2 px-4 py-2 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-md hover:bg-gray-50 transition-all rounded-full">
                            {option.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {technicalOptions.map(option => (
                    <TabsContent key={option.value} value={option.value}>
                        <CrudManager
                            entityName={option.label}
                            queryKey={option.queryKey}
                            queryFn={option.queryFn}
                            columns={option.columns}
                            singleName={option.singleName}
                            idAccessor={option.idAccessor}
                            extraData={{ marcas, series }}
                            onAdd={() => { setEditingItem(null); setFormData({}); setIsDialogOpen(true); }}
                            onEdit={(row) => { setEditingItem(row); setFormData({ ...row }); setIsDialogOpen(true); }}
                            onDelete={(row) => { setDeletingItem({ entity: option.value, id: row[option.idAccessor] }); setIsConfirmOpen(true); }}
                        />
                    </TabsContent>
                ))}
            </Tabs>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
                    <DialogHeader><DialogTitle className="text-xl font-black uppercase italic tracking-tighter">{editingItem ? 'Editar' : 'Novo'} {currentOption?.singleName}</DialogTitle></DialogHeader>
                    <div className="grid gap-4 py-4">
                        {(activeTab === 'modelos' || activeTab === 'series') && (
                            <div className="grid gap-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Marca *</Label>
                                <Select value={formData.id_marca ? String(formData.id_marca) : undefined} onValueChange={(val) => setFormData({ ...formData, id_marca: val })}>
                                    <SelectTrigger className="h-12 font-bold bg-gray-50 border-gray-100 rounded-xl">
                                        <SelectValue placeholder="Selecione a marca">
                                            {marcas.find(m => String(m.id_marca) === String(formData.id_marca))?.ds_marca}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {marcas.map(m => <SelectItem key={m.id_marca} value={String(m.id_marca)}>{m.ds_marca}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        {activeTab === 'modelos' && (
                            <div className="grid gap-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Série *</Label>
                                <Select value={formData.id_serie ? String(formData.id_serie) : undefined} onValueChange={(val) => setFormData({ ...formData, id_serie: val })}>
                                    <SelectTrigger className="h-12 font-bold bg-gray-50 border-gray-100 rounded-xl">
                                        <SelectValue placeholder="Selecione a série">
                                            {series.find(s => String(s.id_serie) === String(formData.id_serie))?.ds_serie}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {series.map(s => <SelectItem key={s.id_serie} value={String(s.id_serie)}>{s.ds_serie}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        {currentOption?.columns.map(col => {
                            // Definimos logicamente quando exibir um campo de texto (Input)
                            let showInput = false;
                            if (col.accessor.startsWith('ds_')) {
                                // Na aba de Marcas, ds_marca é input
                                if (activeTab === 'marcas' && col.accessor === 'ds_marca') showInput = true;
                                // Na aba de Séries, ds_serie é input (marca é select)
                                else if (activeTab === 'series' && col.accessor === 'ds_serie') showInput = true;
                                // Na aba de Modelos, ds_modelo é input (marca e série são selects)
                                else if (activeTab === 'modelos' && col.accessor === 'ds_modelo') showInput = true;
                                // Para as outras abas genéricas (rosca, material, etc), qualquer ds_ é input
                                else if (!['marcas', 'series', 'modelos'].includes(activeTab)) showInput = true;
                            }

                            if (showInput) {
                                return (
                                    <div key={col.accessor} className="grid gap-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{col.Header} *</Label>
                                        <Input value={formData[col.accessor] || ''} onChange={(e) => setFormData({ ...formData, [col.accessor]: e.target.value })} className="h-12 font-bold bg-gray-50 border-gray-100 rounded-xl" />
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="h-12 font-bold uppercase text-xs rounded-xl flex-1">Cancelar</Button>
                        <Button onClick={handleSave} disabled={mutation.isPending} className="h-12 bg-gray-900 text-white hover:bg-orange-600 font-black uppercase text-xs shadow-lg rounded-xl flex-1">
                            {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} Salvar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ConfirmDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen} onConfirm={() => mutation.mutate({ entity: deletingItem.entity, id: deletingItem.id, method: 'DELETE' })} loading={mutation.isPending} title="Excluir Registro" description="Tem certeza? Esta ação é permanente." />
        </div>
    );
}
