import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Award,
  Pause,
  Play,
} from "lucide-react";
import { Button } from "../ui/button";

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=1920&h=1080&fit=crop",
    title: "Proteções Sanfonadas",
    subtitle: "Proteção para máquinas CNC",
    description: "Sanfonas de borracha para guias lineares e fusos de precisão.",
    cta: { text: "Ver Proteções", link: "/catalogo?id_categoria=3" },
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&h=1080&fit=crop",
    title: "Sapatas Compactadoras",
    subtitle: "Alta durabilidade",
    description: "Fabricação nacional com os melhores elastômeros para compactação.",
    cta: { text: "Ver Sapatas", link: "/catalogo?id_categoria=1" },
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1920&h=1080&fit=crop",
    title: "Coxins e Batentes",
    subtitle: "Isolamento de vibração",
    description: "Amortecedores de impacto que protegem a integridade dos equipamentos.",
    cta: { text: "Ver Coxins", link: "/catalogo?id_categoria=2" },
  },
];

const AUTOPLAY_DURATION = 6000;

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Auto-play
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, AUTOPLAY_DURATION);
    return () => clearInterval(timer);
  }, [isPlaying]);

  // Segurança para evitar crash
  const slideAtual = slides[currentSlide];
  if (!slideAtual) {
    if (currentSlide !== 0) setCurrentSlide(0);
    return null;
  }

  const goToSlide = (index) => setCurrentSlide(index);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    // AJUSTE 1: Altura menor no mobile (h-[550px]) e maior no desktop (lg:h-[700px])
    <section className="relative h-[550px] lg:h-[700px] bg-gray-950 overflow-hidden font-sans">

      {/* Background Images */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0"
        >
          <img
            src={slideAtual.image}
            alt={slideAtual.title}
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Conteúdo */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center">
        <div className="max-w-3xl pt-0 sm:pt-10"> {/* Remove padding top extra no mobile */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.5 }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-orange-900/30 border border-orange-500/30 rounded-full px-3 py-1 mb-4 sm:mb-6">
                <Award className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500" />
                <span className="text-orange-500 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
                  {slideAtual.subtitle}
                </span>
              </div>

              {/* Título: Fonte menor no mobile (text-3xl) */}
              <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold text-white mb-3 sm:mb-4 leading-tight">
                {slideAtual.title.split(" ").slice(0, -1).join(" ")}{" "}
                <span className="text-orange-500">
                  {slideAtual.title.split(" ").slice(-1)}
                </span>
              </h1>

              {/* Descrição: Fonte menor no mobile */}
              <p className="text-sm sm:text-lg text-gray-400 mb-6 sm:mb-8 max-w-lg leading-relaxed line-clamp-3 sm:line-clamp-none">
                {slideAtual.description}
              </p>

              {/* Botões: Coluna no mobile, Linha no desktop */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-8 sm:mb-16">
                <Button
                  asChild
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold h-12 sm:h-14 px-6 sm:px-8 rounded-md text-sm sm:text-base transition-all"
                >
                  <Link to={slideAtual.cta.link} className="flex items-center justify-center gap-2">
                    {slideAtual.cta.text}
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="h-12 sm:h-14 px-6 sm:px-8 border border-white/20 bg-gray-900/50 hover:bg-white hover:text-gray-900 text-white font-bold uppercase tracking-wider rounded-md text-xs sm:text-sm transition-all backdrop-blur-sm"
                >
                  <Link to="/catalogo" className="flex items-center justify-center">
                    Catálogo Técnico
                  </Link>
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Stats: Gap menor no mobile */}
          <div className="flex gap-6 sm:gap-12 border-t border-white/10 pt-6 sm:pt-8">
            {[
              { label: "Anos Mercado", val: "30+" },
              { label: "Produtos", val: "1000+" },
              { label: "Nacional", val: "100%" }
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-2xl sm:text-3xl font-bold text-orange-500">{stat.val}</p>
                <p className="text-gray-400 text-[10px] sm:text-xs uppercase tracking-wide mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Botões Laterais (Menores no mobile) */}
      <button onClick={prevSlide} className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/5 hover:bg-orange-500 text-white rounded-full flex items-center justify-center transition-all z-20 backdrop-blur-sm">
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      <button onClick={nextSlide} className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/5 hover:bg-orange-500 text-white rounded-full flex items-center justify-center transition-all z-20 backdrop-blur-sm">
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* --- RODAPÉ --- */}
      <div className="absolute bottom-6 sm:bottom-10 left-0 right-0 z-20">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

          {/* Paginação */}
          <div className="flex gap-2 sm:gap-3 h-4 items-center">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`relative h-1 sm:h-1.5 rounded-full overflow-hidden transition-all duration-500 ${
                  idx === currentSlide ? "w-10 sm:w-16 bg-gray-700" : "w-2 bg-gray-600 hover:bg-gray-500"
                }`}
              >
                {idx === currentSlide && isPlaying && (
                  <motion.div
                    className="absolute inset-0 bg-orange-500 h-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{
                      duration: AUTOPLAY_DURATION / 1000,
                      ease: "linear"
                    }}
                  />
                )}
                {idx === currentSlide && !isPlaying && (
                   <div className="absolute inset-0 bg-orange-500 h-full w-full" />
                )}
              </button>
            ))}
          </div>

          {/* Botão Play/Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all"
          >
            {isPlaying ? <Pause size={16} className="sm:w-5 sm:h-5" /> : <Play size={16} className="sm:w-5 sm:h-5" />}
          </button>

        </div>
      </div>

    </section>
  );
}