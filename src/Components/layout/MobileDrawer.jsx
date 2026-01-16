import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, User, LogOut, Phone, Mail, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import LogoDDM from '../../assets/imgs/logo_ddm.png'; // Importação da Logo

export default function MobileDrawer({ isOpen, onClose, currentPageName, user, onLogout }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

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
        <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            {/* Container da Logo */}
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm p-1">
              <img
                src={LogoDDM}
                alt="DDM"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col leading-none">
                <span className="font-black text-gray-900 uppercase tracking-tighter text-lg">DDM</span>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Menu</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-xl transition-all active:scale-95 border border-transparent hover:border-gray-100"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors" />
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="flex-1 overflow-y-auto py-6 px-5 space-y-8 bg-white scrollbar-hide">

          {/* Seção de Usuário */}
          {user ? (
            <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-orange-500/20 ring-2 ring-white">
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
                  className="w-full text-[10px] h-10 border-gray-200 hover:border-orange-200 hover:text-orange-600 font-black uppercase tracking-tighter"
                  onClick={() => { navigate('/minha-conta'); onClose(); }}
                >
                  Minha Conta
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-[10px] h-10 text-red-500 hover:text-red-600 hover:bg-red-50 font-black uppercase tracking-tighter"
                  onClick={() => {
                      if (onLogout) onLogout();
                      onClose();
                  }}
                >
                  <LogOut className="w-3 h-3 mr-2" />
                  Sair
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-900 p-6 rounded-2xl text-center shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-4 relative z-10">Acesse o seu portal</p>
              <Button
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black h-12 rounded-xl shadow-lg shadow-orange-500/20 uppercase tracking-widest text-xs relative z-10"
                onClick={() => { navigate('/login'); onClose(); }}
              >
                Entrar / Cadastrar
              </Button>
            </div>
          )}

          {/* Navegação de Categorias */}
          <nav className="space-y-1">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 pl-2">Departamentos</p>

            <Link to="/" onClick={onClose} className={`flex items-center p-3.5 rounded-xl font-black uppercase text-xs transition-all ${currentPageName === 'Home' ? 'bg-gray-50 text-orange-600 border border-gray-100' : 'text-gray-700 hover:bg-gray-50 hover:pl-5'}`}>
              Início
            </Link>

            <Link to="/catalogo" onClick={onClose} className={`flex items-center justify-between p-3.5 rounded-xl font-black uppercase text-xs transition-all ${currentPageName === 'Catalogo' ? 'bg-gray-50 text-orange-600 border border-gray-100' : 'text-gray-700 hover:bg-gray-50 hover:pl-5'}`}>
              Catálogo Completo
              <ChevronRight className="w-4 h-4 opacity-50" />
            </Link>

            <div className="pl-4 space-y-1 mt-2 border-l-2 border-gray-100 ml-4 py-2">
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
                  className="flex items-center gap-3 p-2.5 text-[10px] font-bold text-gray-500 hover:text-orange-600 uppercase tracking-wide transition-all hover:pl-4 rounded-lg hover:bg-orange-50/50"
                >
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                  {cat.label}
                </Link>
              ))}
            </div>

            <Link to="/contato" onClick={onClose} className="flex items-center p-3.5 rounded-xl font-black uppercase text-xs text-gray-700 hover:bg-gray-50 hover:pl-5 transition-all">
              Fale Conosco
            </Link>
          </nav>

          {/* Rodapé do Menu */}
          <div className="pt-8 border-t border-gray-100 space-y-4">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] pl-2">Atendimento</p>
            <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <a href="tel:3136210000" className="flex items-center gap-3 text-xs font-black text-gray-900 uppercase tracking-tighter hover:text-orange-600 transition-colors">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                    <Phone className="w-3.5 h-3.5 text-orange-500" />
                </div>
                (31) 3621-0000
              </a>
              <a href="mailto:vendas@ddmindustria.com.br" className="flex items-center gap-3 text-xs font-black text-gray-900 uppercase tracking-tighter hover:text-orange-600 transition-colors">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                    <Mail className="w-3.5 h-3.5 text-orange-500" />
                </div>
                Vendas e Suporte
              </a>
            </div>
          </div>
        </div>

        {/* Botão de Orçamento Fixo */}
        <div className="p-5 border-t border-gray-100 bg-white">
          <Button asChild className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black h-12 rounded-xl shadow-lg shadow-orange-600/20 uppercase tracking-widest text-xs">
             <Link to="/contato" onClick={onClose}>Orçamento Rápido</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}