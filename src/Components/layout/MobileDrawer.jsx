import React from 'react';
import { Link } from 'react-router-dom';
import { X, ChevronDown, User, LogOut, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function MobileDrawer({ isOpen, onClose, currentPageName, user }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 left-0 w-[85%] max-w-sm bg-white shadow-xl flex flex-col h-full animate-in slide-in-from-left duration-300">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">DDM</span>
            </div>
            <span className="font-bold text-gray-900">Menu</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-6">

          {/* User Section (Mobile) */}
          {user ? (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
                  {user.full_name?.charAt(0) || <User className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 line-clamp-1">{user.full_name}</p>
                  <p className="text-xs text-gray-500 line-clamp-1">{user.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link to="/minha-conta" onClick={onClose}>
                  <Button variant="outline" className="w-full text-xs h-9 bg-white">
                    Minha Conta
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full text-xs h-9 bg-white text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  onClick={() => {
                    base44.auth.logout();
                    onClose();
                  }}
                >
                  Sair
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-center">
              <p className="text-sm text-gray-600 mb-3">Faça login para ver seus pedidos</p>
              <Button
                className="w-full bg-orange-500 hover:bg-orange-600 font-semibold"
                onClick={() => {
                  base44.auth.redirectToLogin();
                  onClose();
                }}
              >
                Entrar ou Cadastrar
              </Button>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1">
            <Link
              to="/"
              onClick={onClose}
              className={`flex items-center justify-between p-3 rounded-lg font-medium transition-colors ${
                currentPageName === 'Home' ? 'bg-orange-50 text-orange-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Início
            </Link>

            <div className="space-y-1">
              <Link
                to="/catalogo"
                onClick={onClose}
                className={`flex items-center justify-between p-3 rounded-lg font-medium transition-colors ${
                  currentPageName === 'Catalogo' ? 'bg-orange-50 text-orange-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Catálogo Completo
              </Link>
              {/* Sub-items indented */}
              <div className="pl-4 border-l-2 border-gray-100 ml-3 space-y-1 mt-1">
                <Link to="/catalogo?categoria=sapatas" onClick={onClose} className="block p-2 text-sm text-gray-600 hover:text-orange-600 rounded">Sapatas</Link>
                <Link to="/catalogo?categoria=coxins_batentes" onClick={onClose} className="block p-2 text-sm text-gray-600 hover:text-orange-600 rounded">Coxins e Batentes</Link>
                <Link to="/catalogo?categoria=protecoes_sanfonadas" onClick={onClose} className="block p-2 text-sm text-gray-600 hover:text-orange-600 rounded">Proteções</Link>
                <Link to="/catalogo?categoria=molas" onClick={onClose} className="block p-2 text-sm text-gray-600 hover:text-orange-600 rounded">Molas</Link>
              </div>
            </div>

            <Link
              to="/quem-somos"
              onClick={onClose}
              className={`flex items-center justify-between p-3 rounded-lg font-medium transition-colors ${
                currentPageName === 'QuemSomos' ? 'bg-orange-50 text-orange-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Quem Somos
            </Link>

            <Link
              to="/contato"
              onClick={onClose}
              className={`flex items-center justify-between p-3 rounded-lg font-medium transition-colors ${
                currentPageName === 'Contato' ? 'bg-orange-50 text-orange-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Contato
            </Link>
          </nav>

          {/* Contact Info (Mobile) */}
          <div className="border-t pt-6 space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Fale Conosco</p>
            <a href="tel:3136210000" className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <Phone className="w-4 h-4 text-gray-500" />
              </div>
              (31) 3621-0000
            </a>
            <a href="mailto:contato@ddmindustria.com.br" className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <Mail className="w-4 h-4 text-gray-500" />
              </div>
              contato@ddmindustria.com.br
            </a>
            <div className="flex items-start gap-3 text-sm text-gray-600">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-gray-500" />
              </div>
              <span>Vespasiano-MG</span>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 border-t bg-gray-50">
          <Link to="/contato" onClick={onClose}>
            <Button className="w-full bg-orange-500 hover:bg-orange-600 font-bold">
              Solicitar Orçamento
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}