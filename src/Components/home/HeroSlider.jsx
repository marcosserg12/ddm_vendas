import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Award,
  Play,
  Pause,
} from "lucide-react";
import { Button } from "../ui/button";

// IDs baseados na sua tb_categoria
const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&h=1080&fit=crop",
    title: "Sapatas para Compactadores",
    subtitle: "Alta durabilidade e performance",
    description: "Fabricação nacional com os melhores elastômeros para compactação de solo de alta exigência.",
    cta: { text: "Ver Sapatas", link: "/catalogo?id_categoria=1" }, 
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1920&h=1080&fit=crop",
    title: "Coxins e Batentes",
    subtitle: "Isolamento de vibração industrial",
    description: "Amortecedores de impacto que protegem a integridade dos seus equipamentos e operadores.",
    cta: { text: "Ver Coxins", link: "/catalogo?id_categoria=2" },
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=1920&h=1080&fit=crop",
    title: "Proteções Sanfonadas",
    subtitle: "Proteção para guias e fusos",
    description: "Sanfonas de borracha e tecido técnico para proteção de guias lineares e máquinas CNC.",
    cta: { text: "Ver Proteções", link: "/catalogo?id_categoria=3" },
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1920&h=1080&fit=crop",
    title: "Engenharia Sob Medida",
    subtitle: "+30 anos de expertise técnica",
    description: "Desenvolvemos peças especiais em borracha e poliuretano a partir de amostras ou desenhos.",
    cta: { text: "Solicitar Orçamento", link: "/contato" },
  },
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPlaying]);

  const goToSlide = (index) => setCurrentSlide(index);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="relative h-[600px] md:h-[750px] bg-gray-950 overflow-hidden">
      {/* Background Images com Animação */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img
            src={slides[currentSlide].image}
            alt={slides[currentSlide].title}
            className="w-full h-full object-cover opacity-60"
            loading={currentSlide === 0 ? "eager" : "lazy"}
          />
          {/* Gradiente dinâmico para leitura */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-950/70 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 h-full max-w-7xl mx-auto px-6 flex items-center">
        <div className="max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-full px-4 py-1.5 mb-8">
                <Award className="w-4 h-4 text-orange-500" />
                <span className="text-orange-500 text-[10px] font-black uppercase tracking-[0.2em]">
                  {slides[currentSlide].subtitle}
                </span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-8xl font-black text-white mb-6 leading-[0.9] tracking-tighter">
                {slides[currentSlide].title.split(" ").slice(0, -1).join(" ")}{" "}
                <span className="text-orange-600 block sm:inline">
                  {slides[currentSlide].title.split(" ").slice(-1)}
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-400 mb-10 leading-relaxed max-w-xl font-medium">
                {slides[currentSlide].description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  size="lg"
                  className="bg-orange-600 hover:bg-orange-700 text-white font-black uppercase tracking-widest px-10 h-16 shadow-2xl shadow-orange-600/20 rounded-xl"
                >
                  <Link to={slides[currentSlide].cta.link}>
                    {slides[currentSlide].cta.text}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button 
                  asChild
                  size="lg" 
                  variant="outline" 
                  className="border-white/20 bg-white/5 backdrop-blur-md text-white hover:bg-white hover:text-gray-950 h-16 px-10 font-black uppercase tracking-widest rounded-xl transition-all"
                >
                  <Link to="/catalogo">Catálogo Técnico</Link>
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Stats Discretos */}
          <div className="grid grid-cols-3 gap-12 mt-16 pt-10 border-t border-white/5">
            {[
              { label: "Anos de Experiência", val: "30+" },
              { label: "Itens no Catálogo", val: "1k+" },
              { label: "Fabricação Própria", val: "100%" }
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-2xl md:text-4xl font-black text-white tracking-tighter">{stat.val}</p>
                <p className="text-orange-500 text-[9px] font-black uppercase tracking-[0.15em] mt-1 opacity-80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navegação Manual */}
      <div className="hidden md:flex absolute right-12 bottom-12 z-30 gap-3">
        <button onClick={prevSlide} className="w-12 h-12 border border-white/10 bg-white/5 hover:bg-orange-600 text-white rounded-xl flex items-center justify-center transition-all backdrop-blur-md">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button onClick={nextSlide} className="w-12 h-12 border border-white/10 bg-white/5 hover:bg-orange-600 text-white rounded-xl flex items-center justify-center transition-all backdrop-blur-md">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Barra de Progresso e Play/Pause */}
      <div className="absolute bottom-10 left-0 right-0 z-20">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex gap-3">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className="group py-4"
              >
                <div className={`h-1.5 rounded-full transition-all duration-700 ${idx === currentSlide ? "w-16 bg-orange-600" : "w-6 bg-white/20 group-hover:bg-white/40"}`} />
              </button>
            ))}
          </div>
          
          <button onClick={() => setIsPlaying(!isPlaying)} className="text-white/30 hover:text-orange-500 transition-colors p-2">
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
        </div>
      </div>
    </section>
  );
}