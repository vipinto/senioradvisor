import React, { useState, useEffect } from 'react';
import { MapPin, X, Plus, HelpCircle, Save, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import api from '@/lib/api';

// Comunas de la Región Metropolitana de Santiago
const COMUNAS_RM = [
  "Cerrillos", "Cerro Navia", "Conchalí", "El Bosque", "Estación Central",
  "Huechuraba", "Independencia", "La Cisterna", "La Florida", "La Granja",
  "La Pintana", "La Reina", "Las Condes", "Lo Barnechea", "Lo Espejo",
  "Lo Prado", "Macul", "Maipú", "Ñuñoa", "Pedro Aguirre Cerda",
  "Peñalolén", "Providencia", "Pudahuel", "Quilicura", "Quinta Normal",
  "Recoleta", "Renca", "San Joaquín", "San Miguel", "San Ramón",
  "Santiago Centro", "Vitacura", "Puente Alto", "San Bernardo", "Colina",
  "Lampa", "Buin", "Paine", "Melipilla", "Talagante"
].sort();

const RADIUS_OPTIONS = [1, 2, 3, 5, 10, 15, 20, 30, 50];

const ServiceZones = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedComunas, setSelectedComunas] = useState([]);
  const [walkingZones, setWalkingZones] = useState([]);
  const [coverageRadiusKm, setCoverageRadiusKm] = useState(5);
  const [newZone, setNewZone] = useState('');
  const [comunaSearch, setComunaSearch] = useState('');
  const [showComunaDropdown, setShowComunaDropdown] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [providerLocation, setProviderLocation] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await api.get('/providers/my-profile');
      setSelectedComunas(res.data.service_comunas || []);
      setWalkingZones(res.data.walking_zones || []);
      setCoverageRadiusKm(res.data.coverage_radius_km || 5);
      if (res.data.latitude && res.data.longitude) {
        setProviderLocation({ lat: res.data.latitude, lng: res.data.longitude });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/providers/my-profile', {
        service_comunas: selectedComunas,
        walking_zones: walkingZones,
        coverage_radius_km: coverageRadiusKm
      });
      toast.success('Zonas de servicio guardadas');
    } catch (error) {
      toast.error('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const addComuna = (comuna) => {
    if (!selectedComunas.includes(comuna)) {
      setSelectedComunas([...selectedComunas, comuna]);
    }
    setComunaSearch('');
    setShowComunaDropdown(false);
  };

  const removeComuna = (comuna) => {
    setSelectedComunas(selectedComunas.filter(c => c !== comuna));
  };

  const addWalkingZone = () => {
    if (newZone.trim() && !walkingZones.includes(newZone.trim())) {
      setWalkingZones([...walkingZones, newZone.trim()]);
      setNewZone('');
    }
  };

  const removeWalkingZone = (zone) => {
    setWalkingZones(walkingZones.filter(z => z !== zone));
  };

  const filteredComunas = COMUNAS_RM.filter(
    c => c.toLowerCase().includes(comunaSearch.toLowerCase()) && !selectedComunas.includes(c)
  );

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-20 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border" data-testid="service-zones">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-xl flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#00e7ff]" />
          Zona de Paseo
        </h2>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#00e7ff] hover:bg-[#00c4d4]"
          data-testid="save-zones-btn"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Guardando...
            </span>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Guardar
            </>
          )}
        </Button>
      </div>

      {/* Coverage Radius */}
      <div className="mb-6 p-4 bg-cyan-50 rounded-xl border border-cyan-100">
        <div className="flex items-center gap-2 mb-3">
          <Navigation className="w-5 h-5 text-blue-600" />
          <label className="font-medium text-blue-900">
            Radio de cobertura desde tu ubicación
          </label>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {RADIUS_OPTIONS.map(km => (
            <button
              key={km}
              onClick={() => setCoverageRadiusKm(km)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                coverageRadiusKm === km
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-cyan-100 border border-gray-200'
              }`}
              data-testid={`radius-${km}km`}
            >
              {km} km
            </button>
          ))}
        </div>
        
        <p className="text-sm text-blue-700">
          {providerLocation ? (
            <>Los clientes dentro de <strong>{coverageRadiusKm} km</strong> de tu ubicación podrán encontrarte fácilmente.</>
          ) : (
            <span className="text-orange-600">⚠️ Configura tu dirección en tu perfil para usar esta función.</span>
          )}
        </p>
      </div>

      {/* Comunas Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Comunas donde ofreces servicio <span className="text-gray-400">(Opcional)</span>
        </label>
        
        {/* Selected Comunas Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedComunas.map(comuna => (
            <span 
              key={comuna}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-800 rounded-full text-sm"
            >
              {comuna}
              <button
                onClick={() => removeComuna(comuna)}
                className="ml-1 hover:text-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </span>
          ))}
          {selectedComunas.length === 0 && (
            <span className="text-gray-400 text-sm">Además del radio, puedes especificar comunas</span>
          )}
        </div>

        {/* Comuna Search/Dropdown */}
        <div className="relative">
          <Input
            type="text"
            value={comunaSearch}
            onChange={(e) => {
              setComunaSearch(e.target.value);
              setShowComunaDropdown(true);
            }}
            onFocus={() => setShowComunaDropdown(true)}
            placeholder="Buscar y agregar comunas adicionales..."
            className="w-full"
            data-testid="comuna-search"
          />
          
          {showComunaDropdown && comunaSearch && filteredComunas.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
              {filteredComunas.slice(0, 10).map(comuna => (
                <button
                  key={comuna}
                  onClick={() => addComuna(comuna)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
                >
                  {comuna}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Walking Zones */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Zonas de paseo favoritas
          </label>
          <span className="text-xs text-gray-400">(Opcional)</span>
          <div className="relative">
            <button
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            {showTooltip && (
              <div className="absolute left-6 top-0 z-20 w-64 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-lg">
                Puedes escribir nombres de parques, plazas, monumentos, museos, centros comerciales, etc.
              </div>
            )}
          </div>
        </div>

        {/* Walking Zones Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {walkingZones.map(zone => (
            <span 
              key={zone}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm"
            >
              {zone}
              <button
                onClick={() => removeWalkingZone(zone)}
                className="ml-1 hover:text-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>

        {/* Add Walking Zone Input */}
        <div className="flex gap-2">
          <Input
            type="text"
            value={newZone}
            onChange={(e) => setNewZone(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addWalkingZone())}
            placeholder="Ej: Parque Bicentenario, Plaza de Armas..."
            className="flex-1"
            data-testid="walking-zone-input"
          />
          <Button
            onClick={addWalkingZone}
            variant="outline"
            disabled={!newZone.trim()}
            data-testid="add-zone-btn"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServiceZones;
