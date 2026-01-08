import React from 'react';
import { Link } from 'react-router-dom';
// Removido: import { createPageUrl } from '../../utils'; (Isso não existe localmente)
import { Cog, ArrowRight, ShoppingCart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
// CORREÇÃO: Caminho correto da API
import { base44 } from '../../api/base44Client';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function ProductCard({ product }) {
    const queryClient = useQueryClient();

    const { data: user } = useQuery({
        queryKey: ['currentUser'],
        queryFn: async () => {
            // Verificação de segurança caso auth não esteja implementado ainda
            if (!base44.auth) return null;

            const isAuth = await base44.auth.isAuthenticated();
            if (isAuth) return base44.auth.me();
            return null;
        }
    });

    const addToCartMutation = useMutation({
        mutationFn: async () => {
            const cartData = {
                produto_id: product.id,
                produto_nome: product.nome,
                num_ddm: product.num_ddm,
                imagem_url: product.imagem_url,
                quantidade: 1,
                preco_unitario: product.preco_promocional || product.preco,
                peso_kg: product.peso_kg || 0.5
            };

            // Lógica de Sessão vs Login
            if (user?.email) {
                cartData.user_email = user.email;
                // Nota: Seu base44Client precisa ter o método .filter() implementado ou usar .list() e filtrar aqui
                const allItems = await base44.entities.CartItem.list();
                const existingItems = allItems.filter(item =>
                    item.user_email === user.email && item.produto_id === product.id
                );

                if (existingItems.length > 0) {
                    await base44.entities.CartItem.update(existingItems[0].id, {
                        quantidade: existingItems[0].quantidade + 1
                    });
                } else {
                    await base44.entities.CartItem.create(cartData);
                }
            } else {
                const sessionId = localStorage.getItem('ddm_session') ||
                    `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                localStorage.setItem('ddm_session', sessionId);
                cartData.session_id = sessionId;

                const allItems = await base44.entities.CartItem.list();
                const existingItems = allItems.filter(item =>
                    item.session_id === sessionId && item.produto_id === product.id
                );

                if (existingItems.length > 0) {
                    await base44.entities.CartItem.update(existingItems[0].id, {
                        quantidade: existingItems[0].quantidade + 1
                    });
                } else {
                    await base44.entities.CartItem.create(cartData);
                }
            }

            // Dispara evento para atualizar o carrinho no topo da página
            window.dispatchEvent(new Event('cartUpdated'));
        },
        onSuccess: () => {
            toast.success('Adicionado ao carrinho!');
            queryClient.invalidateQueries({ queryKey: ['cartItems'] });
        },
        onError: () => {
            toast.error('Erro ao adicionar ao carrinho');
        }
    });

    const categoryNames = {
        sapatas: 'Sapatas',
        coxins_batentes: 'Coxins/Batentes',
        protecoes_sanfonadas: 'Proteções',
        molas: 'Molas',
        outros: 'Outros'
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    const hasDiscount = product.preco_promocional && product.preco_promocional < product.preco;
    const finalPrice = hasDiscount ? product.preco_promocional : product.preco;
    const inStock = (product.estoque || 0) > 0;

    // Definição manual do link para não depender do 'createPageUrl'
    const productLink = `/produto?id=${product.id}`;

    return (
        <Card className="group h-full overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 bg-white">
            {/* Image */}
            <Link to={productLink}>
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                    {product.imagem_url ? (
                        <img
                            src={product.imagem_url}
                            alt={product.nome}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Cog className="w-20 h-20 text-gray-300" />
                        </div>
                    )}

                    {/* Brand Badge */}
                    <div className="absolute top-3 left-3">
                        <Badge className="bg-orange-500 text-white font-semibold">
                            {product.marca}
                        </Badge>
                    </div>

                    {/* Discount Badge */}
                    {hasDiscount && (
                        <div className="absolute top-3 right-3">
                            <Badge className="bg-green-500 text-white">
                                -{Math.round((1 - product.preco_promocional / product.preco) * 100)}%
                            </Badge>
                        </div>
                    )}

                    {/* Stock Badge */}
                    {!inStock && (
                        <div className="absolute bottom-3 right-3">
                            <Badge className="bg-red-500 text-white">Indisponível</Badge>
                        </div>
                    )}
                </div>
            </Link>

            {/* Content */}
            <CardContent className="p-4">
                {/* SKU */}
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">
                        {product.num_ddm}
                    </span>
                    <span className="text-gray-300">|</span>
                    <span>{categoryNames[product.categoria] || product.categoria}</span>
                </div>

                {/* Product Name */}
                <Link to={productLink}>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-600 transition-colors min-h-[48px]">
                        {product.nome}
                    </h3>
                </Link>

                {/* Price */}
                <div className="mb-3">
                    {hasDiscount && (
                        <p className="text-sm text-gray-400 line-through">
                            {formatCurrency(product.preco)}
                        </p>
                    )}
                    <p className="text-xl font-bold text-gray-900">
                        {formatCurrency(finalPrice)}
                    </p>
                    <p className="text-xs text-green-600">
                        {formatCurrency(finalPrice * 0.95)} no PIX
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <Link to={productLink} className="flex-1">
                        <Button variant="outline" className="w-full text-sm">
                            Ver Detalhes
                        </Button>
                    </Link>
                    {inStock && (
                        <Button
                            size="icon"
                            className="bg-orange-500 hover:bg-orange-600 flex-shrink-0"
                            onClick={(e) => {
                                e.preventDefault();
                                addToCartMutation.mutate();
                            }}
                            disabled={addToCartMutation.isPending}
                        >
                            <ShoppingCart className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}