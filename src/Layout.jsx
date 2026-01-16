import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu, Phone, Mail, MapPin, ShoppingCart, ChevronDown, User, LogOut,
  ChevronRight, Factory, Clock, Wrench, Shield, LayoutDashboard
} from "lucide-react";
import { Button } from "./Components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "./Components/ui/dropdown-menu";
import MobileDrawer from "./Components/layout/MobileDrawer";

// --- IMPORTAÇÃO DA LOGO ---
import LogoDDM from "./assets/imgs/logo_ddm.png";

export default function Layout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("ddm_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const loadCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("ddm_cart") || "[]");
    const count = cart.reduce((sum, item) => sum + item.quantidade, 0);
    setCartCount(count);
  };

  useEffect(() => {
    loadCartCount();
    window.addEventListener("cartUpdated", loadCartCount);
    return () => window.removeEventListener("cartUpdated", loadCartCount);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("ddm_token");
    localStorage.removeItem("ddm_user");
    setUser(null);
    navigate("/login");
  };

  const navLinks = [
    { name: "Início", path: "/" },
    {
      name: "Catálogo",
      path: "/catalogo",
      dropdown: [
        { name: "Sapatas para Compactadores", id: 1 },
        { name: "Coxins e Batentes", id: 2 },
        { name: "Proteções Sanfonadas", id: 3 },
        { name: "Molas de Borracha", id: 4 },
      ],
    },
    { name: "Quem Somos", path: "/quem-somos" },
    { name: "Contato", path: "/contato" },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      {/* --- TOP BAR --- */}
      <div className="bg-gray-950 text-white py-2.5 text-[11px] font-black uppercase tracking-widest hidden md:block border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 hover:text-orange-500 transition-colors cursor-pointer">
              <Phone className="w-3 h-3 text-orange-500" /> (31) 3621-0000
            </span>
            <span className="flex items-center gap-2 hover:text-orange-500 transition-colors cursor-pointer">
              <Mail className="w-3 h-3 text-orange-500" /> contato@ddmindustria.com.br
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-3 h-3 text-orange-500" /> Vespasiano-MG
          </div>
        </div>
      </div>

      {/* --- HEADER PRINCIPAL --- */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">

            {/* --- LOGO --- */}
            <Link to="/" className="flex items-center gap-4 group">
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-100 shadow-sm group-hover:border-orange-200 transition-colors">
                  <img
                    src={LogoDDM}
                    alt="DDM Indústria"
                    className="w-8 h-8 object-contain"
                  />
              </div>
              <div className="flex flex-col justify-center leading-none">
                <span className="text-xl font-black text-gray-900 uppercase tracking-tighter group-hover:text-orange-600 transition-colors">
                  DDM
                </span>
                <span className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em]">
                  Indústria e Comércio
                </span>
              </div>
            </Link>

            {/* NAVEGAÇÃO */}
            <nav className="hidden lg:flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;

                if (link.dropdown) {
                  return (
                    <DropdownMenu key={link.name}>
                      <DropdownMenuTrigger asChild>
                        <button
                          className={`px-5 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-1 outline-none ${
                            location.pathname.startsWith(link.path)
                              ? "bg-white text-orange-600 shadow-sm"
                              : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                          }`}
                        >
                          {link.name} <ChevronDown className="w-3 h-3 opacity-50" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-64 p-2 bg-white rounded-xl shadow-xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                        {link.dropdown.map((item) => (
                          <DropdownMenuItem key={item.id} asChild>
                            <Link
                              to={`/catalogo?id_categoria=${item.id}`}
                              className="flex items-center justify-between p-3 rounded-lg text-xs font-bold uppercase tracking-wide text-gray-600 hover:text-orange-600 hover:bg-orange-50 cursor-pointer transition-colors"
                            >
                              {item.name}
                              <ChevronRight className="w-3 h-3 opacity-50" />
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                }

                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    className={`px-5 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${
                      isActive
                        ? "bg-white text-orange-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* AÇÕES (Carrinho + User) */}
            <div className="flex items-center gap-4">
              <Link to="/carrinho" className="relative group w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-50 transition-colors">
                <ShoppingCart className="w-5 h-5 text-gray-700 group-hover:text-orange-600 transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-orange-600 text-white text-[9px] rounded-full flex items-center justify-center font-bold ring-2 ring-white">
                    {cartCount}
                  </span>
                )}
              </Link>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-3 pl-1 pr-3 py-1 rounded-xl border border-gray-100 bg-white hover:border-orange-200 hover:shadow-md transition-all group">
                       <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-orange-50 transition-colors">
                           <User className="w-4 h-4 text-gray-500 group-hover:text-orange-600" />
                       </div>
                      <div className="text-left hidden sm:block">
                          <span className="block text-[10px] font-black uppercase text-gray-900 leading-none">{user.ds_nome?.split(" ")[0]}</span>
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Conta</span>
                      </div>
                      <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-orange-500" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56 p-2 bg-white rounded-2xl shadow-xl border border-gray-100 mt-2"
                  >
                     <div className="px-3 py-2 border-b border-gray-50 mb-2">
                        <p className="text-xs font-black text-gray-900 uppercase truncate">{user.ds_nome}</p>
                        <p className="text-[10px] text-gray-400 font-medium truncate">{user.ds_email}</p>
                     </div>

                    <DropdownMenuItem asChild>
                      <Link
                        to="/minha-conta"
                        className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold uppercase text-gray-600 hover:text-orange-600 hover:bg-orange-50 cursor-pointer transition-colors"
                      >
                         <User className="w-4 h-4" /> Minha Conta
                      </Link>
                    </DropdownMenuItem>

                    {/* --- MENU DE ADMIN (SÓ SE FOR ADMIN) --- */}
                    {user.id_perfil === 1 && (
                        <DropdownMenuItem asChild>
                            <Link
                                to="/admin"
                                className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold uppercase text-blue-600 hover:text-blue-700 hover:bg-blue-50 cursor-pointer transition-colors mt-1 border border-blue-50"
                            >
                                <LayoutDashboard className="w-4 h-4" /> Painel Gestão
                            </Link>
                        </DropdownMenuItem>
                    )}

                    <div className="h-px bg-gray-50 my-2" />

                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold uppercase text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Sair da Conta
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link to="/login">
                  <Button
                    className="bg-gray-900 hover:bg-orange-600 text-white font-black uppercase text-[10px] tracking-widest h-10 px-6 rounded-xl shadow-lg shadow-gray-200 transition-all"
                  >
                    Entrar
                  </Button>
                </Link>
              )}

              <button
                className="lg:hidden w-10 h-10 flex items-center justify-center text-gray-900 hover:bg-gray-50 rounded-xl"
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
        user={user}
      />

      <main className="flex-1 animate-in fade-in duration-500">{children}</main>

      {/* --- FOOTER --- */}
      <footer className="bg-gray-950 text-white border-t border-gray-900">

        {/* SELOS DE CONFIANÇA */}
        <div className="border-b border-gray-900 bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-6 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center group-hover:bg-orange-500 transition-colors duration-300">
                  <Clock className="w-6 h-6 text-orange-500 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="font-black text-sm uppercase text-white">+30 Anos</p>
                  <p className="text-[10px] font-bold uppercase text-gray-500 tracking-wider group-hover:text-orange-400 transition-colors">de Mercado</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center group-hover:bg-orange-500 transition-colors duration-300">
                  <Wrench className="w-6 h-6 text-orange-500 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="font-black text-sm uppercase text-white">Engenharia</p>
                  <p className="text-[10px] font-bold uppercase text-gray-500 tracking-wider group-hover:text-orange-400 transition-colors">Especializada</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center group-hover:bg-orange-500 transition-colors duration-300">
                  <Factory className="w-6 h-6 text-orange-500 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="font-black text-sm uppercase text-white">Fabricação</p>
                  <p className="text-[10px] font-bold uppercase text-gray-500 tracking-wider group-hover:text-orange-400 transition-colors">100% Nacional</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-12 h-12 bg-gray-800 rounded-2xl flex items-center justify-center group-hover:bg-orange-500 transition-colors duration-300">
                  <Shield className="w-6 h-6 text-orange-500 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="font-black text-sm uppercase text-white">Garantia</p>
                  <p className="text-[10px] font-bold uppercase text-gray-500 tracking-wider group-hover:text-orange-400 transition-colors">Total DDM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LINKS E INFO */}
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

            {/* COLUNA 1: LOGO E SOBRE */}
            <div className="lg:col-span-2 space-y-6">
              <Link to="/" className="flex items-center gap-4 group w-fit">
                 <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center border border-gray-100">
                    <img src={LogoDDM} alt="DDM Logo" className="w-8 h-8 object-contain" />
                 </div>
                 <div className="flex flex-col justify-center leading-none">
                    <span className="text-2xl font-black text-white uppercase tracking-tighter">DDM</span>
                    <span className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">Indústria e Comércio</span>
                 </div>
              </Link>

              <p className="text-gray-400 text-sm leading-relaxed max-w-md font-medium">
                Referência nacional na fabricação de artefatos de borracha.
                Unimos tradição e tecnologia para entregar durabilidade superior.
              </p>

              <div className="space-y-3 pt-2">
                <p className="flex items-center gap-3 text-sm font-bold text-gray-300">
                  <MapPin className="w-4 h-4 text-orange-600" />
                  <span className="uppercase text-xs tracking-wide">Vespasiano, Minas Gerais</span>
                </p>
                <p className="flex items-center gap-3 text-sm font-bold text-gray-300">
                  <Phone className="w-4 h-4 text-orange-600" />
                  <span className="uppercase text-xs tracking-wide">(31) 3621-0000</span>
                </p>
                <p className="flex items-center gap-3 text-sm font-bold text-gray-300">
                  <Mail className="w-4 h-4 text-orange-600" />
                  <span className="uppercase text-xs tracking-wide">contato@ddmindustria.com.br</span>
                </p>
              </div>
            </div>

            {/* COLUNA 2: NAVEGAÇÃO */}
            <div>
              <h4 className="font-black text-white uppercase text-xs tracking-[0.2em] mb-6 border-l-2 border-orange-500 pl-3">Navegação</h4>
              <ul className="space-y-4">
                {navLinks.map(link => (
                    <li key={link.name}>
                        <Link to={link.path} className="text-sm font-medium text-gray-400 hover:text-white hover:pl-2 transition-all block">
                            {link.name}
                        </Link>
                    </li>
                ))}
              </ul>
            </div>

            {/* COLUNA 3: PRODUTOS */}
            <div>
              <h4 className="font-black text-white uppercase text-xs tracking-[0.2em] mb-6 border-l-2 border-orange-500 pl-3">Destaques</h4>
              <ul className="space-y-4">
                <li><Link to="/catalogo?id_categoria=1" className="text-sm font-medium text-gray-400 hover:text-white hover:pl-2 transition-all block">Sapatas Compactadoras</Link></li>
                <li><Link to="/catalogo?id_categoria=2" className="text-sm font-medium text-gray-400 hover:text-white hover:pl-2 transition-all block">Coxins Industriais</Link></li>
                <li><Link to="/catalogo?id_categoria=3" className="text-sm font-medium text-gray-400 hover:text-white hover:pl-2 transition-all block">Proteções Sanfonadas</Link></li>
                <li><Link to="/catalogo?id_categoria=4" className="text-sm font-medium text-gray-400 hover:text-white hover:pl-2 transition-all block">Molas de Borracha</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* COPYRIGHT */}
        <div className="border-t border-gray-900 py-8 bg-black/20">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-600">
                    © {new Date().getFullYear()} DDM Indústria. Todos os direitos reservados.
                </p>
                <div className="flex items-center gap-6 opacity-40 grayscale hover:grayscale-0 transition-all">
                    {/* Placeholder para bandeiras de cartão ou selos extras */}
                    <div className="h-6 w-10 bg-gray-800 rounded"></div>
                    <div className="h-6 w-10 bg-gray-800 rounded"></div>
                    <div className="h-6 w-10 bg-gray-800 rounded"></div>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
}