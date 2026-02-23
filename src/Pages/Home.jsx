import React from "react";
import { Link } from "react-router-dom";
import { __ddmDatabase, getFullImageUrl } from "../api/MysqlServer.js";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ArrowUpRight,
  MapPin,
  FileText,
  Wrench,
  Shield,
  Cog,
  Loader2,
  Factory,
  Box
} from "lucide-react";
import { Button } from "../Components/ui/button";
import { Card, CardContent } from "../Components/ui/card";
import HeroSlider from "../Components/home/HeroSlider";
import { FlaskConical, Layers } from "lucide-react";

// Pequeno Badge local
function Badge({ children, className }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset bg-gray-100 text-gray-800 backdrop-blur-sm ${className}`}
    >
      {children}
    </span>
  );
}

const categories = [
  {
    id: 1,
    name: "Sapatas",
    description: "Alta durabilidade para compactadores.",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop",
    icon: Cog,
  },
  {
    id: 2,
    name: "Coxins",
    description: "Amortecedores de vibração.",
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop",
    icon: Shield,
  },
  {
    id: 3,
    name: "Sanfonas",
    description: "Proteção para guias e fusos.",
    image: "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=400&h=300&fit=crop",
    icon: Wrench,
  },
  {
    id: 4,
    name: "Molas",
    description: "Molas industriais de borracha.",
    image: "https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?w=400&h=300&fit=crop",
    icon: Factory,
  },
];

const features = [
  { name: "Neoprene", desc: "Resistência química", icon: FlaskConical },
  { name: "Silicone", desc: "Altas temperaturas", icon: Layers },
  { name: "Poliuretano", desc: "Alta resistência", icon: Box },
  { name: "Natural", desc: "Elasticidade", icon: Factory },
];

const brands = ["Wacker", "Weber", "Dynapac", "Bomaq", "Mikasa", "Komatsu", "Stone", "Masalta"];

export default function Home() {
  const { data: featuredProducts = [], isLoading } = useQuery({
    queryKey: ["featuredProducts"],
    queryFn: async () => {
      const all = await __ddmDatabase.entities.Produtos.list();
      // Filtra ativos e pega os primeiros 8
      return all.filter((p) => p.st_ativo === "S").slice(0, 8);
    },
  });

  const formatCurrency = (val) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val || 0);

  return (
    <div className="bg-white min-h-screen font-sans overflow-x-hidden">
      <HeroSlider />

      {/* Marcas Compatíveis */}
      <section className="bg-white border-b border-gray-100 py-8 md:py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <h3 className="text-center text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6 md:mb-8">
            Compatibilidade Industrial
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-4 md:gap-x-10 opacity-60 hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-gray-50 to-white">
            {brands.map((brand) => (
              <span
                key={brand}
                className="text-gray-900 font-black text-sm md:text-xl uppercase tracking-tighter cursor-default hover:text-orange-600 transition-colors transform hover:scale-105"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO 1: LINHAS DE PRODUÇÃO */}
      <section className="py-12 md:py-24 bg-gray-50 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 md:mb-16 pb-6 md:pb-8 border-b border-gray-200">
            <div className="relative pl-5 md:pl-6">
              <div className="absolute left-0 top-1 h-8 md:h-12 w-1.5 bg-orange-500 rounded-full" />
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-gray-900 uppercase tracking-tighter leading-none">
                Linhas de <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-400">
                  Produção
                </span>
              </h2>
              <div className="w-16 h-1 bg-orange-500 rounded-full mt-4"></div>
            </div>
            <div className="flex flex-col items-start md:items-end gap-4 md:gap-6 w-full md:max-w-md">
              <p className="text-gray-500 font-medium text-xs md:text-sm md:text-right leading-relaxed">
                Tecnologia em elastômeros e peças técnicas para máxima performance.
              </p>
              <Link to="/catalogo" className="w-full md:w-auto">
                <Button variant="outline" className="w-full md:w-auto h-10 md:h-12 px-6 border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-black uppercase tracking-widest text-[10px] md:text-xs transition-all flex items-center justify-center gap-2 rounded-xl">
                  Ver Catálogo <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {categories.map((cat) => (
              <Link key={cat.id} to={`/catalogo?id_categoria=${cat.id}`} className="group h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card className="h-full border-none shadow-sm hover:shadow-xl transition-all duration-500 bg-white rounded-2xl md:rounded-[2rem] overflow-hidden relative isolate">
                  <div className="relative h-32 md:h-64 overflow-hidden">
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent opacity-80" />
                    <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-white/10 backdrop-blur-md border border-white/20 p-2 md:p-3 rounded-xl md:rounded-2xl shadow-lg group-hover:bg-orange-500 group-hover:border-orange-500 transition-colors duration-300">
                      <cat.icon className="w-3 h-3 md:w-5 md:h-5 text-white" />
                    </div>
                  </div>
                  <CardContent className="p-4 md:p-6 md:pt-8 relative bg-white">
                    <div className="absolute -top-3 md:-top-4 left-4 md:left-6 w-8 md:w-12 h-1 bg-orange-500 rounded-full transition-all duration-500 group-hover:w-12 md:group-hover:w-16 shadow-lg" />
                    <h3 className="font-black text-gray-900 uppercase text-xs md:text-lg tracking-tight leading-none mb-1 md:mb-2 group-hover:text-orange-600 transition-colors">{cat.name}</h3>
                    <p className="text-gray-500 text-[10px] md:text-xs font-medium leading-relaxed mb-2 md:mb-4 line-clamp-2">{cat.description}</p>
                    <div className="flex items-center gap-1 md:gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-orange-600">
                      Ver <ArrowUpRight className="w-2 h-2 md:w-3 md:h-3" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SEÇÃO 2: PRODUTOS EM DESTAQUE (CARD NOVO) */}
      <section className="py-12 md:py-24 bg-[#F3F4F6] relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          {/* decorações suaves */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-orange-200 opacity-20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-orange-300 opacity-20 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12 gap-4 md:gap-6 border-b border-gray-300 pb-6 md:pb-8">
            <div className="relative pl-5 md:pl-6">
              <div className="absolute left-0 top-1 h-8 md:h-10 w-1.5 bg-orange-500 rounded-full" />
              <h2 className="text-2xl md:text-4xl font-black text-gray-900 uppercase italic tracking-tighter leading-none">
                Peças Mais <br /> <span className="text-orange-500">Procuradas</span>
              </h2>
              <div className="w-14 h-1 bg-orange-500 rounded-full mt-3"></div>
            </div>
            <Link to="/catalogo" className="text-gray-500 hover:text-orange-600 text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-colors self-end md:self-auto">
              Ver tudo <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {isLoading ? (
              <div className="col-span-full flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
              </div>
            ) : (
              featuredProducts.map((product) => (
                <Link
                  key={product.id_produto}
                  to={`/produto?id=${product.id_produto}`}
                  className="group block h-full animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                  <div className="bg-white rounded-[1.5rem] border border-gray-100 hover:border-orange-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 overflow-hidden h-full flex flex-col">

                    {/* Imagem Clean */}
                    <div className="relative aspect-square p-6 bg-white flex items-center justify-center overflow-hidden">
                      <img
                        src={getFullImageUrl(product.url_imagem)}
                        alt={product.ds_nome}
                        className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-110"
                      />
                      {/* Badge Discreto (se houver marca) */}
                      {product.ds_marca && (
                        <span className="absolute top-4 left-4 text-[9px] font-black uppercase text-gray-400 tracking-widest bg-gray-50 px-2 py-1 rounded-md">
                          {product.ds_marca}
                        </span>
                      )}
                    </div>

                    {/* Informações Minimalistas */}
                    <div className="p-5 pt-0 flex-1 flex flex-col justify-between bg-white">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                          Cód: {product.nu_ddm}
                        </p>
                        <h3 className="font-black text-gray-900 text-sm uppercase leading-tight line-clamp-2 group-hover:text-orange-600 transition-colors mb-2">
                          {product.ds_nome}
                        </h3>
                      </div>

                      <div className="mt-2 pt-3 border-t border-gray-50 flex items-center justify-between">
                        <div>
                            <p className="text-[9px] text-gray-400 font-bold uppercase">Unidade</p>
                            <p className="text-lg font-black text-gray-900 tracking-tight">
                            {formatCurrency(product.nu_preco_venda_atual)}
                            </p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
                            <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* SEÇÃO 3: ENGENHARIA */}
      <section className="relative py-16 md:py-28 bg-gray-950 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-gray-800 via-gray-950 to-gray-950 opacity-40 pointer-events-none" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-soft-light pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
          <div className="grid lg:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 md:px-4 md:py-2 mb-6 md:mb-8 backdrop-blur-md">
                <MapPin className="w-3 h-3 md:w-3.5 md:h-3.5 text-orange-500" />
                <span className="text-orange-400 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">Nacional</span>
              </div>
              <h2 className="text-3xl md:text-6xl font-black text-white uppercase italic tracking-tighter mb-4 md:mb-6 leading-[0.95]">
                Engenharia <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-orange-500 to-red-500">Sob Medida</span>
              </h2>
              <div className="w-20 h-1 bg-orange-500 rounded-full mt-4"></div>
              <p className="text-gray-400 font-medium text-sm md:text-base leading-relaxed mb-8 md:mb-10 max-w-lg">
                Desenvolvemos moldes exclusivos a partir de desenhos técnicos (CAD) ou amostras físicas.
              </p>

              <div className="grid grid-cols-2 gap-3 md:gap-4 mb-8 md:mb-12">
                {features.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 md:gap-3 p-3 md:p-4 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="w-7 h-7 md:w-9 md:h-9 rounded-lg bg-gray-800 border border-white/10 flex items-center justify-center text-orange-500 shrink-0">
                      <item.icon className="w-3 h-3 md:w-4 md:h-4" />
                    </div>
                    <h4 className="font-black text-gray-200 text-[10px] md:text-xs uppercase tracking-wide">{item.name}</h4>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <Link to="/contato">
                  <Button className="w-full sm:w-auto h-12 md:h-14 px-8 bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-widest text-[10px] md:text-xs rounded-xl shadow-lg">
                    Orçamento <ArrowRight className="ml-2 w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                </Link>
                <Link to="/quem-somos">
                  <Button variant="outline" className="w-full sm:w-auto h-12 md:h-14 px-8 border border-white/10 bg-white/5 text-gray-300 hover:bg-white hover:text-gray-950 font-black uppercase tracking-widest text-[10px] md:text-xs rounded-xl">
                    <FileText className="mr-2 w-3 h-3 md:w-4 md:h-4" /> História
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative mt-8 lg:mt-0 hidden md:block">
              <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
                <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop" className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-500" alt="Engenharia" />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-6 -left-4 bg-gray-900 p-6 rounded-2xl shadow-xl border border-white/10 flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center text-white">
                  <Factory className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-3xl font-black text-white leading-none tracking-tighter">100%</p>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Nacional</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}