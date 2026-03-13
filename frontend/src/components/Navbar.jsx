import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, Heart, MessageCircle, LogOut } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('jwt_token');
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('jwt_token');
      setUser(null);
      navigate('/');
    }
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-28">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold text-[#2B547E]" data-testid="navbar-logo">SeniorAdvisor</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/search" className="text-gray-700 hover:text-[#2B547E] font-medium transition-colors">
              Buscar Servicios
            </Link>
            
            {user ? (
              <>
                <Link to="/favoritos" className="text-gray-700 hover:text-[#2B547E]">
                  <Heart className="w-5 h-5" />
                </Link>
                <Link to="/chat" className="text-gray-700 hover:text-[#2B547E]">
                  <MessageCircle className="w-5 h-5" />
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-[#2B547E] py-2">
                    {user.picture ? (
                      <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                    <span className="font-medium">{user.name}</span>
                  </button>
                  <div className="absolute right-0 top-full pt-2 w-48 invisible group-hover:visible">
                    <div className="bg-white rounded-lg shadow-lg py-2 border">
                    {user.role === 'provider' ? (
                      <Link to="/provider/account" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                        Mi Cuenta
                      </Link>
                    ) : (
                      <Link to="/account" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                        Mi Cuenta
                      </Link>
                    )}
                    {user.role === 'client' && (
                      <Link to="/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                        Panel Cliente
                      </Link>
                    )}
                    <Link to="/historial" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                      Historial y Facturas
                    </Link>
                    {user.role === 'provider' && (
                      <Link to="/provider/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                        Panel Cuidador
                      </Link>
                    )}
                    {user.role === 'admin' && (
                      <Link to="/admin" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                        Administración
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                    </div>
                  </div>
                </div>
                <NotificationBell />
              </>
            ) : (
              !loading && (
                <>
                  <Link to="/login">
                    <Button variant="outline" className="border-[#2B547E] text-[#2B547E] hover:bg-blue-50">
                      Iniciar Sesión
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="bg-[#2B547E] hover:bg-[#1E3A5F] text-white">
                      Registrarse
                    </Button>
                  </Link>
                </>
              )
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-700 hover:text-[#2B547E]"
            data-testid="mobile-menu-button"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t">
            <Link to="/search" className="block py-2 text-gray-700 hover:text-[#2B547E]">
              Buscar Servicios
            </Link>
            {user ? (
              <>
                {user.role === 'provider' ? (
                  <Link to="/provider/account" className="block py-2 text-gray-700 hover:text-[#2B547E]">
                    Mi Cuenta
                  </Link>
                ) : (
                  <Link to="/account" className="block py-2 text-gray-700 hover:text-[#2B547E]">
                    Mi Cuenta
                  </Link>
                )}
                {user.role === 'client' && (
                  <Link to="/dashboard" className="block py-2 text-gray-700 hover:text-[#2B547E]">
                    Panel Cliente
                  </Link>
                )}
                <Link to="/historial" className="block py-2 text-gray-700 hover:text-[#2B547E]">
                  Historial y Facturas
                </Link>
                {user.role === 'provider' && (
                  <Link to="/provider/dashboard" className="block py-2 text-gray-700 hover:text-[#2B547E]">
                    Panel Cuidador
                  </Link>
                )}
                <Link to="/favoritos" className="block py-2 text-gray-700 hover:text-[#2B547E]">
                  Favoritos
                </Link>
                <Link to="/chat" className="block py-2 text-gray-700 hover:text-[#2B547E]">
                  Chat
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-2 text-gray-700 hover:text-[#2B547E]"
                >
                  Cerrar Sesión
                </button>
              </>
            ) : (
              !loading && (
                <>
                  <Link to="/login" className="block w-full text-left py-2 text-gray-700 hover:text-[#2B547E]">
                    Iniciar Sesión
                  </Link>
                  <Link to="/register" className="block w-full text-left py-2 text-[#2B547E] font-bold">
                    Registrarse
                  </Link>
                </>
              )
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
