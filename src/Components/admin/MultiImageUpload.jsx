import React, { useRef, useState } from 'react';
import { Upload, Trash2, Loader2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { __ddmDatabase, getFullImageUrl } from '../../api/MysqlServer.js';

export default function MultiImageUpload({
  serverImages = [],
  id_produto,
  onServerChange,
  localFiles = [],
  onLocalChange
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // --- MODO NOVO PRODUTO (LOCAL) ---
    if (!id_produto) {
        // Verifica se JÁ existe alguma capa na lista local atual
        const hasMainLocal = localFiles.some(f => f.isMain);

        const newLocalFiles = files.map((file, index) => ({
            id: Math.random().toString(36),
            file: file,
            preview: URL.createObjectURL(file),
            // Só define como capa se NÃO tiver capa ainda E for o primeiro arquivo deste lote
            isMain: !hasMainLocal && index === 0
        }));

        onLocalChange([...localFiles, ...newLocalFiles]);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
    }

    // --- MODO EDIÇÃO (UPLOAD DIRETO) ---
    setUploading(true);

    // Verifica se já existe capa no servidor
    const hasMainServer = serverImages.some(img => img.st_principal === 'S');

    for (const [index, file] of files.entries()) {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('id_produto', id_produto);

      // Se não tem capa no servidor e é o primeiro arquivo, define como capa (S), senão (N)
      const st_principal = (!hasMainServer && index === 0) ? 'S' : 'N';
      formData.append('st_principal', st_principal);

      try {
        await __ddmDatabase.entities.ProdutoImagens.upload(formData);
      } catch (err) {
        toast.error(`Erro ao subir ${file.name}`);
      }
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast.success("Imagens enviadas!");
    if (onServerChange) onServerChange();
  };

  const handleDelete = async (item, isLocal) => {
      if (!confirm("Remover imagem?")) return;

      if (isLocal) {
          const newList = localFiles.filter(f => f.id !== item.id);
          // Se deletou a capa, a primeira da lista vira capa (opcional, boa UX)
          if (item.isMain && newList.length > 0) {
              newList[0].isMain = true;
          }
          onLocalChange(newList);
      } else {
          try {
              await __ddmDatabase.entities.ProdutoImagens.delete(item.id_produto_imagem);
              toast.success("Imagem removida");
              if (onServerChange) onServerChange();
          } catch (error) { toast.error("Erro ao deletar"); }
      }
  };

  const handleSetMain = async (item, isLocal) => {
      if (isLocal) {
          // Local: Reseta todos para false e define o clicado para true
          const newList = localFiles.map(f => ({
              ...f,
              isMain: f.id === item.id
          }));
          onLocalChange(newList);
      } else {
          // Servidor: Chama API
          try {
              await __ddmDatabase.entities.ProdutoImagens.setAsMain(item.id_produto_imagem, id_produto);
              toast.success("Capa atualizada!");
              if (onServerChange) onServerChange();
          } catch (error) {
              console.error(error);
              toast.error("Erro ao definir capa. Tente novamente.");
          }
      }
  };

  // Combina as listas para exibição (Prioridade para Server se existir ID, senão Local)
  const displayList = id_produto ? serverImages : localFiles;

  return (
    <div className="space-y-6">
      <div onClick={() => !uploading && fileInputRef.current?.click()} className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer bg-gray-50/50 group ${uploading ? 'border-orange-200' : 'border-gray-200 hover:border-orange-500'}`}>
        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" disabled={uploading} />
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            <p className="text-[10px] font-black uppercase text-gray-400">Enviando...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <Upload className="w-10 h-10 text-orange-500 mb-3 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-bold text-gray-700">Adicionar Fotos</p>
          </div>
        )}
      </div>

      {displayList.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {displayList.map((img) => {
                const isLocal = !img.id_produto_imagem;
                const key = isLocal ? img.id : img.id_produto_imagem;
                const src = isLocal ? img.preview : getFullImageUrl(img.url_imagem);
                const isMain = isLocal ? img.isMain : img.st_principal === 'S';

                return (
                    <div key={key} className={`relative aspect-square rounded-xl border-2 bg-white shadow-sm overflow-hidden group ${isMain ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-gray-100'}`}>
                        <img src={src} className="w-full h-full object-contain p-2" alt="Produto" />

                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            {/* Botão de Estrela (Capa) */}
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleSetMain(img, isLocal); }}
                                className={`p-2 rounded-lg hover:bg-yellow-50 transition-colors ${isMain ? 'bg-yellow-100 text-yellow-600' : 'bg-white text-yellow-500'}`}
                                title="Definir como Capa"
                            >
                                <Star className={`w-4 h-4 ${isMain ? 'fill-yellow-600' : 'fill-yellow-500'}`} />
                            </button>

                            {/* Botão de Excluir */}
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleDelete(img, isLocal); }}
                                className="p-2 bg-white text-red-500 rounded-lg hover:bg-red-50"
                                title="Excluir"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        {isMain && <div className="absolute top-2 left-2 bg-orange-500 text-white text-[8px] font-black px-2 py-1 rounded shadow-sm z-10">CAPA</div>}
                    </div>
                );
            })}
        </div>
      )}
    </div>
  );
}