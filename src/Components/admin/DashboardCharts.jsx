import React, { useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
// Ajuste de import para sua estrutura
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TrendingUp, Package, AlertTriangle } from 'lucide-react';

const COLORS = ['#22C55E', '#F97316', '#EF4444', '#3B82F6', '#8B5CF6'];

export default function DashboardCharts({ orders = [], products = [] }) {
  // Revenue over last 30 days
  const revenueData = useMemo(() => {
    const last30Days = [];
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayLabel = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

      const dayOrders = orders.filter(o => {
        // Safe check for created_date
        if (!o.created_date) return false;
        const orderDate = new Date(o.created_date).toISOString().split('T')[0];
        return orderDate === dateStr && o.status !== 'cancelado';
      });

      const revenue = dayOrders.reduce((sum, o) => sum + (o.total || 0), 0);

      last30Days.push({
        date: dayLabel,
        receita: revenue,
        pedidos: dayOrders.length
      });
    }

    return last30Days;
  }, [orders]);

  // Top selling products
  const topProducts = useMemo(() => {
    const productSales = {};

    orders.forEach(order => {
      if (order.status === 'cancelado') return;
      (order.itens || []).forEach(item => {
        if (!productSales[item.produto_nome]) {
          productSales[item.produto_nome] = { nome: item.produto_nome, quantidade: 0, receita: 0 };
        }
        productSales[item.produto_nome].quantidade += item.quantidade || 1;
        productSales[item.produto_nome].receita += (item.preco_unitario || 0) * (item.quantidade || 1);
      });
    });

    return Object.values(productSales)
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5)
      .map(p => ({ ...p, nome: p.nome?.substring(0, 20) + (p.nome?.length > 20 ? '...' : '') }));
  }, [orders]);

  // Inventory status
  const inventoryStatus = useMemo(() => {
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;

    products.forEach(p => {
      if (p.ativo === false) return;
      const stock = p.estoque || 0;
      if (stock === 0) outOfStock++;
      else if (stock <= 5) lowStock++;
      else inStock++;
    });

    return [
      { name: 'Em Estoque', value: inStock, color: '#22C55E' },
      { name: 'Estoque Baixo', value: lowStock, color: '#F97316' },
      { name: 'Sem Estoque', value: outOfStock, color: '#EF4444' }
    ];
  }, [products]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((p, idx) => (
            <p key={idx} className="text-sm" style={{ color: p.color }}>
              {p.name}: {p.name === 'receita' ? formatCurrency(p.value) : p.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Line Chart */}
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Receita - Últimos 30 dias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  tickFormatter={(v) => formatCurrency(v)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="receita"
                  name="receita"
                  stroke="#F97316"
                  strokeWidth={3}
                  dot={false}
                  activeDot={{ r: 6, fill: '#F97316' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Products Bar Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-500" />
            Top 5 Produtos Vendidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            {topProducts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProducts} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#6B7280' }} />
                  <YAxis
                    type="category"
                    dataKey="nome"
                    width={120}
                    tick={{ fontSize: 11, fill: '#6B7280' }}
                  />
                  <Tooltip
                    formatter={(value, name) => [value, name === 'quantidade' ? 'Qtd Vendida' : name]}
                  />
                  <Bar dataKey="quantidade" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                Nenhuma venda registrada
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Inventory Pie Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Status do Estoque
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72 flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={inventoryStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {inventoryStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} produtos`, name]} />
                <Legend
                  verticalAlign="bottom"
                  formatter={(value, entry) => (
                    <span className="text-sm text-gray-700">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend stats */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            {inventoryStatus.map((item) => (
              <div
                key={item.name}
                className="text-center p-2 rounded-lg"
                style={{ backgroundColor: `${item.color}15` }}
              >
                <p className="text-2xl font-bold" style={{ color: item.color }}>
                  {item.value}
                </p>
                <p className="text-xs text-gray-600">{item.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}