import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ZoomIn, Cog } from 'lucide-react';
import { Badge } from '../ui/badge';
import { getFullImageUrl } from '../../api/MysqlServer.js';

export default function ProductImageGallery({
  mainImage, // Vem da tb_produtos (url_imagem)
  images = [], // Array de objetos ou strings da tb_produto_imagens
  productName,
  marca,
  inStock
}) {
  // Unifica a imagem principal com a galeria, garantindo URLs completas
  const allImages = React.useMemo(() => {
    const list = [];
    if (mainImage) list.push(getFullImageUrl(mainImage));
    
    if (Array.isArray(images)) {
      images.forEach(img => {
        // Trata se o item for o objeto da tabela ou apenas a string da URL
        const url = typeof img === 'object' ? img.url_imagem : img;
        const fullUrl = getFullImageUrl(url);
        if (fullUrl !== getFullImageUrl(mainImage)) {
          list.push(fullUrl);
        }
      });
    }
    return list;
  }, [mainImage, images]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  const selectedImage = allImages[selectedIndex] || null;

  const handlePrev = (e) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev + 1) % allImages.length);
  };

  const handleMouseMove = (e) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Container da Imagem Principal com Zoom Industrial */}
      <div
        className="relative aspect-square rounded-2xl overflow-hidden bg-white border-2 border-gray-100 shadow-sm cursor-zoom-in group"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <AnimatePresence mode="wait">
          {selectedImage ? (
            <motion.img
              key={selectedImage}
              src={selectedImage}
              alt={productName}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full object-contain p-6 transition-transform duration-200 ease-out"
              style={{
                transform: isZoomed ? 'scale(2.2)' : 'scale(1)',
                transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-300">
              <Cog className="w-16 h-16 mb-2 animate-spin-slow opacity-20" />
              <span className="text-[10px] font-black uppercase tracking-widest">Imagem não disponível</span>
            </div>
          )}
        </AnimatePresence>

        {/* Badges Técnicos */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none z-10">
          <Badge className="bg-gray-900 text-orange-500 font-black px-3 py-1 border-none shadow-lg text-[10px] uppercase tracking-tighter italic">
            {marca || 'DDM ORIGINAL'}
          </Badge>
          {!inStock && (
            <Badge className="bg-red-600 text-white font-black shadow-lg text-[10px] uppercase">
              Sem Estoque
            </Badge>
          )}
        </div>

        {/* Indicador de Lupa */}
        {selectedImage && !isZoomed && (
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-sm text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn className="w-5 h-5" />
          </div>
        )}

        {/* Navegação Rápida */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white border-2 border-gray-100 hover:bg-gray-900 hover:text-white shadow-xl rounded-xl flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-white border-2 border-gray-100 hover:bg-gray-900 hover:text-white shadow-xl rounded-xl flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Grid de Miniaturas (Thumbnails) */}
      {allImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                idx === selectedIndex
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-100 hover:border-gray-300 bg-white'
              }`}
            >
              <img
                src={img}
                className="w-full h-full object-contain p-1"
                alt={`Detalhe ${idx + 1}`}
              />
              {idx === selectedIndex && (
                 <div className="absolute inset-0 bg-orange-500/5" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}