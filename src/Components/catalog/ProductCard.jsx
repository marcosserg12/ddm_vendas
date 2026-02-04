import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Check, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { getFullImageUrl, __ddmDatabase } from '../../api/MysqlServer';

// 1. Importação essencial para atualizar o Layout em tempo real
import { useQueryClient } from '@tanstack/react-query';

export default function ProductCard({ product, viewMode = 'grid' }) {
    // 2. Inicialização do Query Client
    const queryClient = useQueryClient();

    const [quantity, setQuantity] = useState(1);
    const [isAdded, setIsAdded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const formatPrice = (val) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(val || 0);

    const handleQuantity = (e, type) => {
        e.preventDefault();
        e.stopPropagation();
        if (type === 'inc') setQuantity(q => q + 1);
        if (type === 'dec') setQuantity(q => Math.max(1, q - 1));
    };

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (isLoading) return;
        setIsLoading(true);

        const user = JSON.parse(localStorage.getItem('ddm_user'));
        const sessionId = localStorage.getItem('ddm_session');

        // PAYLOAD COMPLETO
        const productPayload = {
            id_produto: product.id_produto,
            ds_nome: product.ds_nome,
            nu_ddm: product.nu_ddm,
            ds_marca: product.ds_marca,
            url_imagem: product.url_imagem,
            nu_preco_unitario: product.nu_preco_venda_atual,
            nu_peso: product.nu_peso || 0.5,
            nu_quantidade: quantity,
            quantidade: quantity 
        };

        // --- 1. LÓGICA DE PERSISTÊNCIA INTELIGENTE ---
        try {
            if (user?.id_usuario) {
                // SE ESTIVER LOGADO: 
                // 1. Limpamos o lixo do localStorage para evitar que o "useEffect de sincronização" duplique os itens
                localStorage.removeItem('ddm_cart');
            } else {
                // SE FOR VISITANTE:
                // Gravamos no localStorage normalmente
                const currentCart = JSON.parse(localStorage.getItem('ddm_cart') || '[]');
                const existingIndex = currentCart.findIndex(item => String(item.id_produto) === String(product.id_produto));

                if (existingIndex > -1) {
                    currentCart[existingIndex].quantidade += quantity;
                    currentCart[existingIndex].nu_quantidade += quantity;
                } else {
                    currentCart.push({
                        ...productPayload,
                        id_carrinho: `local_${Date.now()}`
                    });
                }
                localStorage.setItem('ddm_cart', JSON.stringify(currentCart));
            }
            
            // Avisa componentes legados
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (localError) {
            console.error("Erro no processamento local:", localError);
        }

        // --- 2. SINCRONIZAÇÃO COM O BANCO (MYSQL) ---
        try {
            const response = await fetch('http://localhost:3001/api/carrinho', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id_usuario: user?.id_usuario || null,
                    id_produto: product.id_produto,
                    session_id: sessionId,
                    ds_nome: product.ds_nome,
                    nu_ddm: product.nu_ddm,
                    url_imagem: product.url_imagem,
                    nu_quantidade: quantity,
                    nu_preco_unitario: product.nu_preco_venda_atual
                })
            });

            if (response.ok) {
                // 3. ATUALIZAÇÃO GLOBAL
                // Como você está logado, o Layout e o Carrinho vão ler do banco através desta invalidação
                queryClient.invalidateQueries({ queryKey: ['cartItemsHybrid'] });
            }
        } catch (serverError) {
            console.warn("⚠️ Falha ao salvar no MySQL:", serverError);
        }

        setIsLoading(false);
        setIsAdded(true);
        toast.success(`Adicionado ao carrinho!`);

        setTimeout(() => {
            setIsAdded(false);
            setQuantity(1);
        }, 2000);
    };

    const hasStock = (Number(product.nu_estoque_atual) || 0) > 0;

    // --- RENDERIZAÇÃO GRID ---
    if (viewMode === 'grid') {
        return (
            <div className="group bg-white rounded-xl border border-gray-200/60 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full overflow-hidden w-full">
                <Link to={`/produto?id=${product.id_produto}`} className="h-32 md:h-48 p-3 md:p-3 flex items-center justify-center bg-white relative border-b border-gray-50 w-full">
                    <img src={getFullImageUrl(product.url_imagem)} alt={product.ds_nome} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" />
                    {!hasStock && <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-10"><Badge variant="destructive" className="font-bold uppercase text-[9px] px-2 py-0.5 shadow-sm">Esgotado</Badge></div>}
                </Link>
                <div className="p-3 md:p-4 flex flex-col flex-1 w-full">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Cód: {product.nu_ddm}</span>
                        {product.ds_marca && <span className="text-[9px] font-bold text-gray-500 bg-gray-50 px-1.5 rounded-sm truncate max-w-[80px]">{product.ds_marca}</span>}
                    </div>
                    <Link to={`/produto?id=${product.id_produto}`} className="block mb-2 md:mb-4">
                        <h3 className="font-black text-gray-900 text-xs md:text-sm leading-tight line-clamp-2 h-8 md:h-10 group-hover:text-orange-600 transition-colors" title={product.ds_nome}>{product.ds_nome}</h3>
                    </Link>
                    <div className="mt-auto space-y-2 md:space-y-3">
                        <div>
                            <p className="text-[9px] font-semibold text-gray-400 uppercase mb-0.5 hidden md:block">Valor Un.</p>
                            <div className="flex items-baseline gap-0.5"><span className="text-[10px] text-gray-500 font-medium">R$</span><span className="text-lg md:text-xl font-black text-gray-900 tracking-tight">{formatPrice(product.nu_preco_venda_atual)}</span></div>
                        </div>
                        {hasStock ? (
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center justify-between border border-gray-200 rounded-lg bg-gray-50/50 h-8 md:h-9 px-1">
                                    <button onClick={(e) => handleQuantity(e, 'dec')} className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-orange-600 active:scale-90"><Minus className="w-3 h-3" /></button>
                                    <span className="text-xs md:text-sm font-black text-gray-900 tabular-nums">{quantity}</span>
                                    <button onClick={(e) => handleQuantity(e, 'inc')} className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-orange-600 active:scale-90"><Plus className="w-3 h-3" /></button>
                                </div>
                                <Button onClick={handleAddToCart} disabled={isLoading} className={`w-full h-9 md:h-10 rounded-lg font-black uppercase text-[10px] tracking-widest transition-all shadow-sm ${isAdded ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-900 hover:bg-orange-600 text-white'}`}>
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : isAdded ? <div className="flex items-center gap-1.5 animate-in fade-in zoom-in"><Check className="w-3.5 h-3.5" /> <span>Adicionado</span></div> : <div className="flex items-center gap-1.5"><ShoppingCart className="w-3.5 h-3.5" /> <span>Carrinho</span></div>}
                                </Button>
                            </div>
                        ) : <Button disabled className="w-full h-8 md:h-10 bg-gray-100 text-gray-400 font-bold text-[9px] md:text-[10px] uppercase rounded-lg border border-gray-200">Indisponível</Button>}
                    </div>
                </div>
            </div>
        );
    }

    // --- RENDERIZAÇÃO LISTA ---
    return (
        <div className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-300 flex flex-row overflow-hidden w-full h-auto min-h-[140px]">
            <Link to={`/produto?id=${product.id_produto}`} className="w-28 sm:w-48 bg-white border-r border-gray-100 p-2 sm:p-4 flex items-center justify-center shrink-0 relative">
                <img src={getFullImageUrl(product.url_imagem)} alt={product.ds_nome} className="w-full h-24 sm:h-32 object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" />
                {!hasStock && <div className="absolute inset-0 bg-white/60 flex items-center justify-center"><Badge variant="destructive" className="font-bold text-[9px] uppercase">Esgotado</Badge></div>}
            </Link>
            <div className="flex flex-1 flex-col justify-between p-3 sm:p-5 w-full">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider bg-gray-50 px-1.5 rounded">Cód: {product.nu_ddm}</span>
                        {product.ds_marca && <Badge variant="outline" className="text-[9px] font-bold text-gray-500 border-gray-200 hidden sm:flex">{product.ds_marca}</Badge>}
                    </div>
                    <Link to={`/produto?id=${product.id_produto}`}><h3 className="font-black text-gray-900 text-xs sm:text-lg leading-tight hover:text-orange-600 transition-colors line-clamp-2">{product.ds_nome}</h3></Link>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 mt-2">
                    <div className="flex items-baseline gap-1"><span className="text-[10px] text-gray-500 font-medium">R$</span><span className="text-lg sm:text-2xl font-black text-gray-900">{formatPrice(product.nu_preco_venda_atual)}</span></div>
                    {hasStock ? (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="flex items-center justify-between border border-gray-200 rounded-lg bg-gray-50/50 h-8 sm:h-9 px-1 w-24 sm:w-28 shrink-0">
                                <button onClick={(e) => handleQuantity(e, 'dec')} className="w-7 h-full flex items-center justify-center text-gray-400 hover:text-orange-600"><Minus className="w-3 h-3" /></button>
                                <span className="text-xs font-black text-gray-900">{quantity}</span>
                                <button onClick={(e) => handleQuantity(e, 'inc')} className="w-7 h-full flex items-center justify-center text-gray-400 hover:text-orange-600"><Plus className="w-3 h-3" /></button>
                            </div>
                            <Button onClick={handleAddToCart} disabled={isLoading} className={`flex-1 h-8 sm:h-9 rounded-lg font-black uppercase text-[9px] sm:text-[10px] tracking-widest transition-all ${isAdded ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-900 hover:bg-orange-600'}`}>
                                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin"/> : (isAdded ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />)}
                                <span className="ml-1 sm:ml-2">{isAdded ? 'Adicionado' : 'Adicionar ao Carrinho'}</span>
                            </Button>
                        </div>
                    ) : <span className="text-[10px] font-bold text-gray-400 uppercase bg-gray-100 px-3 py-1 rounded-lg">Indisponível</span>}
                </div>
            </div>
        </div>
    );
}