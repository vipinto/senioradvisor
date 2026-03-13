import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Mail, Lock, User, Heart, Shield } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const Register = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState(null); // null = choosing, 'client', 'provider'
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
      // Register with the selected role
      const registerRole = role === 'provider' ? 'provider' : 'client';
      const response = await api.post('/auth/register', { email, password, name, role: registerRole });
      localStorage.setItem('jwt_token', response.data.token);
      toast.success('Cuenta creada correctamente');
      if (role === 'provider') {
        // Redirect to complete provider profile
        navigate('/provider/register', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRedirect = () => {
    // Store the intended role so callback knows where to redirect
    localStorage.setItem('register_role', role || 'client');
    const redirectUri = `${window.location.origin}/auth/google/callback`;
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

  // Role selection screen
  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white py-12 px-4" data-testid="register-role-selection">
        <div className="max-w-lg w-full space-y-8">
          <div className="text-center">
                        <Link to="/"><img src="/ucan-logo-rojo.svg" alt="U-CAN" className="h-16 mx-auto mb-6" /></Link>
            <h2 className="font-montserrat text-4xl font-extrabold text-gray-900 uppercase">Crear Cuenta</h2>
            <p className="mt-2 text-gray-600">Elige como quieres usar U-CAN</p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setRole('client')}
              className="w-full bg-white rounded-2xl shadow-lg p-6 border-2 border-transparent hover:border-[#E6202E] transition-all group text-left"
              data-testid="register-as-client"
            >
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center group-hover:bg-[#E6202E] transition-colors">
                  <Heart className="w-8 h-8 text-[#E6202E] group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">Busco un Cuidador</h3>
                  <p className="text-gray-500 text-sm mt-1">Encuentra el cuidador perfecto para tu mascota</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setRole('provider')}
              className="w-full bg-white rounded-2xl shadow-lg p-6 border-2 border-transparent hover:border-[#E6202E] transition-all group text-left"
              data-testid="register-as-provider"
            >
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center group-hover:bg-[#E6202E] transition-colors">
                  <Shield className="w-8 h-8 text-[#E6202E] group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">Quiero ser Cuidador</h3>
                  <p className="text-gray-500 text-sm mt-1">Ofrece tus servicios de cuidado de mascotas</p>
                </div>
              </div>
            </button>
          </div>

          <div className="text-center text-sm text-gray-600">
            Ya tienes cuenta?{' '}
            <Link to="/login" className="text-[#E6202E] hover:underline font-semibold">Inicia sesion</Link>
          </div>
        </div>
      </div>
    );
  }

  // Registration form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
                      <Link to="/"><img src="/ucan-logo-rojo.svg" alt="U-CAN" className="h-16 mx-auto mb-6" /></Link>
          <h2 className="font-montserrat text-4xl font-extrabold text-gray-900 uppercase" data-testid="register-title">
            {role === 'provider' ? 'Registro Cuidador' : 'Crear Cuenta'}
          </h2>
          <p className="mt-2 text-gray-600">
            {role === 'provider' ? 'Paso 1: Crea tu cuenta' : 'Regístrate para encontrar cuidadores'}
          </p>
          <button onClick={() => setRole(null)} className="mt-1 text-sm text-[#E6202E] hover:underline" data-testid="back-to-role-selection">
            Cambiar tipo de cuenta
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input type="text" placeholder="Nombre completo" value={name} onChange={(e) => setName(e.target.value)} className="pl-10 py-6 rounded-xl border-gray-300" data-testid="register-name-input" />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input type="email" placeholder="Correo electronico" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 py-6 rounded-xl border-gray-300" data-testid="register-email-input" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input type={showPassword ? 'text' : 'password'} placeholder="Contrasena (min. 6 caracteres)" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10 py-6 rounded-xl border-gray-300" data-testid="register-password-input" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input type={showPassword ? 'text' : 'password'} placeholder="Confirmar contraseña" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10 py-6 rounded-xl border-gray-300" data-testid="register-confirm-password-input" />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-[#E6202E] hover:bg-[#D31522] text-white py-6 text-lg rounded-xl font-bold" data-testid="register-submit-button">
              {loading ? 'Creando cuenta...' : role === 'provider' ? 'Continuar' : 'Crear Cuenta'}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
            <div className="relative flex justify-center text-sm"><span className="px-3 bg-white text-gray-500">o registrate con</span></div>
          </div>

          <div className="flex justify-center" data-testid="google-register-container">
            <button type="button" onClick={handleGoogleRedirect} className="flex items-center justify-center gap-3 w-full max-w-[350px] px-4 py-3 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors shadow-sm" data-testid="google-register-button">
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
            Ya tienes cuenta?{' '}
            <Link to="/login" className="text-[#E6202E] hover:underline font-semibold" data-testid="login-link">Inicia sesion</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
