import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Phone, Mail, MessageCircle, Lock, Filter, Send, DollarSign, CheckCircle, ChevronDown, ChevronUp, Shield, Star, User, Home, Heart, Brain, FileText, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import api from '@/lib/api';

const SERVICE_LABELS = {
  residencia: 'Residencia',
  cuidado_domicilio: 'Cuidado a Domicilio',
  salud_mental: 'Salud Mental',
  // Legacy support
  paseo: 'Residencia',
  cuidado: 'Cuidado',
  daycare: 'Cuidado a Domicilio'
};

const SERVICE_ICONS = {
  residencia: Home,
  cuidado_domicilio: Heart,
  salud_mental: Brain,
};

const URGENCY_LABELS = {
  inmediata: 'Urgente',
  dentro_1_mes: 'Dentro de 1 mes',
  dentro_3_meses: 'Dentro de 3 meses',
  explorando: 'Explorando'
};

const SPECIAL_NEEDS_LABELS = {
  demencia: 'Demencia / Alzheimer',
  movilidad_reducida: 'Movilidad reducida',
  oxigeno: 'Oxígeno dependiente',
  medicacion_constante: 'Medicación constante',
  diabetes: 'Diabetes',
  hipertension: 'Hipertensión',
  silla_ruedas: 'Silla de ruedas',
  cuidado_nocturno: 'Cuidado nocturno',
  alimentacion_especial: 'Alimentación especial',
  rehabilitacion: 'Rehabilitación',
  supervision_24h: 'Supervisión 24h',
  acompanamiento: 'Acompañamiento emocional',
};

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ProposalForm = ({ requestId, onSubmit, onCancel }) => {
  const [price, setPrice] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!price || parseInt(price) <= 0) { toast.error('Ingresa un precio válido'); return; }
    if (!message.trim()) { toast.error('Escribe un mensaje para la familia'); return; }
    setSubmitting(true);
    try {
      const res = await api.post('/proposals', {
        care_request_id: requestId,
        price: parseInt(price),
        message: message.trim(),
        available_dates: []
      });
      toast.success('Propuesta enviada exitosamente');
      onSubmit(res.data);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al enviar propuesta');
    } finally { setSubmitting(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 p-4 bg-cyan-50 rounded-xl border border-blue-200 space-y-3" data-testid={`proposal-form-${requestId}`}>
      <p className="text-sm font-medium text-blue-800">Enviar propuesta a la familia</p>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Precio mensual estimado (CLP) *</label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="Ej: 1500000" min="1000" className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00e7ff] focus:outline-none text-sm" data-testid="proposal-price-input" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Mensaje personalizado *</label>
        <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Hola! Nuestra residencia cuenta con los servicios que necesita. Tenemos experiencia en..." rows={3} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00e7ff] focus:outline-none text-sm resize-none" data-testid="proposal-message-input" />
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" size="sm" disabled={submitting} className="bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f]" data-testid="proposal-submit-btn">
          {submitting ? 'Enviando...' : <><Send className="w-3.5 h-3.5 mr-1" />Enviar Propuesta</>}
        </Button>
      </div>
    </form>
  );
};

const CareRequestsProvider = ({ hasSubscription = false }) => {
  const [requests, setRequests] = useState([]);
  const [sentProposals, setSentProposals] = useState({});
  const [loading, setLoading] = useState(true);
  const [serviceFilter, setServiceFilter] = useState('');
  const [comunaFilter, setComunaFilter] = useState('');
  const [expandedForm, setExpandedForm] = useState(null);

  useEffect(() => {
    loadRequests();
    if (hasSubscription) loadSentProposals();
  }, [serviceFilter, hasSubscription]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (serviceFilter && serviceFilter !== 'all') params.set('service_type', serviceFilter);
      if (comunaFilter) params.set('comuna', comunaFilter);
      const res = await api.get(`/care-requests?${params.toString()}`);
      setRequests(res.data);
    } catch (error) {
      if (error.response?.status === 403) {
        // Expected for non-subscribed or non-approved providers
      }
    } finally { setLoading(false); }
  };

  const loadSentProposals = async () => {
    try {
      const res = await api.get('/proposals/my-sent');
      const map = {};
      res.data.forEach(p => { map[p.care_request_id] = p; });
      setSentProposals(map);
    } catch {}
  };

  const getPhotoUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_URL}${path}`;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadRequests();
  };

  const handleProposalSent = (proposal) => {
    setSentProposals(prev => ({ ...prev, [proposal.care_request_id]: proposal }));
    setExpandedForm(null);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border mb-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="h-32 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border mb-8" data-testid="care-requests-provider-section">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-xl flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#00e7ff]" />
          Familias Buscando Servicio
          <span className="text-sm font-normal text-gray-500">({requests.length})</span>
        </h2>
      </div>

      {!hasSubscription && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Suscríbete para enviar propuestas y ver datos de contacto</p>
              <p className="text-xs text-yellow-600">Los proveedores Premium pueden contactar directamente a las familias</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <Select value={serviceFilter} onValueChange={setServiceFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tipo de servicio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="residencia">Residencia</SelectItem>
            <SelectItem value="cuidado_domicilio">Cuidado a Domicilio</SelectItem>
            <SelectItem value="salud_mental">Salud Mental</SelectItem>
          </SelectContent>
        </Select>
        <input type="text" value={comunaFilter} onChange={e => setComunaFilter(e.target.value)} placeholder="Filtrar por comuna" className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00e7ff] focus:outline-none text-sm" data-testid="provider-comuna-filter" />
        <Button type="submit" variant="outline" size="sm"><Filter className="w-4 h-4" /></Button>
      </form>

      {requests.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500">No hay solicitudes de servicio en este momento</p>
          <p className="text-xs text-gray-400 mt-1">Las solicitudes de familias aparecerán aquí cuando las publiquen</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => {
            const existingProposal = sentProposals[req.request_id];
            const SvcIcon = SERVICE_ICONS[req.service_type] || Home;
            const patientName = req.patient_name || req.pet_name || 'Paciente';
            const patientAge = req.patient_age;

            return (
              <div key={req.request_id} className="p-4 rounded-xl border bg-gray-50 hover:bg-gray-100 transition-colors" data-testid={`provider-care-request-${req.request_id}`}>
                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="w-14 h-14 rounded-xl bg-[#00e7ff]/10 flex items-center justify-center flex-shrink-0">
                    <SvcIcon className="w-7 h-7 text-[#00e7ff]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Tags */}
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="px-2 py-0.5 text-xs font-medium bg-cyan-100 text-[#33404f] rounded-full">
                        {SERVICE_LABELS[req.service_type] || req.service_type}
                      </span>
                      {req.urgency && req.urgency !== 'explorando' && (
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${req.urgency === 'inmediata' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                          {URGENCY_LABELS[req.urgency] || req.urgency}
                        </span>
                      )}
                      {req.room_type && req.room_type !== 'sin_preferencia' && (
                        <span className="px-2 py-0.5 text-xs bg-gray-200 text-gray-600 rounded-full">
                          Hab. {req.room_type === 'individual' ? 'Individual' : 'Compartida'}
                        </span>
                      )}
                      {req.proposal_count > 0 && (
                        <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded-full">
                          {req.proposal_count} propuesta{req.proposal_count > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {/* Patient info */}
                    <p className="font-bold text-[#33404f]">
                      {patientName} {patientAge ? <span className="text-gray-500 font-normal text-sm">({patientAge} años)</span> : ''}
                    </p>
                    <p className="text-sm text-gray-700 mb-2 line-clamp-2">{req.description}</p>

                    {/* Special needs */}
                    {req.special_needs?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {req.special_needs.map(n => (
                          <span key={n} className="px-2 py-0.5 text-[10px] bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                            {SPECIAL_NEEDS_LABELS[n] || n}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Meta info */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{req.comuna}{req.region ? `, ${req.region}` : ''}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(req.created_at).toLocaleDateString('es-CL')}</span>
                      {(req.budget_min > 0 || req.budget_max > 0) && (
                        <span className="flex items-center gap-1 font-medium text-green-700">
                          <DollarSign className="w-3 h-3" />
                          {req.budget_min > 0 && req.budget_max > 0 ? `$${req.budget_min.toLocaleString('es-CL')} - $${req.budget_max.toLocaleString('es-CL')}` :
                           req.budget_max > 0 ? `Hasta $${req.budget_max.toLocaleString('es-CL')}` : `Desde $${req.budget_min.toLocaleString('es-CL')}`}
                        </span>
                      )}
                    </div>

                    {/* Client info + actions */}
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-3">
                          {req.client_picture && !req.contact_hidden ? (
                            <img src={getPhotoUrl(req.client_picture)} alt={req.client_name} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-500">
                              {req.client_name?.[0] || 'C'}
                            </div>
                          )}
                          <span className="font-medium text-sm">
                            {req.client_name}
                            {req.contact_hidden && <span className="text-gray-400 ml-1">(nombre parcial)</span>}
                          </span>
                        </div>

                        {req.contact_hidden ? (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Suscríbete para ver contacto
                          </span>
                        ) : (
                          <div className="flex gap-2 flex-wrap">
                            {req.client_phone && (
                              <a href={`tel:${req.client_phone}`}>
                                <Button size="sm" variant="outline" className="text-xs"><Phone className="w-3 h-3 mr-1" />Llamar</Button>
                              </a>
                            )}
                            <Link to={`/chat?user=${req.client_id}`}>
                              <Button size="sm" variant="outline" className="text-xs"><MessageCircle className="w-3 h-3 mr-1" />Chat</Button>
                            </Link>
                            {existingProposal ? (
                              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-100 text-green-700" data-testid={`proposal-sent-${req.request_id}`}>
                                <CheckCircle className="w-3.5 h-3.5" />
                                Propuesta enviada (${existingProposal.price?.toLocaleString('es-CL')})
                                {existingProposal.status === 'accepted' && <span className="ml-1 text-green-800 font-bold">Aceptada</span>}
                                {existingProposal.status === 'rejected' && <span className="ml-1 text-red-600">Rechazada</span>}
                              </div>
                            ) : (
                              <Button size="sm" className="text-xs bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f]" onClick={() => setExpandedForm(expandedForm === req.request_id ? null : req.request_id)} data-testid={`send-proposal-btn-${req.request_id}`}>
                                <Send className="w-3 h-3 mr-1" />Enviar Propuesta
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Proposal form */}
                    {expandedForm === req.request_id && !existingProposal && (
                      <ProposalForm requestId={req.request_id} onSubmit={handleProposalSent} onCancel={() => setExpandedForm(null)} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CareRequestsProvider;
