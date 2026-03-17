import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Home, Heart, Brain, Search, X } from 'lucide-react';
import api from '@/lib/api';

const SERVICE_TABS = [
  { id: 'residencias', label: 'Residencias', icon: Home },
  { id: 'cuidado-domicilio', label: 'Cuidado a Domicilio', icon: Heart },
  { id: 'salud-mental', label: 'Salud Mental', icon: Brain },
];

export default function SearchBar({ onSearch, initialService, initialAddress }) {
  const navigate = useNavigate();
  const [activeService, setActiveService] = useState(initialService || 'residencias');
  const [address, setAddress] = useState(initialAddress || '');
  const [comunas, setComunas] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    api.get('/providers/comunas').then(res => setComunas(res.data)).catch(() => {});
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    const params = new URLSearchParams();
    if (address.trim()) params.set('q', address);
    params.set('service', activeService);
    if (onSearch) {
      onSearch({ service: activeService, address });
    } else {
      navigate(`/search?${params.toString()}`);
    }
  };

  const handleInputChange = (val) => {
    setAddress(val);
    if (val.trim().length >= 1) {
      const matches = comunas.filter(c => c.toLowerCase().includes(val.toLowerCase())).slice(0, 6);
      setFiltered(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="w-full" data-testid="search-bar-component">
      {/* Category Tabs */}
      <div className="flex justify-center gap-3 mb-6">
        {SERVICE_TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeService === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveService(tab.id)}
              className={`flex items-center gap-2.5 px-6 py-4 rounded-2xl font-bold text-base transition-all shadow-md ${
                isActive
                  ? 'bg-[#00e7ff] text-[#33404f]'
                  : 'bg-white text-[#33404f] border border-gray-200 hover:border-gray-300'
              }`}
              data-testid={`service-tab-${tab.id}`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-3 flex items-center gap-2 relative">
          <div className="flex-1 flex items-center gap-3 pl-4 relative">
            <Search className="w-6 h-6 text-[#33404f] shrink-0" />
            <input
              type="text"
              placeholder="Buscar por nombre, dirección o comuna"
              value={address}
              onChange={e => handleInputChange(e.target.value)}
              onFocus={() => {
                if (address.trim().length >= 1) {
                  const matches = comunas.filter(c => c.toLowerCase().includes(address.toLowerCase())).slice(0, 6);
                  setFiltered(matches);
                  setShowSuggestions(matches.length > 0);
                }
              }}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="w-full h-14 text-lg text-[#33404f] placeholder-gray-400 focus:outline-none bg-transparent"
              data-testid="search-address-input"
            />
            {address && (
              <button type="button" onClick={() => { setAddress(''); setShowSuggestions(false); }} className="text-gray-400 hover:text-gray-600 shrink-0">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="h-14 px-10 bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f] font-bold text-lg rounded-xl transition-colors shrink-0"
            data-testid="search-submit-button"
          >
            Buscar
          </button>

          {showSuggestions && filtered.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto" data-testid="home-comuna-suggestions">
              {filtered.map((comuna, i) => (
                <button
                  key={i}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); setAddress(comuna); setShowSuggestions(false); }}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-cyan-50 flex items-center gap-2 border-b border-gray-100 last:border-0 transition-colors"
                  data-testid={`home-suggestion-${i}`}
                >
                  <MapPin className="w-4 h-4 text-[#00e7ff] flex-shrink-0" />
                  <span className="text-[#33404f]">{comuna}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
