import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { __ddmDatabase, getFullImageUrl } from '../api/MysqlServer.js';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ShoppingCart, ArrowLeft, Check, Minus, Plus,
    Package, Truck, Shield, RotateCcw, Loader2, Info
} from 'lucide-react';
import { Button } from '../Components/ui/button';
import { Badge } from '../Components/ui/badge';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../Components/ui/select";

import ProductPrice from '../Components/product/ProductPrice';
import ShippingCalculator from '../Components/shipping/ShippingCalculator';
import ProductImageGallery from '../Components/product/ProductImageGallery';
import MobileStickyBuy from '../Components/product/MobileStickyBuy';
import ResponsiveSpecsTable from '../Components/product/ResponsiveSpecsTable';

export default function Produto() {
    const navigate = useNavigate();
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    const [quantity, setQuantity] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);
    const [selectedShipping, setSelectedShipping] = useState(null);
    const queryClient = useQueryClient();

    // 1. Busca Dados do Produto no MySQL
    const { data: product, isLoading } = useQuery({
        queryKey: ['product', productId],
        queryFn: async () => {
            const list = await __ddmDatabase.entities.Produtos.list();
            return list.find(p => String(p.id_produto) === String(productId)) || null;
        },
        enabled: !!productId
    });

    // 2. Lógica de Adicionar ao Carrinho (Integrado com LocalStorage/Session)
    const addToCartMutation = useMutation({
        mutationFn: async () => {
            const cartItem = {
                id_produto: product.id_produto,
                ds_nome: product.ds_nome,
                nu_ddm: product.nu_ddm,
                url_imagem: product.url_imagem_principal,
                quantidade: quantity,
                nu_preco: product.nu_preco_venda_atual,
                nu_peso: product.nu_peso_kg || 0.5
            };

            // Pegamos o carrinho atual do localStorage
            const currentCart = JSON.parse(localStorage.getItem('ddm_cart') || '[]');
            
            // Verificamos se o item já existe
            const existingIndex = currentCart.findIndex(item => item.id_produto === product.id_produto);
            
            if (existingIndex > -1) {
                currentCart[existingIndex].quantidade += quantity;
            } else {
                currentCart.push(cartItem);
            }

            localStorage.setItem('ddm_cart', JSON.stringify(currentCart));
            // Dispara evento para o Header atualizar o contador
            window.dispatchEvent(new Event('cartUpdated'));
            
            await new Promise(resolve => setTimeout(resolve, 500)); // Simula latência
            return true;
        },
        onSuccess: () => {
            setAddedToCart(true);
            toast.success('Peça adicionada ao orçamento!');
            setTimeout(() => setAddedToCart(false), 2000);
            queryClient.invalidateQueries({ queryKey: ['cartItems'] });
        }
    });

    const handleBuyNow = async () => {
        await addToCartMutation.mutateAsync();
        navigate('/carrinho');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white">
                <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Carregando Especificações</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen py-20 bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h1 className="text-xl font-black uppercase italic tracking-tighter">Produto não catalogado</h1>
                    <Button asChild className="mt-6 bg-orange-500"><Link to="/catalogo">Voltar ao Catálogo</Link></Button>
                </div>
            </div>
        );
    }

    const inStock = product.st_ativo === 'S';

    return (
        <div className="bg-white min-h-screen pb-12">
            {/* Navegação Superior */}
            <div className="border-b bg-gray-50/50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link to="/catalogo" className="flex items-center text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-orange-600 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Peças
                    </Link>
                    <Badge variant="outline" className="border-gray-200 text-gray-400 font-black uppercase text-[9px] tracking-widest">
                        Ref: {product.ds_referencia || 'N/A'}
                    </Badge>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid lg:grid-cols-2 gap-12">
                    
                    {/* Galeria com Visual Industrial */}
                    <div className="space-y-4">
                        <ProductImageGallery
                            mainImage={getFullImageUrl(product.url_imagem_principal)}
                            images={[]} // Pode ser expandido se houver tb_produto_imagens
                            productName={product.ds_nome}
                            marca={product.ds_marca}
                            inStock={inStock}
                        />
                        <div className="bg-gray-900 text-white p-6 rounded-3xl flex items-center gap-4">
                            <Info className="text-orange-500 w-6 h-6 shrink-0" />
                            <p className="text-[10px] font-bold uppercase leading-relaxed tracking-tight text-gray-300">
                                Esta peça é produzida seguindo rigorosos padrões de dureza e resistência mecânica, garantindo compatibilidade total com {product.ds_marca}.
                            </p>
                        </div>
                    </div>

                    {/* Lado das Informações e Compra */}
                    <div className="flex flex-col">
                        <div className="mb-8">
                            <div className="flex items-center gap-3 mb-4">
                                <Badge className="bg-orange-500 text-white font-black italic tracking-tighter rounded-lg">DDM ORIGINAL</Badge>
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cód: {product.nu_ddm}</span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-gray-900 uppercase italic tracking-tighter leading-[0.9] mb-4">
                                {product.ds_nome}
                            </h1>
                            <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Fabricante: {product.ds_marca} | Série: {product.ds_serie || 'Universal'}</p>
                        </div>

                        {/* Bloco de Preço */}
                        <div className="bg-gray-50 p-8 rounded-[2rem] border-2 border-gray-100 mb-8">
                            <ProductPrice
                                preco={product.nu_preco_venda_atual}
                                precoPromocional={null}
                                size="lg"
                            />
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-4">Venda sujeita a disponibilidade de estoque técnico</p>
                        </div>

                        {/* Ações de Compra */}
                        {inStock ? (
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="flex items-center bg-white border-2 border-gray-100 rounded-2xl px-2">
                                        <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="hover:bg-transparent"><Minus className="w-4 h-4"/></Button>
                                        <span className="w-10 text-center font-black">{quantity}</span>
                                        <Button variant="ghost" size="icon" onClick={() => setQuantity(quantity + 1)} className="hover:bg-transparent"><Plus className="w-4 h-4"/></Button>
                                    </div>
                                    <Button 
                                        onClick={() => addToCartMutation.mutate()}
                                        disabled={addToCartMutation.isPending}
                                        className={`flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl transition-all ${
                                            addedToCart ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-900 hover:bg-black'
                                        }`}
                                    >
                                        {addedToCart ? <Check className="mr-2"/> : <ShoppingCart className="mr-2 w-4 h-4"/>}
                                        {addedToCart ? 'Adicionado' : 'Adicionar ao Orçamento'}
                                    </Button>
                                </div>
                                <Button 
                                    onClick={handleBuyNow}
                                    className="w-full h-16 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-orange-500/20"
                                >
                                    Finalizar Compra Agora
                                </Button>
                            </div>
                        ) : (
                            <Badge className="bg-red-50 text-red-600 p-4 rounded-xl border-none font-black uppercase text-center w-full">Indisponível no Momento</Badge>
                        )}

                        {/* Calculadora de Frete Industrial */}
                        <div className="mt-10 pt-10 border-t border-gray-100">
                            <ShippingCalculator
                                weightKg={product.nu_peso_kg || 0.5}
                                onSelectShipping={setSelectedShipping}
                                selectedShipping={selectedShipping}
                            />
                        </div>

                        {/* Selos de Confiança */}
                        <div className="mt-10 grid grid-cols-3 gap-4">
                            <TrustBadge icon={Truck} label="Envio Express" />
                            <TrustBadge icon={Shield} label="Garantia Técnica" />
                            <TrustBadge icon={RotateCcw} label="Devolução 7d" />
                        </div>
                    </div>
                </div>

                {/* Tabela de Especificações - tb_produtos possui campos como ds_material, ds_dimensoes, etc */}
                <div className="mt-20">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-px bg-gray-100 flex-1" />
                        <h2 className="text-xl font-black uppercase italic tracking-tighter text-gray-900">Ficha <span className="text-orange-500">Técnica</span></h2>
                        <div className="h-px bg-gray-100 flex-1" />
                    </div>
                    <ResponsiveSpecsTable product={product} />
                </div>
            </div>

            {/* Sticky Mobile (Opcional) */}
            <MobileStickyBuy
                product={product}
                quantity={quantity}
                setQuantity={setQuantity}
                onAddToCart={() => addToCartMutation.mutate()}
                onBuyNow={handleBuyNow}
                isAdding={addToCartMutation.isPending}
                addedToCart={addedToCart}
                inStock={inStock}
            />
        </div>
    );
}

function TrustBadge({ icon: Icon, label }) {
    return (
        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-100 transition-colors">
            <Icon className="w-5 h-5 text-orange-500 mb-2" />
            <span className="text-[9px] font-black uppercase tracking-tight text-gray-400 text-center">{label}</span>
        </div>
    );
}