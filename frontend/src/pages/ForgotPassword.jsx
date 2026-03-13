import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Ingresa tu correo electrónico');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al enviar el correo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
                    <Link to="/"><img src="/ucan-logo-rojo.svg" alt="U-CAN" className="h-16 mx-auto mb-6" /></Link>
          <h2 className="font-montserrat text-3xl font-extrabold text-[#33404f] uppercase" data-testid="forgot-password-title">
            Recuperar Contraseña
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {sent ? (
            <div className="text-center space-y-4" data-testid="forgot-password-success">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <h3 className="text-xl font-semibold text-[#33404f]">Correo enviado</h3>
              <p className="text-gray-600">
                Si el correo <strong>{email}</strong> está registrado, recibirás un enlace para restablecer tu contraseña.
              </p>
              <p className="text-sm text-gray-500">Revisa tu bandeja de entrada y spam.</p>
            </div>
          ) : (
            <>
              <p className="text-gray-600 text-center">
                Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 py-6 rounded-xl border-gray-300"
                    data-testid="forgot-password-email-input"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#00e7ff] hover:bg-[#00c4d4] text-white py-6 text-lg rounded-xl font-bold"
                  data-testid="forgot-password-submit"
                >
                  {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                </Button>
              </form>
            </>
          )}

          <div className="text-center">
            <Link to="/login" className="text-sm text-[#00e7ff] hover:underline inline-flex items-center gap-1" data-testid="back-to-login-link">
              <ArrowLeft className="w-4 h-4" /> Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
