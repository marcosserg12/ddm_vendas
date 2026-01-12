import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, User, LogOut, Phone, Mail, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { __ddmDatabase } from '../../api/MysqlServer.js';

export default function MobileDrawer({ isOpen, onClose, currentPageName, user }) {
  const navigate = useNavigate();
  
  if (!isOpen) return null;

  const handleLogout = () => {
    __ddmDatabase.entities.auth.logout();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] lg:hidden">
      {/* Overlay com desfoque */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-left duration-500">

        {/* Header - Identidade Visual DDM */}
        <div className="flex items-center justify-between p-5 border-b bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-orange-500 font-black text-xs italic">DDM</span>
            </div>
            <span className="font-black text-gray-900 uppercase tracking-tighter text-sm">Menu</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-all active:scale-90"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="flex-1 overflow-y-auto py-6 px-5 space-y-8">

          {/* Seção de Usuário (Baseada no ddm_user do LocalStorage) */}
          {user ? (
            <div className="bg-orange-50/30 p-5 rounded-2xl border-2 border-orange-100/50">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-500/20">
                  {user.ds_nome ? user.ds_nome.charAt(0).toUpperCase() : <User className="w-6 h-6" />}
                </div>
                <div className="overflow-hidden">
                  <p className="font-black text-gray-900 truncate uppercase text-xs">Olá, {user.ds_nome?.split(' ')[0]}</p>
                  <p className="text-[10px] text-gray-500 font-bold truncate lowercase">{user.ds_email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="w-full text-[10px] h-10 border-2 font-black uppercase tracking-tighter"
                  onClick={() => { navigate('/minha-conta'); onClose(); }}
                >
                  Minha Conta
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-[10px] h-10 text-red-600 hover:bg-red-50 font-black uppercase tracking-tighter"
                  onClick={handleLogout}
                >
                  <LogOut className="w-3 h-3 mr-2" />
                  Sair
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-900 p-6 rounded-2xl text-center shadow-xl">
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-4">Acesse o seu portal</p>
              <Button
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black h-12 rounded-xl shadow-lg shadow-orange-500/20 uppercase tracking-widest"
                onClick={() => { navigate('/login'); onClose(); }}
              >
                Entrar / Cadastrar
              </Button>
            </div>
          )}

          {/* Navegação de Categorias */}
          <nav className="space-y-1">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Departamentos</p>
            
            <Link to="/" onClick={onClose} className={`flex items-center p-4 rounded-xl font-black uppercase text-xs transition-all ${currentPageName === 'Home' ? 'bg-gray-900 text-orange-500' : 'text-gray-700 hover:bg-gray-50'}`}>
              Início
            </Link>

            <Link to="/catalogo" onClick={onClose} className={`flex items-center justify-between p-4 rounded-xl font-black uppercase text-xs transition-all ${currentPageName === 'Catalogo' ? 'bg-gray-900 text-orange-500' : 'text-gray-700 hover:bg-gray-50'}`}>
              Catálogo Completo
              <ChevronRight className="w-4 h-4" />
            </Link>
            
            <div className="pl-4 space-y-1 mt-2 border-l-2 border-gray-100">
              {[
                { label: 'Sapatas', id: 1 },
                { label: 'Coxins e Batentes', id: 2 },
                { label: 'Proteções Sanfonadas', id: 3 },
                { label: 'Molas Industriais', id: 4 }
              ].map((cat) => (
                <Link 
                  key={cat.id}
                  to={`/catalogo?id_categoria=${cat.id}`} 
                  onClick={onClose} 
                  className="flex items-center gap-3 p-3 text-[10px] font-black text-gray-500 hover:text-orange-600 uppercase tracking-tight transition-colors"
                >
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                  {cat.label}
                </Link>
              ))}
            </div>

            <Link to="/contato" onClick={onClose} className="flex items-center p-4 rounded-xl font-black uppercase text-xs text-gray-700 hover:bg-gray-50">
              Fale Conosco
            </Link>
          </nav>

          {/* Rodapé do Menu */}
          <div className="pt-8 border-t space-y-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Atendimento</p>
            <div className="space-y-3">
              <a href="tel:3136210000" className="flex items-center gap-3 text-xs font-black text-gray-900 uppercase tracking-tighter">
                <Phone className="w-4 h-4 text-orange-500" /> (31) 3621-0000
              </a>
              <a href="mailto:vendas@ddmindustria.com.br" className="flex items-center gap-3 text-xs font-black text-gray-900 uppercase tracking-tighter">
                <Mail className="w-4 h-4 text-orange-500" /> Vendas e Suporte
              </a>
            </div>
          </div>
        </div>

        {/* Botão de Orçamento Fixo */}
        <div className="p-5 border-t bg-gray-50">
          <Button asChild className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black h-12 rounded-xl shadow-lg shadow-orange-600/20 uppercase tracking-widest text-xs">
             <Link to="/contato" onClick={onClose}>Orçamento Rápido</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}