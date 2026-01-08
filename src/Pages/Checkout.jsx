import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { base44 } from '../api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    CreditCard, MapPin, Truck, ShoppingBag, Check,
    ArrowLeft, Loader2, Shield, Lock, QrCode, FileText,
    Plus, ChevronRight, Barcode
} from 'lucide-react';

import { Button } from '../Components/ui/button';
import { Input } from '../Components/ui/input';
import { Label } from '../Components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../Components/ui/card';
import { Badge } from '../Components/ui/badge';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from "../Components/ui/radio-group";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../Components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../Components/ui/select";
import ShippingCalculator from '../Components/shipping/ShippingCalculator'; // Ajuste de casing se necessário

const ESTADOS_BR = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

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

    // Estado do formulário de endereço
    const [addressForm, setAddressForm] = useState({
        apelido: '', cep: '', logradouro: '', numero: '',
        complemento: '', bairro: '', cidade: '', estado: ''
    });

    // Estado do Cartão de Crédito (NOVO)
    const [cardData, setCardData] = useState({
        number: '',
        name: '',
        expiry: '',
        cvv: '',
        installments: '1'
    });

    // Funções de formatação de cartão (NOVO)
    const handleCardNumber = (e) => {
        let val = e.target.value.replace(/\D/g, '');
        val = val.replace(/(\d{4})/g, '$1 ').trim();
        setCardData({ ...cardData, number: val.substring(0, 19) });
    };

    const handleExpiry = (e) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length >= 2) val = val.substring(0, 2) + '/' + val.substring(2, 4);
        setCardData({ ...cardData, expiry: val });
    };

    const { data: user, isLoading: userLoading } = useQuery({
        queryKey: ['currentUser'],
        queryFn: async () => {
            // MOCK DE AUTENTICAÇÃO
            return {
                email: "usuario@teste.com",
                full_name: "Cliente Teste",
                enderecos: []
            }
        }
    });

    const sessionId = localStorage.getItem('ddm_session');

    const { data: cartItems, isLoading: cartLoading } = useQuery({
        queryKey: ['cartItems', user?.email, sessionId],
        queryFn: async () => {
            const allItems = await base44.entities.CartItem.list();
            if (user?.email) {
                return allItems.filter(item => item.user_email === user.email);
            } else if (sessionId) {
                return allItems.filter(item => item.session_id === sessionId);
            }
            return [];
        },
        initialData: []
    });

    useEffect(() => {
        if (user?.enderecos?.length > 0 && !selectedAddress) {
            const principal = user.enderecos.find(a => a.principal) || user.enderecos[0];
            setSelectedAddress(principal);
        }
    }, [user]);

    // Cálculos de totais
    const subtotal = cartItems.reduce((sum, item) =>
        sum + (item.preco_unitario * item.quantidade), 0
    );
    const totalWeight = cartItems.reduce((sum, item) =>
        sum + ((item.peso_kg || 0.5) * item.quantidade), 0
    );
    const shippingCost = selectedShipping?.preco || 0;
    const total = subtotal + shippingCost;

    const createOrderMutation = useMutation({
        mutationFn: async () => {
            // Validação simples do cartão se for o método escolhido
            if (paymentMethod === 'cartao') {
                if (cardData.number.length < 19 || !cardData.name || cardData.expiry.length < 5 || cardData.cvv.length < 3) {
                    throw new Error("Dados do cartão incompletos");
                }
            }

            const numero = `DDM${Date.now().toString().slice(-8)}`;

            const orderData = {
                numero_pedido: numero,
                user_email: user.email,
                status: 'pendente',
                itens: cartItems.map(item => ({
                    produto_id: item.produto_id,
                    produto_nome: item.produto_nome,
                    num_ddm: item.num_ddm,
                    imagem_url: item.imagem_url,
                    quantidade: item.quantidade,
                    preco_unitario: item.preco_unitario,
                    subtotal: item.preco_unitario * item.quantidade
                })),
                subtotal,
                frete: selectedShipping.preco,
                frete_modalidade: selectedShipping.nome,
                frete_prazo: `${selectedShipping.prazo_min} a ${selectedShipping.prazo_max} dias úteis`,
                total: paymentMethod === 'pix' ? total * 0.95 : total,
                endereco_entrega: {
                    cep: selectedAddress.cep,
                    logradouro: selectedAddress.logradouro,
                    numero: selectedAddress.numero,
                    complemento: selectedAddress.complemento,
                    bairro: selectedAddress.bairro,
                    cidade: selectedAddress.cidade,
                    estado: selectedAddress.estado
                },
                forma_pagamento: paymentMethod,
                detalhes_pagamento: paymentMethod === 'cartao' ? {
                    ...cardData,
                    number: `**** **** **** ${cardData.number.slice(-4)}` // Salvar mascarado por segurança
                } : {}
            };

            await base44.entities.Order.create(orderData);

            // Clear cart
            for (const item of cartItems) {
                await base44.entities.CartItem.delete(item.id);
            }
            window.dispatchEvent(new Event('cartUpdated'));

            return numero;
        },
        onSuccess: (numero) => {
            setOrderNumber(numero);
            setOrderComplete(true);
            queryClient.invalidateQueries({ queryKey: ['cartItems'] });
        },
        onError: (err) => {
            toast.error(err.message || 'Erro ao processar pedido. Tente novamente.');
        }
    });

    const saveAddressMutation = useMutation({
        mutationFn: async () => {
            const newAddress = { ...addressForm, id: `addr_${Date.now()}` };
            return newAddress;
        },
        onSuccess: (newAddress) => {
            queryClient.setQueryData(['currentUser'], (old) => ({
                ...old,
                enderecos: [...(old.enderecos || []), newAddress]
            }));
            setSelectedAddress(newAddress);
            setShowAddressDialog(false);
            toast.success('Endereço salvo com sucesso!');
        }
    });

    const fetchAddressByCep = async (cep) => {
        const cleanCep = cep.replace(/\D/g, '');
        if (cleanCep.length !== 8) return;
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
            const data = await response.json();
            if (!data.erro) {
                setAddressForm(prev => ({
                    ...prev,
                    logradouro: data.logradouro || '',
                    bairro: data.bairro || '',
                    cidade: data.localidade || '',
                    estado: data.uf || ''
                }));
            }
        } catch (e) { }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    // Renderização Condicional
    if (!userLoading && !user) {
        return (
            <div className="bg-gray-50 min-h-screen flex items-center justify-center">
                <Card className="max-w-md mx-4 text-center">
                    <CardContent className="pt-8 pb-6">
                        <Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Faça login para continuar</h2>
                        <p className="text-gray-500 mb-6">Você precisa estar logado para finalizar sua compra</p>
                        <Button
                            className="bg-orange-500 hover:bg-orange-600 w-full"
                            onClick={() => navigate('/login')}
                        >
                            Entrar na Minha Conta
                        </Button>
                        <Link to="/carrinho">
                            <Button variant="ghost" className="w-full mt-2">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Voltar ao Carrinho
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (orderComplete) {
        return (
            <div className="bg-gray-50 min-h-screen flex items-center justify-center py-12">
                <Card className="max-w-lg mx-4 text-center">
                    <CardContent className="pt-12 pb-8">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="w-10 h-10 text-green-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Pedido Realizado!
                        </h2>
                        <p className="text-gray-500 mb-4">
                            Seu pedido foi recebido com sucesso
                        </p>
                        <div className="bg-gray-50 rounded-xl p-4 mb-6">
                            <p className="text-sm text-gray-500">Número do pedido</p>
                            <p className="text-2xl font-bold text-orange-600">{orderNumber}</p>
                        </div>
                        <p className="text-sm text-gray-500 mb-6">
                            Enviamos um e-mail de confirmação para {user?.email}
                        </p>
                        <div className="space-y-3">
                            <Link to="/minha-conta?tab=pedidos">
                                <Button className="w-full bg-orange-500 hover:bg-orange-600">
                                    Ver Meus Pedidos
                                </Button>
                            </Link>
                            <Link to="/catalogo">
                                <Button variant="outline" className="w-full">
                                    Continuar Comprando
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (cartLoading || userLoading) {
        return (
            <div className="bg-gray-50 min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="bg-gray-50 min-h-screen flex items-center justify-center">
                <Card className="max-w-md mx-4 text-center">
                    <CardContent className="pt-8 pb-6">
                        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Carrinho vazio</h2>
                        <p className="text-gray-500 mb-6">Adicione produtos ao carrinho para continuar</p>
                        <Link to="/catalogo">
                            <Button className="bg-orange-500 hover:bg-orange-600">
                                Ver Produtos
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <section className="bg-gray-900 py-6">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="flex items-center gap-4">
                        <Link to="/carrinho">
                            <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-white">Finalizar Compra</h1>
                            <p className="text-gray-400 text-sm">Passo {step} de 3</p>
                        </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="flex items-center gap-2 mt-6">
                        {[
                            { num: 1, label: 'Endereço', icon: MapPin },
                            { num: 2, label: 'Entrega', icon: Truck },
                            { num: 3, label: 'Pagamento', icon: CreditCard }
                        ].map((s, idx) => (
                            <React.Fragment key={s.num}>
                                <div
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full ${step >= s.num ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-400'
                                        }`}
                                >
                                    <s.icon className="w-4 h-4" />
                                    <span className="text-sm font-medium hidden sm:inline">{s.label}</span>
                                </div>
                                {idx < 2 && <ChevronRight className="w-4 h-4 text-gray-600" />}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </section>

            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Step 1: Address */}
                        {step === 1 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-orange-500" />
                                        Endereço de Entrega
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {user?.enderecos?.length > 0 ? (
                                        <RadioGroup
                                            value={selectedAddress?.id}
                                            onValueChange={(id) => {
                                                const addr = user.enderecos.find(a => a.id === id);
                                                setSelectedAddress(addr);
                                            }}
                                        >
                                            {user.enderecos.map((addr) => (
                                                <div
                                                    key={addr.id}
                                                    className={`flex items-start space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddress?.id === addr.id
                                                        ? 'border-orange-500 bg-orange-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                    onClick={() => setSelectedAddress(addr)}
                                                >
                                                    <RadioGroupItem value={addr.id} id={addr.id} className="mt-1" />
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-semibold">{addr.apelido || 'Endereço'}</span>
                                                            {addr.principal && (
                                                                <Badge className="bg-orange-500 text-white text-xs">Principal</Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {addr.logradouro}, {addr.numero}
                                                            {addr.complemento && ` - ${addr.complemento}`}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            {addr.bairro} - {addr.cidade}/{addr.estado}
                                                        </p>
                                                        <p className="text-sm text-gray-500">CEP: {addr.cep}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    ) : (
                                        <div className="text-center py-6">
                                            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500">Nenhum endereço cadastrado</p>
                                        </div>
                                    )}

                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => setShowAddressDialog(true)}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Adicionar Novo Endereço
                                    </Button>

                                    <Button
                                        className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-lg font-semibold"
                                        disabled={!selectedAddress}
                                        onClick={() => setStep(2)}
                                    >
                                        Continuar
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 2: Shipping */}
                        {step === 2 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Truck className="w-5 h-5 text-orange-500" />
                                        Escolha a Entrega
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                        <p className="text-sm text-gray-500 mb-1">Entregar em:</p>
                                        <p className="font-medium">
                                            {selectedAddress?.logradouro}, {selectedAddress?.numero} - {selectedAddress?.cidade}/{selectedAddress?.estado}
                                        </p>
                                        <p className="text-sm text-gray-500">CEP: {selectedAddress?.cep}</p>
                                    </div>

                                    <ShippingCalculator
                                        weightKg={totalWeight}
                                        onSelectShipping={setSelectedShipping}
                                        selectedShipping={selectedShipping}
                                        compact
                                    />

                                    <div className="flex gap-3 mt-6">
                                        <Button variant="outline" onClick={() => setStep(1)}>
                                            Voltar
                                        </Button>
                                        <Button
                                            className="flex-1 h-12 bg-orange-500 hover:bg-orange-600 text-lg font-semibold"
                                            disabled={!selectedShipping}
                                            onClick={() => setStep(3)}
                                        >
                                            Continuar
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Step 3: Payment */}
                        {step === 3 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="w-5 h-5 text-orange-500" />
                                        Forma de Pagamento
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {/* Métodos de Pagamento (GRID) */}
                                    <div className="grid grid-cols-3 gap-3 mb-6">
                                        <button
                                            onClick={() => setPaymentMethod('cartao')}
                                            className={`flex flex-col items-center justify-center p-4 border rounded-xl transition-all ${
                                                paymentMethod === 'cartao' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            <CreditCard className="w-6 h-6 mb-2" />
                                            <span className="text-sm font-medium">Cartão</span>
                                        </button>
                                        <button
                                            onClick={() => setPaymentMethod('pix')}
                                            className={`flex flex-col items-center justify-center p-4 border rounded-xl transition-all ${
                                                paymentMethod === 'pix' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            <QrCode className="w-6 h-6 mb-2" />
                                            <span className="text-sm font-medium">Pix (-5%)</span>
                                        </button>
                                        <button
                                            onClick={() => setPaymentMethod('boleto')}
                                            className={`flex flex-col items-center justify-center p-4 border rounded-xl transition-all ${
                                                paymentMethod === 'boleto' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            <Barcode className="w-6 h-6 mb-2" />
                                            <span className="text-sm font-medium">Boleto</span>
                                        </button>
                                    </div>

                                    {/* Formulário do Cartão */}
                                    {paymentMethod === 'cartao' && (
                                        <div className="bg-gray-50 p-6 rounded-xl border animate-in fade-in slide-in-from-top-4 mb-6">
                                            <div className="grid gap-4">
                                                <div className="space-y-2">
                                                    <Label>Número do Cartão</Label>
                                                    <div className="relative">
                                                        <Input
                                                            placeholder="0000 0000 0000 0000"
                                                            value={cardData.number}
                                                            onChange={handleCardNumber}
                                                            maxLength={19}
                                                            className="pl-10 font-mono bg-white"
                                                        />
                                                        <CreditCard className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Nome Impresso no Cartão</Label>
                                                    <Input
                                                        placeholder="COMO NO CARTAO"
                                                        value={cardData.name}
                                                        onChange={(e) => setCardData({...cardData, name: e.target.value.toUpperCase()})}
                                                        className="bg-white"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>Validade (MM/AA)</Label>
                                                        <Input
                                                            placeholder="MM/AA"
                                                            value={cardData.expiry}
                                                            onChange={handleExpiry}
                                                            maxLength={5}
                                                            className="bg-white"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>CVV</Label>
                                                        <div className="relative">
                                                            <Input
                                                                placeholder="123"
                                                                maxLength={4}
                                                                className="pl-10 bg-white"
                                                                value={cardData.cvv}
                                                                onChange={(e) => setCardData({...cardData, cvv: e.target.value.replace(/\D/g, '')})}
                                                            />
                                                            <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Parcelamento</Label>
                                                    <Select
                                                        value={cardData.installments}
                                                        onValueChange={(val) => setCardData({...cardData, installments: val})}
                                                    >
                                                        <SelectTrigger className="bg-white">
                                                            <SelectValue placeholder="Selecione" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="1">1x sem juros - {formatCurrency(total)}</SelectItem>
                                                            <SelectItem value="2">2x sem juros - {formatCurrency(total/2)}</SelectItem>
                                                            <SelectItem value="3">3x sem juros - {formatCurrency(total/3)}</SelectItem>
                                                            <SelectItem value="4">4x com juros</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Resumo PIX */}
                                    {paymentMethod === 'pix' && (
                                        <div className="text-center py-6 bg-green-50 rounded-xl border border-dashed border-green-300 mb-6">
                                            <QrCode className="w-12 h-12 mx-auto text-green-600 mb-2" />
                                            <p className="font-semibold text-green-700">QR Code será gerado ao finalizar</p>
                                            <p className="text-sm text-gray-500">Desconto de 5% aplicado no total</p>
                                        </div>
                                    )}

                                    <div className="flex gap-3">
                                        <Button variant="outline" onClick={() => setStep(2)}>
                                            Voltar
                                        </Button>
                                        <Button
                                            className="flex-1 h-14 bg-green-600 hover:bg-green-700 text-lg font-bold shadow-lg shadow-green-100"
                                            onClick={() => createOrderMutation.mutate()}
                                            disabled={createOrderMutation.isPending}
                                        >
                                            {createOrderMutation.isPending ? (
                                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                            ) : (
                                                <Lock className="w-5 h-5 mr-2" />
                                            )}
                                            Finalizar Pedido
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Order Summary */}
                    <div>
                        <Card className="sticky top-24">
                            <CardHeader className="border-b py-4">
                                <CardTitle className="text-lg">Resumo do Pedido</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                <div className="max-h-48 overflow-y-auto space-y-3">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex gap-3">
                                            <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                                    {item.produto_nome}
                                                </p>
                                                <p className="text-xs text-gray-500">Qtd: {item.quantidade}</p>
                                            </div>
                                            <span className="text-sm font-semibold">
                                                {formatCurrency(item.preco_unitario * item.quantidade)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t pt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span>{formatCurrency(subtotal)}</span>
                                    </div>
                                    {selectedShipping && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Frete ({selectedShipping.nome})</span>
                                            <span>{formatCurrency(shippingCost)}</span>
                                        </div>
                                    )}
                                    {paymentMethod === 'pix' && (
                                        <div className="flex justify-between text-sm text-green-600">
                                            <span>Desconto PIX (5%)</span>
                                            <span>-{formatCurrency(total * 0.05)}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t pt-4">
                                    <div className="flex justify-between">
                                        <span className="font-bold text-lg">Total</span>
                                        <span className="font-bold text-xl text-orange-600">
                                            {formatCurrency(paymentMethod === 'pix' ? total * 0.95 : total)}
                                        </span>
                                    </div>
                                    {paymentMethod === 'cartao' && (
                                        <p className="text-xs text-right text-gray-500 mt-1">
                                            ou até 3x de {formatCurrency(total/3)} sem juros
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-2 bg-gray-50 p-2 rounded-lg mt-2">
                                    <Shield className="w-4 h-4 text-green-500" />
                                    Ambiente 100% Seguro
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Address Dialog */}
            <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Novo Endereço</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label>Apelido (ex: Casa, Trabalho)</Label>
                            <Input
                                value={addressForm.apelido}
                                onChange={(e) => setAddressForm(prev => ({ ...prev, apelido: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>CEP</Label>
                            <Input
                                value={addressForm.cep}
                                onChange={(e) => {
                                    const cep = e.target.value;
                                    setAddressForm(prev => ({ ...prev, cep }));
                                    if (cep.replace(/\D/g, '').length === 8) {
                                        fetchAddressByCep(cep);
                                    }
                                }}
                                placeholder="00000-000"
                            />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2 space-y-2">
                                <Label>Logradouro</Label>
                                <Input
                                    value={addressForm.logradouro}
                                    onChange={(e) => setAddressForm(prev => ({ ...prev, logradouro: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Número</Label>
                                <Input
                                    value={addressForm.numero}
                                    onChange={(e) => setAddressForm(prev => ({ ...prev, numero: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Complemento</Label>
                            <Input
                                value={addressForm.complemento}
                                onChange={(e) => setAddressForm(prev => ({ ...prev, complemento: e.target.value }))}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Bairro</Label>
                                <Input
                                    value={addressForm.bairro}
                                    onChange={(e) => setAddressForm(prev => ({ ...prev, bairro: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Cidade</Label>
                                <Input
                                    value={addressForm.cidade}
                                    onChange={(e) => setAddressForm(prev => ({ ...prev, cidade: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Estado</Label>
                            <Select
                                value={addressForm.estado}
                                onValueChange={(v) => setAddressForm(prev => ({ ...prev, estado: v }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ESTADOS_BR.map((uf) => (
                                        <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            onClick={() => saveAddressMutation.mutate()}
                            className="w-full bg-orange-500 hover:bg-orange-600"
                            disabled={saveAddressMutation.isPending}
                        >
                            {saveAddressMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Salvar Endereço
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}