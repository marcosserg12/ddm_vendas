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

    // 1. Busca Itens de Venda Reais
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
                return orderDate === dateStr && v.st_venda !== 'Cancelada';
            });

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
                const nome = item.ds_nome || `ID: ${item.id_produto}`;
                if (!productSales[nome]) {
                    productSales[nome] = { nome, quantidade: 0 };
                }
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

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    if (loadingItens) {
        return (
            <div className="h-64 flex items-center justify-center bg-white rounded-2xl border-2 border-gray-100">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-4" />
                    <p className="text-[10px] font-black uppercase text-gray-400">Carregando dados...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Gráfico de Receita */}
            <Card className="lg:col-span-2 rounded-[1.5rem] md:rounded-2xl border-2 shadow-sm border-gray-100">
                <CardHeader className="pb-4 border-b border-gray-50">
                    <CardTitle className="text-xs md:text-sm font-black uppercase flex items-center gap-2 tracking-widest text-gray-700">
                        <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-green-500" />
                        Desempenho de Vendas
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 text-gray-900">
                    <div className="h-64 md:h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={revenueData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                <XAxis
                                    dataKey="date"
                                    tick={{ fontSize: 9, fill: '#9CA3AF' }}
                                    axisLine={false}
                                    tickLine={false}
                                    interval={window.innerWidth < 768 ? 6 : 2} // Menos labels no mobile
                                />
                                <YAxis
                                    tick={{ fontSize: 9, fill: '#9CA3AF' }}
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={v => `R$${v/1000}k`}
                                />
                                <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} cursor={{ stroke: '#F97316', strokeWidth: 1, strokeDasharray: '3 3' }} />
                                <Line type="monotone" dataKey="receita" stroke="#F97316" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#F97316', stroke: '#fff', strokeWidth: 2 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Top Produtos */}
            <Card className="rounded-[1.5rem] md:rounded-2xl border-2 shadow-sm border-gray-100">
                <CardHeader className="pb-4 border-b border-gray-50">
                    <CardTitle className="text-xs md:text-sm font-black uppercase flex items-center gap-2 tracking-widest text-gray-700">
                        <Package className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
                        Mais Vendidos
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="h-56 md:h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topProducts} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="nome"
                                    type="category"
                                    width={90}
                                    tick={{ fontSize: 9, fill: '#6B7280', fontWeight: 600 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip
                                    cursor={{ fill: '#F9FAFB' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar dataKey="quantidade" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Status Estoque */}
            <Card className="rounded-[1.5rem] md:rounded-2xl border-2 shadow-sm border-gray-100">
                <CardHeader className="pb-4 border-b border-gray-50">
                    <CardTitle className="text-xs md:text-sm font-black uppercase flex items-center gap-2 tracking-widest text-gray-700">
                        <AlertTriangle className="w-4 h-4 md:w-5 md:h-5 text-orange-500" />
                        Curva de Estoque
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="h-56 md:h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={inventoryStatus}
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {inventoryStatus.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', fontSize: '12px' }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    iconSize={8}
                                    wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                                />
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
            <div className="bg-gray-900 text-white p-3 rounded-xl shadow-xl border-none min-w-[140px]">
                <p className="text-[9px] font-black uppercase mb-1 opacity-60 tracking-widest">{label}</p>
                <p className="text-sm font-black text-orange-400 tracking-tight">
                    {formatCurrency(payload[0].value)}
                </p>
                <div className="w-full h-px bg-white/10 my-2"></div>
                <p className="text-[9px] font-bold text-gray-300">
                    {payload[0].payload.pedidos} pedidos
                </p>
            </div>
        );
    }
    return null;
};