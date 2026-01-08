import React, { useState } from 'react';
import { base44 } from '../api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard, Package, ShoppingCart,
  TrendingUp, DollarSign, Loader2, Lock, Menu
} from 'lucide-react';
import { Button } from '../Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../Components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../Components/ui/tabs';

// IMPORT CORRECTIONS
import AdminProducts from '../Components/admin/AdminProducts';
import AdminOrders from '../Components/admin/AdminOrders';
import DashboardCharts from '../Components/admin/DashboardCharts';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      // Mock para permitir acesso admin localmente
      return { role: 'admin', full_name: 'Administrador' };

      /* Lógica Real
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) return base44.auth.me();
      return null;
      */
    }
  });

  const { data: products } = useQuery({
    queryKey: ['allProducts'],
    queryFn: () => base44.entities.Product.list(),
    initialData: []
  });

  const { data: orders } = useQuery({
    queryKey: ['allOrders'],
    queryFn: () => base44.entities.Order.list('-created_date'),
    initialData: []
  });

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="max-w-md mx-4 text-center">
          <CardContent className="pt-8 pb-6">
            <Lock className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Acesso Restrito</h2>
            <p className="text-gray-500 mb-6">
              Esta área é exclusiva para administradores do sistema.
            </p>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
            >
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalRevenue = orders
    .filter(o => o.status !== 'cancelado')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const pendingOrders = orders.filter(o => o.status === 'pendente').length;
  const activeProducts = products.filter(p => p.ativo !== false).length;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <div className="bg-gray-900 text-white py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Painel Administrativo</h1>
              <p className="text-gray-400 text-sm">DDM Indústria</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">
              Olá, <span className="text-white font-medium">{user.full_name}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 md:mb-8 w-full justify-start overflow-x-auto">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 min-w-max">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2 min-w-max">
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Produtos</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2 min-w-max">
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Pedidos</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">Receita Total</p>
                      <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">
                        {formatCurrency(totalRevenue)}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-200">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-600 font-medium">Pendentes</p>
                      <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{pendingOrders}</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-200">
                      <ShoppingCart className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Produtos Ativos</p>
                      <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{activeProducts}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 font-medium">Total Pedidos</p>
                      <p className="text-xl md:text-2xl font-bold text-gray-900 mt-1">{orders.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <DashboardCharts orders={orders} products={products} />

            {/* Recent Orders */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Pedidos Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900">#{order.numero_pedido}</p>
                        <p className="text-sm text-gray-500 truncate">{order.user_email}</p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-bold text-gray-900">{formatCurrency(order.total)}</p>
                        <span className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${
                          order.status === 'pago' ? 'bg-green-100 text-green-700' :
                          order.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' :
                          order.status === 'enviado' ? 'bg-blue-100 text-blue-700' :
                          order.status === 'entregue' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <p className="text-center text-gray-500 py-8">Nenhum pedido ainda</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products */}
          <TabsContent value="products">
            <AdminProducts />
          </TabsContent>

          {/* Orders */}
          <TabsContent value="orders">
            <AdminOrders />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}