import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, Shield, MapPin, Phone, MessageSquare, Heart, Lock, Camera, X, CalendarPlus, Crown, Home, Clock, UserCircle, Send, CheckCircle, Loader2, Instagram, Facebook, Globe } from 'lucide-react';
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

  const allPhotos = provider.gallery?.length > 0 ? provider.gallery : [];
  const remainingPhotos = allPhotos.length > 5 ? allPhotos.length - 5 : 0;

  return (
    <div className="min-h-screen bg-gray-50" data-testid="provider-profile">
      {/* Premium Gallery */}
      {allPhotos.length > 0 && (
        <div className="relative max-w-6xl mx-auto px-4 pt-6" data-testid="premium-gallery">
          {provider.is_featured && (
            <div className="absolute top-8 left-6 z-10 bg-yellow-400 text-[#33404f] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg" data-testid="premium-badge">
              <Crown className="w-3.5 h-3.5" /> Premium
            </div>
          )}
          <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[400px] rounded-2xl overflow-hidden">
            {/* Main large photo */}
            <div 
              className="col-span-2 row-span-2 cursor-pointer hover:opacity-95 transition-opacity relative"
              onClick={() => window.open(getPhotoUrl(allPhotos[0]?.url), '_blank')}
            >
              <img src={getPhotoUrl(allPhotos[0]?.thumbnail_url || allPhotos[0]?.url)} alt="" className="w-full h-full object-cover" />
            </div>
            {/* Top right photo */}
            {allPhotos[1] && (
              <div className="col-span-2 cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => window.open(getPhotoUrl(allPhotos[1]?.url), '_blank')}>
                <img src={getPhotoUrl(allPhotos[1]?.thumbnail_url || allPhotos[1]?.url)} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            {/* Bottom right - 2 small photos */}
            {allPhotos[2] && (
              <div className="cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => window.open(getPhotoUrl(allPhotos[2]?.url), '_blank')}>
                <img src={getPhotoUrl(allPhotos[2]?.thumbnail_url || allPhotos[2]?.url)} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            {allPhotos[3] ? (
              <div className="relative cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => window.open(getPhotoUrl(allPhotos[3]?.url), '_blank')}>
                <img src={getPhotoUrl(allPhotos[3]?.thumbnail_url || allPhotos[3]?.url)} alt="" className="w-full h-full object-cover" />
                {remainingPhotos > 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-xl">
                    +{remainingPhotos} fotos
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-200" />
            )}
          </div>
        </div>
      )}

      {/* Provider Info Header */}
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-2">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-white shadow-md flex items-center justify-center overflow-hidden border-2 border-gray-100">
            {provider.profile_photo ? (
              <img src={getPhotoUrl(provider.profile_photo)} alt="" className="w-full h-full object-cover" />
            ) : allPhotos[0]?.url ? (
              <img src={getPhotoUrl(allPhotos[0].url)} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-[#00e7ff]">{provider.business_name?.[0]}</span>
            )}
          </div>
          <div>
            {/* Rating above name */}
            <div className="flex items-center gap-1 mb-0.5" data-testid="provider-rating">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className={`w-4 h-4 ${s <= Math.round(provider.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
              ))}
              <span className="text-sm font-bold text-[#33404f] ml-1">{provider.rating?.toFixed(1) || '0.0'}</span>
              <span className="text-xs text-gray-500">({provider.total_reviews || 0} reseñas)</span>
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-[#33404f]" data-testid="provider-name">{provider.business_name}</h1>
              {provider.verified && <Shield className="w-5 h-5 text-yellow-400" />}
              {provider.is_featured && (
                <span className="bg-yellow-400 text-[#33404f] text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Crown className="w-3 h-3" /> Premium
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">{provider.comuna}{provider.address ? ` · ${provider.address}` : ''}</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Description - Sobre mi */}
            {provider.description && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold mb-3">Sobre mi</h2>
                <p className="text-gray-700 leading-relaxed">{provider.description}</p>
              </div>
            )}

            {/* Amenidades / Servicios */}
            <AmenitiesDisplay amenities={provider.amenities} />

            {/* Personal Info (Más Datos) */}
            {provider.personal_info && Object.values(provider.personal_info).some(v => v && v !== '' && v !== false && !(Array.isArray(v) && v.length === 0)) && (
              <div className="bg-white rounded-2xl p-6 shadow-sm" data-testid="provider-personal-info">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <UserCircle className="w-5 h-5 text-[#00e7ff]" />
                  Más Información
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

            {/* Google Reviews */}
            {provider.google_reviews?.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm" data-testid="google-reviews-section">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Reseñas de Google
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
            {/* Redes Sociales */}
            {provider.social_links && (provider.social_links.instagram || provider.social_links.facebook || provider.social_links.website) && (
              <div className="bg-white rounded-2xl p-5 shadow-sm" data-testid="provider-social-links">
                <div className="flex items-center justify-center gap-5">
                  {provider.social_links.instagram && (
                    <a href={provider.social_links.instagram} target="_blank" rel="noopener noreferrer" 
                       className="group w-11 h-11 rounded-full bg-[#33404f] flex items-center justify-center hover:bg-[#33404f] transition-colors"
                       data-testid="social-instagram">
                      <Instagram className="w-5 h-5 text-white group-hover:text-[#00e7ff] transition-colors" />
                    </a>
                  )}
                  {provider.social_links.facebook && (
                    <a href={provider.social_links.facebook} target="_blank" rel="noopener noreferrer"
                       className="group w-11 h-11 rounded-full bg-[#33404f] flex items-center justify-center hover:bg-[#33404f] transition-colors"
                       data-testid="social-facebook">
                      <Facebook className="w-5 h-5 text-white group-hover:text-[#00e7ff] transition-colors" />
                    </a>
                  )}
                  {provider.social_links.website && (
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
            {provider.services?.filter(s => s.price_from > 0 || s.description).length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-lg mb-4">Precio</h3>
                {provider.services.filter(s => s.price_from > 0 || s.description).map((s, i) => {
                  const formatServiceName = (type) => {
                    const names = {
                      'residencias': 'Residencias',
                      'cuidado-domicilio': 'Cuidado a Domicilio',
                      'salud-mental': 'Salud Mental'
                    };
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
              </div>
            )}

            {/* Contacto */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
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
