import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Star, Shield, Eye, MapPin, Users, CheckCircle, X, FileText, Building2, Plus, Loader2, MessageCircle, Clock, Check, XCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import api from '@/lib/api';
import CareRequestsProvider from '@/components/CareRequestsProvider';

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests');

  // Branches
  const [branches, setBranches] = useState([]);
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [branchForm, setBranchForm] = useState({ business_name: '', phone: '', address: '', comuna: '', region: '' });
  const [savingBranch, setSavingBranch] = useState(false);

  // Contact Requests Received
  const [contactRequests, setContactRequests] = useState([]);
  const [loadingCR, setLoadingCR] = useState(false);
  const [respondingCR, setRespondingCR] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const profileRes = await api.get('/providers/my-profile');
      setProvider(profileRes.data);
      try {
        const brRes = await api.get('/providers/my-branches');
        setBranches(brRes.data);
      } catch {}
    } catch (error) {
      if (error.response?.status === 401) navigate('/login');
      else if (error.response?.status === 404) navigate('/registrar-residencia');
    } finally { setLoading(false); }
  };

  const loadContactRequests = async () => {
    setLoadingCR(true);
    try {
      const res = await api.get('/contact-requests/received');
      setContactRequests(res.data || []);
    } catch {} finally { setLoadingCR(false); }
  };

  const handleRespondCR = async (requestId, action) => {
    setRespondingCR(requestId);
    try {
      await api.put(`/contact-requests/${requestId}/${action}`);
      toast.success(action === 'accept' ? 'Solicitud aceptada. Chat desbloqueado.' : 'Solicitud rechazada.');
      loadContactRequests();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Error al responder');
    } finally { setRespondingCR(null); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-[#00e7ff] border-t-transparent rounded-full animate-spin" /></div>;
  if (!provider) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">No tienes perfil de proveedor</p></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="provider-dashboard">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#00e7ff] to-[#00c4d4] rounded-2xl p-6 text-white mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Panel de Residencia</h1>
              <p className="text-[#33404f] text-sm font-medium">{provider.business_name}</p>
            </div>
            <div className="flex items-center gap-3">
              {provider.verified && <div className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full text-sm font-medium"><Shield className="w-4 h-4" /> Verificado</div>}
              <div className="flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full text-sm font-medium">
                <Star className="w-4 h-4" /> {provider.rating?.toFixed(1) || '0.0'} ({provider.total_reviews || 0})
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Card */}
        <div className="mb-6 p-4 bg-gray-50 border rounded-xl">
          <p className="text-sm text-gray-600">
            <span className="font-medium text-[#33404f]">Tu plan: </span>
            {provider?.plan_type === 'premium_plus' ? 'Premium+' : provider?.plan_type === 'premium' ? 'Premium' : provider?.plan_type === 'destacado' ? 'Destacado' : 'Sin plan'}
            {provider?.plan_active ? ' (Activo)' : provider?.plan_type ? ' (Inactivo)' : ''}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            <Mail className="w-3 h-3 inline mr-1" />
            Para cambiar tu plan contacta a <a href="mailto:hola@senioradvisor.cl" className="text-[#00e7ff] underline">hola@senioradvisor.cl</a>
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b overflow-x-auto">
          {[
            { key: 'requests', label: 'Solicitudes Publicadas', icon: Users },
            { key: 'inbox', label: 'Solicitudes Recibidas', icon: MessageCircle, requiresPlan: ['premium', 'premium_plus'] },
            { key: 'branches', label: 'Sucursales', icon: MapPin },
          ].map(({ key, label, icon: Icon, requiresPlan }) => {
            const plan = provider?.plan_active ? (provider?.plan_type || '') : '';
            const blocked = requiresPlan && !requiresPlan.includes(plan);
            return (
              <button key={key} onClick={() => { if (blocked) return; setActiveTab(key); if (key === 'inbox' && contactRequests.length === 0) loadContactRequests(); }} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === key ? 'border-[#00e7ff] text-[#00e7ff]' : blocked ? 'border-transparent text-gray-300 cursor-not-allowed' : 'border-transparent text-gray-500 hover:text-gray-700'}`} data-testid={`tab-${key}`} disabled={blocked}>
                <Icon className="w-4 h-4" />{label}
                {blocked && <span className="text-[10px] bg-gray-200 text-gray-400 px-1 rounded ml-1">Premium</span>}
                {!blocked && key === 'inbox' && contactRequests.filter(r => r.status === 'pending').length > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {contactRequests.filter(r => r.status === 'pending').length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Solicitudes Publicadas */}
        {activeTab === 'requests' && (
          <CareRequestsProvider />
        )}

        {/* Solicitudes Recibidas */}
        {activeTab === 'inbox' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border" data-testid="tab-inbox-content">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-xl flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#00e7ff]" />
                Solicitudes de Contacto Recibidas
                <span className="text-sm font-normal text-gray-500">({contactRequests.length})</span>
              </h2>
              <Button variant="outline" size="sm" onClick={loadContactRequests} disabled={loadingCR} data-testid="refresh-inbox">
                {loadingCR ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Actualizar'}
              </Button>
            </div>

            {loadingCR ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-10 h-10 border-4 border-[#00e7ff] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : contactRequests.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No tienes solicitudes de contacto</p>
                <p className="text-sm text-gray-400 mt-1">Cuando una familia quiera contactarte, aparecera aqui</p>
              </div>
            ) : (
              <div className="space-y-3">
                {contactRequests.map(cr => (
                  <div key={cr.request_id} className={`p-4 rounded-xl border transition-colors ${cr.status === 'pending' ? 'bg-yellow-50/50 border-yellow-200' : cr.status === 'accepted' ? 'bg-green-50/50 border-green-200' : 'bg-gray-50 border-gray-200'}`} data-testid={`contact-request-${cr.request_id}`}>
                    <div className="flex items-start gap-4">
                      {/* Client avatar */}
                      <div className="flex-shrink-0">
                        {cr.client_picture ? (
                          <img src={cr.client_picture.startsWith('http') ? cr.client_picture : `${process.env.REACT_APP_BACKEND_URL}${cr.client_picture}`} alt={cr.client_name} className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-[#00e7ff]/10 flex items-center justify-center text-lg font-bold text-[#00e7ff]">
                            {(cr.client_name || 'C')[0]}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-[#33404f]">{cr.client_name || 'Cliente'}</span>
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${cr.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : cr.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {cr.status === 'pending' ? 'Pendiente' : cr.status === 'accepted' ? 'Aceptada' : 'Rechazada'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{cr.message || 'Sin mensaje'}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(cr.created_at).toLocaleDateString('es-CL')}</span>
                          {cr.responded_at && <span>Respondida: {new Date(cr.responded_at).toLocaleDateString('es-CL')}</span>}
                        </div>

                        {/* Actions */}
                        {cr.status === 'pending' && (
                          <div className="flex gap-2 mt-3">
                            <Button
                              size="sm"
                              className="bg-green-500 hover:bg-green-600 text-white text-xs"
                              disabled={respondingCR === cr.request_id}
                              onClick={() => handleRespondCR(cr.request_id, 'accept')}
                              data-testid={`accept-cr-${cr.request_id}`}
                            >
                              {respondingCR === cr.request_id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Check className="w-3 h-3 mr-1" />}
                              Aceptar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-500 border-red-200 hover:bg-red-50 text-xs"
                              disabled={respondingCR === cr.request_id}
                              onClick={() => handleRespondCR(cr.request_id, 'reject')}
                              data-testid={`reject-cr-${cr.request_id}`}
                            >
                              <XCircle className="w-3 h-3 mr-1" />Rechazar
                            </Button>
                          </div>
                        )}

                        {cr.status === 'accepted' && (
                          <div className="mt-3">
                            <Link to={`/chat?user=${cr.client_user_id}`}>
                              <Button size="sm" className="bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f] text-xs" data-testid={`chat-cr-${cr.request_id}`}>
                                <MessageCircle className="w-3 h-3 mr-1" />Ir al Chat
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sucursales */}
        {activeTab === 'branches' && (
          <div className="bg-white rounded-xl shadow-sm p-6" data-testid="tab-branches-content">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#33404f]">Sucursales</h2>
                <p className="text-sm text-gray-500">Agrega otras ubicaciones de tu residencia</p>
              </div>
              <Button onClick={() => { setShowBranchForm(!showBranchForm); setBranchForm({ business_name: '', phone: '', address: '', comuna: '', region: '' }); }} className="bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f]" data-testid="add-branch-btn">
                {showBranchForm ? 'Cancelar' : <><Plus className="w-4 h-4 mr-1" /> Agregar Sucursal</>}
              </Button>
            </div>

            {/* Main profile link */}
            <Link to={`/provider/${provider.provider_id}`} className="block mb-6 p-4 border-2 border-[#00e7ff]/20 rounded-xl bg-cyan-50/30 hover:bg-cyan-50 transition-colors" data-testid="main-profile-link">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#00e7ff]/10 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-[#00e7ff]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-[#00e7ff] uppercase">Sede Principal</p>
                  <h3 className="font-bold text-[#33404f]">{provider.business_name}</h3>
                  <p className="text-sm text-gray-500">{[provider.address, provider.comuna, provider.region].filter(Boolean).join(', ')}</p>
                </div>
                <Eye className="w-5 h-5 text-gray-400" />
              </div>
            </Link>

            {showBranchForm && (
              <div className="border-2 border-[#00e7ff]/30 rounded-xl p-5 mb-6 space-y-4 bg-cyan-50/30" data-testid="branch-form">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre de la Sucursal *</label>
                    <Input value={branchForm.business_name} onChange={e => setBranchForm(prev => ({...prev, business_name: e.target.value}))} placeholder="Ej: Residencia Villa Serena - Sede Sur" data-testid="branch-name" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Teléfono</label>
                    <Input value={branchForm.phone} onChange={e => setBranchForm(prev => ({...prev, phone: e.target.value}))} placeholder="+56 9 1234 5678" data-testid="branch-phone" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Dirección</label>
                  <Input value={branchForm.address} onChange={e => setBranchForm(prev => ({...prev, address: e.target.value}))} placeholder="Av. Principal 456" data-testid="branch-address" />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Comuna</label>
                    <Input value={branchForm.comuna} onChange={e => setBranchForm(prev => ({...prev, comuna: e.target.value}))} placeholder="Providencia" data-testid="branch-comuna" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Región</label>
                    <Input value={branchForm.region} onChange={e => setBranchForm(prev => ({...prev, region: e.target.value}))} placeholder="Región Metropolitana" data-testid="branch-region" />
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                  La sucursal heredará los servicios, amenidades y galería de la sede principal.
                </div>
                <Button
                  onClick={async () => {
                    if (!branchForm.business_name.trim()) { toast.error('El nombre es obligatorio'); return; }
                    setSavingBranch(true);
                    try {
                      const res = await api.post('/providers/my-branches', branchForm);
                      toast.success('Sucursal creada exitosamente');
                      setBranches(prev => [...prev, { ...branchForm, provider_id: res.data.provider_id, created_at: new Date().toISOString() }]);
                      setShowBranchForm(false);
                    } catch (e) { toast.error(e.response?.data?.detail || 'Error al crear sucursal'); }
                    finally { setSavingBranch(false); }
                  }}
                  disabled={savingBranch}
                  className="w-full bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f] py-5 font-bold"
                  data-testid="save-branch-btn"
                >
                  {savingBranch ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Guardando...</> : 'Crear Sucursal'}
                </Button>
              </div>
            )}

            {branches.length === 0 && !showBranchForm ? (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="font-medium">No tienes sucursales registradas</p>
                <p className="text-sm mt-1">Agrega ubicaciones adicionales de tu residencia</p>
              </div>
            ) : (
              <div className="space-y-3">
                {branches.map(branch => (
                  <div key={branch.provider_id} className="border rounded-xl p-4 flex items-center justify-between hover:border-[#00e7ff]/40 transition-colors" data-testid={`branch-${branch.provider_id}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center"><MapPin className="w-6 h-6 text-[#00e7ff]" /></div>
                      <div>
                        <h3 className="font-bold text-[#33404f]">{branch.business_name}</h3>
                        <p className="text-sm text-gray-500">{[branch.address, branch.comuna, branch.region].filter(Boolean).join(', ') || 'Sin dirección'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to={`/provider/${branch.provider_id}`}><Button variant="outline" size="sm"><Eye className="w-4 h-4" /></Button></Link>
                      <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50" onClick={async () => {
                        if (!window.confirm('¿Eliminar esta sucursal?')) return;
                        try { await api.delete(`/providers/my-branches/${branch.provider_id}`); setBranches(prev => prev.filter(b => b.provider_id !== branch.provider_id)); toast.success('Sucursal eliminada'); } catch { toast.error('Error al eliminar'); }
                      }} data-testid={`delete-branch-${branch.provider_id}`}><X className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex items-center justify-center gap-4">
          <Link to={`/provider/${provider.provider_id}`}>
            <Button variant="outline" className="text-[#00e7ff] border-[#00e7ff] hover:bg-[#00e7ff]/10" data-testid="view-public-profile">
              <Eye className="w-4 h-4 mr-2" />Ver mi perfil público
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;
