import React from 'react';
import { MessageCircle, ShieldCheck } from 'lucide-react'; 

export default function ProductPrice({ preco, size = 'md' }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const sizeClasses = {
    sm: { price: 'text-xl', installment: 'text-[10px]' },
    md: { price: 'text-3xl', installment: 'text-[11px]' },
    lg: { price: 'text-5xl', installment: 'text-sm' }
  };

  const classes = sizeClasses[size] || sizeClasses.md;
  const finalPrice = Number(preco) || 0;
  
  // Lógica de parcelamento e desconto PIX
  const installmentValue = finalPrice / 10;
  const pixPrice = finalPrice * 0.95;

  return (
    <div className="space-y-4">
      <div className="flex flex-col">
        {/* Preço PIX em Destaque (Principal gatilho de venda) */}
        <div className="flex items-baseline gap-2">
            <span className={`font-black text-gray-900 tracking-tighter leading-none ${classes.price}`}>
              {formatCurrency(pixPrice)}
            </span>
            <span className="text-green-600 font-black text-[10px] uppercase tracking-widest bg-green-50 px-2 py-1 rounded">
                no PIX (5% OFF)
            </span>
        </div>
        
        <div className={`mt-3 space-y-1.5 ${classes.installment}`}>
          <p className="text-gray-500 uppercase tracking-widest font-bold">
            Ou <span className="text-gray-900">{formatCurrency(finalPrice)}</span> em até <span className="font-black text-gray-900 underline decoration-orange-500">10x de {formatCurrency(installmentValue)}</span> sem juros
          </p>
          
          <div className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-tighter">
             <ShieldCheck className="w-4 h-4" />
             <span>Compra 100% Segura DDM Indústria</span>
          </div>
        </div>
      </div>

      {/* Seção B2B / Venda Técnica */}
      {size === 'lg' && (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-5 mt-6 group hover:border-orange-500 transition-colors">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs font-black text-gray-900 uppercase tracking-widest">Negociação B2B / Volume</p>
              <p className="text-[11px] text-gray-500 mt-1 font-medium leading-relaxed">
                Possuímos condições diferenciadas para faturamento direto via CNPJ e grandes projetos de manutenção.
              </p>
              <button 
                onClick={() => window.open('https://wa.me/553136210000', '_blank')}
                className="text-[10px] font-black text-orange-600 uppercase tracking-widest mt-3 hover:text-orange-700 transition-all flex items-center gap-1"
              >
                Falar com Engenharia de Vendas &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}