import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle, XCircle, Badge, Eye, CreditCard, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, BarChart3, Camera, FileText, User, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import api, { API_BASE } from '@/lib/api';

const COLORS = ['#00e7ff', '#4285F4', '#34A853', '#FBBC05'];

function MetricsChart({ data }) {
  if (!data || data.length === 0) return <p className="text-gray-400 text-center py-8">Sin datos</p>;
  const keys = ['users', 'providers', 'subscriptions', 'reviews'];
  const labels = ['Usuarios', 'Cuidadores', 'Suscripciones', 'Reseñas'];
  const maxVal = Math.max(...data.flatMap(d => keys.map(k => d[k] || 0)), 1);

  return (
    <div data-testid="metrics-chart">
      <div className="flex gap-4 mb-4 flex-wrap">
        {keys.map((k, i) => (
          <div key={k} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[i] }} />
            <span className="text-gray-600">{labels[i]}</span>
          </div>
        ))}
      </div>
      <div className="flex items-end gap-3 h-48">
        {data.map((d, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-1">
            <div className="flex items-end gap-0.5 h-40 w-full">
              {keys.map((k, ki) => {
                const h = maxVal > 0 ? ((d[k] || 0) / maxVal) * 100 : 0;
                return (
                  <div key={k} className="flex-1 flex flex-col items-center justify-end h-full">
                    <span className="text-[10px] text-gray-500 mb-1">{d[k] || 0}</span>
                    <div
                      className="w-full rounded-t transition-all"
                      style={{ height: `${Math.max(h, 4)}%`, backgroundColor: COLORS[ki] }}
                    />
                  </div>
                );
              })}
            </div>
            <span className="text-xs text-gray-500 font-medium">{d.month}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlanModal({ plan, onClose, onSave }) {
  const [name, setName] = useState(plan?.name || '');
  const [duration, setDuration] = useState(plan?.duration_months || 1);
  const [price, setPrice] = useState(plan?.price_clp || 0);
  const [features, setFeatures] = useState((plan?.features || []).join('\n'));
  const [popular, setPopular] = useState(plan?.popular || false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name || !price) { toast.error('Nombre y precio son requeridos'); return; }
    setSaving(true);
    try {
      const data = {
        name, duration_months: Number(duration), price_clp: Number(price),
        features: features.split('\n').filter(f => f.trim()), popular
      };
      if (plan?.plan_id) {
        await api.put(`/admin/plans/${plan.plan_id}`, data);
        toast.success('Plan actualizado');
      } else {
        await api.post('/admin/plans', data);
        toast.success('Plan creado');
      }
      onSave();
    } catch (e) { toast.error(e.response?.data?.detail || 'Error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-testid="plan-modal">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4">
        <h3 className="text-xl font-bold">{plan?.plan_id ? 'Editar Plan' : 'Nuevo Plan'}</h3>
        <div>
          <label className="text-sm font-medium text-gray-700">Nombre</label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Plan 1 Mes" data-testid="plan-name-input" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Duracion (meses)</label>
            <Input type="number" value={duration} onChange={e => setDuration(e.target.value)} min={1} data-testid="plan-duration-input" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Precio (CLP)</label>
            <Input type="number" value={price} onChange={e => setPrice(e.target.value)} min={0} data-testid="plan-price-input" />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Caracteristicas (una por linea)</label>
          <textarea value={features} onChange={e => setFeatures(e.target.value)}
            className="w-full border rounded-lg p-2 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-[#00e7ff]"
            placeholder="Chat ilimitado&#10;Contacto directo" data-testid="plan-features-input" />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={popular} onChange={e => setPopular(e.target.checked)} className="rounded" />
          <span className="text-sm">Marcar como popular</span>
        </label>
        <div className="flex gap-3 pt-2">
          <Button onClick={onClose} variant="outline" className="flex-1">Cancelar</Button>
          <Button onClick={handleSave} disabled={saving} className="flex-1 bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f]" data-testid="plan-save-button">
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [pendingProviders, setPendingProviders] = useState([]);
  const [allProviders, setAllProviders] = useState([]);
  const [plans, setPlans] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [editPlan, setEditPlan] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [sosConfig, setSosConfig] = useState({ active: false, phone: '', schedule: '', vet_name: '', start_hour: 8, end_hour: 20 });
  const [savingSos, setSavingSos] = useState(false);
  const [viewingDocs, setViewingDocs] = useState(null);
  const [blogArticles, setBlogArticles] = useState([]);
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [blogForm, setBlogForm] = useState({ title: '', excerpt: '', content: '', image: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const userRes = await api.get('/auth/me');
      if (userRes.data.role !== 'admin') { navigate('/dashboard'); return; }
      const [statsRes, pendingRes, allRes, plansRes, metricsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/providers/pending'),
        api.get('/admin/providers/all'),
        api.get('/admin/plans'),
        api.get('/admin/metrics')
      ]);
      setStats(statsRes.data);
      setPendingProviders(pendingRes.data);
      setAllProviders(allRes.data);
      setPlans(plansRes.data);
      setMetrics(metricsRes.data);
      try {
        const sosRes = await api.get('/admin/sos');
        setSosConfig(sosRes.data);
      } catch {}
      try {
        const blogRes = await api.get('/blog/articles?published_only=false');
        setBlogArticles(blogRes.data);
      } catch {}
    } catch (e) {
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const approveProvider = async (providerId) => {
    try { await api.post(`/admin/providers/${providerId}/approve`); toast.success('Proveedor aprobado'); loadData(); }
    catch (e) { toast.error('Error'); }
  };
  const rejectProvider = async (providerId) => {
    const reason = prompt('Razon del rechazo:');
    if (!reason) return;
    try { await api.post(`/admin/providers/${providerId}/reject`, { reason }); toast.success('Proveedor rechazado'); loadData(); }
    catch (e) { toast.error('Error'); }
  };
  const verifyProvider = async (providerId) => {
    try { await api.post(`/admin/providers/${providerId}/verify`); toast.success('Proveedor verificado'); loadData(); }
    catch (e) { toast.error('Error'); }
  };
  const unverifyProvider = async (providerId) => {
    try { await api.post(`/admin/providers/${providerId}/unverify`); toast.success('Verificación removida'); loadData(); }
    catch (e) { toast.error('Error'); }
  };
  const togglePlan = async (planId) => {
    try { await api.post(`/admin/plans/${planId}/toggle`); toast.success('Estado del plan actualizado'); loadData(); }
    catch (e) { toast.error('Error'); }
  };
  const deletePlan = async (planId) => {
    if (!window.confirm('Eliminar este plan?')) return;
    try { await api.delete(`/admin/plans/${planId}`); toast.success('Plan eliminado'); loadData(); }
    catch (e) { toast.error('Error'); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin w-16 h-16 border-4 border-[#00e7ff] border-t-transparent rounded-full"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50" data-testid="admin-panel">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Panel de Administracion</h1>

        {stats && (
          <div className="grid md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-xl p-5 shadow-sm"><p className="text-gray-500 text-sm">Usuarios</p><p className="text-3xl font-bold text-[#00e7ff]" data-testid="stat-users">{stats.total_users}</p></div>
            <div className="bg-white rounded-xl p-5 shadow-sm"><p className="text-gray-500 text-sm">Cuidadores</p><p className="text-3xl font-bold text-[#00e7ff]" data-testid="stat-providers">{stats.total_providers}</p></div>
            <div className="bg-white rounded-xl p-5 shadow-sm"><p className="text-gray-500 text-sm">Pendientes</p><p className="text-3xl font-bold text-orange-500" data-testid="stat-pending">{stats.pending_providers}</p></div>
            <div className="bg-white rounded-xl p-5 shadow-sm"><p className="text-gray-500 text-sm">Verificados</p><p className="text-3xl font-bold text-green-600" data-testid="stat-verified">{stats.verified_providers}</p></div>
            <div className="bg-white rounded-xl p-5 shadow-sm"><p className="text-gray-500 text-sm">Suscripciones</p><p className="text-3xl font-bold text-[#00e7ff]" data-testid="stat-subscriptions">{stats.active_subscriptions}</p></div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm">
          <div className="flex border-b overflow-x-auto">
            <button onClick={() => setActiveTab('pending')} className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === 'pending' ? 'text-[#00e7ff] border-b-2 border-[#00e7ff]' : 'text-gray-500'}`} data-testid="tab-pending">
              Pendientes ({pendingProviders.length})
            </button>
            <button onClick={() => setActiveTab('all')} className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === 'all' ? 'text-[#00e7ff] border-b-2 border-[#00e7ff]' : 'text-gray-500'}`} data-testid="tab-all">
              Cuidadores ({allProviders.filter(p => p.approved).length})
            </button>
            <button onClick={() => setActiveTab('plans')} className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === 'plans' ? 'text-[#00e7ff] border-b-2 border-[#00e7ff]' : 'text-gray-500'}`} data-testid="tab-plans">
              <CreditCard className="w-4 h-4 inline mr-1" />Planes ({plans.length})
            </button>
            <button onClick={() => setActiveTab('metrics')} className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === 'metrics' ? 'text-[#00e7ff] border-b-2 border-[#00e7ff]' : 'text-gray-500'}`} data-testid="tab-metrics">
              <BarChart3 className="w-4 h-4 inline mr-1" />Metricas
            </button>
            <button onClick={() => setActiveTab('sos')} className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === 'sos' ? 'text-[#00e7ff] border-b-2 border-[#00e7ff]' : 'text-gray-500'}`} data-testid="tab-sos">
              SOS Veterinario
            </button>
            <button onClick={() => setActiveTab('blog')} className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === 'blog' ? 'text-[#00e7ff] border-b-2 border-[#00e7ff]' : 'text-gray-500'}`} data-testid="tab-blog">
              <Newspaper className="w-4 h-4 inline mr-1" />Blog
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'pending' && (
              pendingProviders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay proveedores pendientes</p>
              ) : (
                <div className="space-y-4">
                  {pendingProviders.map(p => (
                    <div key={p.provider_id} className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{p.business_name}</h3>
                          <p className="text-sm text-gray-600">{p.comuna} - {p.phone}</p>
                          {p.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.description}</p>}
                          
                          {/* Verification Status */}
                          {p.verification_status === 'pending' && (
                            <div className="mt-2 flex items-center gap-2">
                              <span className="bg-cyan-100 text-blue-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" />
                                Documentos pendientes de revision
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {/* View Documents Button */}
                          {(p.id_front_photo || p.id_back_photo || p.selfie_photo) && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setViewingDocs(p)}
                              className="text-blue-600 border-blue-300"
                            >
                              <Camera className="w-4 h-4 mr-1" />Documentos
                            </Button>
                          )}
                          <Link to={`/provider/${p.provider_id}`}><Button variant="outline" size="sm"><Eye className="w-4 h-4" /></Button></Link>
                          <Button size="sm" onClick={() => approveProvider(p.provider_id)} className="bg-green-600 hover:bg-green-700"><CheckCircle className="w-4 h-4 mr-1" />Aprobar</Button>
                          <Button size="sm" variant="outline" onClick={() => rejectProvider(p.provider_id)} className="text-red-600 border-red-600"><XCircle className="w-4 h-4 mr-1" />Rechazar</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {activeTab === 'all' && (
              <div className="space-y-4">
                {allProviders.filter(p => p.approved).map(p => (
                  <div key={p.provider_id} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden">
                          {p.photos?.[0] && <img src={p.photos[0]} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold">{p.business_name}</h3>
                            {p.verified && <ShieldCheck className="w-5 h-5 text-[#00e7ff]" />}
                          </div>
                          <p className="text-sm text-gray-500">{p.comuna}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/provider/${p.provider_id}`}><Button variant="outline" size="sm"><Eye className="w-4 h-4" /></Button></Link>
                        {p.verified ? (
                          <Button size="sm" variant="outline" onClick={() => unverifyProvider(p.provider_id)}>Quitar Badge</Button>
                        ) : (
                          <Button size="sm" onClick={() => verifyProvider(p.provider_id)} className="bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f]"><Badge className="w-4 h-4 mr-1" />Verificar</Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'plans' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button onClick={() => { setEditPlan(null); setShowPlanModal(true); }} className="bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f]" data-testid="create-plan-button">
                    <Plus className="w-4 h-4 mr-1" />Nuevo Plan
                  </Button>
                </div>
                {plans.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No hay planes creados</p>
                ) : (
                  plans.map(p => (
                    <div key={p.plan_id} className={`p-5 rounded-xl border-2 ${p.active ? 'bg-white border-gray-200' : 'bg-gray-100 border-gray-300 opacity-60'} ${p.popular ? 'ring-2 ring-[#00e7ff]' : ''}`} data-testid={`plan-card-${p.plan_id}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg">{p.name}</h3>
                            {p.popular && <span className="bg-[#00e7ff] text-[#33404f] text-xs px-2 py-0.5 rounded-full">Popular</span>}
                            {!p.active && <span className="bg-gray-500 text-white text-xs px-2 py-0.5 rounded-full">Inactivo</span>}
                          </div>
                          <p className="text-2xl font-bold text-[#00e7ff] mt-1">${p.price_clp?.toLocaleString('es-CL')} CLP</p>
                          <p className="text-sm text-gray-500">{p.duration_months} {p.duration_months === 1 ? 'mes' : 'meses'}</p>
                          {p.features?.length > 0 && (
                            <ul className="mt-2 space-y-1">
                              {p.features.map((f, i) => <li key={i} className="text-sm text-gray-600 flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-500" />{f}</li>)}
                            </ul>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => togglePlan(p.plan_id)} data-testid={`toggle-plan-${p.plan_id}`}>
                            {p.active ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4 text-gray-400" />}
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => { setEditPlan(p); setShowPlanModal(true); }} data-testid={`edit-plan-${p.plan_id}`}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => deletePlan(p.plan_id)} className="text-red-600 border-red-300 hover:bg-red-50" data-testid={`delete-plan-${p.plan_id}`}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'metrics' && (
              <div className="space-y-6" data-testid="metrics-tab">
                <h3 className="text-lg font-bold text-[#33404f]">Actividad Ultimos 6 Meses</h3>
                <div className="bg-gray-50 rounded-xl p-6">
                  <MetricsChart data={metrics} />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-5">
                    <h4 className="font-semibold text-gray-700 mb-3">Resumen</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Usuarios totales</span><span className="font-bold">{stats?.total_users || 0}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Cuidadores activos</span><span className="font-bold">{stats?.total_providers || 0}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Suscripciones activas</span><span className="font-bold text-[#00e7ff]">{stats?.active_subscriptions || 0}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Reseñas totales</span><span className="font-bold">{stats?.total_reviews || 0}</span></div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-5">
                    <h4 className="font-semibold text-gray-700 mb-3">Cuidadores</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Aprobados</span><span className="font-bold text-green-600">{stats?.total_providers || 0}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Pendientes</span><span className="font-bold text-orange-500">{stats?.pending_providers || 0}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Verificados</span><span className="font-bold text-[#00e7ff]">{stats?.verified_providers || 0}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'sos' && (
              <div className="space-y-6" data-testid="sos-tab">
                <h3 className="text-lg font-bold text-[#33404f]">Configuracion SOS Veterinario</h3>
                <p className="text-sm text-gray-500">Configura el número de emergencia al que los cuidadores pueden llamar si tienen un problema con una mascota.</p>

                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={sosConfig.active || false} onChange={e => setSosConfig(prev => ({ ...prev, active: e.target.checked }))} className="w-5 h-5 accent-[#00e7ff] rounded" data-testid="sos-active-toggle" />
                      <span className="font-semibold">{sosConfig.active ? 'SOS Activo' : 'SOS Desactivado'}</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Nombre del Veterinario</label>
                    <input type="text" placeholder="Ej: Dr. Martinez" value={sosConfig.vet_name || ''} onChange={e => setSosConfig(prev => ({ ...prev, vet_name: e.target.value }))} className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00e7ff]" data-testid="sos-vet-name" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Numero de Telefono</label>
                    <input type="tel" placeholder="Ej: +56912345678" value={sosConfig.phone || ''} onChange={e => setSosConfig(prev => ({ ...prev, phone: e.target.value }))} className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00e7ff]" data-testid="sos-phone" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Horario de Atencion (texto descriptivo)</label>
                    <input type="text" placeholder="Ej: Lunes a Viernes 9:00 - 18:00" value={sosConfig.schedule || ''} onChange={e => setSosConfig(prev => ({ ...prev, schedule: e.target.value }))} className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00e7ff]" data-testid="sos-schedule" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Hora inicio (0-23)</label>
                      <input type="number" min="0" max="23" value={sosConfig.start_hour ?? 8} onChange={e => setSosConfig(prev => ({ ...prev, start_hour: parseInt(e.target.value) || 0 }))} className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00e7ff]" data-testid="sos-start-hour" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Hora fin (0-23)</label>
                      <input type="number" min="0" max="23" value={sosConfig.end_hour ?? 20} onChange={e => setSosConfig(prev => ({ ...prev, end_hour: parseInt(e.target.value) || 0 }))} className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00e7ff]" data-testid="sos-end-hour" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">El boton SOS solo estara activo entre la hora inicio y hora fin (hora de Chile). Fuera de horario, los cuidadores suscritos veran el boton deshabilitado.</p>

                  <Button
                    onClick={async () => {
                      setSavingSos(true);
                      try {
                        await api.put('/admin/sos', sosConfig);
                        toast.success('Configuracion SOS guardada');
                      } catch { toast.error('Error al guardar'); }
                      finally { setSavingSos(false); }
                    }}
                    disabled={savingSos}
                    className="bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f]"
                    data-testid="save-sos-btn"
                  >
                    {savingSos ? 'Guardando...' : 'Guardar Configuracion SOS'}
                  </Button>
                </div>
              </div>
            )}

            {activeTab === 'blog' && (
              <div className="space-y-4" data-testid="blog-tab">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-[#33404f]">Actualidad Mayor - Blog</h3>
                  <Button
                    onClick={() => { setBlogForm({ title: '', excerpt: '', content: '', image: '' }); setEditingArticle(null); setShowBlogModal(true); }}
                    className="bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f]"
                    data-testid="new-article-btn"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Nuevo Artículo
                  </Button>
                </div>

                {blogArticles.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No hay artículos</p>
                ) : (
                  blogArticles.map(a => (
                    <div key={a.article_id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl" data-testid={`blog-row-${a.article_id}`}>
                      <img src={a.image} alt="" className="w-20 h-14 rounded-lg object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-[#33404f] text-sm truncate">{a.title}</h4>
                        <p className="text-xs text-gray-500 truncate">{a.excerpt}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${a.published ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                        {a.published ? 'Publicado' : 'Borrador'}
                      </span>
                      <button
                        onClick={() => { setBlogForm({ title: a.title, excerpt: a.excerpt, content: a.content, image: a.image }); setEditingArticle(a); setShowBlogModal(true); }}
                        className="p-2 hover:bg-gray-200 rounded-lg"
                        data-testid={`edit-article-${a.article_id}`}
                      >
                        <Pencil className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        onClick={async () => {
                          if (!window.confirm('¿Eliminar este artículo?')) return;
                          try {
                            await api.delete(`/blog/articles/${a.article_id}`);
                            setBlogArticles(prev => prev.filter(x => x.article_id !== a.article_id));
                            toast.success('Artículo eliminado');
                          } catch { toast.error('Error al eliminar'); }
                        }}
                        className="p-2 hover:bg-red-50 rounded-lg"
                        data-testid={`delete-article-${a.article_id}`}
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Blog Modal */}
      {showBlogModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-bold text-[#33404f] mb-4">{editingArticle ? 'Editar Artículo' : 'Nuevo Artículo'}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Título</label>
                <input type="text" value={blogForm.title} onChange={e => setBlogForm(p => ({ ...p, title: e.target.value }))} className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00e7ff]" data-testid="blog-form-title" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Extracto</label>
                <input type="text" value={blogForm.excerpt} onChange={e => setBlogForm(p => ({ ...p, excerpt: e.target.value }))} className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00e7ff]" data-testid="blog-form-excerpt" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL de Imagen</label>
                <input type="text" value={blogForm.image} onChange={e => setBlogForm(p => ({ ...p, image: e.target.value }))} className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00e7ff]" placeholder="https://..." data-testid="blog-form-image" />
                {blogForm.image && <img src={blogForm.image} alt="" className="mt-2 h-24 rounded-lg object-cover" />}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contenido</label>
                <textarea value={blogForm.content} onChange={e => setBlogForm(p => ({ ...p, content: e.target.value }))} rows={8} className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00e7ff]" placeholder="Separa los párrafos con doble salto de línea" data-testid="blog-form-content" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button
                onClick={async () => {
                  try {
                    if (editingArticle) {
                      await api.put(`/blog/articles/${editingArticle.article_id}`, blogForm);
                      toast.success('Artículo actualizado');
                    } else {
                      await api.post('/blog/articles', blogForm);
                      toast.success('Artículo creado');
                    }
                    setShowBlogModal(false);
                    const res = await api.get('/blog/articles?published_only=false');
                    setBlogArticles(res.data);
                  } catch { toast.error('Error al guardar'); }
                }}
                className="flex-1 bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f] font-bold"
                data-testid="blog-form-save"
              >
                {editingArticle ? 'Actualizar' : 'Publicar'}
              </Button>
              <Button variant="outline" onClick={() => setShowBlogModal(false)} className="flex-1">Cancelar</Button>
            </div>
          </div>
        </div>
      )}

      {showPlanModal && (
        <PlanModal
          plan={editPlan}
          onClose={() => setShowPlanModal(false)}
          onSave={() => { setShowPlanModal(false); loadData(); }}
        />
      )}

      {/* Verification Documents Modal */}
      {viewingDocs && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-testid="verification-docs-modal">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-[#00e7ff] to-[#00c4d4] text-[#33404f]">
              <div>
                <h3 className="text-xl font-bold">Documentos de Verificación</h3>
                <p className="text-sm opacity-80">{viewingDocs.business_name}</p>
              </div>
              <button onClick={() => setViewingDocs(null)} className="p-2 hover:bg-white/20 rounded-full">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid md:grid-cols-2 gap-6">
                {/* ID Front */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-[#00e7ff]" />
                    Carnet (Frente)
                  </h4>
                  {viewingDocs.id_front_photo ? (
                    <a href={`${API_BASE}${viewingDocs.id_front_photo}`} target="_blank" rel="noreferrer">
                      <img 
                        src={`${API_BASE}${viewingDocs.id_front_photo}`} 
                        alt="Carnet frente" 
                        className="w-full h-48 object-cover rounded-xl border-2 border-gray-200 hover:border-[#00e7ff] transition-colors cursor-pointer"
                      />
                    </a>
                  ) : (
                    <div className="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                      No proporcionado
                    </div>
                  )}
                </div>

                {/* ID Back */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-[#00e7ff]" />
                    Carnet (Dorso)
                  </h4>
                  {viewingDocs.id_back_photo ? (
                    <a href={`${API_BASE}${viewingDocs.id_back_photo}`} target="_blank" rel="noreferrer">
                      <img 
                        src={`${API_BASE}${viewingDocs.id_back_photo}`} 
                        alt="Carnet dorso" 
                        className="w-full h-48 object-cover rounded-xl border-2 border-gray-200 hover:border-[#00e7ff] transition-colors cursor-pointer"
                      />
                    </a>
                  ) : (
                    <div className="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                      No proporcionado
                    </div>
                  )}
                </div>

                {/* Selfie */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-[#00e7ff]" />
                    Selfie
                  </h4>
                  {viewingDocs.selfie_photo ? (
                    <a href={`${API_BASE}${viewingDocs.selfie_photo}`} target="_blank" rel="noreferrer">
                      <img 
                        src={`${API_BASE}${viewingDocs.selfie_photo}`} 
                        alt="Selfie" 
                        className="w-full h-48 object-cover rounded-xl border-2 border-gray-200 hover:border-[#00e7ff] transition-colors cursor-pointer"
                      />
                    </a>
                  ) : (
                    <div className="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                      No proporcionado
                    </div>
                  )}
                </div>

                {/* Background Certificate */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#00e7ff]" />
                    Certificado de Antecedentes
                  </h4>
                  {viewingDocs.background_certificate ? (
                    viewingDocs.background_certificate.endsWith('.pdf') ? (
                      <a 
                        href={`${API_BASE}${viewingDocs.background_certificate}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-full h-48 bg-cyan-50 rounded-xl flex flex-col items-center justify-center text-blue-600 hover:bg-cyan-100 transition-colors"
                      >
                        <FileText className="w-12 h-12 mb-2" />
                        <span className="font-medium">Ver PDF</span>
                      </a>
                    ) : (
                      <a href={`${API_BASE}${viewingDocs.background_certificate}`} target="_blank" rel="noreferrer">
                        <img 
                          src={`${API_BASE}${viewingDocs.background_certificate}`} 
                          alt="Certificado" 
                          className="w-full h-48 object-cover rounded-xl border-2 border-gray-200 hover:border-[#00e7ff] transition-colors cursor-pointer"
                        />
                      </a>
                    )
                  ) : (
                    <div className="w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
                      No proporcionado
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 rounded-xl">
                <p className="text-sm text-yellow-800">
                  <strong>Instrucciones:</strong> Compara la foto del carnet con la selfie para verificar que sea la misma persona. 
                  Si todo esta correcto, aprueba y verifica al cuidador.
                </p>
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 flex gap-3">
              <Button 
                onClick={() => { rejectProvider(viewingDocs.provider_id); setViewingDocs(null); }}
                variant="outline" 
                className="flex-1 text-red-600 border-red-300"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Rechazar
              </Button>
              <Button 
                onClick={async () => { 
                  await approveProvider(viewingDocs.provider_id); 
                  await verifyProvider(viewingDocs.provider_id);
                  setViewingDocs(null); 
                }}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Aprobar y Verificar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
