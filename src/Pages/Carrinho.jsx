import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { __ddmDatabase, getFullImageUrl } from '../api/MysqlServer.js';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ShoppingCart, Trash2, Minus, Plus, ArrowLeft,
    Package, Cog, Shield, Truck, CreditCard
} from 'lucide-react';
import { Button } from '../Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../Components/ui/card';
import { toast } from 'sonner';
import ShippingCalculator from '../Components/shipping/ShippingCalculator';

export default function Carrinho() {
    const queryClient = useQueryClient();
    const [selectedShipping, setSelectedShipping] = useState(null);
    // Busca o usuário que salvamos no LocalStorage durante o Login
    const user = JSON.parse(localStorage.getItem('ddm_user'));

    // Opcional: Se não houver usuário, redireciona para login
    if (!user || user.id_perfil !== 1) {
        window.location.href = '/login';
  }
    const sessionId = localStorage.getItem('ddm_session');

    // Busca itens do carrinho sincronizado com o banco
    const { data: cartItems = [], isLoading } = useQuery({
        queryKey: ['cartItems', user?.id_usuario, sessionId],
        queryFn: async () => {
            const allItems = await __ddmDatabase.entities.Carrinho.list();
            // Filtra por usuário logado ou pela sessão do navegador
            if (user?.id_usuario) {
                return allItems.filter(item => item.id_usuario === user.id_usuario);
            } else if (sessionId) {
                return allItems.filter(item => item.session_id === sessionId);
            }
            return [];
        }
    });

    const updateQuantityMutation = useMutation({
        mutationFn: async ({ itemId, newQuantity }) => {
            if (newQuantity <= 0) {
                await __ddmDatabase.entities.Carrinho.delete(itemId);
            } else {
                await __ddmDatabase.entities.Carrinho.update(itemId, { nu_quantidade: newQuantity });
            }
            window.dispatchEvent(new Event('cartUpdated'));
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cartItems'] })
    });

    const removeItemMutation = useMutation({
        mutationFn: async (itemId) => {
            await __ddmDatabase.entities.Carrinho.delete(itemId);
            window.dispatchEvent(new Event('cartUpdated'));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cartItems'] });
            toast.success('Produto removido');
        }
    });

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
    };

    const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.nu_preco_unitario) * item.nu_quantidade), 0);
    const shippingCost = selectedShipping?.preco || 0;
    const total = subtotal + shippingCost;
    const totalItems = cartItems.reduce((sum, item) => sum + item.nu_quantidade, 0);

    if (isLoading) return <div className="p-20 text-center font-black uppercase text-gray-400 animate-pulse">Sincronizando Carrinho...</div>;

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Banner Superior Industrial */}
            <section className="bg-gray-900 py-12 border-b-4 border-orange-500">
                <div className="max-w-6xl mx-auto px-6">
                    <h1 className="text-3xl md:text-5xl font-black text-white flex items-center gap-4 uppercase tracking-tighter italic">
                        <ShoppingCart className="w-10 h-10 text-orange-500" />
                        Meu <span className="text-orange-500">Carrinho</span>
                    </h1>
                    <p className="text-gray-400 mt-2 font-bold uppercase text-xs tracking-widest">
                        {totalItems} {totalItems === 1 ? 'Peça selecionada' : 'Peças selecionadas'}
                    </p>
                </div>
            </section>

            <div className="max-w-6xl mx-auto px-6 py-10">
                {cartItems.length > 0 ? (
                    <div className="grid lg:grid-cols-3 gap-10">
                        
                        {/* Lista de Produtos */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="rounded-2xl border-2 shadow-sm overflow-hidden">
                                <CardHeader className="bg-gray-50/50 border-b p-6 flex flex-row items-center justify-between">
                                    <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                        <Package className="w-5 h-5 text-orange-500" /> Itens no Pedido
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {cartItems.map((item) => (
                                        <div key={item.id_carrinho} className="flex flex-col sm:flex-row items-center gap-6 p-6 border-b last:border-0 hover:bg-gray-50/30 transition-colors">
                                            {/* Imagem usando nosso Helper */}
                                            <div className="w-24 h-24 bg-white rounded-xl border-2 border-gray-100 p-2 flex-shrink-0">
                                                <img 
                                                    src={getFullImageUrl(item.url_imagem)} 
                                                    alt={item.ds_nome} 
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>

                                            {/* Info do Produto */}
                                            <div className="flex-1 text-center sm:text-left">
                                                <p className="text-[10px] font-black text-orange-600 uppercase mb-1">Cód: {item.nu_ddm}</p>
                                                <h3 className="font-black text-gray-900 uppercase text-sm leading-tight mb-2">{item.ds_nome}</h3>
                                                <p className="text-lg font-black text-gray-900 tracking-tighter">{formatCurrency(item.nu_preco_unitario)}</p>
                                            </div>

                                            {/* Quantidade Industrial */}
                                            <div className="flex items-center border-2 border-gray-100 rounded-xl bg-white overflow-hidden h-11">
                                                <Button variant="ghost" size="icon" className="rounded-none h-full w-10" onClick={() => updateQuantityMutation.mutate({ itemId: item.id_carrinho, newQuantity: item.nu_quantidade - 1 })}>
                                                    <Minus className="w-3 h-3" />
                                                </Button>
                                                <span className="w-10 text-center font-black text-sm">{item.nu_quantidade}</span>
                                                <Button variant="ghost" size="icon" className="rounded-none h-full w-10" onClick={() => updateQuantityMutation.mutate({ itemId: item.id_carrinho, newQuantity: item.nu_quantidade + 1 })}>
                                                    <Plus className="w-3 h-3" />
                                                </Button>
                                            </div>

                                            <Button variant="ghost" size="icon" className="text-gray-300 hover:text-red-500 transition-colors" onClick={() => removeItemMutation.mutate(item.id_carrinho)}>
                                                <Trash2 className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>

                            {/* Cálculo de Frete Integrado */}
                            <ShippingCalculator 
                                id_produto={cartItems[0]?.id_produto} 
                                onSelectShipping={setSelectedShipping} 
                                selectedShipping={selectedShipping}
                            />
                        </div>

                        {/* Resumo e Checkout */}
                        <div className="space-y-6">
                            <Card className="rounded-3xl border-2 border-gray-900 shadow-xl overflow-hidden">
                                <CardHeader className="bg-gray-900 text-white p-6">
                                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] italic">Resumo do Pedido</CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 space-y-6">
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-gray-500 font-bold text-xs uppercase">
                                            <span>Subtotal</span>
                                            <span className="text-gray-900">{formatCurrency(subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-500 font-bold text-xs uppercase">
                                            <span>Frete</span>
                                            <span className={shippingCost > 0 ? "text-gray-900" : "text-orange-500 animate-pulse"}>
                                                {shippingCost > 0 ? formatCurrency(shippingCost) : "Aguardando CEP"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t-2 border-dashed border-gray-100">
                                        <div className="flex justify-between items-end">
                                            <span className="font-black text-xs uppercase text-gray-400">Total Geral</span>
                                            <span className="text-3xl font-black text-gray-900 tracking-tighter">{formatCurrency(total)}</span>
                                        </div>
                                        <p className="text-[11px] text-green-600 font-black uppercase mt-2 text-right">
                                            {formatCurrency(total * 0.95)} no PIX (5% OFF)
                                        </p>
                                    </div>

                                    <Button className="w-full h-16 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase tracking-widest text-sm shadow-lg shadow-orange-500/20 rounded-2xl group" disabled={!selectedShipping}>
                                        <CreditCard className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                                        Finalizar Compra
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Selos de Confiança */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-2xl border-2 border-gray-100 flex flex-col items-center text-center">
                                    <Shield className="w-6 h-6 text-green-500 mb-2" />
                                    <span className="text-[9px] font-black uppercase text-gray-400 tracking-tighter">Ambiente Seguro</span>
                                </div>
                                <div className="bg-white p-4 rounded-2xl border-2 border-gray-100 flex flex-col items-center text-center">
                                    <Truck className="w-6 h-6 text-blue-500 mb-2" />
                                    <span className="text-[9px] font-black uppercase text-gray-400 tracking-tighter">Entrega DDM</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <Card className="max-w-md mx-auto text-center py-20 rounded-3xl border-2 border-dashed border-gray-200">
                        <Package className="w-20 h-20 text-gray-200 mx-auto mb-6" />
                        <h2 className="text-xl font-black text-gray-900 uppercase italic mb-2">Carrinho Vazio</h2>
                        <p className="text-gray-400 text-sm font-bold uppercase tracking-tight mb-10 px-10">Você ainda não adicionou peças ao seu pedido.</p>
                        <Button asChild className="bg-gray-900 hover:bg-black font-black uppercase tracking-widest px-8">
                            <Link to="/catalogo">Explorar Catálogo</Link>
                        </Button>
                    </Card>
                )}
            </div>
        </div>
    );
}