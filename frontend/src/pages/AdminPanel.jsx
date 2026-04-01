import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle, XCircle, Badge, Eye, CreditCard, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, BarChart3, Camera, FileText, User, Newspaper, Handshake, Upload, Download, Crown, Star, X } from 'lucide-react';
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
  const [convenioForm, setConvenioForm] = useState({ name: '', logo: '', description: '', location: '', plans: [], featured: false, discount_code: '', contact_email: '', website: '', services: [] });
  const [showResidenciaModal, setShowResidenciaModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [editProviderTab, setEditProviderTab] = useState('profile');
  const [editProfileForm, setEditProfileForm] = useState({});
  const [editServicesForm, setEditServicesForm] = useState({ residencias: { price_from: '', description: '' }, 'cuidado-domicilio': { price_from: '', description: '' }, 'salud-mental': { price_from: '', description: '' } });
  const [editAmenities, setEditAmenities] = useState([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [residenciaForm, setResidenciaForm] = useState({ business_name: '', email: '', phone: '', address: '', region: '', comuna: '', website: '', facebook: '', instagram: '', place_id: '' });
  const [residenciaServices, setResidenciaServices] = useState({
    residencias: { price_from: '', description: '' },
    'cuidado-domicilio': { price_from: '', description: '' },
    'salud-mental': { price_from: '', description: '' },
  });
  const [bulkResults, setBulkResults] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [reviewFilter, setReviewFilter] = useState('pending');
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [trafficData, setTrafficData] = useState(null);
  const [trafficMetrics, setTrafficMetrics] = useState(null);
  const [loadingTraffic, setLoadingTraffic] = useState(false);
  const [trafficFilter, setTrafficFilter] = useState('all');
  const [trafficResidenceFilter, setTrafficResidenceFilter] = useState('');

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

  const loadReviews = async (filter) => {
    setLoadingReviews(true);
    try {
      const res = await api.get(`/admin/reviews?status=${filter || reviewFilter}`);
      setPendingReviews(res.data.reviews || []);
    } catch (e) {
      console.error('Error loading reviews:', e);
    } finally {
      setLoadingReviews(false);
    }
  };

  const loadTrafficData = async () => {
    setLoadingTraffic(true);
    try {
      const [leadsRes, metricsRes] = await Promise.all([
        api.get('/admin/leads'),
        api.get('/admin/leads/metrics')
      ]);
      setTrafficData(leadsRes.data);
      setTrafficMetrics(metricsRes.data);
    } catch (e) {
      console.error('Error loading traffic data:', e);
    } finally {
      setLoadingTraffic(false);
    }
  };

  const handleApproveReview = async (reviewId) => {
    try {
      await api.post(`/admin/reviews/${reviewId}/approve`);
      toast.success('Resena aprobada');
      loadReviews();
    } catch (e) {
      toast.error('Error al aprobar');
    }
  };

  const handleRejectReview = async (reviewId) => {
    if (!window.confirm('Eliminar esta resena?')) return;
    try {
      await api.post(`/admin/reviews/${reviewId}/reject`);
      toast.success('Resena eliminada');
      loadReviews();
    } catch (e) {
      toast.error('Error al eliminar');
    }
  };

  const openEditProvider = async (providerId) => {
    try {
      const res = await api.get(`/admin/providers/${providerId}/detail`);
      const p = res.data;
      setEditingProvider(p);
      setEditProfileForm({
        business_name: p.business_name || '', phone: p.phone || '', address: p.address || '',
        region: p.region || '', comuna: p.comuna || '', place_id: p.place_id || '',
        youtube_video_url: p.youtube_video_url || '',
      });
      const svcMap = {};
      (p.services || []).forEach(s => { svcMap[s.service_type] = s; });
      setEditServicesForm({
        residencias: { price_from: svcMap['residencias']?.price_from || '', description: svcMap['residencias']?.description || '' },
        'cuidado-domicilio': { price_from: svcMap['cuidado-domicilio']?.price_from || '', description: svcMap['cuidado-domicilio']?.description || '' },
        'salud-mental': { price_from: svcMap['salud-mental']?.price_from || '', description: svcMap['salud-mental']?.description || '' },
      });
      setEditAmenities(p.amenities || []);
      setEditProviderTab('profile');
    } catch (err) { toast.error('Error al cargar proveedor'); }
  };

  const saveEditProfile = async () => {
    if (!editingProvider) return;
    try {
      const services = [];
      Object.entries(editServicesForm).forEach(([type, data]) => {
        const price = parseInt(data.price_from) || 0;
        if (price > 0 || data.description) services.push({ service_type: type, price_from: price, description: data.description || '' });
      });
      await api.put(`/admin/providers/${editingProvider.provider_id}/profile`, { ...editProfileForm, services });
      toast.success('Perfil actualizado');
      loadData();
      // Refresh provider detail
      const res = await api.get(`/admin/providers/${editingProvider.provider_id}/detail`);
      setEditingProvider(res.data);
    } catch (err) { toast.error('Error al guardar'); }
  };

  const uploadAdminGallery = async (e) => {
    if (!editingProvider) return;
    const files = Array.from(e.target.files);
    setUploadingPhoto(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        await api.post(`/admin/providers/${editingProvider.provider_id}/gallery/upload`, formData);
      }
      toast.success(`${files.length} foto(s) subida(s)`);
      const res = await api.get(`/admin/providers/${editingProvider.provider_id}/detail`);
      setEditingProvider(res.data);
    } catch (err) { toast.error(err.response?.data?.detail || 'Error al subir'); }
    finally { setUploadingPhoto(false); }
  };

  const deleteAdminGallery = async (photoId) => {
    if (!editingProvider) return;
    try {
      await api.delete(`/admin/providers/${editingProvider.provider_id}/gallery/${photoId}`);
      toast.success('Foto eliminada');
      setEditingProvider(prev => ({ ...prev, gallery: prev.gallery.filter(p => p.photo_id !== photoId) }));
    } catch (err) { toast.error('Error al eliminar'); }
  };

  // Premium Gallery Admin Functions
  const uploadAdminPremiumGallery = async (e) => {
    if (!editingProvider) return;
    const files = Array.from(e.target.files);
    setUploadingPhoto(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        await api.post(`/admin/providers/${editingProvider.provider_id}/premium-gallery/upload`, formData);
      }
      toast.success(`${files.length} foto(s) premium subida(s)`);
      const res = await api.get(`/admin/providers/${editingProvider.provider_id}/detail`);
      setEditingProvider(res.data);
    } catch (err) { toast.error(err.response?.data?.detail || 'Error al subir'); }
    finally { setUploadingPhoto(false); }
  };

  const deleteAdminPremiumGallery = async (photoId) => {
    if (!editingProvider) return;
    try {
      await api.delete(`/admin/providers/${editingProvider.provider_id}/premium-gallery/${photoId}`);
      toast.success('Foto premium eliminada');
      setEditingProvider(prev => ({ ...prev, premium_gallery: (prev.premium_gallery || []).filter(p => p.photo_id !== photoId) }));
    } catch (err) { toast.error('Error al eliminar'); }
  };

  const toggleAdminAmenity = async (amenity) => {
    if (!editingProvider) return;
    const updated = editAmenities.includes(amenity) ? editAmenities.filter(a => a !== amenity) : [...editAmenities, amenity];
    setEditAmenities(updated);
    try {
      await api.put(`/admin/providers/${editingProvider.provider_id}/amenities`, { amenities: updated });
    } catch (err) { toast.error('Error al actualizar'); }
  };

  const AMENITY_CATEGORIES = [
    { name: 'Cuidado y Salud', items: ['geriatria', 'enfermeria', 'kinesiologia', 'psicologia', 'nutricion', 'fonoaudiologia', 'terapia_ocupacional', 'medico_residente'] },
    { name: 'Servicios e Instalaciones', items: ['aire_acondicionado', 'calefaccion', 'camaras_seguridad', 'lavanderia', 'cocina_propia', 'estacionamiento', 'jardin', 'capilla'] },
    { name: 'Habitaciones', items: ['bano_privado', 'tv', 'boton_asistencia', 'wifi', 'habitacion_individual', 'habitacion_compartida'] },
    { name: 'Actividades', items: ['actividades_familiares', 'celebraciones', 'talleres_cognitivos', 'talleres_actividad_fisica', 'salidas_recreativas', 'musicoterapia'] },
  ];
  const formatAmenityName = (a) => a.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());


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
            <button onClick={() => { setActiveTab('traffic'); if (!trafficData) loadTrafficData(); }} className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === 'traffic' ? 'text-[#00e7ff] border-b-2 border-[#00e7ff]' : 'text-gray-500'}`} data-testid="tab-traffic">
              <BarChart3 className="w-4 h-4 inline mr-1" />Trafico / Leads
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
            <button onClick={() => { setActiveTab('reviews'); loadReviews('pending'); }} className={`px-6 py-4 font-medium whitespace-nowrap ${activeTab === 'reviews' ? 'text-[#00e7ff] border-b-2 border-[#00e7ff]' : 'text-gray-500'}`} data-testid="tab-reviews">
              Resenas
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
                <div className="flex justify-end mb-2">
                  <Button
                    onClick={async () => {
                      try {
                        toast.info('Sincronizando ratings de Google...');
                        await api.post('/admin/sync-google-ratings');
                        toast.success('Sincronización iniciada. Los ratings se actualizarán en ~2 minutos.');
                      } catch (err) { toast.error('Error al sincronizar'); }
                    }}
                    size="sm"
                    className="bg-[#000000] hover:bg-[#4a5568] text-white"
                    data-testid="sync-google-ratings-btn"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Sincronizar Ratings
                  </Button>
                </div>
                {allProviders.filter(p => p.approved).map(p => (
                  <div key={p.provider_id} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden">
                          {(p.profile_photo || p.gallery?.[0]?.url || p.photos?.[0]) && <img src={p.profile_photo || p.gallery?.[0]?.url || p.photos?.[0]} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold">{p.business_name}</h3>
                            {p.verified && <ShieldCheck className="w-5 h-5 text-[#00e7ff]" />}
                          </div>
                          <p className="text-sm text-gray-500">{p.comuna || p.region || ''}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Button size="sm" variant="outline" onClick={() => openEditProvider(p.provider_id)} data-testid={`edit-provider-${p.provider_id}`}><Pencil className="w-4 h-4" /></Button>
                        <Link to={`/provider/${p.provider_id}`}><Button variant="outline" size="sm"><Eye className="w-4 h-4" /></Button></Link>
                        <Button size="sm" variant={p.is_featured_admin ? "default" : "outline"} className={p.is_featured_admin ? "bg-yellow-400 hover:bg-yellow-500 text-black" : ""} onClick={async () => {
                          try {
                            const res = await api.post(`/admin/providers/${p.provider_id}/toggle-featured`);
                            setAllProviders(prev => prev.map(x => x.provider_id === p.provider_id ? {...x, is_featured_admin: res.data.is_featured_admin} : x));
                            toast.success(res.data.is_featured_admin ? 'Destacada' : 'Destacado removido');
                          } catch { toast.error('Error'); }
                        }} data-testid={`toggle-featured-${p.provider_id}`}>
                          <Star className="w-4 h-4" />{p.is_featured_admin ? '' : ''}
                        </Button>
                        <Button size="sm" variant={p.is_subscribed ? "default" : "outline"} className={p.is_subscribed ? "bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f]" : ""} onClick={async () => {
                          try {
                            const res = await api.post(`/admin/providers/${p.provider_id}/toggle-subscribed`);
                            setAllProviders(prev => prev.map(x => x.provider_id === p.provider_id ? {...x, is_subscribed: res.data.is_subscribed} : x));
                            toast.success(res.data.is_subscribed ? 'Premium activado' : 'Premium desactivado');
                          } catch { toast.error('Error'); }
                        }} data-testid={`toggle-subscribed-${p.provider_id}`}>
                          <Crown className="w-4 h-4" />
                        </Button>
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

            {activeTab === 'traffic' && (
              <div className="space-y-6" data-testid="traffic-tab">
                {loadingTraffic ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-10 h-10 border-4 border-[#00e7ff] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : trafficMetrics ? (
                  <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      <div className="bg-gradient-to-br from-[#00e7ff]/10 to-[#00e7ff]/5 rounded-xl p-4 border border-[#00e7ff]/20" data-testid="traffic-total">
                        <p className="text-xs text-gray-500 font-medium">Total Leads</p>
                        <p className="text-2xl font-bold text-[#33404f]">{trafficMetrics.summary.total_leads}</p>
                      </div>
                      <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200" data-testid="traffic-pending">
                        <p className="text-xs text-gray-500 font-medium">Pendientes</p>
                        <p className="text-2xl font-bold text-yellow-600">{trafficMetrics.summary.contact_requests.pending + trafficMetrics.summary.care_requests.active}</p>
                      </div>
                      <div className="bg-green-50 rounded-xl p-4 border border-green-200" data-testid="traffic-accepted">
                        <p className="text-xs text-gray-500 font-medium">Aceptados</p>
                        <p className="text-2xl font-bold text-green-600">{trafficMetrics.summary.total_conversions}</p>
                      </div>
                      <div className="bg-red-50 rounded-xl p-4 border border-red-200" data-testid="traffic-rejected">
                        <p className="text-xs text-gray-500 font-medium">Rechazados</p>
                        <p className="text-2xl font-bold text-red-500">{trafficMetrics.summary.contact_requests.rejected}</p>
                      </div>
                      <div className="bg-purple-50 rounded-xl p-4 border border-purple-200" data-testid="traffic-conversion">
                        <p className="text-xs text-gray-500 font-medium">Tasa Conversion</p>
                        <p className="text-2xl font-bold text-purple-600">{trafficMetrics.summary.conversion_rate}%</p>
                      </div>
                    </div>

                    {/* Breakdown by type */}
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-xl p-5">
                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <User className="w-4 h-4 text-[#00e7ff]" />Solicitudes de Contacto
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between"><span className="text-gray-500">Total</span><span className="font-bold">{trafficMetrics.summary.contact_requests.total}</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">Pendientes</span><span className="font-bold text-yellow-600">{trafficMetrics.summary.contact_requests.pending}</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">Aceptados</span><span className="font-bold text-green-600">{trafficMetrics.summary.contact_requests.accepted}</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">Rechazados</span><span className="font-bold text-red-500">{trafficMetrics.summary.contact_requests.rejected}</span></div>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-5">
                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#00e7ff]" />Solicitudes de Cuidado
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between"><span className="text-gray-500">Total</span><span className="font-bold">{trafficMetrics.summary.care_requests.total}</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">Activas</span><span className="font-bold text-yellow-600">{trafficMetrics.summary.care_requests.active}</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">Completadas</span><span className="font-bold text-green-600">{trafficMetrics.summary.care_requests.completed}</span></div>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-5">
                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <Handshake className="w-4 h-4 text-[#00e7ff]" />Propuestas Enviadas
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between"><span className="text-gray-500">Total</span><span className="font-bold">{trafficMetrics.summary.proposals.total}</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">Pendientes</span><span className="font-bold text-yellow-600">{trafficMetrics.summary.proposals.pending}</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">Aceptadas</span><span className="font-bold text-green-600">{trafficMetrics.summary.proposals.accepted}</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">Rechazadas</span><span className="font-bold text-red-500">{trafficMetrics.summary.proposals.rejected}</span></div>
                        </div>
                      </div>
                    </div>

                    {/* Per-Residence Table */}
                    {trafficMetrics.per_residence?.length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-[#33404f] mb-3">Leads por Residencia</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm" data-testid="traffic-residence-table">
                            <thead>
                              <tr className="border-b text-left bg-gray-50">
                                <th className="py-3 px-3 font-semibold text-gray-600">Residencia</th>
                                <th className="py-3 px-2 font-semibold text-gray-600">Comuna</th>
                                <th className="py-3 px-2 font-semibold text-gray-600 text-center">Total</th>
                                <th className="py-3 px-2 font-semibold text-gray-600 text-center">Pendientes</th>
                                <th className="py-3 px-2 font-semibold text-gray-600 text-center">Aceptados</th>
                                <th className="py-3 px-2 font-semibold text-gray-600 text-center">Rechazados</th>
                                <th className="py-3 px-2 font-semibold text-gray-600 text-center">Conversion</th>
                              </tr>
                            </thead>
                            <tbody>
                              {trafficMetrics.per_residence.map((r, i) => (
                                <tr key={r.provider_user_id} className="border-b hover:bg-gray-50" data-testid={`residence-row-${i}`}>
                                  <td className="py-3 px-3">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-[#33404f]">{r.business_name}</span>
                                      {r.is_subscribed && <span className="text-[9px] px-1.5 py-0.5 bg-[#00e7ff]/20 text-[#33404f] rounded-full font-bold">Premium</span>}
                                    </div>
                                  </td>
                                  <td className="py-3 px-2 text-gray-500">{r.comuna}</td>
                                  <td className="py-3 px-2 text-center font-bold">{r.total}</td>
                                  <td className="py-3 px-2 text-center text-yellow-600">{r.pending}</td>
                                  <td className="py-3 px-2 text-center text-green-600">{r.accepted}</td>
                                  <td className="py-3 px-2 text-center text-red-500">{r.rejected}</td>
                                  <td className="py-3 px-2 text-center">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${r.conversion_rate >= 50 ? 'bg-green-100 text-green-700' : r.conversion_rate > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                                      {r.conversion_rate}%
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* All Leads Detail Table */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-[#33404f]">Historial de Interacciones</h3>
                        <div className="flex gap-2">
                          <select
                            value={trafficFilter}
                            onChange={e => setTrafficFilter(e.target.value)}
                            className="h-9 px-3 border-2 border-gray-200 rounded-lg text-sm text-[#33404f] bg-white"
                            data-testid="traffic-type-filter"
                          >
                            <option value="all">Todos los tipos</option>
                            <option value="contact_request">Solicitudes de Contacto</option>
                            <option value="care_request">Solicitudes de Cuidado</option>
                            <option value="proposal">Propuestas</option>
                          </select>
                          <select
                            value={trafficResidenceFilter}
                            onChange={e => setTrafficResidenceFilter(e.target.value)}
                            className="h-9 px-3 border-2 border-gray-200 rounded-lg text-sm text-[#33404f] bg-white max-w-[200px]"
                            data-testid="traffic-residence-filter"
                          >
                            <option value="">Todas las residencias</option>
                            {trafficMetrics.per_residence?.map(r => (
                              <option key={r.provider_user_id} value={r.provider_user_id}>{r.business_name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm" data-testid="traffic-detail-table">
                          <thead>
                            <tr className="border-b text-left bg-gray-50">
                              <th className="py-3 px-2 font-semibold text-gray-600">Fecha</th>
                              <th className="py-3 px-2 font-semibold text-gray-600">Tipo</th>
                              <th className="py-3 px-2 font-semibold text-gray-600">Cliente</th>
                              <th className="py-3 px-2 font-semibold text-gray-600">Email</th>
                              <th className="py-3 px-2 font-semibold text-gray-600">Residencia</th>
                              <th className="py-3 px-2 font-semibold text-gray-600">Mensaje</th>
                              <th className="py-3 px-2 font-semibold text-gray-600">Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(() => {
                              if (!trafficData) return null;
                              let allLeads = [];

                              if (trafficFilter === 'all' || trafficFilter === 'contact_request') {
                                allLeads = allLeads.concat(trafficData.contact_requests.map(cr => ({
                                  date: cr.created_at,
                                  type: 'Solicitud Contacto',
                                  type_key: 'contact_request',
                                  client: cr.client_name || 'Cliente',
                                  email: cr.client_email || '',
                                  residence: cr.provider_business_name || cr.provider_name || '',
                                  residence_id: cr.provider_user_id,
                                  message: cr.message || '',
                                  status: cr.status
                                })));
                              }

                              if (trafficFilter === 'all' || trafficFilter === 'care_request') {
                                allLeads = allLeads.concat(trafficData.care_requests.map(cr => ({
                                  date: cr.created_at,
                                  type: 'Solicitud Cuidado',
                                  type_key: 'care_request',
                                  client: cr.client_name || 'Cliente',
                                  email: cr.client_email || '',
                                  residence: `${cr.comuna || ''} (${cr.service_type || ''})`,
                                  residence_id: '',
                                  message: cr.description || '',
                                  status: cr.status
                                })));
                              }

                              if (trafficFilter === 'all' || trafficFilter === 'proposal') {
                                allLeads = allLeads.concat(trafficData.proposals.map(p => ({
                                  date: p.created_at,
                                  type: 'Propuesta',
                                  type_key: 'proposal',
                                  client: p.client_name || p.care_request_info?.client_name || '',
                                  email: p.client_email || '',
                                  residence: p.provider_business_name || '',
                                  residence_id: p.provider_id,
                                  message: p.message || '',
                                  status: p.status
                                })));
                              }

                              // Filter by residence
                              if (trafficResidenceFilter) {
                                allLeads = allLeads.filter(l => l.residence_id === trafficResidenceFilter);
                              }

                              // Sort by date descending
                              allLeads.sort((a, b) => new Date(b.date) - new Date(a.date));

                              if (allLeads.length === 0) {
                                return (
                                  <tr><td colSpan={7} className="py-8 text-center text-gray-400">No hay registros con estos filtros</td></tr>
                                );
                              }

                              return allLeads.slice(0, 100).map((lead, idx) => (
                                <tr key={idx} className="border-b hover:bg-gray-50" data-testid={`lead-detail-${idx}`}>
                                  <td className="py-2.5 px-2 text-gray-500 text-xs whitespace-nowrap">{lead.date ? new Date(lead.date).toLocaleDateString('es-CL') : '-'}</td>
                                  <td className="py-2.5 px-2">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                      lead.type_key === 'contact_request' ? 'bg-blue-100 text-blue-700' :
                                      lead.type_key === 'care_request' ? 'bg-cyan-100 text-cyan-700' :
                                      'bg-purple-100 text-purple-700'
                                    }`}>{lead.type}</span>
                                  </td>
                                  <td className="py-2.5 px-2 font-medium text-[#33404f] text-xs">{lead.client}</td>
                                  <td className="py-2.5 px-2 text-gray-500 text-xs">{lead.email}</td>
                                  <td className="py-2.5 px-2 text-gray-700 text-xs">{lead.residence}</td>
                                  <td className="py-2.5 px-2 text-gray-500 text-xs max-w-[200px] truncate" title={lead.message}>{lead.message}</td>
                                  <td className="py-2.5 px-2">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                      lead.status === 'accepted' || lead.status === 'completed' ? 'bg-green-100 text-green-700' :
                                      lead.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                      lead.status === 'pending' || lead.status === 'active' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-gray-100 text-gray-500'
                                    }`}>{
                                      lead.status === 'accepted' ? 'Aceptado' :
                                      lead.status === 'completed' ? 'Completado' :
                                      lead.status === 'rejected' ? 'Rechazado' :
                                      lead.status === 'pending' ? 'Pendiente' :
                                      lead.status === 'active' ? 'Activo' :
                                      lead.status || '-'
                                    }</span>
                                  </td>
                                </tr>
                              ));
                            })()}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 text-center py-8">Error al cargar datos de trafico</p>
                )}
              </div>
            )}

            {activeTab === 'blog' && (
              <div className="space-y-4" data-testid="blog-tab">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-[#33404f]">Actualidad Senior - Blog</h3>
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
                            <td className="py-3 px-2 text-gray-500">
                              {l.contact_type === 'discount_code' ? (
                                <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full">Código</span>
                              ) : l.contact_type ? (
                                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{l.contact_type}</span>
                              ) : '-'}
                            </td>
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
                  <Button onClick={() => { setEditingConvenio(null); setConvenioForm({ name: '', logo: '', description: '', location: '', plans: [{ name: '', category: '', price: '', uf: '' }], featured: false, discount_code: '', contact_email: '', website: '', services: [] }); setShowConvenioModal(true); }} className="bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f]" data-testid="new-convenio-btn">
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
                          <p className="text-xs text-gray-400">{c.plans?.length || 0} planes | {c.location || 'Sin ubicación'}{c.discount_code ? ` | Código: ${c.discount_code}` : ''}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => { setEditingConvenio(c); setConvenioForm({ name: c.name, logo: c.logo, description: c.description, location: c.location || '', plans: c.plans || [{ name: '', category: '', price: '', uf: '' }], featured: c.featured, discount_code: c.discount_code || '', contact_email: c.contact_email || '', website: c.website || '', services: c.services || [] }); setShowConvenioModal(true); }} className="p-2 hover:bg-gray-100 rounded-lg">
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


            {activeTab === 'reviews' && (
              <div className="space-y-4" data-testid="reviews-tab">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-lg font-bold">Moderacion de Resenas</h3>
                  <div className="flex gap-2 ml-auto">
                    {['pending', 'approved'].map(f => (
                      <button
                        key={f}
                        onClick={() => { setReviewFilter(f); loadReviews(f); }}
                        className={`px-3 py-1 text-sm rounded-full ${reviewFilter === f ? 'bg-[#00e7ff] text-[#33404f] font-bold' : 'bg-gray-100 text-gray-600'}`}
                        data-testid={`review-filter-${f}`}
                      >
                        {f === 'pending' ? 'Pendientes' : 'Aprobadas'}
                      </button>
                    ))}
                  </div>
                </div>
                {loadingReviews ? (
                  <div className="text-center py-8"><div className="animate-spin w-8 h-8 border-4 border-[#00e7ff] border-t-transparent rounded-full mx-auto" /></div>
                ) : pendingReviews.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">No hay resenas {reviewFilter === 'pending' ? 'pendientes' : 'aprobadas'}</div>
                ) : (
                  <div className="space-y-3">
                    {pendingReviews.map(review => (
                      <div key={review.review_id} className="bg-gray-50 rounded-xl p-4" data-testid={`review-${review.review_id}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold text-sm">{review.user_name || 'Usuario'}</span>
                              <span className="text-xs text-gray-400">{review.user_email}</span>
                              <div className="flex gap-0.5">
                                {[1,2,3,4,5].map(s => (
                                  <span key={s} className={`text-sm ${s <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}>&#9733;</span>
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-[#00e7ff] font-medium mb-1">{review.provider_name}</p>
                            <p className="text-sm text-gray-700">{review.comment}</p>
                            <p className="text-xs text-gray-400 mt-1">{new Date(review.created_at).toLocaleDateString('es-CL')}</p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            {!review.approved && (
                              <button
                                onClick={() => handleApproveReview(review.review_id)}
                                className="px-3 py-1 text-xs font-bold bg-green-500 text-white rounded-full hover:bg-green-600"
                                data-testid={`approve-review-${review.review_id}`}
                              >
                                Aprobar
                              </button>
                            )}
                            <button
                              onClick={() => handleRejectReview(review.review_id)}
                              className="px-3 py-1 text-xs font-bold bg-red-500 text-white rounded-full hover:bg-red-600"
                              data-testid={`reject-review-${review.review_id}`}
                            >
                              Eliminar
                            </button>
                          </div>
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
                    <Button onClick={() => { setResidenciaForm({ business_name: '', email: '', phone: '', address: '', region: '', comuna: '', website: '', facebook: '', instagram: '', place_id: '' }); setResidenciaServices({ residencias: { price_from: '', description: '' }, 'cuidado-domicilio': { price_from: '', description: '' }, 'salud-mental': { price_from: '', description: '' } }); setShowResidenciaModal(true); }} className="bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f]" data-testid="new-residencia-btn">
                      <Plus className="w-4 h-4 mr-1" /> Nueva Residencia
                    </Button>
                  </div>
                </div>

                {/* Bulk Upload */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-[#33404f] mb-2">Carga Masiva desde Excel</h3>
                  <p className="text-sm text-gray-500 mb-4">Sube un archivo <strong>.csv</strong> o <strong>.xlsx</strong>. Columna obligatoria: <strong>nombre residencia</strong>. Si no hay email, se genera automáticamente. Columnas soportadas: comuna, direccion, telefono, rating, website, latitud, longitud, imagenes, servicios, facebook, instagram, etc.</p>
                  
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <Button variant="outline" className="text-sm" data-testid="download-providers-btn" onClick={async () => {
                      try {
                        const token = localStorage.getItem('jwt_token');
                        const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/residencias/export-csv`, {
                          headers: { 'Authorization': `Bearer ${token}` }
                        });
                        if (!res.ok) throw new Error('Error al descargar');
                        const blob = await res.blob();
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url; a.download = 'residencias_export.csv'; a.click();
                        toast.success('CSV descargado');
                      } catch (err) {
                        toast.error(String(err?.message || 'Error al descargar'));
                      }
                    }}>
                      <Download className="w-4 h-4 mr-1" /> Descargar Residencias (CSV)
                    </Button>

                    <Button variant="outline" className="text-sm" data-testid="download-template-btn" onClick={() => {
                      const headers = 'codigo,nombre,email,telefono,whatsapp,direccion,comuna,region,descripcion,tipo,tipo_instalacion,horario_atencion,bio,youtube,place_id,precio_residencias,desc_residencias,precio_cuidado_domicilio,desc_cuidado_domicilio,precio_salud_mental,desc_salud_mental,amenidades,website,facebook,instagram,imagen_1,imagen_2,imagen_3,imagen_premium_1,imagen_premium_2,imagen_premium_3,imagen_premium_4,imagen_premium_5\n';
                      const example = ',Residencia Ejemplo,ejemplo@email.cl,+56912345678,+56912345678,Av. Principal 123,Las Condes,Region Metropolitana,Residencia de adultos mayores con atencion 24/7,residencias,Residencia Privada,Lunes a Viernes 9-18h,Contamos con equipo medico permanente,https://youtube.com/watch?v=xxx,ChIJ...,1500000,Suite premium con vista al jardin,50000,Visitas a domicilio,80000,Apoyo psicologico,"geriatria,enfermeria,wifi,aire_acondicionado,bano_privado",https://www.ejemplo.cl,https://facebook.com/ejemplo,https://instagram.com/ejemplo,https://ejemplo.com/foto1.jpg,https://ejemplo.com/foto2.jpg,https://ejemplo.com/foto3.jpg,https://ejemplo.com/premium1.jpg,https://ejemplo.com/premium2.jpg,,,\n';
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
                          toast.success(`${data.created} creadas, ${data.updated || 0} actualizadas`);
                          if (data.errors > 0) toast.error(`${data.errors} errores`);
                          loadData();
                        } catch (err) {
                          toast.error(String(err?.message || 'Error al subir archivo'));
                        } finally {
                          setUploading(false);
                          e.target.value = '';
                        }
                      }} />
                      <Button className="bg-[#000000] hover:bg-[#4a5568] text-white" disabled={uploading} asChild>
                        <span><Upload className="w-4 h-4 mr-1" />{uploading ? 'Subiendo...' : 'Subir Excel'}</span>
                      </Button>
                    </label>
                  </div>

                  {/* Results */}
                  {bulkResults && (
                    <div className="mt-4">
                      <div className="flex gap-4 mb-3">
                        <span className="text-sm font-bold text-green-600">Creadas: {bulkResults.created}</span>
                        {(bulkResults.updated > 0) && <span className="text-sm font-bold text-blue-600">Actualizadas: {bulkResults.updated}</span>}
                        {bulkResults.errors > 0 && <span className="text-sm font-bold text-red-500">Errores: {bulkResults.errors}</span>}
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b text-left">
                              <th className="py-2 px-2 font-semibold">Código</th>
                              <th className="py-2 px-2 font-semibold">Residencia</th>
                              <th className="py-2 px-2 font-semibold">Email</th>
                              <th className="py-2 px-2 font-semibold">Contraseña</th>
                              <th className="py-2 px-2 font-semibold">Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {bulkResults.results.map((r, i) => (
                              <tr key={i} className="border-b">
                                <td className="py-2 px-2 font-mono text-xs text-gray-500">{r.codigo || '-'}</td>
                                <td className="py-2 px-2 font-medium">{r.business_name}</td>
                                <td className="py-2 px-2 text-gray-600">{r.email}</td>
                                <td className="py-2 px-2 font-mono text-xs">{r.password || '-'}</td>
                                <td className="py-2 px-2">
                                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.status === 'created' ? 'bg-green-100 text-green-700' : r.status === 'updated' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-600'}`}>
                                    {r.status === 'created' ? 'Creada' : r.status === 'updated' ? 'Actualizada' : r.detail}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <Button variant="outline" className="mt-3 text-sm" onClick={() => {
                        const csv = 'codigo,residencia,email,contraseña,estado\n' + bulkResults.results.map(r => `${r.codigo || ''},${r.business_name},${r.email},${r.password || ''},${r.status}`).join('\n');
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
              <div>
                <label className="block text-sm font-medium mb-1">Teléfono</label>
                <input type="tel" value={residenciaForm.phone} onChange={e => setResidenciaForm(p => ({ ...p, phone: e.target.value }))} className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00e7ff]" placeholder="+56 9 1234 5678" data-testid="residencia-form-phone" />
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

              {/* Precios por categoría */}
              <div className="border-t pt-3 mt-3">
                <h4 className="text-sm font-bold text-[#33404f] mb-2">Precios por Categoría</h4>
                <p className="text-xs text-gray-400 mb-3">Solo las categorías con precio aparecerán en el perfil público.</p>
                {[
                  { key: 'residencias', label: 'Residencias' },
                  { key: 'cuidado-domicilio', label: 'Cuidado a Domicilio' },
                  { key: 'salud-mental', label: 'Salud Mental' },
                ].map(({ key, label }) => (
                  <div key={key} className="p-3 bg-gray-50 rounded-xl mb-2">
                    <span className="font-semibold text-xs text-[#33404f]">{label}</span>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <input type="number" value={residenciaServices[key].price_from} onChange={e => setResidenciaServices(p => ({ ...p, [key]: { ...p[key], price_from: e.target.value } }))} className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00e7ff]" placeholder="Precio desde" data-testid={`admin-price-${key}`} />
                      <input type="text" value={residenciaServices[key].description} onChange={e => setResidenciaServices(p => ({ ...p, [key]: { ...p[key], description: e.target.value } }))} className="w-full border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#00e7ff]" placeholder="Descripción" data-testid={`admin-desc-${key}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button
                onClick={async () => {
                  if (!residenciaForm.business_name || !residenciaForm.email) { toast.error('Nombre y email son obligatorios'); return; }
                  try {
                    // Build services array
                    const services = [];
                    Object.entries(residenciaServices).forEach(([type, data]) => {
                      const price = parseInt(data.price_from) || 0;
                      if (price > 0 || data.description) {
                        services.push({ service_type: type, price_from: price, description: data.description || '' });
                      }
                    });
                    const payload = { ...residenciaForm, services };
                    const res = await api.post('/admin/residencias/create', payload);
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
                <label className="block text-sm font-medium mb-1">Código de Descuento (opcional)</label>
                <input type="text" value={convenioForm.discount_code} onChange={e => setConvenioForm(p => ({ ...p, discount_code: e.target.value }))} className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00e7ff]" placeholder="Ej: SENIOR20" data-testid="convenio-form-discount-code" />
                <p className="text-xs text-gray-400 mt-1">Si tiene código, el usuario deberá dejar sus datos para revelarlo</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Emails del Convenio (opcional, separados por coma)</label>
                <input type="text" value={convenioForm.contact_email} onChange={e => setConvenioForm(p => ({ ...p, contact_email: e.target.value }))} className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00e7ff]" placeholder="correo1@empresa.cl, correo2@empresa.cl" data-testid="convenio-form-contact-email" />
                <p className="text-xs text-gray-400 mt-1">Cada lead se enviará a todos los correos listados</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Sitio Web (opcional)</label>
                <input type="url" value={convenioForm.website} onChange={e => setConvenioForm(p => ({ ...p, website: e.target.value }))} className="w-full border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#00e7ff]" placeholder="https://www.empresa.cl" data-testid="convenio-form-website" />
                <p className="text-xs text-gray-400 mt-1">Se usa como botón "Visitar Sitio Web" en convenios con código</p>
              </div>

              {/* Services */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">Servicios y Actividades</label>
                  <button type="button" onClick={() => setConvenioForm(p => ({ ...p, services: [...p.services, { name: '', items: [''] }] }))} className="text-xs text-[#00e7ff] hover:underline" data-testid="add-service-category">+ Agregar categoría</button>
                </div>
                {convenioForm.services.map((cat, ci) => (
                  <div key={ci} className="bg-gray-50 rounded-xl p-3 mb-3 border">
                    <div className="flex items-center gap-2 mb-2">
                      <input type="text" value={cat.name} onChange={e => { const s = [...convenioForm.services]; s[ci] = { ...s[ci], name: e.target.value }; setConvenioForm(p => ({ ...p, services: s })); }} className="flex-1 border rounded-lg p-2 text-sm" placeholder="Nombre categoría (ej: Mejoramiento del Hogar)" data-testid={`service-cat-name-${ci}`} />
                      <button type="button" onClick={() => setConvenioForm(p => ({ ...p, services: p.services.filter((_, i) => i !== ci) }))} className="text-red-400 hover:text-red-600 p-1" data-testid={`delete-service-cat-${ci}`}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {cat.items.map((item, ii) => (
                      <div key={ii} className="flex items-center gap-1 mb-1 ml-2">
                        <span className="text-xs text-gray-400">•</span>
                        <input type="text" value={item} onChange={e => { const s = [...convenioForm.services]; const items = [...s[ci].items]; items[ii] = e.target.value; s[ci] = { ...s[ci], items }; setConvenioForm(p => ({ ...p, services: s })); }} className="flex-1 border rounded-lg p-1.5 text-xs" placeholder="Servicio" data-testid={`service-item-${ci}-${ii}`} />
                        <button type="button" onClick={() => { const s = [...convenioForm.services]; s[ci] = { ...s[ci], items: s[ci].items.filter((_, i) => i !== ii) }; setConvenioForm(p => ({ ...p, services: s })); }} className="text-red-300 hover:text-red-500 p-0.5">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={() => { const s = [...convenioForm.services]; s[ci] = { ...s[ci], items: [...s[ci].items, ''] }; setConvenioForm(p => ({ ...p, services: s })); }} className="text-xs text-[#00e7ff] hover:underline ml-2 mt-1" data-testid={`add-service-item-${ci}`}>+ Agregar servicio</button>
                  </div>
                ))}
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
                      <textarea value={plan.description || ''} onChange={e => { const plans = [...convenioForm.plans]; plans[idx] = { ...plans[idx], description: e.target.value }; setConvenioForm(p => ({ ...p, plans })); }} className="border rounded-lg p-2 text-xs col-span-2" placeholder="Descripción del plan" rows={2} />
                      <input type="text" value={plan.price} onChange={e => { const plans = [...convenioForm.plans]; plans[idx] = { ...plans[idx], price: e.target.value }; setConvenioForm(p => ({ ...p, plans })); }} className="border rounded-lg p-2 text-xs" placeholder="Precio ej: $8.336" />
                      <div className="flex gap-1">
                        <input type="text" value={plan.uf} onChange={e => { const plans = [...convenioForm.plans]; plans[idx] = { ...plans[idx], uf: e.target.value }; setConvenioForm(p => ({ ...p, plans })); }} className="border rounded-lg p-2 text-xs flex-1" placeholder="Valor ej: 0.22" />
                        <select value={plan.currency || 'UF'} onChange={e => { const plans = [...convenioForm.plans]; plans[idx] = { ...plans[idx], currency: e.target.value }; setConvenioForm(p => ({ ...p, plans })); }} className="border rounded-lg p-2 text-xs w-16" data-testid={`plan-currency-${idx}`}>
                          <option value="UF">UF</option>
                          <option value="$">$</option>
                        </select>
                      </div>
                      <div className="col-span-2 flex items-center gap-2">
                        <input type="checkbox" checked={plan.popular || false} onChange={e => { const plans = [...convenioForm.plans]; plans[idx] = { ...plans[idx], popular: e.target.checked }; setConvenioForm(p => ({ ...p, plans })); }} className="w-4 h-4 accent-[#00e7ff]" data-testid={`plan-popular-${idx}`} />
                        <label className="text-xs font-medium text-gray-600">Plan destacado (popular)</label>
                      </div>
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

      {/* Edit Provider Modal */}
      {editingProvider && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#33404f]">Editar: {editingProvider.business_name}</h3>
              <button onClick={() => setEditingProvider(null)} className="text-gray-400 hover:text-gray-600"><XCircle className="w-6 h-6" /></button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4 border-b pb-3">
              {[
                { key: 'profile', label: 'Perfil' },
                { key: 'gallery', label: 'Galería' },
                { key: 'amenities', label: 'Servicios' },
              ].map(t => (
                <button key={t.key} onClick={() => setEditProviderTab(t.key)} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${editProviderTab === t.key ? 'bg-[#00e7ff] text-[#33404f]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`} data-testid={`edit-tab-${t.key}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Profile Tab */}
            {editProviderTab === 'profile' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Nombre *</label>
                    <input type="text" value={editProfileForm.business_name || ''} onChange={e => setEditProfileForm(p => ({ ...p, business_name: e.target.value }))} className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#00e7ff]" data-testid="edit-name" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Teléfono</label>
                    <input type="tel" value={editProfileForm.phone || ''} onChange={e => setEditProfileForm(p => ({ ...p, phone: e.target.value }))} className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#00e7ff]" data-testid="edit-phone" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Dirección</label>
                  <input type="text" value={editProfileForm.address || ''} onChange={e => setEditProfileForm(p => ({ ...p, address: e.target.value }))} className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#00e7ff]" data-testid="edit-address" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Región</label>
                    <input type="text" value={editProfileForm.region || ''} onChange={e => setEditProfileForm(p => ({ ...p, region: e.target.value }))} className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#00e7ff]" data-testid="edit-region" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Comuna</label>
                    <input type="text" value={editProfileForm.comuna || ''} onChange={e => setEditProfileForm(p => ({ ...p, comuna: e.target.value }))} className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#00e7ff]" data-testid="edit-comuna" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Place ID</label>
                    <input type="text" value={editProfileForm.place_id || ''} onChange={e => setEditProfileForm(p => ({ ...p, place_id: e.target.value }))} className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#00e7ff]" data-testid="edit-placeid" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1 flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5 text-yellow-500" />
                    Video YouTube (Premium)
                  </label>
                  <input type="url" value={editProfileForm.youtube_video_url || ''} onChange={e => setEditProfileForm(p => ({ ...p, youtube_video_url: e.target.value }))} className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-[#00e7ff]" placeholder="https://www.youtube.com/watch?v=..." data-testid="edit-youtube-url" />
                </div>

                <div className="border-t pt-3">
                  <h4 className="text-sm font-bold text-[#33404f] mb-2">Precios por Categoría</h4>
                  {[
                    { key: 'residencias', label: 'Residencias' },
                    { key: 'cuidado-domicilio', label: 'Cuidado a Domicilio' },
                    { key: 'salud-mental', label: 'Salud Mental' },
                  ].map(({ key, label }) => (
                    <div key={key} className="p-3 bg-gray-50 rounded-lg mb-2">
                      <span className="font-semibold text-xs text-[#33404f]">{label}</span>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <input type="number" value={editServicesForm[key]?.price_from || ''} onChange={e => setEditServicesForm(p => ({ ...p, [key]: { ...p[key], price_from: e.target.value } }))} className="w-full border rounded-lg p-2 text-sm" placeholder="Precio desde" data-testid={`edit-price-${key}`} />
                        <input type="text" value={editServicesForm[key]?.description || ''} onChange={e => setEditServicesForm(p => ({ ...p, [key]: { ...p[key], description: e.target.value } }))} className="w-full border rounded-lg p-2 text-sm" placeholder="Descripción" data-testid={`edit-desc-${key}`} />
                      </div>
                    </div>
                  ))}
                </div>

                <Button onClick={saveEditProfile} className="w-full bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f]" data-testid="edit-save-profile">Guardar Perfil</Button>
              </div>
            )}

            {/* Gallery Tab */}
            {editProviderTab === 'gallery' && (
              <div className="space-y-6">
                {/* Standard Gallery */}
                <div>
                  <h4 className="text-sm font-bold text-[#33404f] mb-2">Galería Estándar</h4>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-gray-500">{editingProvider.gallery?.length || 0}/3 fotos</p>
                    {(editingProvider.gallery?.length || 0) < 3 && (
                      <label className={`px-4 py-2 bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f] font-bold text-sm rounded-lg cursor-pointer ${uploadingPhoto ? 'opacity-50 pointer-events-none' : ''}`}>
                        {uploadingPhoto ? 'Subiendo...' : 'Subir Fotos'}
                        <input type="file" multiple accept="image/*" className="hidden" onChange={uploadAdminGallery} data-testid="edit-gallery-upload" />
                      </label>
                    )}
                  </div>
                  {editingProvider.gallery?.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {editingProvider.gallery.map((photo) => (
                        <div key={photo.photo_id} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100">
                          <img src={photo.url?.startsWith('http') ? photo.url : `${process.env.REACT_APP_BACKEND_URL}${photo.url}`} alt="" className="w-full h-full object-cover" />
                          <button onClick={() => deleteAdminGallery(photo.photo_id)} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" data-testid={`delete-photo-${photo.photo_id}`}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl">
                      <Camera className="w-10 h-10 mx-auto mb-2" />
                      <p>Sin fotos en la galería</p>
                    </div>
                  )}
                </div>

                {/* Premium Gallery */}
                <div className="border-t pt-6">
                  <h4 className="text-sm font-bold text-[#33404f] mb-2 flex items-center gap-2">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    Slider Premium
                  </h4>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-sm text-gray-500">{editingProvider.premium_gallery?.length || 0}/10 fotos</p>
                    {(editingProvider.premium_gallery?.length || 0) < 10 && (
                      <label className={`px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold text-sm rounded-lg cursor-pointer ${uploadingPhoto ? 'opacity-50 pointer-events-none' : ''}`}>
                        {uploadingPhoto ? 'Subiendo...' : 'Subir Premium'}
                        <input type="file" multiple accept="image/*" className="hidden" onChange={uploadAdminPremiumGallery} data-testid="edit-premium-gallery-upload" />
                      </label>
                    )}
                  </div>
                  {editingProvider.premium_gallery?.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {editingProvider.premium_gallery.map((photo) => (
                        <div key={photo.photo_id} className="relative group aspect-[16/9] rounded-xl overflow-hidden bg-gray-100">
                          <img src={photo.url?.startsWith('http') ? photo.url : `${process.env.REACT_APP_BACKEND_URL}${photo.url}`} alt="" className="w-full h-full object-cover" />
                          <button onClick={() => deleteAdminPremiumGallery(photo.photo_id)} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" data-testid={`delete-premium-photo-${photo.photo_id}`}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400 bg-yellow-50 rounded-xl">
                      <Crown className="w-10 h-10 mx-auto mb-2 text-yellow-300" />
                      <p>Sin fotos en slider premium</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Amenities Tab */}
            {editProviderTab === 'amenities' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">Activa o desactiva los servicios. Los cambios se guardan automáticamente.</p>
                {AMENITY_CATEGORIES.map(cat => (
                  <div key={cat.name}>
                    <h4 className="text-sm font-bold text-[#33404f] mb-2">{cat.name}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {cat.items.map(amenity => (
                        <button key={amenity} onClick={() => toggleAdminAmenity(amenity)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-all text-left ${editAmenities.includes(amenity) ? 'bg-[#00e7ff]/20 text-[#33404f] border-2 border-[#00e7ff]' : 'bg-gray-100 text-gray-500 border-2 border-transparent hover:border-gray-300'}`} data-testid={`amenity-${amenity}`}>
                          {editAmenities.includes(amenity) ? '✓ ' : ''}{formatAmenityName(amenity)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
