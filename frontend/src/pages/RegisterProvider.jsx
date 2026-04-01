import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, Phone, MapPin, Globe, Facebook, Instagram, DollarSign, Heart, Brain, Home, ChevronRight, ChevronLeft, Check, Loader2, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import api from '@/lib/api';

const STEPS = [
  { id: 1, title: 'Datos de Acceso', icon: Building2 },
  { id: 2, title: 'Contacto', icon: Phone },
  { id: 3, title: 'Redes Sociales', icon: Globe },
  { id: 4, title: 'Servicios y Precios', icon: DollarSign },
  { id: 5, title: 'Amenidades', icon: Heart },
  { id: 6, title: 'Confirmación', icon: Check },
];

const SERVICE_CATEGORIES = [
  { key: 'residencias', label: 'Residencias', icon: Home, desc: 'Estadía permanente con cuidado integral' },
  { key: 'cuidado-domicilio', label: 'Cuidado a Domicilio', icon: Heart, desc: 'Atención profesional en el hogar' },
  { key: 'salud-mental', label: 'Salud Mental', icon: Brain, desc: 'Apoyo psicológico y terapias' },
];

const AMENITY_CATEGORIES = [
  { name: 'Cuidado y Salud', items: ['geriatria', 'enfermeria', 'kinesiologia', 'psicologia', 'nutricion', 'fonoaudiologia', 'terapia_ocupacional', 'medico_residente'] },
  { name: 'Servicios e Instalaciones', items: ['aire_acondicionado', 'calefaccion', 'camaras_seguridad', 'lavanderia', 'cocina_propia', 'estacionamiento', 'jardin', 'capilla'] },
  { name: 'Habitaciones', items: ['bano_privado', 'tv', 'boton_asistencia', 'wifi', 'habitacion_individual', 'habitacion_compartida'] },
  { name: 'Actividades', items: ['actividades_familiares', 'celebraciones', 'talleres_cognitivos', 'talleres_actividad_fisica', 'salidas_recreativas', 'musicoterapia'] },
];

const formatAmenity = (a) => a.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

export default function RegisterProvider() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Step 1
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 2
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [comuna, setComuna] = useState('');
  const [region, setRegion] = useState('');
  const [website, setWebsite] = useState('');

  // Step 3
  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');

  // Step 4
  const [services, setServices] = useState({
    residencias: { price_from: '', description: '' },
    'cuidado-domicilio': { price_from: '', description: '' },
    'salud-mental': { price_from: '', description: '' },
  });

  // Step 5
  const [amenities, setAmenities] = useState([]);

  const toggleAmenity = (item) => {
    setAmenities(prev => prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]);
  };

  const validateStep = (s) => {
    if (s === 1) {
      if (!businessName.trim()) { toast.error('Ingresa el nombre de la residencia'); return false; }
      if (!email.trim()) { toast.error('Ingresa un correo electrónico'); return false; }
      if (password.length < 6) { toast.error('La contraseña debe tener al menos 6 caracteres'); return false; }
      if (password !== confirmPassword) { toast.error('Las contraseñas no coinciden'); return false; }
    }
    return true;
  };

  const nextStep = () => {
    if (!validateStep(step)) return;
    if (step < 6) setStep(s => s + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(s => s - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(1)) { setStep(1); return; }
    setSubmitting(true);
    try {
      const svcArray = [];
      Object.entries(services).forEach(([type, data]) => {
        const price = parseInt(data.price_from) || 0;
        if (price > 0 || data.description) {
          svcArray.push({ service_type: type, price_from: price, description: data.description || '' });
        }
      });

      const payload = {
        business_name: businessName,
        email,
        password,
        phone,
        address,
        comuna,
        region,
        website,
        facebook,
        instagram,
        services: svcArray,
        amenities,
      };

      await api.post('/auth/register-provider', payload);
      toast.success('Registro enviado. Un administrador revisará tu solicitud.');
      navigate('/registro-exitoso');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al registrar');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-1 mb-8" data-testid="step-indicator">
      {STEPS.map((s, idx) => (
        <React.Fragment key={s.id}>
          <button
            type="button"
            onClick={() => { if (s.id < step || (s.id === step)) return; if (validateStep(step)) setStep(s.id); }}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
              step === s.id ? 'bg-[#00e7ff] text-[#33404f] shadow-lg' : step > s.id ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
            }`}
            data-testid={`step-${s.id}-indicator`}
          >
            {step > s.id ? <Check className="w-5 h-5" /> : s.id}
          </button>
          {idx < STEPS.length - 1 && (
            <div className={`w-6 sm:w-10 h-1 rounded ${step > s.id ? 'bg-green-500' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-5" data-testid="step-1-content">
      <div className="text-center mb-6">
        <Building2 className="w-12 h-12 text-[#00e7ff] mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-[#33404f]">Datos de Acceso</h2>
        <p className="text-gray-500 mt-1">Información básica para crear tu cuenta</p>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre de la Residencia *</label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Ej: Residencia Villa Serena" className="pl-11 py-6 text-lg rounded-xl border-2 border-gray-200 focus:border-[#00e7ff]" data-testid="reg-business-name" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Correo Electrónico *</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="residencia@email.cl" className="pl-11 py-6 text-lg rounded-xl border-2 border-gray-200 focus:border-[#00e7ff]" data-testid="reg-email" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña *</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className="pl-11 pr-12 py-6 text-lg rounded-xl border-2 border-gray-200 focus:border-[#00e7ff]" data-testid="reg-password" />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Confirmar Contraseña *</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repite tu contraseña" className="pl-11 py-6 text-lg rounded-xl border-2 border-gray-200 focus:border-[#00e7ff]" data-testid="reg-confirm-password" />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-5" data-testid="step-2-content">
      <div className="text-center mb-6">
        <Phone className="w-12 h-12 text-[#00e7ff] mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-[#33404f]">Datos de Contacto</h2>
        <p className="text-gray-500 mt-1">¿Cómo pueden encontrarte?</p>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Teléfono</label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+56 9 1234 5678" className="pl-11 py-5 rounded-xl border-2 border-gray-200 focus:border-[#00e7ff]" data-testid="reg-phone" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Dirección</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Av. Principal 123" className="pl-11 py-5 rounded-xl border-2 border-gray-200 focus:border-[#00e7ff]" data-testid="reg-address" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Comuna</label>
          <Input value={comuna} onChange={e => setComuna(e.target.value)} placeholder="Las Condes" className="py-5 rounded-xl border-2 border-gray-200 focus:border-[#00e7ff]" data-testid="reg-comuna" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Región</label>
          <Input value={region} onChange={e => setRegion(e.target.value)} placeholder="Región Metropolitana" className="py-5 rounded-xl border-2 border-gray-200 focus:border-[#00e7ff]" data-testid="reg-region" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Sitio Web</label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://www.ejemplo.cl" className="pl-11 py-5 rounded-xl border-2 border-gray-200 focus:border-[#00e7ff]" data-testid="reg-website" />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-5" data-testid="step-3-content">
      <div className="text-center mb-6">
        <Globe className="w-12 h-12 text-[#00e7ff] mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-[#33404f]">Redes Sociales</h2>
        <p className="text-gray-500 mt-1">Conecta con tus visitantes (opcional)</p>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Facebook</label>
        <div className="relative">
          <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input value={facebook} onChange={e => setFacebook(e.target.value)} placeholder="https://facebook.com/tu-residencia" className="pl-11 py-5 rounded-xl border-2 border-gray-200 focus:border-[#00e7ff]" data-testid="reg-facebook" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Instagram</label>
        <div className="relative">
          <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="https://instagram.com/tu-residencia" className="pl-11 py-5 rounded-xl border-2 border-gray-200 focus:border-[#00e7ff]" data-testid="reg-instagram" />
        </div>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
        Las redes sociales ayudan a las familias a conocer mejor tu residencia. Puedes agregarlas ahora o después desde tu panel.
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-5" data-testid="step-4-content">
      <div className="text-center mb-6">
        <DollarSign className="w-12 h-12 text-[#00e7ff] mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-[#33404f]">Servicios y Precios</h2>
        <p className="text-gray-500 mt-1">Indica los servicios que ofreces y sus precios</p>
      </div>
      <p className="text-xs text-gray-400 text-center">Solo las categorías con precio aparecerán en tu perfil público.</p>
      {SERVICE_CATEGORIES.map(({ key, label, icon: Icon, desc }) => (
        <div key={key} className="p-4 bg-gray-50 rounded-xl border-2 border-gray-100 hover:border-[#00e7ff]/30 transition-colors">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[#00e7ff]/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-[#00e7ff]" />
            </div>
            <div>
              <span className="font-bold text-[#33404f]">{label}</span>
              <p className="text-xs text-gray-400">{desc}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Precio desde (CLP)</label>
              <Input
                type="number"
                value={services[key].price_from}
                onChange={e => setServices(prev => ({ ...prev, [key]: { ...prev[key], price_from: e.target.value } }))}
                placeholder="Ej: 1.500.000"
                className="rounded-lg border-gray-200"
                data-testid={`reg-price-${key}`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Descripción</label>
              <Input
                value={services[key].description}
                onChange={e => setServices(prev => ({ ...prev, [key]: { ...prev[key], description: e.target.value } }))}
                placeholder="Ej: Incluye alimentación"
                className="rounded-lg border-gray-200"
                data-testid={`reg-desc-${key}`}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-5" data-testid="step-5-content">
      <div className="text-center mb-6">
        <Heart className="w-12 h-12 text-[#00e7ff] mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-[#33404f]">Amenidades</h2>
        <p className="text-gray-500 mt-1">Selecciona los servicios que ofrece tu residencia</p>
      </div>
      {AMENITY_CATEGORIES.map(cat => (
        <div key={cat.name}>
          <h3 className="text-sm font-bold text-[#33404f] mb-2">{cat.name}</h3>
          <div className="flex flex-wrap gap-2">
            {cat.items.map(item => (
              <button
                key={item}
                type="button"
                onClick={() => toggleAmenity(item)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  amenities.includes(item)
                    ? 'bg-[#00e7ff] text-[#33404f] shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                data-testid={`amenity-${item}`}
              >
                {formatAmenity(item)}
              </button>
            ))}
          </div>
        </div>
      ))}
      {amenities.length > 0 && (
        <p className="text-sm text-green-600 text-center font-medium">{amenities.length} amenidad(es) seleccionada(s)</p>
      )}
    </div>
  );

  const renderStep6 = () => {
    const activeServices = Object.entries(services).filter(([, d]) => parseInt(d.price_from) > 0 || d.description);
    return (
      <div className="space-y-5" data-testid="step-6-content">
        <div className="text-center mb-6">
          <ShieldCheck className="w-12 h-12 text-[#00e7ff] mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-[#33404f]">Confirmar Registro</h2>
          <p className="text-gray-500 mt-1">Revisa los datos antes de enviar</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <strong>Nota:</strong> Tu residencia será revisada por un administrador antes de aparecer en el directorio. Te notificaremos por correo cuando sea aprobada.
        </div>

        <div className="space-y-3">
          <div className="bg-white border rounded-xl p-4">
            <h4 className="font-bold text-sm text-gray-500 mb-2">Residencia</h4>
            <p className="font-semibold text-lg text-[#33404f]">{businessName}</p>
            <p className="text-sm text-gray-500">{email}</p>
          </div>

          <div className="bg-white border rounded-xl p-4">
            <h4 className="font-bold text-sm text-gray-500 mb-2">Contacto</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {phone && <p><span className="text-gray-400">Tel:</span> {phone}</p>}
              {address && <p><span className="text-gray-400">Dir:</span> {address}</p>}
              {comuna && <p><span className="text-gray-400">Comuna:</span> {comuna}</p>}
              {region && <p><span className="text-gray-400">Región:</span> {region}</p>}
              {website && <p><span className="text-gray-400">Web:</span> {website}</p>}
            </div>
            {!phone && !address && !comuna && <p className="text-sm text-gray-400 italic">No se proporcionó información de contacto</p>}
          </div>

          {(facebook || instagram) && (
            <div className="bg-white border rounded-xl p-4">
              <h4 className="font-bold text-sm text-gray-500 mb-2">Redes Sociales</h4>
              <div className="text-sm space-y-1">
                {facebook && <p className="flex items-center gap-2"><Facebook className="w-4 h-4 text-blue-600" /> {facebook}</p>}
                {instagram && <p className="flex items-center gap-2"><Instagram className="w-4 h-4 text-pink-500" /> {instagram}</p>}
              </div>
            </div>
          )}

          {activeServices.length > 0 && (
            <div className="bg-white border rounded-xl p-4">
              <h4 className="font-bold text-sm text-gray-500 mb-2">Servicios</h4>
              {activeServices.map(([type, data]) => {
                const cat = SERVICE_CATEGORIES.find(c => c.key === type);
                return (
                  <div key={type} className="flex justify-between items-center py-1 text-sm">
                    <span className="text-gray-700">{cat?.label || type}</span>
                    <span className="font-semibold text-[#33404f]">
                      {parseInt(data.price_from) > 0 ? `$${parseInt(data.price_from).toLocaleString('es-CL')} CLP` : data.description}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {amenities.length > 0 && (
            <div className="bg-white border rounded-xl p-4">
              <h4 className="font-bold text-sm text-gray-500 mb-2">Amenidades ({amenities.length})</h4>
              <div className="flex flex-wrap gap-1.5">
                {amenities.map(a => (
                  <span key={a} className="bg-[#00e7ff]/10 text-[#33404f] text-xs px-2 py-1 rounded-full">{formatAmenity(a)}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCurrentStep = () => {
    switch (step) {
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
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-white py-8 px-4" data-testid="register-provider-page">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <Link to="/">
            <img src="/logo-senior.svg" alt="SeniorAdvisor" className="h-14 mx-auto mb-4" />
          </Link>
          <h1 className="text-3xl font-bold text-[#33404f]" data-testid="register-provider-title">Registra tu Residencia</h1>
          <p className="text-gray-500 mt-1">Paso {step} de 6: {STEPS[step - 1].title}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          {renderStepIndicator()}

          <form onSubmit={e => e.preventDefault()}>
            {renderCurrentStep()}

            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={prevStep} className="flex-1 py-5 rounded-xl text-base" data-testid="btn-prev-step">
                  <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
                </Button>
              )}

              {step < 6 ? (
                <Button type="button" onClick={nextStep} className="flex-1 bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f] py-5 rounded-xl text-base font-bold shadow-md hover:shadow-lg transition-all" data-testid="btn-next-step">
                  Siguiente <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f] py-6 rounded-xl text-base font-bold shadow-md hover:shadow-lg transition-all"
                  data-testid="btn-submit-registration"
                >
                  {submitting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Enviando...</> : 'Enviar Registro'}
                </Button>
              )}
            </div>
          </form>

          <div className="text-center mt-6 text-sm text-gray-500">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-[#00e7ff] hover:underline font-bold" data-testid="login-link">Inicia sesión</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
