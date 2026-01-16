import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { __ddmDatabase } from '../api/MysqlServer.js';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    CreditCard, MapPin, Check, ArrowLeft, Loader2, Lock, QrCode, ShoppingBag, Plus, X
} from 'lucide-react';

import { Button } from '../Components/ui/button';
import { Input } from '../Components/ui/input';
import { Label } from '../Components/ui/label';
import { Badge } from '../Components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../Components/ui/card';
import { RadioGroup, RadioGroupItem } from "../Components/ui/radio-group";
import ShippingCalculator from '../Components/shipping/ShippingCalculator';

// --- COMPONENTE VISUAL DO CARTÃO DE CRÉDITO ---
const CreditCardVisual = ({ number, name, expiry, cvv, isFlipped }) => {
    return (
        <div className="relative w-full max-w-sm h-56 perspective-1000 mx-auto mb-8">
            <div className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>

                {/* FRENTE */}
                <div className="absolute w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl shadow-2xl p-6 text-white backface-hidden flex flex-col justify-between border border-gray-700">
                    <div className="flex justify-between items-start">
                        <div className="w-12 h-8 bg-gradient-to-r from-yellow-400 to-yellow-200 rounded-md opacity-80" />
                        <span className="font-black italic tracking-widest text-lg opacity-50">VISA</span>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <p className="text-2xl font-mono tracking-widest drop-shadow-md">
                                {number || '•••• •••• •••• ••••'}
                            </p>
                        </div>
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-1">Titular</p>
                                <p className="font-bold uppercase tracking-wide text-sm truncate max-w-[200px]">
                                    {name || 'NOME DO TITULAR'}
                                </p>
                            </div>
                            <div>
                                <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-1">Validade</p>
                                <p className="font-bold font-mono text-sm">{expiry || 'MM/AA'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* VERSO */}
                <div className="absolute w-full h-full bg-gradient-to-bl from-gray-900 via-gray-800 to-black rounded-2xl shadow-2xl backface-hidden rotate-y-180 border border-gray-700 overflow-hidden">
                    <div className="w-full h-12 bg-black mt-6 opacity-80" />
                    <div className="px-6 mt-6">
                        <div className="flex flex-col items-end">
                            <p className="text-[9px] uppercase tracking-widest text-gray-400 mb-1 mr-1">CVV</p>
                            <div className="w-full h-10 bg-white rounded flex items-center justify-end px-3">
                                <span className="font-mono text-gray-900 font-bold tracking-widest">{cvv || '•••'}</span>
                            </div>
                        </div>
                        <div className="mt-8 flex items-center justify-center opacity-30">
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function Checkout() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    // Estados do Pedido
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [selectedShipping, setSelectedShipping] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('pix');
    const [orderComplete, setOrderComplete] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');

    // Estados do Novo Endereço (Modificado para usar IDs)
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [newAddress, setNewAddress] = useState({
        ds_cep: '',
        ds_logradouro: '',
        nu_numero: '',
        ds_bairro: '',
        id_uf: '',        // ID para o select
        id_municipio: ''  // ID para o select
    });

    // Estados do Cartão
    const [cardData, setCardData] = useState({ number: '', name: '', expiry: '', cvv: '' });
    const [isCardFlipped, setIsCardFlipped] = useState(false);

    // Formatações de Input do Cartão
    const handleCardNumber = (e) => {
        let val = e.target.value.replace(/\D/g, '').substring(0, 16);
        val = val.replace(/(\d{4})/g, '$1 ').trim();
        setCardData({ ...cardData, number: val });
    };
    const handleCardExpiry = (e) => {
        let val = e.target.value.replace(/\D/g, '').substring(0, 4);
        if (val.length >= 2) val = val.substring(0, 2) + '/' + val.substring(2);
        setCardData({ ...cardData, expiry: val });
    };

    // Dados do Usuário
    const user = JSON.parse(localStorage.getItem('ddm_user'));
    const sessionId = localStorage.getItem('ddm_session');

    // --- QUERIES DE DADOS AUXILIARES (Dropdowns) ---

    // 1. Buscar Lista de Estados (UF)
    const { data: ufs = [] } = useQuery({
        queryKey: ['listaUfs'],
        queryFn: () => __ddmDatabase.entities.Ufs.list(),
        staleTime: 1000 * 60 * 60 // Cache de 1 hora
    });

    // 2. Buscar Municípios (Depende do Estado selecionado no newAddress.id_uf)
    const { data: municipios = [], isLoading: loadingMunicipios } = useQuery({
        queryKey: ['listaMunicipios', newAddress.id_uf],
        queryFn: () => __ddmDatabase.entities.Municipios.listByUf(newAddress.id_uf),
        enabled: !!newAddress.id_uf // Só busca se tiver uma UF selecionada
    });

    // --- QUERIES DO CHECKOUT ---

    const { data: addresses = [] } = useQuery({
        queryKey: ['userAddresses', user?.id_usuario],
        queryFn: async () => {
            if (!user?.id_usuario) return [];
            try {
                const list = await __ddmDatabase.entities.Enderecos.list();
                return list.filter(a => a.id_usuario === user.id_usuario);
            } catch (error) {
                return [];
            }
        },
        enabled: !!user?.id_usuario
    });

    const { data: cartItems = [] } = useQuery({
        queryKey: ['cartItems', user?.id_usuario, sessionId],
        queryFn: async () => {
            try {
                const all = await __ddmDatabase.entities.Carrinho.list();
                if (!Array.isArray(all)) return [];
                return user?.id_usuario
                    ? all.filter(i => i.id_usuario === user.id_usuario)
                    : all.filter(i => i.session_id === sessionId);
            } catch (error) {
                console.error("Erro ao buscar carrinho:", error);
                return [];
            }
        }
    });

    // Efeito para selecionar endereço automaticamente se só houver 1
    useEffect(() => {
        if (addresses.length === 1 && !selectedAddress) {
            setSelectedAddress(addresses[0]);
        }
    }, [addresses, selectedAddress]);

    // Mutation para Criar Endereço
    const createAddressMutation = useMutation({
        mutationFn: async (addressData) => {
            return await __ddmDatabase.entities.Enderecos.create({
                ...addressData,
                id_usuario: user.id_usuario
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['userAddresses']);
            setShowAddressForm(false);
            // Reseta o formulário
            setNewAddress({ ds_cep: '', ds_logradouro: '', nu_numero: '', ds_bairro: '', id_uf: '', id_municipio: '' });
        },
        onError: (err) => {
            alert("Erro ao salvar endereço: " + err.message);
        }
    });

    const handleSaveAddress = () => {
        if (!newAddress.ds_cep || !newAddress.ds_logradouro || !newAddress.nu_numero || !newAddress.id_uf || !newAddress.id_municipio) {
            alert("Preencha todos os campos obrigatórios (incluindo Cidade e Estado)");
            return;
        }
        createAddressMutation.mutate(newAddress);
    };

    const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.nu_preco_unitario) * item.nu_quantidade), 0);
    const shippingCost = selectedShipping?.preco || 0;
    const total = subtotal + shippingCost;

    const createOrderMutation = useMutation({
        mutationFn: async () => {
            await new Promise(resolve => setTimeout(resolve, 2000));
            const numeroVenda = `DDM${Date.now().toString().slice(-6)}`;
            const vendaData = {
                id_usuario: user.id_usuario,
                nu_nota_fiscal: numeroVenda,
                nu_valor_total_nota: paymentMethod === 'pix' ? total * 0.95 : total,
                ds_forma_pagamento: paymentMethod,
                st_venda: 'Pendente',
                dt_venda: new Date().toISOString().slice(0, 19).replace('T', ' '),
            };

            await __ddmDatabase.entities.Vendas.create(vendaData);

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

    // TELA DE SUCESSO
    if (orderComplete) {
        return (
            <div className="bg-gray-50 min-h-screen flex items-center justify-center p-6 font-sans">
                <Card className="max-w-lg w-full text-center border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
                    <div className="bg-green-500 h-32 flex items-center justify-center relative">
                         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />
                         <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg animate-in zoom-in duration-500">
                            <Check className="w-10 h-10 text-green-600" />
                        </div>
                    </div>
                    <CardContent className="pt-12 pb-10 px-10">
                        <h2 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter mb-2">Pedido Confirmado!</h2>
                        <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mb-10">DDM Indústria - Processamento Logístico</p>

                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 mb-8 relative group cursor-default hover:bg-white hover:shadow-lg transition-all">
                            <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Número do Protocolo</p>
                            <p className="text-4xl font-black text-gray-900 tracking-tighter group-hover:text-orange-600 transition-colors">{orderNumber}</p>
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <ShoppingBag className="w-12 h-12" />
                            </div>
                        </div>

                        <Button asChild className="w-full h-14 bg-gray-900 hover:bg-orange-600 text-white font-black uppercase tracking-widest rounded-xl text-xs shadow-lg transition-all hover:scale-105">
                            <Link to="/minha-conta">Acompanhar Meus Pedidos</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-24 font-sans">

            {/* HEADER SIMPLIFICADO */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link to="/carrinho" className="flex items-center gap-2 text-gray-500 hover:text-orange-600 font-bold uppercase text-xs tracking-wide transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Voltar ao Carrinho
                    </Link>
                    <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-green-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Checkout Seguro</span>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-10">
                <h1 className="text-4xl font-black text-gray-900 uppercase italic tracking-tighter mb-10">Finalizar <span className="text-orange-500">Compra</span></h1>

                <div className="grid lg:grid-cols-3 gap-12 relative">

                    {/* COLUNA ESQUERDA (ETAPAS) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* 1. ENDEREÇO */}
                        <div className={`transition-all duration-500 ${step === 1 ? 'opacity-100' : 'opacity-40 pointer-events-none grayscale'}`}>
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black shadow-sm ${step >= 1 ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-400'}`}>1</div>
                                <h3 className="font-black text-gray-900 uppercase text-sm tracking-widest">Endereço de Entrega</h3>
                            </div>

                            {step === 1 && (
                                <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 animate-in slide-in-from-left-4">

                                    {/* MODO ADICIONAR ENDEREÇO (OU SE LISTA VAZIA) */}
                                    {(showAddressForm || addresses.length === 0) ? (
                                        <div className="space-y-4 animate-in fade-in zoom-in-95">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-xs font-black uppercase text-gray-900">Novo Endereço</h4>
                                                {addresses.length > 0 && (
                                                    <Button variant="ghost" size="sm" onClick={() => setShowAddressForm(false)}>
                                                        <X className="w-4 h-4 mr-2" /> Cancelar
                                                    </Button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="space-y-2 col-span-1">
                                                    <Label className="text-[10px] font-bold uppercase text-gray-500">CEP</Label>
                                                    <Input
                                                        value={newAddress.ds_cep}
                                                        onChange={(e) => setNewAddress({...newAddress, ds_cep: e.target.value})}
                                                        placeholder="00000-000"
                                                        className="h-11 bg-gray-50 border-gray-200"
                                                    />
                                                </div>

                                                {/* SELETOR DE ESTADO (UF) */}
                                                <div className="space-y-2 col-span-1">
                                                    <Label className="text-[10px] font-bold uppercase text-gray-500">Estado</Label>
                                                    <select
                                                        value={newAddress.id_uf}
                                                        onChange={(e) => setNewAddress({...newAddress, id_uf: e.target.value, id_municipio: ''})} // Reseta cidade ao mudar UF
                                                        className="w-full h-11 px-3 rounded-md border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                    >
                                                        <option value="">Selecione...</option>
                                                        {ufs.map(uf => (
                                                            <option key={uf.id_uf} value={uf.id_uf}>{uf.sg_uf}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* SELETOR DE CIDADE */}
                                                <div className="space-y-2 col-span-1">
                                                    <Label className="text-[10px] font-bold uppercase text-gray-500">Cidade</Label>
                                                    <div className="relative">
                                                        <select
                                                            value={newAddress.id_municipio}
                                                            onChange={(e) => setNewAddress({...newAddress, id_municipio: e.target.value})}
                                                            disabled={!newAddress.id_uf || loadingMunicipios}
                                                            className="w-full h-11 px-3 rounded-md border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                                                        >
                                                            <option value="">Selecione...</option>
                                                            {municipios.map(city => (
                                                                <option key={city.id_municipio} value={city.id_municipio}>{city.ds_cidade}</option>
                                                            ))}
                                                        </select>
                                                        {loadingMunicipios && (
                                                            <Loader2 className="absolute right-3 top-3 w-4 h-4 animate-spin text-gray-400" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-[2fr_1fr] gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold uppercase text-gray-500">Endereço (Rua/Av)</Label>
                                                    <Input
                                                        value={newAddress.ds_logradouro}
                                                        onChange={(e) => setNewAddress({...newAddress, ds_logradouro: e.target.value})}
                                                        placeholder="Ex: Av. Paulista"
                                                        className="h-11 bg-gray-50 border-gray-200"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-bold uppercase text-gray-500">Número</Label>
                                                    <Input
                                                        value={newAddress.nu_numero}
                                                        onChange={(e) => setNewAddress({...newAddress, nu_numero: e.target.value})}
                                                        placeholder="123"
                                                        className="h-11 bg-gray-50 border-gray-200"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-bold uppercase text-gray-500">Bairro</Label>
                                                <Input
                                                    value={newAddress.ds_bairro}
                                                    onChange={(e) => setNewAddress({...newAddress, ds_bairro: e.target.value})}
                                                    placeholder="Ex: Centro"
                                                    className="h-11 bg-gray-50 border-gray-200"
                                                />
                                            </div>

                                            <Button
                                                onClick={handleSaveAddress}
                                                disabled={createAddressMutation.isPending}
                                                className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold h-12 rounded-xl uppercase tracking-wider text-xs"
                                            >
                                                {createAddressMutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : "Salvar Endereço"}
                                            </Button>
                                        </div>
                                    ) : (
                                        // LISTA DE ENDEREÇOS EXISTENTES
                                        <>
                                            <RadioGroup value={selectedAddress?.id_usuario_endereco} onValueChange={(val) => setSelectedAddress(addresses.find(a => a.id_usuario_endereco == val))}>
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    {addresses.map(addr => (
                                                        <div key={addr.id_usuario_endereco} className="relative">
                                                            <RadioGroupItem value={addr.id_usuario_endereco} id={`addr-${addr.id_usuario_endereco}`} className="peer sr-only" />
                                                            <Label
                                                                htmlFor={`addr-${addr.id_usuario_endereco}`}
                                                                className="flex flex-col p-5 rounded-2xl border-2 border-gray-100 bg-gray-50 peer-checked:border-orange-500 peer-checked:bg-orange-50 cursor-pointer transition-all hover:border-orange-200 h-full"
                                                            >
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <MapPin className="w-5 h-5 text-gray-400 peer-checked:text-orange-500" />
                                                                    {selectedAddress?.id_usuario_endereco === addr.id_usuario_endereco && <Check className="w-5 h-5 text-orange-600" />}
                                                                </div>
                                                                <p className="font-black text-gray-900 text-xs uppercase mb-1">{addr.ds_endereco}</p>
                                                                <p className="text-[10px] font-bold text-gray-400 uppercase">{addr.ds_bairro} • CEP: {addr.nu_cep}</p>
                                                                <p className="text-[10px] font-bold text-gray-400 uppercase">{addr.ds_cidade} / {addr.ds_uf}</p>
                                                            </Label>
                                                        </div>
                                                    ))}

                                                    {/* Botão de Adicionar Novo na Grid */}
                                                    <button
                                                        onClick={() => setShowAddressForm(true)}
                                                        className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50 transition-all cursor-pointer h-full min-h-[120px]"
                                                    >
                                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                                                            <Plus className="w-5 h-5 text-gray-500" />
                                                        </div>
                                                        <span className="text-[10px] font-bold uppercase text-gray-500">Novo Endereço</span>
                                                    </button>
                                                </div>
                                            </RadioGroup>

                                            <Button
                                                onClick={() => setStep(2)}
                                                disabled={!selectedAddress}
                                                className="w-full mt-6 bg-gray-900 hover:bg-gray-800 text-white font-black h-12 rounded-xl uppercase tracking-widest text-[10px]"
                                            >
                                                Continuar para Frete
                                            </Button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* 2. FRETE */}
                        <div className={`transition-all duration-500 ${step === 2 ? 'opacity-100' : 'opacity-40 pointer-events-none grayscale'}`}>
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black shadow-sm ${step >= 2 ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-400'}`}>2</div>
                                <h3 className="font-black text-gray-900 uppercase text-sm tracking-widest">Opções de Envio</h3>
                            </div>

                            {step === 2 && (
                                <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 animate-in slide-in-from-left-4">
                                    <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
                                        <MapPin className="w-4 h-4 text-orange-500" />
                                        <div className="text-xs">
                                            <span className="text-gray-400 font-bold uppercase mr-2">Entregar em:</span>
                                            <span className="font-black text-gray-900 uppercase">{selectedAddress?.ds_endereco} - {selectedAddress?.ds_cidade}/{selectedAddress?.ds_uf}</span>
                                        </div>
                                    </div>

                                    <ShippingCalculator
                                        id_produto={cartItems[0]?.id_produto}
                                        onSelectShipping={setSelectedShipping}
                                        selectedShipping={selectedShipping}
                                        compact
                                    />

                                    <div className="flex gap-4 mt-6">
                                        <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12 rounded-xl font-bold uppercase text-[10px]">Voltar</Button>
                                        <Button onClick={() => setStep(3)} disabled={!selectedShipping} className="flex-[2] bg-gray-900 text-white font-black h-12 rounded-xl uppercase tracking-widest text-[10px]">Ir para Pagamento</Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 3. PAGAMENTO */}
                        <div className={`transition-all duration-500 ${step === 3 ? 'opacity-100' : 'opacity-40 pointer-events-none grayscale'}`}>
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black shadow-sm ${step >= 3 ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-400'}`}>3</div>
                                <h3 className="font-black text-gray-900 uppercase text-sm tracking-widest">Pagamento Seguro</h3>
                            </div>

                            {step === 3 && (
                                <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 animate-in slide-in-from-left-4">

                                    {/* SELETOR DE MÉTODO */}
                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <div
                                            onClick={() => setPaymentMethod('pix')}
                                            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center gap-3 ${paymentMethod === 'pix' ? 'border-green-500 bg-green-50 shadow-md' : 'border-gray-100 hover:bg-gray-50'}`}
                                        >
                                            <QrCode className={`w-8 h-8 ${paymentMethod === 'pix' ? 'text-green-600' : 'text-gray-300'}`} />
                                            <div className="text-center">
                                                <p className="text-xs font-black uppercase text-gray-900">PIX</p>
                                                <p className="text-[10px] font-bold text-green-600 uppercase tracking-tight">5% de Desconto</p>
                                            </div>
                                        </div>
                                        <div
                                            onClick={() => setPaymentMethod('cartao')}
                                            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center gap-3 ${paymentMethod === 'cartao' ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-100 hover:bg-gray-50'}`}
                                        >
                                            <CreditCard className={`w-8 h-8 ${paymentMethod === 'cartao' ? 'text-blue-600' : 'text-gray-300'}`} />
                                            <div className="text-center">
                                                <p className="text-xs font-black uppercase text-gray-900">Cartão</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Até 12x</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* FORMULÁRIO DO CARTÃO (SÓ APARECE SELECIONADO) */}
                                    {paymentMethod === 'cartao' && (
                                        <div className="animate-in fade-in slide-in-from-top-4 mb-8">

                                            {/* CARTÃO VISUAL 3D */}
                                            <CreditCardVisual
                                                number={cardData.number}
                                                name={cardData.name}
                                                expiry={cardData.expiry}
                                                cvv={cardData.cvv}
                                                isFlipped={isCardFlipped}
                                            />

                                            <div className="grid gap-6 max-w-sm mx-auto">
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Número do Cartão</Label>
                                                    <Input
                                                        value={cardData.number}
                                                        onChange={handleCardNumber}
                                                        maxLength={19}
                                                        placeholder="0000 0000 0000 0000"
                                                        onFocus={() => setIsCardFlipped(false)}
                                                        className="h-12 rounded-xl bg-gray-50 border-gray-200 font-mono text-sm tracking-wider"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Nome no Cartão</Label>
                                                    <Input
                                                        value={cardData.name}
                                                        onChange={(e) => setCardData({...cardData, name: e.target.value.toUpperCase()})}
                                                        placeholder="COMO ESTÁ NO CARTÃO"
                                                        onFocus={() => setIsCardFlipped(false)}
                                                        className="h-12 rounded-xl bg-gray-50 border-gray-200 font-bold uppercase text-xs"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Validade</Label>
                                                        <Input
                                                            value={cardData.expiry}
                                                            onChange={handleCardExpiry}
                                                            maxLength={5}
                                                            placeholder="MM/AA"
                                                            onFocus={() => setIsCardFlipped(false)}
                                                            className="h-12 rounded-xl bg-gray-50 border-gray-200 font-mono text-sm text-center"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">CVV</Label>
                                                        <Input
                                                            value={cardData.cvv}
                                                            onChange={(e) => setCardData({...cardData, cvv: e.target.value.replace(/\D/g, '').substring(0, 3)})}
                                                            maxLength={3}
                                                            placeholder="123"
                                                            onFocus={() => setIsCardFlipped(true)}
                                                            onBlur={() => setIsCardFlipped(false)}
                                                            className="h-12 rounded-xl bg-gray-50 border-gray-200 font-mono text-sm text-center tracking-widest"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-4">
                                        <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-14 rounded-xl font-bold uppercase text-[10px]">Voltar</Button>
                                        <Button
                                            onClick={() => createOrderMutation.mutate()}
                                            disabled={createOrderMutation.isPending || (paymentMethod === 'cartao' && (!cardData.number || !cardData.cvv))}
                                            className="flex-[2] h-14 bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-green-600/20"
                                        >
                                            {createOrderMutation.isPending ? <Loader2 className="animate-spin" /> : "Finalizar Pedido Agora"}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* COLUNA DIREITA (RESUMO FIXO) */}
                    <div>
                        <div className="sticky top-32 space-y-6">
                            <Card className="rounded-[2rem] border-none shadow-2xl shadow-gray-200/50 bg-white overflow-hidden">
                                <CardHeader className="bg-gray-950 text-white p-6 flex flex-row items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <ShoppingBag className="w-5 h-5 text-orange-500" />
                                        <CardTitle className="text-xs font-black uppercase tracking-[0.2em]">Resumo</CardTitle>
                                    </div>
                                    <Badge className="bg-white/10 text-white text-[9px] font-bold">{cartItems.length} Itens</Badge>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-4 max-h-60 overflow-y-auto pr-2 mb-6 custom-scrollbar">
                                        {cartItems.map(item => (
                                            <div key={item.id_carrinho} className="flex justify-between items-start text-xs border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                                                <div>
                                                    <p className="font-bold text-gray-900 uppercase truncate max-w-[150px]">{item.ds_nome}</p>
                                                    <p className="text-[10px] text-gray-400 font-medium">Qtd: {item.nu_quantidade}</p>
                                                </div>
                                                <span className="font-bold text-gray-900">{formatCurrency(item.nu_preco_unitario * item.nu_quantidade)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                        <div className="flex justify-between text-[11px] font-bold uppercase text-gray-500">
                                            <span>Subtotal</span>
                                            <span>{formatCurrency(subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-[11px] font-bold uppercase text-gray-500">
                                            <span>Frete</span>
                                            <span className={selectedShipping ? "text-gray-900" : "text-orange-500"}>
                                                {selectedShipping ? formatCurrency(shippingCost) : "A calcular"}
                                            </span>
                                        </div>
                                        {paymentMethod === 'pix' && (
                                            <div className="flex justify-between text-[11px] font-bold uppercase text-green-600">
                                                <span>Desconto PIX (5%)</span>
                                                <span>- {formatCurrency(total * 0.05)}</span>
                                            </div>
                                        )}
                                        <div className="pt-3 mt-3 border-t border-gray-200 flex justify-between items-end">
                                            <span className="font-black text-xs uppercase text-gray-900">Total</span>
                                            <span className="text-2xl font-black text-orange-600 tracking-tighter leading-none">
                                                {formatCurrency(paymentMethod === 'pix' ? total * 0.95 : total)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-6 flex items-center justify-center gap-2 opacity-50">
                                        <Lock className="w-3 h-3 text-gray-400" />
                                        <span className="text-[9px] font-bold uppercase text-gray-400 tracking-widest">Compra 100% Segura</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}