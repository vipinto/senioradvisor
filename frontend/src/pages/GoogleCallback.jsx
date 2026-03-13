import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError('Inicio de sesion con Google cancelado');
      toast.error('Inicio de sesion con Google cancelado');
      setTimeout(() => navigate('/login', { replace: true }), 2000);
      return;
    }

    if (!code) {
      setError('No se recibio respuesta de Google');
      toast.error('No se recibio respuesta de Google');
      setTimeout(() => navigate('/login', { replace: true }), 2000);
      return;
    }

    const exchangeCode = async () => {
      try {
        const redirectUri = `${window.location.origin}/auth/google/callback`;
        const response = await api.post('/auth/google', {
          code,
          redirect_uri: redirectUri
        });
        localStorage.setItem('jwt_token', response.data.token);
        toast.success('Sesión iniciada con Google');

        // Check if user chose a role during registration
        const registerRole = localStorage.getItem('register_role');
        localStorage.removeItem('register_role');

        if (registerRole === 'provider') {
          navigate('/provider/register', { replace: true });
        } else if (registerRole === 'client') {
          navigate('/mis-mascotas/nueva', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } catch (err) {
        const msg = err.response?.data?.detail || 'Error al iniciar sesion con Google';
        setError(msg);
        toast.error(msg);
        setTimeout(() => navigate('/login', { replace: true }), 3000);
      }
    };

    exchangeCode();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white" data-testid="google-callback-page">
      <div className="text-center space-y-4">
        {error ? (
          <>
            <div className="w-12 h-12 mx-auto rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-red-600 text-xl font-bold">!</span>
            </div>
            <p className="text-gray-700 font-medium">{error}</p>
            <p className="text-sm text-gray-500">Redirigiendo al inicio de sesión...</p>
          </>
        ) : (
          <>
            <Loader2 className="w-10 h-10 mx-auto animate-spin text-[#00e7ff]" />
            <p className="text-gray-700 font-medium">Procesando autenticación con Google...</p>
          </>
        )}
      </div>
    </div>
  );
};

export default GoogleCallback;
