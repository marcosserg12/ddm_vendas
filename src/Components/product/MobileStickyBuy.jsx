import React from 'react';
import { ShoppingCart, Minus, Plus, Check } from 'lucide-react';
import { Button } from '../ui/button';

export default function MobileStickyBuy({
  product,
  quantity,
  setQuantity,
  onAddToCart,
  onBuyNow,
  isAdding,
  addedToCart,
  inStock
}) {
  if (!inStock) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] lg:hidden z-40">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 line-clamp-1">{product.nome}</p>
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-lg text-gray-900">
                {product.preco_promocional
                  ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.preco_promocional)
                  : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.preco)
                }
              </span>
              {product.preco_promocional && (
                <span className="text-xs text-gray-400 line-through">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.preco)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center border rounded-lg h-9">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="h-9 w-9"
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="w-8 text-center font-semibold text-sm">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setQuantity(quantity + 1)}
              className="h-9 w-9"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            className={`flex-1 h-11 text-sm font-bold transition-all ${
              addedToCart
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-orange-500 hover:bg-orange-600'
            }`}
            onClick={onAddToCart}
            disabled={isAdding}
          >
            {addedToCart ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Adicionado
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Adicionar
              </>
            )}
          </Button>

          <Button
            variant="outline"
            className="flex-1 h-11 text-sm font-bold border-orange-500 text-orange-600 hover:bg-orange-50"
            onClick={onBuyNow}
          >
            Comprar
          </Button>
        </div>
      </div>
    </div>
  );
}