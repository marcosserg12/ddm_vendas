import React from 'react';
import { Link } from 'react-router-dom';
import {
    Factory, Users, MapPin, Target, Award,
    CheckCircle2, Wrench, Clock, ArrowRight, ShieldCheck
} from 'lucide-react';

import { Button } from '../Components/ui/button';
import { Card, CardContent } from '../Components/ui/card';

export default function QuemSomos() {
    const timeline = [
        { year: '1993', title: 'Fundação', desc: 'A DDM inicia suas atividades com foco em engenharia de elastômeros.' },
        { year: '2000', title: 'Expansão', desc: 'Ampliação do parque fabril e novos equipamentos de vulcanização.' },
        { year: '2010', title: 'Inovação', desc: 'Domínio de compostos especiais como NBR e VITON (FPM).' },
        { year: '2026', title: 'Futuro', desc: 'Liderança em sapatas para compactadores e e-commerce B2B.' }
    ];

    const values = [
        {
            icon: Target,
            title: 'Missão',
            desc: 'Desenvolver soluções técnicas em borracha com precisão de engenharia, garantindo a continuidade operacional de nossos clientes.'
        },
        {
            icon: Award,
            title: 'Qualidade',
            desc: 'Compromisso com a durabilidade. Cada peça passa por rigoroso controle de dureza e resistência à abrasão.'
        },
        {
            icon: Users,
            title: 'Expertise',
            desc: 'Equipe formada por engenheiros e técnicos com décadas de experiência prática no chão de fábrica e em campo.'
        }
    ];

    return (
        <div className="bg-white">
            {/* Hero Section - Industrial Dark */}
            <section className="relative bg-gray-900 py-32 overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=1920"
                        alt="Linha de Produção DDM"
                        className="w-full h-full object-cover opacity-10"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-transparent to-gray-900" />
                </div>
                <div className="relative max-w-7xl mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-3 bg-orange-500 text-white rounded-full px-5 py-2 mb-8 shadow-lg shadow-orange-500/20">
                        <Factory className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Desde 1993</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-6 uppercase italic tracking-tighter leading-none">
                        Tradição em <span className="text-orange-500">Engenharia</span>
                    </h1>
                    <p className="text-lg text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed">
                        Há mais de três décadas nacionalizando tecnologia e fabricando artefatos de borracha de alta performance para a indústria brasileira.
                    </p>
                </div>
            </section>

            {/* História e Números */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-8">
                            <h2 className="text-4xl font-black text-gray-900 uppercase italic tracking-tighter leading-tight">
                                Uma Trajetória de <span className="text-orange-500">Dedicação</span> Técnica
                            </h2>

                            <div className="space-y-6 text-gray-500 font-medium leading-relaxed">
                                <p>
                                    A <strong className="text-gray-900">DDM Indústria e Comércio</strong> nasceu do sonho de três engenheiros e dois técnicos que enxergaram a necessidade de peças de reposição mais duráveis para o mercado de construção civil.
                                </p>
                                <p>
                                    Hoje, instalada em <strong className="text-gray-900">Vespasiano-MG</strong>, operamos em uma estrutura moderna com foco total na <strong className="text-orange-600 italic">nacionalização de peças</strong>, oferecendo uma alternativa de alta qualidade e custo acessível frente aos componentes importados.
                                </p>
                                <div className="grid grid-cols-2 gap-6 pt-6">
                                    <div className="border-l-4 border-orange-500 pl-6 py-2">
                                        <p className="text-3xl font-black text-gray-900">360m²</p>
                                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Área Fabril</p>
                                    </div>
                                    <div className="border-l-4 border-orange-500 pl-6 py-2">
                                        <p className="text-3xl font-black text-gray-900">100%</p>
                                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Nacional</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="relative group">
                            <div className="absolute -inset-4 bg-orange-500/5 rounded-[3rem] blur-2xl group-hover:bg-orange-500/10 transition-colors" />
                            <img
                                src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800"
                                alt="Fábrica DDM"
                                className="relative rounded-[2.5rem] shadow-2xl grayscale hover:grayscale-0 transition-all duration-700"
                            />
                            <div className="absolute -bottom-10 -left-10 bg-gray-900 text-white p-10 rounded-[2rem] shadow-2xl border-4 border-white/10">
                                <p className="text-5xl font-black text-orange-500 tracking-tighter italic">30+</p>
                                <p className="text-[10px] font-black uppercase tracking-widest mt-2">Anos de Mercado</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Valores - Cards Flutuantes */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter mb-16">Pilar de Sustentação</h2>
                    <div className="grid md:grid-cols-3 gap-10">
                        {values.map((value, idx) => (
                            <Card key={idx} className="border-none shadow-xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden group hover:-translate-y-2 transition-transform">
                                <CardContent className="p-10">
                                    <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-8 mx-auto group-hover:bg-orange-500 transition-colors">
                                        <value.icon className="w-8 h-8 text-orange-600 group-hover:text-white" />
                                    </div>
                                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-4">{value.title}</h3>
                                    <p className="text-sm text-gray-500 font-medium leading-relaxed">{value.desc}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trajetória Vertical */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl font-black text-gray-900 uppercase italic tracking-tighter">Nossa <span className="text-orange-500">Linha do Tempo</span></h2>
                    </div>
                    <div className="grid md:grid-cols-4 gap-6">
                        {timeline.map((item, idx) => (
                            <div key={idx} className="relative p-8 bg-white border-2 border-gray-100 rounded-3xl hover:border-orange-500 transition-colors">
                                <span className="text-4xl font-black text-gray-100 absolute top-4 right-6 group-hover:text-orange-100">{item.year}</span>
                                <h3 className="font-black text-gray-900 uppercase text-sm mt-4 mb-3">{item.title}</h3>
                                <p className="text-xs text-gray-400 font-bold leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="bg-orange-500 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-orange-500/40">
                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-8 uppercase italic tracking-tighter leading-none">
                                Pronto para elevar sua <br /> produtividade?
                            </h2>
                            <div className="flex flex-col sm:flex-row gap-6 justify-center">
                                <Button asChild className="bg-white hover:bg-gray-100 text-orange-600 font-black uppercase tracking-widest text-xs h-16 px-12 rounded-2xl">
                                    <Link to="/catalogo">Conhecer Produtos</Link>
                                </Button>
                                <Button asChild variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-orange-600 font-black uppercase tracking-widest text-xs h-16 px-12 rounded-2xl">
                                    <Link to="/contato">Falar com Consultor</Link>
                                </Button>
                            </div>
                        </div>
                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-black/10 rounded-full blur-3xl" />
                    </div>
                </div>
            </section>
        </div>
    );
}