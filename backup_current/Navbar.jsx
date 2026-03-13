import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, Heart, MessageCircle, LogOut, ArrowLeftRight } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import NotificationBell from './NotificationBell';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, setUser, loading, logout } = useAuth();
  const [switching, setSwitching] = useState(false);
  const navigate = useNavigate();

  const activeRole = user?.active_role || user?.role || 'client';
  const roles = user?.roles || (user?.role ? [user.role] : []);
  const hasMultipleRoles = roles.includes('client') && roles.includes('provider');
  const isProvider = activeRole === 'provider';

  const switchRole = async () => {
    const newRole = isProvider ? 'client' : 'provider';
    setSwitching(true);
    try {
      await api.put('/auth/switch-role', { role: newRole });
      const res = await api.get('/auth/me');
      setUser(res.data);
      navigate(newRole === 'provider' ? '/provider/dashboard' : '/dashboard');
    } catch (e) {
      console.error(e);
    } finally {
      setSwitching(false);
      setIsOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-28">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src="/ucan-logo-rojo.svg" alt="U-CAN" className="h-[100px]" data-testid="navbar-logo" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/search" className="text-gray-700 hover:text-[#E6202E] font-medium transition-colors">
              Buscar Servicios
            </Link>
            
            {user ? (
              <>
                <Link to="/favoritos" className="text-gray-700 hover:text-[#E6202E]">
                  <Heart className="w-5 h-5" />
                </Link>
                <Link to="/chat" className="text-gray-700 hover:text-[#E6202E]">
                  <MessageCircle className="w-5 h-5" />
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-[#E6202E] py-2">
                    {user.picture ? (
                      <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                    <span className="font-medium">{user.name}</span>
                  </button>
                  <div className="absolute right-0 top-full pt-2 w-56 invisible group-hover:visible">
                    <div className="bg-white rounded-lg shadow-lg py-2 border">

                    {/* Role switcher - solo si tiene ambos roles */}
                    {hasMultipleRoles && (
                      <button
                        onClick={switchRole}
                        disabled={switching}
                        className="w-full text-left px-4 py-2 text-[#E6202E] hover:bg-red-50 font-semibold flex items-center space-x-2 border-b"
                        data-testid="role-switcher"
                      >
                        <ArrowLeftRight className={`w-4 h-4 ${switching ? 'animate-spin' : ''}`} />
                        <span>Cambiar a {isProvider ? 'Cliente' : 'Cuidador'}</span>
                      </button>
                    )}

                    {isProvider ? (
                      <>
                        <Link to="/provider/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                          Panel Cuidador
                        </Link>
                        {!hasMultipleRoles && (
                          <button
                            onClick={() => {
                              api.post('/auth/add-role', { role: 'client' }).then(() => {
                                api.get('/auth/me').then(r => { setUser(r.data); navigate('/dashboard'); });
                              });
                            }}
                            className="w-full text-left px-4 py-2 text-gray-500 hover:bg-gray-50 text-sm"
                          >
                            Tambien quiero ser Cliente
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        <Link to="/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                          Mi Cuenta
                        </Link>
                        {roles.includes('provider') ? (
                          <Link to="/provider/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                            Panel Cuidador
                          </Link>
                        ) : (
                          <Link to="/provider/register" className="block px-4 py-2 text-[#E6202E] hover:bg-red-50 font-medium">
                            Registrar mi Perfil
                          </Link>
                        )}
                      </>
                    )}

                    <Link to="/historial" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                      Historial y Facturas
                    </Link>
                    {user.role === 'admin' && (
                      <Link to="/admin" className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                        Administracion
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar Sesion</span>
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
                    <Button variant="outline" className="border-[#E6202E] text-[#E6202E] hover:bg-red-50">
                      Iniciar Sesion
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="bg-[#E6202E] hover:bg-[#D31522] text-white">
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
            className="md:hidden text-gray-700 hover:text-[#E6202E]"
            data-testid="mobile-menu-button"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t">
            <Link to="/search" className="block py-2 text-gray-700 hover:text-[#E6202E]" onClick={() => setIsOpen(false)}>
              Buscar Servicios
            </Link>
            {user ? (
              <>
                {/* Role switcher mobile */}
                {hasMultipleRoles && (
                  <button
                    onClick={switchRole}
                    disabled={switching}
                    className="block w-full text-left py-3 text-[#E6202E] font-semibold hover:bg-red-50 flex items-center space-x-2 border-b mb-2"
                    data-testid="role-switcher-mobile"
                  >
                    <ArrowLeftRight className={`w-4 h-4 ${switching ? 'animate-spin' : ''}`} />
                    <span>Cambiar a {isProvider ? 'Cliente' : 'Cuidador'}</span>
                  </button>
                )}

                {isProvider ? (
                  <Link to="/provider/dashboard" className="block py-2 text-gray-700 hover:text-[#E6202E]" onClick={() => setIsOpen(false)}>
                    Panel Cuidador
                  </Link>
                ) : (
                  <Link to="/dashboard" className="block py-2 text-gray-700 hover:text-[#E6202E]" onClick={() => setIsOpen(false)}>
                    Mi Cuenta
                  </Link>
                )}

                <Link to="/historial" className="block py-2 text-gray-700 hover:text-[#E6202E]" onClick={() => setIsOpen(false)}>
                  Historial y Facturas
                </Link>
                <Link to="/favoritos" className="block py-2 text-gray-700 hover:text-[#E6202E]" onClick={() => setIsOpen(false)}>
                  Favoritos
                </Link>
                <Link to="/chat" className="block py-2 text-gray-700 hover:text-[#E6202E]" onClick={() => setIsOpen(false)}>
                  Chat
                </Link>
                <button
                  onClick={() => { handleLogout(); setIsOpen(false); }}
                  className="block w-full text-left py-2 text-gray-700 hover:text-[#E6202E]"
                >
                  Cerrar Sesion
                </button>
              </>
            ) : (
              !loading && (
                <>
                  <Link to="/login" className="block w-full text-left py-2 text-gray-700 hover:text-[#E6202E]" onClick={() => setIsOpen(false)}>
                    Iniciar Sesion
                  </Link>
                  <Link to="/register" className="block w-full text-left py-2 text-[#E6202E] font-bold" onClick={() => setIsOpen(false)}>
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
