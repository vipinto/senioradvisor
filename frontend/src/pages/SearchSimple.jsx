import React, { useState, useEffect, useCallback, useRef, Component } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { MapPin, Star, Shield, Navigation, Search, X, ChevronRight, ChevronDown, Home, Crown, DollarSign, SlidersHorizontal, Heart, List, Map } from 'lucide-react';
import { GoogleMap, Marker, InfoWindow, useJsApiLoader } from '@react-google-maps/api';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import api from '@/lib/api';
import { toast } from 'sonner';

class MapErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center">
          <MapPin className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-500 font-medium">Mapa no disponible</p>
          <p className="text-gray-400 text-sm mt-1">Usa la lista para encontrar servicios</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const GOOGLE_MAPS_KEY = process.env.REACT_APP_GOOGLE_MAPS_KEY || '';
const API_URL = process.env.REACT_APP_BACKEND_URL || '';
const LIBRARIES = ['places'];
const DEFAULT_CENTER = { lat: -33.4489, lng: -70.6693 };
const DEFAULT_ZOOM = 12;
const mapStyles = [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }];

// Ocultar errores de Google Maps
if (typeof document !== 'undefined') {
  const s = document.createElement('style');
  s.textContent = '.gm-err-container,.gm-err-message,.gm-err-title,.dismissButton,.gm-style-pbc{display:none!important}.gm-style iframe+div{display:none!important}';
  document.head.appendChild(s);
  const obs = new MutationObserver(() => {
    document.querySelectorAll('div').forEach(el => {
      if (el.textContent === 'Oops! Something went wrong.' && el.children.length <= 2) {
        let parent = el.closest('.gm-style') || el.parentElement;
        if (parent) parent.style.display = 'none';
      }
    });
  });
  obs.observe(document.body, { childList: true, subtree: true });
}

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
  if (provider?.gallery?.[0]?.url) return getPhotoUrl(provider.gallery[0].url);
  if (provider?.photos?.[0]) return getPhotoUrl(provider.photos[0]);
  return null;
};

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const [providers, setProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchAddress, setSearchAddress] = useState(searchParams.get('q') || searchParams.get('comuna') || '');
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

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const PAGE_SIZE = 20;

  // Filters
  const [minRating, setMinRating] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [amenitiesOpen, setAmenitiesOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [showFilters, setShowFilters] = useState(false);

  // Autocomplete
  const [comunas, setComunas] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredComunas, setFilteredComunas] = useState([]);

  const mapRef = useRef(null);
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);
  const searchInputRef = useRef(null);
  const boundsTimeoutRef = useRef(null);

  // User & Favorites
  const [currentUser, setCurrentUser] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  // Google Maps
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_KEY,
    libraries: LIBRARIES,
  });

  useEffect(() => {
    loadProviders();
  }, [activeService, currentPage, minRating, minPrice, maxPrice, verifiedOnly, selectedAmenities]);

  useEffect(() => {
    // Load user and favorites
    api.get('/auth/me').then(res => {
      setCurrentUser(res.data);
      if (res.data.role !== 'admin' && res.data.role !== 'provider') {
        api.get('/favorites').then(favRes => {
          const ids = new Set((favRes.data || []).map(p => p.provider_id));
          setFavoriteIds(ids);
        }).catch(() => {});
      }
    }).catch(() => {});
  }, []);

  const toggleFavorite = async (e, providerId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUser) return;
    try {
      if (favoriteIds.has(providerId)) {
        await api.delete(`/favorites/${providerId}`);
        setFavoriteIds(prev => { const n = new Set(prev); n.delete(providerId); return n; });
        toast.success('Eliminado de favoritos');
      } else {
        await api.post(`/favorites/${providerId}`);
        setFavoriteIds(prev => new Set(prev).add(providerId));
        toast.success('Añadido a favoritos');
      }
    } catch {
      toast.error('Error al actualizar favoritos');
    }
  };

  useEffect(() => {
    // Load comunas for autocomplete
    api.get('/providers/comunas').then(res => setComunas(res.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (isLoaded && !loadError && inputRef.current && !autocompleteRef.current && window.google?.maps?.places) {
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
      if (searchAddress.trim()) params.set('q', searchAddress.trim());
      params.set('skip', ((currentPage - 1) * PAGE_SIZE).toString());
      params.set('limit', PAGE_SIZE.toString());

      if (minRating) params.set('min_rating', minRating);
      if (minPrice) params.set('min_price', minPrice);
      if (maxPrice) params.set('max_price', maxPrice);
      if (verifiedOnly) params.set('verified_only', 'true');
      if (selectedAmenities.length > 0) params.set('amenities', selectedAmenities.join(','));

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
      const data = response.data;
      const providersList = data.results || data;
      const total = data.total || providersList.length;
      setProviders(providersList);
      setFilteredProviders(providersList);
      setTotalResults(total);
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
    setCurrentPage(1);
    setShowSuggestions(false);
    loadProviders();

    if (searchAddress.trim() && isLoaded && window.google?.maps?.Geocoder) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: searchAddress, region: 'cl' }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const lat = results[0].geometry.location.lat();
          const lng = results[0].geometry.location.lng();
          // Only apply geo filter if location is in Chile (lat -17 to -56, lng -75 to -66)
          if (lat >= -56 && lat <= -17 && lng >= -76 && lng <= -66) {
            const newCenter = { lat, lng };
            setMapCenter(newCenter);
            filterProvidersByLocation(newCenter, searchRadius);
            if (mapRef.current) {
              mapRef.current.panTo(newCenter);
            }
          }
        }
      });
    }
  };

  const clearSearch = () => {
    setSearchAddress('');
    setActiveService('');
    setCurrentPage(1);
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

  const AMENITIES_LIST = [
    'Acceso silla de ruedas', 'Acompañamiento', 'Aire acondicionado', 'Alimentación especial',
    'Áreas verdes', 'Calefacción', 'Enfermería', 'Estacionamiento',
    'Habitación privada', 'Jardín', 'Kinesiología', 'Lavandería',
    'Sala de estar', 'Terapia ocupacional', 'Terraza', 'WiFi'
  ];

  const activeFiltersCount = [activeService, minRating, minPrice, maxPrice, verifiedOnly, selectedAmenities.length > 0].filter(Boolean).length;

  const clearAllFilters = () => {
    setActiveService('');
    setMinRating('');
    setMinPrice('');
    setMaxPrice('');
    setVerifiedOnly(false);
    setSelectedAmenities([]);
    setCurrentPage(1);
    clearSearch();
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="search-page">
      {/* Top Search Bar */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-screen-2xl mx-auto px-4 py-3">
          <form onSubmit={handleSearch} className="flex items-center gap-3">
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#33404f]" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Buscar por nombre, comuna o direccion..."
                value={searchAddress}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchAddress(val);
                  if (val.trim().length >= 1) {
                    const matches = comunas.filter(c => c.toLowerCase().includes(val.toLowerCase())).slice(0, 8);
                    setFilteredComunas(matches);
                    setShowSuggestions(matches.length > 0);
                  } else {
                    setShowSuggestions(false);
                  }
                }}
                onFocus={() => {
                  if (searchAddress.trim().length >= 1) {
                    const matches = comunas.filter(c => c.toLowerCase().includes(searchAddress.toLowerCase())).slice(0, 8);
                    setFilteredComunas(matches);
                    setShowSuggestions(matches.length > 0);
                  }
                }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="w-full pl-10 pr-10 h-11 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00e7ff] text-[#33404f]"
                data-testid="search-input"
              />
              {showSuggestions && filteredComunas.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto" data-testid="comuna-suggestions">
                  {filteredComunas.map((comuna, i) => (
                    <button key={i} type="button" onMouseDown={(e) => { e.preventDefault(); setSearchAddress(comuna); setShowSuggestions(false); setCurrentPage(1); }} className="w-full text-left px-4 py-2.5 text-sm hover:bg-cyan-50 flex items-center gap-2 border-b border-gray-50 last:border-0" data-testid={`suggestion-${i}`}>
                      <MapPin className="w-3 h-3 text-[#00e7ff] flex-shrink-0" />
                      <span className="text-[#33404f]">{comuna}</span>
                    </button>
                  ))}
                </div>
              )}
              {searchAddress && (
                <button type="button" onClick={() => { setSearchAddress(''); setShowSuggestions(false); clearSearch(); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#33404f]">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <Button type="button" variant="outline" onClick={getCurrentLocation} disabled={locationLoading} className="h-11 px-4 border-gray-200 text-[#33404f] text-sm" data-testid="location-button">
              <Navigation className={`w-4 h-4 ${locationLoading ? 'animate-pulse' : ''}`} />
              <span className="ml-1.5 hidden sm:inline">Mi ubicacion</span>
            </Button>
            <Button type="submit" className="h-11 px-6 bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f] text-sm font-bold" data-testid="search-submit">
              <Search className="w-4 h-4" />
              <span className="ml-1.5">Buscar</span>
            </Button>
            {/* Mobile filter toggle */}
            <button type="button" onClick={() => setShowFilters(!showFilters)} className="lg:hidden h-11 px-3 border border-gray-200 rounded-xl flex items-center gap-1.5 text-sm text-[#33404f] relative">
              <SlidersHorizontal className="w-4 h-4" />
              {activeFiltersCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#00e7ff] text-[#33404f] text-[10px] font-bold rounded-full flex items-center justify-center">{activeFiltersCount}</span>}
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto flex gap-5 px-4 py-5">
        {/* Left Sidebar Filters */}
        <aside className={`${showFilters ? 'fixed inset-0 z-50 bg-white overflow-y-auto pt-4 px-4 pb-20' : 'hidden'} lg:block lg:static lg:w-[280px] lg:flex-shrink-0 lg:bg-white lg:border lg:border-gray-200 lg:rounded-2xl lg:overflow-y-auto lg:px-6 lg:py-6 lg:self-start lg:sticky lg:top-[72px]`} style={{ maxHeight: 'calc(100vh - 90px)', scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }} data-testid="filters-sidebar">
          {/* Mobile close */}
          <div className="lg:hidden flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-[#33404f]">Filtros</h3>
            <button onClick={() => setShowFilters(false)} className="p-2"><X className="w-5 h-5" /></button>
          </div>

          {/* Service Type */}
          <div className="mb-8">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Tipo de Servicio</h4>
            <div className="space-y-1">
              <button onClick={() => { setActiveService(''); setCurrentPage(1); }} className={`w-full text-left px-4 py-3 rounded-xl text-base font-semibold transition-colors ${!activeService ? 'bg-[#33404f] text-white' : 'text-[#33404f] hover:bg-gray-50'}`} data-testid="filter-service-all">Todos</button>
              {SERVICE_TABS.map(tab => (
                <button key={tab.id} onClick={() => { setActiveService(tab.id); setCurrentPage(1); }} className={`w-full text-left px-4 py-3 rounded-xl text-base font-semibold transition-colors ${activeService === tab.id ? 'bg-[#33404f] text-white' : 'text-[#33404f] hover:bg-gray-50'}`} data-testid={`filter-service-${tab.id}`}>{tab.label}</button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div className="mb-8">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Rating Minimo</h4>
            <div className="flex gap-2">
              {['3', '3.5', '4', '4.5'].map(r => (
                <button key={r} onClick={() => { setMinRating(minRating === r ? '' : r); setCurrentPage(1); }} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-colors ${minRating === r ? 'bg-[#00e7ff] text-[#33404f]' : 'bg-gray-100 text-[#33404f] hover:bg-gray-200'}`} data-testid={`filter-rating-${r}`}>
                  {r}+
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-8">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Rango de Precio (CLP)</h4>
            <div className="flex gap-2">
              <input type="number" placeholder="Min" value={minPrice} onChange={e => { setMinPrice(e.target.value); setCurrentPage(1); }} className="flex-1 w-0 h-11 px-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00e7ff]" data-testid="filter-price-min" />
              <span className="text-gray-300 self-center text-lg">-</span>
              <input type="number" placeholder="Max" value={maxPrice} onChange={e => { setMaxPrice(e.target.value); setCurrentPage(1); }} className="flex-1 w-0 h-11 px-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00e7ff]" data-testid="filter-price-max" />
            </div>
          </div>

          {/* Verified */}
          <div className="mb-8">
            <label className="flex items-center gap-3 cursor-pointer" data-testid="filter-verified">
              <input type="checkbox" checked={verifiedOnly} onChange={e => { setVerifiedOnly(e.target.checked); setCurrentPage(1); }} className="w-5 h-5 rounded border-gray-300 text-[#00e7ff] focus:ring-[#00e7ff]" />
              <Shield className="w-5 h-5 text-[#00e7ff]" />
              <span className="text-base font-medium text-[#33404f]">Solo verificados</span>
            </label>
          </div>

          {/* Amenities - Collapsible */}
          <div className="mb-8">
            <button onClick={() => setAmenitiesOpen(prev => !prev)} className="w-full flex items-center justify-between mb-3" data-testid="amenities-toggle">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Amenidades</h4>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${amenitiesOpen ? 'rotate-180' : ''}`} />
            </button>
            {selectedAmenities.length > 0 && !amenitiesOpen && (
              <p className="text-xs text-[#00e7ff] font-medium mb-2">{selectedAmenities.length} seleccionada{selectedAmenities.length > 1 ? 's' : ''}</p>
            )}
            {amenitiesOpen && (
              <div className="space-y-2.5 max-h-64 overflow-y-auto" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>
                {AMENITIES_LIST.map(a => (
                  <label key={a} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={selectedAmenities.includes(a)} onChange={e => {
                      if (e.target.checked) { setSelectedAmenities(prev => [...prev, a]); }
                      else { setSelectedAmenities(prev => prev.filter(x => x !== a)); }
                      setCurrentPage(1);
                    }} className="w-4.5 h-4.5 rounded border-gray-300 text-[#00e7ff] focus:ring-[#00e7ff]" />
                    <span className="text-sm text-[#33404f]">{a}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Clear All */}
          {activeFiltersCount > 0 && (
            <button onClick={clearAllFilters} className="w-full py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors" data-testid="clear-all-filters">
              Limpiar todos los filtros
            </button>
          )}

          {/* Mobile apply */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg">
            <Button onClick={() => setShowFilters(false)} className="w-full bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f] font-bold">
              Ver {totalResults} resultados
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-4 bg-white border-b">
            <div>
              <h2 className="font-bold text-[#33404f] text-lg" data-testid="results-count">
                {loading ? 'Buscando...' : `${totalResults} servicios encontrados`}
              </h2>
              {searchAddress && !loading && <p className="text-xs text-gray-400">Cerca de: {searchAddress}</p>}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-[#00e7ff]/10 text-[#00e7ff]' : 'text-gray-400 hover:bg-gray-100'}`} data-testid="view-list"><List className="w-5 h-5" /></button>
              <button onClick={() => setViewMode('map')} className={`p-2 rounded-lg transition-colors ${viewMode === 'map' ? 'bg-[#00e7ff]/10 text-[#00e7ff]' : 'text-gray-400 hover:bg-gray-100'}`} data-testid="view-map"><Map className="w-5 h-5" /></button>
            </div>
          </div>

          {viewMode === 'map' ? (
            <div style={{ height: 'calc(100vh - 120px)' }}>
              <MapErrorBoundary>
              {loadError ? (
                <div className="w-full h-full bg-gradient-to-br from-[#e8f7f9] to-[#d1f0f4] flex flex-col items-center justify-center">
                  <MapPin className="w-16 h-16 text-[#00e7ff]/40 mb-3" />
                  <p className="text-[#33404f]/60 font-medium text-sm">Mapa en mantenimiento</p>
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
                    options={{ styles: mapStyles, disableDefaultUI: false, zoomControl: true, mapTypeControl: false, streetViewControl: false, fullscreenControl: true }}
                    onIdle={handleBoundsChanged}
                  >
                    {filteredProviders.map((provider) => (
                      provider.latitude && provider.longitude && (
                        <Marker key={provider.provider_id} position={{ lat: provider.latitude, lng: provider.longitude }} icon={createMarkerIcon(selectedProvider?.provider_id === provider.provider_id || hoveredProvider?.provider_id === provider.provider_id)} onClick={() => setSelectedProvider(provider)} onMouseOver={() => setHoveredProvider(provider)} onMouseOut={() => setHoveredProvider(null)} />
                      )
                    ))}
                    {userLocation && <Marker position={userLocation} icon={createUserLocationIcon()} title="Tu ubicación" />}
                    {selectedProvider && (
                      <InfoWindow position={{ lat: selectedProvider.latitude, lng: selectedProvider.longitude }} onCloseClick={() => setSelectedProvider(null)}>
                        <div className="p-2 max-w-[250px]">
                          <div className="flex items-start gap-3">
                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                              {getProviderMainImage(selectedProvider) ? <img src={getProviderMainImage(selectedProvider)} alt={selectedProvider.business_name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gray-200 flex items-center justify-center"><MapPin className="w-6 h-6 text-gray-400" /></div>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-sm text-[#33404f] truncate">{selectedProvider.business_name}</h3>
                              <p className="text-xs text-gray-500 truncate">{selectedProvider.comuna}</p>
                              {selectedProvider.rating > 0 && <div className="flex items-center gap-1 mt-1"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /><span className="text-xs font-medium">{selectedProvider.rating}</span></div>}
                            </div>
                          </div>
                          <Link to={`/provider/${selectedProvider.provider_id}`} className="mt-3 block w-full text-center py-2 bg-[#00e7ff] text-[#33404f] text-sm font-medium rounded-lg hover:bg-[#00c4d4]">Ver perfil</Link>
                        </div>
                      </InfoWindow>
                    )}
                  </GoogleMap>
                  <button onClick={() => setIsMapSearchActive(!isMapSearchActive)} className={`absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full shadow-lg font-medium text-sm transition-all ${isMapSearchActive ? 'bg-[#00e7ff] text-[#33404f]' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`} data-testid="dynamic-search-toggle">
                    {isMapSearchActive ? <><span className="inline-block w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>Busqueda dinamica activa</> : 'Buscar al mover el mapa'}
                  </button>
                </>
              )}
              </MapErrorBoundary>
            </div>
          ) : (
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 120px)' }}>
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-12 h-12 border-4 border-[#00e7ff] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : filteredProviders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-4">
                  <MapPin className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-gray-600 text-center mb-4">No se encontraron servicios</p>
                  <Button onClick={clearAllFilters} variant="outline">Limpiar filtros</Button>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredProviders.map((provider) => {
                    const img = getProviderMainImage(provider);
                    const lowestPrice = provider.services?.reduce((min, s) => {
                      const p = parseInt(s.price_from);
                      return p && (!min || p < min) ? p : min;
                    }, null);
                    return (
                      <Link
                        key={provider.provider_id}
                        to={`/provider/${provider.provider_id}`}
                        className={`block px-5 py-5 hover:bg-gray-50 transition-colors ${hoveredProvider?.provider_id === provider.provider_id ? 'bg-cyan-50' : ''}`}
                        onMouseEnter={() => setHoveredProvider(provider)}
                        onMouseLeave={() => setHoveredProvider(null)}
                        data-testid="provider-card"
                      >
                        <div className="flex gap-5">
                          {/* Image */}
                          <div className="w-48 h-36 sm:w-56 sm:h-40 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 relative">
                            {img ? <img src={img} alt={provider.business_name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><MapPin className="w-10 h-10 text-gray-300" /></div>}
                            {currentUser && currentUser.role !== 'admin' && currentUser.role !== 'provider' && (
                              <button onClick={(e) => toggleFavorite(e, provider.provider_id)} className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-sm hover:bg-white transition-colors" data-testid={`favorite-btn-${provider.provider_id}`}>
                                <Heart className={`w-5 h-5 ${favoriteIds.has(provider.provider_id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                              </button>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-[#33404f] text-lg">{provider.business_name}</h3>
                              {provider.plan_type === 'premium_plus' && <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#33404f] text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 font-bold" data-testid="premium-plus-badge"><Crown className="w-3 h-3" />Premium+</span>}
                              {provider.plan_type === 'premium' && <span className="bg-[#33404f] text-white text-xs px-2.5 py-0.5 rounded-full font-bold" data-testid="premium-badge">Premium</span>}
                              {provider.plan_type === 'destacado' && <span className="bg-gray-200 text-[#33404f] text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1" data-testid="destacado-badge"><Star className="w-3 h-3" />Destacado</span>}
                              {provider.verified && <Shield className="w-5 h-5 text-[#00e7ff]" />}
                            </div>

                            <div className="flex items-center gap-2 text-gray-400 mt-1.5">
                              <MapPin className="w-4 h-4" />
                              <span className="text-sm">{provider.comuna || provider.address}</span>
                              {provider.distance_km && <span className="text-[#00e7ff] font-medium text-sm">({provider.distance_km} km)</span>}
                            </div>

                            <div className="flex items-center gap-4 mt-3">
                              {provider.rating > 0 && (
                                <div className="flex items-center gap-1.5">
                                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                  <span className="text-base font-bold text-[#33404f]">{provider.rating}</span>
                                  <span className="text-sm text-gray-400">({provider.total_reviews})</span>
                                </div>
                              )}
                              {lowestPrice && <span className="text-base font-bold text-[#33404f]">Desde ${lowestPrice.toLocaleString('es-CL')}/mes</span>}
                            </div>

                            {provider.services && provider.services.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {(() => {
                                  const names = { 'residencias': 'Residencias', 'cuidado-domicilio': 'Cuidado a Domicilio', 'salud-mental': 'Salud Mental' };
                                  const seen = new Set();
                                  return provider.services.filter(s => { if (seen.has(s.service_type)) return false; seen.add(s.service_type); return true; }).slice(0, 3).map((s, i) => (
                                    <span key={i} className="px-3 py-1 bg-gray-100 text-[#33404f] text-sm rounded-lg font-medium">{names[s.service_type] || s.service_type}</span>
                                  ));
                                })()}
                              </div>
                            )}
                          </div>

                          <ChevronRight className="w-6 h-6 text-gray-300 self-center flex-shrink-0 hidden sm:block" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {totalResults > PAGE_SIZE && !loading && (
                <div className="flex items-center justify-center gap-2 py-6 border-t bg-gray-50" data-testid="pagination">
                  <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => { setCurrentPage(p => p - 1); }} data-testid="prev-page">Anterior</Button>
                  {Array.from({ length: Math.min(Math.ceil(totalResults / PAGE_SIZE), 7) }, (_, i) => {
                    const totalPages = Math.ceil(totalResults / PAGE_SIZE);
                    let page;
                    if (totalPages <= 7) page = i + 1;
                    else if (currentPage <= 4) page = i + 1;
                    else if (currentPage >= totalPages - 3) page = totalPages - 6 + i;
                    else page = currentPage - 3 + i;
                    return (
                      <Button key={page} variant={currentPage === page ? 'default' : 'outline'} size="sm" className={currentPage === page ? 'bg-[#00e7ff] text-[#33404f] hover:bg-[#00c4d4]' : ''} onClick={() => setCurrentPage(page)} data-testid={`page-${page}`}>{page}</Button>
                    );
                  })}
                  <Button variant="outline" size="sm" disabled={currentPage >= Math.ceil(totalResults / PAGE_SIZE)} onClick={() => { setCurrentPage(p => p + 1); }} data-testid="next-page">Siguiente</Button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SearchPage;