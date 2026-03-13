import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';

const SelectRole = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedRole, setSelectedRole] = useState('client');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(location.state?.user || null);
  const [roles, setRoles] = useState(location.state?.user?.roles || []);

  useEffect(() => {
    // If no user in state, try to get from API
    if (!user) {
      api.get('/auth/me').then(res => {
        const userData = res.data;
        const userRoles = userData.roles || [userData.role];
        setUser(userData);
        setRoles(userRoles);
        
        // If only one role, redirect immediately
        if (userRoles.length <= 1) {
          if (userData.role === 'provider') {
            navigate('/provider/dashboard', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        }
      }).catch(() => {
        navigate('/login', { replace: true });
      });
    }
  }, []);

  const handleSelectRole = async () => {
    setLoading(true);
    try {
      const response = await api.post('/auth/select-role', { role: selectedRole });
      
      // Update user in localStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...currentUser, ...response.data.user, role: selectedRole }));
      
      toast.success(selectedRole === 'client' ? 'Entrando como Cliente' : 'Entrando como Cuidador');
      
      // Redirect based on role
      if (selectedRole === 'provider') {
        navigate('/provider/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      toast.error('Error al seleccionar perfil');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while fetching user
  if (!user || roles.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#00e7ff] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If only one role, this shouldn't render (useEffect handles redirect)
  if (roles.length <= 1) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#33404f] mb-2">¡Hola, {user?.name}!</h1>
          <p className="text-gray-500">¿Con qué perfil quieres entrar?</p>
        </div>

        <div className="space-y-4 mb-8">
          {/* Client Option */}
          <button
            onClick={() => setSelectedRole('client')}
            className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
              selectedRole === 'client'
                ? 'border-[#00e7ff] bg-red-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              selectedRole === 'client' ? 'bg-[#00e7ff] text-white' : 'bg-gray-100 text-gray-500'
            }`}>
              <User className="w-6 h-6" />
            </div>
            <div className="text-left flex-1">
              <h3 className="font-bold text-[#33404f]">Cliente</h3>
              <p className="text-sm text-gray-500">Buscar cuidadores para mis mascotas</p>
            </div>
            {selectedRole === 'client' && (
              <div className="w-6 h-6 bg-[#00e7ff] rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>

          {/* Provider Option */}
          {roles.includes('provider') && (
            <button
              onClick={() => setSelectedRole('provider')}
              data-testid="select-provider-btn"
              className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                selectedRole === 'provider'
                  ? 'border-[#00e7ff] bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                selectedRole === 'provider' ? 'bg-[#00e7ff] text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                <Shield className="w-6 h-6" />
              </div>
              <div className="text-left flex-1">
                <h3 className="font-bold text-[#33404f]">Cuidador</h3>
                <p className="text-sm text-gray-500">Ofrecer mis servicios de cuidado</p>
              </div>
              {selectedRole === 'provider' && (
                <div className="w-6 h-6 bg-[#00e7ff] rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          )}
        </div>

        <Button
          onClick={handleSelectRole}
          disabled={loading}
          className="w-full h-12 bg-[#00e7ff] hover:bg-[#00c4d4] text-white font-semibold"
        >
          {loading ? 'Cargando...' : 'Continuar'}
        </Button>

        <p className="text-center text-xs text-gray-400 mt-4">
          Puedes cambiar de perfil cerrando sesión e iniciando de nuevo
        </p>
      </div>
    </div>
  );
};

export default SelectRole;
