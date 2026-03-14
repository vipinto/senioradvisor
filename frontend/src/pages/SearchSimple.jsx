import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MapPin, Star, Shield, Navigation, Search, X, ChevronRight, Home, Crown } from 'lucide-react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import api from '@/lib/api';

const GOOGLE_MAPS_KEY = process.env.REACT_APP_GOOGLE_MAPS_KEY || '';
const API_URL = process.env.REACT_APP_BACKEND_URL || '';
const LIBRARIES = ['places'];
const DEFAULT_CENTER = { lat: -33.4489, lng: -70.6693 };
const DEFAULT_ZOOM = 12;
const mapStyles = [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }];

const SERVICE_TABS = [
  { id: 'residencias', label: 'Residencias' },
  { id: 'cuidado-domicilio', label: 'Cuidado a Domicilio' },
  { id: 'salud-mental', label: 'Salud Mental' },
];


const getPhotoUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${API_URL}${path}`;
};

const getProviderMainImage = (provider) => {
  if (provider?.profile_photo) return getPhotoUrl(provider.profile_photo);
  if (provider?.photos?.[0]) return getPhotoUrl(provider.photos[0]);
  return null;
};

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const [providers, setProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchAddress, setSearchAddress] = useState(searchParams.get('comuna') || '');
  const [activeService, setActiveService] = useState(searchParams.get('service') || '');
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [hoveredProvider, setHoveredProvider] = useState(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [searchRadius] = useState(10);
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });
  const [selectedDates, setSelectedDates] = useState([]);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [mapBounds, setMapBounds] = useState(null);
  const [isMapSearchActive, setIsMapSearchActive] = useState(true);

  const mapRef = useRef(null);
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);
  const boundsTimeoutRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_KEY,
    libraries: LIBRARIES
  });

  useEffect(() => {
    loadProviders();
  }, [activeService]);

  useEffect(() => {
    if (isLoaded && inputRef.current && !autocompleteRef.current && window.google?.maps?.places) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'cl' },
        fields: ['geometry', 'formatted_address']
      });

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        if (place.geometry) {
          const newCenter = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          };
          setMapCenter(newCenter);
          setSearchAddress(place.formatted_address || '');
          filterProvidersByLocation(newCenter, searchRadius);
          if (mapRef.current) {
            mapRef.current.panTo(newCenter);
          }
        }
      });
    }
  }, [isLoaded, searchRadius]);

  const loadProviders = async (bounds = null) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeService) params.set('service_type', activeService);

      let datesStr = '';
      if (activeService === 'alojamiento' && dateRange.from) {
        const dates = [];
        let d = new Date(dateRange.from);
        const end = dateRange.to || dateRange.from;
        while (d <= end) {
          dates.push(d.toISOString().slice(0, 10));
          d = new Date(d.getTime() + 86400000);
        }
        datesStr = dates.join(',');
      } else if (selectedDates.length > 0) {
        datesStr = selectedDates.map(d => d.toISOString().slice(0, 10)).join(',');
      }
      if (datesStr) params.set('dates', datesStr);

      if (bounds) {
        params.set('bounds_south', bounds.south.toString());
        params.set('bounds_west', bounds.west.toString());
        params.set('bounds_north', bounds.north.toString());
        params.set('bounds_east', bounds.east.toString());
      }

      const response = await api.get(`/providers?${params.toString()}`);
      setProviders(response.data);
      setFilteredProviders(response.data);
    } catch (error) {
      console.error('Error loading providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBoundsChanged = useCallback(() => {
    if (!mapRef.current || !isMapSearchActive) return;

    if (boundsTimeoutRef.current) {
      clearTimeout(boundsTimeoutRef.current);
    }

    boundsTimeoutRef.current = setTimeout(() => {
      const bounds = mapRef.current.getBounds();
      if (bounds) {
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        const newBounds = {
          north: ne.lat(),
          east: ne.lng(),
          south: sw.lat(),
          west: sw.lng()
        };
        setMapBounds(newBounds);
        loadProviders(newBounds);
      }
    }, 500);
  }, [isMapSearchActive, activeService, dateRange, selectedDates]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const filterProvidersByLocation = useCallback((center, radius) => {
    const filtered = providers
      .map(provider => {
        if (provider.latitude && provider.longitude) {
          const distance = calculateDistance(center.lat, center.lng, provider.latitude, provider.longitude);
          return { ...provider, distance_km: Math.round(distance * 10) / 10 };
        }
        return { ...provider, distance_km: null };
      })
      .filter(provider => provider.distance_km !== null && provider.distance_km <= radius)
      .sort((a, b) => a.distance_km - b.distance_km);

    setFilteredProviders(
      activeService
        ? filtered.filter(p => p.services?.some(s => s.service_type === activeService))
        : filtered
    );
  }, [providers, activeService]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(newLocation);
        setMapCenter(newLocation);
        setSearchAddress('Mi ubicación');
        filterProvidersByLocation(newLocation, searchRadius);
        if (mapRef.current) {
          mapRef.current.panTo(newLocation);
        }
        setLocationLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('No se pudo obtener tu ubicación');
        setLocationLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadProviders();

    if (searchAddress.trim() && isLoaded && window.google?.maps?.Geocoder) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: searchAddress, region: 'cl' }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const newCenter = {
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng()
          };
          setMapCenter(newCenter);
          filterProvidersByLocation(newCenter, searchRadius);
          if (mapRef.current) {
            mapRef.current.panTo(newCenter);
          }
        }
      });
    }
  };

  const clearSearch = () => {
    setSearchAddress('');
    setUserLocation(null);
    setFilteredProviders(providers);
    setMapCenter(DEFAULT_CENTER);
  };

  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const createMarkerIcon = (isHighlighted) => {
    if (!isLoaded || !window.google?.maps?.Size || !window.google?.maps?.Point) {
      return undefined;
    }

    const svg = isHighlighted
      ? `<svg width="40" height="50" viewBox="0 0 40 50" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 0C8.95 0 0 8.95 0 20c0 15 20 30 20 30s20-15 20-30C40 8.95 31.05 0 20 0z" fill="#00e7ff"/>
          <circle cx="20" cy="18" r="8" fill="white"/>
        </svg>`
      : `<svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 24 16 24s16-12 16-24C32 7.16 24.84 0 16 0z" fill="#00e7ff"/>
          <circle cx="16" cy="14" r="6" fill="white"/>
        </svg>`;

    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
      scaledSize: isHighlighted
        ? new window.google.maps.Size(40, 50)
        : new window.google.maps.Size(32, 40),
      anchor: isHighlighted
        ? new window.google.maps.Point(20, 50)
        : new window.google.maps.Point(16, 40)
    };
  };

  const createUserLocationIcon = () => {
    if (!isLoaded || !window.google?.maps?.Size || !window.google?.maps?.Point) {
      return undefined;
    }

    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#4285F4" stroke="white" stroke-width="3"/>
        </svg>
      `),
      scaledSize: new window.google.maps.Size(24, 24),
      anchor: new window.google.maps.Point(12, 12)
    };
  };

  const getDateLabel = () => {
    if (activeService === 'alojamiento') {
      if (dateRange.from && dateRange.to) return `${format(dateRange.from, 'dd MMM', { locale: es })} - ${format(dateRange.to, 'dd MMM', { locale: es })}`;
      if (dateRange.from) return `${format(dateRange.from, 'dd MMM', { locale: es })} - ...`;
      return 'Rango de fechas';
    }
    if (selectedDates.length > 0) {
      if (selectedDates.length === 1) return format(selectedDates[0], 'dd MMM yyyy', { locale: es });
      return `${selectedDates.length} fechas`;
    }
    return 'Selecciona fechas';
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="search-page">
      <div className="bg-white border-b shadow-sm sticky top-24 z-40">
        <div className="max-w-screen-2xl mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={() => { setActiveService(''); setFilteredProviders(providers); }}
              className={`px-6 py-3 rounded-xl text-lg font-bold transition-all ${!activeService ? 'bg-[#00e7ff] text-[#33404f] shadow-lg' : 'bg-gray-100 text-[#33404f] hover:bg-gray-200 border-2 border-gray-300'}`}
              data-testid="service-tab-all"
            >
              Todos
            </button>

            {SERVICE_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveService(tab.id);
                  setDateRange({ from: undefined, to: undefined });
                  setSelectedDates([]);
                  if (searchAddress) {
                    filterProvidersByLocation(mapCenter, searchRadius);
                  } else {
                    setFilteredProviders(providers.filter(p => p.services?.some(s => s.service_type === tab.id)));
                  }
                }}
                className={`px-6 py-3 rounded-xl text-lg font-bold transition-all ${activeService === tab.id ? 'bg-[#00e7ff] text-[#33404f] shadow-lg' : 'bg-gray-100 text-[#33404f] hover:bg-gray-200 border-2 border-gray-300'}`}
                data-testid={`service-tab-${tab.id}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="flex items-center gap-3">
            <div className="flex-1 relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-[#33404f]" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Buscar por dirección o comuna..."
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                className="w-full pl-14 pr-10 h-14 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00e7ff] focus:border-[#00e7ff] text-[#33404f] placeholder-gray-500"
                data-testid="search-input"
              />
              {searchAddress && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#33404f]"
                >
                  <X className="w-6 h-6" />
                </button>
              )}
            </div>

            {activeService && (
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-3 px-4 h-14 border-2 border-gray-300 rounded-xl hover:bg-gray-50 min-w-[180px]"
                    data-testid="search-date-trigger"
                  >
                    <Search className="w-5 h-5 text-[#33404f]" />
                    <span className={`text-base truncate ${(dateRange.from || selectedDates.length > 0) ? 'text-[#33404f] font-semibold' : 'text-gray-500'}`}>
                      {getDateLabel()}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-50" align="start">
                  {activeService === 'cuidado-domicilio' ? (
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={r => setDateRange(r || { from: undefined, to: undefined })}
                      locale={es}
                      numberOfMonths={2}
                      disabled={{ before: new Date() }}
                    />
                  ) : (
                    <Calendar
                      mode="multiple"
                      selected={selectedDates}
                      onSelect={d => setSelectedDates(d || [])}
                      locale={es}
                      numberOfMonths={2}
                      disabled={{ before: new Date() }}
                    />
                  )}
                </PopoverContent>
              </Popover>
            )}

            <Button
              type="button"
              variant="outline"
              onClick={getCurrentLocation}
              disabled={locationLoading}
              className="h-14 px-5 border-2 border-gray-300 hover:bg-gray-50 text-[#33404f] text-base font-semibold"
              data-testid="location-button"
            >
              <Navigation className={`w-6 h-6 ${locationLoading ? 'animate-pulse' : ''}`} />
              <span className="hidden sm:inline ml-2">Mi ubicación</span>
            </Button>

            <Button
              type="submit"
              className="h-14 px-8 bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f] text-lg font-bold"
              data-testid="search-submit"
            >
              <Search className="w-6 h-6" />
              <span className="hidden sm:inline ml-2">Buscar</span>
            </Button>
          </form>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row" style={{ height: 'calc(100vh - 128px)' }}>
        <div className="w-full lg:w-1/2 h-[400px] lg:h-full relative">
          {loadError ? (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center">
              <MapPin className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-gray-500 font-medium">Mapa no disponible</p>
              <p className="text-gray-400 text-sm mt-1">Usa la lista para encontrar cuidadores</p>
            </div>
          ) : !isLoaded ? (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-[#00e7ff] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              <GoogleMap
                onLoad={onMapLoad}
                center={mapCenter}
                zoom={DEFAULT_ZOOM}
                mapContainerStyle={{ width: '100%', height: '100%' }}
                options={{
                  styles: mapStyles,
                  disableDefaultUI: false,
                  zoomControl: true,
                  mapTypeControl: false,
                  streetViewControl: false,
                  fullscreenControl: true
                }}
                onIdle={handleBoundsChanged}
              >
                {filteredProviders.map((provider) => (
                  provider.latitude && provider.longitude && (
                    <Marker
                      key={provider.provider_id}
                      position={{ lat: provider.latitude, lng: provider.longitude }}
                      icon={createMarkerIcon(
                        selectedProvider?.provider_id === provider.provider_id ||
                        hoveredProvider?.provider_id === provider.provider_id
                      )}
                      onClick={() => setSelectedProvider(provider)}
                      onMouseOver={() => setHoveredProvider(provider)}
                      onMouseOut={() => setHoveredProvider(null)}
                    />
                  )
                ))}

                {userLocation && (
                  <Marker
                    position={userLocation}
                    icon={createUserLocationIcon()}
                    title="Tu ubicación"
                  />
                )}

                {selectedProvider && (
                  <InfoWindow
                    position={{ lat: selectedProvider.latitude, lng: selectedProvider.longitude }}
                    onCloseClick={() => setSelectedProvider(null)}
                  >
                    <div className="p-2 max-w-[250px]">
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                          {getProviderMainImage(selectedProvider) ? (
                            <img
                              src={getProviderMainImage(selectedProvider)}
                              alt={selectedProvider.business_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <MapPin className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm text-[#33404f] truncate">
                            {selectedProvider.business_name}
                          </h3>
                          <p className="text-xs text-gray-500 truncate">{selectedProvider.comuna}</p>
                          {selectedProvider.rating > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs font-medium">{selectedProvider.rating}</span>
                            </div>
                          )}
                          {selectedProvider.distance_km && (
                            <p className="text-xs text-[#00e7ff] mt-1">
                              {selectedProvider.distance_km} km
                            </p>
                          )}
                        </div>
                      </div>

                      <Link
                        to={`/provider/${selectedProvider.provider_id}`}
                        className="mt-3 block w-full text-center py-2 bg-[#00e7ff] text-[#33404f] text-sm font-medium rounded-lg hover:bg-[#00c4d4]"
                      >
                        Ver perfil
                      </Link>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>

              <button
                onClick={() => setIsMapSearchActive(!isMapSearchActive)}
                className={`absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full shadow-lg font-medium text-sm transition-all ${
                  isMapSearchActive
                    ? 'bg-[#00e7ff] text-[#33404f]'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
                data-testid="dynamic-search-toggle"
              >
                {isMapSearchActive ? (
                  <>
                    <span className="inline-block w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
                    Búsqueda dinámica activa
                  </>
                ) : (
                  'Buscar al mover el mapa'
                )}
              </button>
            </>
          )}
        </div>

        <div className="w-full lg:w-1/2 h-full overflow-y-auto bg-white border-l">
          <div className="p-4 border-b bg-gray-50 sticky top-0 z-10">
            <h2 className="font-bold text-lg text-[#33404f]">
              {loading ? 'Buscando...' : `${filteredProviders.length} Servicios encontrados`}
            </h2>
            {searchAddress && !loading && (
              <p className="text-sm text-gray-500 mt-1">
                Cerca de: {searchAddress}
              </p>
            )}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-[#00e7ff] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredProviders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4">
              <MapPin className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-600 text-center mb-4">
                No se encontraron servicios en esta zona
              </p>
              <Button onClick={clearSearch} variant="outline">
                Ver todos los servicios
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {filteredProviders.map((provider) => (
                <Link
                  key={provider.provider_id}
                  to={`/provider/${provider.provider_id}`}
                  className={`block p-4 hover:bg-gray-50 transition-colors ${
                    (hoveredProvider?.provider_id === provider.provider_id ||
                      selectedProvider?.provider_id === provider.provider_id)
                      ? 'bg-cyan-50' : ''
                  }`}
                  onMouseEnter={() => setHoveredProvider(provider)}
                  onMouseLeave={() => setHoveredProvider(null)}
                  data-testid="provider-card"
                >
                  <div className="flex gap-4">
                    <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-200">
                      {getProviderMainImage(provider) ? (
                        <img
                          src={getProviderMainImage(provider)}
                          alt={provider.business_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <MapPin className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-[#33404f] truncate">
                          {provider.business_name}
                        </h3>
                        {provider.is_featured && (
                          <span className="bg-[#33404f] text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0 whitespace-nowrap" data-testid="featured-badge">
                            <Crown className="w-3 h-3" />Destacado
                          </span>
                        )}
                        {provider.verified && (
                          <Shield className="w-5 h-5 text-[#00e7ff] flex-shrink-0" />
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{provider.comuna}</span>
                        {provider.distance_km && (
                          <span className="text-[#00e7ff] font-medium whitespace-nowrap">
                            ({provider.distance_km} km)
                          </span>
                        )}
                      </div>

                      {provider.rating > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-semibold text-sm">{provider.rating}</span>
                          <span className="text-gray-400 text-sm">
                            ({provider.total_reviews} reseñas)
                          </span>
                        </div>
                      )}

                      {provider.services && provider.services.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {provider.services.slice(0, 3).map((service, idx) => {
                            // Formatear nombre del servicio sin guiones
                            const formatServiceName = (type) => {
                              const names = {
                                'residencias': 'Residencias',
                                'cuidado-domicilio': 'Cuidado a Domicilio',
                                'salud-mental': 'Salud Mental'
                              };
                              return names[type] || type;
                            };
                            return (
                              <span
                                key={idx}
                                className="px-4 py-2 bg-gray-200 border border-gray-300 text-[#33404f] text-sm rounded-lg font-semibold"
                              >
                                {formatServiceName(service.service_type)}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {provider.services?.some(s => s.pet_sizes?.length > 0) && (
                        <div className="flex items-center gap-1 mt-1.5">
                          <Dog className="w-3.5 h-3.5 text-gray-400" />
                          <div className="flex gap-1">
                            {[...new Set(provider.services.flatMap(s => s.pet_sizes || []))].map((size, i) => (
                              <span key={i} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded font-medium">
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center">
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;