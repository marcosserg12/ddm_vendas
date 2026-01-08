import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// REMOVIDO: createPageUrl
// CORREÇÃO: Caminho da API
import { base44 } from '../api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    User, Package, MapPin, CreditCard, Settings, LogOut,
    Plus, Pencil, Trash2, Check, X, Loader2, ShoppingBag
} from 'lucide-react';

// CORREÇÃO: Imports com maiúscula (Components)
import { Button } from '../Components/ui/button';
import { Input } from '../Components/ui/input';
import { Label } from '../Components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../Components/ui/card';
import { Badge } from '../Components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../Components/ui/tabs';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../Components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../Components/ui/dialog";

const ESTADOS_BR = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export default function MinhaConta() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('dados');
    const [editingAddress, setEditingAddress] = useState(null);
    const [addressDialogOpen, setAddressDialogOpen] = useState(false);

    const { data: user, isLoading: userLoading } = useQuery({
        queryKey: ['currentUser'],
        queryFn: async () => {
            // MOCK DE AUTENTICAÇÃO
            // Retorna um usuário falso para a página funcionar
            return {
                email: "usuario@teste.com",
                full_name: "Cliente Teste",
                telefone: "(31) 99999-9999",
                enderecos: [
                    {
                        id: "addr_1",
                        apelido: "Casa",
                        cep: "33200-000",
                        logradouro: "Rua das Flores",
                        numero: "123",
                        bairro: "Centro",
                        cidade: "Vespasiano",
                        estado: "MG",
                        principal: true
                    }
                ]
            };
        }
    });

    const { data: orders, isLoading: ordersLoading } = useQuery({
        queryKey: ['userOrders', user?.email],
        queryFn: async () => {
            // Correção: Buscar tudo e filtrar no JS
            const allOrders = await base44.entities.Order.list();
            if (!user?.email) return [];

            // Filtra por email e ordena por data (se houver created_date)
            return allOrders
                .filter(o => o.user_email === user.email)
                .sort((a, b) => {
                    const dateA = a.created_date ? new Date(a.created_date) : new Date(0);
                    const dateB = b.created_date ? new Date(b.created_date) : new Date(0);
                    return dateB - dateA;
                });
        },
        enabled: !!user?.email,
        initialData: []
    });

    const updateUserMutation = useMutation({
        mutationFn: async (data) => {
            // Simulação de update
            console.log("Dados atualizados:", data);
            await new Promise(r => setTimeout(r, 500));
            return data;
        },
        onSuccess: (data) => {
            // Atualiza cache localmente
            queryClient.setQueryData(['currentUser'], (old) => ({ ...old, ...data }));
            toast.success('Dados atualizados com sucesso!');
        }
    });

    const [formData, setFormData] = useState({
        tipo_pessoa: 'fisica',
        cpf: '',
        cnpj: '',
        razao_social: '',
        inscricao_estadual: '',
        telefone: '',
        celular: ''
    });

    const [addressForm, setAddressForm] = useState({
        apelido: '',
        cep: '',
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        principal: false
    });

    useEffect(() => {
        if (user) {
            setFormData({
                tipo_pessoa: user.tipo_pessoa || 'fisica',
                cpf: user.cpf || '',
                cnpj: user.cnpj || '',
                razao_social: user.razao_social || '',
                inscricao_estadual: user.inscricao_estadual || '',
                telefone: user.telefone || '',
                celular: user.celular || ''
            });
        }
    }, [user]);

    const handleSaveProfile = () => {
        updateUserMutation.mutate(formData);
    };

    const handleSaveAddress = () => {
        const enderecos = user?.enderecos || [];
        let newEnderecos;

        if (editingAddress !== null) {
            newEnderecos = enderecos.map((addr, idx) =>
                idx === editingAddress ? { ...addressForm, id: addr.id } : addr
            );
        } else {
            const newAddress = {
                ...addressForm,
                id: `addr_${Date.now()}`
            };
            if (addressForm.principal) {
                newEnderecos = enderecos.map(a => ({ ...a, principal: false })).concat(newAddress);
            } else {
                newEnderecos = [...enderecos, newAddress];
            }
        }

        updateUserMutation.mutate({ enderecos: newEnderecos });
        setAddressDialogOpen(false);
        setEditingAddress(null);
        setAddressForm({
            apelido: '', cep: '', logradouro: '', numero: '',
            complemento: '', bairro: '', cidade: '', estado: '', principal: false
        });
    };

    const handleDeleteAddress = (index) => {
        const newEnderecos = (user?.enderecos || []).filter((_, idx) => idx !== index);
        updateUserMutation.mutate({ enderecos: newEnderecos });
    };

    const handleEditAddress = (index) => {
        const addr = user.enderecos[index];
        setAddressForm(addr);
        setEditingAddress(index);
        setAddressDialogOpen(true);
    };

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
        } catch (e) {
            console.error('Erro ao buscar CEP');
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            pendente: { label: 'Pendente', class: 'bg-yellow-100 text-yellow-800' },
            pago: { label: 'Pago', class: 'bg-blue-100 text-blue-800' },
            preparando: { label: 'Preparando', class: 'bg-purple-100 text-purple-800' },
            enviado: { label: 'Enviado', class: 'bg-indigo-100 text-indigo-800' },
            entregue: { label: 'Entregue', class: 'bg-green-100 text-green-800' },
            cancelado: { label: 'Cancelado', class: 'bg-red-100 text-red-800' }
        };
        const config = statusConfig[status] || statusConfig.pendente;
        return <Badge className={config.class}>{config.label}</Badge>;
    };

    if (userLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="max-w-md mx-4 text-center">
                    <CardContent className="pt-8 pb-6">
                        <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Faça login para continuar</h2>
                        <p className="text-gray-500 mb-6">Acesse sua conta para ver seus pedidos e dados</p>
                        <Button
                            className="bg-orange-500 hover:bg-orange-600"
                            // Simulação de redirecionamento
                            onClick={() => window.location.href = '/'}
                        >
                            Voltar para Home
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <section className="bg-gray-900 py-8">
                <div className="max-w-6xl mx-auto px-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-white">Minha Conta</h1>
                    <p className="text-gray-400 mt-1">Olá, {user.full_name || user.email}</p>
                </div>
            </section>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex mb-8">
                        <TabsTrigger value="dados" className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span className="hidden sm:inline">Meus Dados</span>
                        </TabsTrigger>
                        <TabsTrigger value="enderecos" className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span className="hidden sm:inline">Endereços</span>
                        </TabsTrigger>
                        <TabsTrigger value="pedidos" className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            <span className="hidden sm:inline">Pedidos</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Dados Pessoais */}
                    <TabsContent value="dados">
                        <Card>
                            <CardHeader>
                                <CardTitle>Dados Pessoais</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Nome Completo</Label>
                                        <Input value={user.full_name || ''} disabled className="bg-gray-50" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>E-mail</Label>
                                        <Input value={user.email || ''} disabled className="bg-gray-50" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Tipo de Pessoa</Label>
                                    <Select
                                        value={formData.tipo_pessoa}
                                        onValueChange={(v) => setFormData(prev => ({ ...prev, tipo_pessoa: v }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="fisica">Pessoa Física</SelectItem>
                                            <SelectItem value="juridica">Pessoa Jurídica</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {formData.tipo_pessoa === 'fisica' ? (
                                    <div className="space-y-2">
                                        <Label>CPF</Label>
                                        <Input
                                            value={formData.cpf}
                                            onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                                            placeholder="000.000.000-00"
                                        />
                                    </div>
                                ) : (
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label>CNPJ</Label>
                                            <Input
                                                value={formData.cnpj}
                                                onChange={(e) => setFormData(prev => ({ ...prev, cnpj: e.target.value }))}
                                                placeholder="00.000.000/0001-00"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Razão Social</Label>
                                            <Input
                                                value={formData.razao_social}
                                                onChange={(e) => setFormData(prev => ({ ...prev, razao_social: e.target.value }))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Inscrição Estadual</Label>
                                            <Input
                                                value={formData.inscricao_estadual}
                                                onChange={(e) => setFormData(prev => ({ ...prev, inscricao_estadual: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label>Telefone</Label>
                                        <Input
                                            value={formData.telefone}
                                            onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                                            placeholder="(00) 0000-0000"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Celular/WhatsApp</Label>
                                        <Input
                                            value={formData.celular}
                                            onChange={(e) => setFormData(prev => ({ ...prev, celular: e.target.value }))}
                                            placeholder="(00) 00000-0000"
                                        />
                                    </div>
                                </div>

                                <Button
                                    onClick={handleSaveProfile}
                                    className="bg-orange-500 hover:bg-orange-600"
                                    disabled={updateUserMutation.isPending}
                                >
                                    {updateUserMutation.isPending ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Check className="w-4 h-4 mr-2" />
                                    )}
                                    Salvar Alterações
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Endereços */}
                    <TabsContent value="enderecos">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Meus Endereços</CardTitle>
                                <Dialog open={addressDialogOpen} onOpenChange={setAddressDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button
                                            className="bg-orange-500 hover:bg-orange-600"
                                            onClick={() => {
                                                setEditingAddress(null);
                                                setAddressForm({
                                                    apelido: '', cep: '', logradouro: '', numero: '',
                                                    complemento: '', bairro: '', cidade: '', estado: '', principal: false
                                                });
                                            }}
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Novo Endereço
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-lg">
                                        <DialogHeader>
                                            <DialogTitle>
                                                {editingAddress !== null ? 'Editar Endereço' : 'Novo Endereço'}
                                            </DialogTitle>
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
                                                    placeholder="Apto, Bloco, etc"
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
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={addressForm.principal}
                                                    onChange={(e) => setAddressForm(prev => ({ ...prev, principal: e.target.checked }))}
                                                    className="rounded border-gray-300"
                                                />
                                                <span className="text-sm text-gray-700">Endereço principal</span>
                                            </label>
                                            <Button
                                                onClick={handleSaveAddress}
                                                className="w-full bg-orange-500 hover:bg-orange-600"
                                            >
                                                Salvar Endereço
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </CardHeader>
                            <CardContent>
                                {!user.enderecos || user.enderecos.length === 0 ? (
                                    <div className="text-center py-8">
                                        <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500">Nenhum endereço cadastrado</p>
                                    </div>
                                ) : (
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {user.enderecos.map((addr, idx) => (
                                            <div
                                                key={addr.id || idx}
                                                className={`p-4 rounded-xl border-2 ${addr.principal ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                                                    }`}
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-gray-900">
                                                            {addr.apelido || `Endereço ${idx + 1}`}
                                                        </span>
                                                        {addr.principal && (
                                                            <Badge className="bg-orange-500 text-white text-xs">Principal</Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8"
                                                            onClick={() => handleEditAddress(idx)}
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-500 hover:text-red-600"
                                                            onClick={() => handleDeleteAddress(idx)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    {addr.logradouro}, {addr.numero}
                                                    {addr.complemento && ` - ${addr.complemento}`}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {addr.bairro} - {addr.cidade}/{addr.estado}
                                                </p>
                                                <p className="text-sm text-gray-500">CEP: {addr.cep}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Pedidos */}
                    <TabsContent value="pedidos">
                        <Card>
                            <CardHeader>
                                <CardTitle>Meus Pedidos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {ordersLoading ? (
                                    <div className="text-center py-8">
                                        <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto" />
                                    </div>
                                ) : orders.length === 0 ? (
                                    <div className="text-center py-8">
                                        <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 mb-4">Você ainda não fez nenhum pedido</p>
                                        <Link to="/catalogo">
                                            <Button className="bg-orange-500 hover:bg-orange-600">
                                                Começar a Comprar
                                            </Button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {orders.map((order) => (
                                            <div
                                                key={order.id}
                                                className="border rounded-xl p-4 hover:shadow-md transition-shadow"
                                            >
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                                    <div>
                                                        <p className="font-semibold text-gray-900">
                                                            Pedido #{order.numero_pedido}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {new Date(order.created_date || Date.now()).toLocaleDateString('pt-BR', {
                                                                day: '2-digit',
                                                                month: 'long',
                                                                year: 'numeric'
                                                            })}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        {getStatusBadge(order.status)}
                                                        <span className="font-bold text-gray-900">
                                                            {formatCurrency(order.total)}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {order.itens?.slice(0, 3).map((item, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2"
                                                        >
                                                            <span className="text-sm text-gray-700">{item.produto_nome}</span>
                                                            <span className="text-xs text-gray-400">x{item.quantidade}</span>
                                                        </div>
                                                    ))}
                                                    {order.itens?.length > 3 && (
                                                        <span className="text-sm text-gray-500 px-3 py-2">
                                                            +{order.itens.length - 3} itens
                                                        </span>
                                                    )}
                                                </div>
                                                {order.codigo_rastreio && (
                                                    <div className="mt-3 pt-3 border-t">
                                                        <p className="text-sm text-gray-600">
                                                            Rastreio: <span className="font-mono font-semibold">{order.codigo_rastreio}</span>
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
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