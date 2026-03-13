import React, { useState, useEffect, useRef } from 'react';
import { Camera, X, Upload, Loader2, Image as ImageIcon, GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ProviderGallery = ({ editable = true }) => {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const fileInputRef = useRef(null);
  const [draggedItem, setDraggedItem] = useState(null);

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    try {
      const res = await api.get('/providers/gallery');
      setGallery(res.data);
    } catch (error) {
      console.error('Error loading gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_URL}${path}`;
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const remainingSlots = 10 - gallery.length;
    if (files.length > remainingSlots) {
      toast.error(`Solo puedes subir ${remainingSlots} foto(s) más (máximo 10)`);
      return;
    }

    setUploading(true);
    let successCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setUploadProgress({ current: i + 1, total: files.length, filename: file.name });

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} no es una imagen válida`);
        continue;
      }

      // Validate file size (max 10MB before compression)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} es muy grande (máx 10MB)`);
        continue;
      }

      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await api.post('/providers/gallery/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });

        setGallery(prev => [...prev, res.data.photo]);
        successCount++;

        // Show compression info
        const compression = res.data.compression;
        console.log(`${file.name}: ${compression.original_kb}KB → ${compression.compressed_kb}KB (${compression.reduction} reducción)`);

      } catch (error) {
        toast.error(error.response?.data?.detail || `Error al subir ${file.name}`);
      }
    }

    setUploading(false);
    setUploadProgress(null);

    if (successCount > 0) {
      toast.success(`${successCount} foto(s) subida(s) exitosamente`);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (photoId) => {
    if (!confirm('¿Eliminar esta foto de tu galería?')) return;

    try {
      await api.delete(`/providers/gallery/${photoId}`);
      setGallery(prev => prev.filter(p => p.photo_id !== photoId));
      toast.success('Foto eliminada');
    } catch (error) {
      toast.error('Error al eliminar foto');
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === index) return;

    // Reorder locally
    const newGallery = [...gallery];
    const item = newGallery[draggedItem];
    newGallery.splice(draggedItem, 1);
    newGallery.splice(index, 0, item);
    setGallery(newGallery);
    setDraggedItem(index);
  };

  const handleDragEnd = async () => {
    if (draggedItem !== null) {
      // Save new order to backend
      try {
        const photoIds = gallery.map(p => p.photo_id);
        await api.put('/providers/gallery/reorder', { photo_ids: photoIds });
      } catch (error) {
        console.error('Error saving order:', error);
        loadGallery(); // Reload on error
      }
    }
    setDraggedItem(null);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-[4/3] bg-gray-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border" data-testid="provider-gallery">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-xl flex items-center gap-2">
          <Camera className="w-5 h-5 text-[#E6202E]" />
          Galería de Fotos
          <span className="text-sm font-normal text-gray-500">({gallery.length}/10)</span>
        </h2>
        {editable && gallery.length < 10 && (
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            size="sm"
            className="bg-[#E6202E] hover:bg-[#D31522]"
            data-testid="upload-photo-btn"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-1" />
            )}
            Subir Fotos
          </Button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {/* Photo tip */}
      {editable && gallery.length < 3 && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2" data-testid="gallery-photo-tip">
          <Camera className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700">
            <strong>Tip:</strong> Sube fotos junto a las mascotas que cuidas. Los perfiles con fotos de mascotas generan mas confianza y reciben hasta 3x mas solicitudes.
          </p>
        </div>
      )}

      {/* Upload progress */}
      {uploadProgress && (
        <div className="mb-4 p-3 bg-blue-50 rounded-xl">
          <div className="flex items-center gap-2 text-sm text-blue-700">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Subiendo {uploadProgress.current}/{uploadProgress.total}: {uploadProgress.filename}</span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            Las fotos se comprimen automáticamente para cargar más rápido
          </p>
        </div>
      )}

      {/* Gallery grid */}
      {gallery.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-2">No tienes fotos en tu galería</p>
          <p className="text-sm text-gray-400 mb-4">
            Sube fotos de tu espacio, tus servicios o las mascotas que cuidas
          </p>
          {editable && (
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="border-[#E6202E] text-[#E6202E]"
            >
              <Camera className="w-4 h-4 mr-2" />
              Subir primera foto
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {gallery.map((photo, index) => (
            <div
              key={photo.photo_id}
              draggable={editable}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`relative group aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 ${
                editable ? 'cursor-move' : ''
              } ${draggedItem === index ? 'opacity-50' : ''}`}
              data-testid={`gallery-photo-${photo.photo_id}`}
            >
              <img
                src={getImageUrl(photo.thumbnail_url || photo.url)}
                alt="Foto de galería"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              
              {/* Hover overlay */}
              {editable && (
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => window.open(getImageUrl(photo.url), '_blank')}
                    className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
                    title="Ver tamaño completo"
                  >
                    <ImageIcon className="w-4 h-4 text-gray-700" />
                  </button>
                  <button
                    onClick={() => handleDelete(photo.photo_id)}
                    className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              )}

              {/* Drag handle */}
              {editable && (
                <div className="absolute top-2 left-2 p-1 bg-white/80 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="w-4 h-4 text-gray-500" />
                </div>
              )}

              {/* First photo badge */}
              {index === 0 && (
                <div className="absolute top-2 right-2 px-2 py-1 bg-[#E6202E] text-white text-xs font-bold rounded">
                  Principal
                </div>
              )}

              {/* Size info */}
              {photo.compressed_size_kb && (
                <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 text-white text-xs rounded">
                  {photo.compressed_size_kb} KB
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Help text */}
      {editable && gallery.length > 0 && (
        <p className="text-xs text-gray-400 mt-4 text-center">
          Arrastra las fotos para reordenarlas. La primera foto será tu foto principal.
        </p>
      )}
    </div>
  );
};

export default ProviderGallery;
