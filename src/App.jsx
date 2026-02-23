import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

// Imports de Layout e Páginas
import Layout from "./Layout";
import Home from './Pages/Home';
import Catalogo from './Pages/Catalogo';
import Produto from './Pages/Produto';
import Carrinho from './Pages/Carrinho';
import Checkout from './Pages/Checkout';
import MinhaConta from './Pages/MinhaConta';
import Contato from './Pages/Contato';
import QuemSomos from './Pages/QuemSomos';
import Admin from './Pages/Admin';
import Login from './Pages/Login';

// Componente para garantir que a página sempre comece do topo ao mudar de rota
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    let sessionId = localStorage.getItem('ddm_session');
    if (!sessionId) {
        // Gera um ID único baseado no tempo e um número aleatório
        sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('ddm_session', sessionId);
    }
  }, [pathname]);
  return null;
}

// Componente para Proteger Rotas (Admin e Checkout)
const PrivateRoute = ({ children, adminOnly = false }) => {
  const token = localStorage.getItem('ddm_token');
  const user = JSON.parse(localStorage.getItem('ddm_user') || '{}');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.id_perfil !== 1) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Configuração do React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <Toaster position="top-center" richColors closeButton />

        <Routes>
          {/* --- ROTAS PÚBLICAS (COM MENU/RODAPÉ) --- */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/catalogo" element={<Layout><Catalogo /></Layout>} />
          <Route path="/produto" element={<Layout><Produto /></Layout>} />
          <Route path="/carrinho" element={<Layout><Carrinho /></Layout>} />
          <Route path="/contato" element={<Layout><Contato /></Layout>} />
          <Route path="/quem-somos" element={<Layout><QuemSomos /></Layout>} />

          {/* --- ROTAS PROTEGIDAS (CLIENTE LOGADO) --- */}
          <Route path="/minha-conta" element={
            <PrivateRoute>
              <Layout><MinhaConta /></Layout>
            </PrivateRoute>
          } />
          
          <Route path="/checkout" element={<Checkout />} />

          {/* --- ROTAS DE ACESSO / ADMIN --- */}
          <Route path="/login" element={<Login />} />
          
          <Route path="/admin" element={
            <PrivateRoute adminOnly={true}>
              <Admin />
            </PrivateRoute>
          } />

          {/* Rota de Fallback (Página 404 redireciona para Home) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;