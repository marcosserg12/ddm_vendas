import React, { useState } from 'react';
import { Truck, Loader2, AlertCircle, CheckCircle2, MapPin } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { __ddmDatabase } from '../../api/MysqlServer.js';

export default function ShippingCalculator({
    id_produto,
    nu_peso = 0.5,
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
        const cleanCep = cep.replace(/\D/g, '');
        if (cleanCep.length !== 8) {
            setError('Digite um CEP válido');
            return;
        }

        setError('');
        setLoading(true);

        try {
            // Nota: Se sua API Base já tiver '/api', ajuste aqui.
            // Geralmente __ddmDatabase.BASE_URL é algo como 'http://localhost:3001/api'
            const response = await fetch(`${__ddmDatabase.BASE_URL}/frete/calcular`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cep_destino: cleanCep,
                    items: [{ id_produto, quantidade: 1, nu_peso }] // Ajustei estrutura para bater com server
                })
            });

            if (!response.ok) throw new Error('Erro ao calcular frete');

            const results = await response.json();
            setOptions(results);

            if (onSelectShipping && results.length > 0) {
                onSelectShipping(results[0]);
            }
        } catch (err) {
            console.error(err);
            setError('Serviço indisponível para este CEP no momento.');
            setOptions([]);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    };

    return (
        <div className={`${compact ? '' : 'bg-white rounded-2xl border-2 border-gray-100 p-6 shadow-sm'}`}>
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-orange-50 rounded-lg">
                        <Truck className="w-4 h-4 text-orange-600" />
                    </div>
                    <span className="font-black text-gray-900 uppercase text-[10px] tracking-widest">Simular Entrega</span>
                </div>
            </div>

            <div className="flex gap-2">
                <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <Input
                        placeholder="00000-000"
                        value={cep}
                        onChange={(e) => setCep(formatCep(e.target.value))}
                        maxLength={9}
                        className="pl-10 font-black text-xs border-2 border-gray-100 focus-visible:ring-orange-500 h-11 rounded-xl"
                    />
                </div>
                <Button
                    onClick={handleCalculate}
                    disabled={loading || cep.replace(/\D/g, '').length !== 8}
                    className="bg-gray-900 hover:bg-black text-orange-500 font-black text-[10px] tracking-widest px-6 h-11 rounded-xl transition-all active:scale-95"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : 'CALCULAR'}
                </Button>
            </div>

            <div className="mt-2 px-1">
                <a
                    href="https://buscacepinter.correios.com.br/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[9px] text-gray-400 hover:text-orange-600 transition-colors font-black uppercase tracking-tighter"
                >
                    Não sei meu CEP?
                </a>
            </div>

            {error && (
                <div className="flex items-center gap-3 mt-4 text-red-600 text-[10px] bg-red-50 p-4 rounded-xl border border-red-100 font-black uppercase">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                </div>
            )}

            {options.length > 0 && (
                <div className="mt-6 space-y-2 animate-in fade-in slide-in-from-top-2 duration-500">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1 mb-3">Opções Disponíveis</p>
                    {options.map((option) => (
                        <button
                            key={option.id} // CORRIGIDO: Usa 'id' que vem do server.js
                            onClick={() => onSelectShipping && onSelectShipping(option)}
                            className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between group ${
                                selectedShipping?.id === option.id
                                    ? 'border-orange-500 bg-orange-50/30'
                                    : 'border-gray-50 bg-gray-50 hover:border-gray-200'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                                    selectedShipping?.id === option.id
                                        ? 'border-orange-500 bg-orange-500'
                                        : 'border-gray-300'
                                }`}>
                                    {selectedShipping?.id === option.id && (
                                        <CheckCircle2 className="w-3 h-3 text-white" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-black text-gray-900 text-[11px] uppercase tracking-tighter">
                                        {option.ds_nome_servico}
                                    </p>
                                    <p className="text-[9px] text-gray-400 font-black uppercase">
                                        Até {option.prazo} dias úteis
                                    </p>
                                </div>
                            </div>
                            <span className="font-black text-gray-900 text-sm tracking-tighter">
                                {option.preco === 0 ? 'Grátis' : formatCurrency(option.preco)}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}