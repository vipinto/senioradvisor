import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Camera, Phone, MapPin, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import api from '@/lib/api';

const ClientAccount = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileRef = useRef(null);

  // Profile form
  const [profileForm, setProfileForm] = useState({
    name: '', phone: '', address: '', comuna: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const userRes = await api.get('/auth/me');
      const u = userRes.data;
      setUser(u);
      setProfileForm({
        name: u.name || '',
        phone: u.phone || '',
        address: u.address || '',
        comuna: u.comuna || ''
      });
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/profile/upload-photo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUser(prev => ({ ...prev, picture: res.data.url }));
      toast.success('Foto actualizada');
    } catch { toast.error('Error al subir foto'); }
    finally { setUploadingPhoto(false); }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.put('/profile/update', profileForm);
      toast.success('Perfil actualizado correctamente');
      setUser(prev => ({ ...prev, ...profileForm }));
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al guardar');
    } finally {
      setSavingProfile(false);
    }
  };

  const getPhotoUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${process.env.REACT_APP_BACKEND_URL}${url}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#00e7ff] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">No se pudo cargar tu información</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Mi Cuenta</h1>

        {/* Mi Perfil */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#00e7ff]" />
            Mi Perfil
          </h2>

          {/* Profile Photo */}
          <div className="flex items-center gap-6 mb-6">
            <div className="relative group">
              <button
                onClick={() => fileRef.current?.click()}
                className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 group-hover:opacity-80 transition-opacity"
              >
                {user.picture ? (
                  <img src={getPhotoUrl(user.picture)} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#00e7ff] text-[#33404f] flex items-center justify-center text-3xl font-bold">
                    {user.name?.[0] || 'U'}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {uploadingPhoto ? <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" /> : <Camera className="w-6 h-6 text-white" />}
                </div>
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleProfilePhoto} />
            </div>
            <div>
              <p className="font-medium text-gray-700">Foto de perfil</p>
              <p className="text-sm text-gray-500">Haz clic para cambiar</p>
            </div>
          </div>

          <form onSubmit={saveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
              <Input
                value={profileForm.name}
                onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Tu nombre"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email
              </label>
              <Input
                value={user.email}
                disabled
                className="bg-gray-100"
              />
              <p className="text-xs text-gray-400 mt-1">El email no se puede cambiar</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Teléfono
                </label>
                <Input
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+56 9 1234 5678"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Comuna
                </label>
                <Input
                  value={profileForm.comuna}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, comuna: e.target.value }))}
                  placeholder="Ej: Las Condes"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
              <Input
                value={profileForm.address}
                onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Calle, número, depto (opcional)"
              />
            </div>

            <Button type="submit" disabled={savingProfile} className="bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f]">
              {savingProfile ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClientAccount;
