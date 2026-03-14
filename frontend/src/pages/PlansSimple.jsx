import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Loader2, CreditCard, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';

const Plans = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  // Check for payment status from URL params
  useEffect(() => {
    const status = searchParams.get('status');
    const subscriptionId = searchParams.get('subscription_id');
    
    if (status === 'approved' || status === 'success') {
      toast.success('¡Pago exitoso! Tu suscripción está activa');
      // Verify subscription
      if (subscriptionId) {
        verifySubscription(subscriptionId);
      }
    } else if (status === 'failure' || status === 'rejected') {
      toast.error('El pago fue rechazado. Por favor intenta de nuevo');
    } else if (status === 'pending') {
      toast.info('Tu pago está pendiente de confirmación');
    }
  }, [searchParams]);

  const loadData = async () => {
    try {
      const [plansRes, userRes] = await Promise.all([
        api.get('/subscription/plans').catch(() => ({ data: [] })),
        api.get('/auth/me').catch(() => null)
      ]);
      setPlans(plansRes.data);
      if (userRes) setUser(userRes.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifySubscription = async (subscriptionId) => {
    try {
      const response = await api.get(`/subscription/verify/${subscriptionId}`);
      if (response.data.status === 'active') {
        setUser(prev => ({ ...prev, has_subscription: true }));
      }
    } catch (error) {
      console.error('Error verifying subscription:', error);
    }
  };

  const handleSubscribe = async (planId) => {
    if (!user) {
      // Redirect to login with return URL
      const redirectUrl = window.location.origin + '/planes';
      window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
      return;
    }

    if (user.has_subscription) {
      toast.info('Ya tienes una suscripción activa');
      return;
    }

    setProcessingPlan(planId);
    
    try {
      const response = await api.post('/subscription/create-payment', {
        plan_id: planId
      });
      
      // Redirect to Mercado Pago checkout
      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      } else if (response.data.sandbox_url) {
        // Use sandbox URL for testing
        window.location.href = response.data.sandbox_url;
      } else {
        toast.error('Error al iniciar el pago');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.detail || 'Error al procesar el pago');
    } finally {
      setProcessingPlan(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#00e7ff] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white py-20" data-testid="plans-page">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-[#33404f] mb-4">
            Elige tu Plan
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            Accede a todos los contactos de cuidadores y comunicate directamente con ellos
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.plan_id}
              className={`bg-white rounded-2xl p-8 shadow-lg transition-all duration-300 hover:shadow-xl ${
                plan.popular 
                  ? 'border-2 border-[#00e7ff] scale-105 relative' 
                  : 'border border-gray-100'
              }`}
              data-testid={`plan-card-${plan.plan_id}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#00e7ff] text-[#33404f] px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                    MÁS POPULAR
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8 pt-4">
                <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-[#00e7ff]">
                    ${plan.price_clp?.toLocaleString('es-CL')}
                  </span>
                </div>
                <p className="text-gray-600 mt-2">
                  {plan.duration_months} {plan.duration_months === 1 ? 'mes' : 'meses'}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features?.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-[#00e7ff]" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSubscribe(plan.plan_id)}
                disabled={user?.has_subscription || processingPlan === plan.plan_id}
                className={`w-full py-6 text-lg font-bold rounded-xl transition-all ${
                  plan.popular
                    ? 'bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f]'
                    : 'bg-white border-2 border-[#00e7ff] text-[#00e7ff] hover:bg-red-50'
                }`}
                data-testid={`subscribe-btn-${plan.plan_id}`}
              >
                {processingPlan === plan.plan_id ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Procesando...
                  </span>
                ) : user?.has_subscription ? (
                  'Ya estás suscrito'
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Suscribirse
                  </span>
                )}
              </Button>
            </div>
          ))}
        </div>

        {/* Payment Security Info */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 bg-white px-6 py-4 rounded-xl shadow-sm border border-gray-100">
            <Shield className="w-6 h-6 text-green-600" />
            <div className="text-left">
              <p className="font-semibold text-[#33404f]">Pago seguro con Mercado Pago</p>
              <p className="text-sm text-gray-500">Tus datos están protegidos</p>
            </div>
            <img 
              src="https://imgmp.mlstatic.com/org-img/banners/ar/medios/575X40.jpg" 
              alt="Mercado Pago" 
              className="h-8 ml-4"
            />
          </div>
        </div>

        {/* Not logged in notice */}
        {!user && (
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              ¿No tienes cuenta?{' '}
              <button
                onClick={() => {
                  const redirectUrl = window.location.origin + '/planes';
                  window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
                }}
                className="text-[#00e7ff] font-semibold hover:underline"
              >
                Regístrate aquí
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Plans;
