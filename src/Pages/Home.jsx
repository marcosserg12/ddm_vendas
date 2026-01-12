import React from 'react';
import { Link } from 'react-router-dom';
import { __ddmDatabase, getFullImageUrl } from '../api/MysqlServer.js';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight, ChevronRight, Factory, Wrench, Shield,
  Cog, CheckCircle2, Truck, Loader2, Package
} from 'lucide-react';
import { Button } from '../Components/ui/button';
import { Card, CardContent } from '../Components/ui/card';
import HeroSlider from '../Components/home/HeroSlider';

const categories = [
  { id: 1, name: 'Sapatas para Compactadores', description: 'Alta durabilidade para compactadores de solo.', icon: Cog },
  { id: 2, name: 'Coxins e Batentes', description: 'Amortecedores e isoladores de vibração.', icon: Shield },
  { id: 3, name: 'Proteções Sanfonadas', description: 'Proteção para guias e fusos de máquinas.', icon: Wrench },
  { id: 4, name: 'Molas de Borracha', description: 'Molas industriais de alta performance.', icon: Factory }
];

const brands = ['Wacker', 'Weber', 'Dynapac', 'Bomaq', 'Mikasa', 'Komatsu', 'Stone', 'Masalta'];

export default function Home() {
  // Busca de Produtos em Destaque sincronizada com tb_produtos
  const { data: featuredProducts = [], isLoading } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: async () => {
        const all = await __ddmDatabase.entities.Produtos.list();
        // Filtra apenas os que estão ativos e marcados como destaque (st_destaque === 'S')
        return all.filter(p => p.st_ativo === 'S').slice(0, 8);
    }
  });

  const formatCurrency = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  return (
    <div className="bg-white min-h-screen">
      <HeroSlider />

      {/* Marcas Compatíveis - Banner Industrial */}
      <section className="bg-gray-900 py-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-orange-500 text-[10px] font-black uppercase tracking-[0.4em] mb-8">
            Peças compatíveis com líderes mundiais
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
             {brands.map(brand => (
               <span key={brand} className="text-white font-black text-xl md:text-2xl italic tracking-tighter uppercase">{brand}</span>
             ))}
          </div>
        </div>
      </section>

      {/* Categorias em destaque */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 uppercase italic tracking-tighter mb-4">
                Nossas Linhas de <span className="text-orange-500">Produção</span>
              </h2>
              <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Tecnologia em elastômeros para o setor de construção civil.</p>
            </div>
            <Link to="/catalogo" className="mt-6 md:mt-0">
                <Button variant="link" className="text-orange-600 font-black uppercase tracking-widest text-xs p-0 group">
                    Ver catálogo completo <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((cat) => (
              <Link key={cat.id} to={`/catalogo?id_categoria=${cat.id}`} className="group">
                <Card className="border-none shadow-none bg-transparent overflow-visible">
                  <div className="relative h-64 bg-gray-900 rounded-3xl mb-6 overflow-hidden flex items-center justify-center transition-transform group-hover:-translate-y-2">
                    <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                    <cat.icon className="w-16 h-16 text-orange-500 relative z-10" />
                  </div>
                  <h3 className="font-black text-gray-900 uppercase text-sm tracking-tight mb-2">{cat.name}</h3>
                  <p className="text-gray-400 text-xs font-bold leading-relaxed">{cat.description}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Produtos em Destaque */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-gray-900 uppercase italic mb-2 tracking-tighter">Peças Mais <span className="text-orange-500">Procuradas</span></h2>
            <div className="w-20 h-1.5 bg-orange-500 mx-auto" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {isLoading ? (
              <div className="col-span-full flex justify-center py-20"><Loader2 className="animate-spin text-orange-500" /></div>
            ) : featuredProducts.map((product) => (
              <Link key={product.id_produto} to={`/produto?id=${product.id_produto}`} className="group">
                <Card className="rounded-3xl border-2 border-gray-50 hover:border-orange-200 transition-all overflow-hidden h-full">
                  <div className="relative h-56 bg-white p-6">
                    <img 
                        src={getFullImageUrl(product.url_imagem_principal)} 
                        alt={product.ds_nome} 
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform" 
                    />
                    <Badge className="absolute top-4 right-4 bg-gray-900 text-[10px] font-black uppercase">
                        {product.ds_marca}
                    </Badge>
                  </div>
                  <CardContent className="p-6 bg-white">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{product.nu_ddm}</p>
                    <h3 className="font-black text-gray-900 text-sm uppercase tracking-tight line-clamp-2 h-10 mb-4">{product.ds_nome}</h3>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                        <span className="font-black text-lg text-gray-900 tracking-tighter">{formatCurrency(product.nu_preco_venda_atual)}</span>
                        <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                            <ArrowRight className="w-4 h-4" />
                        </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Seção Industrial Sob Medida */}
      <section className="py-24 bg-gray-900 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative z-10">
                <span className="inline-block bg-orange-500 text-white font-black text-[10px] uppercase tracking-[0.3em] px-4 py-2 rounded-lg mb-6">Engenharia e Projetos</span>
                <h2 className="text-4xl md:text-6xl font-black text-white uppercase italic tracking-tighter mb-8 leading-[0.9]">Desenvolvimento <span className="text-orange-500">Sob Medida</span></h2>
                <p className="text-gray-400 font-bold text-sm uppercase leading-relaxed mb-10 tracking-tight">
                    Nossa fábrica está equipada para criar moldes exclusivos e peças técnicas a partir de desenhos ou amostras físicas. 
                </p>
                <div className="flex gap-4">
                    <Button asChild className="bg-white hover:bg-orange-500 text-gray-900 hover:text-white font-black uppercase tracking-widest h-16 px-8 rounded-2xl transition-all">
                        <Link to="/contato">Solicitar Orçamento <ArrowRight className="ml-2 w-4 h-4" /></Link>
                    </Button>
                </div>
            </div>
            <div className="relative">
                <div className="absolute -inset-4 bg-orange-500/10 blur-3xl rounded-full animate-pulse" />
                <img 
                    src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800" 
                    className="rounded-3xl shadow-2xl relative z-10 border-4 border-white/5" 
                    alt="Processo Industrial" 
                />
            </div>
        </div>
      </section>
    </div>
  );
}

// Pequeno componente de Badge local para evitar erro de import
function Badge({ children, className }) {
    return (
        <span className={`px-2 py-1 rounded ${className}`}>
            {children}
        </span>
    );
}