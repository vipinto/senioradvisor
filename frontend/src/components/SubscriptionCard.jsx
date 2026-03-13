import React, { useState, useEffect } from 'react';
import { Crown, Check, Star, Users, BarChart3, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';

const SubscriptionCard = ({ hasSubscription = false }) => {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const res = await api.get('/subscription/plans?role=provider');
      setPlans(res.data);
      if (res.data.length > 0) {
        setSelectedPlan(res.data[0].plan_id);
      }
    } catch (error) {
      console.error('Error loading plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!selectedPlan) return;
    
    setSubscribing(true);
    try {
      const response = await api.post('/subscription/create-payment', {
        plan_id: selectedPlan
      });
      
      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
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
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
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
            <h3 className="font-bold text-green-800 text-lg">Plan Premium Activo</h3>
            <p className="text-sm text-green-600">Tu servicio está destacado en búsquedas</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1">
            <Star className="w-3 h-3" /> Perfil destacado
          </span>
          <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1">
            <Users className="w-3 h-3" /> Solicitudes ilimitadas
          </span>
          <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1">
            <BarChart3 className="w-3 h-3" /> Estadísticas avanzadas
          </span>
          <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1">
            <Shield className="w-3 h-3" /> Soporte prioritario
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#00e7ff]/5 to-white rounded-2xl p-6 border-2 border-[#00e7ff]" data-testid="subscription-cta">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-[#00e7ff]/10 rounded-full flex items-center justify-center">
          <Crown className="w-6 h-6 text-[#00e7ff]" />
        </div>
        <div>
          <h3 className="font-bold text-[#33404f] text-lg">Destaca tu servicio con Premium</h3>
          <p className="text-sm text-gray-500">Llega a más familias que buscan servicios como el tuyo</p>
        </div>
      </div>

      {/* Plan selection */}
      {plans.length > 0 && (
        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          {plans.map((plan) => {
            const isSelected = selectedPlan === plan.plan_id;
            const monthlyPrice = Math.round(plan.price_clp / plan.duration_months);
            return (
              <button
                key={plan.plan_id}
                onClick={() => setSelectedPlan(plan.plan_id)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  isSelected 
                    ? 'border-[#00e7ff] bg-[#00e7ff]/5 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                data-testid={`plan-${plan.plan_id}`}
              >
                <p className="font-bold text-[#33404f] text-sm">{plan.name}</p>
                <p className="text-xl font-bold text-[#00e7ff] mt-1">
                  ${plan.price_clp.toLocaleString('es-CL')}
                </p>
                {plan.duration_months > 1 && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    ${monthlyPrice.toLocaleString('es-CL')}/mes
                  </p>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Benefits */}
      <div className="space-y-2 mb-4">
        <p className="text-sm font-semibold text-[#33404f]">Con Premium obtienes:</p>
        <ul className="space-y-1.5 text-sm text-gray-600">
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#00e7ff] shrink-0" />
            Perfil destacado en resultados de búsqueda
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#00e7ff] shrink-0" />
            Recibir solicitudes de contacto ilimitadas
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#00e7ff] shrink-0" />
            Acceso a estadísticas avanzadas de tu perfil
          </li>
          <li className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#00e7ff] shrink-0" />
            Soporte prioritario
          </li>
        </ul>
      </div>

      <Button
        onClick={handleSubscribe}
        disabled={subscribing || !selectedPlan}
        className="w-full py-5 text-lg font-bold bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f]"
        data-testid="subscribe-now-btn"
      >
        {subscribing ? (
          <span className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
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
  );
};

export default SubscriptionCard;
