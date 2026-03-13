import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Shield, MapPin, Phone, MessageSquare, Heart, Lock, Camera, X, Dog, CalendarPlus, Crown, Home, PawPrint, Briefcase, Clock, UserCircle, Send, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api, { API_BASE } from '@/lib/api';
import BookingForm from '@/components/BookingForm';
import SubscriptionCard from '@/components/SubscriptionCard';

// Mapa desactivado temporalmente
const SafeMap = ({ lat, lng }) => {
  return (
    <div className="h-[250px] bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 text-base">
      <div className="text-center">
        <MapPin className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p>Ubicación disponible</p>
      </div>
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

const PET_SIZE_LABELS = { pequeno: 'Pequeno', mediano: 'Mediano', grande: 'Grande' };
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

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-16 h-16 border-4 border-[#00e7ff] border-t-transparent rounded-full" /></div>;
  if (!provider) return <div className="min-h-screen flex items-center justify-center text-gray-500">Cuidador no encontrado</div>;

  return (
    <div className="min-h-screen bg-gray-50" data-testid="provider-profile">
      {/* Hero */}
      <div className="relative h-64 bg-gradient-to-r from-[#00e7ff] to-[#00c4d4]">
        {provider.photos?.[0] && (
          <img src={provider.photos[0]} alt="" className="w-full h-full object-cover opacity-30" />
        )}
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-5xl mx-auto w-full px-4 pb-8">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 rounded-2xl bg-white shadow-xl flex items-center justify-center overflow-hidden">
                {provider.profile_photo ? (
                  <img src={getPhotoUrl(provider.profile_photo)} alt="" className="w-full h-full object-cover" />
                ) : provider.photos?.[0] ? (
                  <img src={provider.photos[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-[#00e7ff]">{provider.business_name?.[0]}</span>
                )}
              </div>
              <div className="text-white pb-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-bold" data-testid="provider-name">{provider.business_name}</h1>
                  {provider.verified && <Shield className="w-6 h-6 text-yellow-300" />}
                  {provider.is_featured && (
                    <span className="bg-yellow-400/30 text-yellow-100 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Crown className="w-3 h-3" />Destacado
                    </span>
                  )}
                  {provider.full_name_hidden && (
                    <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Lock className="w-3 h-3" />Nombre parcial
                    </span>
                  )}
                </div>
                <p className="opacity-80">{provider.comuna}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Rating */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-5 h-5 ${s <= Math.round(provider.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-lg font-bold" data-testid="provider-rating">{provider.rating?.toFixed(1) || 'Sin rating'}</span>
                <span className="text-gray-500">({provider.total_reviews || 0} reseñas)</span>
              </div>
            </div>

            {/* Description */}
            {provider.description && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-3">Sobre mi</h2>
                <p className="text-gray-700 leading-relaxed">{provider.description}</p>
              </div>
            )}

            {/* Personal Info (Más Datos) */}
            {provider.personal_info && Object.values(provider.personal_info).some(v => v && v !== '' && v !== false && !(Array.isArray(v) && v.length === 0)) && (
              <div className="bg-white rounded-2xl p-6 shadow-sm" data-testid="provider-personal-info">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <UserCircle className="w-5 h-5 text-[#00e7ff]" />
                  Más Sobre el Cuidador
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {provider.personal_info.housing_type && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <Home className="w-5 h-5 text-[#00e7ff] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Vivienda</p>
                        <p className="text-sm text-gray-800 capitalize">{provider.personal_info.housing_type}</p>
                      </div>
                    </div>
                  )}
                  {provider.personal_info.has_yard && (
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
                      <MapPin className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Patio / Jardín</p>
                        <p className="text-sm text-gray-800">{provider.personal_info.yard_description || 'Sí, tiene patio'}</p>
                      </div>
                    </div>
                  )}
                  {provider.personal_info.has_own_pets && (
                    <div className="flex items-start gap-3 p-3 bg-cyan-50 rounded-xl">
                      <PawPrint className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Mascotas Propias</p>
                        <p className="text-sm text-gray-800">{provider.personal_info.own_pets_description || 'Sí, tiene mascotas'}</p>
                      </div>
                    </div>
                  )}
                  {provider.personal_info.daily_availability && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <Clock className="w-5 h-5 text-[#00e7ff] mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Disponibilidad</p>
                        <p className="text-sm text-gray-800">{provider.personal_info.daily_availability}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Yard Photos */}
                {provider.personal_info.yard_photos?.length > 0 && (
                  <div className="mt-4" data-testid="yard-photos-public">
                    <p className="text-xs text-gray-500 font-medium mb-2 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-green-600" /> Fotos del patio</p>
                    <div className="flex gap-2">
                      {provider.personal_info.yard_photos.map((photo, i) => (
                        <div key={photo.photo_id} className="w-28 h-28 rounded-xl overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(getPhotoUrl(photo.url), '_blank')}>
                          <img src={getPhotoUrl(photo.thumbnail_url || photo.url)} alt={`Patio ${i+1}`} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pets Photos */}
                {provider.personal_info.pets_photos?.length > 0 && (
                  <div className="mt-4" data-testid="pets-photos-public">
                    <p className="text-xs text-gray-500 font-medium mb-2 flex items-center gap-1"><PawPrint className="w-3.5 h-3.5 text-blue-600" /> Mascotas del cuidador</p>
                    <div className="flex gap-2">
                      {provider.personal_info.pets_photos.map((photo, i) => (
                        <div key={photo.photo_id} className="w-28 h-28 rounded-xl overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity" onClick={() => window.open(getPhotoUrl(photo.url), '_blank')}>
                          <img src={getPhotoUrl(photo.thumbnail_url || photo.url)} alt={`Mascota ${i+1}`} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {provider.personal_info.animal_experience && (
                  <div className="mt-4 p-3 bg-amber-50 rounded-xl">
                    <div className="flex items-start gap-3">
                      <Briefcase className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Experiencia con Animales</p>
                        <p className="text-sm text-gray-800">{provider.personal_info.animal_experience}</p>
                      </div>
                    </div>
                  </div>
                )}
                {provider.personal_info.additional_info && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 font-medium mb-1">Información Adicional</p>
                    <p className="text-sm text-gray-800">{provider.personal_info.additional_info}</p>
                  </div>
                )}
              </div>
            )}

            {/* Photo Gallery */}
            {provider.gallery?.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm" data-testid="provider-gallery-public">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-[#00e7ff]" />
                  Galería
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

            {/* Services */}
            {provider.services?.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-4">Servicios</h2>
                {provider.services.map((s, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl mb-3">
                    <div>
                      <span className="capitalize font-semibold text-[#33404f]">{s.service_type}</span>
                      {s.description && <p className="text-sm text-gray-500 mt-0.5">{s.description}</p>}
                      {s.pet_sizes?.length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <Dog className="w-4 h-4 text-gray-400" />
                          {s.pet_sizes.map((size, j) => (
                            <span key={j} className="px-2 py-0.5 bg-white border border-gray-200 text-gray-600 text-xs rounded-full capitalize">
                              {PET_SIZE_LABELS[size] || size}
                            </span>
                          ))}
                        </div>
                      )}
                      {s.rules && <p className="text-xs text-gray-400 mt-1">{s.rules}</p>}
                    </div>
                    <div className="text-right">
                      <span className="text-[#00e7ff] font-bold text-lg">Desde ${s.price_from?.toLocaleString('es-CL')}</span>
                      {s.availability && <p className="text-xs text-gray-400">{s.availability}</p>}
                    </div>
                  </div>
                ))}
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
                    <h3 className="text-sm font-medium text-gray-600 mb-2">Zonas de paseo favoritas:</h3>
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
              {user && (
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
                          {[1,2,3,4,5].map(s => <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />)}
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

          {/* Sidebar - Contact */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <h3 className="font-bold text-lg mb-4">Contacto</h3>

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
                    Esperando que el cuidador acepte tu solicitud de contacto. Te notificaremos cuando responda.
                  </p>
                </div>

              ) : provider.viewer_has_subscription ? (
                /* Premium client: can send contact request */
                <div className="space-y-3" data-testid="contact-request-form">
                  <p className="text-sm text-gray-600 mb-2">
                    Envía una solicitud de contacto. Si el cuidador acepta, se desbloqueará el chat.
                  </p>
                  <textarea
                    value={contactMessage}
                    onChange={e => setContactMessage(e.target.value)}
                    placeholder="Hola, me gustaria contactarte para un servicio..."
                    className="w-full border rounded-xl p-3 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-[#00e7ff]"
                    data-testid="contact-message-input"
                  />
                  <Button
                    onClick={async () => {
                      setSendingContactRequest(true);
                      try {
                        await api.post('/contact-requests', {
                          provider_user_id: provider.user_id,
                          message: contactMessage || 'Hola, me gustaria contactarte para un servicio.'
                        });
                        toast.success('Solicitud enviada! Te notificaremos cuando responda.');
                        loadProvider();
                      } catch (e) {
                        toast.error(e.response?.data?.detail || 'Error al enviar solicitud');
                      } finally {
                        setSendingContactRequest(false);
                      }
                    }}
                    disabled={sendingContactRequest}
                    className="w-full bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f] py-5 text-base"
                    data-testid="send-contact-request-btn"
                  >
                    {sendingContactRequest ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-5 h-5 mr-2" />}
                    Solicitar Contacto
                  </Button>
                </div>

              ) : (
                /* Free client or not logged in: show subscription prompt */
                <div className="space-y-4" data-testid="contact-blocked">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Lock className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 mb-2">
                      {user ? 'Con la suscripcion Premium puedes contactar cuidadores directamente' : 'Inicia sesion para contactar a este cuidador'}
                    </p>
                    {!user && (
                      <Link to="/login">
                        <Button className="w-full mb-3" variant="outline">Iniciar Sesion</Button>
                      </Link>
                    )}
                    {user && <p className="text-xs text-gray-400 mb-3">Tambien puedes publicar una solicitud gratuita y esperar ofertas de cuidadores</p>}
                  </div>
                  {user && <SubscriptionCard userType="client" hasSubscription={false} />}
                </div>
              )}
            </div>

            {/* Location Map */}
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
