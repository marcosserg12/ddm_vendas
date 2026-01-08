import React from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '../api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight, ChevronRight, Factory, Wrench, Shield,
  Clock, Cog, CheckCircle2, Truck, Award, Loader2
} from 'lucide-react';
import { Button } from '../Components/ui/button';
import { Card, CardContent } from '../Components/ui/card';
import HeroSlider from '../Components/home/HeroSlider';

const categories = [
  {
    id: 'sapatas',
    name: 'Sapatas para Compactadores',
    description: 'Sapatas de alta durabilidade para compactadores de solo',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop',
    icon: Cog
  },
  {
    id: 'coxins_batentes',
    name: 'Coxins e Batentes',
    description: 'Amortecedores e isoladores de vibração industrial',
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop',
    icon: Shield
  },
  {
    id: 'protecoes_sanfonadas',
    name: 'Proteções Sanfonadas',
    description: 'Proteção sanfonada para guias e fusos de máquinas',
    image: 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=400&h=300&fit=crop',
    icon: Wrench
  },
  {
    id: 'molas',
    name: 'Molas',
    description: 'Molas de borracha para aplicações industriais',
    image: 'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?w=400&h=300&fit=crop',
    icon: Factory
  }
];

const brands = [
  'Wacker', 'Weber', 'Dynapac', 'Bomaq', 'Mikasa',
  'Komatsu', 'Ingersoll-Rand', 'Stone', 'Masalta'
];

const materials = [
  { name: 'Borracha Natural', desc: 'Alta elasticidade' },
  { name: 'SBR', desc: 'Resistência à abrasão' },
  { name: 'NBR (Nitrílica)', desc: 'Resistência a óleos' },
  { name: 'VITON (FPM)', desc: 'Alta temperatura' }
];

export default function Home() {
  const { data: featuredProducts, isLoading } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: async () => {
        const allProducts = await base44.entities.Product.list();
        return allProducts
            .filter(p => p.destaque === true)
            .slice(0, 8);
    },
    initialData: []
  });

  return (
    <div className="bg-gray-50">
      {/* Hero Slider */}
      <HeroSlider />

      {/* Brand Compatibility Banner */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-center text-gray-500 text-sm font-medium mb-6">
            PEÇAS COMPATÍVEIS COM AS PRINCIPAIS MARCAS DO MERCADO
          </p>
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12">
            {brands.map((brand) => (
              <span
                key={brand}
                className="text-gray-400 hover:text-orange-500 font-bold text-lg md:text-xl transition-colors cursor-default"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Nossas Linhas de Produtos
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Fabricamos peças técnicas de borracha com materiais especializados
              para as mais diversas aplicações industriais
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/catalogo?categoria=${category.id}`}
              >
                <Card className="group h-full overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-white">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-2">
                        <category.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4">{category.description}</p>
                    <span className="text-orange-500 font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                      Ver Produtos <ChevronRight className="w-4 h-4" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Produtos em Destaque
              </h2>
              <p className="text-gray-600">Confira nossos produtos mais procurados</p>
            </div>
            <Link to="/catalogo">
              <Button variant="outline" className="border-gray-300">
                Ver Todos <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
                <div className="col-span-full flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                </div>
            ) : featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <Link key={product.id} to={`/produto?id=${product.id}`}>
                  <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
                    <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
                      {product.imagem_url ? (
                        <img
                          src={product.imagem_url}
                          alt={product.nome}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-24 h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-lg flex items-center justify-center">
                            <Cog className="w-12 h-12 text-gray-600" />
                          </div>
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className="bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded shadow-md">
                          {product.marca}
                        </span>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <p className="text-xs text-gray-500 mb-1">Cód: {product.num_ddm}</p>
                      <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2">
                        {product.nome}
                      </h3>
                      {product.preco && (
                        <p className="text-lg font-bold text-gray-900 mt-2">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.preco)}
                        </p>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm text-gray-500">{product.serie || '--'}</span>
                        <span className="text-orange-500 font-medium text-sm">Comprar →</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-500">Explore nosso catálogo completo de produtos</p>
                <Link to="/catalogo">
                  <Button className="mt-4 bg-orange-500 hover:bg-orange-600">
                    Ver Catálogo
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Materials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Materiais Especializados
              </h2>
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                Trabalhamos com os melhores elastômeros do mercado para garantir
                durabilidade, resistência e performance em cada aplicação.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {materials.map((material, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-orange-200 transition-colors"
                  >
                    <CheckCircle2 className="w-5 h-5 text-orange-500 mb-2" />
                    <p className="font-semibold text-gray-900">{material.name}</p>
                    <p className="text-sm text-gray-500">{material.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=500&fit=crop"
                alt="Materiais"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-orange-500 text-white p-6 rounded-xl shadow-xl">
                <p className="text-3xl font-bold">100%</p>
                <p className="text-sm">Fabricação Nacional</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 rounded-full px-4 py-2 mb-6">
            <Truck className="w-4 h-4 text-orange-500" />
            <span className="text-orange-400 text-sm font-medium">Entrega para Todo Brasil</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Precisa de Peças Sob Medida?
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            Nossa equipe de engenharia está preparada para desenvolver peças
            personalizadas de acordo com suas especificações. Envie amostras ou desenhos técnicos.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contato">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 h-14">
                Solicitar Orçamento Personalizado
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/quem-somos">
              <Button size="lg" variant="outline" className="border-2 border-white text-white bg-transparent hover:bg-white hover:text-gray-900 h-14 font-semibold">Conhecer Nossa História</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}