import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { __ddmDatabase } from '../../api/MysqlServer.js';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TrendingUp, Package, AlertTriangle, Loader2 } from 'lucide-react';

export default function DashboardCharts({ Vendas = [], ProdutosChart = [] }) {

    // 1. Busca Itens de Venda Reais (tb_venda_produtos)
    const { data: ItensVenda = [], isLoading: loadingItens } = useQuery({
        queryKey: ['TodosItensVenda'],
        queryFn: () => __ddmDatabase.entities.VendaProdutos.list(),
    });

    // 2. Gráfico de Receita - Últimos 30 dias
    const revenueData = useMemo(() => {
        const last30Days = [];
        const today = new Date();

        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayLabel = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

            const dayOrders = Vendas.filter(v => {
                if (!v.dt_venda) return false;
                const orderDate = new Date(v.dt_venda).toISOString().split('T')[0];
                // Ajustado para 'Cancelada' conforme seu SQL ENUM
                return orderDate === dateStr && v.st_venda !== 'Cancelada';
            });

            // Ajustado para nu_valor_total_nota (Coluna do seu SQL)
            const revenue = dayOrders.reduce((sum, v) => sum + (Number(v.nu_valor_total_nota) || 0), 0);

            last30Days.push({
                date: dayLabel,
                receita: revenue,
                pedidos: dayOrders.length
            });
        }
        return last30Days;
    }, [Vendas]);

    // 3. Top 5 Produtos Vendidos
    const topProducts = useMemo(() => {
        const productSales = {};

        Vendas.forEach(venda => {
            if (venda.st_venda === 'Cancelada') return;

            const itensDestaVenda = ItensVenda.filter(iv => iv.id_venda === venda.id_venda);

            itensDestaVenda.forEach(item => {
                // p.ds_nome deve vir no objeto item via JOIN no backend
                const nome = item.ds_nome || `ID: ${item.id_produto}`;

                if (!productSales[nome]) {
                    productSales[nome] = { nome, quantidade: 0 };
                }
                // Ajustado para nu_quantidade (Coluna do seu SQL)
                productSales[nome].quantidade += Number(item.nu_quantidade) || 0;
            });
        });

        return Object.values(productSales)
            .sort((a, b) => b.quantidade - a.quantidade)
            .slice(0, 5)
            .map(p => ({ ...p, nome: p.nome?.substring(0, 15) + (p.nome?.length > 15 ? '...' : '') }));
    }, [Vendas, ItensVenda]);

    // 4. Status do Estoque
    const inventoryStatus = useMemo(() => {
        let inStock = 0; let lowStock = 0; let outOfStock = 0;

        ProdutosChart.forEach(p => {
            if (p.st_ativo === "N") return;
            const stock = Number(p.nu_estoque_atual) || 0;
            if (stock === 0) outOfStock++;
            else if (stock <= 5) lowStock++;
            else inStock++;
        });

        return [
            { name: 'Em Estoque', value: inStock, color: '#22C55E' },
            { name: 'Estoque Baixo', value: lowStock, color: '#F97316' },
            { name: 'Sem Estoque', value: outOfStock, color: '#EF4444' }
        ];
    }, [ProdutosChart]);

    if (loadingItens) {
        return (
            <div className="h-96 flex items-center justify-center bg-white rounded-2xl border-2 border-gray-100">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 animate-spin text-orange-500 mx-auto mb-4" />
                    <p className="text-xs font-black uppercase text-gray-400">Cruzando dados de venda...</p>
                </div>
            </div>
        );
    }

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="lg:col-span-2 rounded-2xl border-2 shadow-sm">
                <CardHeader className="pb-4 border-b">
                    <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-500" />
                        Desempenho de Vendas (30d)
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 text-gray-900">
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}`} />
                                <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
                                <Line type="monotone" dataKey="receita" stroke="#F97316" strokeWidth={4} dot={{ r: 4, fill: '#F97316' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-2xl border-2 shadow-sm">
                <CardHeader className="pb-4 border-b">
                    <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
                        <Package className="w-5 h-5 text-blue-500" />
                        Mais Vendidos
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topProducts} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis dataKey="nome" type="category" width={100} tick={{ fontSize: 10 }} axisLine={false} />
                                <Tooltip cursor={{ fill: '#F9FAFB' }} />
                                <Bar dataKey="quantidade" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            <Card className="rounded-2xl border-2 shadow-sm">
                <CardHeader className="pb-4 border-b">
                    <CardTitle className="text-sm font-black uppercase flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                        Curva de Estoque
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={inventoryStatus} innerRadius={60} outerRadius={80} paddingAngle={8} dataKey="value">
                                    {inventoryStatus.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

const CustomTooltip = ({ active, payload, label, formatCurrency }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-900 text-white p-3 rounded-xl shadow-xl border-none">
                <p className="text-[10px] font-black uppercase mb-1 opacity-60">{label}</p>
                <p className="text-sm font-black text-orange-400">
                    {formatCurrency(payload[0].value)}
                </p>
                <p className="text-[10px] font-bold">
                    {payload[0].payload.pedidos} pedidos neste dia
                </p>
            </div>
        );
    }
    return null;
};