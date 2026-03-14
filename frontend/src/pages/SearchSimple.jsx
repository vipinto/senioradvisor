import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MapPin, Star, Shield, Search, X, ChevronRight, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const SERVICE_TABS = [
  { id: 'residencias', label: 'Residencias' },
  { id: 'cuidado-domicilio', label: 'Cuidado a Domicilio' },
  { id: 'salud-mental', label: 'Salud Mental' },
];

const SERVICE_NAMES = {
  'residencias': 'Residencias',
  'cuidado-domicilio': 'Cuidado a Domicilio',
  'salud-mental': 'Salud Mental',
};

const getPhotoUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
};

const getProviderMainImage = (provider) => {
  if (provider?.profile_photo) return getPhotoUrl(provider.profile_photo);
  if (provider?.gallery?.[0]?.url) return getPhotoUrl(provider.gallery[0].url);
  if (provider?.photos?.[0]) return getPhotoUrl(provider.photos[0]);
  return null;
};

const ITEMS_PER_PAGE = 50;

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchAddress, setSearchAddress] = useState(searchParams.get('comuna') || '');
  const [activeService, setActiveService] = useState(searchParams.get('service') || '');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const inputRef = useRef(null);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setProviders([]);
    loadProviders(1, true);
  }, [activeService]);

  const loadProviders = async (pageNum = 1, isNewSearch = false) => {
    if (isNewSearch) setLoading(true);
    else setLoadingMore(true);

    try {
      const params = new URLSearchParams();
      if (activeService) params.set('service_type', activeService);
      if (searchAddress.trim()) params.set('comuna', searchAddress.trim());
      params.set('limit', ITEMS_PER_PAGE.toString());
      params.set('skip', ((pageNum - 1) * ITEMS_PER_PAGE).toString());

      const response = await api.get(`/providers?${params.toString()}`);
      const newData = response.data;

      if (isNewSearch) {
        setProviders(newData);
        setTotalCount(newData.length);
      } else {
        setProviders(prev => {
          const merged = [...prev, ...newData];
          setTotalCount(merged.length);
          return merged;
        });
      }
      setHasMore(newData.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Error loading providers:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadProviders(nextPage, false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setHasMore(true);
    setProviders([]);
    loadProviders(1, true);
  };

  const clearSearch = () => {
    setSearchAddress('');
    setPage(1);
    setHasMore(true);
    setProviders([]);
    loadProviders(1, true);
  };

  const getUniqueServiceTypes = (services) => {
    if (!services || services.length === 0) return [];
    const seen = new Set();
    return services.filter(s => {
      const key = s.service_type;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 3);
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="search-page">
      {/* Search Header */}
      <div className="bg-white border-b shadow-sm sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Service Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setActiveService('')}
              className={`px-5 py-2.5 rounded-xl text-base font-bold transition-all ${!activeService ? 'bg-[#00e7ff] text-[#33404f] shadow-lg' : 'bg-gray-100 text-[#33404f] hover:bg-gray-200 border border-gray-300'}`}
              data-testid="service-tab-all"
            >
              Todos
            </button>
            {SERVICE_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveService(tab.id)}
                className={`px-5 py-2.5 rounded-xl text-base font-bold transition-all ${activeService === tab.id ? 'bg-[#00e7ff] text-[#33404f] shadow-lg' : 'bg-gray-100 text-[#33404f] hover:bg-gray-200 border border-gray-300'}`}
                data-testid={`service-tab-${tab.id}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex items-center gap-3">
            <div className="flex-1 relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Buscar por comuna o ciudad..."
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                className="w-full pl-12 pr-10 h-12 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00e7ff] focus:border-[#00e7ff] text-[#33404f] placeholder-gray-400"
                data-testid="search-input"
              />
              {searchAddress && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <Button
              type="submit"
              className="h-12 px-6 bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f] font-bold"
              data-testid="search-submit"
            >
              <Search className="w-5 h-5 mr-2" />
              Buscar
            </Button>
          </form>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-xl text-[#33404f]" data-testid="results-count">
            {loading ? 'Buscando...' : `${totalCount} Servicios encontrados`}
            {hasMore && !loading && <span className="text-sm font-normal text-gray-400 ml-2">(mostrando {providers.length})</span>}
          </h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#00e7ff] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : providers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl">
            <MapPin className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-600 text-center text-lg mb-4">No se encontraron servicios</p>
            <Button onClick={clearSearch} className="bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f]">
              Ver todos los servicios
            </Button>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {providers.map((provider) => (
                <Link
                  key={provider.provider_id}
                  to={`/provider/${provider.provider_id}`}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-cyan-200 transition-all duration-300 overflow-hidden group"
                  data-testid="provider-card"
                >
                  {/* Image */}
                  <div className="aspect-[16/10] bg-gray-100 overflow-hidden relative">
                    {getProviderMainImage(provider) ? (
                      <img
                        src={getProviderMainImage(provider)}
                        alt={provider.business_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <MapPin className="w-10 h-10 text-gray-300" />
                      </div>
                    )}
                    {provider.is_featured && (
                      <span className="absolute top-3 left-3 bg-[#33404f] text-white text-xs px-3 py-1 rounded-full flex items-center gap-1" data-testid="featured-badge">
                        <Crown className="w-3 h-3" /> Destacado
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-bold text-[#33404f] text-base leading-tight line-clamp-2">
                        {provider.business_name}
                      </h3>
                      {provider.verified && (
                        <Shield className="w-5 h-5 text-[#00e7ff] flex-shrink-0" />
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-gray-500 text-sm mb-2">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{provider.comuna || provider.region || 'Chile'}</span>
                    </div>

                    {provider.rating > 0 && (
                      <div className="flex items-center gap-1.5 mb-3">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold text-sm text-[#33404f]">{provider.rating}</span>
                        {provider.total_reviews > 0 && (
                          <span className="text-gray-400 text-xs">({provider.total_reviews} reseñas)</span>
                        )}
                      </div>
                    )}

                    {provider.services && provider.services.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {getUniqueServiceTypes(provider.services).map((service, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 bg-cyan-50 text-[#00b8c9] text-xs rounded-full font-medium"
                          >
                            {SERVICE_NAMES[service.service_type] || service.service_type}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="flex justify-center mt-8">
                <Button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="bg-[#33404f] hover:bg-[#4a5568] text-white px-8 py-3"
                  data-testid="load-more-btn"
                >
                  {loadingMore ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  ) : null}
                  {loadingMore ? 'Cargando...' : 'Cargar más resultados'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
