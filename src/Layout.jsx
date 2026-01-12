import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { __ddmDatabase } from './api/MysqlServer.js';
import {
    Menu, Phone, Mail, MapPin, ShoppingCart,
    ChevronDown, Factory, Wrench, Shield, Clock, User, LogOut, ChevronRight
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
    const [user, setUser] = useState(null);

    const location = useLocation();
    const navigate = useNavigate();

    // Sincroniza o usuário logado via LocalStorage (JWT)
    useEffect(() => {
        const storedUser = localStorage.getItem('ddm_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // Monitora o scroll para efeitos no header
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Atualiza contador do carrinho baseado no localStorage
    const loadCartCount = () => {
        const cart = JSON.parse(localStorage.getItem('ddm_cart') || '[]');
        const count = cart.reduce((sum, item) => sum + item.quantidade, 0);
        setCartCount(count);
    };

    useEffect(() => {
        loadCartCount();
        window.addEventListener('cartUpdated', loadCartCount);
        return () => window.removeEventListener('cartUpdated', loadCartCount);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('ddm_token');
        localStorage.removeItem('ddm_user');
        setUser(null);
        navigate('/login');
    };

    const navLinks = [
        { name: 'Início', path: '/' },
        { 
            name: 'Catálogo', 
            path: '/catalogo', 
            dropdown: [
                { name: 'Sapatas para Compactadores', id: 1 },
                { name: 'Coxins e Batentes', id: 2 },
                { name: 'Proteções Sanfonadas', id: 3 },
                { name: 'Molas de Borracha', id: 4 },
            ]
        },
        { name: 'Quem Somos', path: '/quem-somos' },
        { name: 'Contato', path: '/contato' },
    ];

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">
            {/* Top Bar Industrial */}
            <div className="bg-gray-900 text-white py-2.5 text-[10px] font-black uppercase tracking-widest hidden md:block border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                    <div className="flex items-center gap-8">
                        <span className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
                            <Phone className="w-3 h-3 text-orange-500" /> (31) 3621-0000
                        </span>
                        <span className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity">
                            <Mail className="w-3 h-3 text-orange-500" /> vendas@ddmindustria.com.br
                        </span>
                    </div>
                    <div className="flex items-center gap-2 opacity-80 italic">
                        <MapPin className="w-3 h-3 text-orange-500" /> Vespasiano - MG | Unidade Industrial
                    </div>
                </div>
            </div>

            {/* Header Principal */}
            <header className={`sticky top-0 z-50 transition-all duration-300 ${
                scrolled ? 'bg-white shadow-xl py-2' : 'bg-white/95 backdrop-blur-md py-4'
            }`}>
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between">
                        {/* Logo DDM */}
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center shadow-lg group-hover:bg-orange-600 transition-colors">
                                <Factory className="w-6 h-6 text-white" />
                            </div>
                            <div className="leading-none">
                                <span className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter">DDM</span>
                                <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Indústria</p>
                            </div>
                        </Link>

                        {/* Navegação Desktop */}
                        <nav className="hidden lg:flex items-center gap-2">
                            {navLinks.map((link) => (
                                link.dropdown ? (
                                    <DropdownMenu key={link.name}>
                                        <DropdownMenuTrigger asChild>
                                            <button className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                                                location.pathname.startsWith(link.path) ? 'text-orange-600' : 'text-gray-600 hover:text-orange-600'
                                            }`}>
                                                {link.name} <ChevronDown className="w-3 h-3" />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start" className="w-64 p-2 rounded-2xl shadow-2xl border-none bg-white">
                                            {link.dropdown.map((item) => (
                                                <DropdownMenuItem key={item.id} asChild>
                                                    <Link to={`/catalogo?id_categoria=${item.id}`} className="flex items-center justify-between p-3 rounded-xl font-bold text-[10px] uppercase tracking-tight text-gray-700 hover:bg-orange-50 hover:text-orange-600 cursor-pointer">
                                                        {item.name} <ChevronRight className="w-3 h-3" />
                                                    </Link>
                                                </DropdownMenuItem>
                                            ))}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                ) : (
                                    <Link key={link.name} to={link.path} className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                                        location.pathname === link.path ? 'text-orange-600' : 'text-gray-600 hover:text-orange-600'
                                    }`}>
                                        {link.name}
                                    </Link>
                                )
                            ))}
                        </nav>

                        {/* Ações de Usuário e Carrinho */}
                        <div className="flex items-center gap-3">
                            <Link to="/carrinho" className="relative group">
                                <div className="w-12 h-12 rounded-xl border-2 border-gray-50 flex items-center justify-center hover:bg-orange-500 hover:border-orange-500 transition-all">
                                    <ShoppingCart className="w-5 h-5 text-gray-900 group-hover:text-white" />
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-600 text-white text-[10px] rounded-full flex items-center justify-center font-black shadow-lg">
                                            {cartCount}
                                        </span>
                                    )}
                                </div>
                            </Link>

                            {user ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="h-12 rounded-xl border-2 border-gray-50 font-black uppercase text-[10px] tracking-widest gap-2">
                                            <User className="w-4 h-4 text-orange-500" />
                                            <span className="hidden sm:inline">{user.ds_nome?.split(' ')[0]}</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl shadow-2xl border-none">
                                        <DropdownMenuItem asChild>
                                            <Link to="/minha-conta" className="p-3 font-bold text-[10px] uppercase tracking-widest flex items-center gap-3 cursor-pointer">
                                                <User className="w-4 h-4" /> Perfil Técnico
                                            </Link>
                                        </DropdownMenuItem>
                                        {user.id_perfil === 1 && (
                                            <DropdownMenuItem asChild>
                                                <Link to="/admin" className="p-3 font-bold text-[10px] uppercase tracking-widest flex items-center gap-3 text-orange-600 cursor-pointer">
                                                    <Shield className="w-4 h-4" /> Painel Gestão
                                                </Link>
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem onClick={handleLogout} className="p-3 font-bold text-[10px] uppercase tracking-widest flex items-center gap-3 text-red-600 cursor-pointer">
                                            <LogOut className="w-4 h-4" /> Sair do Sistema
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Link to="/login">
                                    <Button className="h-12 bg-gray-900 hover:bg-black text-white px-8 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-gray-200">
                                        Entrar
                                    </Button>
                                </Link>
                            )}

                            <button className="lg:hidden w-12 h-12 flex items-center justify-center text-gray-900" onClick={() => setMobileMenuOpen(true)}>
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

            <main className="flex-1 animate-in fade-in duration-500">
                {children}
            </main>

            {/* Footer Unificado */}
            <footer className="bg-gray-900 text-white pt-20 pb-10">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
                        <div className="lg:col-span-2">
                            <div className="flex items-center gap-3 mb-6">
                                <Factory className="w-8 h-8 text-orange-500" />
                                <span className="text-2xl font-black uppercase italic tracking-tighter">DDM <span className="text-orange-500">INDÚSTRIA</span></span>
                            </div>
                            <p className="text-gray-400 font-medium leading-relaxed max-w-md mb-8">
                                Referência nacional em sapatas para compactadores e artefatos técnicos de borracha. Engenharia de ponta para o setor de construção civil.
                            </p>
                            <div className="flex gap-4">
                                <SocialIcon label="LinkedIn" />
                                <SocialIcon label="WhatsApp" />
                                <SocialIcon label="Instagram" />
                            </div>
                        </div>
                        
                        <div>
                            <h4 className="font-black uppercase text-xs tracking-[0.2em] text-orange-500 mb-8">Navegação</h4>
                            <ul className="space-y-4 text-sm font-bold uppercase text-gray-400">
                                <li><Link to="/catalogo" className="hover:text-white transition-colors">Produtos</Link></li>
                                <li><Link to="/quem-somos" className="hover:text-white transition-colors">História</Link></li>
                                <li><Link to="/contato" className="hover:text-white transition-colors">Engenharia</Link></li>
                                <li><Link to="/login" className="hover:text-white transition-colors">Portal Cliente</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-black uppercase text-xs tracking-[0.2em] text-orange-500 mb-8">Unidade Fabril</h4>
                            <ul className="space-y-4 text-[11px] font-bold text-gray-400 uppercase leading-relaxed">
                                <li className="flex items-start gap-3"><MapPin className="w-4 h-4 text-orange-500 shrink-0" /> Vespasiano - MG<br/>Distrito Industrial</li>
                                <li className="flex items-center gap-3"><Clock className="w-4 h-4 text-orange-500 shrink-0" /> Seg-Sex: 08:00 - 18:00</li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                            &copy; {new Date().getFullYear()} DDM INDÚSTRIA E COMÉRCIO | Todos os direitos reservados.
                        </p>
                        <div className="flex items-center gap-6">
                            <Shield className="w-5 h-5 text-gray-700" />
                            <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Site Seguro 256-bit</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function SocialIcon({ label }) {
    return (
        <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-orange-500 transition-all cursor-pointer group">
            <span className="text-[8px] font-black uppercase text-gray-500 group-hover:text-white">{label[0]}</span>
        </div>
    );
}