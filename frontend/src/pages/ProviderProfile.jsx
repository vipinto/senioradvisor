import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Shield, MapPin, Phone, MessageSquare, Heart, Lock, Camera, X, CalendarPlus, Crown, Home, Clock, UserCircle, Send, CheckCircle, Loader2, Instagram, Facebook, Globe, Pencil, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api, { API_BASE } from '@/lib/api';
import BookingForm from '@/components/BookingForm';
import AmenitiesDisplay from '@/components/AmenitiesDisplay';
import AdminEditModal from '@/components/AdminEditModal';

const GOOGLE_MAPS_KEY = process.env.REACT_APP_GOOGLE_MAPS_KEY || '';

const SafeMap = ({ latitude, longitude, address, comuna }) => {
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  if (!lat || !lng) {
    if (!address && !comuna) return null;
    return (
      <div className="h-[250px] bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 text-base">
        <div className="text-center">
          <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p>Ubicación no disponible</p>
        </div>
      </div>
    );
  }
  const zoom = 16;
  const src = `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;
  return (
    <iframe
      title="Ubicación"
      className="w-full h-[250px] rounded-xl"
      style={{ border: 0 }}
      loading="lazy"
      src={src}
    />
  );
};

// Criterios de evaluación
const REVIEW_CRITERIA = [
  { id: 'personal', label: 'Trato y cuidado del personal' },
  { id: 'instalaciones', label: 'Calidad de las instalaciones' },
  { id: 'visitas', label: 'Tiempo para visitas' },
  { id: 'comida', label: 'Comida y nutrición' },
  { id: 'actividades', label: 'Actividades y bienestar' }
];

// Componente de estrellas para cada criterio
const StarRating = ({ value, onChange, size = 'md' }) => {
  const sizeClass = size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="focus:outline-none transition-transform hover:scale-110"
        >
          <Star
            className={`${sizeClass} ${star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        </button>
      ))}
    </div>
  );
};

const API_URL = process.env.REACT_APP_BACKEND_URL;

const getPhotoUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
};

const extractYouTubeId = (url) => {
  if (!url) return '';
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([^?&\s]+)/);
  return match ? match[1] : '';
};

// Premium Slider Component - Booking.com style grid
const PremiumSlider = ({ photos }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!photos || photos.length === 0) return null;

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);
  const goPrev = () => setLightboxIndex((lightboxIndex - 1 + photos.length) % photos.length);
  const goNext = () => setLightboxIndex((lightboxIndex + 1) % photos.length);

  const MAX_THUMBS = 5;
  const thumbPhotos = photos.slice(0, MAX_THUMBS);
  const extraCount = photos.length - MAX_THUMBS;

  return (
    <>
      <div className="relative w-full rounded-2xl overflow-hidden shadow-lg" data-testid="premium-slider">
        {/* Premium badge */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#33404f] text-xs font-bold px-3 py-1.5 rounded-full" data-testid="premium-badge">
          <Crown className="w-3.5 h-3.5" />
          Premium
        </div>

        {/* Main grid: 1 large left + 2 stacked right */}
        <div className="flex gap-1" style={{ height: '400px' }}>
          {/* Large photo left */}
          <div className="flex-[3] relative cursor-pointer overflow-hidden" onClick={() => openLightbox(0)}>
            <img
              src={getPhotoUrl(photos[0]?.url)}
              alt="Foto principal"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* 2 stacked photos right */}
          {photos.length > 1 && (
            <div className="flex-[2] flex flex-col gap-1">
              <div className="flex-1 relative cursor-pointer overflow-hidden" onClick={() => openLightbox(1)}>
                <img
                  src={getPhotoUrl(photos[1]?.url)}
                  alt="Foto 2"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              {photos.length > 2 && (
                <div className="flex-1 relative cursor-pointer overflow-hidden" onClick={() => openLightbox(2)}>
                  <img
                    src={getPhotoUrl(photos[2]?.url)}
                    alt="Foto 3"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Thumbnails row */}
        {photos.length > 3 && (
          <div className="flex gap-1 mt-1">
            {thumbPhotos.map((photo, i) => (
              <div
                key={i}
                className="relative flex-1 h-20 cursor-pointer overflow-hidden"
                onClick={() => openLightbox(i)}
              >
                <img
                  src={getPhotoUrl(photo.url)}
                  alt={`Miniatura ${i + 1}`}
                  className="w-full h-full object-cover hover:brightness-75 transition-all"
                />
                {/* "X fotos más" on last thumbnail */}
                {i === MAX_THUMBS - 1 && extraCount > 0 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">+{extraCount} fotos</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={closeLightbox}>
          <div className="relative max-w-5xl max-h-[90vh] w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={getPhotoUrl(photos[lightboxIndex]?.url)}
              alt={`Foto ${lightboxIndex + 1}`}
              className="w-full max-h-[85vh] object-contain rounded-lg"
            />
            {/* Close */}
            <button
              onClick={closeLightbox}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              data-testid="lightbox-close"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            {/* Prev */}
            {photos.length > 1 && (
              <button
                onClick={goPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-colors"
                data-testid="lightbox-prev"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
            )}
            {/* Next */}
            {photos.length > 1 && (
              <button
                onClick={goNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-colors"
                data-testid="lightbox-next"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            )}
            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-4 py-1.5 rounded-full">
              {lightboxIndex + 1} / {photos.length}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default function ProviderProfile() {
  const { providerId } = useParams();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [reviewText, setReviewText] = useState('');
  // Estado para los 5 criterios de evaluación (0 = no seleccionado)
  const [reviewCriteria, setReviewCriteria] = useState({
    personal: 0,
    instalaciones: 0,
    visitas: 0,
    comida: 0,
    actividades: 0
  });
  const [reviewPhotos, setReviewPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [sendingContactRequest, setSendingContactRequest] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const fileInputRef = useRef(null);
  const [editSection, setEditSection] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [togglingFav, setTogglingFav] = useState(false);
  const [expandedServices, setExpandedServices] = useState({});
  const isAdmin = user?.role === 'admin';
  const isClient = user && user.role !== 'admin' && user.role !== 'provider';

  // Calcular promedio de los criterios
  const calculateAverageRating = () => {
    const values = Object.values(reviewCriteria);
    const filledValues = values.filter(v => v > 0);
    if (filledValues.length === 0) return 0;
    return filledValues.reduce((a, b) => a + b, 0) / filledValues.length;
  };

  // Verificar si todos los criterios están llenos
  const allCriteriaFilled = () => {
    return Object.values(reviewCriteria).every(v => v > 0);
  };

  // Verificar si el formulario está completo
  const canSubmitReview = () => {
    return allCriteriaFilled() && reviewText.trim().length > 0;
  };

  useEffect(() => {
    loadProvider();
    loadUser();
  }, [providerId]);

  const loadProvider = async () => {
    try {
      const res = await api.get(`/providers/${providerId}`);
      setProvider(res.data);
    } catch (e) {
      toast.error('Cuidador no encontrado');
    } finally {
      setLoading(false);
    }
  };

  const loadUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
    } catch {}
  };

  // Check favorite status when user and provider are loaded
  useEffect(() => {
    if (user && providerId && user.role !== 'admin' && user.role !== 'provider') {
      api.get(`/favorites/check/${providerId}`)
        .then(res => setIsFavorite(res.data.is_favorite))
        .catch(() => {});
    }
  }, [user, providerId]);

  const toggleFavorite = async () => {
    if (!user) return;
    setTogglingFav(true);
    try {
      if (isFavorite) {
        await api.delete(`/favorites/${providerId}`);
        setIsFavorite(false);
        toast.success('Eliminado de favoritos');
      } else {
        await api.post(`/favorites/${providerId}`);
        setIsFavorite(true);
        toast.success('Añadido a favoritos');
      }
    } catch {
      toast.error('Error al actualizar favoritos');
    } finally {
      setTogglingFav(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (reviewPhotos.length + files.length > 4) {
      toast.error('Maximo 4 fotos');
      return;
    }
    setUploading(true);
    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.post('/reviews/upload-photo', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setReviewPhotos(prev => [...prev, res.data.url]);
      } catch (e) {
        toast.error(e.response?.data?.detail || 'Error al subir foto');
      }
    }
    setUploading(false);
  };

  const submitReview = async () => {
    if (!allCriteriaFilled()) { 
      toast.error('Debes evaluar todos los criterios'); 
      return; 
    }
    if (!reviewText.trim()) { 
      toast.error('Debes escribir un comentario'); 
      return; 
    }
    
    setSubmitting(true);
    const averageRating = calculateAverageRating();
    
    try {
      await api.post('/reviews', {
        provider_id: providerId,
        rating: Math.round(averageRating * 10) / 10, // Promedio con 1 decimal
        criteria: reviewCriteria, // Enviar los 5 criterios individuales
        comment: reviewText,
        photos: reviewPhotos
      });
      toast.success('¡Gracias por tu reseña! Se publicará cuando sea aprobada.');
      setReviewText('');
      setReviewCriteria({
        personal: 0,
        instalaciones: 0,
        visitas: 0,
        comida: 0,
        actividades: 0
      });
      setReviewPhotos([]);
      loadProvider();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Error al enviar reseña');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-16 h-16 border-4 border-[#00e7ff] border-t-transparent rounded-full" /></div>;
  if (!provider) return <div className="min-h-screen flex items-center justify-center text-gray-500">Cuidador no encontrado</div>;

  const EditBtn = ({ section, label }) => isAdmin ? (
    <button
      onClick={() => setEditSection(section)}
      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-[#33404f] hover:bg-[#00e7ff] hover:text-[#33404f] rounded-full transition-colors ml-2"
      data-testid={`admin-edit-${section}`}
    >
      <Pencil className="w-3 h-3" />
      {label || 'Editar'}
    </button>
  ) : null;

  return (
    <div className="min-h-screen bg-gray-50" data-testid="provider-profile">
      {/* Admin Edit Modal */}
      {editSection && (
        <AdminEditModal
          section={editSection}
          provider={provider}
          onClose={() => setEditSection(null)}
          onSaved={loadProvider}
        />
      )}

      {/* Admin Floating Bar */}
      {isAdmin && (
        <div className="sticky top-0 z-40 bg-[#33404f] text-white px-4 py-2 flex items-center justify-between shadow-lg" data-testid="admin-edit-bar">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span className="text-sm font-medium">Modo Admin</span>
            <span className="text-xs text-white/60">- Haz clic en los botones "Editar" de cada sección</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setEditSection('settings')}
              className="px-3 py-1 text-xs font-bold bg-[#00e7ff] text-[#33404f] rounded-full hover:bg-white transition-colors"
              data-testid="admin-settings-btn"
            >
              Destacado / Plan / Place ID
            </button>
          </div>
        </div>
      )}
      {/* Hero */}
      <div className="relative bg-[#00e7ff] pt-6 pb-6 md:h-64 md:pt-0 md:pb-0">
        <div className="md:absolute md:inset-0 md:flex md:items-end">
          <div className="max-w-5xl mx-auto w-full px-4 md:pb-8">
            {/* Mobile layout */}
            <div className="md:hidden">
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-end gap-3">
                  <div className="w-24 h-24 rounded-2xl bg-white shadow-xl flex items-center justify-center overflow-hidden shrink-0">
                    {provider.profile_photo ? (
                      <img src={getPhotoUrl(provider.profile_photo)} alt="" className="w-full h-full object-cover" />
                    ) : provider.gallery?.[0]?.url ? (
                      <img src={getPhotoUrl(provider.gallery[0].url)} alt="" className="w-full h-full object-cover" />
                    ) : provider.photos?.[0] ? (
                      <img src={provider.photos[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-bold text-[#00e7ff]">{provider.business_name?.[0]}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 pb-0.5">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`w-4 h-4 ${s <= Math.round(provider.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                    <span className="text-sm font-bold text-[#33404f] ml-1" data-testid="provider-rating">{provider.rating?.toFixed(1) || '0.0'}</span>
                    <span className="text-xs text-[#33404f]/60">({provider.total_reviews || 0})</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {provider.plan_type === 'premium_plus' && (
                    <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#33404f] text-xs px-3 py-1 rounded-full flex items-center gap-1 font-bold shadow-md">
                      <Crown className="w-3.5 h-3.5" />Premium+
                    </span>
                  )}
                  {provider.plan_type === 'premium' && (
                    <span className="bg-[#00e7ff] text-[#33404f] text-xs px-3 py-1 rounded-full flex items-center gap-1 font-bold shadow-md">
                      Premium
                    </span>
                  )}
                  {provider.plan_type === 'destacado' && (
                    <span className="bg-[#33404f] text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" />Destacado
                    </span>
                  )}
                  {isClient && (
                    <button onClick={toggleFavorite} disabled={togglingFav} className="p-1 rounded-full hover:bg-white/40 transition-colors" data-testid="favorite-toggle-btn">
                      <Heart className={`w-6 h-6 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-[#33404f] hover:text-red-400'}`} />
                    </button>
                  )}
                </div>
              </div>
              <h1 className="text-2xl font-bold text-[#33404f] leading-tight mb-1" data-testid="provider-name">
                {provider.business_name}
                {provider.verified && <Shield className="w-5 h-5 text-yellow-300 inline ml-2" />}
                <EditBtn section="general" />
              </h1>
              {provider.address && <p className="text-sm text-[#33404f]">{provider.address}</p>}
              <p className="text-sm font-bold text-[#33404f]">{provider.comuna}</p>
            </div>

            {/* Desktop layout */}
            <div className="hidden md:flex items-end gap-4">
              <div className="w-24 h-24 rounded-2xl bg-white shadow-xl flex items-center justify-center overflow-hidden shrink-0">
                {provider.profile_photo ? (
                  <img src={getPhotoUrl(provider.profile_photo)} alt="" className="w-full h-full object-cover" />
                ) : provider.gallery?.[0]?.url ? (
                  <img src={getPhotoUrl(provider.gallery[0].url)} alt="" className="w-full h-full object-cover" />
                ) : provider.photos?.[0] ? (
                  <img src={provider.photos[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-[#00e7ff]">{provider.business_name?.[0]}</span>
                )}
              </div>
              <div className="pb-1 min-w-0">
                <div className="flex items-center gap-1 mb-1">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-4 h-4 ${s <= Math.round(provider.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                  <span className="text-sm font-bold text-[#33404f] ml-1">{provider.rating?.toFixed(1) || '0.0'}</span>
                  <span className="text-sm text-[#33404f]/60">({provider.total_reviews || 0} reseñas)</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-bold text-[#33404f]">{provider.business_name}</h1>
                  {provider.verified && <Shield className="w-6 h-6 text-yellow-300" />}
                  {provider.plan_type === 'premium_plus' && (
                    <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#33404f] text-xs px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                      <Crown className="w-3 h-3" />Premium+
                    </span>
                  )}
                  {provider.plan_type === 'premium' && (
                    <span className="bg-[#00e7ff] text-[#33404f] text-xs px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                      Premium
                    </span>
                  )}
                  {provider.plan_type === 'destacado' && (
                    <span className="bg-[#33404f] text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" />Destacado
                    </span>
                  )}
                  {isClient && (
                    <button onClick={toggleFavorite} disabled={togglingFav} className="p-1.5 rounded-full hover:bg-white/40 transition-colors" data-testid="favorite-toggle-btn">
                      <Heart className={`w-6 h-6 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-[#33404f] hover:text-red-400'}`} />
                    </button>
                  )}
                  <EditBtn section="general" />
                </div>
                {provider.address && <p className="font-normal text-[#33404f]">{provider.address}</p>}
                <p className="font-bold text-[#33404f]">{provider.comuna}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Premium Slider - Only for Premium+ providers */}
            {(provider.plan_type === 'premium_plus' && provider.premium_gallery?.length > 0) || isAdmin ? (
              <div className="relative">
                {isAdmin && (
                  <div className="flex justify-end mb-2">
                    <EditBtn section="premium_gallery" label="Gestionar Slider" />
                  </div>
                )}
                {provider.premium_gallery?.length > 0 && (
                  <PremiumSlider photos={provider.premium_gallery} />
                )}
                {isAdmin && (!provider.premium_gallery || provider.premium_gallery.length === 0) && (
                  <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-dashed border-gray-300 text-center">
                    <p className="text-sm text-gray-400">Sin fotos en slider premium</p>
                  </div>
                )}
              </div>
            ) : null}

            {/* Description - Sobre mi */}
            {provider.description && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-3">Sobre mi<EditBtn section="general" /></h2>
                <p className="text-gray-700 leading-relaxed">{provider.description}</p>
              </div>
            )}

            {/* YouTube Video - Only for Premium+ providers */}
            {provider.plan_type === 'premium_plus' && provider.youtube_video_url ? (
              <div className="relative w-full rounded-2xl overflow-hidden shadow-lg" data-testid="provider-youtube-video">
                {isAdmin && <div className="absolute top-2 right-2 z-10"><EditBtn section="youtube" /></div>}
                <div className="relative w-full aspect-[16/9]">
                  <iframe
                    src={`https://www.youtube.com/embed/${extractYouTubeId(provider.youtube_video_url)}`}
                    title="Video de la residencia"
                    className="absolute inset-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            ) : isAdmin ? (
              <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-dashed border-gray-300 text-center">
                <p className="text-sm text-gray-400 mb-2">Sin video YouTube</p>
                <EditBtn section="youtube" label="Agregar Video" />
              </div>
            ) : null}

            {/* Amenidades / Servicios */}
            <div className="relative">
              {isAdmin && <div className="absolute top-4 right-4 z-10"><EditBtn section="amenities" /></div>}
              <AmenitiesDisplay amenities={provider.amenities} />
              {isAdmin && (!provider.amenities || provider.amenities.length === 0) && (
                <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-dashed border-gray-300 text-center">
                  <p className="text-sm text-gray-400 mb-2">Sin servicios/amenidades</p>
                  <EditBtn section="amenities" label="Agregar Servicios" />
                </div>
              )}
            </div>

            {/* Photo Gallery - After services */}
            {(provider.gallery?.length > 0 || isAdmin) && (
              <div className="bg-white rounded-2xl p-6 shadow-sm" data-testid="provider-gallery-public">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-[#00e7ff]" />
                  Galeria
                  <EditBtn section="gallery" label="Gestionar Fotos" />
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {provider.gallery.map((photo, index) => (
                    <div 
                      key={photo.photo_id} 
                      className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(getPhotoUrl(photo.url), '_blank')}
                    >
                      <img
                        src={getPhotoUrl(photo.thumbnail_url || photo.url)}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Personal Info (Más Datos) */}
            {((provider.personal_info && Object.values(provider.personal_info).some(v => v && v !== '' && v !== false && !(Array.isArray(v) && v.length === 0))) || isAdmin) && (
              <div className="bg-white rounded-2xl p-6 shadow-sm" data-testid="provider-personal-info">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <UserCircle className="w-5 h-5 text-[#00e7ff]" />
                  Más Información
                  <EditBtn section="personal_info" />
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {provider.personal_info?.housing_type && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <Home className="w-5 h-5 text-[#00e7ff] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Tipo de instalación</p>
                        <p className="text-sm text-gray-800 capitalize">{provider.personal_info.housing_type}</p>
                      </div>
                    </div>
                  )}
                  {provider.personal_info?.daily_availability && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <Clock className="w-5 h-5 text-[#00e7ff] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Horario de atención</p>
                        <p className="text-sm text-gray-800">{provider.personal_info.daily_availability}</p>
                      </div>
                    </div>
                  )}
                  {provider.personal_info?.bio && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl sm:col-span-2">
                      <UserCircle className="w-5 h-5 text-[#00e7ff] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Descripción adicional</p>
                        <p className="text-sm text-gray-800">{provider.personal_info.bio}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Service Zones - Comunas and Walking Zones */}
            {(provider.coverage_radius_km || provider.service_comunas?.length > 0 || provider.walking_zones?.length > 0) && (
              <div className="bg-white rounded-2xl p-6 shadow-sm" data-testid="provider-service-zones">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#00e7ff]" />
                  Zona de Servicio
                </h2>
                
                {provider.coverage_radius_km && (
                  <div className="mb-4 p-3 bg-cyan-50 rounded-xl">
                    <p className="text-sm text-blue-800">
                      <strong>Radio de cobertura:</strong> {provider.coverage_radius_km} km desde su ubicación
                    </p>
                  </div>
                )}
                
                {provider.service_comunas?.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Comunas donde ofrece servicio:</h3>
                    <div className="flex flex-wrap gap-2">
                      {provider.service_comunas.map(comuna => (
                        <span 
                          key={comuna}
                          className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full text-sm"
                        >
                          {comuna}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {provider.walking_zones?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Zonas de cobertura:</h3>
                    <div className="flex flex-wrap gap-2">
                      {provider.walking_zones.map(zone => (
                        <span 
                          key={zone}
                          className="px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm"
                        >
                          {zone}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Reseñas</h2>

              {/* Write Review - Formulario con 5 criterios */}
              {user ? (
                <div className="mb-6 p-6 bg-gray-50 rounded-xl" data-testid="review-form">
                  <h3 className="text-lg font-bold text-[#33404f] mb-4">Deja tu reseña</h3>
                  
                  {/* 5 Criterios de evaluación */}
                  <div className="space-y-4 mb-6">
                    {REVIEW_CRITERIA.map((criterion) => (
                      <div key={criterion.id} className="flex items-center justify-between py-2 border-b border-gray-200">
                        <span className="text-base text-[#33404f] font-medium">{criterion.label}</span>
                        <StarRating
                          value={reviewCriteria[criterion.id]}
                          onChange={(value) => setReviewCriteria(prev => ({ ...prev, [criterion.id]: value }))}
                        />
                      </div>
                    ))}
                  </div>

                  {/* Promedio calculado */}
                  {allCriteriaFilled() && (
                    <div className="mb-4 p-3 bg-[#00e7ff]/10 rounded-lg text-center">
                      <span className="text-[#33404f] font-semibold">
                        Puntuación promedio: {calculateAverageRating().toFixed(1)} ⭐
                      </span>
                    </div>
                  )}

                  {/* Comentario */}
                  <textarea
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    placeholder="Ingresa tu comentario..."
                    className="w-full border-2 border-gray-200 rounded-xl p-4 text-base min-h-[120px] focus:outline-none focus:ring-2 focus:ring-[#00e7ff] focus:border-[#00e7ff] mb-4 text-[#33404f] placeholder-gray-400"
                    data-testid="review-text-input"
                  />

                  {/* Photo Upload */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {reviewPhotos.map((url, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border">
                        <img src={`${process.env.REACT_APP_BACKEND_URL}${url}`} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => setReviewPhotos(prev => prev.filter((_, j) => j !== i))}
                          className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {reviewPhotos.length < 4 && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-[#00e7ff] hover:text-[#00e7ff] transition-colors"
                        data-testid="upload-photo-button"
                      >
                        <Camera className="w-5 h-5" />
                        <span className="text-xs mt-1">{uploading ? 'Subiendo...' : 'Añadir foto'}</span>
                      </button>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
                  </div>

                  {/* Mensaje de validación */}
                  {!canSubmitReview() && (
                    <p className="text-sm text-gray-500 mb-3">
                      * Debes evaluar todos los criterios y escribir un comentario para enviar tu reseña
                    </p>
                  )}

                  {/* Botón de envío */}
                  <Button
                    onClick={submitReview}
                    disabled={submitting || !canSubmitReview()}
                    className={`w-full py-4 text-lg font-bold ${canSubmitReview() ? 'bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f]' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                    data-testid="submit-review-button"
                  >
                    {submitting ? 'Enviando...' : 'Publicar Reseña'}
                  </Button>
                </div>
              ) : (
                <div className="mb-6 p-5 bg-gray-50 rounded-xl text-center" data-testid="review-login-prompt">
                  <p className="text-[#33404f] font-medium mb-2">Para dejar una reseña debes iniciar sesión</p>
                  <a href="/login" className="text-[#00e7ff] font-bold hover:underline">Iniciar Sesión</a>
                </div>
              )}

              {/* Review List */}
              {(() => {
                const platformReviews = (provider.reviews || []).map(r => ({ ...r, source: 'platform' }));
                const googleReviews = (provider.google_reviews || []).map(r => ({
                  user_name: r.author,
                  user_picture: r.author_photo,
                  rating: r.rating,
                  overall_rating: r.rating,
                  comment: r.text,
                  time_description: r.time_description,
                  source: 'google',
                }));
                const allReviews = [...platformReviews, ...googleReviews];
                return allReviews.length > 0 ? (
                <div className="space-y-4">
                  {allReviews.map((r, i) => (
                    <div key={i} className="border-b last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                          {r.user_picture ? <img src={r.user_picture} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <span className="text-sm font-bold">{r.user_name?.[0]}</span>}
                        </div>
                        <span className="font-medium text-sm">{r.user_name}</span>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= (r.rating || r.overall_rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />)}
                        </div>
                        {r.time_description && <span className="text-xs text-gray-400 ml-auto">{r.time_description}</span>}
                      </div>
                      {r.comment && <p className="text-sm text-gray-700">{r.comment}</p>}
                      {r.photos?.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {r.photos.map((url, j) => (
                            <img key={j} src={url.startsWith('http') ? url : `${process.env.REACT_APP_BACKEND_URL}${url}`} alt="" className="w-20 h-20 rounded-lg object-cover border" />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-4">Sin reseñas aún</p>
              );
              })()}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Redes Sociales */}
            {((provider.social_links && (provider.social_links.instagram || provider.social_links.facebook || provider.social_links.website)) || isAdmin) && (
              <div className="bg-white rounded-2xl p-5 shadow-sm" data-testid="provider-social-links">
                {isAdmin && <div className="text-center mb-2"><EditBtn section="social" /></div>}
                <div className="flex items-center justify-center gap-5">
                  {provider.social_links?.instagram && (
                    <a href={provider.social_links.instagram} target="_blank" rel="noopener noreferrer" 
                       className="group w-11 h-11 rounded-full bg-[#33404f] flex items-center justify-center hover:bg-[#33404f] transition-colors"
                       data-testid="social-instagram">
                      <Instagram className="w-5 h-5 text-white group-hover:text-[#00e7ff] transition-colors" />
                    </a>
                  )}
                  {provider.social_links?.facebook && (
                    <a href={provider.social_links.facebook} target="_blank" rel="noopener noreferrer"
                       className="group w-11 h-11 rounded-full bg-[#33404f] flex items-center justify-center hover:bg-[#33404f] transition-colors"
                       data-testid="social-facebook">
                      <Facebook className="w-5 h-5 text-white group-hover:text-[#00e7ff] transition-colors" />
                    </a>
                  )}
                  {provider.social_links?.website && (
                    <a href={provider.social_links.website} target="_blank" rel="noopener noreferrer"
                       className="group w-11 h-11 rounded-full bg-[#33404f] flex items-center justify-center hover:bg-[#33404f] transition-colors"
                       data-testid="social-website">
                      <Globe className="w-5 h-5 text-white group-hover:text-[#00e7ff] transition-colors" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Precio */}
            {((provider.services?.filter(s => s.price_from > 0 || s.description).length > 0) || isAdmin) && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-4">Precio<EditBtn section="services" /></h3>
                {provider.services.filter(s => s.price_from > 0 || s.description).map((s, i) => {
                  const formatServiceName = (type) => {
                    const names = {
                      'residencias': 'Residencias',
                      'cuidado-domicilio': 'Cuidado a Domicilio',
                      'salud-mental': 'Salud Mental'
                    };
                    return names[type] || type;
                  };
                  const hasSubPrices = s.sub_prices && s.sub_prices.length > 0;
                  const isExpanded = expandedServices[i];
                  return (
                    <div key={i} className="mb-3 last:mb-0">
                      <div
                        className={`p-3 bg-gray-50 rounded-xl ${hasSubPrices ? 'cursor-pointer hover:bg-gray-100 transition-colors' : ''}`}
                        onClick={() => hasSubPrices && setExpandedServices(prev => ({ ...prev, [i]: !prev[i] }))}
                        data-testid={`service-card-${i}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-[#33404f] text-sm">{formatServiceName(s.service_type)}</span>
                            {s.description && <p className="text-xs text-gray-500 mt-0.5">{s.description}</p>}
                            <span className="text-[#33404f] font-bold text-lg block mt-1">Desde ${s.price_from?.toLocaleString('es-CL')}</span>
                          </div>
                          {hasSubPrices && (
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <span>{s.sub_prices.length} detalle{s.sub_prices.length > 1 ? 's' : ''}</span>
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </div>
                          )}
                        </div>
                      </div>
                      {hasSubPrices && isExpanded && (
                        <div className="ml-4 mt-1 space-y-1 border-l-2 border-[#00e7ff]/30 pl-3" data-testid={`sub-prices-${i}`}>
                          {s.sub_prices.map((sp, j) => (
                            <div key={j} className="flex items-center justify-between py-1.5 px-2 bg-white rounded-lg text-sm" data-testid={`sub-price-${i}-${j}`}>
                              <span className="text-gray-600">{sp.name}</span>
                              <span className="font-bold text-[#33404f]">${(sp.price || 0).toLocaleString('es-CL')}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Contacto */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-lg mb-4">Contacto<EditBtn section="contact" /></h3>

              {/* Connected: Full contact visible */}
              {provider.viewer_is_connected ? (
                <div className="space-y-3" data-testid="contact-info-connected">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-center mb-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
                    <p className="text-sm font-medium text-green-700">Conectados</p>
                    <p className="text-xs text-green-600">Ya puedes chatear y coordinar</p>
                  </div>

                  <Link to="/chat" className="block">
                    <Button className="w-full bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f] py-5 text-base" data-testid="go-to-chat-btn">
                      <MessageSquare className="w-5 h-5 mr-2" /> Ir al Chat
                    </Button>
                  </Link>

                  <div className="pt-3 border-t space-y-3">
                    {provider.address && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-[#00e7ff] mt-0.5" />
                        <span className="text-sm text-gray-700">{provider.address}</span>
                      </div>
                    )}
                    {provider.phone && (['premium', 'premium_plus'].includes(provider.plan_type) || isAdmin) && (
                      <a href={`tel:${provider.phone}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <Phone className="w-5 h-5 text-[#00e7ff]" />
                        <span className="text-sm font-medium">{provider.phone}</span>
                      </a>
                    )}
                    {provider.phone && !['premium', 'premium_plus'].includes(provider.plan_type) && !isAdmin && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl opacity-60">
                        <Lock className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-400">Telefono disponible solo para premium</span>
                      </div>
                    )}
                    {provider.whatsapp && (['premium', 'premium_plus'].includes(provider.plan_type) || isAdmin) && (
                      <a href={`https://wa.me/${provider.whatsapp}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                        <MessageSquare className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-700">WhatsApp</span>
                      </a>
                    )}
                    {provider.whatsapp && !['premium', 'premium_plus'].includes(provider.plan_type) && !isAdmin && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl opacity-60">
                        <Lock className="w-5 h-5 text-gray-400" />
                        <span className="text-sm text-gray-400">WhatsApp disponible solo para premium</span>
                      </div>
                    )}
                  </div>
                </div>

              ) : provider.viewer_has_pending_request ? (
                /* Pending request */
                <div className="text-center space-y-3" data-testid="contact-pending">
                  <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
                  </div>
                  <p className="text-sm font-medium text-yellow-700">Solicitud enviada</p>
                  <p className="text-xs text-gray-500">
                    Esperando que el servicio acepte tu solicitud de contacto. Te notificaremos cuando responda.
                  </p>
                </div>

              ) : user ? (
                /* Cliente logueado: puede enviar solicitud de contacto */
                <div className="space-y-3" data-testid="contact-request-form">
                  <p className="text-sm text-gray-600 mb-2">
                    Envía una solicitud de contacto. Cuando el servicio acepte, se desbloqueará el chat.
                  </p>
                  <textarea
                    value={contactMessage}
                    onChange={e => setContactMessage(e.target.value)}
                    placeholder="Hola, me gustaría contactarte para un servicio..."
                    className="w-full border-2 border-gray-200 rounded-xl p-4 text-base min-h-[100px] focus:outline-none focus:ring-2 focus:ring-[#00e7ff]"
                    data-testid="contact-message-input"
                  />
                  <Button
                    onClick={async () => {
                      setSendingContactRequest(true);
                      try {
                        await api.post('/contact-requests', {
                          provider_user_id: provider.user_id,
                          message: contactMessage || 'Hola, me gustaría contactarte para un servicio.'
                        });
                        toast.success('¡Solicitud enviada! Te notificaremos cuando responda.');
                        loadProvider();
                      } catch (e) {
                        toast.error(e.response?.data?.detail || 'Error al enviar solicitud');
                      } finally {
                        setSendingContactRequest(false);
                      }
                    }}
                    disabled={sendingContactRequest}
                    className="w-full bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f] py-5 text-lg font-bold"
                    data-testid="send-contact-request-btn"
                  >
                    {sendingContactRequest ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-5 h-5 mr-2" />}
                    Solicitar Contacto
                  </Button>
                </div>

              ) : (
                /* No logueado: mostrar botón de login */
                <div className="space-y-4" data-testid="contact-login-required">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Lock className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-base text-gray-600 mb-4">
                      Inicia sesión para contactar a este servicio
                    </p>
                    <Link to="/login">
                      <Button className="w-full bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f] py-4 text-lg font-bold">
                        Iniciar Sesión
                      </Button>
                    </Link>
                    <p className="text-sm text-gray-500 mt-3">
                      ¿No tienes cuenta? <Link to="/register" className="text-[#00e7ff] hover:underline font-semibold">Regístrate gratis</Link>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Location Map */}
            {(provider.latitude || provider.address || provider.comuna) && (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden" data-testid="provider-map">
                <div className="p-4 border-b">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#00e7ff]" /> Ubicación
                  </h3>
                </div>
                <SafeMap latitude={provider.latitude} longitude={provider.longitude} address={provider.address} comuna={provider.comuna} />
              </div>
            )}

            {/* CTA para dueños */}
            <div className="bg-[#33404f] rounded-2xl p-6 text-center" data-testid="owner-cta">
              <h3 className="font-bold text-white text-lg mb-2">¿Eres dueño de esta residencia?</h3>
              <p className="text-white/70 text-sm mb-4">
                Si administras este servicio y deseas completar o actualizar la información de tu perfil, contáctanos y te ayudamos.
              </p>
              <a
                href="mailto:hola@senioradvisor.cl?subject=Quiero administrar mi residencia en SeniorAdvisor"
                className="inline-block w-full py-3 bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f] font-bold rounded-xl transition-colors text-center"
                data-testid="owner-cta-btn"
              >
                Contáctanos
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <BookingForm 
          provider={provider} 
          onClose={() => setShowBookingForm(false)}
          onSuccess={() => {
            setShowBookingForm(false);
            toast.success('Reserva enviada correctamente');
          }}
        />
      )}
    </div>
  );
}
