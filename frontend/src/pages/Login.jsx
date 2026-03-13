import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Ingresa tu correo y contraseña');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      localStorage.setItem('jwt_token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      toast.success('Sesión iniciada correctamente');
      
      const user = response.data.user;
      
      // Check if user has multiple roles
      if (user.needs_role_selection && user.roles?.length > 1) {
        navigate('/select-role', { replace: true, state: { user } });
      } else if (user.role === 'provider') {
        navigate('/provider/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRedirect = () => {
    const redirectUri = `https://ucan-backend.onrender.com/auth/google`;
    const scope = 'email profile openid';
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope,
      access_type: 'offline',
      prompt: 'select_account'
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <Link to="/" className="fixed top-6 left-6 flex items-center gap-2 text-gray-500 hover:text-[#00e7ff] transition-colors bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border" data-testid="back-home-link">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        <span className="text-sm font-medium">Volver al Inicio</span>
      </Link>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
                    <Link to="/"><img src="/ucan-logo-rojo.svg" alt="U-CAN" className="h-16 mx-auto mb-6" /></Link>
          <h2 className="font-montserrat text-4xl font-extrabold text-[#33404f] uppercase" data-testid="login-title">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-gray-600">Accede a tu cuenta de U-CAN</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 py-6 rounded-xl border-gray-300"
                data-testid="login-email-input"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10 py-6 rounded-xl border-gray-300"
                data-testid="login-password-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                data-testid="toggle-password-visibility"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="text-right">
              <Link to="/forgot-password" className="text-sm text-[#00e7ff] hover:underline" data-testid="forgot-password-link">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00e7ff] hover:bg-[#00c4d4] text-white py-6 text-lg rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
              data-testid="email-login-button"
            >
              {loading ? 'Ingresando...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500">o continúa con</span>
            </div>
          </div>

          <div className="flex justify-center" data-testid="google-login-container">
            <button
              type="button"
              onClick={handleGoogleRedirect}
              className="flex items-center justify-center gap-3 w-full max-w-[350px] px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors shadow-sm"
              data-testid="google-login-button"
            >
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              <span className="text-sm font-medium text-gray-700">Continuar con Google</span>
            </button>
          </div>

          <div className="text-center text-sm text-gray-600">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-[#00e7ff] hover:underline font-semibold" data-testid="register-link">
              Regístrate aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
