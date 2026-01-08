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
// Ajuste do import para o caminho relativo correto
import { Button } from "../ui/button";

const slides = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1920&h=1080&fit=crop",
    title: "Sapatas para Compactadores",
    subtitle: "Alta durabilidade e performance",
    description:
      "Fabricação nacional com os melhores elastômeros para compactação de solo.",
    cta: { text: "Ver Sapatas", link: "/catalogo?categoria=sapatas" },
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1920&h=1080&fit=crop",
    title: "Coxins e Batentes",
    subtitle: "Isolamento de vibração",
    description:
      "Amortecedores industriais que protegem equipamentos e operadores.",
    cta: { text: "Ver Coxins", link: "/catalogo?categoria=coxins_batentes" },
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?w=1920&h=1080&fit=crop",
    title: "Proteções Sanfonadas",
    subtitle: "Proteção para máquinas CNC",
    description:
      "Sanfonas de borracha para guias lineares e fusos de precisão.",
    cta: {
      text: "Ver Proteções",
      link: "/catalogo?categoria=protecoes_sanfonadas",
    },
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1920&h=1080&fit=crop",
    title: "Engenharia Sob Medida",
    subtitle: "+30 anos de experiência",
    description:
      "Desenvolvemos peças personalizadas a partir de amostras ou desenhos técnicos.",
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

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative h-[600px] md:h-[700px] bg-gray-900 overflow-hidden">
      {/* Background Images */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <img
            src={slides[currentSlide].image}
            alt={slides[currentSlide].title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/90 to-gray-900/60" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full max-w-7xl mx-auto px-4 flex items-center">
        <div className="max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 rounded-full px-4 py-2 mb-6">
                <Award className="w-4 h-4 text-orange-500" />
                <span className="text-orange-400 text-sm font-medium">
                  {slides[currentSlide].subtitle}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                {slides[currentSlide].title.split(" ").slice(0, -1).join(" ")}{" "}
                <span className="text-orange-500">
                  {slides[currentSlide].title.split(" ").slice(-1)}
                </span>
              </h1>

              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                {slides[currentSlide].description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to={slides[currentSlide].cta.link}>
                  <Button
                    size="lg"
                    className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 h-14 text-lg"
                  >
                    {slides[currentSlide].cta.text}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/catalogo">
                  <Button size="lg" variant="outline" className="border-2 border-white bg-black/20 backdrop-blur-sm text-white hover:bg-white hover:text-gray-900 h-14 text-lg">
                    Ver Catálogo Completo
                  </Button>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-3 gap-8 mt-12 pt-12 border-t border-gray-800"
          >
            <div>
              <p className="text-3xl md:text-4xl font-bold text-orange-500">
                30+
              </p>
              <p className="text-gray-400 mt-1">Anos de Mercado</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-orange-500">
                1000+
              </p>
              <p className="text-gray-400 mt-1">Produtos</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-orange-500">
                100%
              </p>
              <p className="text-gray-400 mt-1">Nacional</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Bottom Controls */}
      <div className="absolute bottom-8 left-0 right-0 z-20">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          {/* Slide Indicators */}
          <div className="flex items-center gap-3">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`transition-all duration-300 ${
                  idx === currentSlide
                    ? "w-10 h-2 bg-orange-500 rounded-full"
                    : "w-2 h-2 bg-white/40 hover:bg-white/60 rounded-full"
                }`}
              />
            ))}
          </div>

          {/* Play/Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800 z-20">
        <motion.div
          key={currentSlide}
          initial={{ width: "0%" }}
          animate={{ width: isPlaying ? "100%" : "0%" }}
          transition={{ duration: isPlaying ? 6 : 0, ease: "linear" }}
          className="h-full bg-orange-500"
        />
      </div>
    </section>
  );
}
