import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, CreditCard, PawPrint, Search, ChevronRight, Shield, Plus, X, Star, Calendar, History, Pencil, Check, Inbox, CheckCircle, XCircle, Loader2, Send, Dog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import api, { API_BASE } from '@/lib/api';
import CareRequestsClient from '@/components/CareRequestsClient';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const PET_SIZE_LABEL = { pequeno: 'Pequeño', mediano: 'Mediano', grande: 'Grande' };

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [pets, setPets] = useState([]);
  const [clientReviews, setClientReviews] = useState([]);
  const [contactRequestsSent, setContactRequestsSent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests');
  
  // Pet management states
  const [showPetForm, setShowPetForm] = useState(false);
  const [newPet, setNewPet] = useState({ name: '', type: 'perro', breed: '', size: 'mediano', age: '', notes: '' });
  const [savingPet, setSavingPet] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [editPetData, setEditPetData] = useState({});

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [userRes, subRes, favRes, petRes, reviewRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/subscription/my').catch(() => ({ data: { has_subscription: false } })),
        api.get('/favorites').catch(() => ({ data: [] })),
        api.get('/pets').catch(() => ({ data: [] })),
        api.get('/reviews/client/me').catch(() => ({ data: [] }))
      ]);
      
      // Redirect providers to their dashboard
      if (userRes.data.role === 'provider' || userRes.data.provider) {
        navigate('/provider/dashboard');
        return;
      }
      
      setUser(userRes.data);
      setSubscription(subRes.data);
      setFavorites(favRes.data);
      setPets(petRes.data);
      setClientReviews(reviewRes.data);

      // Load sent contact requests for premium clients
      if (subRes.data?.has_subscription) {
        try {
          const crRes = await api.get('/contact-requests/sent');
          setContactRequestsSent(crRes.data);
        } catch {}
      }
    } catch { navigate('/login'); }
    finally { setLoading(false); }
  };

  const handleAddPet = async () => {
    if (!newPet.name.trim()) { toast.error('Nombre requerido'); return; }
    setSavingPet(true);
    try {
      const res = await api.post('/pets', newPet);
      setPets(prev => [...prev, res.data]);
      setShowPetForm(false);
      setNewPet({ name: '', type: 'perro', breed: '', size: 'mediano', age: '', notes: '' });
      toast.success('Registro agregado');
    } catch { toast.error('Error al guardar'); }
    finally { setSavingPet(false); }
  };

  const handleEditPet = async (petId) => {
    if (!editPetData.name?.trim()) { toast.error('Nombre requerido'); return; }
    setSavingPet(true);
    try {
      await api.put(`/pets/${petId}`, editPetData);
      setPets(prev => prev.map(p => p.pet_id === petId ? { ...p, ...editPetData } : p));
      setEditingPet(null);
      toast.success('Registro actualizado');
    } catch { toast.error('Error al guardar'); }
    finally { setSavingPet(false); }
  };

  const getPhotoUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${API_URL}${path}`;
  };

  if (loading || !user) {
    return (<div className="min-h-screen flex items-center justify-center"><div className="w-16 h-16 border-4 border-[#00e7ff] border-t-transparent rounded-full animate-spin" /></div>);
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="dashboard-page">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#00e7ff] to-[#00c4d4] rounded-2xl p-6 text-white mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Panel Cliente</h1>
              <p className="text-[#33404f] text-sm font-medium">Hola, {user.name}!</p>
            </div>
            <Link to="/search">
              <Button className="bg-[#000000] text-white hover:bg-[#4a5568]"><Search className="w-4 h-4 mr-2" /> Buscar</Button>
            </Link>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-2 mb-6 border-b overflow-x-auto bg-white rounded-t-xl p-2">
          {[
            { key: 'requests', label: 'Mis Solicitudes', icon: Inbox },
            { key: 'favorites', label: 'Favoritos', icon: Heart },
            { key: 'messages', label: 'Mensajes', icon: MessageCircle },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === key
                  ? 'bg-[#00e7ff] text-[#33404f]'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content: Solicitudes */}
        {activeTab === 'requests' && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <CareRequestsClient />
          </div>
        )}

        {/* Tab Content: Favoritos */}
        {activeTab === 'favorites' && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-[#00e7ff]" />
              Mis Favoritos
            </h2>
            {favorites.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>No tienes favoritos aún</p>
                <Link to="/search" className="text-[#00e7ff] hover:underline text-sm">Buscar servicios</Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {favorites.map(fav => (
                  <Link key={fav.provider_id} to={`/provider/${fav.provider_id}`} className="border rounded-xl p-4 hover:shadow-md transition-shadow flex items-center gap-4">
                    <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center">
                      {fav.photos?.[0] ? (
                        <img src={fav.photos[0]} alt={fav.business_name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <PawPrint className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold">{fav.business_name}</h4>
                      <p className="text-sm text-gray-500">{fav.comuna}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Content: Mensajes */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-[#00e7ff]" />
              Mensajes
            </h2>
            <div className="text-center py-12 text-gray-500">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Tus conversaciones con residencias</p>
              <Link to="/chat" className="text-[#00e7ff] hover:underline text-sm">Ir al chat</Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Dashboard;
