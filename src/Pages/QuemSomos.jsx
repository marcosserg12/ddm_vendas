import React from 'react';
import { Link } from 'react-router-dom';
// REMOVIDO: createPageUrl
import {
    Factory, Users, MapPin, Target, Award,
    CheckCircle2, Wrench, Clock, ArrowRight
} from 'lucide-react';

// CORREÇÃO: Imports com Components (Maiúscula)
import { Button } from '../Components/ui/button';
import { Card, CardContent } from '../Components/ui/card';

export default function QuemSomos() {
    const timeline = [
        { year: '1993', title: 'Fundação', desc: 'DDM é fundada por três Engenheiros e dois Técnicos' },
        { year: '2000', title: 'Expansão', desc: 'Ampliação das instalações e novos equipamentos' },
        { year: '2010', title: 'Inovação', desc: 'Incorporação de novos materiais como VITON' },
        { year: '2024', title: 'Hoje', desc: 'Mais de 30 anos de tradição e qualidade' }
    ];

    const values = [
        {
            icon: Target,
            title: 'Missão',
            desc: 'Oferecer preços justos com qualidade e pontualidade, desenvolvendo soluções em borracha que atendam às necessidades específicas de cada cliente.'
        },
        {
            icon: Award,
            title: 'Qualidade',
            desc: 'Trabalhamos com materiais de primeira linha e processos controlados para garantir a durabilidade e performance de cada peça.'
        },
        {
            icon: Users,
            title: 'Expertise',
            desc: 'Nossa equipe técnica possui décadas de experiência em engenharia de borracha e conhecimento profundo das aplicações industriais.'
        }
    ];

    return (
        <div className="bg-gray-50">
            {/* Hero Section */}
            <section className="relative bg-gray-900 py-24 overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=1920&h=600&fit=crop"
                        alt="Indústria"
                        className="w-full h-full object-cover opacity-20"
                    />
                </div>
                <div className="relative max-w-7xl mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 rounded-full px-4 py-2 mb-6">
                        <Factory className="w-4 h-4 text-orange-500" />
                        <span className="text-orange-400 text-sm font-medium">Nossa História</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                        Quem Somos
                    </h1>
                    <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                        Há mais de 30 anos fabricando soluções em borracha para a indústria brasileira
                    </p>
                </div>
            </section>

            {/* Company Story */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                                Uma História de <span className="text-orange-500">Engenharia</span> e Dedicação
                            </h2>

                            <div className="space-y-6 text-gray-600 leading-relaxed">
                                <p>
                                    A <strong className="text-gray-900">DDM Indústria e Comércio</strong> foi fundada
                                    há mais de 30 anos por <strong className="text-gray-900">três Engenheiros e dois
                                        Técnicos</strong> com o objetivo de fornecer artefatos de borracha de alta
                                    qualidade para o mercado brasileiro.
                                </p>

                                <p>
                                    Localizada em <strong className="text-gray-900">Vespasiano-MG</strong>, na região
                                    metropolitana de Belo Horizonte, operamos em duas unidades industriais que totalizam
                                    <strong className="text-gray-900"> 360m² de área construída</strong> em um terreno
                                    de 1.055m².
                                </p>

                                <p>
                                    Somos especialistas na fabricação de <strong className="text-gray-900">artefatos
                                        de borracha, coxins, batentes, proteções sanfonadas</strong> e, especialmente,
                                    <strong className="text-orange-500"> sapatas para compactadores</strong> utilizados
                                    no segmento de construção civil.
                                </p>

                                <p>
                                    Nosso diferencial está na capacidade de <strong className="text-gray-900">nacionalizar
                                        e produzir peças sob medida</strong> com rapidez, utilizando materiais especializados
                                    como borracha natural, sintética, SBR, NBR (Nitrílica) e FPM-Fluorelastômero (VITON).
                                </p>
                            </div>
                        </div>

                        <div className="relative">
                            <img
                                src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=500&fit=crop"
                                alt="Nossa Fábrica"
                                className="rounded-2xl shadow-2xl"
                            />
                            <div className="absolute -bottom-6 -right-6 bg-gray-900 text-white p-6 rounded-xl shadow-xl">
                                <p className="text-4xl font-bold text-orange-500">30+</p>
                                <p className="text-sm">Anos de História</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Location Info */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 text-white">
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-6 h-6 text-orange-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">Localização</h3>
                                    <p className="text-gray-400">
                                        Vespasiano-MG<br />
                                        Região Metropolitana de Belo Horizonte
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Factory className="w-6 h-6 text-orange-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">Estrutura</h3>
                                    <p className="text-gray-400">
                                        2 Galpões Industriais<br />
                                        360m² de área construída
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Wrench className="w-6 h-6 text-orange-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg mb-2">Área Total</h3>
                                    <p className="text-gray-400">
                                        Terreno de 1.055m²<br />
                                        Capacidade de expansão
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Nossos Valores
                        </h2>
                        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                            Os princípios que guiam nosso trabalho e compromisso com cada cliente
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {values.map((value, idx) => (
                            <Card key={idx} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                                <CardContent className="p-8">
                                    <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                                        <value.icon className="w-7 h-7 text-orange-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{value.desc}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="py-20 bg-gray-100">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Nossa Trajetória
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-4 gap-6">
                        {timeline.map((item, idx) => (
                            <div key={idx} className="relative">
                                <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow h-full">
                                    <span className="text-4xl font-bold text-orange-500">{item.year}</span>
                                    <h3 className="font-semibold text-gray-900 mt-3 mb-2">{item.title}</h3>
                                    <p className="text-gray-500 text-sm">{item.desc}</p>
                                </div>
                                {idx < timeline.length - 1 && (
                                    <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-orange-300" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Capabilities */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="order-2 lg:order-1">
                            <img
                                src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=450&fit=crop"
                                alt="Capacidades"
                                className="rounded-2xl shadow-xl"
                            />
                        </div>

                        <div className="order-1 lg:order-2">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                                Nossas Capacidades
                            </h2>

                            <div className="space-y-4">
                                {[
                                    'Fabricação de peças sob medida com rapidez',
                                    'Nacionalização de componentes importados',
                                    'Desenvolvimento a partir de amostras ou desenhos',
                                    'Materiais especiais: NBR, VITON, SBR',
                                    'Atendimento em todo território nacional',
                                    'Equipe técnica especializada em engenharia'
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-700">{item}</span>
                                    </div>
                                ))}
                            </div>

                            <Link to="/contato" className="inline-block mt-8">
                                <Button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8">
                                    Entre em Contato
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-orange-500">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <Clock className="w-12 h-12 text-white/80 mx-auto mb-6" />
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Mais de 30 Anos Atendendo Todo o Brasil
                    </h2>
                    <p className="text-orange-100 text-lg mb-8 max-w-2xl mx-auto">
                        Nossa experiência e compromisso com a qualidade fazem da DDM a escolha
                        certa para suas necessidades em artefatos de borracha.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/catalogo">
                            <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 font-semibold px-8 h-14">
                                Ver Catálogo de Produtos
                            </Button>
                        </Link>
                        <Link to="/contato">
                            <Button size="lg" variant="outline" className="border-2 border-white text-white bg-transparent hover:bg-white hover:text-gray-900 h-14 font-semibold">
                                Solicitar Orçamento
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}