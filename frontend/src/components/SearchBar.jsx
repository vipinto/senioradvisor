import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, CalendarDays, Home, Heart, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';

const SERVICE_TABS = [
  { id: 'residencias', label: 'Residencias', icon: Home },
  { id: 'cuidado-domicilio', label: 'Cuidado a Domicilio', icon: Heart },
  { id: 'salud-mental', label: 'Salud Mental', icon: Brain },
];

export default function SearchBar({ onSearch, initialService, initialAddress, compact }) {
  const navigate = useNavigate();
  const [activeService, setActiveService] = useState(initialService || 'residencias');
  const [address, setAddress] = useState(initialAddress || '');
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });
  const [selectedDates, setSelectedDates] = useState([]);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const getDateLabel = () => {
    if (activeService === 'cuidado-domicilio') {
      if (dateRange.from && dateRange.to) {
        return `${format(dateRange.from, 'dd MMM', { locale: es })} - ${format(dateRange.to, 'dd MMM', { locale: es })}`;
      }
      if (dateRange.from) return `${format(dateRange.from, 'dd MMM', { locale: es })} - ...`;
      return 'Ingresa un rango de fechas';
    }
    if (selectedDates.length > 0) {
      if (selectedDates.length === 1) return format(selectedDates[0], 'dd MMM yyyy', { locale: es });
      return `${selectedDates.length} fechas seleccionadas`;
    }
    return 'Selecciona una o mas fechas';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (address.trim()) params.set('comuna', address);
    params.set('service', activeService);
    if (activeService === 'cuidado-domicilio' && dateRange.from) {
      params.set('from', dateRange.from.toISOString());
      if (dateRange.to) params.set('to', dateRange.to.toISOString());
    } else if (selectedDates.length > 0) {
      params.set('dates', selectedDates.map(d => d.toISOString()).join(','));
    }
    if (onSearch) {
      onSearch({ service: activeService, address, dateRange, selectedDates });
    } else {
      navigate(`/search?${params.toString()}`);
    }
  };

  return (
    <div className="w-full" data-testid="search-bar-component">
      {/* Service Tabs */}
      <div className="flex gap-3 mb-4">
        {SERVICE_TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeService === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveService(tab.id);
                setDateRange({ from: undefined, to: undefined });
                setSelectedDates([]);
              }}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-base transition-all ${
                isActive
                  ? 'bg-[#2B547E] text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              data-testid={`service-tab-${tab.id}`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-3">
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          {/* Address */}
          <div className="flex-1 relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Dirección"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full pl-12 pr-4 h-16 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2B547E] focus:border-transparent text-base"
              data-testid="search-address-input"
            />
          </div>

          {/* Date Picker */}
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex-1 flex items-center gap-3 px-4 h-16 border border-gray-200 rounded-xl text-left hover:bg-gray-50 transition-colors min-w-[260px]"
                data-testid="date-picker-trigger"
              >
                <CalendarDays className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <span className={`text-base truncate ${(dateRange.from || selectedDates.length > 0) ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                  {getDateLabel()}
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-50" align="start">
              {activeService === 'cuidado-domicilio' ? (
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range) => setDateRange(range || { from: undefined, to: undefined })}
                  locale={es}
                  numberOfMonths={2}
                  disabled={{ before: new Date() }}
                  data-testid="calendar-range"
                />
              ) : (
                <Calendar
                  mode="multiple"
                  selected={selectedDates}
                  onSelect={(dates) => setSelectedDates(dates || [])}
                  locale={es}
                  numberOfMonths={2}
                  disabled={{ before: new Date() }}
                  data-testid="calendar-multiple"
                />
              )}
            </PopoverContent>
          </Popover>

          {/* Search Button */}
          <Button
            type="submit"
            className="h-16 px-10 bg-[#2B547E] hover:bg-[#1E3A5F] text-white font-bold text-lg rounded-xl whitespace-nowrap"
            data-testid="search-submit-button"
          >
            Buscar
          </Button>
        </div>
      </form>
    </div>
  );
}
