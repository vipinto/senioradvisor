import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      await api.post('/auth/reset-password', { token, password });
      setSuccess(true);
      toast.success('Contraseña actualizada correctamente');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al restablecer la contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white py-12 px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <h2 className="text-2xl font-bold text-[#33404f]">Enlace inválido</h2>
          <p className="text-gray-600">Este enlace de recuperación no es válido.</p>
          <Link to="/forgot-password">
            <Button className="bg-[#00e7ff] hover:bg-[#00c4d4] text-white">
              Solicitar nuevo enlace
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
                    <Link to="/"><img src="/ucan-logo-rojo.svg" alt="U-CAN" className="h-16 mx-auto mb-6" /></Link>
          <h2 className="font-montserrat text-3xl font-extrabold text-[#33404f] uppercase" data-testid="reset-password-title">
            Nueva Contraseña
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {success ? (
            <div className="text-center space-y-4" data-testid="reset-password-success">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <h3 className="text-xl font-semibold text-[#33404f]">Contraseña actualizada</h3>
              <p className="text-gray-600">Tu contraseña ha sido cambiada exitosamente.</p>
              <Button
                onClick={() => navigate('/login')}
                className="bg-[#00e7ff] hover:bg-[#00c4d4] text-white w-full py-6 text-lg rounded-xl font-bold"
                data-testid="go-to-login-button"
              >
                Ir a Iniciar Sesión
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nueva contraseña (mín. 6 caracteres)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 py-6 rounded-xl border-gray-300"
                  data-testid="reset-new-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirmar nueva contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 py-6 rounded-xl border-gray-300"
                  data-testid="reset-confirm-password-input"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#00e7ff] hover:bg-[#00c4d4] text-white py-6 text-lg rounded-xl font-bold"
                data-testid="reset-password-submit"
              >
                {loading ? 'Actualizando...' : 'Restablecer Contraseña'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
