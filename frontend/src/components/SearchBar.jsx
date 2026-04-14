import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Heart, Brain, LayoutGrid, Search } from 'lucide-react';
import api from '@/lib/api';

const SERVICE_TABS = [
  { id: '', label: 'Todos', icon: LayoutGrid },
  { id: 'residencias', label: 'Residencias', icon: Home },
  { id: 'cuidado-domicilio', label: 'Cuidado a Domicilio', icon: Heart },
  { id: 'salud-mental', label: 'Salud Mental', icon: Brain },
];

export default function SearchBar() {
  const navigate = useNavigate();
  const [activeService, setActiveService] = useState('');
  const [regions, setRegions] = useState([]);
  const [comunas, setComunas] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedComuna, setSelectedComuna] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    api.get('/providers/filters-options').then(res => {
      setRegions(res.data.regions || []);
      setComunas(res.data.comunas || []);
    }).catch(() => {});
  }, []);

  const handleRegionChange = (region) => {
    setSelectedRegion(region);
    setSelectedComuna('');
    if (region) {
      api.get(`/providers/filters-options?region=${encodeURIComponent(region)}`).then(res => {
        setComunas(res.data.comunas || []);
      }).catch(() => {});
    } else {
      api.get('/providers/filters-options').then(res => {
        setComunas(res.data.comunas || []);
      }).catch(() => {});
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (activeService) params.set('service_type', activeService);
    if (selectedRegion) params.set('region', selectedRegion);
    if (selectedComuna) params.set('comuna', selectedComuna);
    if (minPrice) params.set('min_price', minPrice);
    if (maxPrice) params.set('max_price', maxPrice);
    if (minRating) params.set('min_rating', minRating);
    if (searchText.trim()) params.set('q', searchText.trim());
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="w-full" data-testid="search-bar-component">
      {/* Service Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-5">
        {SERVICE_TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeService === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveService(tab.id)}
              className={`flex items-center justify-center gap-2.5 px-4 py-3 sm:px-6 sm:py-4 rounded-2xl font-bold text-sm sm:text-base transition-all shadow-md ${
                isActive
                  ? 'bg-[#33404f] text-white'
                  : 'bg-white text-[#33404f] border border-gray-200 hover:border-gray-300'
              }`}
              data-testid={`service-tab-${tab.id || 'all'}`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Text Search Bar */}
      <div className="my-4 bg-white rounded-2xl shadow-xl border border-gray-200 px-5 py-4 sm:px-6 flex items-center gap-3">
        <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
        <input
          type="text"
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
          placeholder="Buscar por nombre, dirección o comuna..."
          className="flex-1 text-base text-[#33404f] placeholder-gray-400 focus:outline-none bg-transparent"
          data-testid="search-text-input"
        />
        {searchText && (
          <button onClick={() => setSearchText('')} className="text-gray-400 hover:text-gray-600">
            <span className="text-lg leading-none">&times;</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-3">
          {/* Region */}
          <div className="flex-1 min-w-0">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Region</label>
            <select
              value={selectedRegion}
              onChange={e => handleRegionChange(e.target.value)}
              className="w-full h-[42px] border border-gray-200 rounded-xl px-3 text-sm text-[#33404f] bg-gray-50 focus:outline-none focus:border-[#00e7ff] transition-colors"
              data-testid="filter-region"
            >
              <option value="">Todas las regiones</option>
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="hidden sm:block w-px h-[42px] bg-gray-200 flex-shrink-0"></div>

          {/* Comuna */}
          <div className="flex-1 min-w-0">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Comuna</label>
            <select
              value={selectedComuna}
              onChange={e => setSelectedComuna(e.target.value)}
              className="w-full h-[42px] border border-gray-200 rounded-xl px-3 text-sm text-[#33404f] bg-gray-50 focus:outline-none focus:border-[#00e7ff] transition-colors"
              data-testid="filter-comuna"
            >
              <option value="">Todas las comunas</option>
              {comunas.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="hidden sm:block w-px h-[42px] bg-gray-200 flex-shrink-0"></div>

          {/* Price */}
          <div className="flex-1 min-w-0">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Precio</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Desde"
                value={minPrice}
                onChange={e => setMinPrice(e.target.value)}
                className="w-full h-[42px] border border-gray-200 rounded-xl px-3 text-sm text-[#33404f] bg-gray-50 focus:outline-none focus:border-[#00e7ff] transition-colors"
                data-testid="filter-price-min"
              />
              <input
                type="number"
                placeholder="Hasta"
                value={maxPrice}
                onChange={e => setMaxPrice(e.target.value)}
                className="w-full h-[42px] border border-gray-200 rounded-xl px-3 text-sm text-[#33404f] bg-gray-50 focus:outline-none focus:border-[#00e7ff] transition-colors"
                data-testid="filter-price-max"
              />
            </div>
          </div>

          <div className="hidden sm:block w-px h-[42px] bg-gray-200 flex-shrink-0"></div>

          {/* Rating */}
          <div className="min-w-0 sm:w-[130px] flex-shrink-0">
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Rating</label>
            <select
              value={minRating}
              onChange={e => setMinRating(e.target.value)}
              className="w-full h-[42px] border border-gray-200 rounded-xl px-3 text-sm text-[#33404f] bg-gray-50 focus:outline-none focus:border-[#00e7ff] transition-colors"
              data-testid="filter-rating"
            >
              <option value="">Todos</option>
              <option value="3">3+ estrellas</option>
              <option value="4">4+ estrellas</option>
              <option value="5">5 estrellas</option>
            </select>
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="h-[42px] px-8 bg-[#00e7ff] hover:bg-[#00d4e8] text-[#33404f] font-bold text-sm rounded-xl transition-colors flex-shrink-0"
            data-testid="search-submit-button"
          >
            Buscar
          </button>
        </div>
      </div>
    </div>
  );
}
