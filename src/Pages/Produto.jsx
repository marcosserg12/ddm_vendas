import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { __ddmDatabase, getFullImageUrl } from '../api/MysqlServer.js';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ShoppingCart, ArrowLeft, Check, Minus, Plus,
    Package, Truck, Shield, RotateCcw, Loader2, Info,
    Search, ChevronDown, X
} from 'lucide-react';
import { Button } from '../Components/ui/button';
import { Badge } from '../Components/ui/badge';
import { toast } from 'sonner';

import ProductPrice from '../Components/product/ProductPrice';
import ShippingCalculator from '../Components/shipping/ShippingCalculator';
import ProductImageGallery from '../Components/product/ProductImageGallery';
import MobileStickyBuy from '../Components/product/MobileStickyBuy';
import ResponsiveSpecsTable from '../Components/product/ResponsiveSpecsTable';

export default function Produto() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    const [quantity, setQuantity] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);
    const [selectedShipping, setSelectedShipping] = useState(null);

    // 1. Busca Dados Gerais do Produto
    const { data: product, isLoading: isLoadingProduct } = useQuery({
        queryKey: ['product', productId],
        queryFn: async () => {
            const list = await __ddmDatabase.entities.Produtos.list();
            return list.find(p => String(p.id_produto) === String(productId)) || null;
        },
        enabled: !!productId
    });

    // 2. Busca TODAS as Imagens
    const { data: productImages = [] } = useQuery({
        queryKey: ['productImagesDetail', productId],
        queryFn: () => __ddmDatabase.entities.ProdutoImagens.listByProduct(productId),
        enabled: !!productId
    });

    // 3. Busca Todos os Modelos para cruzar os nomes
    const { data: allModelos = [] } = useQuery({
        queryKey: ['allModelosList'],
        queryFn: () => __ddmDatabase.entities.Modelos.list()
    });

    // 4. LÓGICA DE COMPATIBILIDADE (Memoizada)
    const compatibleModels = useMemo(() => {
        if (!product?.modelos_ids || allModelos.length === 0) return [];

        const ids = typeof product.modelos_ids === 'string'
            ? product.modelos_ids.split(',').map(Number)
            : [product.modelos_ids];

        return allModelos.filter(m => ids.includes(m.id_modelo));
    }, [product, allModelos]);


    // 5. Lógica de Adicionar ao Carrinho
    const addToCartMutation = useMutation({
        mutationFn: async () => {
            const user = JSON.parse(localStorage.getItem('ddm_user'));
            const sessionId = localStorage.getItem('ddm_session');

            // Padronização do objeto
            const cartItem = {
                id_produto: product.id_produto,
                ds_nome: product.ds_nome,
                nu_ddm: product.nu_ddm,
                url_imagem: product.url_imagem,
                nu_quantidade: quantity,
                quantidade: quantity, 
                nu_preco_unitario: product.nu_preco_venda_atual,
                nu_peso: product.nu_peso || 0.5
            };

            // --- 1. GESTÃO DE PERSISTÊNCIA (O AJUSTE ESTÁ AQUI) ---
            if (user?.id_usuario) {
                // Se o usuário está LOGADO, não queremos lixo no localStorage
                // Limpamos para garantir que a sincronização automática não duplique nada
                localStorage.removeItem('ddm_cart');
            } else {
                // Se for VISITANTE, salvamos no local normalmente
                const currentCart = JSON.parse(localStorage.getItem('ddm_cart') || '[]');
                const existingIndex = currentCart.findIndex(item => String(item.id_produto) === String(product.id_produto));

                if (existingIndex > -1) {
                    currentCart[existingIndex].nu_quantidade += quantity;
                    currentCart[existingIndex].quantidade += quantity;
                } else {
                    currentCart.push({ ...cartItem, id_carrinho: `local_${Date.now()}` });
                }
                localStorage.setItem('ddm_cart', JSON.stringify(currentCart));
            }

            // --- 2. SALVAR NO BANCO (MySQL) ---
            // O fetch continua sendo enviado, pois ele é a nossa fonte principal agora
            try {
                await fetch('http://localhost:3001/api/carrinho', {
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
            } catch (err) {
                console.warn("Offline: Salvo apenas localmente");
            }
        },
        onSuccess: () => {
            setAddedToCart(true);
            toast.success('Peça adicionada ao carrinho!');
            
            // ESSENCIAL: Invalida a query do Layout para o número atualizar na hora
            queryClient.invalidateQueries({ queryKey: ['cartItemsHybrid'] });
            
            window.dispatchEvent(new Event('cartUpdated'));
            setTimeout(() => setAddedToCart(false), 2000);
        }
    });

    const handleBuyNow = async () => {
        await addToCartMutation.mutateAsync();
        navigate('/carrinho');
    };

    if (isLoadingProduct) {
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

    const galleryImages = productImages.length > 0
        ? productImages.map(img => getFullImageUrl(img.url_imagem))
        : [getFullImageUrl(product.url_imagem)];

    return (
        <div className="bg-white min-h-screen pb-32 md:pb-12 font-sans">

            {/* Navegação Superior */}
            <div className="border-b bg-gray-50/50 sticky top-0 z-40 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
                    <Link to="/catalogo" className="flex items-center text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-orange-600 transition-colors">
                        <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 mr-2" /> <span className="hidden md:inline">Voltar para Peças</span><span className="md:hidden">Voltar</span>
                    </Link>
                    <Badge variant="outline" className="border-gray-200 text-gray-400 font-black uppercase text-[8px] md:text-[9px] tracking-widest">
                        Ref: {product.nu_referencia || 'N/A'}
                    </Badge>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
                <div className="grid lg:grid-cols-2 gap-8 md:gap-12">

                    {/* Galeria */}
                    <div className="space-y-4">
                        <ProductImageGallery
                            images={galleryImages}
                            productName={product.ds_nome}
                            marca={product.ds_marca}
                            inStock={inStock}
                        />
                        <div className="hidden md:flex bg-gray-900 text-white p-6 rounded-3xl items-center gap-4 shadow-xl shadow-gray-200">
                            <Info className="text-orange-500 w-6 h-6 shrink-0" />
                            <p className="text-[10px] font-bold uppercase leading-relaxed tracking-tight text-gray-300">
                                Esta peça é produzida seguindo rigorosos padrões de dureza e resistência mecânica.
                            </p>
                        </div>
                    </div>

                    {/* Lado das Informações e Compra */}
                    <div className="flex flex-col">
                        <div className="mb-6 md:mb-8">
                            <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-3 md:mb-4">
                                <Badge className="bg-orange-500 text-white font-black italic tracking-tighter rounded-lg text-[9px] md:text-xs">DDM ORIGINAL</Badge>
                                <span className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Cód: {product.nu_ddm}</span>
                            </div>
                            <h1 className="text-2xl md:text-3xl lg:text-5xl font-black text-gray-900 uppercase italic tracking-tighter leading-[0.95] mb-2 md:mb-4">
                                {product.ds_nome}
                            </h1>

                            {/* --- SELECT DE COMPATIBILIDADE COM BUSCA --- */}
                            <div className="mt-4 mb-4">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                                    Compatível com os modelos:
                                </p>

                                {compatibleModels.length > 0 ? (
                                    <SearchableCompatibilitySelect models={compatibleModels} />
                                ) : (
                                    <Badge variant="outline" className="text-gray-400 border-dashed border-gray-300 py-2 px-4 rounded-xl text-xs">
                                        Aplicação Universal ou não especificada
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Bloco de Preço */}
                        <div className="bg-gray-50 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border-2 border-gray-100 mb-6 md:mb-8">
                            <ProductPrice
                                preco={product.nu_preco_venda_atual}
                                precoPromocional={null}
                                size="lg"
                            />
                            <p className="text-[8px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest mt-3 md:mt-4">Venda sujeita a disponibilidade de estoque técnico</p>
                        </div>

                        {/* Ações de Compra Desktop */}
                        <div className="hidden lg:block space-y-4">
                            {inStock ? (
                                <>
                                    <div className="flex gap-4">
                                        <div className="flex items-center bg-white border-2 border-gray-100 rounded-2xl px-2 w-32">
                                            <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="hover:bg-transparent"><Minus className="w-4 h-4"/></Button>
                                            <span className="flex-1 text-center font-black">{quantity}</span>
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
                                            {addedToCart ? 'Adicionado' : 'Adicionar ao Carrinho'}
                                        </Button>
                                    </div>
                                    <Button
                                        onClick={handleBuyNow}
                                        className="w-full h-16 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-orange-500/20"
                                    >
                                        Compra Agora
                                    </Button>
                                </>
                            ) : (
                                <Badge className="bg-red-50 text-red-600 p-4 rounded-xl border-none font-black uppercase text-center w-full">Indisponível no Momento</Badge>
                            )}
                        </div>

                        {/* Calculadora de Frete */}
                        <div className="mt-6 md:mt-10 pt-6 md:pt-10 border-t border-gray-100">
                            <ShippingCalculator
                                id_produto={product.id_produto}
                                onSelectShipping={setSelectedShipping}
                                selectedShipping={selectedShipping}
                            />
                        </div>

                        {/* Selos */}
                        <div className="mt-6 md:mt-10 grid grid-cols-3 gap-2 md:gap-4">
                            <TrustBadge icon={Truck} label="Envio Express" />
                            <TrustBadge icon={Shield} label="Garantia Técnica" />
                            <TrustBadge icon={RotateCcw} label="Devolução 7d" />
                        </div>
                    </div>
                </div>

                {/* Tabela de Especificações */}
                <div className="mt-12 md:mt-20">
                    <div className="flex items-center gap-4 mb-6 md:mb-8">
                        <div className="h-px bg-gray-100 flex-1" />
                        <h2 className="text-lg md:text-xl font-black uppercase italic tracking-tighter text-gray-900">Ficha <span className="text-orange-500">Técnica</span></h2>
                        <div className="h-px bg-gray-100 flex-1" />
                    </div>
                    <ResponsiveSpecsTable product={product} />
                </div>
            </div>

            {/* Sticky Mobile */}
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

// --- SUB-COMPONENTES ---

function TrustBadge({ icon: Icon, label }) {
    return (
        <div className="flex flex-col items-center p-3 md:p-4 bg-gray-50 rounded-xl md:rounded-2xl border border-transparent hover:border-gray-100 transition-colors">
            <Icon className="w-4 h-4 md:w-5 md:h-5 text-orange-500 mb-1 md:mb-2" />
            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-tight text-gray-400 text-center leading-tight">{label}</span>
        </div>
    );
}

// Componente Customizado para Select com Pesquisa
function SearchableCompatibilitySelect({ models }) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const wrapperRef = useRef(null);

    // Fecha ao clicar fora
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    const filteredModels = models.filter(model =>
        model.ds_modelo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="relative w-full md:w-2/3" ref={wrapperRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full bg-gray-50 border border-gray-200 text-gray-700 font-bold h-12 px-4 rounded-xl hover:bg-gray-100 transition-colors text-sm"
            >
                <span>{models.length} Modelos Compatíveis</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-2 border-b border-gray-50 sticky top-0 bg-white">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar modelo..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                        {filteredModels.length > 0 ? (
                            filteredModels.map((model) => (
                                <div
                                    key={model.id_modelo}
                                    className="px-4 py-2 hover:bg-orange-50 rounded-lg cursor-default transition-colors"
                                >
                                    <p className="text-sm font-bold text-gray-700">{model.ds_modelo}</p>
                                    {/* Se quiser mostrar a marca, precisa garantir que ela venha no objeto ou fazer join */}
                                    {model.ds_marca && <p className="text-[10px] text-gray-400 font-black uppercase">{model.ds_marca}</p>}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-center text-xs text-gray-400">
                                Nenhum modelo encontrado.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}