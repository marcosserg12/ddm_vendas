import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { __ddmDatabase } from '../../api/MysqlServer';
import { Save, X, Package, Ruler, Settings, Image as ImageIcon, Loader2, Link2, Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger } from '../ui/select';
import { Card, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner';
import MultiImageUpload from './MultiImageUpload';

export default function ProductForm({ productToEdit, onClose }) {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('geral');
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState({});

    // Estados auxiliares
    const [selectedBrand, setSelectedBrand] = useState("");
    const [selectedModel, setSelectedModel] = useState("");
    const [compatibilityList, setCompatibilityList] = useState([]);

    // NOVO: Estado para guardar imagens locais (antes de salvar)
    const [localFiles, setLocalFiles] = useState([]);

    const initialForm = {
        ds_nome: '', id_categoria_produto: '', nu_ddm: '', nu_referencia: '', nu_sku: '',
        nu_preco_venda_atual: '', nu_preco_custo: '', nu_estoque_atual: '', nu_peso: '',
        nu_diametro: '', nu_altura: '', nu_largura: '', nu_comprimento: '',
        id_rosca: '', id_material: '', id_cor: '', id_dureza: '', st_ativo: 'S', ds_descricao: ''
    };

    const [formData, setFormData] = useState(initialForm);

    // --- CARREGAMENTO DE DADOS ---
    const { data: categorias = [] } = useQuery({ queryKey: ['aux', 'categoria'], queryFn: () => __ddmDatabase.entities.Auxiliary.getList('categoria') });
    const { data: roscas = [] } = useQuery({ queryKey: ['aux', 'rosca'], queryFn: () => __ddmDatabase.entities.Auxiliary.getList('rosca') });
    const { data: materiais = [] } = useQuery({ queryKey: ['aux', 'material'], queryFn: () => __ddmDatabase.entities.Auxiliary.getList('material') });
    const { data: cores = [] } = useQuery({ queryKey: ['aux', 'cor'], queryFn: () => __ddmDatabase.entities.Auxiliary.getList('cor') });
    const { data: durezas = [] } = useQuery({ queryKey: ['aux', 'dureza'], queryFn: () => __ddmDatabase.entities.Auxiliary.getList('dureza') });
    const { data: marcas = [] } = useQuery({ queryKey: ['allMarcas'], queryFn: () => __ddmDatabase.entities.Marcas.list() });
    const { data: modelos = [] } = useQuery({ queryKey: ['allModelos'], queryFn: () => __ddmDatabase.entities.Modelos.list() });

    // --- DADOS DO PRODUTO (MODO EDIÇÃO) ---
    const { data: serverImages = [] } = useQuery({
        queryKey: ['productImages', productToEdit?.id_produto],
        queryFn: () => __ddmDatabase.entities.ProdutoImagens.listByProduct(productToEdit.id_produto),
        enabled: !!productToEdit?.id_produto,
        staleTime: 0
    });

    const { data: serverCompatibility = [] } = useQuery({
        queryKey: ['productCompat', productToEdit?.id_produto],
        queryFn: () => __ddmDatabase.entities.Compatibilidade.listByProduct(productToEdit.id_produto),
        enabled: !!productToEdit?.id_produto,
        staleTime: 0
    });

    // --- EFFECTS ---
    useEffect(() => {
        if (productToEdit) {
            const safeData = {};
            Object.keys(initialForm).forEach(key => {
                let val = productToEdit[key];
                if (val === null || val === undefined) val = '';
                safeData[key] = String(val);
            });
            setFormData(safeData);
        } else {
            // Se for novo, limpa localFiles
            setLocalFiles([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [productToEdit?.id_produto]);

    useEffect(() => {
        if (productToEdit?.id_produto && serverCompatibility.length > 0) {
            if (compatibilityList.length === 0) {
                setCompatibilityList(serverCompatibility.map(item => ({
                    id_modelo: item.id_modelo, ds_modelo: item.ds_modelo, ds_marca: item.ds_marca
                })));
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [serverCompatibility, productToEdit?.id_produto]);

    // Helpers
    const getLabel = (list, idField, labelField, currentValue) => {
        if (!currentValue || currentValue === '') return "Selecione...";
        const item = list.find(i => String(i[idField]) === String(currentValue));
        return item ? item[labelField] : "Selecione...";
    };
    const filteredModels = modelos.filter(m => String(m.id_marca) === String(selectedBrand));

    // Handlers
    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSelectChange = (name, value) => setFormData(prev => ({ ...prev, [name]: value }));

    const handleAddCompatibility = () => {
        if (!selectedModel || !selectedBrand) return;
        if (compatibilityList.some(item => String(item.id_modelo) === String(selectedModel))) {
            toast.warning("Este modelo já está na lista.");
            return;
        }
        const modelObj = modelos.find(m => String(m.id_modelo) === String(selectedModel));
        const brandObj = marcas.find(m => String(m.id_marca) === String(selectedBrand));
        setCompatibilityList(prev => [...prev, {
            id_modelo: selectedModel, ds_modelo: modelObj?.ds_modelo, ds_marca: brandObj?.ds_marca
        }]);
    };

    const handleRemoveCompatibility = (idToDelete) => {
        setCompatibilityList(prev => prev.filter(item => String(item.id_modelo) !== String(idToDelete)));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.ds_nome) newErrors.ds_nome = "O nome é obrigatório";
        if (!formData.id_categoria_produto) newErrors.id_categoria_produto = "Selecione uma categoria";
        if (!formData.nu_preco_venda_atual) newErrors.nu_preco_venda_atual = "Defina o preço";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) {
            toast.error("Preencha os campos obrigatórios.");
            if (errors.ds_nome || errors.id_categoria_produto) setActiveTab('geral');
            return;
        }
        setIsSaving(true);
        try {
            let productId;
            const payload = { ...formData };
            Object.keys(payload).forEach(key => { if (payload[key] === '') payload[key] = null; });

            if (productToEdit) {
                // EDIÇÃO
                await __ddmDatabase.entities.Produtos.update(productToEdit.id_produto, payload);
                productId = productToEdit.id_produto;
                // No modo edição, as imagens já foram tratadas pelo componente filho (upload direto)
            } else {
                // CRIAÇÃO (NOVO)
                const res = await __ddmDatabase.entities.Produtos.create(payload);
                productId = res.id_produto;

                // AGORA FAZEMOS O UPLOAD DAS IMAGENS LOCAIS
                for (const img of localFiles) {
                    const data = new FormData();
                    data.append('image', img.file);
                    data.append('id_produto', productId);
                    // Aqui passamos quem é a capa que definimos localmente
                    data.append('st_principal', img.isMain ? 'S' : 'N');

                    await __ddmDatabase.entities.ProdutoImagens.upload(data);
                }
            }

            // Salva compatibilidade
            const modelIds = compatibilityList.map(item => item.id_modelo);
            await __ddmDatabase.entities.Compatibilidade.save(productId, modelIds);

            // Atualiza Queries
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['TodosProdutos'] }),
                queryClient.invalidateQueries({ queryKey: ['productCompat', productId] }),
                queryClient.invalidateQueries({ queryKey: ['productImages', productId] })
            ]);

            toast.success('Produto salvo com sucesso!');
            onClose();

        } catch (error) {
            console.error(error);
            toast.error('Erro ao salvar. Verifique o console.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-4xl h-full md:h-[90vh] md:rounded-[2rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">

                {/* Header */}
                <div className="bg-gray-950 text-white p-4 md:p-6 flex justify-between items-center border-b border-gray-800 shrink-0">
                    <div>
                        <h2 className="text-lg md:text-xl font-black uppercase italic tracking-tighter">
                            {productToEdit ? 'Editar Produto' : 'Novo Produto'}
                        </h2>
                        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                            Dados técnicos e aplicações
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full">
                        <X className="w-6 h-6" />
                    </Button>
                </div>

                {/* Conteúdo */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gray-50">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 md:space-y-8">
                        <TabsList className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm w-full justify-start overflow-x-auto flex-nowrap scrollbar-hide">
                            <TabTrigger value="geral" icon={Package} label="Geral" hasError={errors.ds_nome} />
                            <TabTrigger value="dimensoes" icon={Ruler} label="Dimensões" />
                            <TabTrigger value="tecnico" icon={Settings} label="Técnico" />
                            <TabTrigger value="compatibilidade" icon={Link2} label="Aplicações" />
                            <TabTrigger value="imagens" icon={ImageIcon} label="Imagens" />
                        </TabsList>

                        {/* Abas de Formulário (Mantidas) */}
                        <TabsContent value="geral">
                            <Card className="border-none shadow-md">
                                <CardContent className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                    <div className="md:col-span-2 space-y-2">
                                        <Label className={errors.ds_nome ? "text-red-500" : ""}>Nome do Produto *</Label>
                                        <Input name="ds_nome" value={formData.ds_nome} onChange={handleChange} className={`font-bold h-12 ${errors.ds_nome ? "border-red-500 bg-red-50" : ""}`} />
                                    </div>
                                    <div className="space-y-2"><Label>Código DDM</Label><Input name="nu_ddm" value={formData.nu_ddm} onChange={handleChange} className="h-12" /></div>
                                    <div className="space-y-2"><Label>Referência</Label><Input name="nu_referencia" value={formData.nu_referencia} onChange={handleChange} className="h-12" /></div>
                                    <div className="space-y-2">
                                        <Label className={errors.nu_preco_venda_atual ? "text-red-500" : ""}>Preço Venda (R$) *</Label>
                                        <Input name="nu_preco_venda_atual" type="number" step="0.01" value={formData.nu_preco_venda_atual} onChange={handleChange} className={`text-green-600 font-bold h-12 ${errors.nu_preco_venda_atual ? "border-red-500" : ""}`} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Estoque Atual</Label>
                                        <Input name="nu_estoque_atual" type="number" value={formData.nu_estoque_atual} onChange={handleChange} className="h-12" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className={errors.id_categoria_produto ? "text-red-500" : ""}>Categoria *</Label>
                                        <Select value={formData.id_categoria_produto} onValueChange={(val) => handleSelectChange('id_categoria_produto', val)}>
                                            <SelectTrigger className={`h-12 ${errors.id_categoria_produto ? "border-red-500" : ""}`}><span className="truncate">{getLabel(categorias, 'id_categoria', 'ds_categoria', formData.id_categoria_produto)}</span></SelectTrigger>
                                            <SelectContent>{categorias.map(c => (<SelectItem key={c.id_categoria} value={String(c.id_categoria)}>{c.ds_categoria}</SelectItem>))}</SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Status</Label>
                                        <Select value={formData.st_ativo} onValueChange={(val) => handleSelectChange('st_ativo', val)}>
                                            <SelectTrigger className="h-12"><span>{formData.st_ativo === 'S' ? 'Ativo' : 'Inativo'}</span></SelectTrigger>
                                            <SelectContent><SelectItem value="S">Ativo</SelectItem><SelectItem value="N">Inativo</SelectItem></SelectContent>
                                        </Select>
                                    </div>
                                    <div className="md:col-span-2 space-y-2"><Label>Descrição</Label><Textarea name="ds_descricao" value={formData.ds_descricao} onChange={handleChange} className="h-32" /></div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="dimensoes">
                            <Card className="border-none shadow-md">
                                <CardContent className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                    <div className="space-y-2"><Label>Peso (kg)</Label><Input name="nu_peso" type="number" step="0.001" value={formData.nu_peso} onChange={handleChange} className="h-12" /></div>
                                    <div className="space-y-2"><Label>Diâmetro (mm)</Label><Input name="nu_diametro" type="number" value={formData.nu_diametro} onChange={handleChange} className="h-12" /></div>
                                    <div className="space-y-2"><Label>Altura (mm)</Label><Input name="nu_altura" type="number" value={formData.nu_altura} onChange={handleChange} className="h-12" /></div>
                                    <div className="space-y-2"><Label>Largura (mm)</Label><Input name="nu_largura" type="number" value={formData.nu_largura} onChange={handleChange} className="h-12" /></div>
                                    <div className="space-y-2"><Label>Comprimento (mm)</Label><Input name="nu_comprimento" type="number" value={formData.nu_comprimento} onChange={handleChange} className="h-12" /></div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="tecnico">
                            <Card className="border-none shadow-md">
                                <CardContent className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                    <div className="space-y-2">
                                        <Label>Rosca</Label>
                                        <Select value={formData.id_rosca} onValueChange={(val) => handleSelectChange('id_rosca', val)}>
                                            <SelectTrigger className="h-12"><span className="truncate">{getLabel(roscas, 'id_rosca', 'ds_rosca', formData.id_rosca)}</span></SelectTrigger>
                                            <SelectContent>{roscas.map(item => (<SelectItem key={item.id_rosca} value={String(item.id_rosca)}>{item.ds_rosca}</SelectItem>))}</SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Material</Label>
                                        <Select value={formData.id_material} onValueChange={(val) => handleSelectChange('id_material', val)}>
                                            <SelectTrigger className="h-12"><span className="truncate">{getLabel(materiais, 'id_material', 'ds_material', formData.id_material)}</span></SelectTrigger>
                                            <SelectContent>{materiais.map(item => (<SelectItem key={item.id_material} value={String(item.id_material)}>{item.ds_material}</SelectItem>))}</SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Cor</Label>
                                        <Select value={formData.id_cor} onValueChange={(val) => handleSelectChange('id_cor', val)}>
                                            <SelectTrigger className="h-12"><span className="truncate">{getLabel(cores, 'id_cor', 'ds_cor', formData.id_cor)}</span></SelectTrigger>
                                            <SelectContent>{cores.map(item => (<SelectItem key={item.id_cor} value={String(item.id_cor)}>{item.ds_cor}</SelectItem>))}</SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Dureza</Label>
                                        <Select value={formData.id_dureza} onValueChange={(val) => handleSelectChange('id_dureza', val)}>
                                            <SelectTrigger className="h-12"><span className="truncate">{getLabel(durezas, 'id_dureza', 'ds_dureza', formData.id_dureza)}</span></SelectTrigger>
                                            <SelectContent>{durezas.map(item => (<SelectItem key={item.id_dureza} value={String(item.id_dureza)}>{item.ds_dureza}</SelectItem>))}</SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="compatibilidade">
                            <Card className="border-none shadow-md">
                                <CardContent className="p-4 md:p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <div className="space-y-2">
                                            <Label>Marca</Label>
                                            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                                                <SelectTrigger className="h-12"><span className="truncate">{getLabel(marcas, 'id_marca', 'ds_marca', selectedBrand)}</span></SelectTrigger>
                                                <SelectContent>{marcas.map(m => (<SelectItem key={m.id_marca} value={String(m.id_marca)}>{m.ds_marca}</SelectItem>))}</SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Modelo</Label>
                                            <Select value={selectedModel} onValueChange={setSelectedModel} disabled={!selectedBrand}>
                                                <SelectTrigger className="h-12"><span className="truncate">{selectedModel ? modelos.find(m => String(m.id_modelo) === String(selectedModel))?.ds_modelo : "Selecione..."}</span></SelectTrigger>
                                                <SelectContent>{filteredModels.map(m => (<SelectItem key={m.id_modelo} value={String(m.id_modelo)}>{m.ds_modelo}</SelectItem>))}</SelectContent>
                                            </Select>
                                        </div>
                                        <Button type="button" onClick={handleAddCompatibility} className="bg-orange-500 hover:bg-orange-600 text-white font-bold h-12 w-full"><Plus className="w-4 h-4 mr-2" /> Adicionar</Button>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Aplicações</Label>
                                        {compatibilityList.length === 0 ? (
                                            <div className="text-center p-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">Nenhuma compatibilidade adicionada.</div>
                                        ) : (
                                            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2">
                                                {compatibilityList.map((item, idx) => (
                                                    <div key={`${item.id_modelo}-${idx}`} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                                                        <div className="flex items-center gap-3">
                                                            <div className="bg-gray-100 px-2 py-1 rounded text-[10px] font-black uppercase text-gray-600">{item.ds_marca}</div>
                                                            <span className="font-bold text-gray-800 text-sm">{item.ds_modelo}</span>
                                                        </div>
                                                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={(e) => { e.preventDefault(); handleRemoveCompatibility(item.id_modelo); }}><Trash2 className="w-4 h-4" /></Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* --- ABA IMAGENS (INTEGRADA E RESPONSIVA) --- */}
                        <TabsContent value="imagens">
                            <MultiImageUpload
                                // Se estiver editando, passa as imagens do servidor
                                // Se for novo, passa null (o componente vai usar apenas localFiles)
                                serverImages={productToEdit ? serverImages : []}
                                id_produto={productToEdit?.id_produto}

                                // Callbacks para atualizar queries do react-query (Modo Edição)
                                onServerChange={() => queryClient.invalidateQueries({ queryKey: ['productImages', productToEdit?.id_produto] })}

                                // Controle de estado local (Modo Criação)
                                localFiles={localFiles}
                                onLocalChange={setLocalFiles}
                            />
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="bg-white p-4 md:p-6 border-t border-gray-200 flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0">
                    <Button variant="outline" onClick={onClose} className="h-12 sm:h-12 px-8 font-bold uppercase text-xs w-full sm:w-auto">Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={isSaving} className="h-12 sm:h-12 px-8 bg-gray-900 text-white hover:bg-orange-600 font-black uppercase text-xs shadow-lg transition-all w-full sm:w-auto">
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                        {isSaving ? 'Processando...' : 'Salvar Produto'}
                    </Button>
                </div>
            </div>
        </div>
    );
}

function TabTrigger({ value, icon: Icon, label, hasError }) {
    return (
        <TabsTrigger value={value} className={`gap-2 px-4 md:px-6 py-2 md:py-3 font-bold uppercase text-[10px] tracking-widest transition-all rounded-lg whitespace-nowrap ${hasError ? 'text-red-500 border border-red-200 bg-red-50' : 'data-[state=active]:bg-gray-100 data-[state=active]:text-orange-600'}`}>
            <Icon className="w-3 h-3 md:w-4 md:h-4" /> {label}
        </TabsTrigger>
    );
}