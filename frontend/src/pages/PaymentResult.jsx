import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

const PaymentResult = ({ status }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [subscriptionActive, setSubscriptionActive] = useState(false);

  useEffect(() => {
    // Try to verify subscription status
    const verifyPayment = async () => {
      const externalReference = searchParams.get('external_reference');
      const paymentId = searchParams.get('payment_id');
      
      if (externalReference) {
        try {
          const response = await api.get(`/subscription/verify/${externalReference}`);
          if (response.data.status === 'active') {
            setSubscriptionActive(true);
          }
        } catch (error) {
          console.error('Error verifying subscription:', error);
        }
      }
      
      setVerifying(false);
    };

    // Small delay to allow webhook to process
    setTimeout(verifyPayment, 2000);
  }, [searchParams]);

  const getStatusContent = () => {
    switch (status) {
      case 'success':
        return {
          icon: <CheckCircle className="w-24 h-24 text-green-500" />,
          title: '¡Pago Exitoso!',
          message: subscriptionActive 
            ? 'Tu suscripción está activa. Ya puedes ver los contactos de los proveedores.'
            : 'Tu pago está siendo procesado. En unos momentos tu suscripción estará activa.',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'failure':
        return {
          icon: <XCircle className="w-24 h-24 text-red-500" />,
          title: 'Pago Rechazado',
          message: 'No pudimos procesar tu pago. Por favor intenta nuevamente con otro método de pago.',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      case 'pending':
        return {
          icon: <Clock className="w-24 h-24 text-yellow-500" />,
          title: 'Pago Pendiente',
          message: 'Tu pago está siendo procesado. Te notificaremos cuando se confirme.',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200'
        };
      default:
        return {
          icon: <Clock className="w-24 h-24 text-gray-400" />,
          title: 'Estado Desconocido',
          message: 'No pudimos determinar el estado de tu pago.',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const content = getStatusContent();

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-[#00e7ff] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verificando tu pago...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className={`max-w-md w-full ${content.bgColor} rounded-2xl p-8 border ${content.borderColor} text-center`}>
        <div className="flex justify-center mb-6">
          {content.icon}
        </div>
        
        <h1 className="text-3xl font-bold text-[#33404f] mb-4">
          {content.title}
        </h1>
        
        <p className="text-gray-600 mb-8">
          {content.message}
        </p>

        <div className="space-y-3">
          {status === 'success' && (
            <Button
              onClick={() => navigate('/search')}
              className="w-full bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f] py-6"
            >
              Buscar Cuidadores
            </Button>
          )}
          
          {status === 'failure' && (
            <Button
              onClick={() => navigate('/planes')}
              className="w-full bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f] py-6"
            >
              Intentar de Nuevo
            </Button>
          )}

          {status === 'pending' && (
            <Button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f] py-6"
            >
              Ir a Mi Cuenta
            </Button>
          )}

          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="w-full border-gray-300 py-6"
          >
            Volver al Inicio
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentResult;
