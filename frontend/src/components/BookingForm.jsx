import React, { useState, useEffect } from 'react';
import { Calendar, Clock, PawPrint, X, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { es } from 'date-fns/locale';
import { format } from 'date-fns';
import { toast } from 'sonner';
import api from '@/lib/api';

const SERVICE_LABELS = {
  paseo: 'Paseo',
  cuidado: 'Cuidado',
  daycare: 'Daycare'
};

export default function BookingForm({ provider, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [pets, setPets] = useState([]);
  const [selectedPets, setSelectedPets] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingPets, setLoadingPets] = useState(true);

  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    try {
      const res = await api.get('/pets');
      setPets(res.data);
    } catch (e) {
      console.error('Error loading pets:', e);
    } finally {
      setLoadingPets(false);
    }
  };

  const togglePet = (petId) => {
    setSelectedPets(prev => 
      prev.includes(petId) 
        ? prev.filter(id => id !== petId)
        : [...prev, petId]
    );
  };

  const handleSubmit = async () => {
    if (!selectedService) {
      toast.error('Selecciona un servicio');
      return;
    }
    if (!startDate) {
      toast.error('Selecciona una fecha');
      return;
    }
    if (selectedPets.length === 0) {
      toast.error('Selecciona al menos una mascota');
      return;
    }

    setLoading(true);
    try {
      await api.post('/bookings', {
        provider_id: provider.provider_id,
        service_type: selectedService,
        start_date: startDate.toISOString(),
        end_date: endDate ? endDate.toISOString() : null,
        pet_ids: selectedPets,
        notes: notes.trim() || null
      });
      toast.success('Reserva enviada! El cuidador respondera pronto.');
      onSuccess?.();
      onClose?.();
    } catch (e) {
      toast.error(e.response?.data?.detail || 'Error al crear reserva');
    } finally {
      setLoading(false);
    }
  };

  const isMultiDay = selectedService === 'cuidado';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-testid="booking-modal">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-[#00e7ff] to-[#00c4d4] text-[#33404f]">
          <div>
            <h2 className="text-xl font-bold">Nueva Reserva</h2>
            <p className="text-sm opacity-80">{provider.business_name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex border-b">
          {[
            { num: 1, label: 'Servicio' },
            { num: 2, label: 'Fecha' },
            { num: 3, label: 'Mascotas' }
          ].map(({ num, label }) => (
            <button
              key={num}
              onClick={() => num < step && setStep(num)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                step === num 
                  ? 'text-[#00e7ff] border-b-2 border-[#00e7ff]' 
                  : step > num 
                    ? 'text-green-600' 
                    : 'text-gray-400'
              }`}
            >
              {step > num && <Check className="w-4 h-4 inline mr-1" />}
              {label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Step 1: Service Selection */}
          {step === 1 && (
            <div className="space-y-3" data-testid="step-service">
              <p className="text-sm text-gray-500 mb-4">Selecciona el servicio que necesitas:</p>
              {provider.services?.length > 0 ? (
                provider.services.map((service, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedService(service.service_type)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      selectedService === service.service_type
                        ? 'border-[#00e7ff] bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    data-testid={`service-option-${service.service_type}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-semibold text-[#33404f] capitalize">
                          {SERVICE_LABELS[service.service_type] || service.service_type}
                        </span>
                        {service.description && (
                          <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                        )}
                        {service.pet_sizes?.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {service.pet_sizes.map((size, j) => (
                              <span key={j} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full capitalize">
                                {size}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="text-[#00e7ff] font-bold whitespace-nowrap">
                        ${service.price_from?.toLocaleString('es-CL')}
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <AlertCircle className="w-12 h-12 mx-auto mb-2" />
                  <p>Este cuidador no tiene servicios configurados</p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Date Selection */}
          {step === 2 && (
            <div data-testid="step-date">
              <p className="text-sm text-gray-500 mb-4">
                {isMultiDay 
                  ? 'Selecciona las fechas de inicio y fin del cuidado:' 
                  : 'Selecciona la fecha del servicio:'}
              </p>
              
              <div className="flex justify-center">
                <CalendarUI
                  mode={isMultiDay ? "range" : "single"}
                  selected={isMultiDay ? { from: startDate, to: endDate } : startDate}
                  onSelect={(value) => {
                    if (isMultiDay && value) {
                      setStartDate(value.from || null);
                      setEndDate(value.to || null);
                    } else {
                      setStartDate(value);
                      setEndDate(null);
                    }
                  }}
                  locale={es}
                  disabled={{ before: new Date() }}
                  numberOfMonths={1}
                  className="rounded-xl border"
                  data-testid="booking-calendar"
                />
              </div>

              {startDate && (
                <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-[#00e7ff]" />
                    <span className="font-medium">
                      {isMultiDay && endDate 
                        ? `${format(startDate, 'dd MMM yyyy', { locale: es })} - ${format(endDate, 'dd MMM yyyy', { locale: es })}`
                        : format(startDate, 'EEEE, dd MMMM yyyy', { locale: es })}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Pet Selection & Notes */}
          {step === 3 && (
            <div data-testid="step-pets">
              <p className="text-sm text-gray-500 mb-4">Selecciona las mascotas para este servicio:</p>
              
              {loadingPets ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-2 border-[#00e7ff] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : pets.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <PawPrint className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 mb-3">No tienes mascotas registradas</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open('/mis-mascotas/nueva', '_blank')}
                  >
                    Agregar Mascota
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 mb-4">
                  {pets.map(pet => (
                    <button
                      key={pet.pet_id}
                      onClick={() => togglePet(pet.pet_id)}
                      className={`w-full p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${
                        selectedPets.includes(pet.pet_id)
                          ? 'border-[#00e7ff] bg-red-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      data-testid={`pet-option-${pet.pet_id}`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPets.includes(pet.pet_id)
                          ? 'border-[#00e7ff] bg-[#00e7ff]'
                          : 'border-gray-300'
                      }`}>
                        {selectedPets.includes(pet.pet_id) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      {pet.photo ? (
                        <img 
                          src={pet.photo.startsWith('http') ? pet.photo : `${process.env.REACT_APP_BACKEND_URL}${pet.photo}`} 
                          alt={pet.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <PawPrint className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 text-left">
                        <p className="font-medium">{pet.name}</p>
                        <p className="text-xs text-gray-500">{pet.breed || pet.species} - {pet.size}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-4">
                <label className="text-sm font-medium text-gray-700">Notas adicionales (opcional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Información adicional para el cuidador..."
                  className="w-full mt-1 border rounded-xl p-3 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-[#00e7ff]"
                  data-testid="booking-notes"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex gap-3">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="flex-1"
            >
              Atras
            </Button>
          )}
          
          {step < 3 ? (
            <Button
              onClick={() => {
                if (step === 1 && !selectedService) {
                  toast.error('Selecciona un servicio');
                  return;
                }
                if (step === 2 && !startDate) {
                  toast.error('Selecciona una fecha');
                  return;
                }
                setStep(step + 1);
              }}
              className="flex-1 bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f]"
              data-testid="next-step-btn"
            >
              Siguiente
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading || selectedPets.length === 0}
              className="flex-1 bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f]"
              data-testid="submit-booking-btn"
            >
              {loading ? 'Enviando...' : 'Confirmar Reserva'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
