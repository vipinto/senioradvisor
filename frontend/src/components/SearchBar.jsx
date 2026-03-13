import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Home, Heart, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
      {/* Service Tabs */}
      <div className="flex flex-wrap gap-3 mb-6 justify-center">
        {SERVICE_TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeService === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveService(tab.id)}
              className={`flex items-center gap-3 px-6 py-4 rounded-xl font-bold text-lg transition-all ${
                isActive
                  ? 'bg-[#00e7ff] text-[#33404f] shadow-lg'
                  : 'bg-white text-[#33404f] hover:bg-gray-100 border-2 border-gray-300'
              }`}
              data-testid={`service-tab-${tab.id}`}
            >
              <Icon className="w-6 h-6" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row items-stretch gap-4">
          {/* Address - Full Width */}
          <div className="flex-1 relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[#33404f]" />
            <input
              type="text"
              placeholder="Ingresa tu dirección o comuna"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full pl-14 pr-4 h-16 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00e7ff] focus:border-[#00e7ff] text-lg text-[#33404f] placeholder-gray-500"
              data-testid="search-address-input"
            />
          </div>

          {/* Search Button */}
          <Button
            type="submit"
            className="h-16 px-12 bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f] font-bold text-xl rounded-xl whitespace-nowrap shadow-lg"
            data-testid="search-submit-button"
          >
            Buscar
          </Button>
        </div>
      </form>
    </div>
  );
}
