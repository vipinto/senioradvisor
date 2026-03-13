import React, { useState, useEffect } from 'react';
import { Crown, Check, Lock, MessageCircle, Eye, Search, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';

const SubscriptionCard = ({ userType = 'client', hasSubscription = false, onSubscriptionChange }) => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    loadPlan();
  }, [userType]);

  const loadPlan = async () => {
    try {
      const role = userType === 'client' ? 'client' : 'provider';
      const res = await api.get(`/subscription/plans?role=${role}`);
      const activePlan = res.data.find(p => p.active) || res.data[0];
      setPlan(activePlan);
    } catch (error) {
      console.error('Error loading plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!plan) return;
    
    setSubscribing(true);
    try {
      const response = await api.post('/subscription/create-payment', {
        plan_id: plan.plan_id
      });
      
      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      } else if (response.data.sandbox_url) {
        window.location.href = response.data.sandbox_url;
      } else {
        toast.error('Error al crear el pago');
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al procesar suscripción');
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-red-50 to-white rounded-2xl p-6 border-2 border-dashed border-gray-200">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-100 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (hasSubscription) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-white rounded-2xl p-6 border-2 border-green-200" data-testid="subscription-active">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <Crown className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-bold text-green-800">Cuenta Premium Activa</h3>
            <p className="text-sm text-green-600">Tienes acceso completo</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {userType === 'client' ? (
            <>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1">
                <Eye className="w-3 h-3" /> Ver datos de contacto
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1">
                <MessageCircle className="w-3 h-3" /> Mensajería
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1">
                <Search className="w-3 h-3" /> Contactar cuidadores
              </span>
            </>
          ) : (
            <>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1">
                <Users className="w-3 h-3" /> Ver solicitudes de clientes
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1">
                <MessageCircle className="w-3 h-3" /> Enviar propuestas
              </span>
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs flex items-center gap-1">
                <Crown className="w-3 h-3" /> SOS Emergencia
              </span>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-red-50 to-white rounded-2xl p-6 border-2 border-[#00e7ff]" data-testid="subscription-cta">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Crown className="w-5 h-5 text-[#00e7ff]" />
            </div>
            <div>
              <h3 className="font-bold text-[#33404f]">
                {userType === 'client' ? '¡Desbloquea el contacto!' : '¡Accede a más clientes!'}
              </h3>
              <p className="text-2xl font-bold text-[#00e7ff]">
                ${plan?.price_clp?.toLocaleString('es-CL') || '9.990'}/mes
              </p>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            {userType === 'client' ? (
              <>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gray-400" />
                  <span>Actualmente no puedes ver datos de contacto</span>
                </p>
                <p className="text-sm font-medium text-gray-800">Con Premium podrás:</p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00e7ff]" />
                    Ver teléfono, WhatsApp y dirección de cuidadores
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00e7ff]" />
                    Enviar mensajes directos
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00e7ff]" />
                    Contactar cuidadores ilimitadamente
                  </li>
                </ul>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gray-400" />
                  <span>Puedes responder mensajes, pero no enviar propuestas</span>
                </p>
                <p className="text-sm font-medium text-gray-800">Con Premium podras:</p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00e7ff]" />
                    Ver solicitudes de clientes que buscan cuidador
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00e7ff]" />
                    Enviar propuestas a clientes directamente
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00e7ff]" />
                    Acceder al panel de oportunidades
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00e7ff]" />
                    Boton SOS emergencia veterinaria
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-[#00e7ff]" />
                    Perfil destacado en resultados de busqueda
                  </li>
                </ul>
              </>
            )}
          </div>
        </div>

        <div className="w-full sm:w-auto">
          <Button
            onClick={handleSubscribe}
            disabled={subscribing}
            className="w-full sm:w-auto px-8 py-6 text-lg font-bold bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f]"
            data-testid="subscribe-now-btn"
          >
            {subscribing ? (
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Procesando...
              </span>
            ) : (
              <>
                <Crown className="w-5 h-5 mr-2" />
                Suscribirme Ahora
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCard;
