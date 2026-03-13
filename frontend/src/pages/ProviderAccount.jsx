import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Calendar as CalendarIcon, MapPin, UserCircle, Home, PawPrint, ImagePlus, X, Camera, Dog, TreePine, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import api from '@/lib/api';
import ServiceZones from '@/components/ServiceZones';
import ProviderGallery from '@/components/ProviderGallery';

const SERVICE_OPTIONS = [
  { id: 'paseo', label: 'Paseo', icon: Dog, desc: 'Retiro, paseo, ejercicio y devolución' },
  { id: 'cuidado', label: 'Cuidado', icon: Home, desc: 'Cuidado mientras viajan sus dueños' },
  { id: 'daycare', label: 'Daycare', icon: TreePine, desc: 'Cuidado diurno mientras trabajan' },
];

const PET_SIZES = [
  { id: 'pequeno', label: 'Pequeño' },
  { id: 'mediano', label: 'Mediano' },
  { id: 'grande', label: 'Grande' },
];

const ProviderAccount = () => {
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile form
  const [profileForm, setProfileForm] = useState({
    business_name: '', description: '', phone: '', address: '', comuna: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingProfilePhoto, setUploadingProfilePhoto] = useState(false);

  // Services
  const [services, setServices] = useState({});
  const [savingServices, setSavingServices] = useState(false);

  // Availability
  const [alwaysActive, setAlwaysActive] = useState(true);
  const [availableDates, setAvailableDates] = useState([]);
  const [savingAvailability, setSavingAvailability] = useState(false);

  // Personal Info (Más Datos)
  const [personalInfo, setPersonalInfo] = useState({
    housing_type: '', has_yard: false, yard_description: '',
    has_own_pets: false, own_pets_description: '',
    animal_experience: '', daily_availability: '', additional_info: '',
    yard_photos: [], pets_photos: []
  });
  const [savingPersonalInfo, setSavingPersonalInfo] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const profileRes = await api.get('/providers/my-profile');
      const p = profileRes.data;
      setProvider(p);
      setProfileForm({
        business_name: p.business_name || '',
        description: p.description || '',
        phone: p.phone || '',
        address: p.address || '',
        comuna: p.comuna || ''
      });
      setAlwaysActive(p.always_active !== false);
      setAvailableDates((p.available_dates || []).map(d => new Date(d)));
      
      // Load existing services
      if (p.services && p.services.length > 0) {
        const servicesObj = {};
        p.services.forEach(svc => {
          servicesObj[svc.service_type] = {
            service_type: svc.service_type,
            service_id: svc.service_id,
            price_from: svc.price_from || '',
            description: svc.description || '',
            rules: svc.rules || '',
            pet_sizes: svc.pet_sizes || []
          };
        });
        setServices(servicesObj);
      }
      
      try {
        const piRes = await api.get('/providers/my-profile/personal-info');
        if (piRes.data && Object.keys(piRes.data).length > 0) {
          setPersonalInfo(prev => ({ ...prev, ...piRes.data }));
        }
      } catch {}
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
      } else if (error.response?.status === 404) {
        navigate('/provider/register');
      }
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (e) => {
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
  };

  // Services functions
  const toggleService = (id) => {
    setServices(prev => {
      const copy = { ...prev };
      if (copy[id]) { delete copy[id]; }
      else { copy[id] = { service_type: id, price_from: '', description: '', rules: '', pet_sizes: [] }; }
      return copy;
    });
  };

  const updateService = (id, field, value) => {
    setServices(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const togglePetSize = (serviceId, size) => {
    setServices(prev => {
      const svc = prev[serviceId];
      const sizes = svc.pet_sizes.includes(size) ? svc.pet_sizes.filter(s => s !== size) : [...svc.pet_sizes, size];
      return { ...prev, [serviceId]: { ...svc, pet_sizes: sizes } };
    });
  };

  const saveServices = async () => {
    setSavingServices(true);
    try {
      const servicesArray = Object.values(services).map(s => ({
        ...s,
        price_from: Number(s.price_from) || 0
      }));
      await api.put('/providers/my-profile/services', { services: servicesArray });
      toast.success('Servicios actualizados correctamente');
      // Reload to get updated profile completeness
      await loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al guardar servicios');
    } finally {
      setSavingServices(false);
    }
  };

  const uploadProfilePhoto = async (file) => {
    setUploadingProfilePhoto(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/providers/my-profile/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProvider(prev => ({ ...prev, profile_photo: res.data.photo_url }));
      toast.success('Foto de perfil actualizada');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al subir foto');
    } finally {
      setUploadingProfilePhoto(false);
    }
  };

  const saveAvailability = async () => {
    setSavingAvailability(true);
    try {
      await api.put('/providers/my-profile', {
        always_active: alwaysActive,
        available_dates: alwaysActive ? [] : availableDates.map(d => d.toISOString().slice(0, 10))
      });
      toast.success('Disponibilidad guardada');
    } catch (err) {
      toast.error('Error al guardar disponibilidad');
    } finally {
      setSavingAvailability(false);
    }
  };

  const savePersonalInfo = async () => {
    setSavingPersonalInfo(true);
    try {
      const { yard_photos, pets_photos, ...textData } = personalInfo;
      await api.put('/providers/my-profile/personal-info', textData);
      toast.success('Información guardada');
    } catch (err) {
      toast.error('Error al guardar');
    } finally {
      setSavingPersonalInfo(false);
    }
  };

  const uploadPhoto = async (file, type) => {
    setUploadingPhoto(type);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('photo_type', type);
      const res = await api.post('/providers/my-profile/personal-info/photos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setPersonalInfo(prev => ({
        ...prev,
        [type === 'yard' ? 'yard_photos' : 'pets_photos']: [
          ...(prev[type === 'yard' ? 'yard_photos' : 'pets_photos'] || []),
          res.data
        ]
      }));
      toast.success('Foto subida');
    } catch (err) {
      toast.error('Error al subir foto');
    } finally {
      setUploadingPhoto(null);
    }
  };

  const deletePhoto = async (photoId, type) => {
    try {
      await api.delete(`/providers/my-profile/personal-info/photos/${photoId}`);
      setPersonalInfo(prev => ({
        ...prev,
        [type === 'yard' ? 'yard_photos' : 'pets_photos']: (prev[type === 'yard' ? 'yard_photos' : 'pets_photos'] || []).filter(p => p.photo_id !== photoId)
      }));
      toast.success('Foto eliminada');
    } catch (err) {
      toast.error('Error al eliminar foto');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#00e7ff] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">No tienes un perfil de cuidador</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Mi Cuenta</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b overflow-x-auto">
          {[
            { key: 'profile', label: 'Mi Perfil', icon: Settings },
            { key: 'services', label: 'Servicios', icon: Briefcase },
            { key: 'personal', label: 'Más Datos', icon: UserCircle },
            { key: 'gallery', label: 'Galería', icon: Camera },
            { key: 'zones', label: 'Zonas', icon: MapPin },
            { key: 'availability', label: 'Disponibilidad', icon: CalendarIcon },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === key
                  ? 'border-[#00e7ff] text-[#00e7ff]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Mi Perfil */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#00e7ff]" />
              Editar Mi Perfil
            </h2>
            <p className="text-sm text-gray-500 mb-6">Esta información aparece en tu perfil público.</p>

            {/* Profile Photo */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Foto de Perfil</label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
                    {provider.profile_photo ? (
                      <img 
                        src={`${process.env.REACT_APP_BACKEND_URL}${provider.profile_photo}`} 
                        alt="Perfil" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <span className="text-3xl font-bold text-[#00e7ff]">
                        {provider.business_name?.[0]?.toUpperCase() || 'C'}
                      </span>
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#00e7ff] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#00c4d4] transition-colors shadow-lg">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files[0] && uploadProfilePhoto(e.target.files[0])}
                      disabled={uploadingProfilePhoto}
                    />
                    {uploadingProfilePhoto ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4 text-white" />
                    )}
                  </label>
                </div>
                <div className="text-sm text-gray-500">
                  <p>Haz clic en el icono de cámara para cambiar tu foto.</p>
                  <p className="text-xs mt-1">Recomendado: 400x400 px</p>
                </div>
              </div>
            </div>

            <form onSubmit={saveProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de tu Servicio</label>
                <Input
                  value={profileForm.business_name}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, business_name: e.target.value }))}
                  placeholder="Ej: Guardería Canina Feliz"
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
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <Input
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+56 9 1234 5678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comuna</label>
                  <Input
                    value={profileForm.comuna}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, comuna: e.target.value }))}
                    placeholder="Ej: Las Condes"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <Input
                  value={profileForm.address}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Calle, número, depto (opcional)"
                />
              </div>

              <Button type="submit" disabled={savingProfile} className="bg-[#00e7ff] hover:bg-[#00c4d4] text-white">
                {savingProfile ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </form>
          </div>
        )}

        {/* Servicios */}
        {activeTab === 'services' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#00e7ff]" />
              Mis Servicios
            </h2>
            <p className="text-sm text-gray-500 mb-6">Configura los servicios que ofreces y sus precios.</p>

            <div className="space-y-4">
              {/* Service Options */}
              <div className="grid grid-cols-3 gap-3">
                {SERVICE_OPTIONS.map(opt => {
                  const Icon = opt.icon;
                  const isSelected = !!services[opt.id];
                  return (
                    <button key={opt.id} type="button" onClick={() => toggleService(opt.id)}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${isSelected ? 'border-[#00e7ff] bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <Icon className={`w-8 h-8 mx-auto mb-2 ${isSelected ? 'text-[#00e7ff]' : 'text-gray-400'}`} />
                      <p className={`font-semibold text-sm ${isSelected ? 'text-[#00e7ff]' : 'text-gray-600'}`}>{opt.label}</p>
                      <p className="text-xs text-gray-400 mt-1">{opt.desc}</p>
                    </button>
                  );
                })}
              </div>

              {/* Service Details */}
              {Object.entries(services).map(([id, svc]) => {
                const opt = SERVICE_OPTIONS.find(o => o.id === id);
                return (
                  <div key={id} className="border rounded-xl p-4 space-y-3 bg-gray-50">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-[#00e7ff]">{opt?.label}</h3>
                      <button type="button" onClick={() => toggleService(id)} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium mb-1">Precio desde (CLP)</label>
                        <Input type="number" placeholder="8000" value={svc.price_from} onChange={e => updateService(id, 'price_from', e.target.value)} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium mb-1">Tamaño de perros</label>
                        <div className="flex gap-2 mt-1">
                          {PET_SIZES.map(ps => (
                            <button key={ps.id} type="button" onClick={() => togglePetSize(id, ps.id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${svc.pet_sizes.includes(ps.id) ? 'bg-[#00e7ff] text-white' : 'bg-white border text-gray-600'}`}
                            >{ps.label}</button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Descripción del servicio</label>
                      <Input placeholder="Ej: Paseos de 30min a 1h" value={svc.description} onChange={e => updateService(id, 'description', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Reglas o requisitos</label>
                      <Input placeholder="Ej: Vacunas al día, perro sociable" value={svc.rules} onChange={e => updateService(id, 'rules', e.target.value)} />
                    </div>
                  </div>
                );
              })}

              {Object.keys(services).length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Briefcase className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Selecciona al menos un servicio para ofrecer</p>
                </div>
              )}

              <Button 
                onClick={saveServices} 
                disabled={savingServices || Object.keys(services).length === 0} 
                className="w-full bg-[#00e7ff] hover:bg-[#00c4d4] text-white"
              >
                {savingServices ? 'Guardando...' : 'Guardar Servicios'}
              </Button>
            </div>
          </div>
        )}

        {/* Más Datos */}
        {activeTab === 'personal' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-[#00e7ff]" />
              Más Datos Personales
            </h2>
            <p className="text-sm text-gray-500 mb-6">Esta información se muestra en tu perfil público para que los clientes te conozcan mejor.</p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Home className="w-4 h-4" /> Tipo de vivienda
                </label>
                <select
                  value={personalInfo.housing_type}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, housing_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00e7ff]"
                >
                  <option value="">Selecciona...</option>
                  <option value="casa">Casa</option>
                  <option value="departamento">Departamento</option>
                  <option value="parcela">Parcela</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="hasYard"
                  checked={personalInfo.has_yard}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, has_yard: e.target.checked }))}
                  className="w-5 h-5 text-[#00e7ff] rounded"
                />
                <label htmlFor="hasYard" className="text-sm font-medium text-gray-700">Tengo patio o jardín</label>
              </div>

              {personalInfo.has_yard && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Describe tu patio/jardín</label>
                  <textarea
                    value={personalInfo.yard_description}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, yard_description: e.target.value }))}
                    placeholder="Tamaño, si está cercado, etc."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fotos del patio</label>
                    <div className="flex flex-wrap gap-2">
                      {(personalInfo.yard_photos || []).map((photo) => (
                        <div key={photo.photo_id} className="relative w-20 h-20">
                          <img src={photo.url} alt="Patio" className="w-full h-full object-cover rounded-lg" />
                          <button
                            onClick={() => deletePhoto(photo.photo_id, 'yard')}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-[#00e7ff]">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files[0] && uploadPhoto(e.target.files[0], 'yard')}
                          disabled={uploadingPhoto === 'yard'}
                        />
                        {uploadingPhoto === 'yard' ? (
                          <div className="w-5 h-5 border-2 border-[#00e7ff] border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <ImagePlus className="w-6 h-6 text-gray-400" />
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="hasOwnPets"
                  checked={personalInfo.has_own_pets}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, has_own_pets: e.target.checked }))}
                  className="w-5 h-5 text-[#00e7ff] rounded"
                />
                <label htmlFor="hasOwnPets" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <PawPrint className="w-4 h-4" /> Tengo mascotas propias
                </label>
              </div>

              {personalInfo.has_own_pets && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Describe tus mascotas</label>
                  <textarea
                    value={personalInfo.own_pets_description}
                    onChange={(e) => setPersonalInfo(prev => ({ ...prev, own_pets_description: e.target.value }))}
                    placeholder="Tipo, raza, edad, temperamento..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />

                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fotos de tus mascotas</label>
                    <div className="flex flex-wrap gap-2">
                      {(personalInfo.pets_photos || []).map((photo) => (
                        <div key={photo.photo_id} className="relative w-20 h-20">
                          <img src={photo.url} alt="Mascota" className="w-full h-full object-cover rounded-lg" />
                          <button
                            onClick={() => deletePhoto(photo.photo_id, 'pets')}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-[#00e7ff]">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => e.target.files[0] && uploadPhoto(e.target.files[0], 'pets')}
                          disabled={uploadingPhoto === 'pets'}
                        />
                        {uploadingPhoto === 'pets' ? (
                          <div className="w-5 h-5 border-2 border-[#00e7ff] border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <ImagePlus className="w-6 h-6 text-gray-400" />
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experiencia con animales</label>
                <textarea
                  value={personalInfo.animal_experience}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, animal_experience: e.target.value }))}
                  placeholder="Años de experiencia, formación, etc."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Información adicional</label>
                <textarea
                  value={personalInfo.additional_info}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, additional_info: e.target.value }))}
                  placeholder="Cualquier otra información relevante..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <Button onClick={savePersonalInfo} disabled={savingPersonalInfo} className="bg-[#00e7ff] hover:bg-[#00c4d4] text-white">
                {savingPersonalInfo ? 'Guardando...' : 'Guardar Información'}
              </Button>
            </div>
          </div>
        )}

        {/* Zonas */}
        {activeTab === 'zones' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <ServiceZones providerId={provider.provider_id} />
          </div>
        )}

        {/* Galería */}
        {activeTab === 'gallery' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <ProviderGallery providerId={provider.provider_id} />
          </div>
        )}

        {/* Disponibilidad */}
        {activeTab === 'availability' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#00e7ff]" />
              Disponibilidad
            </h2>

            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={alwaysActive}
                  onChange={(e) => setAlwaysActive(e.target.checked)}
                  className="w-5 h-5 text-[#00e7ff] rounded"
                />
                <span className="font-medium">Siempre disponible</span>
              </label>
              <p className="text-sm text-gray-500 mt-1 ml-8">
                Marca esta opción si estás disponible todos los días
              </p>
            </div>

            {!alwaysActive && (
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-3">Selecciona los días que estarás disponible:</p>
                <Calendar
                  mode="multiple"
                  selected={availableDates}
                  onSelect={(dates) => setAvailableDates(dates || [])}
                  locale={es}
                  className="rounded-lg border"
                />
                <p className="text-sm text-gray-500 mt-2">
                  {availableDates.length} día(s) seleccionado(s)
                </p>
              </div>
            )}

            <Button onClick={saveAvailability} disabled={savingAvailability} className="bg-[#00e7ff] hover:bg-[#00c4d4] text-white">
              {savingAvailability ? 'Guardando...' : 'Guardar Disponibilidad'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderAccount;
