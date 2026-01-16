import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { __ddmDatabase, getFullImageUrl } from '../api/MysqlServer.js';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingCart, Trash2, Minus, Plus, ArrowRight, Package, Shield, Truck, ArrowLeft } from 'lucide-react';
import { Button } from '../Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../Components/ui/card';
import { toast } from 'sonner';
import ShippingCalculator from '../Components/shipping/ShippingCalculator';

export default function Carrinho() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [selectedShipping, setSelectedShipping] = useState(null);

    const { data: cartItems = [], isLoading } = useQuery({
        queryKey: ['cartItemsHybrid'],
        queryFn: async () => {
            const user = JSON.parse(localStorage.getItem('ddm_user'));
            const localItems = JSON.parse(localStorage.getItem('ddm_cart') || '[]');
            let serverItems = [];

            if (user?.id_usuario) {
                try {
                    const allItems = await __ddmDatabase.entities.Carrinho.list();
                    serverItems = allItems.filter(item => item.id_usuario === user.id_usuario);
                } catch (e) {
                    console.error("Erro ao buscar do servidor", e);
                }
            }

            const finalItems = [...serverItems];
            localItems.forEach(local => {
                const exists = serverItems.some(s => String(s.id_produto) === String(local.id_produto));
                if (!exists) {
                    finalItems.push({
                        ...local,
                        id_carrinho: local.id_carrinho || `local_${local.id_produto}`,
                        nu_quantidade: local.nu_quantidade || local.quantidade
                    });
                }
            });

            if (!user) return localItems.map(i => ({ ...i, nu_quantidade: i.nu_quantidade || i.quantidade, id_carrinho: i.id_carrinho || `local_${i.id_produto}` }));
            return finalItems;
        }
    });

    const updateLocalCart = (itemId, newQuantity) => {
        const localCart = JSON.parse(localStorage.getItem('ddm_cart') || '[]');
        let updated;
        if (newQuantity <= 0) {
            updated = localCart.filter(i => String(i.id_produto) !== String(itemId));
        } else {
            updated = localCart.map(i => {
                if (String(i.id_produto) === String(itemId)) return { ...i, quantidade: newQuantity, nu_quantidade: newQuantity };
                return i;
            });
        }
        localStorage.setItem('ddm_cart', JSON.stringify(updated));
        window.dispatchEvent(new Event('cartUpdated'));
    };

    const updateQuantityMutation = useMutation({
        mutationFn: async ({ item, newQuantity }) => {
            updateLocalCart(item.id_produto, newQuantity);

            const user = JSON.parse(localStorage.getItem('ddm_user'));
            if (user && item.id_carrinho && !String(item.id_carrinho).startsWith('local_')) {
                if (newQuantity <= 0) await __ddmDatabase.entities.Carrinho.delete(item.id_carrinho);
                else await __ddmDatabase.entities.Carrinho.update(item.id_carrinho, { nu_quantidade: newQuantity });
            }
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cartItemsHybrid'] })
    });

    const removeItemMutation = useMutation({
        mutationFn: async (item) => {
            updateLocalCart(item.id_produto, 0); // Always update local first

            const user = JSON.parse(localStorage.getItem('ddm_user'));
            if (user && item.id_carrinho && !String(item.id_carrinho).startsWith('local_')) {
                await __ddmDatabase.entities.Carrinho.delete(item.id_carrinho);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cartItemsHybrid'] });
            toast.success('Produto removido');
        }
    });

    const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
    const subtotal = cartItems.reduce((sum, item) => sum + (Number(item.nu_preco_unitario) * (item.nu_quantidade || item.quantidade || 0)), 0);
    const shippingCost = selectedShipping?.preco || 0;
    const total = subtotal + shippingCost;
    const totalItems = cartItems.reduce((sum, item) => sum + (item.nu_quantidade || item.quantidade || 0), 0);

    if (isLoading) return (<div className="min-h-screen flex flex-col items-center justify-center bg-gray-50"><div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"/><p className="font-black uppercase text-[10px] tracking-widest text-gray-400">Carregando...</p></div>);

    return (
        <div className="bg-gray-50 min-h-screen pb-24 font-sans">
            <section className="bg-gray-900 py-10 md:py-16 border-b-4 border-orange-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-soft-light pointer-events-none"></div>
                <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-black text-white flex items-center gap-3 md:gap-4 uppercase tracking-tighter italic leading-none"><ShoppingCart className="w-8 h-8 md:w-10 md:h-10 text-orange-500" /> Meu <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Carrinho</span></h1>
                            <p className="text-gray-400 mt-2 md:mt-3 font-bold uppercase text-[9px] md:text-[10px] tracking-[0.2em] flex items-center gap-2"><Package className="w-3 h-3" /> Gestão de Pedido</p>
                        </div>
                        {cartItems.length > 0 && <div className="w-full md:w-auto text-left md:text-right border-t md:border-t-0 border-gray-800 pt-4 md:pt-0"><p className="text-gray-500 text-[9px] md:text-[10px] font-black uppercase tracking-widest">Total Parcial</p><p className="text-2xl md:text-3xl font-black text-white tracking-tighter">{formatCurrency(subtotal)}</p></div>}
                    </div>
                </div>
            </section>

            <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-10 -mt-4 md:-mt-8 relative z-20">
                {cartItems.length > 0 ? (
                    <div className="grid lg:grid-cols-3 gap-6 md:gap-10">
                        <div className="lg:col-span-2 space-y-6 md:space-y-8">
                            <Card className="rounded-[1.5rem] md:rounded-[2rem] border-none shadow-xl bg-white overflow-hidden">
                                <CardHeader className="bg-gray-50 border-b border-gray-100 p-4 md:p-6">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-gray-400 flex items-center gap-2">Itens Selecionados ({totalItems})</CardTitle>
                                        <Button variant="ghost" onClick={() => navigate('/catalogo')} className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-orange-600 hover:text-orange-700 hover:bg-orange-50 h-8 px-2 md:px-4"><ArrowLeft className="w-3 h-3 mr-1" /> <span className="hidden md:inline">Continuar Comprando</span><span className="md:hidden">Voltar</span></Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    {cartItems.map((item) => (
                                        <div key={item.id_carrinho} className="group p-4 md:p-6 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                            <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                                                <div className="flex gap-4 w-full sm:w-auto">
                                                    <div className="w-20 h-20 md:w-28 md:h-28 bg-white rounded-2xl border border-gray-100 p-2 flex-shrink-0 shadow-sm group-hover:border-orange-200 transition-colors relative">
                                                        <div className="absolute top-1 left-1 md:top-2 md:left-2 w-5 h-5 md:w-6 md:h-6 bg-gray-900 text-white text-[9px] md:text-[10px] font-black flex items-center justify-center rounded-lg z-10">{item.nu_quantidade || item.quantidade}x</div>
                                                        <img src={getFullImageUrl(item.url_imagem)} alt={item.ds_nome} className="w-full h-full object-contain mix-blend-multiply" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-[8px] md:text-[9px] font-black text-orange-500 uppercase tracking-widest mb-1">Cód: {item.nu_ddm}</p>
                                                        <h3 className="font-black text-gray-900 uppercase text-xs md:text-sm leading-tight mb-1 line-clamp-2">{item.ds_nome}</h3>
                                                        <p className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-wide">Marca: {item.ds_marca || 'DDM'}</p>
                                                        <div className="hidden sm:block mt-2"><p className="text-lg font-black text-gray-900 tracking-tighter">{formatCurrency(Number(item.nu_preco_unitario) * (item.nu_quantidade || item.quantidade))}</p></div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center justify-between w-full sm:w-auto sm:flex-1 sm:justify-end gap-4 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-50">
                                                    <div className="flex items-center bg-gray-100 rounded-xl p-1 h-9">
                                                        <button className="w-8 h-full flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-600 hover:text-orange-600 transition-colors disabled:opacity-50" onClick={() => updateQuantityMutation.mutate({ item, newQuantity: (item.nu_quantidade || item.quantidade) - 1 })}><Minus className="w-3 h-3" /></button>
                                                        <span className="w-8 text-center font-black text-xs md:text-sm text-gray-900">{item.nu_quantidade || item.quantidade}</span>
                                                        <button className="w-8 h-full flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-600 hover:text-orange-600 transition-colors" onClick={() => updateQuantityMutation.mutate({ item, newQuantity: (item.nu_quantidade || item.quantidade) + 1 })}><Plus className="w-3 h-3" /></button>
                                                    </div>
                                                    <div className="sm:hidden text-right"><p className="font-black text-sm text-gray-900">{formatCurrency(Number(item.nu_preco_unitario) * (item.nu_quantidade || item.quantidade))}</p></div>
                                                    <button onClick={() => removeItemMutation.mutate(item)} className="text-gray-300 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 ml-2" title="Remover item"><Trash2 className="w-4 h-4 md:w-5 md:h-5" /></button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                            <div className="bg-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-lg border border-gray-100">
                                <div className="flex items-center gap-3 mb-4"><div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center"><Truck className="w-4 h-4 text-orange-600" /></div><h3 className="font-black text-gray-900 uppercase text-xs tracking-widest">Estimativa de Frete</h3></div>
                                <ShippingCalculator id_produto={cartItems[0]?.id_produto} onSelectShipping={setSelectedShipping} selectedShipping={selectedShipping} compact={false} />
                            </div>
                        </div>
                        <div className="relative">
                            <div className="lg:sticky lg:top-28 space-y-6">
                                <Card className="rounded-[1.5rem] md:rounded-[2rem] border-none shadow-2xl shadow-gray-200/50 bg-gray-900 text-white overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
                                    <CardHeader className="p-6 md:p-8 border-b border-gray-800"><CardTitle className="text-xs md:text-sm font-black uppercase tracking-[0.2em] italic">Resumo do Pedido</CardTitle></CardHeader>
                                    <CardContent className="p-6 md:p-8 space-y-6 relative z-10">
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-xs font-bold uppercase text-gray-400"><span>Subtotal</span><span className="text-white">{formatCurrency(subtotal)}</span></div>
                                            <div className="flex justify-between text-xs font-bold uppercase text-gray-400"><span>Frete</span><span className={selectedShipping ? "text-white" : "text-orange-500"}>{selectedShipping ? formatCurrency(shippingCost) : "Não calculado"}</span></div>
                                        </div>
                                        <div className="pt-6 border-t border-gray-800"><div className="flex justify-between items-end mb-1"><span className="font-black text-sm uppercase text-gray-300">Total</span><span className="text-2xl md:text-3xl font-black text-white tracking-tighter">{formatCurrency(total)}</span></div><p className="text-[9px] md:text-[10px] text-gray-500 text-right uppercase font-bold tracking-wide">ou {formatCurrency(total * 0.95)} no PIX</p></div>
                                        <Button onClick={() => navigate('/checkout')} className="w-full h-14 md:h-16 bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-orange-900/30 group transition-all hover:scale-[1.02]">Fechar Pedido <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" /></Button>
                                        <div className="flex items-center justify-center gap-2 opacity-40"><Shield className="w-3 h-3 text-gray-300" /><span className="text-[9px] font-bold uppercase text-gray-300 tracking-widest">Compra Segura DDM</span></div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 md:py-32 text-center">
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-100 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center mb-6 md:mb-8 rotate-3 shadow-inner"><ShoppingCart className="w-10 h-10 md:w-12 md:h-12 text-gray-300" /></div>
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900 uppercase italic mb-3 md:mb-4 tracking-tighter">Seu Carrinho está Vazio</h2>
                        <p className="text-gray-400 font-medium max-w-xs md:max-w-md mx-auto mb-8 md:mb-10 text-xs md:text-sm">Parece que você ainda não adicionou peças técnicas ao seu pedido.</p>
                        <Button asChild className="bg-gray-900 hover:bg-orange-600 text-white font-black uppercase tracking-widest px-8 md:px-10 h-12 md:h-14 rounded-xl shadow-xl transition-all hover:scale-105 text-xs md:text-sm"><Link to="/catalogo">Acessar Catálogo</Link></Button>
                    </div>
                )}
            </div>
        </div>
    );
}