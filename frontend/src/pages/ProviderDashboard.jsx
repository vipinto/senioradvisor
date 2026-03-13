import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Star, MessageSquare, Settings, Calendar as CalendarIcon, Shield, Eye, Phone, Users, ChevronDown, ChevronUp, CalendarCheck, Dog, Camera, MapPin, Lock, Clock, UserCircle, Home, PawPrint, Briefcase, X, ImagePlus, Inbox, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import { toast } from 'sonner';
import api from '@/lib/api';
import ProviderBookings from '@/components/ProviderBookings';
import CareRequestsProvider from '@/components/CareRequestsProvider';
import SubscriptionCard from '@/components/SubscriptionCard';
import ProviderGallery from '@/components/ProviderGallery';
import ServiceZones from '@/components/ServiceZones';

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alwaysActive, setAlwaysActive] = useState(true);
  const [availableDates, setAvailableDates] = useState([]);
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [sosConfig, setSosConfig] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [givenReviews, setGivenReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, punctuality: 5, pet_behavior: 5, communication: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [activeTab, setActiveTab] = useState('contact-requests');
  const [hasSubscription, setHasSubscription] = useState(false);
  const [contactRequests, setContactRequests] = useState([]);
  const [respondingTo, setRespondingTo] = useState(null);
  const [personalInfo, setPersonalInfo] = useState({
    housing_type: '', has_yard: false, yard_description: '',
    has_own_pets: false, own_pets_description: '',
    animal_experience: '', daily_availability: '', additional_info: '',
    yard_photos: [], pets_photos: []
  });
  const [savingPersonalInfo, setSavingPersonalInfo] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(null);
  const [profileForm, setProfileForm] = useState({
    business_name: '', description: '', phone: '', address: '', comuna: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [editingServices, setEditingServices] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [profileRes, subRes] = await Promise.all([
        api.get('/providers/my-profile'),
        api.get('/subscription/my').catch(() => ({ data: { has_subscription: false } }))
      ]);
      const p = profileRes.data;
      setProvider(p);
      setProfileForm({
        business_name: p.business_name || '',
        description: p.description || '',
        phone: p.phone || '',
        address: p.address || '',
        comuna: p.comuna || ''
      });
      setHasSubscription(subRes.data.has_subscription || subRes.data.status === 'active');
      setAlwaysActive(p.always_active !== false);
      setAvailableDates((p.available_dates || []).map(d => new Date(d)));
      try {
        const revRes = await api.get(`/providers/${p.provider_id}/reviews`);
        setReviews(revRes.data);
      } catch {}
      try {
        const sosRes = await api.get('/sos/info');
        setSosConfig(sosRes.data);
      } catch {}
      try {
        const [convRes, givenRes] = await Promise.all([
          api.get('/chat/conversations'),
          api.get('/reviews/provider/given')
        ]);
        setConversations(convRes.data);
        setGivenReviews(givenRes.data);
      } catch {}
      try {
        const piRes = await api.get('/providers/my-profile/personal-info');
        if (piRes.data && Object.keys(piRes.data).length > 0) {
          setPersonalInfo(prev => ({ ...prev, ...piRes.data }));
        }
      } catch {}
      try {
        const crRes = await api.get('/contact-requests/received');
        setContactRequests(crRes.data);
      } catch {}
    } catch {
      navigate('/provider/register');
    } finally {
      setLoading(false);
    }
  };

  const saveAvailability = async () => {
    setSavingAvailability(true);
    try {
      await api.put('/providers/my-profile', {
        always_active: alwaysActive,
        available_dates: alwaysActive ? [] : availableDates.map(d => d.toISOString())
      });
      toast.success('Disponibilidad actualizada');
    } catch (e) {
      toast.error('Error al actualizar');
    } finally {
      setSavingAvailability(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-16 h-16 border-4 border-[#00e7ff] border-t-transparent rounded-full" /></div>;

  if (!provider) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-gray-600 mb-6">No tienes perfil de cuidador.</p>
        <Link to="/provider/register"><Button className="bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f]">Crear Perfil</Button></Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50" data-testid="provider-dashboard">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Panel de Cuidador</h1>
          <div className="flex items-center gap-2">
            {provider.approved ? (
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Aprobado</span>
            ) : (
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">Pendiente</span>
            )}
            {provider.verified && <Shield className="w-5 h-5 text-[#00e7ff]" />}
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <p className="text-gray-500 text-sm">Rating</p>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="text-2xl font-bold" data-testid="provider-stat-rating">{provider.rating?.toFixed(1) || '0.0'}</span>
            </div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <p className="text-gray-500 text-sm">Reseñas</p>
            <span className="text-2xl font-bold" data-testid="provider-stat-reviews">{provider.total_reviews || 0}</span>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <p className="text-gray-500 text-sm">Servicios</p>
            <span className="text-2xl font-bold">{provider.services?.length || 0}</span>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <p className="text-gray-500 text-sm">Estado</p>
            <span className={`text-lg font-bold ${alwaysActive ? 'text-green-600' : 'text-orange-500'}`}>
              {alwaysActive ? 'Siempre activo' : `${availableDates.length} dias`}
            </span>
          </div>
        </div>

        {/* Profile Completeness Checklist */}
        {provider.profile_completeness && !provider.profile_completeness.is_complete && (
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-2xl p-6 mb-6" data-testid="profile-completeness-alert">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-[#33404f] mb-1">Completa tu perfil para aparecer en las búsquedas</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Tu perfil está al {provider.profile_completeness.percentage}% completo. 
                  Los clientes solo pueden ver cuidadores con perfiles completos.
                </p>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                  <div 
                    className="bg-gradient-to-r from-orange-500 to-green-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${provider.profile_completeness.percentage}%` }}
                  ></div>
                </div>

                {/* Checklist */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(provider.profile_completeness.sections).map(([key, section]) => (
                    <Link 
                      key={key} 
                      to={key === 'services' ? '/provider/dashboard' : '/provider/account'}
                      onClick={() => {
                        if (key === 'services') setActiveTab('services');
                      }}
                      className={`flex items-center gap-2 p-3 rounded-xl transition-colors ${
                        section.complete 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-white border border-orange-200 text-gray-700 hover:border-orange-400 hover:bg-orange-50'
                      }`}
                    >
                      {section.complete ? (
                        <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                      ) : (
                        <div className="w-5 h-5 border-2 border-orange-400 rounded-full shrink-0" />
                      )}
                      <span className="text-sm font-medium">{section.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Complete Badge */}
        {provider.profile_completeness?.is_complete && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3" data-testid="profile-complete-badge">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-medium text-green-800">¡Tu perfil está completo!</p>
              <p className="text-sm text-green-600">Los clientes pueden encontrarte en las búsquedas.</p>
            </div>
          </div>
        )}

        {/* Subscription Card */}
        <div className="mb-6">
          <SubscriptionCard userType="provider" hasSubscription={hasSubscription} />
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-2 mb-6 border-b overflow-x-auto">
          {[
            { key: 'contact-requests', label: 'Solicitudes Directas', icon: Inbox },
            { key: 'requests', label: 'Solicitudes Publicadas', icon: Dog },
            { key: 'bookings', label: 'Reservas', icon: CalendarCheck },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === key
                  ? 'border-[#00e7ff] text-[#00e7ff]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
              data-testid={`tab-${key}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content: My Profile */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm" data-testid="profile-section">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#00e7ff]" />
              Editar Mi Perfil
            </h2>
            <p className="text-sm text-gray-500 mb-6">Esta información aparece en tu perfil público.</p>

            <form onSubmit={async (e) => {
              e.preventDefault();
              setSavingProfile(true);
              try {
                await api.put('/providers/my-profile', profileForm);
                toast.success('Perfil actualizado correctamente');
                setProvider(prev => ({ ...prev, ...profileForm }));
              } catch (err) {
                toast.error(err.response?.data?.detail || 'Error al guardar');
              } finally {
                setSavingProfile(false);
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de tu Servicio</label>
                <Input
                  value={profileForm.business_name}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, business_name: e.target.value }))}
                  placeholder="Ej: Guardería Canina Feliz"
                  data-testid="profile-business-name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={profileForm.description}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe tu servicio, experiencia y lo que ofreces..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00e7ff] focus:border-transparent"
                  data-testid="profile-description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <Input
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+56 9 1234 5678"
                    data-testid="profile-phone"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comuna</label>
                  <Input
                    value={profileForm.comuna}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, comuna: e.target.value }))}
                    placeholder="Ej: Las Condes"
                    data-testid="profile-comuna"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <Input
                  value={profileForm.address}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Calle, número, depto (opcional)"
                  data-testid="profile-address"
                />
              </div>

              <Button 
                type="submit" 
                disabled={savingProfile}
                className="bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f]"
                data-testid="save-profile-btn"
              >
                {savingProfile ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </form>
          </div>
        )}

        {/* Tab Content: Contact Requests from Premium Clients */}
        {activeTab === 'contact-requests' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm" data-testid="contact-requests-section">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Inbox className="w-5 h-5 text-[#00e7ff]" />
              Solicitudes de Contacto Directas
            </h2>
            <p className="text-sm text-gray-500 mb-4">Clientes premium que quieren contactarte. Si aceptas, se desbloquea el chat.</p>

            {contactRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Inbox className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No tienes solicitudes de contacto</p>
              </div>
            ) : (
              <div className="space-y-3">
                {contactRequests.map(req => (
                  <div key={req.request_id} className={`p-4 rounded-xl border ${req.status === 'accepted' ? 'bg-green-50 border-green-200' : req.status === 'rejected' ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-white border-blue-200'}`} data-testid={`contact-req-${req.request_id}`}>
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        {req.client_picture ? (
                          <img src={req.client_picture} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-lg">
                            {(req.client_name || 'C')[0]}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{req.client_name}</p>
                        <p className="text-sm text-gray-600 mt-1">{req.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(req.created_at).toLocaleDateString('es-CL')}</p>
                      </div>
                    </div>
                    {req.status === 'pending' && (
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          onClick={async () => {
                            setRespondingTo(req.request_id);
                            try {
                              await api.put(`/contact-requests/${req.request_id}/accept`);
                              toast.success('Solicitud aceptada! Chat desbloqueado.');
                              setContactRequests(prev => prev.map(r => r.request_id === req.request_id ? { ...r, status: 'accepted' } : r));
                            } catch (e) { toast.error(e.response?.data?.detail || 'Error'); }
                            finally { setRespondingTo(null); }
                          }}
                          disabled={respondingTo === req.request_id}
                          className="bg-green-600 hover:bg-green-700 text-white flex-1"
                          data-testid={`accept-contact-${req.request_id}`}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" /> Aceptar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            setRespondingTo(req.request_id);
                            try {
                              await api.put(`/contact-requests/${req.request_id}/reject`);
                              toast.info('Solicitud rechazada.');
                              setContactRequests(prev => prev.map(r => r.request_id === req.request_id ? { ...r, status: 'rejected' } : r));
                            } catch (e) { toast.error(e.response?.data?.detail || 'Error'); }
                            finally { setRespondingTo(null); }
                          }}
                          disabled={respondingTo === req.request_id}
                          className="flex-1"
                          data-testid={`reject-contact-${req.request_id}`}
                        >
                          <XCircle className="w-4 h-4 mr-1" /> Rechazar
                        </Button>
                      </div>
                    )}
                    {req.status === 'accepted' && (
                      <div className="mt-3 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-700 font-medium">Aceptada - Chat desbloqueado</span>
                        <Link to="/chat" className="ml-auto text-sm text-[#00e7ff] hover:underline">Ir al chat</Link>
                      </div>
                    )}
                    {req.status === 'rejected' && (
                      <div className="mt-3 flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">Rechazada</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Care Requests from Clients */}
        {activeTab === 'requests' && (
          <CareRequestsProvider hasSubscription={hasSubscription} />
        )}

        {/* Tab Content: Personal Info (Más Datos) */}
        {activeTab === 'personal' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm" data-testid="personal-info-section">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-[#00e7ff]" />
              Más Datos Personales
            </h2>
            <p className="text-sm text-gray-500 mb-6">Esta información se muestra en tu perfil público para que los clientes te conozcan mejor.</p>

            <div className="space-y-5">
              {/* Housing Type */}
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5 mb-1.5">
                  <Home className="w-4 h-4 text-gray-500" /> Tipo de vivienda
                </label>
                <select
                  value={personalInfo.housing_type}
                  onChange={e => setPersonalInfo(prev => ({ ...prev, housing_type: e.target.value }))}
                  className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00e7ff] bg-white"
                  data-testid="personal-housing-type"
                >
                  <option value="">Seleccionar...</option>
                  <option value="casa">Casa</option>
                  <option value="departamento">Departamento</option>
                  <option value="parcela">Parcela / Campo</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              {/* Has Yard */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border-2 transition-all hover:border-[#00e7ff]" data-testid="personal-has-yard">
                  <input
                    type="checkbox"
                    checked={personalInfo.has_yard}
                    onChange={e => setPersonalInfo(prev => ({ ...prev, has_yard: e.target.checked }))}
                    className="w-5 h-5 accent-[#00e7ff]"
                  />
                  <div>
                    <span className="font-semibold text-sm">Tengo patio o jardín</span>
                    <p className="text-xs text-gray-500">Indica si cuentas con espacio exterior</p>
                  </div>
                </label>
                {personalInfo.has_yard && (
                  <>
                    <Input
                      value={personalInfo.yard_description}
                      onChange={e => setPersonalInfo(prev => ({ ...prev, yard_description: e.target.value }))}
                      placeholder="Describe tu patio (ej: amplio, cerrado, con pasto...)"
                      className="mt-2"
                      data-testid="personal-yard-desc"
                    />
                    {/* Yard Photos */}
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-2">Fotos del patio (máx. 3)</p>
                      <div className="flex flex-wrap gap-2">
                        {(personalInfo.yard_photos || []).map(photo => (
                          <div key={photo.photo_id} className="relative w-24 h-24 rounded-lg overflow-hidden border group">
                            <img src={`${process.env.REACT_APP_BACKEND_URL}${photo.thumbnail_url || photo.url}`} alt="" className="w-full h-full object-cover" />
                            <button
                              onClick={async () => {
                                try {
                                  await api.delete(`/providers/my-profile/personal-info/photos/${photo.photo_id}`);
                                  setPersonalInfo(prev => ({ ...prev, yard_photos: (prev.yard_photos || []).filter(p => p.photo_id !== photo.photo_id) }));
                                  toast.success('Foto eliminada');
                                } catch { toast.error('Error al eliminar'); }
                              }}
                              className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              data-testid={`delete-yard-photo-${photo.photo_id}`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {(personalInfo.yard_photos || []).length < 3 && (
                          <label className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-[#00e7ff] hover:text-[#00e7ff] cursor-pointer transition-colors" data-testid="upload-yard-photo">
                            {uploadingPhoto === 'yard' ? (
                              <div className="animate-spin w-5 h-5 border-2 border-[#00e7ff] border-t-transparent rounded-full" />
                            ) : (
                              <>
                                <ImagePlus className="w-5 h-5" />
                                <span className="text-[10px] mt-0.5">Subir</span>
                              </>
                            )}
                            <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setUploadingPhoto('yard');
                              try {
                                const formData = new FormData();
                                formData.append('file', file);
                                const res = await api.post('/providers/my-profile/personal-info/photos?category=yard', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                                setPersonalInfo(prev => ({ ...prev, yard_photos: [...(prev.yard_photos || []), res.data.photo] }));
                                toast.success('Foto subida');
                              } catch (err) { toast.error(err.response?.data?.detail || 'Error al subir'); }
                              finally { setUploadingPhoto(null); e.target.value = ''; }
                            }} />
                          </label>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Has Own Pets */}
              <div>
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border-2 transition-all hover:border-[#00e7ff]" data-testid="personal-has-pets">
                  <input
                    type="checkbox"
                    checked={personalInfo.has_own_pets}
                    onChange={e => setPersonalInfo(prev => ({ ...prev, has_own_pets: e.target.checked }))}
                    className="w-5 h-5 accent-[#00e7ff]"
                  />
                  <div>
                    <span className="font-semibold text-sm">Tengo mascotas propias</span>
                    <p className="text-xs text-gray-500">Los clientes quieren saber si hay otros animales</p>
                  </div>
                </label>
                {personalInfo.has_own_pets && (
                  <>
                    <textarea
                      value={personalInfo.own_pets_description}
                      onChange={e => setPersonalInfo(prev => ({ ...prev, own_pets_description: e.target.value }))}
                      placeholder="Describe tus mascotas (ej: 2 perros golden, 1 gato...)"
                      className="w-full mt-2 border rounded-xl p-3 text-sm min-h-[60px] focus:outline-none focus:ring-2 focus:ring-[#00e7ff]"
                      data-testid="personal-pets-desc"
                    />
                    {/* Pets Photos */}
                    <div className="mt-3">
                      <p className="text-xs text-gray-500 mb-2">Fotos de tus mascotas (máx. 3)</p>
                      <div className="flex flex-wrap gap-2">
                        {(personalInfo.pets_photos || []).map(photo => (
                          <div key={photo.photo_id} className="relative w-24 h-24 rounded-lg overflow-hidden border group">
                            <img src={`${process.env.REACT_APP_BACKEND_URL}${photo.thumbnail_url || photo.url}`} alt="" className="w-full h-full object-cover" />
                            <button
                              onClick={async () => {
                                try {
                                  await api.delete(`/providers/my-profile/personal-info/photos/${photo.photo_id}`);
                                  setPersonalInfo(prev => ({ ...prev, pets_photos: (prev.pets_photos || []).filter(p => p.photo_id !== photo.photo_id) }));
                                  toast.success('Foto eliminada');
                                } catch { toast.error('Error al eliminar'); }
                              }}
                              className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              data-testid={`delete-pets-photo-${photo.photo_id}`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {(personalInfo.pets_photos || []).length < 3 && (
                          <label className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-[#00e7ff] hover:text-[#00e7ff] cursor-pointer transition-colors" data-testid="upload-pets-photo">
                            {uploadingPhoto === 'pets' ? (
                              <div className="animate-spin w-5 h-5 border-2 border-[#00e7ff] border-t-transparent rounded-full" />
                            ) : (
                              <>
                                <ImagePlus className="w-5 h-5" />
                                <span className="text-[10px] mt-0.5">Subir</span>
                              </>
                            )}
                            <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setUploadingPhoto('pets');
                              try {
                                const formData = new FormData();
                                formData.append('file', file);
                                const res = await api.post('/providers/my-profile/personal-info/photos?category=pets', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                                setPersonalInfo(prev => ({ ...prev, pets_photos: [...(prev.pets_photos || []), res.data.photo] }));
                                toast.success('Foto subida');
                              } catch (err) { toast.error(err.response?.data?.detail || 'Error al subir'); }
                              finally { setUploadingPhoto(null); e.target.value = ''; }
                            }} />
                          </label>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Animal Experience */}
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5 mb-1.5">
                  <PawPrint className="w-4 h-4 text-gray-500" /> Experiencia con animales
                </label>
                <textarea
                  value={personalInfo.animal_experience}
                  onChange={e => setPersonalInfo(prev => ({ ...prev, animal_experience: e.target.value }))}
                  placeholder="Cuéntanos sobre tu experiencia cuidando animales..."
                  className="w-full border rounded-xl p-3 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-[#00e7ff]"
                  data-testid="personal-experience"
                />
              </div>

              {/* Daily Availability */}
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5 mb-1.5">
                  <Briefcase className="w-4 h-4 text-gray-500" /> Disponibilidad horaria
                </label>
                <Input
                  value={personalInfo.daily_availability}
                  onChange={e => setPersonalInfo(prev => ({ ...prev, daily_availability: e.target.value }))}
                  placeholder="Ej: Lunes a viernes 8:00-18:00, fines de semana flexible"
                  data-testid="personal-availability"
                />
              </div>

              {/* Additional Info */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Información adicional</label>
                <textarea
                  value={personalInfo.additional_info}
                  onChange={e => setPersonalInfo(prev => ({ ...prev, additional_info: e.target.value }))}
                  placeholder="Cualquier otra información que quieras compartir..."
                  className="w-full border rounded-xl p-3 text-sm min-h-[60px] focus:outline-none focus:ring-2 focus:ring-[#00e7ff]"
                  data-testid="personal-additional"
                />
              </div>

              <Button
                onClick={async () => {
                  setSavingPersonalInfo(true);
                  try {
                    await api.put('/providers/my-profile/personal-info', personalInfo);
                    toast.success('Información personal guardada');
                  } catch (e) {
                    toast.error('Error al guardar información');
                  } finally {
                    setSavingPersonalInfo(false);
                  }
                }}
                disabled={savingPersonalInfo}
                className="w-full bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f]"
                data-testid="save-personal-info-btn"
              >
                {savingPersonalInfo ? 'Guardando...' : 'Guardar Información Personal'}
              </Button>
            </div>
          </div>
        )}

        {/* Tab Content: Photo Gallery */}
        {activeTab === 'gallery' && (
          <ProviderGallery editable={true} />
        )}

        {/* Tab Content: Service Zones */}
        {activeTab === 'zones' && (
          <ServiceZones />
        )}

        {/* Tab Content: Bookings */}
        {activeTab === 'bookings' && (
          <ProviderBookings />
        )}

        {/* Tab Content: Availability & Services */}
        {activeTab === 'availability' && (
          <div className="grid lg:grid-cols-2 gap-8">
          {/* Availability Management */}
          <div className="bg-white rounded-2xl p-6 shadow-sm" data-testid="availability-section">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><CalendarIcon className="w-5 h-5 text-[#00e7ff]" />Disponibilidad</h2>

            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border-2 mb-4 transition-all hover:border-[#00e7ff]" data-testid="always-active-toggle">
              <input type="checkbox" checked={alwaysActive} onChange={e => setAlwaysActive(e.target.checked)} className="w-5 h-5 accent-[#00e7ff]" />
              <div>
                <span className="font-semibold">Siempre activo</span>
                <p className="text-xs text-gray-500">Aparecerás en todas las búsquedas</p>
              </div>
            </label>

            {!alwaysActive && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Selecciona los dias que estas disponible:</p>
                <div className="border rounded-xl p-2 flex justify-center">
                  <Calendar
                    mode="multiple"
                    selected={availableDates}
                    onSelect={dates => setAvailableDates(dates || [])}
                    locale={es}
                    numberOfMonths={1}
                    disabled={{ before: new Date() }}
                    data-testid="availability-calendar"
                  />
                </div>
                {availableDates.length > 0 && (
                  <p className="text-sm text-gray-500 mt-2">{availableDates.length} dias seleccionados</p>
                )}
              </div>
            )}

            <Button onClick={saveAvailability} disabled={savingAvailability} className="w-full bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f]" data-testid="save-availability-button">
              {savingAvailability ? 'Guardando...' : 'Guardar Disponibilidad'}
            </Button>
          </div>

          {/* Services */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Settings className="w-5 h-5 text-[#00e7ff]" />Mis Servicios</h2>
            {provider.services?.length > 0 ? (
              <div className="space-y-3">
                {provider.services.map((s, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="capitalize font-semibold">{s.service_type}</span>
                        {s.description && <p className="text-sm text-gray-500 mt-0.5">{s.description}</p>}
                        {s.pet_sizes?.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {s.pet_sizes.map((size, j) => (
                              <span key={j} className="px-2 py-0.5 bg-white border text-gray-600 text-xs rounded-full capitalize">{size}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="text-[#00e7ff] font-bold">${s.price_from?.toLocaleString('es-CL')}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">Sin servicios configurados</p>
            )}
          </div>
          </div>
        )}

        {/* Tab Content: Reviews */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-[#00e7ff]" />Últimas Reseñas</h2>
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.slice(0, 5).map((r, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} className={`w-4 h-4 ${s <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />)}</div>
                      <span className="text-sm text-gray-500">{r.user_name || 'Usuario'}</span>
                    </div>
                    {r.comment && <p className="text-sm text-gray-700">{r.comment}</p>}
                    {r.photos?.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {r.photos.map((url, j) => (
                          <img key={j} src={url.startsWith('http') ? url : `${process.env.REACT_APP_BACKEND_URL}${url}`} alt="" className="w-16 h-16 rounded-lg object-cover border" />
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
        )}

        {/* Tab Content: Rate Clients */}
        {activeTab === 'clients' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm" data-testid="rate-clients-section">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-[#00e7ff]" />Calificar Clientes</h2>
            <p className="text-sm text-gray-500 mb-4">Califica a los clientes con los que has trabajado</p>

            {conversations.length > 0 ? (
              <div className="space-y-3">
                {conversations.map(conv => {
                  const client = conv.other_user;
                  if (!client) return null;
                  const alreadyReviewed = givenReviews.some(r => r.client_user_id === client.user_id);
                  const isFormOpen = showReviewForm === client.user_id;

                  return (
                    <div key={conv.conversation_id} className="border rounded-xl overflow-hidden">
                      <div className="flex items-center gap-3 p-4 bg-gray-50">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                          {client.picture ? <img src={client.picture.startsWith('http') ? client.picture : `${process.env.REACT_APP_BACKEND_URL}${client.picture}`} alt="" className="w-full h-full object-cover" /> : <span className="text-sm font-bold text-gray-500">{client.name?.[0]}</span>}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{client.name}</p>
                        </div>
                        {alreadyReviewed ? (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${givenReviews.find(r => r.client_user_id === client.user_id)?.published !== false ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {givenReviews.find(r => r.client_user_id === client.user_id)?.published !== false ? 'Publicado' : 'Pendiente'}
                          </span>
                        ) : (
                          <Button size="sm" variant={isFormOpen ? "outline" : "default"} onClick={() => { setShowReviewForm(isFormOpen ? null : client.user_id); setReviewForm({ rating: 5, punctuality: 5, pet_behavior: 5, communication: 5, comment: '' }); }} className={!isFormOpen ? 'bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f]' : ''} data-testid={`rate-client-${client.user_id}`}>
                            {isFormOpen ? 'Cancelar' : 'Calificar'}
                          </Button>
                        )}
                      </div>

                      {isFormOpen && !alreadyReviewed && (
                        <div className="p-4 space-y-4 border-t">
                          {/* Star ratings */}
                          {[
                            { key: 'rating', label: 'Calificacion General' },
                            { key: 'punctuality', label: 'Puntualidad' },
                            { key: 'pet_behavior', label: 'Comportamiento de la Mascota' },
                            { key: 'communication', label: 'Comunicacion' },
                          ].map(({ key, label }) => (
                            <div key={key}>
                              <label className="text-sm font-medium text-gray-700">{label}</label>
                              <div className="flex gap-1 mt-1">
                                {[1, 2, 3, 4, 5].map(s => (
                                  <button key={s} type="button" onClick={() => setReviewForm(prev => ({ ...prev, [key]: s }))} data-testid={`star-${key}-${s}`}>
                                    <Star className={`w-6 h-6 cursor-pointer transition-colors ${s <= reviewForm[key] ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`} />
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                          <div>
                            <label className="text-sm font-medium text-gray-700">Comentario</label>
                            <textarea value={reviewForm.comment} onChange={e => setReviewForm(prev => ({ ...prev, comment: e.target.value }))} placeholder="Opcional: comparte tu experiencia..." className="w-full mt-1 border rounded-xl p-3 text-sm min-h-[60px] focus:outline-none focus:ring-2 focus:ring-[#00e7ff]" data-testid="client-review-comment" />
                          </div>
                          <Button onClick={async () => {
                            setSubmittingReview(true);
                            try {
                              await api.post('/reviews/client', { client_user_id: client.user_id, ...reviewForm });
                              toast.success('Calificacion guardada. Se publicara cuando ambos califiquen o en 7 dias.');
                              setShowReviewForm(null);
                              const res = await api.get('/reviews/provider/given');
                              setGivenReviews(res.data);
                            } catch (err) { toast.error(err.response?.data?.detail || 'Error al calificar'); }
                            finally { setSubmittingReview(false); }
                          }} disabled={submittingReview} className="w-full bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f]" data-testid="submit-client-review">
                            {submittingReview ? 'Enviando...' : 'Enviar Calificacion'}
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">Aun no tienes conversaciones con clientes</p>
            )}
          </div>
        )}

        <div className="mt-6 flex items-center justify-center gap-4">
          <Link to={`/provider/${provider.provider_id}`}>
            <Button variant="outline" className="border-[#00e7ff] text-[#00e7ff]"><Eye className="w-4 h-4 mr-2" />Ver mi perfil publico</Button>
          </Link>
          <Link to="/historial">
            <Button variant="outline" className="border-gray-300 text-gray-600" data-testid="history-link-provider"><Clock className="w-4 h-4 mr-2" />Historial y Facturas</Button>
          </Link>
        </div>

        {/* SOS Emergency Button - Visible for all, functional only for subscribed AND within schedule */}
        {sosConfig?.active && sosConfig?.phone && (
          <div className={`mt-8 rounded-2xl p-6 text-white ${
            hasSubscription && sosConfig.is_available 
              ? 'bg-gradient-to-r from-red-600 to-red-700' 
              : 'bg-gradient-to-r from-gray-400 to-gray-500'
          }`} data-testid="sos-section">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                hasSubscription && sosConfig.is_available ? 'bg-white/20 animate-pulse' : 'bg-white/10'
              }`}>
                <Phone className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  Emergencia SOS
                  {(!hasSubscription || !sosConfig.is_available) && <Lock className="w-5 h-5" />}
                </h3>
                <p className="text-sm opacity-90">
                  {hasSubscription 
                    ? (sosConfig.vet_name ? `Veterinario: ${sosConfig.vet_name}` : 'Asistencia veterinaria de emergencia')
                    : 'Acceso a veterinario de emergencia'
                  }
                </p>
                <p className="text-xs opacity-75 mt-1">
                  Horario: {sosConfig.schedule_text || sosConfig.schedule || '8:00 - 20:00 hrs'}
                  {hasSubscription && !sosConfig.is_available && (
                    <span className="ml-2 px-2 py-0.5 bg-white/20 rounded">Fuera de horario</span>
                  )}
                </p>
              </div>
              {hasSubscription ? (
                sosConfig.is_available ? (
                  <a href={`tel:${sosConfig.phone}`} data-testid="sos-call-button">
                    <Button className="bg-white text-red-600 hover:bg-red-50 font-bold text-lg px-6 py-5">
                      <Phone className="w-5 h-5 mr-2" /> Llamar
                    </Button>
                  </a>
                ) : (
                  <div className="text-center">
                    <p className="text-xs opacity-75 mb-2">Fuera de horario</p>
                    <Button 
                      className="bg-white/20 text-white border border-white/40 font-bold px-6 py-5 cursor-not-allowed"
                      disabled
                    >
                      <Clock className="w-5 h-5 mr-2" /> No disponible
                    </Button>
                  </div>
                )
              ) : (
                <div className="text-center">
                  <p className="text-xs opacity-75 mb-2">Solo para suscritos</p>
                  <Button 
                    className="bg-white/20 text-white border border-white/40 font-bold px-6 py-5 cursor-not-allowed"
                    disabled
                  >
                    <Lock className="w-5 h-5 mr-2" /> Bloqueado
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard;
