import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '@/lib/api';

const GoogleAuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processGoogleLogin = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (!token) {
          navigate('/login', { replace: true });
          return;
        }

        // Guardar token
        localStorage.setItem('jwt_token', token);

        // Obtener usuario actual
        const response = await api.get('/auth/me');
        const user = response.data;

        console.log('Usuario actual:', user);
        console.log('Rol actual:', user.role);

        // Guardar datos del usuario
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('user_role', user.role);

        // Redirigir según rol
        if (user.role === 'admin') {
          navigate('/admin', { replace: true });
        } else if (user.role === 'provider') {
          navigate('/provider/dashboard', { replace: true });
        } else if (user.role === 'client') {
          navigate('/client/dashboard', { replace: true });
        } else {
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('user');
          localStorage.removeItem('user_role');
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('Google login error:', error);
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user');
        localStorage.removeItem('user_role');
        navigate('/login', { replace: true });
      }
    };

    processGoogleLogin();
  }, [navigate, location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#E6202E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Iniciando sesión con Google...</p>
      </div>
    </div>
  );
};

export default GoogleAuthSuccess;