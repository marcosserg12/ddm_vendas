import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { base44 } from './api/base44Client';
import {
  Menu, Phone, Mail, MapPin, ShoppingCart,
  ChevronDown, Factory, Wrench, Shield, Clock, User, LogOut
} from 'lucide-react';
import { Button } from './Components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./Components/ui/dropdown-menu";
import MobileDrawer from './Components/layout/MobileDrawer';

export default function Layout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  const location = useLocation();

  const getPageName = (path) => {
      if (path === '/') return 'Home';
      if (path.startsWith('/catalogo')) return 'Catalogo';
      if (path.startsWith('/quem-somos')) return 'QuemSomos';
      if (path.startsWith('/contato')) return 'Contato';
      return '';
  };
  const currentPageName = getPageName(location.pathname);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const loadCartCount = async () => {
      try {
        const sessionId = localStorage.getItem('ddm_session') ||
          `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('ddm_session', sessionId);

        const allItems = await base44.entities.CartItem.list();
        const items = allItems.filter(i => i.session_id === sessionId);
        setCartCount(items.reduce((sum, item) => sum + item.quantidade, 0));
      } catch (e) { }
    };
    loadCartCount();

    window.addEventListener('cartUpdated', loadCartCount);
    return () => window.removeEventListener('cartUpdated', loadCartCount);
  }, []);

  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const userData = await base44.auth.me();
          setUser(userData);
        }
      } catch (e) {}
    };
    loadUser();
  }, []);

  const navLinks = [
    { name: 'Início', path: '/' },
    { name: 'Catálogo', path: '/catalogo', dropdown: [
      { name: 'Sapatas para Compactadores', category: 'sapatas' },
      { name: 'Coxins e Batentes', category: 'coxins_batentes' },
      { name: 'Proteções Sanfonadas', category: 'protecoes_sanfonadas' },
      { name: 'Molas', category: 'molas' },
    ]},
    { name: 'Quem Somos', path: '/quem-somos' },
    { name: 'Contato', path: '/contato' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir="ltr">
      <style>{`
        :root {
          --ddm-orange: #F97316;
          --ddm-orange-dark: #EA580C;
          --ddm-gray: #1F2937;
          --ddm-gray-light: #6B7280;
        }
      `}</style>

      {/* Top Bar */}
      <div className="bg-gray-900 text-white py-2 text-sm hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-orange-500" />
              (31) 3621-0000
            </span>
            <span className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-orange-500" />
              contato@ddmindustria.com.br
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-orange-500" />
            Vespasiano-MG
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-lg' : 'bg-white/95 backdrop-blur-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                <Factory className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900 tracking-tight">DDM</span>
                <p className="text-xs text-gray-500 -mt-1">Indústria e Comércio</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                link.dropdown ? (
                  <DropdownMenu key={link.name}>
                    <DropdownMenuTrigger asChild>
                      <button className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                        location.pathname.startsWith(link.path) && link.path !== '/'
                          ? 'text-orange-600 bg-orange-50'
                          : 'text-gray-700 hover:text-orange-600 hover:bg-gray-50'
                      }`}>
                        {link.name}
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      <DropdownMenuItem asChild>
                        <Link to="/catalogo" className="cursor-pointer">
                          Ver Todos os Produtos
                        </Link>
                      </DropdownMenuItem>
                      {link.dropdown.map((item) => (
                        <DropdownMenuItem key={item.category} asChild>
                          <Link
                            to={`/catalogo?categoria=${item.category}`}
                            className="cursor-pointer"
                          >
                            {item.name}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      location.pathname === link.path
                        ? 'text-orange-600 bg-orange-50'
                        : 'text-gray-700 hover:text-orange-600 hover:bg-gray-50'
                    }`}
                  >
                    {link.name}
                  </Link>
                )
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Link to="/carrinho" className="relative">
                <Button variant="outline" size="icon" className="relative">
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="hidden sm:flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="max-w-24 truncate">{user.full_name?.split(' ')[0] || 'Conta'}</span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link to="/minha-conta" className="cursor-pointer">
                        <User className="w-4 h-4 mr-2" />
                        Minha Conta
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer text-red-600"
                      onClick={() => base44.auth.logout()}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                /* CORREÇÃO AQUI: Usando Link em vez de onClick */
                <Link to="/login">
                  <Button className="hidden sm:flex bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6">
                    Entrar
                  </Button>
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        currentPageName={currentPageName}
        user={user}
      />

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-gray-900 text-white">
        {/* ... (Footer content same as before) ... */}
        {/* Vou abreviar o footer aqui pois já está correto na sua versão, mantenha o que você já tem ou copie do anterior */}
        <div className="border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 py-8">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               {/* Ícones de confiança... */}
               <div className="flex items-center gap-3"><div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center"><Clock className="w-6 h-6 text-orange-500" /></div><div><p className="font-semibold">+30 Anos</p><p className="text-sm text-gray-400">de Experiência</p></div></div>
               <div className="flex items-center gap-3"><div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center"><Wrench className="w-6 h-6 text-orange-500" /></div><div><p className="font-semibold">Engenharia</p><p className="text-sm text-gray-400">Especializada</p></div></div>
               <div className="flex items-center gap-3"><div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center"><Factory className="w-6 h-6 text-orange-500" /></div><div><p className="font-semibold">Fabricação</p><p className="text-sm text-gray-400">Nacional</p></div></div>
               <div className="flex items-center gap-3"><div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center"><Shield className="w-6 h-6 text-orange-500" /></div><div><p className="font-semibold">Qualidade</p><p className="text-sm text-gray-400">Garantida</p></div></div>
             </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center"><Factory className="w-6 h-6 text-white" /></div><span className="text-xl font-bold">DDM Indústria</span></div>
              <p className="text-gray-400 mb-4 leading-relaxed">Há mais de 30 anos fabricando artefatos de borracha de alta qualidade.</p>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2"><MapPin className="w-4 h-4 text-orange-500" /> Vespasiano-MG</p>
                <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-orange-500" /> (31) 3621-0000</p>
                <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-orange-500" /> contato@ddmindustria.com.br</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-lg">Links Rápidos</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-orange-500">Início</Link></li>
                <li><Link to="/catalogo" className="text-gray-400 hover:text-orange-500">Catálogo</Link></li>
                <li><Link to="/contato" className="text-gray-400 hover:text-orange-500">Contato</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-lg">Categorias</h4>
              <ul className="space-y-2">
                <li><Link to="/catalogo?categoria=sapatas" className="text-gray-400 hover:text-orange-500">Sapatas</Link></li>
                <li><Link to="/catalogo?categoria=coxins" className="text-gray-400 hover:text-orange-500">Coxins</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}