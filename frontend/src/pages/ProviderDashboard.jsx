import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Star, Shield, Eye, MapPin, Users, CheckCircle, X, FileText, Building2, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import api from '@/lib/api';
import CareRequestsProvider from '@/components/CareRequestsProvider';
import SubscriptionCard from '@/components/SubscriptionCard';

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests');
  const [hasSubscription, setHasSubscription] = useState(false);

  // Branches
  const [branches, setBranches] = useState([]);
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [branchForm, setBranchForm] = useState({ business_name: '', phone: '', address: '', comuna: '', region: '' });
  const [savingBranch, setSavingBranch] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const profileRes = await api.get('/providers/my-profile');
      setProvider(profileRes.data);
      try {
        const subRes = await api.get('/subscriptions/status');
        setHasSubscription(subRes.data?.has_active_subscription || false);
      } catch {}
      try {
        const brRes = await api.get('/providers/my-branches');
        setBranches(brRes.data);
      } catch {}
    } catch (error) {
      if (error.response?.status === 401) navigate('/login');
      else if (error.response?.status === 404) navigate('/registrar-residencia');
    } finally { setLoading(false); }
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
        <div className="mb-6"><SubscriptionCard hasSubscription={hasSubscription} /></div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b overflow-x-auto">
          {[
            { key: 'requests', label: 'Solicitudes Publicadas', icon: Users },
            { key: 'branches', label: 'Sucursales', icon: MapPin },
          ].map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setActiveTab(key)} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === key ? 'border-[#00e7ff] text-[#00e7ff]' : 'border-transparent text-gray-500 hover:text-gray-700'}`} data-testid={`tab-${key}`}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        {/* Solicitudes Publicadas */}
        {activeTab === 'requests' && (
          <CareRequestsProvider hasSubscription={hasSubscription} />
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
