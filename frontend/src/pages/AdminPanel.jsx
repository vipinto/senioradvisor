import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle, XCircle, Badge, Eye, CreditCard, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, BarChart3, Camera, FileText, User, Newspaper, Handshake, Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import api, { API_BASE } from '@/lib/api';

const COLORS = ['#00e7ff', '#4285F4', '#34A853', '#FBBC05'];

function MetricsChart({ data }) {
  if (!data || data.length === 0) return <p className="text-gray-400 text-center py-8">Sin datos</p>;
  const keys = ['users', 'providers', 'subscriptions', 'reviews'];
  const labels = ['Usuarios', 'Residencias', 'Suscripciones', 'Reseñas'];
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
  const [blogForm, setBlogForm] = useState({ title: '', excerpt: '', content: '', image: '' });
  const [viewingDocs, setViewingDocs] = useState(null);
  const [blogArticles, setBlogArticles] = useState([]);
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [partnerLeads, setPartnerLeads] = useState([]);
  const [convenios, setConvenios] = useState([]);
  const [showConvenioModal, setShowConvenioModal] = useState(false);
  const [editingConvenio, setEditingConvenio] = useState(null);
  const [convenioForm, setConvenioForm] = useState({ name: '', logo: '', description: '', location: '', plans: [], featured: false });
  const [showResidenciaModal, setShowResidenciaModal] = useState(false);
  const [residenciaForm, setResidenciaForm] = useState({ business_name: '', email: '', phone: '', address: '', region: '', comuna: '', website: '', facebook: '', instagram: '', price_from: 0, place_id: '', service_type: 'residencias' });
  const [bulkResults, setBulkResults] = useState(null);
  const [uploading, setUploading] = useState(false);

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
        const blogRes = await api.get('/blog/articles?published_only=false');
        setBlogArticles(blogRes.data);
      } catch {}
      try {
        const leadsRes = await api.get('/partners/leads');
        setPartnerLeads(leadsRes.data);
      } catch {}
      try {
        const convRes = await api.get('/partners/convenios?active_only=false');
        setConvenios(convRes.data);
      } catch {}
    } catch (e) {
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const approveProvider = async (providerId) => {
    try { await api.post(`/admin/providers/${providerId}/approve`); toast.success('Residencia aprobada'); loadData(); }
    catch (e) { toast.error('Error'); }
  };
  const rejectProvider = async (providerId) => {
    const reason = prompt('Razon del rechazo:');
    if (!reason) return;
    try { await api.post(`/admin/providers/${providerId}/reject`, { reason }); toast.success('Residencia rechazada'); loadData(); }
    catch (e) { toast.error('Error'); }
  };
  const verifyProvider = async (providerId) => {
    try { await api.post(`/admin/providers/${providerId}/verify`); toast.success('Residencia verificada'); loadData(); }
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
            <div className="bg-white rounded-xl p-5 shadow-sm"><p className="text-gray-500 text-sm">Residencias</p><p className="text-3xl font-bold text-[#00e7ff]" data-testid="stat-providers">{stats.total_providers}</p></div>
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
              Residencias ({allProviders.filter(p => p.approved).length})
            </button>
            <button onClick={() => setActiveTab('plans')} className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === 'plans' ? 'text-[#00e7ff] border-b-2 border-[#00e7ff]' : 'text-gray-500'}`} data-testid="tab-plans">
              <CreditCard className="w-4 h-4 inline mr-1" />Planes ({plans.length})
            </button>
            <button onClick={() => setActiveTab('metrics')} className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === 'metrics' ? 'text-[#00e7ff] border-b-2 border-[#00e7ff]' : 'text-gray-500'}`} data-testid="tab-metrics">
              <BarChart3 className="w-4 h-4 inline mr-1" />Metricas
            </button>
            <button onClick={() => setActiveTab('blog')} className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === 'blog' ? 'text-[#00e7ff] border-b-2 border-[#00e7ff]' : 'text-gray-500'}`} data-testid="tab-blog">
              <Newspaper className="w-4 h-4 inline mr-1" />Blog
            </button>
            <button onClick={() => setActiveTab('leads')} className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === 'leads' ? 'text-[#00e7ff] border-b-2 border-[#00e7ff]' : 'text-gray-500'}`} data-testid="tab-leads">
              <Handshake className="w-4 h-4 inline mr-1" />Leads ({partnerLeads.length})
            </button>
            <button onClick={() => setActiveTab('convenios')} className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === 'convenios' ? 'text-[#00e7ff] border-b-2 border-[#00e7ff]' : 'text-gray-500'}`} data-testid="tab-convenios">
              <Handshake className="w-4 h-4 inline mr-1" />Convenios ({convenios.length})
            </button>
            <button onClick={() => setActiveTab('crear-residencia')} className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === 'crear-residencia' ? 'text-[#00e7ff] border-b-2 border-[#00e7ff]' : 'text-gray-500'}`} data-testid="tab-crear-residencia">
              <Plus className="w-4 h-4 inline mr-1" />Crear Residencias
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'pending' && (
              pendingProviders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay residencias pendientes</p>
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
                      <div className="flex justify-between"><span className="text-gray-500">Residencias activas</span><span className="font-bold">{stats?.total_providers || 0}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Suscripciones activas</span><span className="font-bold text-[#00e7ff]">{stats?.active_subscriptions || 0}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Reseñas totales</span><span className="font-bold">{stats?.total_reviews || 0}</span></div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-5">
                    <h4 className="font-semibold text-gray-700 mb-3">Residencias</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Aprobados</span><span className="font-bold text-green-600">{stats?.total_providers || 0}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Pendientes</span><span className="font-bold text-orange-500">{stats?.pending_providers || 0}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Verificados</span><span className="font-bold text-[#00e7ff]">{stats?.verified_providers || 0}</span></div>
                    </div>
                  </div>
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

            {activeTab === 'leads' && (
              <div className="space-y-4" data-testid="leads-tab">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-[#33404f]">Leads de Convenios - SeniorClub</h3>
                  <span className="text-sm text-gray-500">{partnerLeads.length} contactos</span>
                </div>
                {partnerLeads.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No hay leads registrados</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="py-3 px-2 font-semibold text-gray-600">Fecha</th>
                          <th className="py-3 px-2 font-semibold text-gray-600">Nombre</th>
                          <th className="py-3 px-2 font-semibold text-gray-600">Email</th>
                          <th className="py-3 px-2 font-semibold text-gray-600">Teléfono</th>
                          <th className="py-3 px-2 font-semibold text-gray-600">Convenio</th>
                          <th className="py-3 px-2 font-semibold text-gray-600">Plan</th>
                          <th className="py-3 px-2 font-semibold text-gray-600">Tipo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {partnerLeads.map(l => (
                          <tr key={l.lead_id} className="border-b hover:bg-gray-50" data-testid={`lead-row-${l.lead_id}`}>
                            <td className="py-3 px-2 text-gray-500">{new Date(l.created_at).toLocaleDateString('es-CL')}</td>
                            <td className="py-3 px-2 font-medium text-[#33404f]">{l.name}</td>
                            <td className="py-3 px-2 text-gray-600">{l.email}</td>
                            <td className="py-3 px-2 text-gray-600">{l.phone}</td>
                            <td className="py-3 px-2"><span className="bg-[#00e7ff]/10 text-[#33404f] text-xs font-bold px-2 py-0.5 rounded-full">{l.partner_slug}</span></td>
                            <td className="py-3 px-2 text-gray-600">{l.plan_interest || '-'}</td>
                            <td className="py-3 px-2 text-gray-500">{l.contact_type || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'convenios' && (
              <div className="space-y-4" data-testid="convenios-tab">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-[#33404f]">Convenios SeniorClub</h3>
                  <Button onClick={() => { setEditingConvenio(null); setConvenioForm({ name: '', logo: '', description: '', location: '', plans: [{ name: '', category: '', price: '', uf: '' }], featured: false }); setShowConvenioModal(true); }} className="bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f]" data-testid="new-convenio-btn">
                    <Plus className="w-4 h-4 mr-1" /> Nuevo Convenio
                  </Button>
                </div>
                {convenios.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No hay convenios registrados</p>
                ) : (
                  <div className="space-y-3">
                    {convenios.map(c => (
                      <div key={c.convenio_id} className="bg-white border rounded-xl p-4 flex items-center gap-4" data-testid={`convenio-row-${c.convenio_id}`}>
                        <img src={c.logo} alt={c.name} className="w-16 h-16 object-contain rounded-lg bg-gray-50 p-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-[#33404f]">{c.name}</h4>
                            {c.featured && <span className="bg-[#00e7ff] text-[#33404f] text-[10px] font-bold px-2 py-0.5 rounded-full">Destacado</span>}
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{c.active ? 'Activo' : 'Inactivo'}</span>
                          </div>
                          <p className="text-xs text-gray-500 truncate max-w-md">{c.description}</p>
                          <p className="text-xs text-gray-400">{c.plans?.length || 0} planes | {c.location || 'Sin ubicación'}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingConvenio(c); setConvenioForm({ name: c.name, logo: c.logo, description: c.description, location: c.location || '', plans: c.plans || [{ name: '', category: '', price: '', uf: '' }], featured: c.featured }); setShowConvenioModal(true); }} className="p-2 hover:bg-gray-100 rounded-lg">
                            <Pencil className="w-4 h-4 text-gray-500" />
                          </button>
                          <button onClick={async () => { if (window.confirm('¿Eliminar este convenio?')) { try { await api.delete(`/partners/convenios/${c.convenio_id}`); toast.success('Convenio eliminado'); loadData(); } catch { toast.error('Error'); } } }} className="p-2 hover:bg-red-50 rounded-lg">
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'crear-residencia' && (
              <div className="space-y-6" data-testid="crear-residencia-tab">
                {/* Individual */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-[#33404f]">Crear Residencia Individual</h3>
                    <Button onClick={() => { setResidenciaForm({ business_name: '', email: '', phone: '', address: '', region: '', comuna: '', website: '', facebook: '', instagram: '', price_from: 0, place_id: '', service_type: 'residencias' }); setShowResidenciaModal(true); }} className="bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f]" data-testid="new-residencia-btn">
                      <Plus className="w-4 h-4 mr-1" /> Nueva Residencia
                    </Button>
                  </div>
                </div>

                {/* Bulk Upload */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-[#33404f] mb-2">Carga Masiva desde Excel</h3>
                  <p className="text-sm text-gray-500 mb-4">Sube un archivo <strong>.csv</strong> o <strong>.xlsx</strong>. Columna obligatoria: <strong>nombre residencia</strong>. Si no hay email, se genera automáticamente. Columnas soportadas: comuna, direccion, telefono, rating, website, latitud, longitud, imagenes, servicios, facebook, instagram, etc.</p>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <Button variant="outline" className="text-sm" data-testid="download-template-btn" onClick={() => {
                      const headers = 'nombre,email,telefono,whatsapp,direccion,comuna,descripcion,tipo,precio\n';
                      const example = 'Residencia Ejemplo,ejemplo@email.cl,+56912345678,+56912345678,Av. Principal 123,Las Condes,Residencia de adultos mayores,residencias,1500000\n';
                      const blob = new Blob([headers + example], { type: 'text/csv' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url; a.download = 'plantilla_residencias.csv'; a.click();
                    }}>
                      <Download className="w-4 h-4 mr-1" /> Descargar Plantilla CSV
                    </Button>
                    
                    <label className="cursor-pointer">
                      <input type="file" accept=".xlsx,.xls,.csv" className="hidden" data-testid="excel-upload-input" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploading(true);
                        setBulkResults(null);
                        try {
                          const formData = new FormData();
                          formData.append('file', file);
                          const token = localStorage.getItem('jwt_token');
                          const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/residencias/upload-excel`, {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${token}` },
                            body: formData
                          });
                          const data = await res.json();
                          if (!res.ok) throw new Error(data.detail || 'Error');
                          setBulkResults(data);
                          toast.success(`${data.created} residencias creadas`);
                          if (data.errors > 0) toast.error(`${data.errors} errores`);
                          loadData();
                        } catch (err) {
                          toast.error(err.message || 'Error al subir archivo');
                        } finally {
                          setUploading(false);
                          e.target.value = '';
                        }
                      }} />
                      <Button className="bg-[#33404f] hover:bg-[#4a5568] text-white" disabled={uploading} asChild>
                        <span><Upload className="w-4 h-4 mr-1" />{uploading ? 'Subiendo...' : 'Subir Excel'}</span>
                      </Button>
                    </label>
                  </div>

                  {/* Results */}
                  {bulkResults && (
                    <div className="mt-4">
                      <div className="flex gap-4 mb-3">
                        <span className="text-sm font-bold text-green-600">Creadas: {bulkResults.created}</span>
                        {bulkResults.errors > 0 && <span className="text-sm font-bold text-red-500">Errores: {bulkResults.errors}</span>}
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b text-left">
                              <th className="py-2 px-2 font-semibold">Residencia</th>
                              <th className="py-2 px-2 font-semibold">Email</th>
                              <th className="py-2 px-2 font-semibold">Contraseña</th>
                              <th className="py-2 px-2 font-semibold">Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bulkResults.results.map((r, i) => (
                              <tr key={i} className="border-b">
                                <td className="py-2 px-2 font-medium">{r.business_name}</td>
                                <td className="py-2 px-2 text-gray-600">{r.email}</td>
                                <td className="py-2 px-2 font-mono text-xs">{r.password || '-'}</td>
                                <td className="py-2 px-2">
                                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.status === 'created' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                    {r.status === 'created' ? 'Creada' : r.detail}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <Button variant="outline" className="mt-3 text-sm" onClick={() => {
                        const csv = 'residencia,email,contraseña,estado\n' + bulkResults.results.map(r => `${r.business_name},${r.email},${r.password || ''},${r.status}`).join('\n');
                        const blob = new Blob([csv], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url; a.download = 'resultado_carga.csv'; a.click();
                      }} data-testid="download-results-btn">
                        <Download className="w-4 h-4 mr-1" /> Descargar Resultados con Contraseñas
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Residencia Modal */}
      {showResidenciaModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-bold text-[#33404f] mb-4">Crear Nueva Residencia</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre de la Residencia *</label>
                <input type="text" value={residenciaForm.business_name} onChange={e => setResidenciaForm(p => ({ ...p, business_name: e.target.value }))} className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00e7ff]" placeholder="Ej: Residencia Villa Serena" data-testid="residencia-form-name" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Correo Electrónico *</label>
                <input type="email" value={residenciaForm.email} onChange={e => setResidenciaForm(p => ({ ...p, email: e.target.value }))} className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00e7ff]" placeholder="residencia@email.cl" data-testid="residencia-form-email" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Dirección</label>
                <input type="text" value={residenciaForm.address} onChange={e => setResidenciaForm(p => ({ ...p, address: e.target.value }))} className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00e7ff]" placeholder="Av. Principal 123" data-testid="residencia-form-address" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Región</label>
                  <input type="text" value={residenciaForm.region} onChange={e => setResidenciaForm(p => ({ ...p, region: e.target.value }))} className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00e7ff]" placeholder="Región Metropolitana" data-testid="residencia-form-region" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Comuna</label>
                  <input type="text" value={residenciaForm.comuna} onChange={e => setResidenciaForm(p => ({ ...p, comuna: e.target.value }))} className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00e7ff]" placeholder="Las Condes" data-testid="residencia-form-comuna" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Teléfono</label>
                  <input type="tel" value={residenciaForm.phone} onChange={e => setResidenciaForm(p => ({ ...p, phone: e.target.value }))} className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00e7ff]" placeholder="+56 9 1234 5678" data-testid="residencia-form-phone" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Precio (desde CLP)</label>
                  <input type="number" value={residenciaForm.price_from} onChange={e => setResidenciaForm(p => ({ ...p, price_from: parseInt(e.target.value) || 0 }))} className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00e7ff]" placeholder="500000" data-testid="residencia-form-price" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sitio Web</label>
                <input type="url" value={residenciaForm.website} onChange={e => setResidenciaForm(p => ({ ...p, website: e.target.value }))} className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00e7ff]" placeholder="https://www.ejemplo.cl" data-testid="residencia-form-website" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Facebook</label>
                  <input type="url" value={residenciaForm.facebook} onChange={e => setResidenciaForm(p => ({ ...p, facebook: e.target.value }))} className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00e7ff]" placeholder="https://facebook.com/..." data-testid="residencia-form-facebook" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Instagram</label>
                  <input type="url" value={residenciaForm.instagram} onChange={e => setResidenciaForm(p => ({ ...p, instagram: e.target.value }))} className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00e7ff]" placeholder="https://instagram.com/..." data-testid="residencia-form-instagram" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Place ID (Google)</label>
                <input type="text" value={residenciaForm.place_id} onChange={e => setResidenciaForm(p => ({ ...p, place_id: e.target.value }))} className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00e7ff]" placeholder="ChIJ..." data-testid="residencia-form-placeid" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Servicio</label>
                <select value={residenciaForm.service_type} onChange={e => setResidenciaForm(p => ({ ...p, service_type: e.target.value }))} className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00e7ff] bg-white" data-testid="residencia-form-type">
                  <option value="residencias">Residencia</option>
                  <option value="cuidado-domicilio">Cuidado a Domicilio</option>
                  <option value="salud-mental">Salud Mental</option>
                </select>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">Se generará una contraseña automática que podrás enviar a la residencia.</p>
            <div className="flex gap-3 mt-4">
              <Button
                onClick={async () => {
                  if (!residenciaForm.business_name || !residenciaForm.email) { toast.error('Nombre y email son obligatorios'); return; }
                  try {
                    const res = await api.post('/admin/residencias/create', residenciaForm);
                    toast.success(`Residencia creada. Contraseña: ${res.data.password}`);
                    setBulkResults({ total: 1, created: 1, errors: 0, results: [res.data] });
                    setShowResidenciaModal(false);
                    loadData();
                  } catch (err) { toast.error(err.response?.data?.detail || 'Error al crear'); }
                }}
                className="flex-1 bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f]"
                data-testid="residencia-form-save"
              >
                Crear Residencia
              </Button>
              <Button variant="outline" onClick={() => setShowResidenciaModal(false)} className="flex-1">Cancelar</Button>
            </div>
          </div>
        </div>
      )}

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
                  Si todo esta correcto, aprueba y verifica la residencia.
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

      {/* Convenio Modal */}
      {showConvenioModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-lg font-bold text-[#33404f] mb-4">{editingConvenio ? 'Editar Convenio' : 'Nuevo Convenio'}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input type="text" value={convenioForm.name} onChange={e => setConvenioForm(p => ({ ...p, name: e.target.value }))} className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00e7ff]" placeholder="Ej: Help Rescate" data-testid="convenio-form-name" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL del Logo</label>
                <input type="text" value={convenioForm.logo} onChange={e => setConvenioForm(p => ({ ...p, logo: e.target.value }))} className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00e7ff]" placeholder="https://..." data-testid="convenio-form-logo" />
                {convenioForm.logo && <img src={convenioForm.logo} alt="" className="mt-2 h-16 rounded-lg object-contain" />}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea value={convenioForm.description} onChange={e => setConvenioForm(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00e7ff]" data-testid="convenio-form-desc" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ubicación</label>
                <input type="text" value={convenioForm.location} onChange={e => setConvenioForm(p => ({ ...p, location: e.target.value }))} className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00e7ff]" placeholder="Ej: Metropolitana, Valparaíso" data-testid="convenio-form-location" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={convenioForm.featured} onChange={e => setConvenioForm(p => ({ ...p, featured: e.target.checked }))} className="w-4 h-4 accent-[#00e7ff]" data-testid="convenio-form-featured" />
                <label className="text-sm font-medium">Destacado</label>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">Planes</label>
                  <button onClick={() => setConvenioForm(p => ({ ...p, plans: [...p.plans, { name: '', category: '', price: '', uf: '' }] }))} className="text-xs text-[#00e7ff] font-bold hover:underline">+ Agregar plan</button>
                </div>
                {convenioForm.plans.map((plan, idx) => (
                  <div key={idx} className="border rounded-xl p-3 mb-2 space-y-2 relative">
                    {convenioForm.plans.length > 1 && (
                      <button onClick={() => setConvenioForm(p => ({ ...p, plans: p.plans.filter((_, i) => i !== idx) }))} className="absolute top-2 right-2 text-red-400 hover:text-red-600">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <input type="text" value={plan.name} onChange={e => { const plans = [...convenioForm.plans]; plans[idx] = { ...plans[idx], name: e.target.value }; setConvenioForm(p => ({ ...p, plans })); }} className="border rounded-lg p-2 text-xs" placeholder="Nombre del plan" />
                      <input type="text" value={plan.category} onChange={e => { const plans = [...convenioForm.plans]; plans[idx] = { ...plans[idx], category: e.target.value }; setConvenioForm(p => ({ ...p, plans })); }} className="border rounded-lg p-2 text-xs" placeholder="Categoría" />
                      <input type="text" value={plan.price} onChange={e => { const plans = [...convenioForm.plans]; plans[idx] = { ...plans[idx], price: e.target.value }; setConvenioForm(p => ({ ...p, plans })); }} className="border rounded-lg p-2 text-xs" placeholder="Precio ej: $8.336" />
                      <input type="text" value={plan.uf} onChange={e => { const plans = [...convenioForm.plans]; plans[idx] = { ...plans[idx], uf: e.target.value }; setConvenioForm(p => ({ ...p, plans })); }} className="border rounded-lg p-2 text-xs" placeholder="UF ej: 0.22" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button
                onClick={async () => {
                  try {
                    if (editingConvenio) {
                      await api.put(`/partners/convenios/${editingConvenio.convenio_id}`, convenioForm);
                      toast.success('Convenio actualizado');
                    } else {
                      await api.post('/partners/convenios', convenioForm);
                      toast.success('Convenio creado');
                    }
                    setShowConvenioModal(false);
                    loadData();
                  } catch { toast.error('Error al guardar'); }
                }}
                className="flex-1 bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f]"
                data-testid="convenio-form-save"
              >
                {editingConvenio ? 'Actualizar' : 'Crear Convenio'}
              </Button>
              <Button variant="outline" onClick={() => setShowConvenioModal(false)} className="flex-1">Cancelar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
