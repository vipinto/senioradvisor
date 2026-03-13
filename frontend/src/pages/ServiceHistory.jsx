import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { History, CheckCircle, XCircle, Clock, ChevronRight, CalendarDays, Dog, FileText, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

const STATUS_MAP = {
  completed: { label: 'Completado', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  confirmed: { label: 'Confirmado', color: 'bg-blue-100 text-blue-700', icon: Clock },
  rejected: { label: 'Rechazado', color: 'bg-red-100 text-red-700', icon: XCircle },
  cancelled: { label: 'Cancelado', color: 'bg-gray-100 text-gray-600', icon: XCircle },
};

const SERVICE_LABELS = {
  paseo: 'Paseo',
  cuidado: 'Cuidado',
  daycare: 'Daycare',
};

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ServiceHistory() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('history');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [historyRes, invoicesRes] = await Promise.all([
        api.get('/bookings/history').catch(() => ({ data: [] })),
        api.get('/subscription/invoices').catch(() => ({ data: [] })),
      ]);
      setBookings(historyRes.data);
      setInvoices(invoicesRes.data);
    } catch {
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-16 h-16 border-4 border-[#E6202E] border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="service-history-page">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-2">Historial</h1>
        <p className="text-gray-500 mb-8">Revisa tus servicios pasados y facturas de suscripcion</p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b">
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-[#E6202E] text-[#E6202E]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            data-testid="tab-history"
          >
            <History className="w-4 h-4" />
            Servicios ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'invoices'
                ? 'border-[#E6202E] text-[#E6202E]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            data-testid="tab-invoices"
          >
            <Receipt className="w-4 h-4" />
            Facturas ({invoices.length})
          </button>
        </div>

        {/* Service History Tab */}
        {activeTab === 'history' && (
          <div data-testid="history-list">
            {bookings.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                <History className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">Sin historial de servicios</p>
                <p className="text-sm text-gray-400 mb-6">Tus servicios completados apareceran aqui</p>
                <Link to="/search">
                  <Button className="bg-[#E6202E] hover:bg-[#D31522]">Buscar Cuidadores</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map(b => {
                  const statusInfo = STATUS_MAP[b.status] || STATUS_MAP.cancelled;
                  const StatusIcon = statusInfo.icon;
                  return (
                    <div
                      key={b.booking_id}
                      className="bg-white rounded-xl p-5 shadow-sm border hover:shadow-md transition-shadow"
                      data-testid={`history-item-${b.booking_id}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                          <Dog className="w-6 h-6 text-[#E6202E]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h3 className="font-bold text-gray-900 truncate">
                              {SERVICE_LABELS[b.service_type] || b.service_type}
                            </h3>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 whitespace-nowrap ${statusInfo.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusInfo.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 truncate">
                            {b.provider_name || b.client_name || 'Usuario'}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <CalendarDays className="w-3.5 h-3.5" />
                              {formatDate(b.start_date)}
                              {b.end_date && b.end_date !== b.start_date && ` - ${formatDate(b.end_date)}`}
                            </span>
                            {b.pets?.length > 0 && (
                              <span className="flex items-center gap-1">
                                <Dog className="w-3.5 h-3.5" />
                                {b.pets.map(p => p.name).join(', ')}
                              </span>
                            )}
                          </div>
                          {b.notes && (
                            <p className="text-xs text-gray-400 mt-1 line-clamp-1">Nota: {b.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div data-testid="invoices-list">
            {invoices.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                <Receipt className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">Sin facturas</p>
                <p className="text-sm text-gray-400">Tus pagos de suscripcion apareceran aqui</p>
              </div>
            ) : (
              <div className="space-y-3">
                {invoices.map((inv, idx) => {
                  const isPaid = inv.status === 'active';
                  const isPending = inv.status === 'pending';
                  return (
                    <div
                      key={inv.subscription_id || idx}
                      className="bg-white rounded-xl p-5 shadow-sm border"
                      data-testid={`invoice-item-${inv.subscription_id}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isPaid ? 'bg-green-50' : isPending ? 'bg-yellow-50' : 'bg-gray-50'}`}>
                          <FileText className={`w-6 h-6 ${isPaid ? 'text-green-600' : isPending ? 'text-yellow-600' : 'text-gray-400'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-bold text-gray-900">{inv.plan_name}</h3>
                            <span className="text-[#E6202E] font-bold text-lg">
                              ${inv.amount?.toLocaleString('es-CL')}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              isPaid ? 'bg-green-100 text-green-700' :
                              isPending ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {isPaid ? 'Pagado' : isPending ? 'Pendiente' : inv.status === 'cancelled' ? 'Cancelado' : inv.status}
                            </span>
                            {inv.start_date && (
                              <span className="text-xs text-gray-400">
                                {formatDate(inv.start_date)} - {formatDate(inv.end_date)}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            Creado: {formatDate(inv.created_at)}
                            {inv.payment_id && ` | Pago #${inv.payment_id}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
