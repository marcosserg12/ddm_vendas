import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { __ddmDatabase } from '../api/MysqlServer.js';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    User, Package, MapPin, Plus, Pencil, Trash2, Check, Loader2, ShoppingBag, LogOut, ShieldCheck
} from 'lucide-react';

import { Button } from '../Components/ui/button';
import { Input } from '../Components/ui/input';
import { Label } from '../Components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../Components/ui/card';
import { Badge } from '../Components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../Components/ui/tabs';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../Components/ui/dialog";

const ESTADOS_BR = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

export default function MinhaConta() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dados');
    const [addressDialogOpen, setAddressDialogOpen] = useState(false);

    // Busca o usuário logado via JWT/LocalStorage
    const currentUser = JSON.parse(localStorage.getItem('ddm_user'));

    // 1. Busca Dados do Perfil (tb_usuario)
    const { data: user, isLoading: userLoading } = useQuery({
        queryKey: ['profile', currentUser?.id_usuario],
        queryFn: async () => {
            const users = await __ddmDatabase.entities.Usuarios.list();
            return users.find(u => u.id_usuario === currentUser.id_usuario);
        },
        enabled: !!currentUser
    });

    // 2. Busca Endereços (tb_usuario_endereco)
    const { data: addresses = [], isLoading: addrLoading } = useQuery({
        queryKey: ['addresses', currentUser?.id_usuario],
        queryFn: async () => {
            const list = await __ddmDatabase.entities.Enderecos.list();
            return list.filter(a => a.id_usuario === currentUser.id_usuario);
        },
        enabled: !!currentUser
    });

    // 3. Busca Pedidos (tb_venda)
    const { data: orders = [], isLoading: ordersLoading } = useQuery({
        queryKey: ['orders', currentUser?.id_usuario],
        queryFn: async () => {
            const list = await __ddmDatabase.entities.Vendas.list();
            return list.filter(v => v.id_usuario === currentUser.id_usuario);
        },
        enabled: !!currentUser
    });

    // Estados do Formulário
    const [profileForm, setProfileForm] = useState({ ds_nome: '', ds_email: '', ds_cpf_cnpj: '', ds_telefone: '' });
    const [addressForm, setAddressForm] = useState({ ds_logradouro: '', nu_numero: '', ds_bairro: '', ds_cidade: '', ds_uf: '', nu_cep: '' });

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

    if (userLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-orange-500" /></div>;

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Header Dark Perfil */}
            <section className="bg-gray-900 pt-16 pb-24">
                <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-orange-500 rounded-3xl flex items-center justify-center shadow-xl shadow-orange-500/20">
                            <User className="w-10 h-10 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none">{user?.ds_nome}</h1>
                            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                                <ShieldCheck className="w-3 h-3 text-orange-500" /> Conta Verificada DDM
                            </p>
                        </div>
                    </div>
                    <Button onClick={handleLogout} variant="outline" className="border-white/10 text-white hover:bg-red-500 hover:border-red-500 rounded-xl uppercase font-black text-[10px] tracking-widest h-12 px-8">
                        <LogOut className="w-4 h-4 mr-2" /> Encerrar Sessão
                    </Button>
                </div>
            </section>

            <div className="max-w-6xl mx-auto px-6 -mt-12">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                    <TabsList className="bg-white p-1 rounded-2xl shadow-xl shadow-gray-200/50 inline-flex border-2 border-gray-100 h-16">
                        <TabsTrigger value="dados" className="px-8 rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-gray-900 data-[state=active]:text-white">Meus Dados</TabsTrigger>
                        <TabsTrigger value="enderecos" className="px-8 rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-gray-900 data-[state=active]:text-white">Endereços</TabsTrigger>
                        <TabsTrigger value="pedidos" className="px-8 rounded-xl font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-gray-900 data-[state=active]:text-white">Meus Pedidos</TabsTrigger>
                    </TabsList>

                    {/* Conteúdo: Meus Dados */}
                    <TabsContent value="dados" className="animate-in fade-in slide-in-from-bottom-4">
                        <Card className="rounded-3xl border-none shadow-xl">
                            <CardHeader className="p-8 border-b border-gray-50">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-400">Informações Cadastrais</CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-gray-400">Nome Completo</Label>
                                        <Input value={profileForm.ds_nome} onChange={(e) => setProfileForm({...profileForm, ds_nome: e.target.value})} className="h-12 rounded-xl border-gray-100 bg-gray-50 font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-gray-400">E-mail de Contato</Label>
                                        <Input value={profileForm.ds_email} disabled className="h-12 rounded-xl border-gray-100 bg-gray-100 font-bold text-gray-400" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-gray-400">CPF / CNPJ</Label>
                                        <Input value={profileForm.ds_cpf_cnpj} onChange={(e) => setProfileForm({...profileForm, ds_cpf_cnpj: e.target.value})} className="h-12 rounded-xl border-gray-100 bg-gray-50 font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-gray-400">Telefone Comercial</Label>
                                        <Input value={profileForm.ds_telefone} onChange={(e) => setProfileForm({...profileForm, ds_telefone: e.target.value})} className="h-12 rounded-xl border-gray-100 bg-gray-50 font-bold" />
                                    </div>
                                </div>
                                <Button className="bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest text-[10px] h-14 px-10 rounded-2xl shadow-lg shadow-orange-500/20">
                                    Atualizar Perfil
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Conteúdo: Endereços */}
                    <TabsContent value="enderecos" className="animate-in fade-in slide-in-from-bottom-4">
                        <div className="grid md:grid-cols-3 gap-8">
                            {addresses.map(addr => (
                                <Card key={addr.id_usuario_endereco} className="rounded-3xl border-none shadow-xl bg-white overflow-hidden group">
                                    <div className="bg-gray-900 p-4 flex justify-between items-center">
                                        <MapPin className="text-orange-500 w-5 h-5" />
                                        <div className="flex gap-2">
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-white/50 hover:text-white"><Pencil className="w-3 h-3" /></Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-white/50 hover:text-red-500"><Trash2 className="w-3 h-3" /></Button>
                                        </div>
                                    </div>
                                    <CardContent className="p-6">
                                        <p className="font-black text-gray-900 uppercase text-xs mb-1">{addr.ds_logradouro}, {addr.nu_numero}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{addr.ds_bairro}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{addr.ds_cidade} - {addr.ds_uf}</p>
                                        <div className="mt-4 pt-4 border-t border-gray-50">
                                            <Badge className="bg-gray-100 text-gray-900 hover:bg-gray-100 text-[9px] font-black uppercase">Entrega Padrão</Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            <button onClick={() => setAddressDialogOpen(true)} className="border-4 border-dashed border-gray-200 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 hover:border-orange-500 hover:bg-orange-50 transition-all group">
                                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
                                    <Plus className="w-6 h-6" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-orange-600">Novo Endereço</span>
                            </button>
                        </div>
                    </TabsContent>

                    {/* Conteúdo: Pedidos */}
                    <TabsContent value="pedidos" className="animate-in fade-in slide-in-from-bottom-4">
                        <Card className="rounded-3xl border-none shadow-xl overflow-hidden">
                            <CardContent className="p-0">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-900 text-white">
                                        <tr>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-widest">Pedido</th>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-widest">Data</th>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-widest">Status</th>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-right">Valor Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {orders.map(order => (
                                            <tr key={order.id_venda} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="p-6 font-black text-xs text-gray-900">#{order.nu_nota_fiscal}</td>
                                                <td className="p-6 text-xs font-bold text-gray-500 uppercase">{new Date(order.dt_venda).toLocaleDateString()}</td>
                                                <td className="p-6">
                                                    <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-50 text-[9px] font-black uppercase border-none">
                                                        {order.st_venda}
                                                    </Badge>
                                                </td>
                                                <td className="p-6 text-right font-black text-orange-600">{formatCurrency(order.nu_valor_total_nota)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {orders.length === 0 && (
                                    <div className="p-20 text-center">
                                        <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Nenhum pedido realizado ainda.</p>
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