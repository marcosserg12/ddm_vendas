import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// REMOVIDO: createPageUrl
import { base44 } from '../api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ShoppingCart, ArrowLeft, Check, Minus, Plus,
  Package, Truck, Shield, RotateCcw, Loader2
} from 'lucide-react';
import { Button } from '../Components/ui/button';
import { Badge } from '../Components/ui/badge';
// Trocado Skeleton por Loader2 para simplificar
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
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) return base44.auth.me();
      return null;
    }
  });

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      // Ajuste para .list().find() para compatibilidade
      const products = await base44.entities.Product.list();
      return products.find(p => String(p.id) === String(productId)) || null;
    },
    enabled: !!productId
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      const cartData = {
        produto_id: product.id,
        produto_nome: product.nome,
        num_ddm: product.num_ddm,
        imagem_url: product.imagem_url,
        quantidade: quantity,
        preco_unitario: product.preco_promocional || product.preco,
        peso_kg: product.peso_kg || 0.5
      };

      // Mock de lógica de carrinho
      const allCartItems = await base44.entities.CartItem.list();

      if (user?.email) {
        cartData.user_email = user.email;
        const existingItems = allCartItems.filter(item =>
            item.user_email === user.email && item.produto_id === product.id
        );
        if (existingItems.length > 0) {
          await base44.entities.CartItem.update(existingItems[0].id, {
            quantidade: existingItems[0].quantidade + quantity
          });
        } else {
          await base44.entities.CartItem.create(cartData);
        }
      } else {
        const sessionId = localStorage.getItem('ddm_session') ||
          `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('ddm_session', sessionId);
        cartData.session_id = sessionId;

        const existingItems = allCartItems.filter(item =>
            item.session_id === sessionId && item.produto_id === product.id
        );
        if (existingItems.length > 0) {
          await base44.entities.CartItem.update(existingItems[0].id, {
            quantidade: existingItems[0].quantidade + quantity
          });
        } else {
          await base44.entities.CartItem.create(cartData);
        }
      }

      window.dispatchEvent(new Event('cartUpdated'));
    },
    onSuccess: () => {
      setAddedToCart(true);
      toast.success('Produto adicionado ao carrinho!');
      setTimeout(() => setAddedToCart(false), 2000);
      queryClient.invalidateQueries({ queryKey: ['cartItems'] });
    }
  });

  const handleBuyNow = async () => {
    await addToCartMutation.mutateAsync();
    window.location.href = '/carrinho';
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen py-8 flex items-center justify-center">
         <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-gray-50 min-h-screen py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Package className="w-20 h-20 text-gray-300 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Produto não encontrado</h1>
          <p className="text-gray-600 mb-6">O produto que você procura não existe ou foi removido.</p>
          <Link to="/catalogo">
            <Button className="bg-orange-500 hover:bg-orange-600">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Catálogo
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const inStock = (product.estoque || 0) > 0;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link
            to="/catalogo"
            className="inline-flex items-center text-gray-600 hover:text-orange-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Catálogo
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Product Image Gallery */}
            <ProductImageGallery
              mainImage={product.imagem_url}
              images={product.imagens || []}
              productName={product.nome}
              marca={product.marca}
              inStock={inStock}
            />

            {/* Product Info */}
            <div className="p-4 md:p-8 lg:p-10">
              {/* Header Info */}
              <div className="grid grid-cols-3 gap-2 md:gap-3 mb-4 md:mb-6">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Nº Figura</p>
                  <p className="font-bold text-gray-900 text-sm">{product.num_figura || '--'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Referência</p>
                  <p className="font-bold text-gray-900 text-sm">{product.referencia || '--'}</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-3">
                  <p className="text-xs text-orange-600 mb-1">Cód. DDM</p>
                  <p className="font-bold text-orange-600 text-sm">{product.num_ddm}</p>
                </div>
              </div>

              {/* COMPATIBILIDADE */}
              {product.modelos_compativeis && product.modelos_compativeis.length > 0 && (
                <div className="mb-6 bg-white border-2 border-gray-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-500 tracking-wider mb-3">
                    COMPATIBILIDADE (MÁQUINA)
                  </p>
                  <Select>
                    <SelectTrigger className="w-full h-12 bg-white border-2 border-gray-300 text-gray-900 font-medium text-base hover:border-orange-400 focus:border-orange-500 transition-colors">
                      <SelectValue placeholder={`Selecione - ${product.modelos_compativeis.length} modelos compatíveis`} />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {product.modelos_compativeis.map((modelo) => (
                        <SelectItem
                          key={modelo}
                          value={modelo}
                          className="py-3 text-base font-medium text-gray-900 hover:bg-orange-50"
                        >
                          {modelo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-400 mt-2">
                    Marca: {product.marca} {product.serie && `| Série: ${product.serie}`}
                  </p>
                </div>
              )}

              {/* Product Title Banner */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-xl mb-6">
                <h1 className="text-lg lg:text-xl font-bold">{product.nome}</h1>
                {product.serie && (
                  <p className="text-orange-100 text-sm mt-1">Série: {product.serie}</p>
                )}
              </div>

              {/* Price */}
              <div className="mb-6">
                <ProductPrice
                  preco={product.preco}
                  precoPromocional={product.preco_promocional}
                  size="lg"
                />
              </div>

              {/* Quantity and Buttons - Desktop Only */}
              {inStock && (
                <div className="hidden lg:block">
                  <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="flex items-center border rounded-lg">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="h-14 w-14"
                      >
                        <Minus className="w-5 h-5" />
                      </Button>
                      <span className="w-14 text-center font-semibold text-lg">{quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setQuantity(quantity + 1)}
                        className="h-14 w-14"
                      >
                        <Plus className="w-5 h-5" />
                      </Button>
                    </div>

                    <Button
                      className={`flex-1 h-14 text-base font-bold transition-all ${
                        addedToCart
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'bg-orange-500 hover:bg-orange-600'
                      }`}
                      onClick={() => addToCartMutation.mutate()}
                      disabled={addToCartMutation.isPending}
                    >
                      {addedToCart ? (
                        <>
                          <Check className="w-5 h-5 mr-2" />
                          ADICIONADO!
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-5 h-5 mr-2" />
                          COMPRAR
                        </>
                      )}
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full h-14 text-base font-semibold border-orange-500 text-orange-600 hover:bg-orange-50"
                    onClick={handleBuyNow}
                  >
                    Comprar Agora
                  </Button>
                </div>
              )}

              {/* Shipping Calculator */}
              <div className="mt-6">
                <ShippingCalculator
                  weightKg={product.peso_kg || 0.5}
                  onSelectShipping={setSelectedShipping}
                  selectedShipping={selectedShipping}
                />
              </div>

              {/* Trust Badges */}
              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Truck className="w-5 h-5 mx-auto text-orange-500 mb-1" />
                  <p className="text-xs text-gray-600">Entrega Rápida</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Shield className="w-5 h-5 mx-auto text-orange-500 mb-1" />
                  <p className="text-xs text-gray-600">Compra Segura</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <RotateCcw className="w-5 h-5 mx-auto text-orange-500 mb-1" />
                  <p className="text-xs text-gray-600">Garantia 30 dias</p>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="border-t">
            <div className="p-4 md:p-8 lg:p-10">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4 md:mb-6">
                Especificações Técnicas
              </h2>
              <ResponsiveSpecsTable product={product} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Buy Button */}
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

      {/* Spacer for mobile sticky button */}
      <div className="h-32 lg:hidden" />
    </div>
  );
}