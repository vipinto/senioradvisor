import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Camera, MapPin, Home, Briefcase, ImagePlus, X, Globe, Instagram, Facebook, DollarSign, Heart, Brain, ListChecks, Stethoscope, Flame, ShieldCheck, Shirt, Bath, Tv, Wifi, Bell, Users, PartyPopper, Lightbulb, Dumbbell, Music, Bus, BedDouble, Bed, Youtube, Lock, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import api from '@/lib/api';
import ProviderGallery from '@/components/ProviderGallery';
import PremiumGallery from '@/components/PremiumGallery';

const SERVICE_CATEGORIES = [
  { key: 'residencias', label: 'Residencias', icon: Home, desc: 'Estadía permanente con cuidado integral' },
  { key: 'cuidado-domicilio', label: 'Cuidado a Domicilio', icon: Heart, desc: 'Atención profesional en el hogar' },
  { key: 'salud-mental', label: 'Salud Mental', icon: Brain, desc: 'Apoyo psicológico y terapias' },
];

const AMENITY_ICON_MAP = {
  geriatria: Stethoscope, enfermeria: Heart, kinesiologia: Dumbbell, psicologia: Brain,
  nutricion: Briefcase, fonoaudiologia: Briefcase, terapia_ocupacional: Briefcase, medico_residente: Stethoscope,
  aire_acondicionado: Flame, calefaccion: Flame, camaras_seguridad: ShieldCheck, lavanderia: Shirt,
  cocina_propia: Home, estacionamiento: MapPin, jardin: Home, capilla: Home,
  bano_privado: Bath, tv: Tv, boton_asistencia: Bell, wifi: Wifi,
  habitacion_individual: BedDouble, habitacion_compartida: Bed,
  actividades_familiares: Users, celebraciones: PartyPopper, talleres_cognitivos: Lightbulb,
  talleres_actividad_fisica: Dumbbell, salidas_recreativas: Bus, musicoterapia: Music,
};

const AMENITY_CATEGORIES = [
  { name: 'Cuidado y Salud', items: ['geriatria', 'enfermeria', 'kinesiologia', 'psicologia', 'nutricion', 'fonoaudiologia', 'terapia_ocupacional', 'medico_residente'] },
  { name: 'Servicios e Instalaciones', items: ['aire_acondicionado', 'calefaccion', 'camaras_seguridad', 'lavanderia', 'cocina_propia', 'estacionamiento', 'jardin', 'capilla'] },
  { name: 'Habitaciones', items: ['bano_privado', 'tv', 'boton_asistencia', 'wifi', 'habitacion_individual', 'habitacion_compartida'] },
  { name: 'Actividades', items: ['actividades_familiares', 'celebraciones', 'talleres_cognitivos', 'talleres_actividad_fisica', 'salidas_recreativas', 'musicoterapia'] },
];

const formatAmenity = (a) => a.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

const ProviderAccount = () => {
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  // Profile
  const [profileForm, setProfileForm] = useState({ business_name: '', description: '', phone: '', address: '', comuna: '', region: '', website: '', youtube_video_url: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingProfilePhoto, setUploadingProfilePhoto] = useState(false);

  // Pricing
  const [pricing, setPricing] = useState({
    residencias: { price_from: '', description: '' },
    'cuidado-domicilio': { price_from: '', description: '' },
    'salud-mental': { price_from: '', description: '' },
  });
  const [savingPricing, setSavingPricing] = useState(false);

  // Amenities
  const [amenities, setAmenities] = useState([]);
  const [savingAmenities, setSavingAmenities] = useState(false);

  // Social
  const [social, setSocial] = useState({ instagram: '', facebook: '', website: '' });
  const [savingSocial, setSavingSocial] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await api.get('/providers/my-profile');
      const p = res.data;
      setProvider(p);
      setProfileForm({
        business_name: p.business_name || '',
        description: p.description || '',
        phone: p.phone || '',
        address: p.address || '',
        comuna: p.comuna || '',
        region: p.region || '',
        website: p.social_links?.website || p.website || '',
        youtube_video_url: p.youtube_video_url || '',
      });
      // Load pricing from services
      const pricingObj = { residencias: { price_from: '', description: '', sub_prices: [] }, 'cuidado-domicilio': { price_from: '', description: '', sub_prices: [] }, 'salud-mental': { price_from: '', description: '', sub_prices: [] } };
      (p.services || []).forEach(svc => {
        if (pricingObj[svc.service_type] !== undefined) {
          pricingObj[svc.service_type] = { price_from: svc.price_from || '', description: svc.description || '', sub_prices: svc.sub_prices || [] };
        }
      });
      setPricing(pricingObj);
      setAmenities(p.amenities || []);
      setSocial({
        instagram: p.social_links?.instagram || '',
        facebook: p.social_links?.facebook || '',
        website: p.social_links?.website || p.website || '',
      });
    } catch (error) {
      if (error.response?.status === 401) navigate('/login');
      else if (error.response?.status === 404) navigate('/registrar-residencia');
    } finally { setLoading(false); }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.put('/providers/my-profile', profileForm);
      toast.success('Perfil actualizado');
      setProvider(prev => ({ ...prev, ...profileForm }));
    } catch (err) { toast.error(err.response?.data?.detail || 'Error al guardar'); }
    finally { setSavingProfile(false); }
  };

  const uploadProfilePhoto = async (file) => {
    setUploadingProfilePhoto(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/providers/my-profile/photo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setProvider(prev => ({ ...prev, profile_photo: res.data.photo_url }));
      toast.success('Foto actualizada');
    } catch { toast.error('Error al subir foto'); }
    finally { setUploadingProfilePhoto(false); }
  };

  const savePricing = async () => {
    setSavingPricing(true);
    try {
      const svcArray = Object.entries(pricing).map(([type, data]) => ({
        service_type: type, price_from: parseInt(data.price_from) || 0, description: data.description || '',
        sub_prices: (data.sub_prices || []).filter(sp => sp.name)
      })).filter(s => s.price_from > 0 || s.description);
      await api.put('/providers/my-profile/services', { services: svcArray });
      toast.success('Precios actualizados');
    } catch { toast.error('Error al guardar precios'); }
    finally { setSavingPricing(false); }
  };

  const toggleAmenity = (item) => {
    setAmenities(prev => prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]);
  };

  const saveAmenities = async () => {
    setSavingAmenities(true);
    try {
      await api.put('/providers/my-profile/amenities', { amenities });
      toast.success('Servicios actualizados');
    } catch { toast.error('Error al guardar servicios'); }
    finally { setSavingAmenities(false); }
  };

  const saveSocial = async () => {
    setSavingSocial(true);
    try {
      await api.put('/providers/my-profile/social', social);
      toast.success('Redes sociales actualizadas');
    } catch { toast.error('Error al guardar'); }
    finally { setSavingSocial(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#00e7ff] border-t-transparent rounded-full animate-spin" /></div>;
  if (!provider) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">No tienes un perfil de proveedor</p></div>;

  const plan = provider.plan_active ? (provider.plan_type || '') : '';
  
  // Permission map per plan
  const canEdit = {
    profile: !!plan, // sobre mí, más info
    pricing: !!plan, // precios
    gallery: !!plan, // galería
    amenities: plan === 'premium' || plan === 'premium_plus',
    social: plan === 'premium_plus',
    youtube: plan === 'premium_plus',
  };

  // Filter visible tabs based on plan
  const allTabs = [
    { key: 'profile', label: 'Mi Perfil', icon: Settings },
    { key: 'pricing', label: 'Precios', icon: DollarSign },
    { key: 'amenities', label: 'Servicios', icon: ListChecks },
    { key: 'gallery', label: 'Galería', icon: Camera },
    { key: 'social', label: 'Redes Sociales', icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-[#33404f]">Mi Cuenta</h1>

        {/* Plan info */}
        {!plan && (
          <div className="mb-4 p-4 bg-gray-50 border rounded-xl">
            <p className="text-sm text-gray-600">No tienes un plan activo. Para acceder a funciones de edición, contacta a <a href="mailto:hola@senioradvisor.cl" className="text-[#00e7ff] underline font-medium">hola@senioradvisor.cl</a></p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b overflow-x-auto">
          {allTabs.map(({ key, label, icon: Icon }) => {
            const allowed = canEdit[key];
            return (
              <button key={key} onClick={() => allowed && setActiveTab(key)} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === key ? 'border-[#00e7ff] text-[#00e7ff]' : allowed ? 'border-transparent text-gray-500 hover:text-gray-700' : 'border-transparent text-gray-300 cursor-not-allowed'}`} data-testid={`tab-${key}`} disabled={!allowed}>
                <Icon className="w-4 h-4" />{label}
                {!allowed && <span className="text-[10px] bg-gray-200 text-gray-400 px-1 rounded ml-1">Bloqueado</span>}
              </button>
            );
          })}
        </div>

        {/* Mi Perfil */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-1 text-[#33404f]">Editar Mi Perfil</h2>
            <p className="text-sm text-gray-500 mb-6">Esta información aparece en tu perfil público.</p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Foto de Perfil</label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
                    {provider.profile_photo ? (
                      <img src={`${process.env.REACT_APP_BACKEND_URL}${provider.profile_photo}`} alt="Perfil" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-bold text-[#00e7ff]">{provider.business_name?.[0]?.toUpperCase() || 'R'}</span>
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#00e7ff] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#00c4d4] transition-colors shadow-lg">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && uploadProfilePhoto(e.target.files[0])} disabled={uploadingProfilePhoto} />
                    {uploadingProfilePhoto ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Camera className="w-4 h-4 text-white" />}
                  </label>
                </div>
                <p className="text-sm text-gray-500">Haz clic en el icono para cambiar la foto.</p>
              </div>
            </div>

            <form onSubmit={saveProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Residencia</label>
                <Input value={profileForm.business_name} onChange={e => setProfileForm(prev => ({ ...prev, business_name: e.target.value }))} placeholder="Ej: Residencia Villa Serena" data-testid="profile-name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea value={profileForm.description} onChange={e => setProfileForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Describe tu residencia, experiencia y servicios..." rows={4} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00e7ff] focus:border-transparent" data-testid="profile-description" />
              </div>

              {/* YouTube Video - Only for subscribed */}
              {canEdit.youtube ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Youtube className="w-4 h-4 text-red-500" />
                    Video de YouTube
                    <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full font-medium flex items-center gap-1"><Crown className="w-3 h-3" /> Premium</span>
                  </label>
                  <Input
                    value={profileForm.youtube_video_url}
                    onChange={e => setProfileForm(prev => ({ ...prev, youtube_video_url: e.target.value }))}
                    placeholder="https://www.youtube.com/watch?v=..."
                    data-testid="profile-youtube-url"
                  />
                  <p className="text-xs text-gray-400 mt-1">Pega la URL de tu video de YouTube. Aparecerá en tu perfil público.</p>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-3 border border-gray-200">
                  <Lock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Video de YouTube</p>
                    <p className="text-xs text-gray-400">Plan Premium+ requerido. Contacta a <a href="mailto:hola@senioradvisor.cl" className="text-[#00e7ff] underline">hola@senioradvisor.cl</a></p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <Input value={profileForm.phone} onChange={e => setProfileForm(prev => ({ ...prev, phone: e.target.value }))} placeholder="+56 9 1234 5678" data-testid="profile-phone" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comuna</label>
                  <Input value={profileForm.comuna} onChange={e => setProfileForm(prev => ({ ...prev, comuna: e.target.value }))} placeholder="Las Condes" data-testid="profile-comuna" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <Input value={profileForm.address} onChange={e => setProfileForm(prev => ({ ...prev, address: e.target.value }))} placeholder="Av. Principal 123" data-testid="profile-address" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Región</label>
                  <Input value={profileForm.region} onChange={e => setProfileForm(prev => ({ ...prev, region: e.target.value }))} placeholder="Región Metropolitana" data-testid="profile-region" />
                </div>
              </div>
              <Button type="submit" disabled={savingProfile} className="bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f]" data-testid="save-profile-btn">
                {savingProfile ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </form>
          </div>
        )}

        {/* Precios */}
        {activeTab === 'pricing' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-1 text-[#33404f]">Precios por Categoría</h2>
            <p className="text-sm text-gray-500 mb-6">Solo las categorías con precio aparecerán en tu perfil público.</p>
            <div className="space-y-4">
              {SERVICE_CATEGORIES.map(({ key, label, icon: Icon, desc }) => (
                <div key={key} className="p-4 bg-gray-50 rounded-xl border-2 border-gray-100 hover:border-[#00e7ff]/30 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-[#00e7ff]/10 flex items-center justify-center"><Icon className="w-5 h-5 text-[#00e7ff]" /></div>
                    <div>
                      <span className="font-bold text-[#33404f]">{label}</span>
                      <p className="text-xs text-gray-400">{desc}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Precio desde (CLP)</label>
                      <Input type="number" value={pricing[key].price_from} onChange={e => setPricing(prev => ({ ...prev, [key]: { ...prev[key], price_from: e.target.value } }))} placeholder="Ej: 1.500.000" data-testid={`price-${key}`} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Descripcion</label>
                      <Input value={pricing[key].description} onChange={e => setPricing(prev => ({ ...prev, [key]: { ...prev[key], description: e.target.value } }))} placeholder="Ej: Incluye alimentacion" data-testid={`desc-${key}`} />
                    </div>
                  </div>
                  {/* Sub-prices */}
                  {canEdit.youtube && (
                    <div className="mt-3 ml-2 border-l-2 border-[#00e7ff]/30 pl-3 space-y-2">
                      <p className="text-xs font-semibold text-gray-500">Sub-precios (detalles del servicio)</p>
                      {(pricing[key].sub_prices || []).map((sp, j) => (
                        <div key={j} className="flex items-center gap-2" data-testid={`sub-price-${key}-${j}`}>
                          <Input
                            type="text"
                            placeholder="Nombre (ej: Hab. individual)"
                            value={sp.name || ''}
                            onChange={e => {
                              const subs = [...(pricing[key].sub_prices || [])];
                              subs[j] = { ...subs[j], name: e.target.value };
                              setPricing(prev => ({ ...prev, [key]: { ...prev[key], sub_prices: subs } }));
                            }}
                            className="flex-1 text-sm"
                          />
                          <Input
                            type="number"
                            placeholder="Precio"
                            value={sp.price || ''}
                            onChange={e => {
                              const subs = [...(pricing[key].sub_prices || [])];
                              subs[j] = { ...subs[j], price: parseInt(e.target.value) || 0 };
                              setPricing(prev => ({ ...prev, [key]: { ...prev[key], sub_prices: subs } }));
                            }}
                            className="w-32 text-sm"
                          />
                          <button
                            onClick={() => {
                              const subs = (pricing[key].sub_prices || []).filter((_, idx) => idx !== j);
                              setPricing(prev => ({ ...prev, [key]: { ...prev[key], sub_prices: subs } }));
                            }}
                            className="text-red-400 text-sm hover:text-red-600 shrink-0 px-1"
                          >x</button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const subs = [...(pricing[key].sub_prices || []), { name: '', price: 0 }];
                          setPricing(prev => ({ ...prev, [key]: { ...prev[key], sub_prices: subs } }));
                        }}
                        className="text-xs text-[#00e7ff] hover:underline font-medium"
                        data-testid={`add-sub-price-${key}`}
                      >
                        + Agregar sub-precio
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <Button onClick={savePricing} disabled={savingPricing} className="w-full bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f]" data-testid="save-pricing-btn">
                {savingPricing ? 'Guardando...' : 'Guardar Precios'}
              </Button>
            </div>
          </div>
        )}

        {/* Servicios / Amenidades - Screenshot style */}
        {activeTab === 'amenities' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-1 text-[#33404f]">Servicios de tu Residencia</h2>
            <p className="text-sm text-gray-500 mb-6">Selecciona los servicios que ofrece tu residencia. Estos se mostrarán en tu perfil público.</p>

            <div className="space-y-6">
              {AMENITY_CATEGORIES.map(cat => (
                <div key={cat.name}>
                  <h3 className="text-sm font-bold text-[#33404f] mb-3 uppercase tracking-wide">{cat.name}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {cat.items.map(item => {
                      const Icon = AMENITY_ICON_MAP[item] || Home;
                      const isActive = amenities.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => toggleAmenity(item)}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                            isActive
                              ? 'border-[#00e7ff] bg-[#00e7ff]/5'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          data-testid={`amenity-${item}`}
                        >
                          <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-[#00e7ff]' : 'text-gray-400'}`} />
                          <span className={`text-sm font-medium ${isActive ? 'text-[#33404f]' : 'text-gray-600'}`}>{formatAmenity(item)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <Button onClick={saveAmenities} disabled={savingAmenities} className="w-full mt-6 bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f]" data-testid="save-amenities-btn">
              {savingAmenities ? 'Guardando...' : 'Guardar Servicios'}
            </Button>
          </div>
        )}

        {/* Galería */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <PremiumGallery isSubscribed={plan === 'premium_plus'} />
            <ProviderGallery providerId={provider.provider_id} />
          </div>
        )}

        {/* Redes Sociales */}
        {activeTab === 'social' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-1 text-[#33404f]">Redes Sociales</h2>
            <p className="text-sm text-gray-500 mb-6">Agrega tus redes sociales para que aparezcan en tu perfil público.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input value={social.instagram} onChange={e => setSocial(prev => ({ ...prev, instagram: e.target.value }))} placeholder="https://instagram.com/tu-residencia" className="pl-11" data-testid="social-instagram" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                <div className="relative">
                  <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input value={social.facebook} onChange={e => setSocial(prev => ({ ...prev, facebook: e.target.value }))} placeholder="https://facebook.com/tu-residencia" className="pl-11" data-testid="social-facebook" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sitio Web</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input value={social.website} onChange={e => setSocial(prev => ({ ...prev, website: e.target.value }))} placeholder="https://www.tu-residencia.cl" className="pl-11" data-testid="social-website" />
                </div>
              </div>
              <Button onClick={saveSocial} disabled={savingSocial} className="w-full bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f]" data-testid="save-social-btn">
                {savingSocial ? 'Guardando...' : 'Guardar Redes Sociales'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderAccount;
