import React, { useState, useEffect, useRef } from 'react';
import { Crown, X, Upload, Loader2, Image as ImageIcon, Trash2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const PremiumGallery = ({ isSubscribed = false }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isSubscribed) loadPhotos();
    else setLoading(false);
  }, [isSubscribed]);

  const loadPhotos = async () => {
    try {
      const res = await api.get('/providers/my-profile/premium-gallery');
      setPhotos(res.data);
    } catch (error) {
      console.error('Error loading premium gallery:', error);
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

    const remainingSlots = 10 - photos.length;
    if (files.length > remainingSlots) {
      toast.error(`Solo puedes subir ${remainingSlots} foto(s) más (máximo 10)`);
      return;
    }

    setUploading(true);
    let successCount = 0;

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} no es una imagen válida`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} es muy grande (máx 10MB)`);
        continue;
      }

      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.post('/providers/my-profile/premium-gallery', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setPhotos(prev => [...prev, res.data.photo]);
        successCount++;
      } catch (error) {
        toast.error(error.response?.data?.detail || `Error al subir ${file.name}`);
      }
    }

    setUploading(false);
    if (successCount > 0) toast.success(`${successCount} foto(s) premium subida(s)`);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (photoId) => {
    if (!confirm('¿Eliminar esta foto del slider premium?')) return;
    try {
      await api.delete(`/providers/my-profile/premium-gallery/${photoId}`);
      setPhotos(prev => prev.filter(p => p.photo_id !== photoId));
      toast.success('Foto premium eliminada');
    } catch (error) {
      toast.error('Error al eliminar foto');
    }
  };

  if (!isSubscribed) {
    return (
      <div className="bg-gradient-to-br from-[#000000] to-[#1a2530] rounded-2xl p-6 text-white" data-testid="premium-gallery-locked">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
            <Crown className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Slider Premium</h2>
            <p className="text-sm text-white/60">Hasta 10 fotos destacadas</p>
          </div>
        </div>
        <p className="text-sm text-white/70 mb-4">
          Suscríbete para activar el slider premium en tu perfil público. Las fotos del slider se muestran en un carrusel destacado arriba de tu galería.
        </p>
        <div className="flex items-center gap-2 text-yellow-400 text-sm font-medium">
          <Lock className="w-4 h-4" />
          Requiere suscripción activa
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-[16/9] bg-gray-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-yellow-200" data-testid="premium-gallery">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-xl flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-500" />
          Slider Premium
          <span className="text-sm font-normal text-gray-500">({photos.length}/10)</span>
        </h2>
        {photos.length < 10 && (
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            size="sm"
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
            data-testid="upload-premium-photo-btn"
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

      <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-start gap-2">
        <Crown className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-yellow-700">
          Estas fotos aparecen en un carrusel destacado en tu perfil público, arriba de la galería estándar.
        </p>
      </div>

      {photos.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-yellow-200">
          <Crown className="w-12 h-12 text-yellow-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-2">No tienes fotos en tu slider premium</p>
          <p className="text-sm text-gray-400 mb-4">Sube fotos destacadas de tu residencia</p>
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="border-yellow-400 text-yellow-600 hover:bg-yellow-50"
          >
            <Upload className="w-4 h-4 mr-2" />
            Subir primera foto
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((photo) => (
            <div
              key={photo.photo_id}
              className="relative group aspect-[16/9] rounded-xl overflow-hidden bg-gray-100"
              data-testid={`premium-photo-${photo.photo_id}`}
            >
              <img
                src={getImageUrl(photo.thumbnail_url || photo.url)}
                alt="Foto premium"
                className="w-full h-full object-cover"
                loading="lazy"
              />
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PremiumGallery;
