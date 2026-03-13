import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, CreditCard, PawPrint, Search, ChevronRight, Shield, Plus, X, Star, Calendar, History, Pencil, Check, Inbox, CheckCircle, XCircle, Loader2, Send, Dog, CalendarCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import api, { API_BASE } from '@/lib/api';
import CareRequestsClient from '@/components/CareRequestsClient';
import SubscriptionCard from '@/components/SubscriptionCard';

const API_URL = process.env.REACT_APP_BACKEND_URL;
const PET_SIZE_LABEL = { pequeno: 'Pequeño', mediano: 'Mediano', grande: 'Grande' };

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [pets, setPets] = useState([]);
  const [clientReviews, setClientReviews] = useState([]);
  const [bookings, setBookings] = useState([]);
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
      const [userRes, subRes, favRes, petRes, reviewRes, bookingRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/subscription/my').catch(() => ({ data: { has_subscription: false } })),
        api.get('/favorites').catch(() => ({ data: [] })),
        api.get('/pets').catch(() => ({ data: [] })),
        api.get('/reviews/client/me').catch(() => ({ data: [] })),
        api.get('/bookings/my').catch(() => ({ data: [] }))
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
      setBookings(bookingRes.data);

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
      toast.success('Mascota agregada');
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
      toast.success('Mascota actualizada');
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
              <p className="opacity-90 text-sm">Hola, {user.name}!</p>
            </div>
            <Link to="/search">
              <Button className="bg-white text-[#00e7ff] hover:bg-gray-100"><Search className="w-4 h-4 mr-2" /> Buscar</Button>
            </Link>
          </div>
        </div>

        {/* Become Carer button - only show if user doesn't have provider role */}
        {user.role !== 'provider' && user.role !== 'admin' && !user.roles?.includes('provider') && (
          <Link to="/provider/register" className="block mb-6" data-testid="become-carer-link">
            <div className="bg-white rounded-xl p-4 shadow-sm border-2 border-dashed border-[#00e7ff]/30 hover:border-[#00e7ff] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-[#00e7ff]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold">¿Quieres ser Cuidador?</h3>
                  <p className="text-sm text-gray-500">Ofrece tus servicios y empieza a ganar</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </Link>
        )}

        {/* Subscription Card */}
        <div className="mb-6">
          <SubscriptionCard userType="client" hasSubscription={subscription?.has_subscription} />
        </div>

        {/* Tabs Navigation */}
        <div className="flex gap-2 mb-6 border-b overflow-x-auto bg-white rounded-t-xl p-2">
          {[
            { key: 'requests', label: 'Solicitudes', icon: Inbox },
            { key: 'pets', label: 'Mis Mascotas', icon: Dog },
            { key: 'favorites', label: 'Favoritos', icon: Heart },
            { key: 'bookings', label: 'Reservas', icon: CalendarCheck },
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

        {/* Tab Content: Mis Mascotas */}
        {activeTab === 'pets' && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Dog className="w-5 h-5 text-[#00e7ff]" />
                Mis Mascotas
              </h2>
              <Button onClick={() => { setShowPetForm(true); setNewPet({ name: '', type: 'perro', breed: '', size: 'mediano', age: '', notes: '' }); }} className="bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f]">
                <Plus className="w-4 h-4 mr-2" /> Agregar
              </Button>
            </div>

            {showPetForm && (
              <div className="border rounded-xl p-4 mb-4 bg-gray-50">
                <h3 className="font-bold mb-3">Nueva Mascota</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input placeholder="Nombre" value={newPet.name} onChange={e => setNewPet(p => ({ ...p, name: e.target.value }))} />
                  <select value={newPet.type} onChange={e => setNewPet(p => ({ ...p, type: e.target.value }))} className="px-3 py-2 border rounded-lg">
                    <option value="perro">Perro</option>
                    <option value="gato">Gato</option>
                    <option value="otro">Otro</option>
                  </select>
                  <Input placeholder="Raza" value={newPet.breed} onChange={e => setNewPet(p => ({ ...p, breed: e.target.value }))} />
                  <select value={newPet.size} onChange={e => setNewPet(p => ({ ...p, size: e.target.value }))} className="px-3 py-2 border rounded-lg">
                    <option value="pequeno">Pequeño</option>
                    <option value="mediano">Mediano</option>
                    <option value="grande">Grande</option>
                  </select>
                  <Input placeholder="Edad (ej: 2 años)" value={newPet.age} onChange={e => setNewPet(p => ({ ...p, age: e.target.value }))} />
                  <Input placeholder="Notas (opcional)" value={newPet.notes} onChange={e => setNewPet(p => ({ ...p, notes: e.target.value }))} />
                </div>
                <div className="flex gap-2 mt-3">
                  <Button onClick={handleAddPet} disabled={savingPet} className="bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f]">
                    {savingPet ? 'Guardando...' : 'Guardar'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowPetForm(false)}>Cancelar</Button>
                </div>
              </div>
            )}

            {pets.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Dog className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>No tienes mascotas registradas</p>
                <p className="text-sm">Agrega tu primera mascota para solicitar servicios</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pets.map(pet => (
                  <div key={pet.pet_id} className="border rounded-xl p-4 hover:shadow-md transition-shadow">
                    {editingPet === pet.pet_id ? (
                      <div className="space-y-2">
                        <Input value={editPetData.name} onChange={e => setEditPetData(p => ({ ...p, name: e.target.value }))} placeholder="Nombre" />
                        <div className="grid grid-cols-2 gap-2">
                          <select value={editPetData.type} onChange={e => setEditPetData(p => ({ ...p, type: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm">
                            <option value="perro">Perro</option>
                            <option value="gato">Gato</option>
                            <option value="otro">Otro</option>
                          </select>
                          <select value={editPetData.size} onChange={e => setEditPetData(p => ({ ...p, size: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm">
                            <option value="pequeno">Pequeño</option>
                            <option value="mediano">Mediano</option>
                            <option value="grande">Grande</option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleEditPet(pet.pet_id)} disabled={savingPet} className="bg-[#00e7ff]">
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingPet(null)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center text-2xl">
                          {pet.type === 'perro' ? '🐕' : pet.type === 'gato' ? '🐈' : '🐾'}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold">{pet.name}</h4>
                          <p className="text-sm text-gray-500">{pet.breed || pet.type} • {PET_SIZE_LABEL[pet.size]}</p>
                          {pet.age && <p className="text-xs text-gray-400">{pet.age}</p>}
                        </div>
                        <button
                          onClick={() => { setEditingPet(pet.pet_id); setEditPetData({ name: pet.name, type: pet.type, breed: pet.breed, size: pet.size, age: pet.age, notes: pet.notes }); }}
                          className="p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <Pencil className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
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
                <Link to="/search" className="text-[#00e7ff] hover:underline text-sm">Buscar cuidadores</Link>
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

        {/* Tab Content: Reservas */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-[#00e7ff]" />
              Mis Reservas
            </h2>
            {bookings.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <CalendarCheck className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>No tienes reservas activas</p>
                <Link to="/search" className="text-[#00e7ff] hover:underline text-sm">Buscar cuidadores</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map(booking => (
                  <div key={booking.booking_id} className="border rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold">{booking.provider_name || 'Cuidador'}</h4>
                        <p className="text-sm text-gray-500">{booking.service_type}</p>
                        <p className="text-xs text-gray-400">{new Date(booking.start_date).toLocaleDateString('es-CL')}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {booking.status === 'confirmed' ? 'Confirmada' : booking.status === 'pending' ? 'Pendiente' : booking.status}
                      </span>
                    </div>
                  </div>
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
              <p>Tus conversaciones con cuidadores</p>
              <Link to="/chat" className="text-[#00e7ff] hover:underline text-sm">Ir al chat</Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Dashboard;
