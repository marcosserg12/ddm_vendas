import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { __ddmDatabase } from '../api/MysqlServer.js';
import { useQuery } from '@tanstack/react-query';
import {
    User, Package, MapPin, Plus, Pencil, Trash2, Loader2, ShoppingBag, LogOut, ShieldCheck, CreditCard, Calendar, ChevronRight
} from 'lucide-react';

import { Button } from '../Components/ui/button';
import { Input } from '../Components/ui/input';
import { Label } from '../Components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../Components/ui/card';
import { Badge } from '../Components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../Components/ui/tabs';

export default function MinhaConta() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dados');

    // Busca usuário do LocalStorage (Backup imediato para o nome)
    const currentUser = JSON.parse(localStorage.getItem('ddm_user'));

    // Queries
    const { data: user, isLoading: userLoading } = useQuery({
        queryKey: ['profile', currentUser?.id_usuario],
        queryFn: async () => {
            const users = await __ddmDatabase.entities.Usuarios.list();
            return users.find(u => u.id_usuario === currentUser.id_usuario);
        },
        enabled: !!currentUser
    });

    const { data: addresses = [] } = useQuery({
        queryKey: ['addresses', currentUser?.id_usuario],
        queryFn: async () => {
            const list = await __ddmDatabase.entities.Enderecos.list();
            return list.filter(a => a.id_usuario === currentUser.id_usuario);
        },
        enabled: !!currentUser
    });

    const { data: orders = [] } = useQuery({
        queryKey: ['orders', currentUser?.id_usuario],
        queryFn: async () => {
            const list = await __ddmDatabase.entities.Vendas.list();
            return list.filter(v => v.id_usuario === currentUser.id_usuario);
        },
        enabled: !!currentUser
    });

    // Estado local para form
    const [profileForm, setProfileForm] = useState({ ds_nome: '', ds_email: '', ds_cpf_cnpj: '', ds_telefone: '' });

    useEffect(() => {
        if (user) setProfileForm({ ds_nome: user.ds_nome, ds_email: user.ds_email, ds_cpf_cnpj: user.ds_cpf_cnpj || '', ds_telefone: user.ds_telefone || '' });
    }, [user]);

    const handleLogout = () => {
        localStorage.removeItem('ddm_token');
        localStorage.removeItem('ddm_user');
        navigate('/login');
        window.location.reload();
    };

    const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

    if (userLoading) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-4" />
            <p className="text-xs font-black uppercase tracking-widest text-gray-400">Carregando Perfil...</p>
        </div>
    );

    // Nome para exibição: Tenta o do banco, se não tiver, usa o do localStorage
    const displayName = user?.ds_nome || currentUser?.ds_nome || 'Usuário';

    return (
        <div className="bg-gray-50 min-h-screen pb-24 font-sans">

            {/* --- HEADER DE PERFIL (COMPACTO) --- */}
            <section className="relative bg-gray-950 pt-12 pb-20 md:pt-24 md:pb-28 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800 via-gray-950 to-gray-950 opacity-40 pointer-events-none" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-soft-light pointer-events-none"></div>

                <div className="relative z-10 max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                        <div className="relative">
                            {/* Avatar */}
                            <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center shadow-2xl shadow-orange-900/30 border-4 border-gray-900">
                                <User className="w-8 h-8 md:w-10 md:h-10 text-white" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 md:w-6 md:h-6 rounded-full border-2 md:border-4 border-gray-900" />
                        </div>

                        <div>
                            {/* NOME DO USUÁRIO (Corrigido) */}
                            <h1 className="text-xl md:text-4xl font-black text-white uppercase italic tracking-tighter leading-none mb-1">
                                {displayName}
                            </h1>
                            {/* Removido "Membro desde" */}
                        </div>
                    </div>

                    <Button
                        onClick={handleLogout}
                        variant="outline"
                        className="w-full md:w-auto border-white/10 bg-white/5 text-white hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 rounded-xl uppercase font-black text-[10px] tracking-widest h-10 md:h-12 px-8 backdrop-blur-sm transition-all"
                    >
                        <LogOut className="w-4 h-4 mr-2" /> Sair
                    </Button>
                </div>
            </section>

            {/* --- CONTEÚDO PRINCIPAL --- */}
            <div className="max-w-6xl mx-auto px-4 md:px-6 -mt-12 md:-mt-16 relative z-20">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 md:space-y-8">

                    {/* Menu de Abas */}
                    <TabsList className="bg-white p-2 rounded-2xl shadow-xl shadow-gray-200/50 flex flex-col md:flex-row h-auto w-full border border-gray-100 gap-1 md:gap-0">
                        <TabsTrigger value="dados" className="w-full md:flex-1 px-4 py-3 md:py-3 rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all gap-2 justify-center">
                            <User className="w-4 h-4" /> Meus Dados
                        </TabsTrigger>
                        <TabsTrigger value="enderecos" className="w-full md:flex-1 px-4 py-3 md:py-3 rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all gap-2 justify-center">
                            <MapPin className="w-4 h-4" /> Endereços
                        </TabsTrigger>
                        <TabsTrigger value="pedidos" className="w-full md:flex-1 px-4 py-3 md:py-3 rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all gap-2 justify-center">
                            <Package className="w-4 h-4" /> Pedidos
                        </TabsTrigger>
                    </TabsList>

                    {/* --- ABA: MEUS DADOS --- */}
                    <TabsContent value="dados" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card className="rounded-[1.5rem] md:rounded-[2rem] border-none shadow-xl bg-white overflow-hidden">
                            <CardHeader className="p-6 md:p-8 border-b border-gray-50 bg-gray-50/50">
                                <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">
                                    <User className="w-4 h-4 text-orange-500" /> Informações Pessoais
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 md:p-10 space-y-6 md:space-y-8">
                                <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-gray-400 tracking-wider ml-1">Nome Completo</Label>
                                        <Input
                                            value={profileForm.ds_nome}
                                            onChange={(e) => setProfileForm({ ...profileForm, ds_nome: e.target.value })}
                                            className="h-12 md:h-14 rounded-xl border-gray-100 bg-gray-50 font-bold text-gray-700 focus:border-orange-500 focus:ring-orange-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-gray-400 tracking-wider ml-1">E-mail Corporativo</Label>
                                        <Input
                                            value={profileForm.ds_email}
                                            disabled
                                            className="h-12 md:h-14 rounded-xl border-transparent bg-gray-100 font-bold text-gray-400 cursor-not-allowed"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-gray-400 tracking-wider ml-1">Documento (CPF/CNPJ)</Label>
                                        <Input
                                            value={profileForm.ds_cpf_cnpj}
                                            onChange={(e) => setProfileForm({ ...profileForm, ds_cpf_cnpj: e.target.value })}
                                            className="h-12 md:h-14 rounded-xl border-gray-100 bg-gray-50 font-bold text-gray-700 focus:border-orange-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-gray-400 tracking-wider ml-1">Telefone / WhatsApp</Label>
                                        <Input
                                            value={profileForm.ds_telefone}
                                            onChange={(e) => setProfileForm({ ...profileForm, ds_telefone: e.target.value })}
                                            className="h-12 md:h-14 rounded-xl border-gray-100 bg-gray-50 font-bold text-gray-700 focus:border-orange-500"
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-50 flex justify-end">
                                    <Button className="w-full md:w-auto bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-widest text-[10px] h-12 md:h-14 px-10 rounded-xl shadow-lg shadow-orange-500/20">
                                        Salvar Alterações
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* --- ABA: ENDEREÇOS --- */}
                    <TabsContent value="enderecos" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {addresses.map(addr => (
                                <Card key={addr.id_usuario_endereco} className="rounded-[1.5rem] md:rounded-[2rem] border-none shadow-lg bg-white overflow-hidden group hover:shadow-2xl transition-all duration-300">
                                    <div className="bg-gray-900 p-5 flex justify-between items-start relative overflow-hidden">
                                        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="relative z-10">
                                            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-orange-500 mb-2 backdrop-blur-sm">
                                                <MapPin className="w-5 h-5" />
                                            </div>
                                            <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Entrega</span>
                                        </div>
                                        <div className="flex gap-1 relative z-10">
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/10 rounded-lg"><Pencil className="w-3.5 h-3.5" /></Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></Button>
                                        </div>
                                    </div>
                                    <CardContent className="p-6">
                                        <p className="font-black text-gray-900 uppercase text-sm mb-1 line-clamp-1" title={`${addr.ds_logradouro}, ${addr.nu_numero}`}>
                                            {addr.ds_logradouro}, {addr.nu_numero}
                                        </p>
                                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-4">
                                            {addr.ds_bairro} • {addr.ds_cidade}/{addr.ds_uf}
                                        </p>
                                        <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-[9px] font-black uppercase tracking-wider px-3 py-1">
                                            Principal
                                        </Badge>
                                    </CardContent>
                                </Card>
                            ))}

                            <button className="border-2 border-dashed border-gray-200 rounded-[1.5rem] md:rounded-[2rem] p-8 flex flex-col items-center justify-center gap-4 hover:border-orange-400 hover:bg-orange-50/50 transition-all group min-h-[200px] md:min-h-[240px]">
                                <div className="w-16 h-16 bg-white border border-gray-100 rounded-2xl flex items-center justify-center group-hover:bg-orange-500 group-hover:border-orange-500 group-hover:text-white text-gray-300 transition-all shadow-sm">
                                    <Plus className="w-8 h-8" />
                                </div>
                                <span className="text-xs font-black uppercase tracking-widest text-gray-400 group-hover:text-orange-600 transition-colors">Cadastrar Novo</span>
                            </button>
                        </div>
                    </TabsContent>

                    {/* --- ABA: PEDIDOS --- */}
                    <TabsContent value="pedidos" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card className="rounded-[1.5rem] md:rounded-[2rem] border-none shadow-xl bg-white overflow-hidden">
                            <CardContent className="p-0">
                                {orders.length > 0 ? (
                                    <>
                                        {/* Mobile: Cards */}
                                        <div className="block md:hidden p-4 space-y-4 bg-gray-50/50">
                                            {orders.map(order => (
                                                <div key={order.id_venda} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pedido</p>
                                                            <p className="text-lg font-black text-gray-900">#{order.nu_nota_fiscal || order.id_venda}</p>
                                                        </div>
                                                        <Badge className="bg-blue-50 text-blue-600 border border-blue-100 text-[9px] font-black uppercase tracking-wide">
                                                            {order.st_venda}
                                                        </Badge>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-gray-500">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        <span className="text-xs font-bold uppercase">{new Date(order.dt_venda).toLocaleDateString()}</span>
                                                    </div>

                                                    <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                                                        <div>
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase">Total</p>
                                                            <p className="text-lg font-black text-gray-900 tracking-tight">{formatCurrency(order.nu_valor_total_nota)}</p>
                                                        </div>
                                                        <Button size="sm" variant="ghost" className="h-10 w-10 p-0 rounded-xl bg-gray-50 text-gray-600">
                                                            <ChevronRight className="w-5 h-5" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Desktop: Tabela */}
                                        <div className="hidden md:block overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead className="bg-gray-50 border-b border-gray-100">
                                                    <tr>
                                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">ID Pedido</th>
                                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Data</th>
                                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Status</th>
                                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Total</th>
                                                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Ação</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {orders.map(order => (
                                                        <tr key={order.id_venda} className="hover:bg-gray-50/50 transition-colors group">
                                                            <td className="p-6 font-black text-sm text-gray-900">
                                                                #{order.nu_nota_fiscal || order.id_venda}
                                                            </td>
                                                            <td className="p-6 text-xs font-bold text-gray-500 uppercase">
                                                                {new Date(order.dt_venda).toLocaleDateString()}
                                                            </td>
                                                            <td className="p-6">
                                                                <Badge className="bg-blue-50 text-blue-600 border border-blue-100 text-[9px] font-black uppercase tracking-wide">
                                                                    {order.st_venda}
                                                                </Badge>
                                                            </td>
                                                            <td className="p-6 text-right font-black text-gray-900 tracking-tight">
                                                                {formatCurrency(order.nu_valor_total_nota)}
                                                            </td>
                                                            <td className="p-6 text-center">
                                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-gray-200">
                                                                    <CreditCard className="w-4 h-4 text-gray-400 group-hover:text-gray-900" />
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </>
                                ) : (
                                    <div className="py-24 text-center flex flex-col items-center">
                                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                                            <ShoppingBag className="w-10 h-10 text-gray-300" />
                                        </div>
                                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-2">Sem pedidos recentes</h3>
                                        <p className="text-sm text-gray-400 font-medium max-w-xs mx-auto mb-8">
                                            Você ainda não realizou nenhuma compra. Explore nosso catálogo técnico.
                                        </p>
                                        <Button onClick={() => navigate('/catalogo')} className="bg-gray-900 text-white font-bold uppercase tracking-widest text-[10px] px-8 h-12 rounded-xl">
                                            Ir para Catálogo
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                </Tabs>
            </div>
        </div>
    );
}