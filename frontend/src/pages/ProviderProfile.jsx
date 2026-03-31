import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Shield, MapPin, Phone, MessageSquare, Heart, Lock, Camera, X, CalendarPlus, Crown, Home, Clock, UserCircle, Send, CheckCircle, Loader2, Instagram, Facebook, Globe, Pencil, Settings, Video, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api, { API_BASE } from '@/lib/api';
import BookingForm from '@/components/BookingForm';
import AmenitiesDisplay from '@/components/AmenitiesDisplay';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';

const GOOGLE_LIBS = ['places'];

// Map component with real Google Maps
const SafeMap = ({ lat, lng }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_KEY || '',
    libraries: GOOGLE_LIBS,
  });

  if (loadError || !isLoaded) {
    return (
      <a 
        href={`https://www.google.com/maps?q=${lat},${lng}`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block h-[250px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-gray-600 hover:from-[#00e7ff]/10 hover:to-[#00e7ff]/5 transition-all group"
        data-testid="map-fallback-link"
      >
        <div className="text-center">
          <MapPin className="w-8 h-8 mx-auto mb-2 text-[#00e7ff] group-hover:scale-110 transition-transform" />
          <p className="font-medium">Ver en Google Maps</p>
          <p className="text-xs text-gray-400 mt-1">{lat.toFixed(4)}, {lng.toFixed(4)}</p>
        </div>
      </a>
    );
  }

  return (
    <div className="h-[250px] rounded-xl overflow-hidden" data-testid="google-map-container">
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={{ lat, lng }}
        zoom={15}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
        }}
      >
        <Marker position={{ lat, lng }} />
      </GoogleMap>
    </div>
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

  // Inline editing state
  const [editingSection, setEditingSection] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

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

  const navigate = useNavigate();

  // Start editing a section
  const startEditing = (section) => {
    const formData = {};
    if (section === 'name') {
      formData.business_name = provider.business_name || '';
      formData.address = provider.address || '';
      formData.comuna = provider.comuna || '';
      formData.region = provider.region || '';
      formData.description = provider.description || '';
    } else if (section === 'social') {
      formData.instagram = provider.social_links?.instagram || '';
      formData.facebook = provider.social_links?.facebook || '';
      formData.website = provider.social_links?.website || '';
    } else if (section === 'price') {
      formData.services = provider.services?.map(s => ({...s})) || [];
    } else if (section === 'contact') {
      formData.phone = provider.phone || '';
      formData.whatsapp = provider.whatsapp || '';
    } else if (section === 'info') {
      formData.housing_type = provider.personal_info?.housing_type || '';
      formData.daily_availability = provider.personal_info?.daily_availability || '';
      formData.bio = provider.personal_info?.bio || provider.personal_info?.additional_info || '';
    } else if (section === 'featured') {
      formData.is_featured = provider.is_featured || false;
      formData.verified = provider.verified || false;
      formData.place_id = provider.place_id || '';
    }
    setEditForm(formData);
    setEditingSection(section);
  };

  const cancelEditing = () => {
    setEditingSection(null);
    setEditForm({});
  };

  const saveSection = async (section) => {
    setSaving(true);
    try {
      const isAdmin = user?.role === 'admin';
      if (section === 'name') {
        if (isAdmin) {
          await api.put(`/admin/providers/${provider.provider_id}/profile`, editForm);
        } else {
          await api.put('/providers/my-profile', editForm);
        }
      } else if (section === 'social') {
        if (isAdmin) {
          await api.put(`/admin/providers/${provider.provider_id}/profile`, { social_links: editForm });
        } else {
          await api.put('/providers/my-profile/social', editForm);
        }
      } else if (section === 'price') {
        if (isAdmin) {
          await api.put(`/admin/providers/${provider.provider_id}/profile`, { services: editForm.services });
        } else {
          await api.put('/providers/my-profile/services', { services: editForm.services });
        }
      } else if (section === 'contact') {
        if (isAdmin) {
          await api.put(`/admin/providers/${provider.provider_id}/profile`, editForm);
        } else {
          await api.put('/providers/my-profile', editForm);
        }
      } else if (section === 'info') {
        if (isAdmin) {
          await api.put(`/admin/providers/${provider.provider_id}/profile`, { personal_info: editForm });
        } else {
          await api.put('/providers/my-profile/personal-info', editForm);
        }
      } else if (section === 'featured') {
        // Admin-only: update verified, place_id via admin endpoints
        if (editForm.verified !== provider.verified) {
          if (editForm.verified) {
            await api.post(`/admin/providers/${provider.provider_id}/verify`);
          } else {
            await api.post(`/admin/providers/${provider.provider_id}/unverify`);
          }
        }
        if (editForm.place_id !== (provider.place_id || '')) {
          await api.put(`/admin/providers/${provider.provider_id}/profile`, { place_id: editForm.place_id });
        }
      }
      toast.success('Cambios guardados');
      setEditingSection(null);
      setEditForm({});
      loadProvider();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-16 h-16 border-4 border-[#00e7ff] border-t-transparent rounded-full" /></div>;
  if (!provider) return <div className="min-h-screen flex items-center justify-center text-gray-500">Cuidador no encontrado</div>;

  const allPhotos = provider.gallery?.length > 0 ? provider.gallery : [];
  const sliderPhotos = provider.slider_photos?.length > 0 ? provider.slider_photos : [];
  const remainingSlider = sliderPhotos.length > 5 ? sliderPhotos.length - 5 : 0;
  const isAdmin = user?.role === 'admin';
  const isOwner = user?.user_id === provider?.user_id;
  const canEdit = isAdmin || isOwner;
  const editUrl = isAdmin ? '/admin' : '/provider/account';
  const hasAmenities = provider.amenities?.length > 0;
  const hasServices = provider.services?.filter(s => s.price_from > 0 || s.description).length > 0;

  // Small reusable edit button - opens inline edit
  const EditBtn = ({ label = 'Editar', section, onClick, testId }) => (
    <button
      onClick={onClick || (() => startEditing(section))}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#33404f] text-white text-xs font-bold rounded-full hover:bg-[#2a3540] transition-colors"
      data-testid={testId || 'edit-btn'}
    >
      <Pencil className="w-3 h-3" /> {label}
    </button>
  );

  // Save/Cancel buttons for inline editing
  const EditActions = ({ section }) => (
    <div className="flex gap-2 mt-3">
      <button onClick={() => saveSection(section)} disabled={saving}
        className="px-4 py-1.5 bg-[#00e7ff] text-[#33404f] text-sm font-bold rounded-full hover:bg-[#00d4ea] disabled:opacity-50 transition-colors"
        data-testid={`save-${section}-btn`}>
        {saving ? 'Guardando...' : 'Guardar'}
      </button>
      <button onClick={cancelEditing}
        className="px-4 py-1.5 bg-gray-200 text-gray-700 text-sm font-medium rounded-full hover:bg-gray-300 transition-colors"
        data-testid={`cancel-${section}-btn`}>
        Cancelar
      </button>
    </div>
  );

  // Inline input helper
  const InlineInput = ({ label, field, type = 'text', placeholder }) => (
    <div>
      <label className="text-xs text-gray-500 font-medium block mb-1">{label}</label>
      <input type={type} value={editForm[field] || ''} placeholder={placeholder}
        onChange={e => setEditForm(prev => ({...prev, [field]: e.target.value}))}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00e7ff] focus:border-transparent"
        data-testid={`edit-input-${field}`} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50" data-testid="provider-profile">
      {/* Admin/Owner Bar */}
      {canEdit && (
        <div className="bg-[#33404f] text-white px-4 py-2.5 flex items-center justify-between" data-testid="admin-bar">
          <div className="flex items-center gap-2 text-sm">
            <Settings className="w-4 h-4" />
            <span className="font-bold">{isAdmin ? 'Modo Admin' : 'Tu Perfil'}</span>
            <span className="text-white/70">- Haz clic en los botones "Editar" de cada sección</span>
          </div>
          {isAdmin && (
            <button
              onClick={() => startEditing('featured')}
              className="px-4 py-1.5 border border-white/40 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors"
              data-testid="admin-featured-btn"
            >
              Premium / Suscripción / Place ID
            </button>
          )}
        </div>
      )}

      {/* Inline edit for Premium / Suscripción / Place ID */}
      {editingSection === 'featured' && (
        <div className="bg-[#2a3540] px-4 py-4" data-testid="edit-featured-form">
          <div className="max-w-6xl mx-auto grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-white/70 font-medium block mb-1">Premium (Destacado)</label>
              <select value={editForm.is_featured ? 'true' : 'false'}
                onChange={e => setEditForm(prev => ({...prev, is_featured: e.target.value === 'true'}))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00e7ff]">
                <option value="false" className="text-black">No</option>
                <option value="true" className="text-black">Sí</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-white/70 font-medium block mb-1">Verificado</label>
              <select value={editForm.verified ? 'true' : 'false'}
                onChange={e => setEditForm(prev => ({...prev, verified: e.target.value === 'true'}))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00e7ff]">
                <option value="false" className="text-black">No</option>
                <option value="true" className="text-black">Sí</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-white/70 font-medium block mb-1">Place ID (Google)</label>
              <input type="text" value={editForm.place_id || ''} placeholder="ChIJ..."
                onChange={e => setEditForm(prev => ({...prev, place_id: e.target.value}))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#00e7ff]"
                data-testid="edit-input-place-id" />
            </div>
          </div>
          <div className="max-w-6xl mx-auto flex gap-2 mt-3">
            <button onClick={() => saveSection('featured')} disabled={saving}
              className="px-4 py-1.5 bg-[#00e7ff] text-[#33404f] text-sm font-bold rounded-full hover:bg-[#00d4ea] disabled:opacity-50"
              data-testid="save-featured-btn">
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button onClick={cancelEditing}
              className="px-4 py-1.5 bg-white/20 text-white text-sm font-medium rounded-full hover:bg-white/30"
              data-testid="cancel-featured-btn">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Hero Section - Always Cyan for ALL users */}
      <div className="bg-[#00e7ff]" data-testid="hero-section">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center gap-5">
            <div className="w-24 h-24 rounded-2xl bg-white shadow-lg flex items-center justify-center overflow-hidden border-2 border-white shrink-0">
              {provider.profile_photo ? (
                <img src={getPhotoUrl(provider.profile_photo)} alt="" className="w-full h-full object-cover" />
              ) : allPhotos[0]?.url ? (
                <img src={getPhotoUrl(allPhotos[0].url)} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-[#00e7ff]">{provider.business_name?.[0]}</span>
              )}
            </div>
            <div>
              {(provider.google_rating > 0 || provider.rating > 0 || provider.total_reviews > 0) && (() => {
                const ratings = [];
                const counts = [];
                if (provider.google_rating > 0) { ratings.push(provider.google_rating); counts.push(provider.google_total_reviews || 0); }
                if (provider.rating > 0) { ratings.push(provider.rating); counts.push(provider.total_reviews || 0); }
                const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
                const totalReviews = counts.reduce((a, b) => a + b, 0);
                return (
                  <div className="flex items-center gap-1 mb-1" data-testid="provider-rating">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`w-5 h-5 ${s <= Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                    <span className="text-sm font-bold text-[#33404f] ml-1">{avgRating.toFixed(1)}</span>
                    <span className="text-xs text-[#33404f]/70">({totalReviews} reseñas)</span>
                  </div>
                );
              })()}
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-[#33404f]" data-testid="provider-name">{provider.business_name}</h1>
                {provider.is_featured && (
                  <span className="bg-yellow-400 text-[#33404f] text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Crown className="w-3 h-3" /> Premium
                  </span>
                )}
                {canEdit && <EditBtn label="Editar" section="name" testId="edit-provider-name-btn" />}
              </div>
              <p className="text-sm text-[#33404f]/80 mt-1">{provider.address || provider.comuna}</p>
              {provider.comuna && <p className="text-sm font-bold text-[#33404f]">{provider.comuna}</p>}
            </div>
          </div>
          {/* Inline edit form for name section */}
          {editingSection === 'name' && (
            <div className="mt-4 bg-white/90 rounded-xl p-4 space-y-3" data-testid="edit-name-form">
              <InlineInput label="Nombre" field="business_name" />
              <InlineInput label="Dirección" field="address" />
              <div className="grid grid-cols-2 gap-3">
                <InlineInput label="Comuna" field="comuna" />
                <InlineInput label="Región" field="region" />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium block mb-1">Descripción</label>
                <textarea value={editForm.description || ''} rows={3}
                  onChange={e => setEditForm(prev => ({...prev, description: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00e7ff] focus:border-transparent"
                  data-testid="edit-input-description" />
              </div>
              <EditActions section="name" />
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* PREMIUM Slider - Only for is_featured providers, uses slider_photos */}
            {provider.is_featured && sliderPhotos.length > 0 && (
              <div data-testid="premium-gallery">
                <div className="relative">
                  <div className="absolute top-3 left-3 z-10 bg-yellow-400 text-[#33404f] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg" data-testid="premium-badge">
                    <Crown className="w-3.5 h-3.5" /> Premium
                  </div>
                  {canEdit && (
                    <div className="absolute top-3 right-3 z-10">
                      <EditBtn label="Gestionar Slider" section="slider" testId="manage-slider-btn" />
                    </div>
                  )}
                  <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[400px] rounded-2xl overflow-hidden">
                    <div className="col-span-2 row-span-2 cursor-pointer hover:opacity-95 transition-opacity"
                      onClick={() => window.open(getPhotoUrl(sliderPhotos[0]?.url), '_blank')}>
                      <img src={getPhotoUrl(sliderPhotos[0]?.thumbnail_url || sliderPhotos[0]?.url)} alt="" className="w-full h-full object-cover" />
                    </div>
                    {sliderPhotos[1] && (
                      <div className="col-span-2 cursor-pointer hover:opacity-95 transition-opacity"
                        onClick={() => window.open(getPhotoUrl(sliderPhotos[1]?.url), '_blank')}>
                        <img src={getPhotoUrl(sliderPhotos[1]?.thumbnail_url || sliderPhotos[1]?.url)} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    {sliderPhotos[2] && (
                      <div className="cursor-pointer hover:opacity-95 transition-opacity"
                        onClick={() => window.open(getPhotoUrl(sliderPhotos[2]?.url), '_blank')}>
                        <img src={getPhotoUrl(sliderPhotos[2]?.thumbnail_url || sliderPhotos[2]?.url)} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    {sliderPhotos[3] ? (
                      <div className="relative cursor-pointer hover:opacity-95 transition-opacity"
                        onClick={() => window.open(getPhotoUrl(sliderPhotos[3]?.url), '_blank')}>
                        <img src={getPhotoUrl(sliderPhotos[3]?.thumbnail_url || sliderPhotos[3]?.url)} alt="" className="w-full h-full object-cover" />
                        {remainingSlider > 0 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-xl">
                            +{remainingSlider} fotos
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-gray-200 rounded" />
                    )}
                  </div>
                </div>
                {sliderPhotos.length > 4 && (
                  <div className="flex gap-2 mt-2">
                    {sliderPhotos.slice(4, 9).map((photo, i) => (
                      <div key={i} className="relative w-24 h-20 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(getPhotoUrl(photo.url), '_blank')}>
                        <img src={getPhotoUrl(photo.thumbnail_url || photo.url)} alt="" className="w-full h-full object-cover" />
                        {i === 4 && sliderPhotos.length > 9 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-sm">
                            +{sliderPhotos.length - 9} fotos
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Premium Slider placeholder - canEdit + premium + no slider photos */}
            {canEdit && provider.is_featured && sliderPhotos.length === 0 && (
              <div className="space-y-2">
                <div className="flex justify-center">
                  <EditBtn label="Gestionar Slider" section="slider" testId="manage-slider-btn" />
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center" data-testid="slider-placeholder">
                  <p className="text-gray-400">Sin fotos en slider premium</p>
                </div>
              </div>
            )}

            {/* YouTube Video placeholder (premium edit mode only) */}
            {canEdit && provider.is_featured && (
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center" data-testid="video-placeholder">
                <p className="text-gray-400 mb-3">Sin video YouTube</p>
                <EditBtn label="Agregar Video" testId="add-video-btn" />
              </div>
            )}

            {/* Services / Amenidades */}
            {canEdit && !hasAmenities ? (
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center flex items-center justify-between" data-testid="services-placeholder">
                <div className="flex items-center gap-2">
                  <p className="text-gray-400">Sin servicios/amenidades</p>
                </div>
                <div className="flex items-center gap-2">
                  <EditBtn label="Editar" testId="edit-services-btn" />
                  <EditBtn label="Agregar Servicios" testId="add-services-btn" />
                </div>
              </div>
            ) : (
              <div className="relative">
                {canEdit && (
                  <div className="absolute top-4 right-4 z-10 flex gap-2">
                    <EditBtn label="Editar" testId="edit-amenities-btn" />
                  </div>
                )}
                <AmenitiesDisplay amenities={provider.amenities} />
              </div>
            )}

            {/* Description - Sobre mi */}
            {provider.description && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-3">Sobre mi</h2>
                <p className="text-gray-700 leading-relaxed">{provider.description}</p>
              </div>
            )}

            {/* Standard Gallery - shows gallery photos for ALL providers (max 3) */}
            {(allPhotos.length > 0 || canEdit) && (
              <div className="bg-white rounded-2xl p-6 shadow-sm" data-testid="gallery-section">
                <div className="flex items-center gap-3 mb-4">
                  <Camera className="w-5 h-5 text-[#00e7ff]" />
                  <h2 className="text-xl font-bold">Galería</h2>
                  {canEdit && <EditBtn label="Gestionar Fotos" section="gallery" testId="manage-photos-btn" />}
                  {canEdit && <span className="text-xs text-gray-400">({allPhotos.length}/3)</span>}
                </div>
                {allPhotos.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3">
                    {allPhotos.map((photo, i) => (
                      <div key={i} className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(getPhotoUrl(photo.url), '_blank')}>
                        <img src={getPhotoUrl(photo.thumbnail_url || photo.url)} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-4">Sin fotos en la galería</p>
                )}
              </div>
            )}

            {/* Personal Info (Más Información) */}
            {(canEdit || (provider.personal_info && Object.values(provider.personal_info).some(v => v && v !== '' && v !== false && !(Array.isArray(v) && v.length === 0)))) && (
              <div className="bg-white rounded-2xl p-6 shadow-sm" data-testid="provider-personal-info">
                <div className="flex items-center gap-2 mb-4">
                  <UserCircle className="w-5 h-5 text-[#00e7ff]" />
                  <h2 className="text-xl font-bold">Más Información</h2>
                  {canEdit && <EditBtn label="Editar" section="info" testId="edit-info-btn" />}
                </div>
                {editingSection === 'info' ? (
                  <div className="space-y-3" data-testid="edit-info-form">
                    <div>
                      <label className="text-xs text-gray-500 font-medium block mb-1">Tipo de instalación</label>
                      <select value={editForm.housing_type || ''} onChange={e => setEditForm(prev => ({...prev, housing_type: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00e7ff]">
                        <option value="">Seleccionar...</option>
                        <option value="residencia">Residencia</option>
                        <option value="hogar">Hogar</option>
                        <option value="centro diurno">Centro Diurno</option>
                        <option value="departamento">Departamento</option>
                        <option value="casa">Casa</option>
                      </select>
                    </div>
                    <InlineInput label="Horario de atención" field="daily_availability" placeholder="Ej: Lunes a Viernes 9:00 - 18:00" />
                    <div>
                      <label className="text-xs text-gray-500 font-medium block mb-1">Descripción adicional</label>
                      <textarea value={editForm.bio || ''} rows={3}
                        onChange={e => setEditForm(prev => ({...prev, bio: e.target.value}))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00e7ff]" />
                    </div>
                    <EditActions section="info" />
                  </div>
                ) : (
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
                    {canEdit && !provider.personal_info?.housing_type && !provider.personal_info?.daily_availability && !provider.personal_info?.bio && (
                      <p className="text-gray-400 text-sm col-span-2 text-center py-2">Sin información adicional</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Service Zones */}
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
                        <span key={comuna} className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full text-sm">{comuna}</span>
                      ))}
                    </div>
                  </div>
                )}
                {provider.walking_zones?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Zonas de cobertura:</h3>
                    <div className="flex flex-wrap gap-2">
                      {provider.walking_zones.map(zone => (
                        <span key={zone} className="px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm">{zone}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Google Reviews - shown as "Reseñas" */}
            {provider.google_reviews?.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm" data-testid="google-reviews-section">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    Reseñas
                  </h2>
                  {provider.google_rating > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className={`w-4 h-4 ${s <= Math.round(provider.google_rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                      </div>
                      <span className="font-bold text-[#33404f]">{provider.google_rating?.toFixed(1)}</span>
                      <span className="text-sm text-gray-500">({provider.google_total_reviews || 0})</span>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {provider.google_reviews.map((r, i) => (
                    <div key={i} className="border-b last:border-0 pb-4 last:pb-0" data-testid={`google-review-${i}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                          {r.profile_photo_url ? (
                            <img src={r.profile_photo_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <span className="text-sm font-bold">{r.author_name?.[0]}</span>
                          )}
                        </div>
                        <span className="font-medium text-sm">{r.author_name}</span>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                          ))}
                        </div>
                        <span className="text-xs text-gray-400 ml-auto">{r.relative_time_description}</span>
                      </div>
                      {r.text && <p className="text-sm text-gray-700 leading-relaxed">{r.text}</p>}
                    </div>
                  ))}
                </div>
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
              {provider.reviews?.length > 0 ? (
                <div className="space-y-4">
                  {provider.reviews.map((r, i) => (
                    <div key={i} className="border-b last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                          {r.user_picture ? <img src={r.user_picture} alt="" className="w-full h-full object-cover" /> : <span className="text-sm font-bold">{r.user_name?.[0]}</span>}
                        </div>
                        <span className="font-medium text-sm">{r.user_name}</span>
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= (r.rating || r.overall_rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />)}
                        </div>
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
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Redes Sociales / Website */}
            {(canEdit || (provider.social_links && (provider.social_links.instagram || provider.social_links.facebook || provider.social_links.website))) && (
              <div className="bg-white rounded-2xl p-5 shadow-sm" data-testid="provider-social-links">
                {canEdit && (
                  <div className="flex justify-end mb-3">
                    <EditBtn label="Editar" section="social" testId="edit-social-btn" />
                  </div>
                )}
                {editingSection === 'social' ? (
                  <div className="space-y-3" data-testid="edit-social-form">
                    <InlineInput label="Instagram URL" field="instagram" placeholder="https://instagram.com/..." />
                    <InlineInput label="Facebook URL" field="facebook" placeholder="https://facebook.com/..." />
                    <InlineInput label="Sitio Web" field="website" placeholder="https://..." />
                    <EditActions section="social" />
                  </div>
                ) : (
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
                    {provider.social_links?.website ? (
                      <a href={provider.social_links.website} target="_blank" rel="noopener noreferrer"
                         className="group w-11 h-11 rounded-full bg-[#33404f] flex items-center justify-center hover:bg-[#33404f] transition-colors"
                         data-testid="social-website">
                        <Globe className="w-5 h-5 text-white group-hover:text-[#00e7ff] transition-colors" />
                      </a>
                    ) : canEdit ? (
                      <div className="w-11 h-11 rounded-full bg-[#33404f] flex items-center justify-center">
                        <Globe className="w-5 h-5 text-white" />
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            )}

            {/* Precio */}
            {(hasServices || canEdit) && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg">Precio</h3>
                  {canEdit && <EditBtn label="Editar" section="price" testId="edit-price-btn" />}
                </div>
                {editingSection === 'price' ? (
                  <div className="space-y-3" data-testid="edit-price-form">
                    {(editForm.services || []).map((s, i) => (
                      <div key={i} className="p-3 bg-gray-50 rounded-xl space-y-2">
                        <select value={s.service_type || ''} onChange={e => {
                          const services = [...editForm.services];
                          services[i] = {...services[i], service_type: e.target.value};
                          setEditForm(prev => ({...prev, services}));
                        }} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                          <option value="residencias">Residencias</option>
                          <option value="cuidado-domicilio">Cuidado a Domicilio</option>
                          <option value="salud-mental">Salud Mental</option>
                        </select>
                        <input type="text" value={s.description || ''} placeholder="Descripción"
                          onChange={e => {
                            const services = [...editForm.services];
                            services[i] = {...services[i], description: e.target.value};
                            setEditForm(prev => ({...prev, services}));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        <input type="number" value={s.price_from || ''} placeholder="Precio desde"
                          onChange={e => {
                            const services = [...editForm.services];
                            services[i] = {...services[i], price_from: parseInt(e.target.value) || 0};
                            setEditForm(prev => ({...prev, services}));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        <button onClick={() => {
                          const services = editForm.services.filter((_, j) => j !== i);
                          setEditForm(prev => ({...prev, services}));
                        }} className="text-red-500 text-xs font-medium">Eliminar</button>
                      </div>
                    ))}
                    <button onClick={() => {
                      const services = [...(editForm.services || []), {service_type: 'residencias', price_from: 0, description: ''}];
                      setEditForm(prev => ({...prev, services}));
                    }} className="text-[#00e7ff] text-sm font-bold">+ Agregar servicio</button>
                    <EditActions section="price" />
                  </div>
                ) : (
                  <>
                    {provider.services?.filter(s => s.price_from > 0 || s.description).map((s, i) => {
                      const formatServiceName = (type) => {
                        const names = { 'residencias': 'Residencias', 'cuidado-domicilio': 'Cuidado a Domicilio', 'salud-mental': 'Salud Mental' };
                        return names[type] || type;
                      };
                      return (
                        <div key={i} className="p-3 bg-gray-50 rounded-xl mb-3 last:mb-0">
                          <span className="font-semibold text-[#33404f] text-sm">{formatServiceName(s.service_type)}</span>
                          {s.description && <p className="text-xs text-gray-500 mt-0.5">{s.description}</p>}
                          <span className="text-[#33404f] font-bold text-lg block mt-1">Desde ${s.price_from?.toLocaleString('es-CL')}</span>
                        </div>
                      );
                    })}
                    {canEdit && !hasServices && (
                      <p className="text-gray-400 text-sm text-center py-2">Sin precios configurados</p>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Contacto */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Contacto</h3>
                {canEdit && <EditBtn label="Editar" section="contact" testId="edit-contact-btn" />}
              </div>
              {editingSection === 'contact' ? (
                <div className="space-y-3" data-testid="edit-contact-form">
                  <InlineInput label="Teléfono" field="phone" placeholder="+56 9 1234 5678" />
                  <InlineInput label="WhatsApp" field="whatsapp" placeholder="+56 9 1234 5678" />
                  <EditActions section="contact" />
                </div>
              ) : (
                <>

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
                    {provider.phone && (
                      <a href={`tel:${provider.phone}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <Phone className="w-5 h-5 text-[#00e7ff]" />
                        <span className="text-sm font-medium">{provider.phone}</span>
                      </a>
                    )}
                    {provider.whatsapp && (
                      <a href={`https://wa.me/${provider.whatsapp}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                        <MessageSquare className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-700">WhatsApp</span>
                      </a>
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
              </>
              )}
            </div>
            {provider.latitude && provider.longitude && (
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden" data-testid="provider-map">
                <div className="p-4 border-b">
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#00e7ff]" /> Ubicación
                  </h3>
                </div>
                <SafeMap lat={provider.latitude} lng={provider.longitude} />
              </div>
            )}

            {/* CTA para dueños */}
            <div className="bg-[#33404f] rounded-2xl p-6 text-center" data-testid="owner-cta">
              <h3 className="font-bold text-white text-lg mb-2">¿Eres dueño de esta residencia?</h3>
              <p className="text-white/70 text-sm mb-4">
                Si administras este servicio y deseas completar o actualizar la información de tu perfil, contáctanos y te ayudamos.
              </p>
              <a
                href="mailto:contacto@senioradvisor.cl?subject=Quiero administrar mi residencia en SeniorAdvisor"
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
