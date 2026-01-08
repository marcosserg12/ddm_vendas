import React, { useState, useRef } from 'react';
// Ajuste de import
import { base44 } from '../../api/base44Client';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  Upload, GripVertical,
  Loader2, Star, Trash2, Plus
} from 'lucide-react';
// Ajuste de import
import { Button } from '../ui/button';
import { toast } from 'sonner';

export default function MultiImageUpload({
  mainImage,
  images = [],
  onMainImageChange,
  onImagesChange
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Combine main and additional images for display
  const allImages = mainImage
    ? [mainImage, ...images.filter(img => img !== mainImage)]
    : images;

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    const newUrls = [];

    for (let i = 0; i < files.length; i++) {
      try {
        let file_url;

        // Verificação de segurança: Se a integração existir, usa ela.
        // Se não, cria uma URL local para teste.
        if (base44.integrations && base44.integrations.Core && base44.integrations.Core.UploadFile) {
             const res = await base44.integrations.Core.UploadFile({ file: files[i] });
             file_url = res.file_url;
        } else {
             // Simulação Local
             await new Promise(r => setTimeout(r, 800)); // Fake delay
             file_url = URL.createObjectURL(files[i]);
        }

        newUrls.push(file_url);
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      } catch (err) {
        toast.error(`Erro ao enviar ${files[i].name}`);
      }
    }

    if (newUrls.length > 0) {
      // If no main image, set the first uploaded as main
      if (!mainImage && newUrls.length > 0) {
        onMainImageChange(newUrls[0]);
        onImagesChange([...images, ...newUrls.slice(1)]);
      } else {
        onImagesChange([...images, ...newUrls]);
      }
      toast.success(`${newUrls.length} imagem(ns) enviada(s)!`);
    }

    setUploading(false);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) {
      const dataTransfer = new DataTransfer();
      files.forEach(f => dataTransfer.items.add(f));
      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files;
        handleFileSelect({ target: fileInputRef.current });
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSetAsMain = (imageUrl) => {
    // Remove from additional images if present
    const newImages = images.filter(img => img !== imageUrl);
    // If there was a main image, add it to additional images
    if (mainImage && mainImage !== imageUrl) {
      newImages.unshift(mainImage);
    }
    onMainImageChange(imageUrl);
    onImagesChange(newImages);
    toast.success('Imagem principal atualizada!');
  };

  const handleDelete = (imageUrl) => {
    if (imageUrl === mainImage) {
      // If deleting main image, promote first additional image
      if (images.length > 0) {
        onMainImageChange(images[0]);
        onImagesChange(images.slice(1));
      } else {
        onMainImageChange('');
      }
    } else {
      onImagesChange(images.filter(img => img !== imageUrl));
    }
    toast.success('Imagem removida');
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    if (sourceIndex === destIndex) return;

    const newAllImages = [...allImages];
    const [movedImage] = newAllImages.splice(sourceIndex, 1);
    newAllImages.splice(destIndex, 0, movedImage);

    // First image becomes main, rest are additional
    onMainImageChange(newAllImages[0] || '');
    onImagesChange(newAllImages.slice(1));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Imagens do Produto ({allImages.length})
        </label>
        <span className="text-xs text-gray-400">Arraste para reordenar • Primeira é a capa</span>
      </div>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-orange-400 transition-colors bg-gray-50"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {uploading ? (
          <div className="space-y-3">
            <Loader2 className="w-10 h-10 mx-auto text-orange-500 animate-spin" />
            <div className="w-full max-w-xs mx-auto bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-500">Enviando... {uploadProgress}%</p>
          </div>
        ) : (
          <>
            <Upload className="w-10 h-10 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 font-medium mb-1">
              Arraste imagens aqui ou clique para selecionar
            </p>
            <p className="text-xs text-gray-400 mb-4">
              Suporta múltiplas imagens (PNG, JPG, WEBP)
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="mx-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Selecionar Imagens
            </Button>
          </>
        )}
      </div>

      {/* Image Grid with Drag & Drop */}
      {allImages.length > 0 && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="images" direction="horizontal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3"
              >
                {allImages.map((img, idx) => (
                  <Draggable key={img} draggableId={img} index={idx}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`relative group aspect-square rounded-lg overflow-hidden border-2 ${
                          img === mainImage
                            ? 'border-orange-500 ring-2 ring-orange-200'
                            : 'border-gray-200'
                        } ${snapshot.isDragging ? 'shadow-xl z-50' : ''}`}
                      >
                        <img
                          src={img}
                          alt={`Imagem ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />

                        {/* Main image badge */}
                        {img === mainImage && (
                          <div className="absolute top-1 left-1 bg-orange-500 text-white text-xs px-2 py-0.5 rounded font-medium">
                            Capa
                          </div>
                        )}

                        {/* Drag Handle */}
                        <div
                          {...provided.dragHandleProps}
                          className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-grab"
                        >
                          <GripVertical className="w-4 h-4 text-white" />
                        </div>

                        {/* Action Buttons Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          {img !== mainImage && (
                            <button
                              onClick={() => handleSetAsMain(img)}
                              className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-orange-100 transition-colors"
                              title="Definir como capa"
                              type="button"
                            >
                              <Star className="w-4 h-4 text-orange-500" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(img)}
                            className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-red-100 transition-colors"
                            title="Remover"
                            type="button"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Help text */}
      <p className="text-xs text-gray-400">
        💡 Dica: A primeira imagem será usada como capa nos cards do catálogo.
        Adicione fotos de diferentes ângulos, close-ups de rosca e material.
      </p>
    </div>
  );
}