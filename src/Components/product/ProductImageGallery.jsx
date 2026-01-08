import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ZoomIn, Cog } from 'lucide-react';
// FIX: Relative path to ui/badge
import { Badge } from '../ui/badge';

export default function ProductImageGallery({
  mainImage,
  images = [],
  productName,
  marca,
  inStock
}) {
  // Combine main image with additional images
  const allImages = mainImage
    ? [mainImage, ...images.filter(img => img !== mainImage)]
    : images.length > 0 ? images : [];

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  const selectedImage = allImages[selectedIndex] || null;

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev + 1) % allImages.length);
  };

  const handleMouseMove = (e) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  const handleThumbnailClick = (index) => {
    setSelectedIndex(index);
  };

  return (
    <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 p-4 lg:p-8">
      {/* Main Image Container */}
      <div
        className="relative h-80 lg:h-96 mb-4 rounded-xl overflow-hidden bg-white cursor-zoom-in"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
        onClick={() => selectedImage && window.open(selectedImage, '_blank')}
      >
        <AnimatePresence mode="wait">
          {selectedImage ? (
            <motion.img
              key={selectedIndex}
              src={selectedImage}
              alt={`${productName} - Imagem ${selectedIndex + 1}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full object-contain transition-transform duration-200"
              style={{
                transform: isZoomed ? 'scale(1.5)' : 'scale(1)',
                transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="relative">
                <div className="w-48 h-48 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg shadow-2xl flex items-center justify-center">
                  <Cog className="w-24 h-24 text-gray-600" />
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-40 h-4 bg-black/20 blur-md rounded-full" />
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Zoom Indicator */}
        {selectedImage && (
          <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
            <ZoomIn className="w-3.5 h-3.5" />
            {isZoomed ? 'Clique para ampliar' : 'Passe o mouse para zoom'}
          </div>
        )}

        {/* Navigation Arrows */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); handlePrev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white shadow-lg rounded-full flex items-center justify-center transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleNext(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white shadow-lg rounded-full flex items-center justify-center transition-all"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </>
        )}

        {/* Brand Badge */}
        <div className="absolute top-4 left-4">
          <Badge className="bg-orange-500 text-white text-sm px-4 py-1.5 font-bold shadow-lg">
            {marca}
          </Badge>
        </div>

        {/* Stock Badge */}
        <div className="absolute bottom-4 left-4">
          {inStock ? (
            <Badge className="bg-green-500 text-white shadow-lg">
              Em Estoque
            </Badge>
          ) : (
            <Badge className="bg-red-500 text-white shadow-lg">Indisponível</Badge>
          )}
        </div>

        {/* Image Counter */}
        {allImages.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full">
            {selectedIndex + 1} / {allImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails Strip */}
      {allImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => handleThumbnailClick(idx)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                idx === selectedIndex
                  ? 'border-orange-500 shadow-lg'
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              {idx === selectedIndex && (
                <div className="absolute inset-0 bg-orange-500/20" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Category indicator - Fixed position relative to container, simplified logic */}
      <div className="mt-4">
        <div className="bg-white rounded-lg px-4 py-2 shadow-sm border border-gray-100 inline-block">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Peça Industrial</p>
          <p className="text-sm font-semibold text-gray-800">Borracha de Alta Performance</p>
        </div>
      </div>
    </div>
  );
}