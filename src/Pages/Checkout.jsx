import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { __ddmDatabase, getFullImageUrl } from '../api/MysqlServer.js';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    CreditCard, MapPin, Truck, ShoppingBag, Check,
    ArrowLeft, Loader2, Shield, Lock, QrCode,
    Plus, ChevronRight, Barcode
} from 'lucide-react';

import { Button } from '../Components/ui/button';
import { Input } from '../Components/ui/input';
import { Label } from '../Components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../Components/ui/card';
import { Badge } from '../Components/ui/badge';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from "../Components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../Components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Components/ui/select";
import ShippingCalculator from '../Components/shipping/ShippingCalculator';

const ESTADOS_BR = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];

export default function Checkout() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [selectedShipping, setSelectedShipping] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('pix');
    const [orderComplete, setOrderComplete] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');
    const [showAddressDialog, setShowAddressDialog] = useState(false);

    // Pega usuário logado real
    // Busca o usuário que salvamos no LocalStorage durante o Login
    const user = JSON.parse(localStorage.getItem('ddm_user'));

    // Opcional: Se não houver usuário, redireciona para login
    if (!user || user.id_perfil !== 1) {
        window.location.href = '/login';
    }
    const sessionId = localStorage.getItem('ddm_session');

    // Busca Endereços Reais do Banco
    const { data: addresses = [], refetch: refetchAddresses } = useQuery({
        queryKey: ['userAddresses', user?.id_usuario],
        queryFn: async () => {
            const list = await __ddmDatabase.entities.Enderecos.list();
            return list.filter(a => a.id_usuario === user.id_usuario);
        },
        enabled: !!user?.id_usuario
    });

    // Busca Itens do Carrinho Reais
    const { data: cartItems = [] } = useQuery({
        queryKey: ['cartItems', user?.id_usuario, sessionId],
        queryFn: async () => {
            const all = await __ddmDatabase.entities.Carrinho.list();
            return user?.id_usuario ? all.filter(i => i.id_usuario === user.id_usuario) : all.filter(i => i.session_id === sessionId);
        }
    });

    // Cálculos Financeiros
    const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.nu_preco_unitario) * item.nu_quantidade), 0);
    const shippingCost = selectedShipping?.preco || 0;
    const total = subtotal + shippingCost;

    // Mutação para Gerar o Pedido na tb_venda
    const createOrderMutation = useMutation({
        mutationFn: async () => {
            const numeroVenda = `DDM${Date.now().toString().slice(-6)}`;
            
            const vendaData = {
                id_usuario: user.id_usuario,
                nu_nota_fiscal: numeroVenda, // Usando como número de pedido temporário
                nu_valor_total_nota: paymentMethod === 'pix' ? total * 0.95 : total,
                ds_forma_pagamento: paymentMethod,
                st_venda: 'Pendente',
                dt_venda: new Date().toISOString().slice(0, 19).replace('T', ' '),
                // Dados extras seriam enviados para uma tabela de id_venda_item via backend
            };

            const response = await __ddmDatabase.entities.Vendas.create(vendaData);
            
            // Limpa o carrinho após sucesso
            for (const item of cartItems) {
                await __ddmDatabase.entities.Carrinho.delete(item.id_carrinho);
            }
            window.dispatchEvent(new Event('cartUpdated'));
            return numeroVenda;
        },
        onSuccess: (numero) => {
            setOrderNumber(numero);
            setOrderComplete(true);
            queryClient.invalidateQueries({ queryKey: ['cartItems'] });
        }
    });

    const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

    if (orderComplete) {
        return (
            <div className="bg-gray-50 min-h-screen flex items-center justify-center p-6">
                <Card className="max-w-lg w-full text-center border-t-8 border-t-green-500 rounded-3xl shadow-2xl">
                    <CardContent className="pt-12 pb-10 px-8">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter mb-2">Pedido Confirmado!</h2>
                        <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mb-8">DDM Indústria - Processamento Logístico</p>
                        
                        <div className="bg-gray-900 rounded-2xl p-6 mb-8 text-white">
                            <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Número do Protocolo</p>
                            <p className="text-3xl font-black text-orange-500 tracking-widest">{orderNumber}</p>
                        </div>

                        <Button asChild className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-widest rounded-xl">
                            <Link to="/minha-conta">Acompanhar Pedido</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Header Checkout Dark */}
            <section className="bg-gray-900 py-10 border-b-4 border-orange-500">
                <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/carrinho" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6 text-white" />
                        </Link>
                        <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">Finalizar <span className="text-orange-500">Compra</span></h1>
                    </div>
                    <div className="hidden md:flex items-center gap-2">
                        <Lock className="w-4 h-4 text-orange-500" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Ambiente Criptografado</span>
                    </div>
                </div>
            </section>

            <div className="max-w-6xl mx-auto px-6 py-12">
                <div className="grid lg:grid-cols-3 gap-10">
                    
                    {/* Coluna de Etapas */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* Passo 1: Endereço */}
                        <Card className={`rounded-2xl border-2 transition-all ${step === 1 ? 'border-orange-500 shadow-lg' : 'border-gray-100 opacity-60'}`}>
                            <CardHeader className="flex flex-row items-center gap-4 p-6 border-b">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${step >= 1 ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>1</div>
                                <CardTitle className="text-sm font-black uppercase tracking-widest">Endereço de Entrega</CardTitle>
                            </CardHeader>
                            {step === 1 && (
                                <CardContent className="p-6 space-y-4">
                                    <RadioGroup value={selectedAddress?.id_usuario_endereco} onValueChange={(val) => setSelectedAddress(addresses.find(a => a.id_usuario_endereco == val))}>
                                        {addresses.map(addr => (
                                            <div key={addr.id_usuario_endereco} className="flex items-center space-x-4 p-4 rounded-xl border-2 border-gray-100 hover:border-orange-200 cursor-pointer">
                                                <RadioGroupItem value={addr.id_usuario_endereco} id={addr.id_usuario_endereco} />
                                                <Label htmlFor={addr.id_usuario_endereco} className="flex-1 cursor-pointer">
                                                    <p className="font-black text-gray-900 uppercase text-xs">{addr.ds_logradouro}, {addr.nu_numero}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase">{addr.ds_bairro} - {addr.ds_cidade}/{addr.ds_uf}</p>
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                    <Button onClick={() => setStep(2)} disabled={!selectedAddress} className="w-full bg-gray-900 text-white font-black h-12 rounded-xl uppercase tracking-widest text-[10px]">Continuar para Entrega</Button>
                                </CardContent>
                            )}
                        </Card>

                        {/* Passo 2: Entrega */}
                        <Card className={`rounded-2xl border-2 transition-all ${step === 2 ? 'border-orange-500 shadow-lg' : 'border-gray-100 opacity-60'}`}>
                            <CardHeader className="flex flex-row items-center gap-4 p-6 border-b">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${step >= 2 ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>2</div>
                                <CardTitle className="text-sm font-black uppercase tracking-widest">Modalidade de Envio</CardTitle>
                            </CardHeader>
                            {step === 2 && (
                                <CardContent className="p-6">
                                    <ShippingCalculator 
                                        id_produto={cartItems[0]?.id_produto}
                                        onSelectShipping={setSelectedShipping} 
                                        selectedShipping={selectedShipping}
                                        compact
                                    />
                                    <Button onClick={() => setStep(3)} disabled={!selectedShipping} className="w-full bg-gray-900 text-white font-black h-12 rounded-xl uppercase tracking-widest text-[10px] mt-6">Escolher Pagamento</Button>
                                </CardContent>
                            )}
                        </Card>

                        {/* Passo 3: Pagamento */}
                        <Card className={`rounded-2xl border-2 transition-all ${step === 3 ? 'border-orange-500 shadow-lg' : 'border-gray-100 opacity-60'}`}>
                            <CardHeader className="flex flex-row items-center gap-4 p-6 border-b">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${step >= 3 ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}>3</div>
                                <CardTitle className="text-sm font-black uppercase tracking-widest">Pagamento Seguro</CardTitle>
                            </CardHeader>
                            {step === 3 && (
                                <CardContent className="p-6 space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div onClick={() => setPaymentMethod('pix')} className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 ${paymentMethod === 'pix' ? 'border-green-500 bg-green-50' : 'border-gray-100'}`}>
                                            <QrCode className={paymentMethod === 'pix' ? 'text-green-600' : 'text-gray-300'} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">PIX (-5%)</span>
                                        </div>
                                        <div onClick={() => setPaymentMethod('cartao')} className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center gap-2 ${paymentMethod === 'cartao' ? 'border-blue-500 bg-blue-50' : 'border-gray-100'}`}>
                                            <CreditCard className={paymentMethod === 'cartao' ? 'text-blue-600' : 'text-gray-300'} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Cartão de Crédito</span>
                                        </div>
                                    </div>
                                    <Button 
                                        onClick={() => createOrderMutation.mutate()} 
                                        disabled={createOrderMutation.isPending}
                                        className="w-full h-16 bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-green-600/20"
                                    >
                                        {createOrderMutation.isPending ? <Loader2 className="animate-spin" /> : "Finalizar Pedido Agora"}
                                    </Button>
                                </CardContent>
                            )}
                        </Card>
                    </div>

                    {/* Resumo Lateral */}
                    <div className="space-y-6">
                        <Card className="rounded-3xl border-2 border-gray-900 shadow-xl overflow-hidden sticky top-10">
                            <CardHeader className="bg-gray-900 text-white p-6 flex flex-row items-center justify-between">
                                <CardTitle className="text-xs font-black uppercase tracking-widest italic">Resumo</CardTitle>
                                <ShoppingBag className="w-5 h-5 text-orange-500" />
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
                                    {cartItems.map(item => (
                                        <div key={item.id_carrinho} className="flex justify-between text-[11px] font-bold">
                                            <span className="text-gray-500 uppercase truncate pr-4">{item.nu_quantidade}x {item.ds_nome}</span>
                                            <span className="text-gray-900 whitespace-nowrap">{formatCurrency(item.nu_preco_unitario * item.nu_quantidade)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-4 border-t-2 border-dashed border-gray-100 space-y-2">
                                    <div className="flex justify-between text-[11px] font-black uppercase">
                                        <span className="text-gray-400">Frete</span>
                                        <span className="text-gray-900">{selectedShipping ? formatCurrency(shippingCost) : "A calcular"}</span>
                                    </div>
                                    <div className="flex justify-between items-baseline pt-2">
                                        <span className="font-black text-xs uppercase text-gray-900">Total</span>
                                        <span className="text-2xl font-black text-orange-600 tracking-tighter">
                                            {formatCurrency(paymentMethod === 'pix' ? total * 0.95 : total)}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}