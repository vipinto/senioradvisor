import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, PawPrint, ChevronRight, AlertCircle, CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import api from '@/lib/api';

const STATUS_CONFIG = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  confirmed: { label: 'Confirmada', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  rejected: { label: 'Rechazada', color: 'bg-red-100 text-red-700', icon: XCircle },
  completed: { label: 'Completada', color: 'bg-cyan-100 text-blue-700', icon: CheckCircle },
  cancelled: { label: 'Cancelada', color: 'bg-gray-100 text-gray-600', icon: XCircle }
};

const SERVICE_LABELS = {
  paseo: 'Paseo',
  cuidado: 'Cuidado',
  daycare: 'Daycare'
};

export default function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const res = await api.get('/bookings/my');
      setBookings(res.data);
    } catch (e) {
      if (e.response?.status === 401) {
        navigate('/login');
      } else {
        toast.error('Error al cargar reservas');
      }
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    setCancellingId(bookingId);
    try {
      await api.put(`/bookings/${bookingId}/cancel`);
      toast.success('Reserva cancelada');
      loadBookings();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Error al cancelar');
    } finally {
      setCancellingId(null);
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['pending', 'confirmed'].includes(b.status);
    if (filter === 'past') return ['completed', 'rejected', 'cancelled'].includes(b.status);
    return b.status === filter;
  });

  const formatDateRange = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const sameDay = startDate.toDateString() === endDate.toDateString();
    
    if (sameDay) {
      return format(startDate, "EEEE, d 'de' MMMM", { locale: es });
    }
    return `${format(startDate, "d MMM", { locale: es })} - ${format(endDate, "d MMM yyyy", { locale: es })}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#00e7ff] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="my-bookings-page">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Mis Reservas</h1>
            <p className="text-gray-500">{bookings.length} reservas en total</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'Todas' },
            { key: 'active', label: 'Activas' },
            { key: 'pending', label: 'Pendientes' },
            { key: 'confirmed', label: 'Confirmadas' },
            { key: 'past', label: 'Pasadas' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === key
                  ? 'bg-[#00e7ff] text-[#33404f]'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border'
              }`}
              data-testid={`filter-${key}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Sin reservas</h3>
            <p className="text-gray-500 mb-6">
              {filter === 'all' 
                ? 'Aun no tienes reservas. Busca un cuidador para hacer tu primera reserva.'
                : 'No hay reservas con este filtro.'}
            </p>
            <Link to="/search">
              <Button className="bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f]">
                Buscar Cuidadores
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map(booking => {
              const StatusIcon = STATUS_CONFIG[booking.status]?.icon || AlertCircle;
              const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
              
              return (
                <div 
                  key={booking.booking_id} 
                  className="bg-white rounded-2xl p-6 shadow-sm border hover:shadow-md transition-shadow"
                  data-testid={`booking-card-${booking.booking_id}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-[#00e7ff]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{booking.provider_name}</h3>
                        <p className="text-sm text-gray-500 capitalize">
                          {SERVICE_LABELS[booking.service_type] || booking.service_type}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${statusConfig.color}`}>
                      <StatusIcon className="w-4 h-4" />
                      {statusConfig.label}
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-1">Fecha</p>
                      <p className="font-medium capitalize">
                        {formatDateRange(booking.start_date, booking.end_date)}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-1">Mascotas</p>
                      <div className="flex items-center gap-2">
                        {booking.pets?.slice(0, 3).map((pet, i) => (
                          <div 
                            key={i}
                            className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center overflow-hidden"
                            title={pet.name}
                          >
                            {pet.photo ? (
                              <img 
                                src={pet.photo.startsWith('http') ? pet.photo : `${process.env.REACT_APP_BACKEND_URL}${pet.photo}`}
                                alt={pet.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <PawPrint className="w-4 h-4 text-[#00e7ff]" />
                            )}
                          </div>
                        ))}
                        <span className="text-sm text-gray-600">
                          {booking.pets?.map(p => p.name).join(', ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {booking.notes && (
                    <div className="bg-yellow-50 rounded-xl p-3 mb-4">
                      <p className="text-xs text-yellow-700 font-medium mb-1">Notas</p>
                      <p className="text-sm text-yellow-800">{booking.notes}</p>
                    </div>
                  )}

                  {booking.provider_notes && (
                    <div className="bg-cyan-50 rounded-xl p-3 mb-4">
                      <p className="text-xs text-blue-700 font-medium mb-1">Mensaje del cuidador</p>
                      <p className="text-sm text-blue-800">{booking.provider_notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t">
                    <Link to={`/provider/${booking.provider_id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        Ver Perfil
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                    
                    {['pending', 'confirmed'].includes(booking.status) && (
                      <Button
                        variant="outline"
                        onClick={() => cancelBooking(booking.booking_id)}
                        disabled={cancellingId === booking.booking_id}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        data-testid={`cancel-booking-${booking.booking_id}`}
                      >
                        {cancellingId === booking.booking_id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Cancelar'
                        )}
                      </Button>
                    )}
                    
                    {booking.status === 'completed' && (
                      <Link to={`/provider/${booking.provider_id}`}>
                        <Button className="bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f]">
                          Dejar Resena
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
