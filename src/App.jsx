import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

// Imports do Layout e Páginas
// Atenção: Certifique-se que as pastas estão com maiúscula/minúscula igual ao seu projeto
import Layout from "./Layout";
// Se Layout estiver na raiz src/, use: import Layout from './Layout';

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

// Configuração do React Query (Gerenciador de estado do servidor)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Evita recarregar ao trocar de aba
      staleTime: 1000 * 60 * 5, // Dados ficam "frescos" por 5 minutos
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {/* Notificações (Toasts) globais */}
        <Toaster position="top-center" richColors />

        <Routes>
          {/* Rotas Públicas (Envelopadas pelo Layout com Menu e Rodapé) */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/catalogo" element={<Layout><Catalogo /></Layout>} />
          <Route path="/produto" element={<Layout><Produto /></Layout>} />
          <Route path="/carrinho" element={<Layout><Carrinho /></Layout>} />
          <Route path="/minha-conta" element={<Layout><MinhaConta /></Layout>} />
          <Route path="/contato" element={<Layout><Contato /></Layout>} />
          <Route path="/quem-somos" element={<Layout><QuemSomos /></Layout>} />

          {/* Rotas "Stand-alone" (Sem o menu padrão para focar na ação ou por ser painel) */}
          <Route path="/login" element={<Login />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;