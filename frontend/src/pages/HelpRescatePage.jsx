import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Phone, Stethoscope, Ambulance, Heart, Shield, MapPin, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';

const HELP_LOGO = "https://customer-assets.emergentagent.com/job_316c0f31-5a86-43b3-bcc3-d5c9be92d49a/artifacts/tawy0n3k_images-7.png";

function ContactModal({ open, onClose, partnerName, partnerSlug, planInterest }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', contact_type: '' });
  const [sending, setSending] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) {
      toast.error('Completa nombre, correo y teléfono');
      return;
    }
    setSending(true);
    try {
      await api.post('/partners/leads', {
        ...form,
        partner_slug: partnerSlug,
        plan_interest: planInterest || '',
      });
      toast.success('Mensaje enviado. Te contactaremos pronto.');
      onClose();
      setForm({ name: '', email: '', phone: '', contact_type: '' });
    } catch {
      toast.error('Error al enviar. Intenta de nuevo.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-testid="partner-contact-modal">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full">
          <X className="w-5 h-5 text-gray-400" />
        </button>
        <h3 className="text-xl font-bold text-[#33404f] mb-1">Contactar a {partnerName}</h3>
        <p className="text-sm text-gray-500 mb-5">Envía tus datos y responderemos a tu correo electrónico con todos los antecedentes.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#33404f] mb-1">Nombre</label>
            <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00e7ff] transition-colors"
              placeholder="Tu nombre completo" data-testid="lead-name" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#33404f] mb-1">Correo electrónico</label>
            <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00e7ff] transition-colors"
              placeholder="tu@correo.cl" data-testid="lead-email" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#33404f] mb-1">Teléfono</label>
            <div className="flex">
              <span className="bg-gray-100 border-2 border-r-0 border-gray-200 rounded-l-xl px-3 py-3 text-sm text-gray-500 font-medium">+56</span>
              <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                className="flex-1 border-2 border-gray-200 rounded-r-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00e7ff] transition-colors"
                placeholder="9 1234 5678" data-testid="lead-phone" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#33404f] mb-1">Tipo de contacto</label>
            <select value={form.contact_type} onChange={e => setForm(p => ({ ...p, contact_type: e.target.value }))}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00e7ff] transition-colors bg-white"
              data-testid="lead-contact-type">
              <option value="">Seleccionar...</option>
              <option value="cotizacion">Cotización</option>
              <option value="informacion">Información general</option>
              <option value="contratacion">Contratación</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button type="submit" disabled={sending}
              className="flex-1 bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f] font-bold"
              data-testid="lead-submit">
              {sending ? 'Enviando...' : 'Enviar mensaje'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function HelpRescatePage() {
  const [showContact, setShowContact] = useState(false);
  const [planInterest, setPlanInterest] = useState('');

  const openContact = (plan) => {
    setPlanInterest(plan || '');
    setShowContact(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link to="/" className="inline-flex items-center gap-2 text-[#33404f] hover:text-[#00e7ff] mb-6 font-medium text-sm">
            <ArrowLeft className="w-4 h-4" /> Volver al Inicio
          </Link>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="w-48 shrink-0">
              <img src={HELP_LOGO} alt="Help Rescate" className="w-full" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl font-bold text-[#33404f]">Help Rescate</h1>
                <span className="bg-[#00e7ff] text-[#33404f] text-xs font-bold px-3 py-1 rounded-full">Convenio SeniorClub</span>
              </div>
              <p className="text-gray-600 leading-relaxed">
                En Help Rescate llevamos más de 25 años acompañando a las personas en momentos donde la salud se vuelve una prioridad. Nuestra misión es estar presentes cuando más se necesita, entregando apoyo, orientación y soluciones concretas frente a emergencias o urgencias de salud que puedan afectar a ti o a tu familia.
              </p>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <MapPin className="w-4 h-4 text-[#00e7ff]" />
                  Valparaíso, Metropolitana y Biobío
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Services */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-[#33404f] mb-6">Servicios y actividades disponibles</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-[#33404f] text-lg mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#00e7ff]" /> Mejoramiento del Hogar
              </h3>
              <ul className="space-y-3">
                {['Orientación telefónica 24/7', 'Telemedicina', 'Médico a domicilio', 'Toma de muestras', 'Psicología online'].map((s, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-[#00e7ff] shrink-0" /> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-[#33404f] text-lg mb-4 flex items-center gap-2">
                <Ambulance className="w-5 h-5 text-[#00e7ff]" /> Emergencias y Traslados
              </h3>
              <ul className="space-y-3">
                {['Traslado a centro médico', 'Evaluación de urgencia (pulso/ECG)', 'Copago rescate adicional (ticket/moneda)', 'Rescate Móvil 24/7', 'Equipamiento y personal de salud capacitado'].map((s, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-[#00e7ff] shrink-0" /> {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Plans */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#33404f]">Planes Disponibles</h2>
            <Button onClick={() => openContact('')} className="bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f] font-bold" data-testid="contact-help-btn">
              Contactar
            </Button>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Plan Hogar */}
            <div className="bg-white rounded-2xl border-2 border-gray-100 hover:border-[#00e7ff] transition-colors overflow-hidden shadow-sm">
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-[#33404f]">PLAN HOGAR</h3>
                  <span className="bg-[#00e7ff]/10 text-[#33404f] text-xs font-bold px-3 py-1 rounded-full">Mejoramiento del Hogar</span>
                </div>
                <p className="text-sm text-gray-500 mb-4">Médico a domicilio: 3 visitas programadas al año con médico general. Telemedicina: consultas ilimitadas 24/7. Orientación telefónica las 24 horas.</p>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-2xl font-bold text-[#33404f]">Desde $8.336 <span className="text-sm font-normal text-gray-400">/mes</span></p>
                  <p className="text-xs text-gray-400">Cobro en UF, Desde 0.22</p>
                </div>
              </div>
              <div className="border-t px-6 py-4">
                <Button onClick={() => openContact('Plan Hogar')} className="w-full bg-[#33404f] hover:bg-[#4a5568] text-white font-bold" data-testid="contact-plan-hogar">
                  Contactar por Plan Hogar
                </Button>
              </div>
            </div>
            {/* Plan Rescate Total */}
            <div className="bg-white rounded-2xl border-2 border-[#00e7ff] overflow-hidden shadow-sm relative">
              <div className="absolute top-0 left-0 right-0 bg-[#00e7ff] text-center py-1">
                <span className="text-xs font-bold text-[#33404f]">Más popular</span>
              </div>
              <div className="p-6 pt-10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-[#33404f]">PLAN RESCATE TOTAL</h3>
                  <span className="bg-red-50 text-red-600 text-xs font-bold px-3 py-1 rounded-full">Emergencias y traslados</span>
                </div>
                <p className="text-sm text-gray-500 mb-4">Rescate Móvil 24/7: 8 rescates/año en ambulancias equipadas con personal paramédico. Incluye todos los beneficios del Plan Hogar.</p>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-2xl font-bold text-[#33404f]">Desde $32.152 <span className="text-sm font-normal text-gray-400">/mes</span></p>
                  <p className="text-xs text-gray-400">Cobro en UF, Desde 0.81</p>
                </div>
              </div>
              <div className="border-t px-6 py-4">
                <Button onClick={() => openContact('Plan Rescate Total')} className="w-full bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f] font-bold" data-testid="contact-plan-rescate">
                  Contactar por Plan Rescate Total
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <h2 className="text-xl font-bold text-[#33404f] mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#00e7ff]" /> Sobre Help Rescate
          </h2>
          <p className="text-gray-600 leading-relaxed text-sm">
            Brindamos un servicio integral que combina contención humana con respaldo profesional, a través de un equipo altamente calificado preparado para actuar en situaciones complejas, entregando tranquilidad y apoyo oportuno. Contamos con: 1) Orientación profesional 2) Atención telefónica especializada 3) Rescate móvil en casos que lo requieren 4) Equipamiento y personal de salud capacitado. Hoy estamos presentes en las regiones de Valparaíso, Metropolitana y Biobío, ofreciendo planes tanto para personas como para empresas que buscan protección y acompañamiento real en momentos difíciles. Porque cuando ocurre una urgencia, lo más importante es saber que no estás solo.
          </p>
        </div>
      </div>

      <ContactModal
        open={showContact}
        onClose={() => setShowContact(false)}
        partnerName="Help Rescate"
        partnerSlug="help-rescate"
        planInterest={planInterest}
      />
    </div>
  );
}
