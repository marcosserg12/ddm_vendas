import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { __ddmDatabase } from '../api/MysqlServer.js';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    CreditCard, MapPin, Check, ArrowLeft, Loader2, Lock, QrCode, ShoppingBag, Plus, X, Search, User, Mail, Fingerprint, Phone, Truck
} from 'lucide-react';

import { Button } from '../Components/ui/button';
import { Input } from '../Components/ui/input';
import { Label } from '../Components/ui/label';
import { Badge } from '../Components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../Components/ui/card';
import { RadioGroup, RadioGroupItem } from "../Components/ui/radio-group";
import { toast } from 'sonner';

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

    // Dados do Usuário
    const user = JSON.parse(localStorage.getItem('ddm_user'));
    const sessionId = localStorage.getItem('ddm_session');

    // --- QUERIES PRINCIPAIS ---
    const { data: cartItems = [] } = useQuery({
        queryKey: ['cartItemsHybrid'],
        queryFn: () => __ddmDatabase.entities.Carrinho.list(user?.id_usuario, sessionId)
    });

    const { data: addresses = [] } = useQuery({
        queryKey: ['userAddresses', user?.id_usuario],
        queryFn: () => __ddmDatabase.entities.Enderecos.list(user?.id_usuario),
        enabled: !!user?.id_usuario
    });

    // Estados do Pedido
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [selectedShipping, setSelectedShipping] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('pix');
    const [orderComplete, setOrderComplete] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');

    // Estados do Visitante (Dados Pessoais)
    const [guestData, setGuestData] = useState({
        ds_nome: '',
        ds_email: '',
        nu_cpf_cnpj: '',
        nu_telefone: '',
        ds_login: '',
        senha: '',
        confirmar_senha: ''
    });

    // Estados do Novo Endereço
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [searchingCep, setSearchingCep] = useState(false);
    const [newAddress, setNewAddress] = useState({
        nu_cep: '',
        ds_endereco: '',
        ds_bairro: '',
        id_uf: '',
        id_municipio: '',
        ds_referencia: ''
    });

    // Estados do Cartão
    const [cardData, setCardData] = useState({ number: '', name: '', expiry: '', cvv: '', installments: '1' });
    const [isCardFlipped, setIsCardFlipped] = useState(false);

    // --- CÁLCULOS (MEMOIZADOS) ---
    const subtotal = React.useMemo(() => 
        cartItems.reduce((sum, item) => sum + (Number(item.nu_preco_unitario) * item.nu_quantidade), 0)
    , [cartItems]);

    const shippingCost = selectedShipping?.preco || 0;
    const total = React.useMemo(() => subtotal + shippingCost, [subtotal, shippingCost]);
    const finalTotal = React.useMemo(() => paymentMethod === 'pix' ? total * 0.95 : total, [paymentMethod, total]);

    const installmentOptions = React.useMemo(() => 
        Array.from({ length: 12 }, (_, i) => {
            const count = i + 1;
            const value = total / count;
            return {
                count,
                value,
                label: `${count}x de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)} ${count === 1 ? 'à vista' : 'sem juros'}`
            };
        })
    , [total]);

    // Auto-seleciona Frete Grátis no Passo 2
    useEffect(() => {
        if (step === 2 && !selectedShipping) {
            setSelectedShipping({ ds_nome_servico: 'Frete Grátis', preco: 0, prazo: '5-10' });
        }
    }, [step, selectedShipping]);

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

    // --- QUERIES DE DADOS AUXILIARES ---

    const { data: ufs = [] } = useQuery({
        queryKey: ['listaUfs'],
        queryFn: () => __ddmDatabase.entities.Ufs.list(),
        staleTime: 1000 * 60 * 60
    });

    const { data: municipios = [], isLoading: loadingMunicipios } = useQuery({
        queryKey: ['listaMunicipios', newAddress.id_uf],
        queryFn: () => __ddmDatabase.entities.Municipios.listByUf(newAddress.id_uf),
        enabled: !!newAddress.id_uf
    });

    // CEP Blur Handler (ViaCEP)
    const handleCepBlur = async () => {
        const cep = String(newAddress.nu_cep).replace(/\D/g, '');
        if (cep.length !== 8) return;
        setSearchingCep(true);
        try {
            const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await res.json();
            if (!data.erro) {
                const ufEncontrada = ufs.find(e => e.sg_uf === data.uf);
                setNewAddress(prev => ({
                    ...prev,
                    ds_endereco: data.logradouro || '',
                    ds_bairro: data.bairro || '',
                    id_uf: ufEncontrada ? String(ufEncontrada.id_uf) : '',
                    id_municipio: ''
                }));
                toast.success('Localização identificada!');
            }
        } catch (err) { 
            console.error(err); 
            toast.error('Erro ao buscar CEP');
        } finally { 
            setSearchingCep(false); 
        }
    };

    useEffect(() => {
        if (addresses.length > 0 && !selectedAddress) {
            // Se tiver um favorito, seleciona ele
            const fav = addresses.find(a => a.st_entrega === 'S');
            setSelectedAddress(fav || addresses[0]);
        }
    }, [addresses]);

    const createAddressMutation = useMutation({
        mutationFn: (addressData) => __ddmDatabase.entities.Enderecos.create({
            ...addressData,
            id_usuario: user.id_usuario
        }),
        onSuccess: () => {
            queryClient.invalidateQueries(['userAddresses']);
            setShowAddressForm(false);
            setNewAddress({ nu_cep: '', ds_endereco: '', ds_bairro: '', id_uf: '', id_municipio: '', ds_referencia: '' });
            toast.success('Endereço adicionado!');
        }
    });

    const createOrderMutation = useMutation({
        mutationFn: async () => {
            let currentUserId = user?.id_usuario;
            let currentAddressId = selectedAddress?.id_usuario_endereco || selectedAddress?.id_endereco;

            // 1. SE FOR VISITANTE, REALIZA O CADASTRO
            if (!user) {
                if (guestData.senha !== guestData.confirmar_senha) throw new Error("As senhas não coincidem.");
                
                const regResponse = await __ddmDatabase.entities.auth.register({
                    ds_nome: guestData.ds_nome,
                    ds_email: guestData.ds_email,
                    ds_login: guestData.ds_login,
                    nu_telefone: guestData.nu_telefone,
                    nu_cpf_cnpj: guestData.nu_cpf_cnpj,
                    senha: guestData.senha
                });
                
                currentUserId = regResponse.id_usuario;

                // Salva o endereço para o novo usuário
                const addrResponse = await __ddmDatabase.entities.Enderecos.create({
                    ...newAddress,
                    id_usuario: currentUserId
                });
                currentAddressId = addrResponse.id_endereco;

                // Faz login automático para pegar o token (opcional, mas bom para experiência)
                try {
                    const loginRes = await __ddmDatabase.entities.auth.login(guestData.ds_login, guestData.senha);
                    localStorage.setItem('ddm_token', loginRes.token);
                    localStorage.setItem('ddm_user', JSON.stringify(loginRes.user));
                } catch (e) { console.error("Erro no login automático", e); }
            } else if (showAddressForm) {
                // Se o usuário logado preencheu um NOVO endereço agora
                const addrRes = await __ddmDatabase.entities.Enderecos.create({
                    ...newAddress,
                    id_usuario: currentUserId
                });
                currentAddressId = addrRes.id_endereco;
            }

            // 2. CRIA A VENDA
            const numeroVenda = `DDM${Date.now().toString().slice(-6)}`;
            const totalComFrete = subtotal + shippingCost;
            const totalFinal = paymentMethod === 'pix' ? totalComFrete * 0.95 : totalComFrete;

            const vendaData = {
                id_usuario: currentUserId,
                nu_nota_fiscal: numeroVenda,
                nu_valor_total_nota: totalFinal,
                ds_forma_pagamento: paymentMethod,
                st_venda: 'Pendente',
                dt_venda: new Date().toISOString().slice(0, 19).replace('T', ' '),
                id_usuario_endereco: currentAddressId
            };

            await __ddmDatabase.entities.Vendas.create(vendaData);

            // 3. LIMPA CARRINHO
            for (const item of cartItems) {
                await __ddmDatabase.entities.Carrinho.delete(item.id_carrinho);
            }
            
            return numeroVenda;
        },
        onSuccess: (numero) => {
            setOrderNumber(numero);
            setOrderComplete(true);
            queryClient.invalidateQueries({ queryKey: ['cartItemsHybrid'] });
            window.dispatchEvent(new Event('cartUpdated'));
        },
        onError: (err) => {
            toast.error(err.message || "Erro ao processar pedido.");
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

                        {/* 1. IDENTIFICAÇÃO E ENDEREÇO */}
                        <div className={`transition-all duration-500 ${step === 1 ? 'opacity-100' : 'opacity-40 pointer-events-none grayscale'}`}>
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black shadow-sm ${step >= 1 ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-400'}`}>1</div>
                                <h3 className="font-black text-gray-900 uppercase text-sm tracking-widest">Identificação e Entrega</h3>
                            </div>

                            {step === 1 && (
                                <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 animate-in slide-in-from-left-4">
                                    
                                    {/* SEÇÃO VISITANTE: DADOS PESSOAIS */}
                                    {!user && (
                                        <div className="mb-10 space-y-4">
                                            <div className="flex items-center gap-2 mb-4">
                                                <User className="w-4 h-4 text-orange-500" />
                                                <h4 className="text-xs font-black uppercase text-gray-900 tracking-widest">Seus Dados Técnicos</h4>
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] font-black uppercase text-gray-400">Nome Completo / Razão Social</Label>
                                                    <Input value={guestData.ds_nome} onChange={e => setGuestData({...guestData, ds_nome: e.target.value})} className="h-12 bg-gray-50 border-gray-200 rounded-xl font-bold" />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] font-black uppercase text-gray-400">E-mail</Label>
                                                    <Input type="email" value={guestData.ds_email} onChange={e => setGuestData({...guestData, ds_email: e.target.value})} className="h-12 bg-gray-50 border-gray-200 rounded-xl font-bold" />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] font-black uppercase text-gray-400">CPF / CNPJ</Label>
                                                    <Input value={guestData.nu_cpf_cnpj} onChange={e => setGuestData({...guestData, nu_cpf_cnpj: e.target.value})} className="h-12 bg-gray-50 border-gray-200 rounded-xl font-bold" />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] font-black uppercase text-gray-400">Telefone</Label>
                                                    <Input value={guestData.nu_telefone} onChange={e => setGuestData({...guestData, nu_telefone: e.target.value})} className="h-12 bg-gray-50 border-gray-200 rounded-xl font-bold" />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] font-black uppercase text-gray-400">Defina um Login</Label>
                                                    <Input value={guestData.ds_login} onChange={e => setGuestData({...guestData, ds_login: e.target.value})} className="h-12 bg-gray-50 border-gray-200 rounded-xl font-bold" />
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="space-y-1">
                                                        <Label className="text-[10px] font-black uppercase text-gray-400">Senha</Label>
                                                        <Input type="password" value={guestData.senha} onChange={e => setGuestData({...guestData, senha: e.target.value})} className="h-12 bg-gray-50 border-gray-200 rounded-xl font-bold" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-[10px] font-black uppercase text-gray-400">Confirmar</Label>
                                                        <Input type="password" value={guestData.confirmar_senha} onChange={e => setGuestData({...guestData, confirmar_senha: e.target.value})} className="h-12 bg-gray-50 border-gray-200 rounded-xl font-bold" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="h-px bg-gray-100 my-8" />
                                        </div>
                                    )}

                                    {/* MODO ADICIONAR ENDEREÇO (OU SE VISITANTE) */}
                                    {(showAddressForm || !user) ? (
                                        <div className="space-y-4 animate-in fade-in zoom-in-95">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-orange-500" />
                                                    <h4 className="text-xs font-black uppercase text-gray-900 tracking-widest">Endereço de Entrega</h4>
                                                </div>
                                                {user && addresses.length > 0 && (
                                                    <Button variant="ghost" size="sm" onClick={() => setShowAddressForm(false)}>
                                                        <X className="w-4 h-4 mr-2" /> Cancelar
                                                    </Button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">CEP</Label>
                                                    <div className="relative">
                                                        <Input 
                                                            value={newAddress.nu_cep} 
                                                            onBlur={handleCepBlur} 
                                                            onChange={e => setNewAddress({...newAddress, nu_cep: e.target.value})} 
                                                            className="h-12 rounded-xl bg-gray-50 border-gray-200 font-bold pr-10" 
                                                            placeholder="00000000" 
                                                        />
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                            {searchingCep ? <Loader2 className="w-4 h-4 animate-spin text-orange-500" /> : <Search className="w-4 h-4 text-gray-300" />}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Estado (UF)</Label>
                                                    <select
                                                        value={newAddress.id_uf}
                                                        onChange={(e) => setNewAddress({...newAddress, id_uf: e.target.value, id_municipio: ''})}
                                                        className="w-full h-12 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                    >
                                                        <option value="">UF</option>
                                                        {ufs.map(uf => (
                                                            <option key={uf.id_uf} value={uf.id_uf}>{uf.sg_uf}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="space-y-1">
                                                    <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Cidade</Label>
                                                    <div className="relative">
                                                        <select 
                                                            disabled={!newAddress.id_uf || municipios.length === 0}
                                                            value={newAddress.id_municipio}
                                                            onChange={e => setNewAddress({...newAddress, id_municipio: e.target.value})}
                                                            className="w-full h-12 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                                                        >
                                                            <option value="">{loadingMunicipios ? 'Buscando...' : 'Cidade'}</option>
                                                            {municipios.map(m => (
                                                                <option key={m.id_municipio} value={m.id_municipio}>{m.ds_cidade}</option>
                                                            ))}
                                                        </select>
                                                        {loadingMunicipios && (
                                                            <Loader2 className="absolute right-8 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Rua e Número</Label>
                                                <Input
                                                    value={newAddress.ds_endereco}
                                                    onChange={(e) => setNewAddress({...newAddress, ds_endereco: e.target.value})}
                                                    placeholder="Logradouro completo"
                                                    className="h-12 bg-gray-50 border-gray-200 rounded-xl font-bold"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Bairro</Label>
                                                    <Input
                                                        value={newAddress.ds_bairro}
                                                        onChange={(e) => setNewAddress({...newAddress, ds_bairro: e.target.value})}
                                                        className="h-12 bg-gray-50 border-gray-200 rounded-xl font-bold"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Complemento</Label>
                                                    <Input
                                                        value={newAddress.ds_referencia}
                                                        onChange={(e) => setNewAddress({...newAddress, ds_referencia: e.target.value})}
                                                        placeholder="Opcional"
                                                        className="h-12 bg-gray-50 border-gray-200 rounded-xl font-bold"
                                                    />
                                                </div>
                                            </div>

                                            <Button
                                                onClick={() => setStep(2)}
                                                disabled={!newAddress.nu_cep || !newAddress.ds_endereco || !newAddress.id_municipio || (!user && !guestData.ds_email)}
                                                className="w-full mt-6 bg-gray-900 hover:bg-orange-600 text-white font-black h-14 rounded-2xl uppercase tracking-widest text-[11px] transition-all shadow-lg"
                                            >
                                                Continuar para Frete
                                            </Button>
                                        </div>
                                    ) : (
                                        // LISTA DE ENDEREÇOS PARA USUÁRIO LOGADO
                                        <>
                                            <div className="flex items-center justify-between mb-6">
                                                <h4 className="text-xs font-black uppercase text-gray-900 tracking-widest">Escolha o Endereço</h4>
                                                <Button variant="outline" size="sm" onClick={() => setShowAddressForm(true)} className="rounded-xl border-gray-200 font-bold uppercase text-[9px]">
                                                    <Plus className="w-3 h-3 mr-2" /> Novo Endereço
                                                </Button>
                                            </div>

                                            <RadioGroup 
                                                value={String(selectedAddress?.id_usuario_endereco || selectedAddress?.id_endereco)} 
                                                onValueChange={(val) => {
                                                    const found = addresses.find(a => String(a.id_usuario_endereco || a.id_endereco) === val);
                                                    setSelectedAddress(found);
                                                }}
                                            >
                                                <div className="grid md:grid-cols-2 gap-4">
                                                    {addresses.map(addr => (
                                                        <div key={addr.id_usuario_endereco || addr.id_endereco} className="relative">
                                                            <RadioGroupItem value={String(addr.id_usuario_endereco || addr.id_endereco)} id={`addr-${addr.id_usuario_endereco || addr.id_endereco}`} className="peer sr-only" />
                                                            <Label
                                                                htmlFor={`addr-${addr.id_usuario_endereco || addr.id_endereco}`}
                                                                className="flex flex-col p-5 rounded-3xl border-2 border-gray-100 bg-gray-50 peer-checked:border-orange-500 peer-checked:bg-orange-50 cursor-pointer transition-all hover:border-orange-200 h-full shadow-sm hover:shadow-md"
                                                            >
                                                                <div className="flex justify-between items-start mb-3">
                                                                    <div className={`p-2 rounded-xl ${String(selectedAddress?.id_usuario_endereco || selectedAddress?.id_endereco) === String(addr.id_usuario_endereco || addr.id_endereco) ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                                                                        <MapPin className="w-4 h-4" />
                                                                    </div>
                                                                    {String(selectedAddress?.id_usuario_endereco || selectedAddress?.id_endereco) === String(addr.id_usuario_endereco || addr.id_endereco) && <Check className="w-5 h-5 text-orange-600" />}
                                                                </div>
                                                                <p className="font-black text-gray-900 text-xs uppercase mb-1 leading-tight">{addr.ds_endereco}</p>
                                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{addr.ds_bairro} • CEP: {addr.nu_cep}</p>
                                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{addr.ds_cidade} / {addr.sg_uf || addr.ds_uf}</p>
                                                            </Label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </RadioGroup>

                                            <Button
                                                onClick={() => setStep(2)}
                                                disabled={!selectedAddress}
                                                className="w-full mt-8 bg-gray-900 hover:bg-orange-600 text-white font-black h-14 rounded-2xl uppercase tracking-widest text-[11px] shadow-lg transition-all"
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
                                <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 animate-in slide-in-from-left-4">
                                    <div className="mb-8 p-5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-4">
                                        <div className="bg-orange-100 p-2.5 rounded-xl">
                                            <MapPin className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <div className="text-[11px]">
                                            <p className="text-gray-400 font-bold uppercase tracking-widest">Entregar em:</p>
                                            <p className="font-black text-gray-900 uppercase">
                                                {showAddressForm ? newAddress.ds_endereco : selectedAddress?.ds_endereco} • 
                                                {(showAddressForm ? ufs.find(u => String(u.id_uf) === String(newAddress.id_uf))?.sg_uf : selectedAddress?.sg_uf) || ''}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Opção de Frete Simplificada */}
                                    <div className="space-y-4">
                                        <div className="p-6 rounded-3xl border-2 border-orange-500 bg-orange-50 flex justify-between items-center shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-orange-500 p-3 rounded-2xl text-white">
                                                    <Truck className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900 uppercase text-xs tracking-widest">Frete Grátis</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">Entrega padrão industrial • 5-10 dias úteis</p>
                                                </div>
                                            </div>
                                            <span className="font-black text-green-600 uppercase text-xs">Grátis</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 mt-10">
                                        <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest border-gray-200">Voltar</Button>
                                        <Button onClick={() => setStep(3)} className="flex-[2] bg-gray-900 hover:bg-orange-600 text-white font-black h-14 rounded-2xl uppercase tracking-widest text-[11px] shadow-lg transition-all">Ir para Pagamento</Button>
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
                                    <div className="grid grid-cols-2 gap-4 mb-10">
                                        <div
                                            onClick={() => setPaymentMethod('pix')}
                                            className={`p-8 rounded-3xl border-2 cursor-pointer transition-all flex flex-col items-center gap-4 ${paymentMethod === 'pix' ? 'border-green-500 bg-green-50 shadow-md scale-[1.02]' : 'border-gray-100 hover:bg-gray-50'}`}
                                        >
                                            <div className={`p-4 rounded-2xl ${paymentMethod === 'pix' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                <QrCode className="w-8 h-8" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs font-black uppercase text-gray-900 tracking-widest">PIX</p>
                                                <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mt-1">5% DESCONTO</p>
                                            </div>
                                        </div>
                                        <div
                                            onClick={() => setPaymentMethod('cartao')}
                                            className={`p-8 rounded-3xl border-2 cursor-pointer transition-all flex flex-col items-center gap-4 ${paymentMethod === 'cartao' ? 'border-blue-500 bg-blue-50 shadow-md scale-[1.02]' : 'border-gray-100 hover:bg-gray-50'}`}
                                        >
                                            <div className={`p-4 rounded-2xl ${paymentMethod === 'cartao' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                <CreditCard className="w-8 h-8" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs font-black uppercase text-gray-900 tracking-widest">CARTÃO</p>
                                                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">ATÉ 12X</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* FORMULÁRIO DO CARTÃO */}
                                    {paymentMethod === 'cartao' && (
                                        <div className="animate-in fade-in slide-in-from-top-4 mb-10">
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
                                                        placeholder="NOME COMO NO CARTÃO"
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
                                                <div className="space-y-2">
                                                    <Label className="text-[10px] font-black uppercase text-gray-400 ml-1">Parcelamento</Label>
                                                    <select
                                                        value={cardData.installments}
                                                        onChange={(e) => setCardData({...cardData, installments: e.target.value})}
                                                        className="w-full h-12 px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                                                    >
                                                        {installmentOptions.map(opt => (
                                                            <option key={opt.count} value={opt.count}>{opt.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex gap-4">
                                        <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-16 rounded-2xl font-black uppercase text-[10px] tracking-widest">Voltar</Button>
                                        <Button
                                            onClick={() => setStep(4)}
                                            disabled={paymentMethod === 'cartao' && (!cardData.number || !cardData.cvv)}
                                            className="flex-[2] h-16 bg-gray-900 hover:bg-orange-600 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl transition-all hover:scale-105"
                                        >
                                            Revisar Pedido <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 4. REVISÃO FINAL */}
                        <div className={`transition-all duration-500 ${step === 4 ? 'opacity-100' : 'opacity-40 pointer-events-none grayscale'}`}>
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black shadow-sm ${step >= 4 ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-400'}`}>4</div>
                                <h3 className="font-black text-gray-900 uppercase text-sm tracking-widest">Confirmação Final</h3>
                            </div>

                            {step === 4 && (
                                <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 animate-in slide-in-from-left-4">
                                    <div className="space-y-8">
                                        <div className="grid md:grid-cols-2 gap-8">
                                            {/* Coluna 1: Entrega */}
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2 text-orange-600">
                                                    <MapPin className="w-4 h-4" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Local de Entrega</span>
                                                </div>
                                                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                                    <p className="font-black text-gray-900 uppercase text-xs mb-1">
                                                        {showAddressForm ? newAddress.ds_endereco : selectedAddress?.ds_endereco}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase leading-tight">
                                                        {showAddressForm 
                                                            ? `${newAddress.ds_bairro} • ${ufs.find(u => String(u.id_uf) === String(newAddress.id_uf))?.sg_uf || ''} • CEP: ${newAddress.nu_cep}` 
                                                            : `${selectedAddress?.ds_bairro} • ${selectedAddress?.sg_uf || selectedAddress?.ds_uf || ''} • CEP: ${selectedAddress?.nu_cep}`}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Coluna 2: Pagamento */}
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-2 text-orange-600">
                                                    <CreditCard className="w-4 h-4" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Forma de Pagamento</span>
                                                </div>
                                                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                                    <p className="font-black text-gray-900 uppercase text-xs mb-1">
                                                        {paymentMethod === 'pix' ? 'PIX (Pagamento Instantâneo)' : 'Cartão de Crédito'}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase leading-tight">
                                                        {paymentMethod === 'pix' 
                                                            ? 'Desconto de 5% aplicado no valor total' 
                                                            : `Parcelado em ${cardData.installments}x de ${formatCurrency(total / cardData.installments)} sem juros`}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tabela de Itens Simplificada */}
                                        <div className="border border-gray-100 rounded-3xl overflow-hidden">
                                            <div className="bg-gray-50 px-6 py-3 border-b border-gray-100">
                                                <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Peças Industriais Requisitadas</span>
                                            </div>
                                            <div className="divide-y divide-gray-50">
                                                {cartItems.map(item => (
                                                    <div key={item.id_carrinho} className="px-6 py-4 flex justify-between items-center bg-white">
                                                        <div className="flex flex-col">
                                                            <span className="font-black text-gray-900 uppercase text-[11px]">{item.ds_nome}</span>
                                                            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Qtd: {item.nu_quantidade} unidades</span>
                                                        </div>
                                                        <span className="font-black text-gray-900 text-xs">{formatCurrency(item.nu_preco_unitario * item.nu_quantidade)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 flex items-center gap-4">
                                            <div className="bg-white p-3 rounded-2xl shadow-sm">
                                                <ShieldCheck className="w-6 h-6 text-orange-600" />
                                            </div>
                                            <p className="text-[10px] font-bold text-orange-800 uppercase leading-relaxed tracking-tight">
                                                Ao confirmar, você declara estar de acordo com os dados técnicos e termos de faturamento da DDM Indústria.
                                            </p>
                                        </div>

                                        <div className="flex gap-4 pt-4">
                                            <Button variant="outline" onClick={() => setStep(3)} className="flex-1 h-16 rounded-2xl font-black uppercase text-[10px] tracking-widest border-gray-200">Voltar</Button>
                                            <Button
                                                onClick={() => createOrderMutation.mutate()}
                                                disabled={createOrderMutation.isPending}
                                                className="flex-[2] h-16 bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl shadow-green-600/20 transition-all hover:scale-105"
                                            >
                                                {createOrderMutation.isPending ? <Loader2 className="animate-spin mr-2" /> : <Check className="w-5 h-5 mr-3" />} Confirmar e Finalizar Compra
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* COLUNA DIREITA (RESUMO FIXO) */}
                    <div>
                        <div className="sticky top-32 space-y-6">
                            <Card className="rounded-[2.5rem] border-none shadow-2xl shadow-gray-200/50 bg-white overflow-hidden">
                                <CardHeader className="bg-gray-950 text-white p-8 flex flex-row items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-orange-500 p-2 rounded-lg">
                                            <ShoppingBag className="w-4 h-4 text-white" />
                                        </div>
                                        <CardTitle className="text-sm font-black uppercase tracking-wider text-white">Resumo do Pedido</CardTitle>
                                    </div>
                                    <Badge className="bg-white/10 text-white text-[10px] font-black border-none px-3 py-1">{cartItems.length} Peças</Badge>
                                </CardHeader>
                                <CardContent className="p-8">
                                    {/* ITENS */}
                                    <div className="space-y-4 max-h-60 overflow-y-auto pr-2 mb-8 custom-scrollbar">
                                        {cartItems.map(item => (
                                            <div key={item.id_carrinho} className="flex justify-between items-start text-xs border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                                                <div className="flex-1 pr-4">
                                                    <p className="font-black text-gray-900 uppercase truncate leading-tight mb-1">{item.ds_nome}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Qtd: {item.nu_quantidade}</p>
                                                </div>
                                                <span className="font-black text-gray-900 text-xs">{formatCurrency(item.nu_preco_unitario * item.nu_quantidade)}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* DADOS DO PEDIDO (DINÂMICO) */}
                                    <div className="space-y-6 mb-8">
                                        {/* ENDEREÇO SELECIONADO */}
                                        {(selectedAddress || (step > 1 && showAddressForm)) && (
                                            <div className="space-y-2">
                                                <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                                                    <MapPin className="w-3 h-3" /> Entrega em
                                                </p>
                                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                    <p className="text-[10px] font-bold text-gray-900 uppercase leading-tight">
                                                        {showAddressForm ? newAddress.ds_endereco : selectedAddress?.ds_endereco}
                                                    </p>
                                                    <p className="text-[9px] text-gray-500 uppercase mt-1">
                                                        {showAddressForm ? `${newAddress.ds_bairro} • ${ufs.find(u => String(u.id_uf) === String(newAddress.id_uf))?.sg_uf || ''}` : `${selectedAddress?.ds_bairro} • ${selectedAddress?.sg_uf || selectedAddress?.ds_uf || ''}`}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* MÉTODO DE PAGAMENTO E PARCELAS */}
                                        {step === 3 && (
                                            <div className="space-y-2">
                                                <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                                                    <CreditCard className="w-3 h-3" /> Pagamento
                                                </p>
                                                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                                    <p className="text-[10px] font-bold text-gray-900 uppercase">
                                                        {paymentMethod === 'pix' ? 'PIX (À Vista)' : 'Cartão de Crédito'}
                                                    </p>
                                                    {paymentMethod === 'cartao' && (
                                                        <p className="text-[9px] text-orange-600 font-black uppercase mt-1">
                                                            {cardData.installments}x de {formatCurrency(total / cardData.installments)}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* TOTAIS */}
                                    <div className="bg-gray-900 rounded-[1.5rem] p-6 space-y-4 text-white">
                                        <div className="flex justify-between text-[11px] font-bold uppercase text-gray-400 tracking-widest">
                                            <span>Subtotal</span>
                                            <span className="text-white">{formatCurrency(subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-[11px] font-bold uppercase text-gray-400 tracking-widest">
                                            <span>Frete Logístico</span>
                                            <span className={selectedShipping ? "text-white" : "text-orange-500 font-black animate-pulse"}>
                                                {selectedShipping ? formatCurrency(shippingCost) : "A calcular"}
                                            </span>
                                        </div>
                                        {paymentMethod === 'pix' && (
                                            <div className="flex justify-between text-[11px] font-black uppercase text-green-400 tracking-widest">
                                                <span>Incentivo PIX (-5%)</span>
                                                <span>- {formatCurrency(total * 0.05)}</span>
                                            </div>
                                        )}
                                        <div className="pt-5 mt-5 border-t border-white/10 flex justify-between items-end">
                                            <div className="flex flex-col">
                                                <span className="font-black text-[10px] uppercase text-gray-400 tracking-[0.2em] mb-1">Total Final</span>
                                                <span className="text-white font-black text-[8px] uppercase opacity-40">
                                                    {paymentMethod === 'cartao' ? `Em ${cardData.installments}x no cartão` : 'Pagamento à vista'}
                                                </span>
                                            </div>
                                            <span className="text-3xl font-black text-orange-500 tracking-tighter leading-none italic">
                                                {formatCurrency(finalTotal)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex items-center justify-center gap-3 opacity-30">
                                        <Lock className="w-3.5 h-3.5 text-gray-900" />
                                        <span className="text-[9px] font-black uppercase text-gray-900 tracking-[0.2em]">Criptografia de Ponta Ativa</span>
                                    </div>
                                </CardContent>
                            </Card>
                            
                            {/* Card de Aviso */}
                            <div className="bg-orange-500 rounded-3xl p-8 text-white shadow-xl shadow-orange-500/20 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 -rotate-12 group-hover:rotate-0 transition-transform">
                                    <ShieldCheck className="w-16 h-16" />
                                </div>
                                <h4 className="font-black uppercase italic text-sm mb-2 relative z-10">Garantia DDM</h4>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-orange-100 leading-relaxed relative z-10">Sua compra é protegida pelo nosso protocolo de segurança industrial e logística própria.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ShieldCheck(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}
