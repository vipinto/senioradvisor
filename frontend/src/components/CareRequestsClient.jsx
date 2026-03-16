import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, MapPin, Dog, Clock, Trash2, Pause, Play, Send, CheckCircle, XCircle, Star, Shield, DollarSign, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import api from '@/lib/api';

const SERVICE_LABELS = {
  paseo: 'Residencia',
  cuidado: 'Cuidado',
  daycare: 'Cuidado a Domicilio'
};

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
      toast.success(status === 'accepted' ? 'Propuesta aceptada! El servicio sera notificado.' : 'Propuesta rechazada.');
      onRespond(proposal.proposal_id, status);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al responder');
    } finally {
      setResponding(false);
    }
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
            <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-lg">
              {proposal.provider_business_name?.[0] || 'C'}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Link to={`/provider/${proposal.provider_provider_id}`} className="font-bold text-[#33404f] hover:text-[#00e7ff] transition-colors">
              {proposal.provider_business_name}
            </Link>
            {proposal.provider_verified && <Shield className="w-4 h-4 text-green-500" />}
            {proposal.provider_rating && (
              <span className="flex items-center gap-0.5 text-xs text-yellow-600">
                <Star className="w-3 h-3 fill-yellow-400" />{proposal.provider_rating.toFixed(1)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mb-2">
            <span className="text-xl font-bold text-[#00e7ff] flex items-center" data-testid="proposal-price">
              ${proposal.price?.toLocaleString('es-CL')}
            </span>
            <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
              isAccepted ? 'bg-green-100 text-green-700' :
              isRejected ? 'bg-gray-200 text-gray-600' :
              'bg-cyan-100 text-blue-700'
            }`}>
              {isAccepted ? 'Aceptada' : isRejected ? 'Rechazada' : 'Pendiente'}
            </span>
          </div>

          <p className="text-sm text-gray-700 mb-3">{proposal.message}</p>

          <p className="text-xs text-gray-400 mb-3">
            Recibida {new Date(proposal.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </p>

          {isPending && (
            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={responding}
                className="bg-green-600 hover:bg-green-700 text-xs"
                onClick={() => handleRespond('accepted')}
                data-testid={`accept-proposal-${proposal.proposal_id}`}
              >
                <CheckCircle className="w-3.5 h-3.5 mr-1" />Aceptar
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={responding}
                className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => handleRespond('rejected')}
                data-testid={`reject-proposal-${proposal.proposal_id}`}
              >
                <XCircle className="w-3.5 h-3.5 mr-1" />Rechazar
              </Button>
            </div>
          )}
          {isAccepted && (
            <div className="flex items-center gap-2 mt-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700 font-medium">Chat desbloqueado</span>
              <Link to="/chat" className="ml-auto">
                <Button size="sm" className="bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f] text-xs">
                  <MessageCircle className="w-3.5 h-3.5 mr-1" />Ir al Chat
                </Button>
              </Link>
              <Link to={`/provider/${proposal.provider_provider_id}`}>
                <Button size="sm" variant="outline" className="text-xs">Ver Perfil</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CareRequestsClient = ({ pets = [] }) => {
  const [requests, setRequests] = useState([]);
  const [proposals, setProposals] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedProposals, setExpandedProposals] = useState({});
  const [formData, setFormData] = useState({
    pet_id: '',
    service_type: 'paseo',
    description: '',
    preferred_dates: [],
    comuna: '',
    flexible_dates: false
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [reqRes, propRes] = await Promise.all([
        api.get('/care-requests/my-requests'),
        api.get('/proposals/received').catch(() => ({ data: [] }))
      ]);
      setRequests(reqRes.data);
      
      // Group proposals by care_request_id
      const grouped = {};
      propRes.data.forEach(p => {
        if (!grouped[p.care_request_id]) grouped[p.care_request_id] = [];
        grouped[p.care_request_id].push(p);
      });
      setProposals(grouped);
    } catch (error) {
      console.error('Error loading:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.pet_id) { toast.error('Selecciona una mascota'); return; }
    if (!formData.description.trim()) { toast.error('Describe lo que necesitas'); return; }
    if (!formData.comuna.trim()) { toast.error('Indica tu comuna'); return; }

    setSubmitting(true);
    try {
      const res = await api.post('/care-requests', formData);
      setRequests(prev => [res.data, ...prev]);
      setShowForm(false);
      setFormData({ pet_id: '', service_type: 'paseo', description: '', preferred_dates: [], comuna: '', flexible_dates: false });
      toast.success('Solicitud creada. Los proveedores suscritos podran verla y enviarte propuestas.');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al crear solicitud');
    } finally {
      setSubmitting(false);
    }
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
    if (!confirm('Eliminar esta solicitud?')) return;
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
      // Mark request as completed locally
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
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border mb-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border mb-8" data-testid="care-requests-section">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-xl flex items-center gap-2">
          <Dog className="w-5 h-5 text-[#00e7ff]" />
          Solicitudes de Cuidado
        </h2>
        <Button 
          onClick={() => setShowForm(!showForm)} size="sm" 
          className={showForm ? 'bg-gray-500' : 'bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f]'}
          data-testid="new-care-request-btn"
        >
          {showForm ? 'Cancelar' : <><Plus className="w-4 h-4 mr-1" /> Nueva</>}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-xl space-y-4" data-testid="care-request-form">
          <p className="text-sm text-gray-600 mb-2">
            Crea una solicitud y los proveedores suscritos podran enviarte propuestas con presupuesto y mensaje.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Servicio *</label>
              <Select value={formData.pet_id} onValueChange={v => setFormData(prev => ({ ...prev, pet_id: v }))}>
                <SelectTrigger data-testid="select-pet"><SelectValue placeholder="Selecciona servicio" /></SelectTrigger>
                <SelectContent>
                  {pets.map(pet => (<SelectItem key={pet.pet_id} value={pet.pet_id}>{pet.name} ({pet.species})</SelectItem>))}
                </SelectContent>
              </Select>
              {pets.length === 0 && (
                <p className="text-xs text-orange-600 mt-1">Primero <Link to="/registrar-residencia" className="underline">registra un servicio</Link></p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipo de servicio *</label>
              <Select value={formData.service_type} onValueChange={v => setFormData(prev => ({ ...prev, service_type: v }))}>
                <SelectTrigger data-testid="select-service"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="paseo">Residencia</SelectItem>
                  <SelectItem value="cuidado">Cuidado</SelectItem>
                  <SelectItem value="daycare">Cuidado a Domicilio</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Comuna *</label>
            <input type="text" value={formData.comuna} onChange={e => setFormData(prev => ({ ...prev, comuna: e.target.value }))}
              placeholder="Ej: Providencia, Las Condes" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00e7ff] focus:outline-none" data-testid="input-comuna" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Descripcion *</label>
            <textarea value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe lo que necesitas: horarios, frecuencia, requisitos especiales..."
              rows={3} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00e7ff] focus:outline-none resize-none" data-testid="input-description" />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="flexible" checked={formData.flexible_dates}
              onChange={e => setFormData(prev => ({ ...prev, flexible_dates: e.target.checked }))} className="w-4 h-4 text-[#00e7ff] rounded" />
            <label htmlFor="flexible" className="text-sm text-gray-600">Tengo flexibilidad en las fechas</label>
          </div>
          <Button type="submit" disabled={submitting || pets.length === 0} className="w-full bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f]" data-testid="submit-care-request">
            {submitting ? 'Creando...' : 'Crear Solicitud'}
          </Button>
        </form>
      )}

      {requests.length === 0 && !showForm ? (
        <div className="text-center py-8">
          <Dog className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 mb-2">No tienes solicitudes de cuidado</p>
          <p className="text-sm text-gray-400">Crea una solicitud y los proveedores suscritos podran enviarte propuestas</p>
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
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          req.status === 'active' ? 'bg-green-100 text-green-700' :
                          req.status === 'completed' ? 'bg-cyan-100 text-blue-700' :
                          'bg-gray-200 text-gray-600'
                        }`}>
                          {req.status === 'active' ? 'Activa' : req.status === 'completed' ? 'Completada' : 'Pausada'}
                        </span>
                        <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-[#00e7ff] rounded-full capitalize">
                          {SERVICE_LABELS[req.service_type] || req.service_type}
                        </span>
                      </div>
                      <p className="font-medium text-[#33404f]">{req.pet_name}</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{req.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{req.comuna}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(req.created_at).toLocaleDateString('es-CL')}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {req.status !== 'completed' && (
                        <>
                          <button onClick={() => toggleStatus(req.request_id, req.status)}
                            className={`p-2 rounded-lg transition-colors ${req.status === 'active' ? 'text-orange-600 hover:bg-orange-100' : 'text-green-600 hover:bg-green-100'}`}
                            title={req.status === 'active' ? 'Pausar' : 'Activar'}>
                            {req.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </button>
                          <button onClick={() => deleteRequest(req.request_id)}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-100 transition-colors" title="Eliminar">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Proposals indicator */}
                  {reqProposals.length > 0 && (
                    <button
                      onClick={() => toggleProposals(req.request_id)}
                      className="mt-3 w-full flex items-center justify-between p-3 bg-white/60 rounded-lg border border-blue-200 hover:bg-white transition-colors"
                      data-testid={`toggle-proposals-${req.request_id}`}
                    >
                      <span className="flex items-center gap-2 text-sm font-medium text-blue-800">
                        <Send className="w-4 h-4" />
                        {reqProposals.length} propuesta{reqProposals.length > 1 ? 's' : ''} recibida{reqProposals.length > 1 ? 's' : ''}
                        {pendingCount > 0 && (
                          <span className="px-2 py-0.5 bg-[#00e7ff] text-[#33404f] text-xs rounded-full">{pendingCount} nueva{pendingCount > 1 ? 's' : ''}</span>
                        )}
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4 text-blue-600" />}
                    </button>
                  )}
                </div>

                {/* Expanded proposals */}
                {isExpanded && reqProposals.length > 0 && (
                  <div className="mt-2 ml-4 space-y-3" data-testid={`proposals-list-${req.request_id}`}>
                    {reqProposals.map(proposal => (
                      <ProposalCard
                        key={proposal.proposal_id}
                        proposal={proposal}
                        onRespond={handleProposalResponse}
                      />
                    ))}
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
