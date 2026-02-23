import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { __ddmDatabase } from '../api/MysqlServer.js';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard, Package, ShoppingCart, TrendingUp,
  DollarSign, Lock, Archive, ArrowLeft, Store, Wrench // Adicionado ArrowLeft e Store
} from 'lucide-react';
import { Button } from '../Components/ui/button';
import { Card, CardContent } from '../Components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../Components/ui/tabs';
import AdminProducts from '../Components/admin/AdminProducts';
import AdminOrders from '../Components/admin/AdminOrders';
import DashboardCharts from '../Components/admin/DashboardCharts';
import AdminBoxes from '../Components/admin/AdminBoxes';
import AdminTechnical from '../Components/admin/AdminTechnical';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate(); // Hook para navegação

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
    <div className="min-h-screen bg-gray-50 font-sans pb-20">

      {/* --- HEADER ADMIN (Dark Premium Industrial) --- */}
      <div className="bg-gray-950 text-white relative overflow-hidden pb-12 pt-8 shadow-2xl">
         {/* Elementos de Fundo */}
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800 via-gray-950 to-gray-950 opacity-40 pointer-events-none" />
         <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-soft-light pointer-events-none"></div>

         <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">

                {/* Lado Esquerdo: Identidade */}
                <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-900/40 border border-white/10">
                        <LayoutDashboard className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="font-black text-3xl uppercase tracking-tighter italic leading-none mb-1">
                            Painel de <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">Gestão</span>
                        </h1>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">Sistema Operacional DDM</p>
                        </div>
                    </div>
                </div>

                {/* Lado Direito: Ações e Perfil */}
                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">

                    {/* Botão Voltar ao Site */}
                    <Button
                        onClick={() => navigate('/')}
                        variant="outline"
                        className="border-white/10 bg-white/5 text-gray-300 hover:bg-white hover:text-gray-900 hover:border-white h-12 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest backdrop-blur-sm transition-all"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Ir para Loja
                    </Button>

                    <div className="hidden sm:block border-l border-white/10 pl-6 text-right">
                        <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-0.5">Operador Logístico</p>
                        <p className="text-sm font-black uppercase text-white tracking-tight">{user.ds_nome}</p>
                    </div>
                </div>
            </div>
         </div>
      </div>

      {/* --- CONTEÚDO PRINCIPAL (Abas Flutuantes) --- */}
      <div className="max-w-7xl mx-auto px-4 -mt-8 relative z-20">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">

          {/* Menu de Navegação */}
          <TabsList className="bg-white border border-gray-100 h-auto p-2 shadow-xl shadow-gray-200/50 rounded-[1.5rem] w-full flex flex-col sm:flex-row justify-start sm:justify-center gap-2">
            <TabTrigger value="dashboard" icon={<TrendingUp className="w-4 h-4" />} label="Dashboard" />
            <TabTrigger value="products" icon={<Package className="w-4 h-4" />} label="Produtos" />
            <TabTrigger value="orders" icon={<ShoppingCart className="w-4 h-4" />} label="Vendas" />
            <TabTrigger value="boxes" icon={<Archive className="w-4 h-4" />} label="Embalagens" />
            <TabTrigger value="technical" icon={<Wrench className="w-4 h-4" />} label="Técnica" />
          </TabsList>

          <TabsContent value="dashboard" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <KPICard title="Receita Total" value={formatCurrency(totalRevenue)} icon={DollarSign} color="green" />
              <KPICard title="Vendas Pendentes" value={orders.filter(o => o.st_venda === 'Pendente').length} icon={ShoppingCart} color="orange" />
              <KPICard title="Produtos Ativos" value={products.filter(p => p.st_ativo === 'S').length} icon={Package} color="blue" />
              <KPICard title="Total Pedidos" value={orders.length} icon={TrendingUp} color="purple" />
            </div>

            {/* Gráficos com Container Branco */}
            <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100">
                 <div className="flex items-center gap-2 mb-8 pb-4 border-b border-gray-50">
                    <TrendingUp className="w-5 h-5 text-gray-400" />
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">Análise de Desempenho</h3>
                 </div>
                 <DashboardCharts Vendas={orders} ProdutosChart={products} />
            </div>
          </TabsContent>

          <TabsContent value="products" className="animate-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100">
                <AdminProducts />
             </div>
          </TabsContent>

          <TabsContent value="orders" className="animate-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100">
                <AdminOrders />
             </div>
          </TabsContent>

          <TabsContent value="boxes" className="animate-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100">
                <AdminBoxes />
             </div>
          </TabsContent>

          <TabsContent value="technical" className="animate-in slide-in-from-bottom-4 duration-500">
            <AdminTechnical />
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}

// Sub-componente para os Triggers das Tabs
function TabTrigger({ value, icon, label }) {
  return (
    <TabsTrigger
      value={value}
      className="flex-1 w-full sm:w-auto gap-2 px-6 py-3 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-gray-50 transition-all rounded-xl"
    >
      {icon} {label}
    </TabsTrigger>
  );
}

function KPICard({ title, value, icon: Icon, color }) {
  const colors = {
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <Card className="rounded-[2rem] border-none shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white overflow-hidden group">
      <CardContent className="pt-6 px-6 pb-6 flex items-center justify-between relative">
        <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10 transition-transform group-hover:scale-150 ${colors[color].split(' ')[1].replace('text', 'bg')}`} />

        <div className="relative z-10">
          <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${colors[color].split(' ')[1]}`}>{title}</p>
          <p className="text-3xl font-black text-gray-900 tracking-tighter">{value}</p>
        </div>

        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm relative z-10 ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </CardContent>
    </Card>
  );
}