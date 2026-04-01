import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Tag, X, Copy, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';

const SENIORCLUB_LOGO = "https://customer-assets.emergentagent.com/job_316c0f31-5a86-43b3-bcc3-d5c9be92d49a/artifacts/y9u1s2ae_seniorclub.svg";

function RevealCodeModal({ open, onClose, convenio }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [sending, setSending] = useState(false);
  const [revealed, setRevealed] = useState(false);

  if (!open || !convenio) return null;

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
        partner_slug: convenio.slug,
        contact_type: 'discount_code',
        plan_interest: convenio.discount_code,
      });
      setRevealed(true);
    } catch {
      toast.error('Error al enviar. Intenta de nuevo.');
    } finally {
      setSending(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(convenio.discount_code);
    toast.success('Código copiado');
  };

  const handleClose = () => {
    setRevealed(false);
    setForm({ name: '', email: '', phone: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-testid="reveal-code-modal">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
        <button onClick={handleClose} className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full">
          <X className="w-5 h-5 text-gray-400" />
        </button>

        {revealed ? (
          <div className="text-center py-4">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-[#33404f] mb-2">Tu código de descuento</h3>
            <p className="text-sm text-gray-500 mb-4">Usa este código en {convenio.name}</p>
            <div className="bg-gray-50 border-2 border-dashed border-[#00e7ff] rounded-xl p-4 flex items-center justify-center gap-3 mb-4">
              <span className="text-2xl font-bold text-[#33404f] tracking-widest" data-testid="revealed-code">{convenio.discount_code}</span>
              <button onClick={copyCode} className="p-2 hover:bg-gray-200 rounded-lg transition-colors" data-testid="copy-code-btn">
                <Copy className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <Button onClick={handleClose} className="bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f] font-bold">
              Cerrar
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-1">
              <Tag className="w-5 h-5 text-[#00e7ff]" />
              <h3 className="text-xl font-bold text-[#33404f]">Obtener código de descuento</h3>
            </div>
            <p className="text-sm text-gray-500 mb-5">Déjanos tus datos para revelar el código de {convenio.name}</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#33404f] mb-1">Nombre</label>
                <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00e7ff] transition-colors"
                  placeholder="Tu nombre completo" data-testid="code-lead-name" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#33404f] mb-1">Correo electrónico</label>
                <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00e7ff] transition-colors"
                  placeholder="tu@correo.cl" data-testid="code-lead-email" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#33404f] mb-1">Teléfono</label>
                <div className="flex">
                  <span className="bg-gray-100 border-2 border-r-0 border-gray-200 rounded-l-xl px-3 py-3 text-sm text-gray-500 font-medium">+56</span>
                  <input type="tel" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    className="flex-1 border-2 border-gray-200 rounded-r-xl px-4 py-3 text-sm focus:outline-none focus:border-[#00e7ff] transition-colors"
                    placeholder="9 1234 5678" data-testid="code-lead-phone" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={handleClose} className="flex-1">Cancelar</Button>
                <Button type="submit" disabled={sending}
                  className="flex-1 bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f] font-bold"
                  data-testid="code-lead-submit">
                  {sending ? 'Enviando...' : 'Revelar código'}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
export default function SeniorClubPage() {
  const [convenios, setConvenios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [codeConvenio, setCodeConvenio] = useState(null);

  useEffect(() => {
    api.get('/partners/convenios').then(r => setConvenios(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#33404f]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <img src={SENIORCLUB_LOGO} alt="SeniorClub" className="h-20 mx-auto mb-6" style={{ filter: 'brightness(0) invert(1)' }} />
          <p className="text-gray-300 text-lg max-w-xl mx-auto">
            Convenios exclusivos para el bienestar de nuestros mayores. Accede a descuentos y servicios preferenciales con nuestros aliados.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-[#33404f] mb-8">Nuestros Convenios</h2>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin w-10 h-10 border-4 border-[#00e7ff] border-t-transparent rounded-full" /></div>
        ) : convenios.length === 0 ? (
          <p className="text-gray-500 text-center py-12">Próximamente nuevos convenios</p>
        ) : (
          <div className="space-y-6">
            {convenios.map(c => (
              <div key={c.convenio_id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow" data-testid={`convenio-card-${c.slug}`}>
                <div className="flex flex-col lg:flex-row">
                  <div className="lg:w-56 bg-gray-50 flex items-center justify-center p-8 lg:border-r border-b lg:border-b-0 border-gray-100">
                    <img src={c.logo} alt={c.name} className="w-32" />
                  </div>
                  <div className="flex-1 p-6 lg:p-8">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-2xl font-bold text-[#33404f]">{c.name}</h3>
                          {c.featured && <span className="bg-[#00e7ff] text-[#33404f] text-xs font-bold px-3 py-1 rounded-full">Destacado</span>}
                        </div>
                        <p className="text-sm text-gray-500 mt-1 max-w-xl">{c.description}</p>
                      </div>
                    </div>
                    {c.location && (
                      <div className="flex items-center gap-1.5 text-sm text-gray-400 mt-2 mb-4">
                        <MapPin className="w-3.5 h-3.5 text-[#00e7ff]" /> {c.location}
                      </div>
                    )}
                    {/* Plans - only show if NO discount code */}
                    {!c.discount_code && c.plans && c.plans.length > 0 && (
                      <div className="grid sm:grid-cols-2 gap-4 mb-5">
                        {c.plans.map((p, i) => (
                          <div key={i} className="border border-gray-200 rounded-xl p-4 hover:border-[#00e7ff] transition-colors">
                            <p className="font-bold text-[#33404f] text-sm">{p.name}</p>
                            <p className="text-xs text-gray-400 mb-2">{p.category}</p>
                            <p className="font-bold text-lg text-[#33404f]">Desde {p.price}<span className="text-xs font-normal text-gray-400"> /mes</span></p>
                            {p.uf && <p className="text-[11px] text-gray-400">Cobro en {p.currency || 'UF'}, Desde {p.uf}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      {c.discount_code ? (
                        c.website ? (
                          <a href={c.website} target="_blank" rel="noopener noreferrer">
                            <Button className="bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f] font-bold" data-testid={`ver-web-${c.slug}`}>
                              Visitar Sitio Web <ArrowRight className="w-4 h-4 ml-1" />
                            </Button>
                          </a>
                        ) : null
                      ) : (
                        <Link to={`/convenio/${c.slug}`}>
                          <Button className="bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f] font-bold" data-testid={`ver-convenio-${c.slug}`}>
                            Ver Detalle <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      )}
                      {c.discount_code && (
                        <Button onClick={() => setCodeConvenio(c)} variant="outline" className="border-[#00e7ff] text-[#33404f] font-bold hover:bg-[#00e7ff]/10" data-testid={`get-code-${c.slug}`}>
                          <Tag className="w-4 h-4 mr-1" /> Obtener Código
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <RevealCodeModal open={!!codeConvenio} onClose={() => setCodeConvenio(null)} convenio={codeConvenio} />
    </div>
  );
}
