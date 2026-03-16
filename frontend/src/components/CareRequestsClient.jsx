import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, MapPin, Clock, Trash2, Pause, Play, Send, CheckCircle, XCircle, Star, Shield, DollarSign, MessageCircle, ChevronDown, ChevronUp, Heart, Home, Brain, User, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import api from '@/lib/api';

const SERVICE_LABELS = {
  residencia: 'Residencia',
  cuidado_domicilio: 'Cuidado a Domicilio',
  salud_mental: 'Salud Mental'
};

const URGENCY_LABELS = {
  inmediata: 'Inmediata',
  dentro_1_mes: 'Dentro de 1 mes',
  dentro_3_meses: 'Dentro de 3 meses',
  explorando: 'Estoy explorando opciones'
};

const SPECIAL_NEEDS_OPTIONS = [
  { key: 'demencia', label: 'Demencia / Alzheimer' },
  { key: 'movilidad_reducida', label: 'Movilidad reducida' },
  { key: 'oxigeno', label: 'Oxígeno dependiente' },
  { key: 'medicacion_constante', label: 'Medicación constante' },
  { key: 'diabetes', label: 'Diabetes' },
  { key: 'hipertension', label: 'Hipertensión' },
  { key: 'silla_ruedas', label: 'Silla de ruedas' },
  { key: 'cuidado_nocturno', label: 'Cuidado nocturno' },
  { key: 'alimentacion_especial', label: 'Alimentación especial' },
  { key: 'rehabilitacion', label: 'Rehabilitación' },
  { key: 'supervision_24h', label: 'Supervisión 24 horas' },
  { key: 'acompanamiento', label: 'Acompañamiento emocional' },
];

const API_URL = process.env.REACT_APP_BACKEND_URL;

const getPhotoUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
};

const ProposalCard = ({ proposal, onRespond }) => {
  const [responding, setResponding] = useState(false);
  const handleRespond = async (status) => {
    setResponding(true);
    try {
      await api.put(`/proposals/${proposal.proposal_id}/respond`, { status });
      toast.success(status === 'accepted' ? 'Propuesta aceptada!' : 'Propuesta rechazada.');
      onRespond(proposal.proposal_id, status);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al responder');
    } finally { setResponding(false); }
  };

  const isPending = proposal.status === 'pending';
  const isAccepted = proposal.status === 'accepted';
  const isRejected = proposal.status === 'rejected';

  return (
    <div className={`p-4 rounded-xl border ${isAccepted ? 'bg-green-50 border-green-300' : isRejected ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-white border-blue-200'}`} data-testid={`proposal-card-${proposal.proposal_id}`}>
      <div className="flex gap-3">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
          {proposal.provider_photo ? (
            <img src={getPhotoUrl(proposal.provider_photo)} alt={proposal.provider_business_name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-lg">{proposal.provider_business_name?.[0] || 'R'}</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Link to={`/provider/${proposal.provider_provider_id}`} className="font-bold text-[#33404f] hover:text-[#00e7ff] transition-colors">{proposal.provider_business_name}</Link>
            {proposal.provider_verified && <Shield className="w-4 h-4 text-green-500" />}
            {proposal.provider_rating > 0 && <span className="flex items-center gap-0.5 text-xs text-yellow-600"><Star className="w-3 h-3 fill-yellow-400" />{proposal.provider_rating.toFixed(1)}</span>}
          </div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xl font-bold text-[#00e7ff]" data-testid="proposal-price">${proposal.price?.toLocaleString('es-CL')}</span>
            <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${isAccepted ? 'bg-green-100 text-green-700' : isRejected ? 'bg-gray-200 text-gray-600' : 'bg-cyan-100 text-blue-700'}`}>
              {isAccepted ? 'Aceptada' : isRejected ? 'Rechazada' : 'Pendiente'}
            </span>
          </div>
          <p className="text-sm text-gray-700 mb-3">{proposal.message}</p>
          <p className="text-xs text-gray-400 mb-3">Recibida {new Date(proposal.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
          {isPending && (
            <div className="flex gap-2">
              <Button size="sm" disabled={responding} className="bg-green-600 hover:bg-green-700 text-xs" onClick={() => handleRespond('accepted')} data-testid={`accept-proposal-${proposal.proposal_id}`}><CheckCircle className="w-3.5 h-3.5 mr-1" />Aceptar</Button>
              <Button size="sm" variant="outline" disabled={responding} className="text-xs text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleRespond('rejected')} data-testid={`reject-proposal-${proposal.proposal_id}`}><XCircle className="w-3.5 h-3.5 mr-1" />Rechazar</Button>
            </div>
          )}
          {isAccepted && (
            <div className="flex items-center gap-2 mt-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700 font-medium">Chat desbloqueado</span>
              <Link to="/chat" className="ml-auto"><Button size="sm" className="bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f] text-xs"><MessageCircle className="w-3.5 h-3.5 mr-1" />Ir al Chat</Button></Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CareRequestsClient = () => {
  const [requests, setRequests] = useState([]);
  const [proposals, setProposals] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedProposals, setExpandedProposals] = useState({});
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    service_type: 'residencia',
    patient_name: '',
    patient_age: '',
    patient_gender: '',
    relationship: '',
    room_type: '',
    special_needs: [],
    urgency: 'explorando',
    budget_min: '',
    budget_max: '',
    comuna: '',
    region: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    try {
      const [reqRes, propRes] = await Promise.all([
        api.get('/care-requests/my-requests'),
        api.get('/proposals/received').catch(() => ({ data: [] }))
      ]);
      setRequests(reqRes.data);
      const grouped = {};
      propRes.data.forEach(p => {
        if (!grouped[p.care_request_id]) grouped[p.care_request_id] = [];
        grouped[p.care_request_id].push(p);
      });
      setProposals(grouped);
    } catch (error) { console.error('Error loading:', error); }
    finally { setLoading(false); }
  };

  const toggleNeed = (key) => {
    setFormData(prev => ({
      ...prev,
      special_needs: prev.special_needs.includes(key) ? prev.special_needs.filter(n => n !== key) : [...prev.special_needs, key]
    }));
  };

  const handleSubmit = async () => {
    if (!formData.patient_name.trim()) { toast.error('Ingresa el nombre del paciente'); setStep(1); return; }
    if (!formData.comuna.trim()) { toast.error('Indica la comuna'); setStep(2); return; }
    if (!formData.description.trim()) { toast.error('Describe lo que necesitas'); setStep(3); return; }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        patient_age: formData.patient_age ? parseInt(formData.patient_age) : null,
        budget_min: formData.budget_min ? parseInt(formData.budget_min) : 0,
        budget_max: formData.budget_max ? parseInt(formData.budget_max) : 0,
      };
      const res = await api.post('/care-requests', payload);
      setRequests(prev => [res.data, ...prev]);
      setShowForm(false);
      setStep(1);
      setFormData({ service_type: 'residencia', patient_name: '', patient_age: '', patient_gender: '', relationship: '', room_type: '', special_needs: [], urgency: 'explorando', budget_min: '', budget_max: '', comuna: '', region: '', description: '' });
      toast.success('Solicitud creada. Las residencias suscritas podrán verla y contactarte.');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al crear solicitud');
    } finally { setSubmitting(false); }
  };

  const toggleStatus = async (requestId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      await api.put(`/care-requests/${requestId}`, { status: newStatus });
      setRequests(prev => prev.map(r => r.request_id === requestId ? { ...r, status: newStatus } : r));
      toast.success(newStatus === 'active' ? 'Solicitud activada' : 'Solicitud pausada');
    } catch { toast.error('Error al actualizar'); }
  };

  const deleteRequest = async (requestId) => {
    if (!confirm('¿Eliminar esta solicitud?')) return;
    try {
      await api.delete(`/care-requests/${requestId}`);
      setRequests(prev => prev.filter(r => r.request_id !== requestId));
      toast.success('Solicitud eliminada');
    } catch { toast.error('Error al eliminar'); }
  };

  const handleProposalResponse = (proposalId, status) => {
    setProposals(prev => {
      const updated = { ...prev };
      for (const reqId in updated) {
        updated[reqId] = updated[reqId].map(p => {
          if (p.proposal_id === proposalId) return { ...p, status };
          if (status === 'accepted' && p.status === 'pending') return { ...p, status: 'rejected' };
          return p;
        });
      }
      return updated;
    });
    if (status === 'accepted') {
      setRequests(prev => prev.map(r => {
        const reqProposals = proposals[r.request_id] || [];
        const accepted = reqProposals.find(p => p.proposal_id === proposalId);
        if (accepted) return { ...r, status: 'completed' };
        return r;
      }));
    }
  };

  const toggleProposals = (requestId) => {
    setExpandedProposals(prev => ({ ...prev, [requestId]: !prev[requestId] }));
  };

  if (loading) {
    return <div className="animate-pulse space-y-4"><div className="h-6 bg-gray-200 rounded w-1/3" /><div className="h-20 bg-gray-100 rounded" /></div>;
  }

  const renderForm = () => (
    <div className="mb-6 p-5 bg-gray-50 rounded-xl border-2 border-[#00e7ff]/20" data-testid="care-request-form">
      <p className="text-sm text-gray-600 mb-4">Completa los datos para que las residencias conozcan tus necesidades y puedan enviarte propuestas.</p>

      {/* Step indicators */}
      <div className="flex gap-1 mb-5">
        {[{ n: 1, label: 'Paciente' }, { n: 2, label: 'Ubicación' }, { n: 3, label: 'Detalles' }].map(s => (
          <button key={s.n} onClick={() => setStep(s.n)} className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${step === s.n ? 'bg-[#00e7ff] text-[#33404f]' : step > s.n ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`} data-testid={`form-step-${s.n}`}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Step 1: Patient Info */}
      {step === 1 && (
        <div className="space-y-4" data-testid="form-step-1-content">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo de Servicio *</label>
            <Select value={formData.service_type} onValueChange={v => setFormData(prev => ({ ...prev, service_type: v }))}>
              <SelectTrigger data-testid="select-service-type"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="residencia"><div className="flex items-center gap-2"><Home className="w-4 h-4" /> Residencia (estadía permanente)</div></SelectItem>
                <SelectItem value="cuidado_domicilio"><div className="flex items-center gap-2"><Heart className="w-4 h-4" /> Cuidado a Domicilio</div></SelectItem>
                <SelectItem value="salud_mental"><div className="flex items-center gap-2"><Brain className="w-4 h-4" /> Salud Mental</div></SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del Paciente *</label>
              <Input value={formData.patient_name} onChange={e => setFormData(prev => ({ ...prev, patient_name: e.target.value }))} placeholder="Ej: María González" data-testid="input-patient-name" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Edad</label>
              <Input type="number" value={formData.patient_age} onChange={e => setFormData(prev => ({ ...prev, patient_age: e.target.value }))} placeholder="Ej: 78" data-testid="input-patient-age" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Género</label>
              <Select value={formData.patient_gender} onValueChange={v => setFormData(prev => ({ ...prev, patient_gender: v }))}>
                <SelectTrigger data-testid="select-gender"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="femenino">Femenino</SelectItem>
                  <SelectItem value="masculino">Masculino</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Parentesco</label>
              <Select value={formData.relationship} onValueChange={v => setFormData(prev => ({ ...prev, relationship: v }))}>
                <SelectTrigger data-testid="select-relationship"><SelectValue placeholder="Relación con el paciente" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hijo">Hijo/a</SelectItem>
                  <SelectItem value="nieto">Nieto/a</SelectItem>
                  <SelectItem value="conyuge">Cónyuge</SelectItem>
                  <SelectItem value="hermano">Hermano/a</SelectItem>
                  <SelectItem value="sobrino">Sobrino/a</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {formData.service_type === 'residencia' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo de Habitación</label>
              <Select value={formData.room_type} onValueChange={v => setFormData(prev => ({ ...prev, room_type: v }))}>
                <SelectTrigger data-testid="select-room-type"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Habitación Individual</SelectItem>
                  <SelectItem value="compartida">Habitación Compartida</SelectItem>
                  <SelectItem value="sin_preferencia">Sin preferencia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <Button onClick={() => setStep(2)} className="w-full bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f] font-bold" data-testid="form-next-1">Siguiente</Button>
        </div>
      )}

      {/* Step 2: Location & Budget */}
      {step === 2 && (
        <div className="space-y-4" data-testid="form-step-2-content">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Comuna *</label>
              <Input value={formData.comuna} onChange={e => setFormData(prev => ({ ...prev, comuna: e.target.value }))} placeholder="Ej: Providencia" data-testid="input-comuna" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Región</label>
              <Input value={formData.region} onChange={e => setFormData(prev => ({ ...prev, region: e.target.value }))} placeholder="Ej: Región Metropolitana" data-testid="input-region" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Urgencia</label>
            <Select value={formData.urgency} onValueChange={v => setFormData(prev => ({ ...prev, urgency: v }))}>
              <SelectTrigger data-testid="select-urgency"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="inmediata">Lo necesito ahora</SelectItem>
                <SelectItem value="dentro_1_mes">Dentro de 1 mes</SelectItem>
                <SelectItem value="dentro_3_meses">Dentro de 3 meses</SelectItem>
                <SelectItem value="explorando">Estoy explorando opciones</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Presupuesto Mensual (CLP)</label>
            <div className="grid grid-cols-2 gap-3">
              <Input type="number" value={formData.budget_min} onChange={e => setFormData(prev => ({ ...prev, budget_min: e.target.value }))} placeholder="Mínimo" data-testid="input-budget-min" />
              <Input type="number" value={formData.budget_max} onChange={e => setFormData(prev => ({ ...prev, budget_max: e.target.value }))} placeholder="Máximo" data-testid="input-budget-max" />
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1" data-testid="form-prev-2">Anterior</Button>
            <Button onClick={() => setStep(3)} className="flex-1 bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f] font-bold" data-testid="form-next-2">Siguiente</Button>
          </div>
        </div>
      )}

      {/* Step 3: Needs & Description */}
      {step === 3 && (
        <div className="space-y-4" data-testid="form-step-3-content">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Necesidades Especiales</label>
            <div className="flex flex-wrap gap-2">
              {SPECIAL_NEEDS_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => toggleNeed(opt.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    formData.special_needs.includes(opt.key)
                      ? 'bg-[#00e7ff] text-[#33404f] shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  data-testid={`need-${opt.key}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {formData.special_needs.length > 0 && <p className="text-xs text-green-600 mt-1">{formData.special_needs.length} seleccionada(s)</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Descripción de lo que necesitas *</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe la situación: ¿Qué tipo de cuidado necesita? ¿Condiciones médicas? ¿Horarios? ¿Algo que las residencias deban saber?"
              rows={4}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00e7ff] focus:outline-none resize-none text-sm"
              data-testid="input-description"
            />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep(2)} className="flex-1" data-testid="form-prev-3">Anterior</Button>
            <Button onClick={handleSubmit} disabled={submitting} className="flex-1 bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f] font-bold" data-testid="submit-care-request">
              {submitting ? 'Enviando...' : 'Publicar Solicitud'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div data-testid="care-requests-section">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-xl flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#00e7ff]" />
          Solicitudes de Servicio
        </h2>
        <Button
          onClick={() => { setShowForm(!showForm); setStep(1); }}
          size="sm"
          className={showForm ? 'bg-gray-500' : 'bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f]'}
          data-testid="new-care-request-btn"
        >
          {showForm ? 'Cancelar' : <><Plus className="w-4 h-4 mr-1" /> Nueva Solicitud</>}
        </Button>
      </div>

      {showForm && renderForm()}

      {requests.length === 0 && !showForm ? (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 mb-2">No tienes solicitudes de servicio</p>
          <p className="text-sm text-gray-400">Crea una solicitud describiendo lo que necesitas y las residencias podrán contactarte</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => {
            const reqProposals = proposals[req.request_id] || [];
            const pendingCount = reqProposals.filter(p => p.status === 'pending').length;
            const isExpanded = expandedProposals[req.request_id];

            return (
              <div key={req.request_id} data-testid={`care-request-${req.request_id}`}>
                <div className={`p-4 rounded-xl border ${req.status === 'active' ? 'bg-green-50 border-green-200' : req.status === 'completed' ? 'bg-cyan-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${req.status === 'active' ? 'bg-green-100 text-green-700' : req.status === 'completed' ? 'bg-cyan-100 text-blue-700' : 'bg-gray-200 text-gray-600'}`}>
                          {req.status === 'active' ? 'Activa' : req.status === 'completed' ? 'Completada' : 'Pausada'}
                        </span>
                        <span className="px-2 py-0.5 text-xs font-medium bg-cyan-100 text-[#33404f] rounded-full">
                          {SERVICE_LABELS[req.service_type] || req.service_type}
                        </span>
                        {req.urgency && req.urgency !== 'explorando' && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded-full">
                            {URGENCY_LABELS[req.urgency]}
                          </span>
                        )}
                      </div>
                      <p className="font-medium text-[#33404f]">
                        {req.patient_name || req.pet_name || 'Solicitud'} {req.patient_age ? `(${req.patient_age} años)` : ''}
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-2">{req.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{req.comuna}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(req.created_at).toLocaleDateString('es-CL')}</span>
                        {(req.budget_min > 0 || req.budget_max > 0) && (
                          <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />
                            {req.budget_min > 0 && req.budget_max > 0 ? `$${req.budget_min.toLocaleString('es-CL')} - $${req.budget_max.toLocaleString('es-CL')}` :
                             req.budget_max > 0 ? `Hasta $${req.budget_max.toLocaleString('es-CL')}` : `Desde $${req.budget_min.toLocaleString('es-CL')}`}
                          </span>
                        )}
                        {req.room_type && <span className="flex items-center gap-1"><Home className="w-3 h-3" />{req.room_type === 'individual' ? 'Individual' : req.room_type === 'compartida' ? 'Compartida' : ''}</span>}
                      </div>
                      {req.special_needs?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {req.special_needs.map(n => (
                            <span key={n} className="px-2 py-0.5 text-[10px] bg-gray-100 text-gray-600 rounded-full">{SPECIAL_NEEDS_OPTIONS.find(o => o.key === n)?.label || n}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {req.status !== 'completed' && (
                        <>
                          <button onClick={() => toggleStatus(req.request_id, req.status)} className={`p-2 rounded-lg transition-colors ${req.status === 'active' ? 'text-orange-600 hover:bg-orange-100' : 'text-green-600 hover:bg-green-100'}`} title={req.status === 'active' ? 'Pausar' : 'Activar'}>
                            {req.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                          <button onClick={() => deleteRequest(req.request_id)} className="p-2 rounded-lg text-red-600 hover:bg-red-100 transition-colors" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                        </>
                      )}
                    </div>
                  </div>
                  {reqProposals.length > 0 && (
                    <button onClick={() => toggleProposals(req.request_id)} className="mt-3 w-full flex items-center justify-between p-3 bg-white/60 rounded-lg border border-blue-200 hover:bg-white transition-colors" data-testid={`toggle-proposals-${req.request_id}`}>
                      <span className="flex items-center gap-2 text-sm font-medium text-blue-800">
                        <Send className="w-4 h-4" />
                        {reqProposals.length} propuesta{reqProposals.length > 1 ? 's' : ''} recibida{reqProposals.length > 1 ? 's' : ''}
                        {pendingCount > 0 && <span className="px-2 py-0.5 bg-[#00e7ff] text-[#33404f] text-xs rounded-full">{pendingCount} nueva{pendingCount > 1 ? 's' : ''}</span>}
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4 text-blue-600" />}
                    </button>
                  )}
                </div>
                {isExpanded && reqProposals.length > 0 && (
                  <div className="mt-2 ml-4 space-y-3" data-testid={`proposals-list-${req.request_id}`}>
                    {reqProposals.map(proposal => <ProposalCard key={proposal.proposal_id} proposal={proposal} onRespond={handleProposalResponse} />)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CareRequestsClient;
