import React from 'react';
// CORREÇÃO: Caminho relativo para pegar o Badge na pasta vizinha 'ui'
import { Badge } from '../ui/badge';

export default function ProductPrice({ preco, precoPromocional, size = 'md' }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const hasDiscount = precoPromocional && precoPromocional < preco;
  const discountPercent = hasDiscount
    ? Math.round((1 - precoPromocional / preco) * 100)
    : 0;

  const sizeClasses = {
    sm: {
      price: 'text-lg',
      original: 'text-sm',
      installment: 'text-xs'
    },
    md: {
      price: 'text-2xl',
      original: 'text-base',
      installment: 'text-sm'
    },
    lg: {
      price: 'text-3xl',
      original: 'text-lg',
      installment: 'text-base'
    }
  };

  const classes = sizeClasses[size] || sizeClasses.md;
  const finalPrice = hasDiscount ? precoPromocional : preco;
  // Proteção para evitar divisão por zero ou nulo
  const installmentValue = finalPrice ? finalPrice / 12 : 0;

  return (
    <div className="space-y-1">
      {hasDiscount && (
        <div className="flex items-center gap-2">
          <span className={`text-gray-400 line-through ${classes.original}`}>
            {formatCurrency(preco || 0)}
          </span>
          <Badge className="bg-green-500 text-white text-xs">
            -{discountPercent}%
          </Badge>
        </div>
      )}

      <p className={`font-bold text-gray-900 ${classes.price}`}>
        {formatCurrency(finalPrice || 0)}
      </p>

      <p className={`text-gray-500 ${classes.installment}`}>
        em até <span className="font-semibold text-gray-700">12x de {formatCurrency(installmentValue)}</span>
      </p>

      <p className={`text-green-600 font-medium ${classes.installment}`}>
        {formatCurrency((finalPrice || 0) * 0.95)} no PIX
        <span className="text-gray-400 font-normal"> (5% off)</span>
      </p>
    </div>
  );
}