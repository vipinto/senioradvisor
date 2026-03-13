import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { PawPrint, Camera, Plus, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import api, { API_BASE } from '@/lib/api';

const PET_SIZES = [
  { id: 'pequeno', label: 'Pequeno' },
  { id: 'mediano', label: 'Mediano' },
  { id: 'grande', label: 'Grande' },
];

const PET_SEX = [
  { id: 'macho', label: 'Macho' },
  { id: 'hembra', label: 'Hembra' },
];

const PetForm = ({ onSaved, onCancel }) => {
  const [form, setForm] = useState({ name: '', breed: '', size: 'mediano', sex: 'macho', age: '', photo: null });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/pets/upload-photo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm(prev => ({ ...prev, photo: res.data.url }));
    } catch {
      toast.error('Error al subir foto');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Ingresa el nombre de tu mascota'); return; }
    setSaving(true);
    try {
      const payload = { ...form, age: form.age ? parseInt(form.age) : null, species: 'perro' };
      await api.post('/pets', payload);
      toast.success('Mascota agregada');
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 space-y-5" data-testid="pet-form">
      {/* Photo */}
      <div className="flex justify-center">
        <button type="button" onClick={() => fileRef.current?.click()} className="relative w-28 h-28 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 hover:border-[#00e7ff] flex items-center justify-center overflow-hidden transition-colors" data-testid="pet-photo-upload">
          {preview || form.photo ? (
            <img src={preview || `${API_BASE}${form.photo}`} alt="Mascota" className="w-full h-full object-cover" />
          ) : (
            <Camera className="w-8 h-8 text-gray-400" />
          )}
          {uploading && <div className="absolute inset-0 bg-black/30 flex items-center justify-center"><div className="w-6 h-6 border-2 border-white border-t-transparent animate-spin rounded-full" /></div>}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
      </div>
      <p className="text-center text-xs text-gray-500">Sube una foto de tu mascota</p>

      {/* Fields */}
      <div>
        <label className="block text-sm font-medium mb-1">Nombre *</label>
        <Input placeholder="Ej: Max" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} data-testid="pet-name-input" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Raza</label>
        <Input placeholder="Ej: Labrador, Mestizo" value={form.breed} onChange={e => setForm({ ...form, breed: e.target.value })} data-testid="pet-breed-input" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tamano</label>
          <div className="flex gap-2">
            {PET_SIZES.map(s => (
              <button key={s.id} type="button" onClick={() => setForm({ ...form, size: s.id })}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${form.size === s.id ? 'bg-[#00e7ff] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                data-testid={`pet-size-${s.id}`}
              >{s.label}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Sexo</label>
          <div className="flex gap-2">
            {PET_SEX.map(s => (
              <button key={s.id} type="button" onClick={() => setForm({ ...form, sex: s.id })}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${form.sex === s.id ? 'bg-[#00e7ff] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                data-testid={`pet-sex-${s.id}`}
              >{s.label}</button>
            ))}
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Edad (anos)</label>
        <Input type="number" placeholder="Ej: 3" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} data-testid="pet-age-input" />
      </div>

      <div className="flex gap-3">
        {onCancel && <Button variant="outline" onClick={onCancel} className="flex-1" data-testid="pet-cancel-btn">Cancelar</Button>}
        <Button onClick={handleSave} disabled={saving || uploading} className="flex-1 bg-[#00e7ff] hover:bg-[#00c4d4]" data-testid="pet-save-btn">
          {saving ? 'Guardando...' : 'Guardar Mascota'}
        </Button>
      </div>
    </div>
  );
};

export default function PetSetup() {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [showForm, setShowForm] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadPets = async () => {
    try {
      const res = await api.get('/pets');
      setPets(res.data);
    } catch {}
  };

  const handlePetSaved = () => {
    loadPets();
    setShowForm(false);
  };

  const handleContinue = () => {
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8" data-testid="pet-setup-page">
      <div className="max-w-lg mx-auto px-4">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <PawPrint className="w-8 h-8 text-[#00e7ff]" />
          </div>
          <h1 className="text-3xl font-bold text-[#33404f]">Agrega tu Mascota</h1>
          <p className="text-gray-500 mt-2">Asi los cuidadores podran conocer mejor a tu companerito</p>
        </div>

        {/* List of saved pets */}
        {pets.length > 0 && (
          <div className="space-y-3 mb-6">
            {pets.map(pet => (
              <div key={pet.pet_id} className="bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm" data-testid={`saved-pet-${pet.pet_id}`}>
                {pet.photo ? (
                  <img src={`${API_BASE}${pet.photo}`} alt={pet.name} className="w-14 h-14 rounded-full object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                    <PawPrint className="w-6 h-6 text-[#00e7ff]" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-bold">{pet.name}</h3>
                  <p className="text-sm text-gray-500">{pet.breed || 'Sin raza'} - {pet.size} - {pet.sex}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add pet form or button */}
        {showForm ? (
          <PetForm onSaved={handlePetSaved} onCancel={pets.length > 0 ? () => setShowForm(false) : null} />
        ) : (
          <button onClick={() => setShowForm(true)} className="w-full bg-white rounded-2xl shadow-sm p-5 border-2 border-dashed border-gray-300 hover:border-[#00e7ff] flex items-center justify-center gap-3 text-gray-500 hover:text-[#00e7ff] transition-colors" data-testid="add-another-pet-btn">
            <Plus className="w-5 h-5" /> Agregar otra mascota
          </button>
        )}

        {/* Continue / Skip */}
        <div className="mt-8 space-y-3">
          <Button onClick={handleContinue} className="w-full bg-[#00e7ff] hover:bg-[#00c4d4] py-6 text-lg" data-testid="continue-to-dashboard">
            {pets.length > 0 ? 'Continuar' : 'Omitir por ahora'} <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
          {pets.length === 0 && (
            <p className="text-center text-xs text-gray-400">Podras agregar tus mascotas mas tarde desde tu perfil</p>
          )}
        </div>
      </div>
    </div>
  );
}
