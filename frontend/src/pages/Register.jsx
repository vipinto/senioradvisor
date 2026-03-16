import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Completa todos los campos');
      return;
    }
    if (password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/auth/register', { email, password, name, role: 'client' });
      localStorage.setItem('jwt_token', response.data.token);
      toast.success('Cuenta creada correctamente');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRedirect = () => {
    localStorage.setItem('register_role', 'client');
    const redirectUri = `${process.env.REACT_APP_BACKEND_URL}/auth/google`;
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 to-white py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/">
            <img src="/logo-senior.svg" alt="SeniorAdvisor" className="h-16 mx-auto mb-6" />
          </Link>
          <h2 className="text-3xl font-extrabold text-[#33404f]" data-testid="register-title">Crear Cuenta</h2>
          <p className="mt-2 text-lg text-gray-600">Regístrate para encontrar servicios</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input type="text" placeholder="Nombre completo" value={name} onChange={(e) => setName(e.target.value)} className="pl-12 py-6 text-lg rounded-xl border-2 border-gray-300 focus:border-[#00e7ff]" data-testid="register-name-input" />
            </div>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-12 py-6 text-lg rounded-xl border-2 border-gray-300 focus:border-[#00e7ff]" data-testid="register-email-input" />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input type={showPassword ? 'text' : 'password'} placeholder="Contraseña (mín. 6 caracteres)" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-12 pr-12 py-6 text-lg rounded-xl border-2 border-gray-300 focus:border-[#00e7ff]" data-testid="register-password-input" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input type={showPassword ? 'text' : 'password'} placeholder="Confirmar contraseña" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-12 py-6 text-lg rounded-xl border-2 border-gray-300 focus:border-[#00e7ff]" data-testid="register-confirm-password-input" />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f] py-6 text-lg rounded-xl font-bold shadow-md hover:shadow-lg transition-all" data-testid="register-submit-button">
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
            <div className="relative flex justify-center text-base"><span className="px-3 bg-white text-gray-500">o regístrate con</span></div>
          </div>

          <div className="flex justify-center" data-testid="google-register-container">
            <button type="button" onClick={handleGoogleRedirect} className="flex items-center justify-center gap-3 w-full px-4 py-4 border-2 border-gray-300 rounded-xl bg-white hover:bg-gray-50 transition-colors shadow-sm" data-testid="google-register-button">
              <svg width="24" height="24" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              <span className="text-base font-semibold text-gray-700">Continuar con Google</span>
            </button>
          </div>

          <div className="text-center text-base text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-[#00e7ff] hover:underline font-bold" data-testid="login-link">Inicia sesión</Link>
          </div>

          <div className="text-center text-sm text-gray-500 mt-2 pt-3 border-t border-gray-100">
            ¿Eres una residencia?{' '}
            <Link to="/registrar-residencia" className="text-[#00e7ff] hover:underline font-bold" data-testid="register-provider-link">Registra tu residencia aquí</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
