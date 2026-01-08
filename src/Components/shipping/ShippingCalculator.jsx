import React, { useState } from 'react';
import { Truck, Loader2, MapPin, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// CORREÇÃO: Caminho relativo correto (embora não esteja sendo usado na lógica simulada abaixo)
import { base44 } from '../../api/base44Client';

// Simulated shipping calculation based on CEP ranges
const calculateShipping = async (cep, weightKg) => {
    // Validate CEP
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
        throw new Error('CEP inválido');
    }

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Get region from first digit
    const region = parseInt(cleanCep[0]);

    // Base rates by region (simplified)
    const regionRates = {
        0: { base: 25, perKg: 3.5, days: [3, 5] },   // SP Capital
        1: { base: 28, perKg: 4.0, days: [3, 6] },   // SP Interior
        2: { base: 32, perKg: 4.5, days: [4, 7] },   // RJ/ES
        3: { base: 18, perKg: 2.5, days: [2, 4] },   // MG (local)
        4: { base: 38, perKg: 5.0, days: [5, 8] },   // BA/SE
        5: { base: 42, perKg: 5.5, days: [5, 9] },   // PE/AL/PB/RN
        6: { base: 48, perKg: 6.0, days: [6, 10] },  // CE/PI/MA/PA/AP/AM
        7: { base: 45, perKg: 5.5, days: [5, 9] },   // DF/GO/TO/MT/MS/RO/AC/RR
        8: { base: 40, perKg: 5.0, days: [4, 7] },   // PR/SC
        9: { base: 42, perKg: 5.2, days: [5, 8] },   // RS
    };

    const rate = regionRates[region] || regionRates[3];
    const weight = Math.max(weightKg || 0.5, 0.5);

    // Calculate options
    const sedexPrice = (rate.base * 1.8) + (rate.perKg * weight * 1.5);
    const pacPrice = rate.base + (rate.perKg * weight);
    const expressPrice = (rate.base * 2.5) + (rate.perKg * weight * 2);

    return [
        {
            id: 'sedex',
            nome: 'SEDEX',
            preco: Math.round(sedexPrice * 100) / 100,
            prazo_min: rate.days[0],
            prazo_max: rate.days[0] + 2,
            descricao: 'Entrega rápida'
        },
        {
            id: 'pac',
            nome: 'PAC',
            preco: Math.round(pacPrice * 100) / 100,
            prazo_min: rate.days[1],
            prazo_max: rate.days[1] + 3,
            descricao: 'Entrega econômica'
        },
        {
            id: 'express',
            nome: 'Expresso',
            preco: Math.round(expressPrice * 100) / 100,
            prazo_min: Math.max(1, rate.days[0] - 1),
            prazo_max: rate.days[0],
            descricao: 'Entrega prioritária'
        }
    ];
};

export default function ShippingCalculator({
    weightKg = 0.5,
    onSelectShipping,
    selectedShipping,
    compact = false
}) {
    const [cep, setCep] = useState('');
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState([]);
    const [error, setError] = useState('');

    const formatCep = (value) => {
        const numbers = value.replace(/\D/g, '');
        if (numbers.length <= 5) return numbers;
        return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
    };

    const handleCalculate = async () => {
        setError('');
        setLoading(true);
        try {
            const results = await calculateShipping(cep, weightKg);
            setOptions(results);
            if (onSelectShipping && results.length > 0) {
                onSelectShipping(results[1]); // Default to PAC
            }
        } catch (err) {
            setError(err.message || 'Erro ao calcular frete');
            setOptions([]);
        }
        setLoading(false);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value);
    };

    return (
        <div className={`${compact ? '' : 'bg-gray-50 rounded-xl p-4'}`}>
            <div className="flex items-center gap-2 mb-3">
                <Truck className="w-5 h-5 text-orange-500" />
                <span className="font-semibold text-gray-900">Calcular Frete</span>
            </div>

            <div className="flex gap-2 mb-3">
                <Input
                    placeholder="00000-000"
                    value={cep}
                    onChange={(e) => setCep(formatCep(e.target.value))}
                    maxLength={9}
                    className="flex-1"
                />
                <Button
                    onClick={handleCalculate}
                    disabled={loading || cep.replace(/\D/g, '').length !== 8}
                    className="bg-orange-500 hover:bg-orange-600"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Calcular'}
                </Button>
            </div>

            <a
                href="https://buscacepinter.correios.com.br/app/endereco/index.php"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-orange-600 hover:text-orange-700 underline"
            >
                Não sei meu CEP
            </a>

            {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
            )}

            {options.length > 0 && (
                <div className="mt-4 space-y-2">
                    {options.map((option) => (
                        <div
                            key={option.id}
                            onClick={() => onSelectShipping && onSelectShipping(option)}
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedShipping?.id === option.id
                                    ? 'border-orange-500 bg-orange-50'
                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedShipping?.id === option.id ? 'border-orange-500' : 'border-gray-300'
                                        }`}>
                                        {selectedShipping?.id === option.id && (
                                            <div className="w-2 h-2 rounded-full bg-orange-500" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{option.nome}</p>
                                        <p className="text-xs text-gray-500">
                                            {option.prazo_min === option.prazo_max
                                                ? `${option.prazo_min} dias úteis`
                                                : `${option.prazo_min} a ${option.prazo_max} dias úteis`
                                            }
                                        </p>
                                    </div>
                                </div>
                                <span className="font-bold text-gray-900">
                                    {formatCurrency(option.preco)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export { calculateShipping };