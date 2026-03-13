import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, TreePine, Dog, Loader2, X, MapPin, Camera, ChevronRight, ChevronLeft, Check, ImagePlus, PawPrint, Calendar, Clock } from 'lucide-react';
import { useJsApiLoader } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import api from '@/lib/api';

const GOOGLE_MAPS_KEY = process.env.REACT_APP_GOOGLE_MAPS_KEY || '';
const LIBRARIES = ['places'];

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

const STEPS = [
  { id: 1, title: 'Información Personal', required: true },
  { id: 2, title: 'Más Datos', required: false },
  { id: 3, title: 'Servicios', required: false },
  { id: 4, title: 'Disponibilidad', required: false },
  { id: 5, title: 'Zonas', required: false },
  { id: 6, title: 'Galería', required: false },
];

export default function RegisterProvider() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  
  // Step 1: Personal Info
  const [form, setForm] = useState({
    business_name: '', description: '', address: '', comuna: '', phone: '', whatsapp: '',
    latitude: null, longitude: null
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [uploadingProfilePhoto, setUploadingProfilePhoto] = useState(false);
  
  // Step 2: More Data
  const [moreData, setMoreData] = useState({
    housing_type: '', has_yard: false, yard_description: '',
    has_own_pets: false, own_pets_description: '',
    animal_experience: '', daily_availability: '', additional_info: ''
  });
  
  // Step 3: Services
  const [selectedServices, setSelectedServices] = useState({});
  
  // Step 4: Availability
  const [alwaysActive, setAlwaysActive] = useState(true);
  const [availableDates, setAvailableDates] = useState([]);
  
  // Step 5: Zones
  const [serviceZones, setServiceZones] = useState([]);
  const [newZone, setNewZone] = useState('');
  
  // Step 6: Gallery
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  const addressInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_KEY,
    libraries: LIBRARIES
  });

  // Load user data and pre-fill form
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const res = await api.get('/auth/me');
        const user = res.data;
        // Pre-fill the form with user's name
        setForm(prev => ({
          ...prev,
          business_name: user.name || '',
          phone: user.phone || '',
          comuna: user.comuna || '',
          address: user.address || ''
        }));
      } catch (err) {
        navigate('/login');
      }
    };
    loadUserData();
  }, [navigate]);

  // Initialize Places Autocomplete
  useEffect(() => {
    if (isLoaded && addressInputRef.current && !autocompleteRef.current && window.google?.maps?.places) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(addressInputRef.current, {
        componentRestrictions: { country: 'cl' },
        fields: ['geometry', 'formatted_address', 'address_components']
      });

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        if (place.geometry) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const address = place.formatted_address || '';
          let comuna = '';
          if (place.address_components) {
            const localityComp = place.address_components.find(c =>
              c.types.includes('locality') || c.types.includes('administrative_area_level_3')
            );
            if (localityComp) comuna = localityComp.long_name;
          }
          setForm(prev => ({ ...prev, address, latitude: lat, longitude: lng, ...(comuna ? { comuna } : {}) }));
        }
      });
    }
  }, [isLoaded, currentStep]);

  const toggleService = (id) => {
    setSelectedServices(prev => {
      const copy = { ...prev };
      if (copy[id]) { delete copy[id]; }
      else { copy[id] = { service_type: id, price_from: '', description: '', rules: '', pet_sizes: [] }; }
      return copy;
    });
  };

  const updateService = (id, field, value) => {
    setSelectedServices(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  };

  const togglePetSize = (serviceId, size) => {
    setSelectedServices(prev => {
      const svc = prev[serviceId];
      const sizes = svc.pet_sizes.includes(size) ? svc.pet_sizes.filter(s => s !== size) : [...svc.pet_sizes, size];
      return { ...prev, [serviceId]: { ...svc, pet_sizes: sizes } };
    });
  };

  const addZone = () => {
    if (newZone.trim() && !serviceZones.includes(newZone.trim())) {
      setServiceZones(prev => [...prev, newZone.trim()]);
      setNewZone('');
    }
  };

  const removeZone = (zone) => {
    setServiceZones(prev => prev.filter(z => z !== zone));
  };

  const handleProfilePhotoSelect = (file) => {
    if (!file) return;
    setProfilePhoto(file);
    const reader = new FileReader();
    reader.onload = (e) => setProfilePhotoPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const uploadGalleryPhoto = async (file) => {
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      // This will be uploaded after account creation, store locally for now
      const reader = new FileReader();
      reader.onload = (e) => {
        setGalleryPhotos(prev => [...prev, { id: Date.now(), preview: e.target.result, file }]);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      toast.error('Error al procesar foto');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removeGalleryPhoto = (id) => {
    setGalleryPhotos(prev => prev.filter(p => p.id !== id));
  };

  const validateStep1 = () => {
    if (!form.business_name || !form.address || !form.comuna || !form.phone) {
      toast.error('Completa los campos obligatorios');
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep < 6) setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(prev => prev - 1);
  };

  const skipStep = () => {
    if (currentStep < 6) setCurrentStep(prev => prev + 1);
  };

  const handleSubmit = async () => {
    if (!validateStep1()) {
      setCurrentStep(1);
      return;
    }
    
    setSubmitting(true);
    try {
      // Add provider role if needed
      const userRes = await api.get('/auth/me');
      const currentUser = userRes.data;
      const roles = currentUser.roles || [currentUser.role];
      if (!roles.includes('provider')) {
        await api.post('/auth/add-role', { role: 'provider' });
      }
      
      // Create provider profile
      const services = Object.values(selectedServices).map(s => ({
        ...s, price_from: Number(s.price_from) || 0
      }));
      
      const payload = {
        ...form,
        services_offered: services,
        always_active: alwaysActive,
        available_dates: availableDates.map(d => d.toISOString()),
        service_comunas: serviceZones,
        personal_info: moreData
      };
      
      const providerRes = await api.post('/providers', payload);
      
      // Upload profile photo if selected
      if (profilePhoto) {
        try {
          const fd = new FormData();
          fd.append('file', profilePhoto);
          await api.post('/providers/my-profile/photo', fd, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } catch (err) {
          console.error('Error uploading profile photo:', err);
        }
      }
      
      // Upload gallery photos if any
      for (const photo of galleryPhotos) {
        if (photo.file) {
          try {
            const fd = new FormData();
            fd.append('file', photo.file);
            await api.post('/providers/gallery/upload', fd, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
          } catch (err) {
            console.error('Error uploading gallery photo:', err);
          }
        }
      }
      
      toast.success('¡Perfil de cuidador creado exitosamente!');
      navigate('/provider/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al crear perfil');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-1 mb-8">
      {STEPS.map((step, idx) => (
        <React.Fragment key={step.id}>
          <div 
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
              currentStep === step.id 
                ? 'bg-[#00e7ff] text-[#33404f]' 
                : currentStep > step.id 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-200 text-gray-500'
            }`}
          >
            {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
          </div>
          {idx < STEPS.length - 1 && (
            <div className={`w-8 h-1 rounded ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Información Personal</h2>
        <p className="text-gray-500">Datos básicos de tu perfil de cuidador</p>
      </div>

      {/* Profile Photo */}
      <div className="flex justify-center mb-4">
        <div className="text-center">
          <label className="block text-sm font-medium mb-2">Foto de Perfil</label>
          <div className="relative inline-block">
            <div className="w-28 h-28 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-[#00e7ff] transition-colors">
              {profilePhotoPreview ? (
                <img src={profilePhotoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center">
                  <Camera className="w-8 h-8 text-gray-400 mx-auto" />
                  <span className="text-xs text-gray-400">Subir foto</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={e => e.target.files[0] && handleProfilePhotoSelect(e.target.files[0])}
              />
            </div>
            {profilePhotoPreview && (
              <button
                type="button"
                onClick={() => { setProfilePhoto(null); setProfilePhotoPreview(null); }}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">Esta foto aparecerá en tu perfil público</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Tu Nombre Completo *</label>
        <Input placeholder="Ej: María González" value={form.business_name} onChange={e => setForm({...form, business_name: e.target.value})} />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Descripción</label>
        <textarea 
          value={form.description} 
          onChange={e => setForm({...form, description: e.target.value})} 
          placeholder="Cuéntanos sobre ti y tu experiencia con mascotas..." 
          className="w-full border rounded-xl p-3 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-[#00e7ff]" 
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Dirección *</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={addressInputRef}
              type="text"
              placeholder="Busca tu dirección..."
              value={form.address}
              onChange={e => setForm({...form, address: e.target.value, latitude: null, longitude: null})}
              className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          {form.latitude && <p className="text-xs text-green-600 mt-1">✓ Ubicación detectada</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Comuna *</label>
          <Input placeholder="Ej: Providencia" value={form.comuna} onChange={e => setForm({...form, comuna: e.target.value})} />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Teléfono *</label>
          <Input placeholder="+56 9 1234 5678" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">WhatsApp</label>
          <Input placeholder="56912345678" value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})} />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Más Datos</h2>
        <p className="text-gray-500">Información adicional sobre tu hogar y experiencia</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
          <Home className="w-4 h-4" /> Tipo de vivienda
        </label>
        <select
          value={moreData.housing_type}
          onChange={e => setMoreData(prev => ({ ...prev, housing_type: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00e7ff]"
        >
          <option value="">Selecciona...</option>
          <option value="casa">Casa</option>
          <option value="departamento">Departamento</option>
          <option value="parcela">Parcela</option>
        </select>
      </div>

      <div className="flex items-center gap-3 p-3 rounded-xl border hover:border-[#00e7ff] transition-colors">
        <input
          type="checkbox"
          checked={moreData.has_yard}
          onChange={e => setMoreData(prev => ({ ...prev, has_yard: e.target.checked }))}
          className="w-5 h-5 accent-[#00e7ff]"
        />
        <span className="font-medium">Tengo patio o jardín</span>
      </div>

      {moreData.has_yard && (
        <div>
          <label className="block text-sm font-medium mb-1">Describe tu patio/jardín</label>
          <textarea
            value={moreData.yard_description}
            onChange={e => setMoreData(prev => ({ ...prev, yard_description: e.target.value }))}
            placeholder="Tamaño, si está cercado, etc."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      )}

      <div className="flex items-center gap-3 p-3 rounded-xl border hover:border-[#00e7ff] transition-colors">
        <input
          type="checkbox"
          checked={moreData.has_own_pets}
          onChange={e => setMoreData(prev => ({ ...prev, has_own_pets: e.target.checked }))}
          className="w-5 h-5 accent-[#00e7ff]"
        />
        <span className="font-medium flex items-center gap-2"><PawPrint className="w-4 h-4" /> Tengo mascotas propias</span>
      </div>

      {moreData.has_own_pets && (
        <div>
          <label className="block text-sm font-medium mb-1">Describe tus mascotas</label>
          <textarea
            value={moreData.own_pets_description}
            onChange={e => setMoreData(prev => ({ ...prev, own_pets_description: e.target.value }))}
            placeholder="Tipo, raza, edad, temperamento..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Experiencia con animales</label>
        <textarea
          value={moreData.animal_experience}
          onChange={e => setMoreData(prev => ({ ...prev, animal_experience: e.target.value }))}
          placeholder="¿Cuántos años de experiencia tienes? ¿Has trabajado profesionalmente con mascotas?"
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Servicios que Ofreces</h2>
        <p className="text-gray-500">Selecciona los servicios que deseas ofrecer</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {SERVICE_OPTIONS.map(opt => {
          const Icon = opt.icon;
          const isSelected = !!selectedServices[opt.id];
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

      {Object.entries(selectedServices).map(([id, svc]) => {
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
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${svc.pet_sizes.includes(ps.id) ? 'bg-[#00e7ff] text-[#33404f]' : 'bg-white border text-gray-600'}`}
                    >{ps.label}</button>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Descripción del servicio</label>
              <Input placeholder="Ej: Paseos de 30min a 1h" value={svc.description} onChange={e => updateService(id, 'description', e.target.value)} />
            </div>
          </div>
        );
      })}

      {Object.keys(selectedServices).length === 0 && (
        <p className="text-center text-gray-400 py-4">Selecciona al menos un servicio para continuar</p>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Disponibilidad</h2>
        <p className="text-gray-500">¿Cuándo estás disponible para cuidar mascotas?</p>
      </div>

      <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border-2 transition-all hover:border-[#00e7ff]">
        <input type="checkbox" checked={alwaysActive} onChange={e => setAlwaysActive(e.target.checked)} className="w-5 h-5 accent-[#00e7ff]" />
        <div>
          <span className="font-semibold flex items-center gap-2"><Clock className="w-4 h-4" /> Siempre activo</span>
          <p className="text-xs text-gray-500">Apareceré en las búsquedas sin importar las fechas</p>
        </div>
      </label>

      {!alwaysActive && (
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-sm font-medium mb-3">Selecciona tus fechas disponibles:</p>
          <CalendarComponent
            mode="multiple"
            selected={availableDates}
            onSelect={setAvailableDates}
            locale={es}
            className="rounded-xl border bg-white"
            disabled={(date) => date < new Date()}
          />
          {availableDates.length > 0 && (
            <p className="text-sm text-green-600 mt-2">{availableDates.length} fecha(s) seleccionada(s)</p>
          )}
        </div>
      )}
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Zonas de Servicio</h2>
        <p className="text-gray-500">¿En qué comunas o sectores ofreces tus servicios?</p>
      </div>

      <div className="flex gap-2">
        <Input 
          placeholder="Ej: Las Condes, Providencia..." 
          value={newZone}
          onChange={e => setNewZone(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addZone())}
        />
        <Button type="button" onClick={addZone} className="bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f]">Agregar</Button>
      </div>

      {serviceZones.length > 0 ? (
        <div className="flex flex-wrap gap-2 mt-4">
          {serviceZones.map(zone => (
            <span key={zone} className="bg-red-100 text-[#00e7ff] px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2">
              <MapPin className="w-3 h-3" />
              {zone}
              <button type="button" onClick={() => removeZone(zone)} className="hover:bg-red-200 rounded-full p-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-400 py-4">Tu comuna principal ({form.comuna || 'no especificada'}) será tu zona por defecto</p>
      )}
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Galería de Fotos</h2>
        <p className="text-gray-500">Sube fotos para mostrar en tu perfil</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <Camera className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-amber-800 font-medium">Tip: Las fotos con mascotas generan más confianza</p>
          <p className="text-xs text-amber-600 mt-0.5">Los cuidadores con buenas fotos reciben más solicitudes.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {galleryPhotos.map(photo => (
          <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200">
            <img src={photo.preview} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => removeGalleryPhoto(photo.id)}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        
        <label className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#00e7ff] transition-colors">
          {uploadingPhoto ? (
            <Loader2 className="w-8 h-8 text-[#00e7ff] animate-spin" />
          ) : (
            <>
              <ImagePlus className="w-10 h-10 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Subir foto</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => e.target.files[0] && uploadGalleryPhoto(e.target.files[0])}
          />
        </label>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      case 6: return renderStep6();
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="register-provider">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-2">Registra tu Perfil de Cuidador</h1>
          <p className="text-gray-500 text-center mb-6">Paso {currentStep} de 6: {STEPS[currentStep - 1].title}</p>

          {renderStepIndicator()}
          
          <form onSubmit={e => e.preventDefault()}>
            {renderCurrentStep()}

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-8">
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                  <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
                </Button>
              )}
              
              {currentStep < 6 ? (
                <>
                  {currentStep > 1 && (
                    <Button type="button" variant="ghost" onClick={skipStep} className="text-gray-500">
                      Omitir
                    </Button>
                  )}
                  <Button type="button" onClick={nextStep} className="flex-1 bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f]">
                    Siguiente <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </>
              ) : (
                <Button 
                  type="button" 
                  onClick={handleSubmit} 
                  disabled={submitting}
                  className="flex-1 bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f] py-6"
                >
                  {submitting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Creando...</> : 'Crear Perfil de Cuidador'}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
