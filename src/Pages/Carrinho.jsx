import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// REMOVIDO: import { createPageUrl } from '../utils'; (Não existe)
// CORREÇÃO: Caminho correto da API
import { base44 } from '../api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ShoppingCart, Trash2, Minus, Plus, ArrowLeft,
    Package, Cog, Shield, Truck, CreditCard
} from 'lucide-react';

// CORREÇÃO: Caminhos relativos para os componentes UI
import { Button } from '../Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../Components/ui/card';
// Nota: O Skeleton não foi criado antes. Se der erro, remova ou crie um simples.
// Vou substituir por um "Carregando..." simples se não tiver Skeleton,
// mas deixarei o import caso você queira criar o componente.
// import { Skeleton } from '../components/ui/skeleton';
import { toast } from 'sonner';
import ShippingCalculator from '../components/shipping/ShippingCalculator';

// Componente simples de Loading para substituir o Skeleton caso não tenha
const LoadingState = () => <div className="p-8 text-center text-gray-500">Carregando carrinho...</div>;

export default function Carrinho() {
    const queryClient = useQueryClient();
    const [selectedShipping, setSelectedShipping] = useState(null);

    const { data: user } = useQuery({
        queryKey: ['currentUser'],
        queryFn: async () => {
            // Proteção se auth não existir
            if (!base44.auth) return null;
            const isAuth = await base44.auth.isAuthenticated();
            if (isAuth) return base44.auth.me();
            return null;
        }
    });

    const sessionId = localStorage.getItem('ddm_session');

    const { data: cartItems, isLoading } = useQuery({
        queryKey: ['cartItems', user?.email, sessionId],
        queryFn: async () => {
            // CORREÇÃO CRÍTICA: O client não tem .filter().
            // Buscamos tudo (.list) e filtramos com Javascript normal.
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

    const updateQuantityMutation = useMutation({
        mutationFn: async ({ itemId, newQuantity }) => {
            if (newQuantity <= 0) {
                await base44.entities.CartItem.delete(itemId);
            } else {
                await base44.entities.CartItem.update(itemId, { quantidade: newQuantity });
            }
            window.dispatchEvent(new Event('cartUpdated'));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cartItems'] });
        }
    });

    const removeItemMutation = useMutation({
        mutationFn: async (itemId) => {
            await base44.entities.CartItem.delete(itemId);
            window.dispatchEvent(new Event('cartUpdated'));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cartItems'] });
            toast.success('Item removido do carrinho');
        }
    });

    const clearCartMutation = useMutation({
        mutationFn: async () => {
            // Deletar um por um (API simples)
            for (const item of cartItems) {
                await base44.entities.CartItem.delete(item.id);
            }
            window.dispatchEvent(new Event('cartUpdated'));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cartItems'] });
            toast.success('Carrinho limpo');
        }
    });

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const subtotal = cartItems.reduce((sum, item) =>
        sum + (item.preco_unitario * item.quantidade), 0
    );
    const totalWeight = cartItems.reduce((sum, item) =>
        sum + ((item.peso_kg || 0.5) * item.quantidade), 0
    );
    const shippingCost = selectedShipping?.preco || 0;
    const total = subtotal + shippingCost;
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantidade, 0);

    if (isLoading) {
        return <LoadingState />;
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header */}
            <section className="bg-gray-900 py-8">
                <div className="max-w-6xl mx-auto px-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
                        <ShoppingCart className="w-8 h-8" />
                        Carrinho de Compras
                    </h1>
                    <p className="text-gray-400 mt-2">
                        {totalItems} {totalItems === 1 ? 'item' : 'itens'}
                    </p>
                </div>
            </section>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {cartItems.length > 0 ? (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between border-b py-4">
                                    <CardTitle className="text-lg">Produtos</CardTitle>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                        onClick={() => clearCartMutation.mutate()}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Limpar
                                    </Button>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {cartItems.map((item, idx) => (
                                        <div
                                            key={item.id}
                                            className={`flex items-center gap-4 p-4 ${idx !== cartItems.length - 1 ? 'border-b' : ''
                                                }`}
                                        >
                                            {/* Image */}
                                            {/* CORREÇÃO: Link direto sem createPageUrl */}
                                            <Link
                                                to={`/produto?id=${item.produto_id}`}
                                                className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden"
                                            >
                                                {item.imagem_url ? (
                                                    <img
                                                        src={item.imagem_url}
                                                        alt={item.produto_nome}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Cog className="w-8 h-8 text-gray-300" />
                                                    </div>
                                                )}
                                            </Link>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <Link
                                                    to={`/produto?id=${item.produto_id}`}
                                                    className="font-semibold text-gray-900 hover:text-orange-600 transition-colors line-clamp-2"
                                                >
                                                    {item.produto_nome}
                                                </Link>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Código: <span className="font-mono">{item.num_ddm}</span>
                                                </p>
                                                <p className="text-orange-600 font-semibold mt-1">
                                                    {formatCurrency(item.preco_unitario)}
                                                </p>
                                            </div>

                                            {/* Quantity */}
                                            <div className="flex items-center border rounded-lg">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9"
                                                    onClick={() => updateQuantityMutation.mutate({
                                                        itemId: item.id,
                                                        newQuantity: item.quantidade - 1
                                                    })}
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </Button>
                                                <span className="w-10 text-center font-medium">{item.quantidade}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9"
                                                    onClick={() => updateQuantityMutation.mutate({
                                                        itemId: item.id,
                                                        newQuantity: item.quantidade + 1
                                                    })}
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </Button>
                                            </div>

                                            {/* Subtotal */}
                                            <div className="text-right hidden sm:block">
                                                <p className="font-bold text-gray-900">
                                                    {formatCurrency(item.preco_unitario * item.quantidade)}
                                                </p>
                                            </div>

                                            {/* Remove */}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-gray-400 hover:text-red-500"
                                                onClick={() => removeItemMutation.mutate(item.id)}
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Shipping Calculator */}
                            <Card>
                                <CardContent className="p-6">
                                    <ShippingCalculator
                                        weightKg={totalWeight}
                                        onSelectShipping={setSelectedShipping}
                                        selectedShipping={selectedShipping}
                                        compact
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Summary */}
                        <div className="space-y-4">
                            <Card>
                                <CardHeader className="border-b py-4">
                                    <CardTitle className="text-lg">Resumo</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal ({totalItems} itens)</span>
                                        <span>{formatCurrency(subtotal)}</span>
                                    </div>

                                    <div className="flex justify-between text-gray-600">
                                        <span>Frete</span>
                                        {selectedShipping ? (
                                            <span>{formatCurrency(shippingCost)}</span>
                                        ) : (
                                            <span className="text-orange-500 text-sm">Calcule acima</span>
                                        )}
                                    </div>

                                    {selectedShipping && (
                                        <div className="text-sm text-gray-500">
                                            {selectedShipping.nome} - {selectedShipping.prazo_min} a {selectedShipping.prazo_max} dias úteis
                                        </div>
                                    )}

                                    <div className="border-t pt-4">
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Total</span>
                                            <span className="text-orange-600">{formatCurrency(total)}</span>
                                        </div>
                                        <p className="text-sm text-green-600 mt-1">
                                            {formatCurrency(total * 0.95)} no PIX (5% off)
                                        </p>
                                    </div>

                                    <Link to="/checkout">
                                        <Button
                                            className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white text-lg font-bold mt-4"
                                            disabled={!selectedShipping}
                                        >
                                            <CreditCard className="w-5 h-5 mr-2" />
                                            Finalizar Compra
                                        </Button>
                                    </Link>

                                    {!selectedShipping && (
                                        <p className="text-xs text-center text-gray-500">
                                            Calcule o frete para continuar
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Trust Badges */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white rounded-xl p-4 text-center border">
                                    <Shield className="w-6 h-6 mx-auto text-green-500 mb-2" />
                                    <p className="text-xs text-gray-600">Compra 100% Segura</p>
                                </div>
                                <div className="bg-white rounded-xl p-4 text-center border">
                                    <Truck className="w-6 h-6 mx-auto text-blue-500 mb-2" />
                                    <p className="text-xs text-gray-600">Entrega Garantida</p>
                                </div>
                            </div>

                            {/* Continue Shopping */}
                            <Link to="/catalogo">
                                <Button variant="outline" className="w-full">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Continuar Comprando
                                </Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <Card className="text-center py-16">
                        <CardContent>
                            <Package className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                Seu carrinho está vazio
                            </h2>
                            <p className="text-gray-500 mb-8 max-w-md mx-auto">
                                Navegue pelo nosso catálogo e adicione produtos ao seu carrinho.
                            </p>
                            <Link to="/catalogo">
                                <Button className="bg-orange-500 hover:bg-orange-600">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Ver Catálogo de Produtos
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}