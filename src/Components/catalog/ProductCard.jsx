import React from 'react';
import { Link } from 'react-router-dom';
import { Cog, ShoppingCart, Loader2, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { __ddmDatabase, getFullImageUrl } from '../../api/MysqlServer.js';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function ProductCard({ product }) {
    const queryClient = useQueryClient();

    const addToCartMutation = useMutation({
        mutationFn: async () => {
            // Busca o usuário que salvamos no LocalStorage durante o Login
            const user = JSON.parse(localStorage.getItem('ddm_user'));

            // Opcional: Se não houver usuário, redireciona para login
            if (!user || user.id_perfil !== 1) {
                window.location.href = '/login';
            }

            let sessionId = localStorage.getItem('ddm_session');
            if (!sessionId) {
                sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
                localStorage.setItem('ddm_session', sessionId);
            }

            const cartData = {
                session_id: sessionId,
                id_usuario: user ? user.id_usuario : null,
                id_produto: product.id_produto,
                ds_nome: product.ds_nome,
                nu_ddm: product.nu_ddm,
                url_imagem: product.url_imagem,
                nu_quantidade: 1,
                nu_preco_unitario: product.nu_preco_venda_atual
            };

            return await __ddmDatabase.entities.Carrinho.create(cartData);
        },
        onSuccess: () => {
            toast.success(`${product.ds_nome} adicionado ao carrinho!`, {
                icon: <CheckCircle2 className="text-green-500" />,
            });
            queryClient.invalidateQueries({ queryKey: ['carrinho'] });
            window.dispatchEvent(new Event('cartUpdated'));
        },
        onError: () => {
            toast.error('Não foi possível adicionar ao carrinho.');
        }
    });

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    };

    const hasStock = (Number(product.nu_estoque_atual) || 0) > 0;
    const productLink = `/produto?id=${product.id_produto}`;

    return (
        <Card className="group h-full overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-200 bg-white flex flex-col relative rounded-2xl">
            {/* Imagem do Produto */}
            <Link to={productLink} className="relative h-64 bg-gray-50 overflow-hidden block">
                {product.url_imagem ? (
                    <img
                        src={getFullImageUrl(product.url_imagem)}
                        alt={product.ds_nome}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-300">
                        <Cog className="w-12 h-12 mb-2 animate-spin-slow" />
                        <span className="text-[10px] font-black uppercase">Sem Imagem</span>
                    </div>
                )}

                {/* Badge de Marca */}
                <div className="absolute top-3 left-3">
                    <Badge className="bg-gray-900/90 backdrop-blur-md text-white border-none shadow-lg px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                        {product.ds_marca || 'Original'}
                    </Badge>
                </div>

                {!hasStock && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                        <Badge variant="outline" className="text-red-600 border-red-600 font-black bg-white shadow-xl scale-125 px-4 py-1">
                            ESGOTADO
                        </Badge>
                    </div>
                )}
            </Link>

            <CardContent className="p-5 flex-grow flex flex-col">
                <div className="flex-grow">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[9px] font-black text-orange-600 bg-orange-50 px-2 py-1 rounded uppercase tracking-tighter">
                            Cód: {product.nu_ddm}
                        </span>
                    </div>

                    <Link to={productLink}>
                        <h3 className="text-sm font-bold text-gray-800 line-clamp-2 min-h-[40px] group-hover:text-orange-600 transition-colors leading-tight">
                            {product.ds_nome}
                        </h3>
                    </Link>

                    <div className="mt-4 mb-4">
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-gray-900 tracking-tighter">
                                {formatCurrency(product.nu_preco_venda_atual)}
                            </span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">
                            à vista ou 10x de {formatCurrency(product.nu_preco_venda_atual / 10)}
                        </p>
                    </div>
                </div>

                <div className="flex gap-2 mt-auto pt-4 border-t border-gray-100">
                    <Link to={productLink} className="flex-1">
                        <Button 
                            variant="outline" 
                            className="w-full h-11 text-[10px] font-black uppercase tracking-widest border-2 hover:bg-gray-900 hover:text-white transition-all"
                        >
                            Ver Detalhes
                        </Button>
                    </Link>
                    
                    {hasStock && (
                        <Button
                            onClick={(e) => {
                                e.preventDefault();
                                addToCartMutation.mutate();
                            }}
                            disabled={addToCartMutation.isPending}
                            className="h-11 w-12 bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/20"
                        >
                            {addToCartMutation.isPending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <ShoppingCart className="w-5 h-5" />
                            )}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}