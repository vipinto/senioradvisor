import React, { useState, useEffect } from 'react';
import { Calendar, Clock, PawPrint, CheckCircle, XCircle, User, ChevronDown, ChevronUp, MessageSquare, Loader2, AlertCircle } from 'lucide-react';
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
  paseo: 'Residencia',
  cuidado: 'Cuidado',
  daycare: 'Cuidado a Domicilio'
};

export default function ProviderBookings() {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [responseNotes, setResponseNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bookingsRes, statsRes] = await Promise.all([
        api.get('/bookings/provider'),
        api.get('/bookings/stats/summary').catch(() => ({ data: null }))
      ]);
      setBookings(bookingsRes.data);
      setStats(statsRes.data);
    } catch (e) {
      toast.error('Error al cargar reservas');
    } finally {
      setLoading(false);
    }
  };

  const respondToBooking = async (bookingId, status) => {
    setProcessingId(bookingId);
    try {
      await api.put(`/bookings/${bookingId}/respond`, {
        status,
        provider_notes: responseNotes.trim() || null
      });
      toast.success(status === 'confirmed' ? 'Reserva confirmada' : 'Reserva rechazada');
      setResponseNotes('');
      setExpandedBooking(null);
      loadData();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Error al procesar');
    } finally {
      setProcessingId(null);
    }
  };

  const completeBooking = async (bookingId) => {
    setProcessingId(bookingId);
    try {
      await api.put(`/bookings/${bookingId}/complete`);
      toast.success('Servicio marcado como completado');
      loadData();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Error al completar');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (filter === 'all') return true;
    if (filter === 'active') return ['pending', 'confirmed'].includes(b.status);
    return b.status === filter;
  });

  const formatDateRange = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const sameDay = startDate.toDateString() === endDate.toDateString();
    
    if (sameDay) {
      return format(startDate, "EEE, d 'de' MMM", { locale: es });
    }
    return `${format(startDate, "d MMM", { locale: es })} - ${format(endDate, "d MMM", { locale: es })}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-2 border-[#00e7ff] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="provider-bookings">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { key: 'pending', label: 'Pendientes', color: 'text-yellow-600' },
            { key: 'confirmed', label: 'Confirmadas', color: 'text-green-600' },
            { key: 'completed', label: 'Completadas', color: 'text-blue-600' },
            { key: 'cancelled', label: 'Canceladas', color: 'text-gray-500' },
            { key: 'total', label: 'Total', color: 'text-[#00e7ff]' }
          ].map(({ key, label, color }) => (
            <div key={key} className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-xs text-gray-500">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{stats[key] || 0}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { key: 'pending', label: `Pendientes (${stats?.pending || 0})` },
          { key: 'confirmed', label: 'Confirmadas' },
          { key: 'active', label: 'Activas' },
          { key: 'completed', label: 'Completadas' },
          { key: 'all', label: 'Todas' }
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === key
                ? 'bg-[#00e7ff] text-[#33404f]'
                : 'bg-white text-gray-600 hover:bg-gray-100 border'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">
            {filter === 'pending' 
              ? 'No tienes reservas pendientes'
              : 'No hay reservas con este filtro'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map(booking => {
            const isExpanded = expandedBooking === booking.booking_id;
            const statusConfig = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending;
            const StatusIcon = statusConfig.icon;
            const isPending = booking.status === 'pending';
            const isConfirmed = booking.status === 'confirmed';
            
            return (
              <div 
                key={booking.booking_id}
                className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all ${
                  isPending ? 'border-yellow-300' : ''
                }`}
                data-testid={`provider-booking-${booking.booking_id}`}
              >
                {/* Main Row */}
                <div 
                  className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedBooking(isExpanded ? null : booking.booking_id)}
                >
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    <User className="w-6 h-6 text-gray-400" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{booking.client_name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${statusConfig.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      <span className="capitalize">{SERVICE_LABELS[booking.service_type] || booking.service_type}</span>
                      {' · '}
                      {formatDateRange(booking.start_date, booking.end_date)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {booking.pets?.length > 0 && (
                      <div className="flex -space-x-2">
                        {booking.pets.slice(0, 3).map((pet, i) => (
                          <div 
                            key={i}
                            className="w-8 h-8 rounded-full bg-red-100 border-2 border-white flex items-center justify-center overflow-hidden"
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
                      </div>
                    )}
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t p-4 bg-gray-50">
                    {/* Pet Details */}
                    {booking.pets?.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                          <PawPrint className="w-4 h-4 text-[#00e7ff]" />
                          Servicios ({booking.pets.length})
                        </h4>
                        <div className="grid sm:grid-cols-2 gap-2">
                          {booking.pets.map((pet, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl">
                              {pet.photo ? (
                                <img 
                                  src={pet.photo.startsWith('http') ? pet.photo : `${process.env.REACT_APP_BACKEND_URL}${pet.photo}`}
                                  alt={pet.name}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                                  <PawPrint className="w-6 h-6 text-[#00e7ff]" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium">{pet.name}</p>
                                <p className="text-xs text-gray-500">
                                  {pet.breed || pet.species} · {pet.size} · {pet.sex === 'hembra' ? 'Hembra' : 'Macho'}
                                  {pet.age ? ` · ${pet.age} años` : ''}
                                </p>
                                {pet.notes && (
                                  <p className="text-xs text-gray-400 mt-1">{pet.notes}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Client Notes */}
                    {booking.notes && (
                      <div className="mb-4 p-3 bg-yellow-50 rounded-xl">
                        <p className="text-xs font-medium text-yellow-700 mb-1">Notas del cliente</p>
                        <p className="text-sm text-yellow-800">{booking.notes}</p>
                      </div>
                    )}

                    {/* Contact Info */}
                    <div className="mb-4 p-3 bg-white rounded-xl">
                      <p className="text-xs font-medium text-gray-500 mb-2">Contacto</p>
                      <div className="flex flex-wrap gap-4 text-sm">
                        {booking.client_email && <span>{booking.client_email}</span>}
                        {booking.client_phone && <span>{booking.client_phone}</span>}
                      </div>
                    </div>

                    {/* Actions for pending bookings */}
                    {isPending && (
                      <div className="space-y-3 pt-3 border-t">
                        <textarea
                          value={responseNotes}
                          onChange={(e) => setResponseNotes(e.target.value)}
                          placeholder="Mensaje para el cliente (opcional)..."
                          className="w-full border rounded-xl p-3 text-sm min-h-[60px] focus:outline-none focus:ring-2 focus:ring-[#00e7ff]"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => respondToBooking(booking.booking_id, 'confirmed')}
                            disabled={processingId === booking.booking_id}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            data-testid={`confirm-booking-${booking.booking_id}`}
                          >
                            {processingId === booking.booking_id ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <CheckCircle className="w-4 h-4 mr-2" />
                            )}
                            Confirmar
                          </Button>
                          <Button
                            onClick={() => respondToBooking(booking.booking_id, 'rejected')}
                            disabled={processingId === booking.booking_id}
                            variant="outline"
                            className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                            data-testid={`reject-booking-${booking.booking_id}`}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Rechazar
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Mark as completed for confirmed bookings */}
                    {isConfirmed && (
                      <div className="pt-3 border-t">
                        <Button
                          onClick={() => completeBooking(booking.booking_id)}
                          disabled={processingId === booking.booking_id}
                          className="w-full bg-blue-600 hover:bg-cyan-700"
                          data-testid={`complete-booking-${booking.booking_id}`}
                        >
                          {processingId === booking.booking_id ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-2" />
                          )}
                          Marcar como Completado
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
