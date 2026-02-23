import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { __ddmDatabase } from '../api/MysqlServer.js';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    User, Package, MapPin, Plus, Pencil, Trash2, Loader2, ShoppingBag,
    LogOut, ShieldCheck, Star, Save, Lock, Eye, EyeOff, Search, ChevronRight
} from 'lucide-react';

import { Button } from '../Components/ui/button';
import { Input } from '../Components/ui/input';
import { Label } from '../Components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../Components/ui/card';
import { Badge } from '../Components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../Components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../Components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Components/ui/select";
import { toast } from 'sonner';

export default function MinhaConta() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('dados');
    
    // Pega o usuário logado do LocalStorage
    const currentUser = JSON.parse(localStorage.getItem('ddm_user'));

    useEffect(() => {
        if (!currentUser) navigate('/login');
    }, [currentUser, navigate]);

    // Busca Endereços do Usuário
    const { data: addresses = [], isLoading: loadingAddrs } = useQuery({
        queryKey: ['addresses', currentUser?.id_usuario],
        queryFn: () => __ddmDatabase.entities.Enderecos.list(currentUser?.id_usuario),
        enabled: !!currentUser?.id_usuario
    });

    const [isAddrModalOpen, setIsAddrModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);

    const handleLogout = () => {
        localStorage.removeItem('ddm_token');
        localStorage.removeItem('ddm_user');
        navigate('/login');
        window.location.reload();
    };

    if (!currentUser) return null;

    return (
        <div className="bg-gray-50 min-h-screen pb-24 font-sans">
            {/* Header Dark Premium */}
            <section className="bg-gray-950 pt-32 pb-24 px-6 border-b-4 border-orange-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(249,115,22,0.1),transparent)] pointer-events-none" />
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <div className="relative group">
                        <div className="w-24 h-24 bg-orange-500 rounded-[2rem] flex items-center justify-center text-3xl font-black italic text-white shadow-2xl transition-transform group-hover:scale-105 rotate-3 border-4 border-gray-900">
                            {currentUser?.ds_nome?.charAt(0) || 'U'}
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-green-500 p-2 rounded-full border-4 border-gray-950 shadow-lg">
                            <ShieldCheck className="w-4 h-4 text-white" />
                        </div>
                    </div>
                    <div className="text-center md:text-left flex-1">
                        <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                            <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Cliente Ativo</Badge>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-none">
                            Olá, <span className="text-orange-500">{currentUser?.ds_nome?.split(' ')[0]}</span>
                        </h1>
                        <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em] mt-3">
                            Painel de Controle Corporativo • ID #{currentUser?.id_usuario}
                        </p>
                    </div>
                    <Button onClick={handleLogout} variant="outline" className="border-white/10 text-white hover:bg-red-500/10 hover:text-red-500 rounded-xl uppercase font-black text-[10px] h-12 px-8 backdrop-blur-sm transition-all">
                        <LogOut className="w-4 h-4 mr-2" /> Sair
                    </Button>
                </div>
            </section>

            <div className="max-w-6xl mx-auto px-4 relative z-20 -mt-10">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-10">
                    
                    {/* MENU DE ABAS CENTRALIZADO */}
                    <div className="flex justify-center">
                        <TabsList className="bg-white p-1.5 rounded-full shadow-2xl border border-gray-100 flex h-auto gap-1">
                            <TabsTrigger value="dados" className="px-8 py-3 rounded-full data-[state=active]:bg-gray-900 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest transition-all gap-2">
                                <User className="w-4 h-4" /> Meus Dados
                            </TabsTrigger>
                            <TabsTrigger value="enderecos" className="px-8 py-3 rounded-full data-[state=active]:bg-gray-900 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest transition-all gap-2">
                                <MapPin className="w-4 h-4" /> Endereços
                            </TabsTrigger>
                            <TabsTrigger value="pedidos" className="px-8 py-3 rounded-full data-[state=active]:bg-gray-900 data-[state=active]:text-white font-black uppercase text-[10px] tracking-widest transition-all gap-2">
                                <Package className="w-4 h-4" /> Pedidos
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* CONTEÚDO: DADOS */}
                    <TabsContent value="dados" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <ProfileForm user={currentUser} />
                            </div>
                            <div className="space-y-8">
                                <SecurityForm user={currentUser} />
                                <Card className="rounded-[2rem] border-none shadow-xl bg-orange-500 text-white p-8">
                                    <ShieldCheck className="w-10 h-10 mb-4 opacity-50" />
                                    <h3 className="font-black uppercase italic text-xl leading-tight">Privacidade Industrial</h3>
                                    <p className="text-orange-100 text-[10px] font-bold uppercase mt-2 leading-relaxed tracking-wider">Seus dados técnicos e de faturamento são mantidos sob criptografia de ponta.</p>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* CONTEÚDO: ENDEREÇOS */}
                    <TabsContent value="enderecos" className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                        <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
                            <div>
                                <h2 className="text-2xl font-black uppercase italic tracking-tighter">Locais de Entrega</h2>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Gerencie seus endereços de recebimento e faturamento</p>
                            </div>
                            <Button onClick={() => { setEditingAddress(null); setIsAddrModalOpen(true); }} className="bg-orange-500 hover:bg-orange-600 text-white rounded-2xl h-14 px-8 gap-3 font-black uppercase text-[11px] tracking-widest shadow-xl shadow-orange-500/20 transition-all hover:scale-105">
                                <Plus className="w-5 h-5" /> Novo Endereço
                            </Button>
                        </div>
                        
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {addresses.length > 0 ? (
                                addresses.map(addr => (
                                    <AddressCard 
                                        key={addr.id_endereco || addr.id_usuario_endereco} 
                                        address={addr} 
                                        onEdit={() => { setEditingAddress(addr); setIsAddrModalOpen(true); }}
                                        id_usuario={currentUser?.id_usuario}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
                                    <MapPin className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                    <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Nenhum endereço técnico cadastrado.</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* CONTEÚDO: PEDIDOS (ESBOÇO) */}
                    <TabsContent value="pedidos">
                        <OrdersSection navigate={navigate} />
                    </TabsContent>
                </Tabs>
            </div>

            <AddressModal 
                open={isAddrModalOpen} 
                onOpenChange={setIsAddrModalOpen} 
                editingAddress={editingAddress}
                id_usuario={currentUser?.id_usuario}
            />
        </div>
    );
}

// --- SUB-COMPONENTES ---

function ProfileForm({ user }) {
    const [isSaving, setIsSaving] = useState(false);
    // Inicializa com campos vazios para evitar erro de controlled/uncontrolled
    const [formData, setFormData] = useState({ 
        ds_nome: user?.ds_nome || '', 
        ds_email: user?.ds_email || '', 
        nu_documento: user?.nu_documento || user?.ds_cpf_cnpj || '', 
        nu_telefone: user?.nu_telefone || user?.ds_telefone || '' 
    });

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await __ddmDatabase.entities.Usuarios.update(user.id_usuario, formData);
            toast.success('Informações atualizadas!');
        } catch (err) { toast.error('Aguardando implementação da rota no servidor.'); }
        finally { setIsSaving(false); }
    };

    return (
        <Card className="rounded-[2.5rem] border-none shadow-2xl bg-white overflow-hidden">
            <CardHeader className="bg-gray-50/50 p-8 border-b border-gray-100">
                <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-3">
                    <User className="w-4 h-4 text-orange-500" /> Perfil Corporativo
                </CardTitle>
            </CardHeader>
            <CardContent className="p-10">
                <form onSubmit={handleSave} className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Razão Social / Nome</Label>
                        <Input value={formData.ds_nome} onChange={e => setFormData({...formData, ds_nome: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-2 border-gray-50 font-bold focus:border-orange-500 focus:bg-white transition-all" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">E-mail de Acesso</Label>
                        <Input disabled value={formData.ds_email} className="h-14 rounded-2xl bg-gray-100 border-none font-bold text-gray-400 cursor-not-allowed" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Documento (CPF / CNPJ)</Label>
                        <Input value={formData.nu_documento} onChange={e => setFormData({...formData, nu_documento: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-2 border-gray-50 font-bold focus:border-orange-500 focus:bg-white transition-all" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Contato Telefônico</Label>
                        <Input value={formData.nu_telefone} onChange={e => setFormData({...formData, nu_telefone: e.target.value})} className="h-14 rounded-2xl bg-gray-50 border-2 border-gray-50 font-bold focus:border-orange-500 focus:bg-white transition-all" />
                    </div>
                    <Button disabled={isSaving} className="md:col-span-2 h-16 bg-gray-950 hover:bg-orange-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl transition-all mt-4">
                        {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="w-5 h-5 mr-3" />} Confirmar Atualização
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

function SecurityForm({ user }) {
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [passData, setPassData] = useState({ atual: '', nova: '', confirma: '' });

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (passData.nova !== passData.confirma) return toast.error('Nova senha e confirmação não conferem!');
        setLoading(true);
        try {
            await __ddmDatabase.entities.Usuarios.updatePassword(user.id_usuario, passData);
            toast.success('Senha alterada com sucesso!');
            setPassData({ atual: '', nova: '', confirma: '' });
        } catch (err) { toast.error('Senha atual incorreta.'); }
        finally { setLoading(false); }
    };

    return (
        <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
            <CardHeader className="bg-orange-50/50 p-8 border-b border-orange-100">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-600 flex items-center gap-3">
                    <Lock className="w-4 h-4" /> Alterar Senha
                </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-5">
                <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-black text-gray-400">Senha de Acesso Atual</Label>
                    <div className="relative">
                        <Input type={showPass ? "text" : "password"} value={passData.atual} onChange={e => setPassData({...passData, atual: e.target.value})} className="h-12 rounded-xl bg-gray-50 border-none font-bold" />
                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
                <div className="space-y-1">
                    <Label className="text-[10px] uppercase font-black text-gray-400">Nova Senha Industrial</Label>
                    <Input type="password" value={passData.nova} onChange={e => setPassData({...passData, nova: e.target.value})} className="h-12 rounded-xl bg-gray-50 border-none font-bold" />
                </div>
                <Button onClick={handleUpdate} disabled={loading} className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-orange-200 mt-2">
                    {loading ? <Loader2 className="animate-spin" /> : 'Confirmar Nova Senha'}
                </Button>
            </CardContent>
        </Card>
    );
}

function AddressCard({ address, onEdit, id_usuario }) {
    const queryClient = useQueryClient();
    const isFavorite = address.st_entrega === 'S';

    const handleFavorite = async () => {
        try {
            await __ddmDatabase.entities.Enderecos.setFavorite(id_usuario, address.id_endereco || address.id_usuario_endereco);
            queryClient.invalidateQueries(['addresses']);
            toast.success('Endereço padrão atualizado!');
        } catch (err) { toast.error('Erro ao definir favorito.'); }
    };

    const handleDelete = async () => {
        if (!window.confirm("Excluir permanentemente este endereço?")) return;
        try {
            await __ddmDatabase.entities.Enderecos.delete(address.id_endereco || address.id_usuario_endereco);
            queryClient.invalidateQueries(['addresses']);
            toast.success('Endereço removido.');
        } catch (err) { toast.error('Erro ao remover.'); }
    };

    return (
        <Card className={`rounded-[2.5rem] border-2 transition-all ${isFavorite ? 'border-orange-500 bg-white shadow-2xl shadow-orange-100 scale-[1.02]' : 'border-gray-100 bg-white shadow-sm hover:shadow-lg'}`}>
            <CardContent className="p-8 space-y-5">
                <div className="flex justify-between items-start">
                    <div className={`p-4 rounded-2xl ${isFavorite ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-gray-100 text-gray-400'}`}>
                        <MapPin className="w-6 h-6" />
                    </div>
                    {isFavorite && <Badge className="bg-orange-500 text-white text-[9px] font-black uppercase px-3 py-1.5 tracking-[0.2em] rounded-full">Principal</Badge>}
                </div>
                <div>
                    <p className="font-black text-gray-900 text-base uppercase leading-tight line-clamp-1">{address.ds_endereco}</p>
                    <p className="text-gray-400 text-[11px] font-bold mt-2 uppercase tracking-wider">{address.ds_bairro} • {address.ds_cidade}/{address.sg_uf}</p>
                    <p className="text-gray-400 text-[10px] font-mono mt-1 uppercase tracking-wider">CEP: {address.nu_cep}</p>
                </div>
                <div className="flex gap-3 pt-6 border-t border-gray-50">
                    <Button variant="ghost" size="icon" onClick={onEdit} className="h-11 w-11 rounded-xl bg-gray-50 hover:bg-orange-50 hover:text-orange-600 transition-all"><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={handleDelete} className="h-11 w-11 rounded-xl bg-gray-50 hover:bg-red-50 hover:text-red-600 transition-all"><Trash2 className="w-4 h-4" /></Button>
                    {!isFavorite && (
                        <Button variant="ghost" onClick={handleFavorite} className="ml-auto text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-orange-600 gap-2">
                            <Star className="w-4 h-4" /> Tornar Padrão
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function AddressModal({ open, onOpenChange, editingAddress, id_usuario }) {
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);
    const [searchingCep, setSearchingCep] = useState(false);
    
    const [formData, setFormData] = useState({ 
        nu_cep: '', ds_endereco: '', ds_bairro: '', id_uf: '', id_municipio: '', 
        ds_referencia: '', st_entrega: 'N', st_cobranca: 'N' 
    });

    const { data: estados = [] } = useQuery({ queryKey: ['estados'], queryFn: () => __ddmDatabase.entities.Ufs.list() });
    const { data: municipios = [] } = useQuery({ 
        queryKey: ['municipios', formData.id_uf], 
        queryFn: () => __ddmDatabase.entities.Municipios.listByUf(formData.id_uf),
        enabled: !!formData.id_uf 
    });

    const handleCepBlur = async () => {
        const cep = String(formData.nu_cep).replace(/\D/g, '');
        if (cep.length !== 8) return;
        setSearchingCep(true);
        try {
            const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await res.json();
            if (!data.erro) {
                const ufEncontrada = estados.find(e => e.sg_uf === data.uf);
                setFormData(prev => ({
                    ...prev,
                    ds_endereco: data.logradouro || '',
                    ds_bairro: data.bairro || '',
                    id_uf: ufEncontrada ? String(ufEncontrada.id_uf) : '',
                    id_municipio: ''
                }));
                toast.success('Localização identificada!');
            }
        } catch (err) { console.error(err); }
        finally { setSearchingCep(false); }
    };

    useEffect(() => {
        if (editingAddress) setFormData({
            ...editingAddress,
            nu_cep: String(editingAddress.nu_cep || ''),
            id_uf: String(editingAddress.id_uf || ''),
            id_municipio: String(editingAddress.id_municipio || ''),
            ds_endereco: editingAddress.ds_endereco || editingAddress.ds_logradouro || ''
        });
        else setFormData({ nu_cep: '', ds_endereco: '', ds_bairro: '', id_uf: '', id_municipio: '', ds_referencia: '', st_entrega: 'N', st_cobranca: 'N' });
    }, [editingAddress, open]);

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { 
                ...formData, 
                id_usuario, 
                nu_cep: String(formData.nu_cep).replace(/\D/g, ''),
                st_entrega: editingAddress?.st_entrega || 'N',
                st_cobranca: editingAddress?.st_cobranca || 'N'
            };
            
            if (editingAddress) {
                const id = editingAddress.id_endereco || editingAddress.id_usuario_endereco;
                await __ddmDatabase.entities.Enderecos.update(id, payload);
            } else {
                await __ddmDatabase.entities.Enderecos.create(payload);
            }
            
            queryClient.invalidateQueries(['addresses']);
            toast.success('Endereço salvo com sucesso!');
            onOpenChange(false);
        } catch (err) { toast.error('Erro ao salvar endereço.'); }
        finally { setLoading(false); }
    };

    const curUf = estados.find(uf => String(uf.id_uf) === String(formData.id_uf))?.sg_uf;
    const curCid = municipios.find(m => String(m.id_municipio) === String(formData.id_municipio))?.ds_cidade;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-[3rem] max-w-2xl border-none shadow-2xl p-0 overflow-visible bg-white">
                <div className="bg-gray-950 p-8 border-b-4 border-orange-500 rounded-t-[3rem]">
                    <DialogTitle className="font-black uppercase italic tracking-tighter text-2xl text-white flex items-center gap-3">
                        <MapPin className="text-orange-500 w-6 h-6" /> {editingAddress ? 'Editar' : 'Novo'} Endereço
                    </DialogTitle>
                </div>
                <form onSubmit={handleSave} className="p-10 grid grid-cols-2 gap-6 bg-white rounded-b-[3rem]">
                    <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">CEP</Label>
                        <div className="relative">
                            <Input value={formData.nu_cep} onBlur={handleCepBlur} onChange={e => setFormData({...formData, nu_cep: e.target.value})} className="h-12 rounded-xl bg-gray-50 border-none font-bold pr-12" placeholder="00000000" />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                {searchingCep ? <Loader2 className="w-4 h-4 animate-spin text-orange-500" /> : <Search className="w-4 h-4 text-gray-300" />}
                            </div>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Bairro</Label>
                        <Input value={formData.ds_bairro} onChange={e => setFormData({...formData, ds_bairro: e.target.value})} className="h-12 rounded-xl bg-gray-50 border-none font-bold" />
                    </div>
                    <div className="col-span-2 space-y-1">
                        <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Rua e Número</Label>
                        <Input value={formData.ds_endereco} onChange={e => setFormData({...formData, ds_endereco: e.target.value})} className="h-12 rounded-xl bg-gray-50 border-none font-bold" />
                    </div>

                    <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Estado (UF)</Label>
                        <Select value={String(formData.id_uf)} onValueChange={val => setFormData({...formData, id_uf: val, id_municipio: ''})}>
                            <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-none font-bold">
                                <SelectValue placeholder="UF">{curUf}</SelectValue>
                            </SelectTrigger>
                            <SelectContent position="popper" className="max-h-60 w-[var(--radix-select-trigger-width)] z-[999] bg-white border border-gray-100 shadow-2xl overflow-y-auto">
                                {estados.map(uf => (
                                    <SelectItem key={uf.id_uf} value={String(uf.id_uf)}>{uf.sg_uf} - {uf.ds_uf}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1">
                        <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Cidade</Label>
                        <Select value={String(formData.id_municipio)} onValueChange={val => setFormData({...formData, id_municipio: val})} disabled={!formData.id_uf}>
                            <SelectTrigger className="h-12 rounded-xl bg-gray-50 border-none font-bold">
                                <SelectValue placeholder="Cidade">{curCid}</SelectValue>
                            </SelectTrigger>
                            <SelectContent position="popper" className="max-h-60 w-[var(--radix-select-trigger-width)] z-[999] bg-white border border-gray-100 shadow-2xl overflow-y-auto">
                                {municipios.map(m => (
                                    <SelectItem key={m.id_municipio} value={String(m.id_municipio)}>{m.ds_cidade}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="col-span-2 space-y-1">
                        <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Referência / Complemento</Label>
                        <Input value={formData.ds_referencia} onChange={e => setFormData({...formData, ds_referencia: e.target.value})} className="h-12 rounded-xl bg-gray-50 border-none font-bold" />
                    </div>
                    <Button disabled={loading} className="col-span-2 h-16 bg-gray-950 hover:bg-orange-600 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl mt-4 transition-all">
                        {loading ? <Loader2 className="animate-spin" /> : 'Salvar Endereço Técnico'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function OrdersSection({ navigate }) {
    return (
        <Card className="rounded-[3rem] border-none shadow-2xl bg-white p-24 text-center">
            <ShoppingBag className="w-20 h-20 text-gray-100 mx-auto mb-6" />
            <h3 className="text-2xl font-black uppercase italic tracking-tighter text-gray-900">Histórico de Pedidos</h3>
            <p className="text-gray-400 font-bold text-xs uppercase mt-3 mb-10 tracking-widest">Suas requisições técnicas aparecerão aqui.</p>
            <Button onClick={() => navigate('/catalogo')} className="bg-gray-950 hover:bg-orange-600 text-white rounded-2xl h-14 px-12 font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-gray-200">Ir para o Catálogo DDM</Button>
        </Card>
    );
}
