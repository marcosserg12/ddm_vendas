import React, { useState, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  Upload, GripVertical,
  Loader2, Star, Trash2, Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { __ddmDatabase, getFullImageUrl } from '../../api/MysqlServer.js';

export default function MultiImageUpload({
  images = [], // Array vindo do banco: [{id_produto_imagem, url_imagem, st_principal}]
  id_produto,
  onImagesChange
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Bloqueio de segurança: precisa do ID do produto para renomear o arquivo no servidor
    if (!id_produto) {
      toast.error("Salve as informações básicas do produto antes de enviar imagens.");
      return;
    }

    setUploading(true);

    for (const file of files) {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('id_produto', id_produto);
      // Define como principal se for a primeira imagem da lista
      formData.append('st_principal', images.length === 0 ? 'S' : 'N');

      try {
        // Envia para a rota de upload físico e padronização de nome
        const newImageData = await __ddmDatabase.entities.ProdutoImagens.upload(formData);
        
        // Atualiza o estado pai com o novo objeto contendo a URL final (/uploads/products/...)
        onImagesChange([...images, newImageData]);
        toast.success(`${file.name} enviado e padronizado!`);
      } catch (err) {
        toast.error(`Erro ao subir ${file.name}: ${err.message}`);
      }
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (index, id_imagem) => {
    try {
      // Remove do banco e deleta o arquivo físico no servidor
      await __ddmDatabase.entities.ProdutoImagens.delete(id_imagem);
      
      const filtered = images.filter((_, i) => i !== index);
      onImagesChange(filtered);
      toast.success('Imagem removida do servidor');
    } catch (err) {
      toast.error('Erro ao excluir imagem');
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Opcional: Você pode disparar uma rota de "updateOrder" aqui se quiser persistir a ordem no banco
    onImagesChange(items);
  };

  return (
    <div className="space-y-4">
      {/* Área de Upload */}
      <div
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer bg-gray-50/50 ${
          uploading ? 'border-orange-200 cursor-wait' : 'border-gray-200 hover:border-orange-500 hover:bg-orange-50/30'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">
              Processando e Gravando no Servidor...
            </p>
          </div>
        ) : (
          <div className="group">
            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform border border-gray-100">
              <Upload className="w-6 h-6 text-orange-500" />
            </div>
            <p className="text-sm font-bold text-gray-700">Adicionar Fotos Técnicas</p>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">
              Padronização Automática: ID_PRODUTO + ID_IMG + DATA
            </p>
          </div>
        )}
      </div>

      {/* Grid de Miniaturas */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="images" direction="horizontal">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex flex-wrap gap-4"
            >
              {images.map((img, idx) => (
                <Draggable 
                  key={img.id_produto_imagem.toString()} 
                  draggableId={img.id_produto_imagem.toString()} 
                  index={idx}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`relative w-28 h-28 rounded-xl border-2 shadow-sm transition-all group ${
                        img.st_principal === 'S' ? 'border-orange-500 ring-4 ring-orange-500/10' : 'border-gray-200'
                      }`}
                    >
                      {/* Helper getFullImageUrl garante o caminho correto (http://localhost:3001/uploads/...) */}
                      <img 
                        src={getFullImageUrl(img.url_imagem)} 
                        className="w-full h-full object-cover" 
                        alt={`Peça ${idx}`} 
                      />
                      
                      {/* Badge de Capa */}
                      {img.st_principal === 'S' && (
                        <div className="absolute top-0 left-0 bg-orange-500 text-white text-[8px] font-black px-2 py-1 rounded-br-lg uppercase shadow-sm">
                          Capa
                        </div>
                      )}

                      {/* Botão de Delete */}
                      <button
                        type="button"
                        onClick={() => handleDelete(idx, img.id_produto_imagem)}
                        className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md"
                        title="Remover permanentemente"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>

                      {/* Handle para Arrastar */}
                      <div 
                        {...provided.dragHandleProps} 
                        className="absolute bottom-1 right-1 p-1 bg-white/80 rounded border border-gray-100 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
                      >
                        <GripVertical className="w-3 h-3" />
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
    </div>
  );
}