import React from 'react';
import { Link } from 'react-router-dom';
import {
    Factory, Users, MapPin, Target, Award,
    ArrowRight, ShieldCheck
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
        <div className="bg-white font-sans overflow-x-hidden">

            {/* --- HERO SECTION --- */}
            <section className="relative bg-gray-900 py-20 md:py-32 overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=1920"
                        alt="Linha de Produção DDM"
                        className="w-full h-full object-cover opacity-20 md:opacity-10"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-900/90 via-gray-900/50 to-gray-900" />
                </div>
                <div className="relative max-w-7xl mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 md:gap-3 bg-orange-500 text-white rounded-full px-4 py-1.5 md:px-5 md:py-2 mb-6 md:mb-8 shadow-lg shadow-orange-500/20">
                        <Factory className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">Desde 1993</span>
                    </div>
                    <h1 className="text-4xl md:text-7xl font-black text-white mb-4 md:mb-6 uppercase italic tracking-tighter leading-none">
                        Tradição em <span className="text-orange-500">Engenharia</span>
                    </h1>
                    <p className="text-sm md:text-lg text-gray-400 font-medium max-w-2xl mx-auto leading-relaxed px-4">
                        Há mais de três décadas nacionalizando tecnologia e fabricando artefatos de borracha de alta performance para a indústria brasileira.
                    </p>
                </div>
            </section>

            {/* --- MIOLO: HISTÓRIA E NÚMEROS --- */}
            <section className="py-16 md:py-24 bg-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-20 items-center">

                        {/* Texto */}
                        <div className="relative z-10 order-2 lg:order-1">
                            <div className="absolute left-0 top-2 bottom-2 w-1.5 bg-orange-500 rounded-full -ml-6 hidden md:block" />

                            <h2 className="text-3xl md:text-4xl font-black text-gray-900 uppercase italic tracking-tighter leading-[0.95] mb-6 md:mb-8 text-center md:text-left">
                                Uma Trajetória de <br className="hidden md:block"/>
                                <span className="text-orange-500">Dedicação Técnica</span>
                            </h2>

                            <div className="space-y-4 md:space-y-6 text-gray-500 font-medium leading-relaxed text-sm md:text-base text-justify md:text-left">
                                <p>
                                    A <strong className="text-gray-900">DDM Indústria</strong> nasceu do sonho de engenheiros que enxergaram a necessidade de peças de reposição mais duráveis para o mercado de construção civil pesado.
                                </p>
                                <p>
                                    Hoje, instalada em <strong className="text-gray-900">Vespasiano-MG</strong>, operamos em uma estrutura moderna com foco total na <strong className="text-orange-600 italic">nacionalização de peças</strong>, oferecendo uma alternativa de qualidade superior aos importados.
                                </p>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-6 md:gap-8 pt-8 mt-8 border-t border-gray-100">
                                <div className="text-center md:text-left">
                                    <p className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter">360m²</p>
                                    <p className="text-[9px] md:text-[10px] font-black uppercase text-gray-400 tracking-widest mt-1">Área Fabril</p>
                                </div>
                                <div className="text-center md:text-left">
                                    <p className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter">100%</p>
                                    <p className="text-[9px] md:text-[10px] font-black uppercase text-gray-400 tracking-widest mt-1">Nacional</p>
                                </div>
                            </div>
                        </div>

                        {/* Imagem */}
                        <div className="relative group order-1 lg:order-2">
                            <div className="absolute -inset-4 bg-orange-500/10 rounded-[2rem] blur-2xl group-hover:bg-orange-500/20 transition-colors duration-500" />

                            <div className="relative rounded-[2rem] overflow-hidden border-4 md:border-8 border-white shadow-2xl h-64 md:h-auto">
                                <img
                                    src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80"
                                    alt="Fábrica DDM"
                                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700 grayscale group-hover:grayscale-0"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
                            </div>

                            {/* Badge Flutuante (Escondido em telas muito pequenas, visível em sm+) */}
                            <div className="absolute -bottom-6 -left-6 bg-gray-900 text-white p-6 rounded-[1.5rem] shadow-2xl border border-white/10 hidden sm:block">
                                <p className="text-4xl font-black text-orange-500 tracking-tighter italic leading-none">30+</p>
                                <p className="text-[9px] font-black uppercase tracking-widest mt-1">Anos de Mercado</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- PILARES DE SUSTENTAÇÃO --- */}
            <section className="py-16 md:py-24 bg-gray-50 relative">
                <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900 uppercase italic tracking-tighter mb-4">
                            Pilares de <span className="text-orange-500">Sustentação</span>
                        </h2>
                        <div className="w-16 h-1.5 bg-orange-500 mx-auto rounded-full" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        {values.map((value, idx) => (
                            <Card key={idx} className="border-none bg-white shadow-lg shadow-gray-200/50 rounded-[2rem] overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
                                <CardContent className="p-8 md:p-10 flex flex-col items-center text-center">
                                    <div className="w-14 h-14 md:w-16 md:h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-500 transition-colors duration-300">
                                        <value.icon className="w-7 h-7 md:w-8 md:h-8 text-orange-600 group-hover:text-white transition-colors" />
                                    </div>
                                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-3 md:mb-4">
                                        {value.title}
                                    </h3>
                                    <p className="text-xs md:text-sm text-gray-500 font-medium leading-relaxed">
                                        {value.desc}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- LINHA DO TEMPO (Responsiva) --- */}
            <section className="py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12 md:mb-20">
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900 uppercase italic tracking-tighter">
                            Nossa <span className="text-orange-500">Linha do Tempo</span>
                        </h2>
                    </div>
                    {/* Grid responsivo: 1 coluna mobile, 2 tablet, 4 desktop */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {timeline.map((item, idx) => (
                            <div key={idx} className="relative p-6 md:p-8 bg-white border-2 border-gray-100 rounded-3xl hover:border-orange-500 transition-colors group">
                                <span className="text-3xl md:text-4xl font-black text-gray-100 absolute top-4 right-6 group-hover:text-orange-100 transition-colors">
                                    {item.year}
                                </span>
                                <h3 className="font-black text-gray-900 uppercase text-sm mt-4 mb-3 relative z-10">
                                    {item.title}
                                </h3>
                                <p className="text-xs text-gray-400 font-bold leading-relaxed relative z-10">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- CTA FINAL --- */}
            <section className="relative py-16 md:py-24 bg-gray-950 overflow-hidden text-center">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800 via-gray-950 to-gray-950 opacity-40 pointer-events-none" />

                 <div className="relative z-10 max-w-4xl mx-auto px-6">
                    <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 md:px-5 md:py-2 mb-6 md:mb-8 backdrop-blur-sm">
                        <ShieldCheck className="w-3.5 h-3.5 text-orange-500" />
                        <span className="text-orange-500 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em]">
                            Parceria de Confiança
                        </span>
                    </div>

                    <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-6 md:mb-8 leading-[0.9]">
                        Pronto para elevar sua <br />
                        <span className="text-orange-500">Produtividade?</span>
                    </h2>

                    <p className="text-gray-400 font-medium text-sm md:text-lg mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed">
                        Fale com nossos engenheiros e descubra como nossas peças podem reduzir o tempo de máquina parada na sua operação.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/catalogo" className="w-full sm:w-auto">
                            <Button size="lg" className="w-full h-14 md:h-16 px-10 bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg shadow-orange-900/20 hover:scale-105 transition-all">
                                Conhecer Catálogo
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </Button>
                        </Link>
                        <Link to="/contato" className="w-full sm:w-auto">
                            <Button size="lg" variant="outline" className="w-full h-14 md:h-16 px-10 border-2 border-white/10 bg-white/5 text-white hover:bg-white hover:text-gray-950 font-black uppercase tracking-widest text-xs rounded-2xl backdrop-blur-sm transition-all">
                                Falar com Consultor
                            </Button>
                        </Link>
                    </div>
                 </div>
            </section>
        </div>
    );
}