import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Home, Heart, Brain } from 'lucide-react';

const SERVICE_TABS = [
  { id: 'residencias', label: 'Residencias', icon: Home },
  { id: 'cuidado-domicilio', label: 'Cuidado a Domicilio', icon: Heart },
  { id: 'salud-mental', label: 'Salud Mental', icon: Brain },
];

export default function SearchBar({ onSearch, initialService, initialAddress }) {
  const navigate = useNavigate();
  const [activeService, setActiveService] = useState(initialService || 'residencias');
  const [address, setAddress] = useState(initialAddress || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (address.trim()) params.set('comuna', address);
    params.set('service', activeService);
    if (onSearch) {
      onSearch({ service: activeService, address });
    } else {
      navigate(`/search?${params.toString()}`);
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
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-3 flex items-center gap-2">
          <div className="flex-1 flex items-center gap-3 pl-4">
            <MapPin className="w-6 h-6 text-[#33404f] shrink-0" />
            <input
              type="text"
              placeholder="Ingresa tu dirección o comuna"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full h-14 text-lg text-[#33404f] placeholder-gray-400 focus:outline-none bg-transparent"
              data-testid="search-address-input"
            />
          </div>
          <button
            type="submit"
            className="h-14 px-10 bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f] font-bold text-lg rounded-xl transition-colors shrink-0"
            data-testid="search-submit-button"
          >
            Buscar
          </button>
        </div>
      </form>
    </div>
  );
}
