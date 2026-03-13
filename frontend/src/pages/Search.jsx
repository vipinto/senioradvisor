import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MapPin, Star, Shield, Filter, X } from 'lucide-react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/lib/api';

const GOOGLE_MAPS_KEY = process.env.REACT_APP_GOOGLE_MAPS_KEY || '';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters
  const [comuna, setComuna] = useState(searchParams.get('comuna') || '');
  const [serviceType, setServiceType] = useState(searchParams.get('service_type') || '');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minRating, setMinRating] = useState('');

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_KEY
  });

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (comuna) params.comuna = comuna;
      if (serviceType) params.service_type = serviceType;
      if (verifiedOnly) params.verified_only = true;
      if (minRating) params.min_rating = parseFloat(minRating);

      const response = await api.get('/providers', { params });
      setProviders(response.data);
    } catch (error) {
      console.error('Error loading providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadProviders();
  };

  const mapCenter = providers.length > 0 && providers[0].latitude
    ? { lat: providers[0].latitude, lng: providers[0].longitude }
    : { lat: -33.4489, lng: -70.6693 }; // Santiago, Chile

  return (
    <div className="min-h-screen bg-gray-50" data-testid="search-page">
      {/* Search Header */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Comuna o ciudad"
                value={comuna}
                onChange={(e) => setComuna(e.target.value)}
                className="h-12"
                data-testid="comuna-search-input"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="h-12"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            <Button type="submit" className="h-12 bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f]">
              Buscar
            </Button>
          </form>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Tipo de Servicio</label>
                <Select value={serviceType} onValueChange={setServiceType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="residencias">Residencias</SelectItem>
                    <SelectItem value="cuidado-domicilio">Cuidado a Domicilio</SelectItem>
                    <SelectItem value="salud-mental">Salud Mental</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Rating Mínimo</label>
                <Select value={minRating} onValueChange={setMinRating}>
                  <SelectTrigger>
                    <SelectValue placeholder="Cualquiera" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Cualquiera</SelectItem>
                    <SelectItem value="4">4+ estrellas</SelectItem>
                    <SelectItem value="4.5">4.5+ estrellas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={verifiedOnly}
                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                    className="w-4 h-4 text-[#00e7ff] rounded"
                  />
                  <span className="text-sm font-medium">Solo verificados</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Toggle */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-montserrat text-2xl font-bold text-[#33404f]">
            {providers.length} Servicios encontrados
          </h1>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-[#00e7ff]' : ''}
            >
              Lista
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              onClick={() => setViewMode('map')}
              className={viewMode === 'map' ? 'bg-[#00e7ff]' : ''}
            >
              Mapa
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-[#00e7ff] border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          <>
            {viewMode === 'list' ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {providers.map((provider) => (
                  <Link
                    key={provider.provider_id}
                    to={`/provider/${provider.provider_id}`}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-cyan-100 transition-all duration-300 overflow-hidden group"
                    data-testid="provider-card"
                  >
                    <div className="aspect-video bg-gray-200 overflow-hidden">
                      {provider.photos?.[0] && (
                        <img
                          src={provider.photos[0]}
                          alt={provider.business_name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-xl text-[#33404f]">
                          {provider.business_name}
                        </h3>
                        {provider.verified && (
                          <Shield className="w-5 h-5 text-[#00e7ff]" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 mb-3">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{provider.comuna}</span>
                        {provider.distance_km && (
                          <span className="text-sm text-[#00e7ff]">({provider.distance_km} km)</span>
                        )}
                      </div>
                      {provider.rating > 0 && (
                        <div className="flex items-center gap-2 mb-3">
                          <Star className="w-4 h-4 fill-[#FFD700] text-[#FFD700]" />
                          <span className="font-semibold">{provider.rating}</span>
                          <span className="text-gray-500 text-sm">
                            ({provider.total_reviews})
                          </span>
                        </div>
                      )}
                      {provider.services && provider.services.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {provider.services.map((service, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-cyan-50 text-[#00e7ff] text-xs rounded-full font-medium"
                            >
                              {service.service_type}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden" style={{ height: '600px' }}>
                {isLoaded && (
                  <GoogleMap
                    center={mapCenter}
                    zoom={12}
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                  >
                    {providers.map((provider) => (
                      provider.latitude && provider.longitude && (
                        <Marker
                          key={provider.provider_id}
                          position={{ lat: provider.latitude, lng: provider.longitude }}
                          title={provider.business_name}
                        />
                      )
                    ))}
                  </GoogleMap>
                )}
              </div>
            )}
          </>
        )}

        {!loading && providers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl">
            <p className="text-gray-600 text-lg">No se encontraron servicios</p>
            <Button
              onClick={() => {
                setComuna('');
                setServiceType('');
                setVerifiedOnly(false);
                setMinRating('');
                loadProviders();
              }}
              className="mt-4 bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f]"
            >
              Limpiar filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
