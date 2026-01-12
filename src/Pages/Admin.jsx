import React, { useState } from 'react';
import { __ddmDatabase } from '../api/MysqlServer.js';
import { useQuery } from '@tanstack/react-query';
import { 
  LayoutDashboard, Package, ShoppingCart, TrendingUp, 
  DollarSign, Lock, Archive 
} from 'lucide-react';
import { Button } from '../Components/ui/button';
import { Card, CardContent } from '../Components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../Components/ui/tabs';
import AdminProducts from '../Components/admin/AdminProducts';
import AdminOrders from '../Components/admin/AdminOrders';
import DashboardCharts from '../Components/admin/DashboardCharts';
import AdminBoxes from '../Components/admin/AdminBoxes'; // Importando o novo componente

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Busca o usuário que salvamos no LocalStorage durante o Login
  const user = JSON.parse(localStorage.getItem('ddm_user'));

  // Opcional: Se não houver usuário, redireciona para login
  if (!user || user.id_perfil !== 1) {
      window.location.href = '/login';
  }

  const { data: products = [] } = useQuery({
    queryKey: ['adminProducts'],
    queryFn: () => __ddmDatabase.entities.Produtos.list()
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['adminOrders'],
    queryFn: () => __ddmDatabase.entities.Vendas.list()
  });

  // Proteção de Rota: Se não for admin (id_perfil 1), bloqueia
  if (!user || user.id_perfil !== 1) { 
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center border-t-8 border-t-gray-900 shadow-2xl rounded-2xl">
          <CardContent className="pt-10 pb-8 px-8">
            <Lock className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-gray-900 mb-2 uppercase italic tracking-tighter">Acesso Restrito</h2>
            <p className="text-gray-500 mb-8 font-bold text-xs uppercase tracking-tight">
              Esta área é exclusiva para a gerência da DDM Indústria.
            </p>
            <Button className="w-full bg-gray-900 hover:bg-black text-white font-black uppercase tracking-widest h-12" onClick={() => window.location.href = '/'}>
              Voltar para a Loja
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalRevenue = orders
    .filter(o => o.st_venda !== 'Cancelada')
    .reduce((sum, o) => sum + Number(o.nu_valor_total_nota || 0), 0);

  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header do Admin */}
      <div className="bg-gray-900 text-white border-b-4 border-orange-500 shadow-lg px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <LayoutDashboard className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-black text-xl uppercase tracking-tighter italic">Painel de <span className="text-orange-500">Gestão</span></h1>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">DDM Indústria Administrativo</p>
            </div>
          </div>
          <div className="text-right hidden sm:block border-l border-gray-800 pl-6">
            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Operador Logístico</p>
            <p className="text-sm font-black uppercase text-orange-500">{user.ds_nome}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-white border-2 border-gray-100 h-16 p-2 shadow-sm rounded-2xl w-full justify-start overflow-x-auto sm:justify-center gap-2">
            <TabTrigger value="dashboard" icon={<TrendingUp className="w-4 h-4" />} label="Dashboard" />
            <TabTrigger value="products" icon={<Package className="w-4 h-4" />} label="Produtos" />
            <TabTrigger value="orders" icon={<ShoppingCart className="w-4 h-4" />} label="Vendas" />
            <TabTrigger value="boxes" icon={<Archive className="w-4 h-4" />} label="Embalagens" />
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <KPICard title="Receita Total" value={formatCurrency(totalRevenue)} icon={DollarSign} color="green" />
              <KPICard title="Vendas Pendentes" value={orders.filter(o => o.st_venda === 'Pendente').length} icon={ShoppingCart} color="orange" />
              <KPICard title="Produtos Ativos" value={products.filter(p => p.st_ativo === 'S').length} icon={Package} color="blue" />
              <KPICard title="Total Pedidos" value={orders.length} icon={TrendingUp} color="purple" />
            </div>
            <DashboardCharts Vendas={orders} ProdutosChart={products} />
          </TabsContent>

          <TabsContent value="products" className="animate-in slide-in-from-bottom-4 duration-500"><AdminProducts /></TabsContent>
          <TabsContent value="orders" className="animate-in slide-in-from-bottom-4 duration-500"><AdminOrders /></TabsContent>
          <TabsContent value="boxes" className="animate-in slide-in-from-bottom-4 duration-500"><AdminBoxes /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Sub-componente para os Triggers das Tabs para limpar o código principal
function TabTrigger({ value, icon, label }) {
  return (
    <TabsTrigger 
      value={value} 
      className="gap-2 px-8 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-gray-900 data-[state=active]:text-orange-500 transition-all rounded-xl h-full"
    >
      {icon} {label}
    </TabsTrigger>
  );
}

function KPICard({ title, value, icon: Icon, color }) {
  const colors = {
    green: 'bg-green-500 text-green-600',
    orange: 'bg-orange-500 text-orange-600',
    blue: 'bg-blue-500 text-blue-600',
    purple: 'bg-purple-500 text-purple-600'
  };
  return (
    <Card className="rounded-2xl border-2 border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="pt-6 flex items-center justify-between">
        <div>
          <p className={`text-[10px] font-black uppercase tracking-widest ${colors[color].split(' ')[1]}`}>{title}</p>
          <p className="text-2xl font-black text-gray-900 mt-1 tracking-tighter">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${colors[color].split(' ')[0]}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </CardContent>
    </Card>
  );
}