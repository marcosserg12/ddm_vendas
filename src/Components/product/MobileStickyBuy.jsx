import React from 'react';
import { ShoppingCart, Minus, Plus, Check, Loader2 } from 'lucide-react';
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
  // Se não houver estoque, a barra nem aparece para não ocupar espaço
  if (!inStock) return null;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t-2 border-gray-100 shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.15)] lg:hidden z-[60] animate-in slide-in-from-bottom duration-300">
      <div className="flex flex-col gap-3">
        
        {/* Linha 1: Identificação e Preço */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[9px] font-black text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                REF: {product.nu_ddm}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 truncate font-bold uppercase tracking-tight">
              {product.ds_nome}
            </p>
            <p className="font-black text-xl text-gray-900 leading-none tracking-tighter">
              {formatCurrency(product.nu_preco_venda_atual)}
            </p>
          </div>

          {/* Seletor de Quantidade Slim Industrial */}
          <div className="flex items-center border-2 border-gray-100 rounded-xl h-10 bg-gray-50 overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="h-full w-9 rounded-none hover:bg-gray-200"
              disabled={isAdding}
            >
              <Minus className="w-3 h-3 text-gray-600" />
            </Button>
            <span className="w-8 text-center font-black text-sm text-gray-900">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setQuantity(quantity + 1)}
              className="h-full w-9 rounded-none hover:bg-gray-200"
              disabled={isAdding}
            >
              <Plus className="w-3 h-3 text-gray-600" />
            </Button>
          </div>
        </div>

        {/* Linha 2: Ações de Conversão */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            className={`h-12 text-xs font-black uppercase tracking-widest transition-all rounded-xl shadow-md ${
              addedToCart
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200'
            }`}
            onClick={onAddToCart}
            disabled={isAdding}
          >
            {isAdding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : addedToCart ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                No Carrinho
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Adicionar
              </>
            )}
          </Button>

          <Button
            variant="default"
            className="h-12 text-xs font-black uppercase tracking-widest bg-gray-900 text-white hover:bg-black rounded-xl shadow-lg active:scale-95 transition-all"
            onClick={onBuyNow}
            disabled={isAdding}
          >
            Comprar Já
          </Button>
        </div>
      </div>
    </div>
  );
}