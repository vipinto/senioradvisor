import React from 'react';
import { 
  Stethoscope, Heart, Activity, Brain,
  AirVent, Flame, Camera, WashingMachine,
  Bath, Tv, BellRing, Wifi,
  Users, PartyPopper, Puzzle, Dumbbell
} from 'lucide-react';

// Definición de amenidades con categorías e iconos
export const AMENITIES_CONFIG = {
  cuidado_salud: {
    label: 'Cuidado y Salud',
    items: [
      { id: 'geriatria', label: 'Geriatría', icon: Stethoscope },
      { id: 'enfermeria', label: 'Enfermería', icon: Heart },
      { id: 'kinesiologia', label: 'Kinesiología', icon: Activity },
      { id: 'psicologia', label: 'Psicología', icon: Brain },
    ]
  },
  servicios_instalaciones: {
    label: 'Servicios e instalaciones',
    items: [
      { id: 'aire_acondicionado', label: 'Aire Acondicionado', icon: AirVent },
      { id: 'calefaccion', label: 'Calefacción', icon: Flame },
      { id: 'camaras_seguridad', label: 'Cámaras de Seguridad', icon: Camera },
      { id: 'lavanderia', label: 'Lavandería', icon: WashingMachine },
    ]
  },
  habitaciones: {
    label: 'Habitaciones',
    items: [
      { id: 'bano_privado', label: 'Baño Privado', icon: Bath },
      { id: 'tv', label: 'TV', icon: Tv },
      { id: 'boton_asistencia', label: 'Botón Asistencia', icon: BellRing },
      { id: 'wifi', label: 'Wifi', icon: Wifi },
    ]
  },
  actividades: {
    label: 'Actividades',
    items: [
      { id: 'actividades_familiares', label: 'Actividades Familiares', icon: Users },
      { id: 'celebraciones', label: 'Celebraciones', icon: PartyPopper },
      { id: 'talleres_cognitivos', label: 'Talleres Cognitivos', icon: Puzzle },
      { id: 'talleres_actividad_fisica', label: 'Talleres Actividad Física', icon: Dumbbell },
    ]
  }
};

// Componente para mostrar amenidades en el perfil público
const AmenitiesDisplay = ({ amenities = [] }) => {
  if (!amenities || amenities.length === 0) return null;

  const hasAnyInCategory = (category) => {
    return category.items.some(item => amenities.includes(item.id));
  };

  const activeCategories = Object.values(AMENITIES_CONFIG).filter(hasAnyInCategory);
  if (activeCategories.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm" data-testid="provider-amenities">
      <h2 className="text-xl font-bold mb-4 text-[#33404f]">Servicios</h2>
      <div className="grid sm:grid-cols-2 gap-6">
        {activeCategories.map((category) => (
          <div key={category.label}>
            <h3 className="font-bold text-[#33404f] mb-3 text-base">{category.label}</h3>
            <div className="space-y-2.5">
              {category.items
                .filter(item => amenities.includes(item.id))
                .map(item => {
                  const Icon = item.icon;
                  return (
                    <div key={item.id} className="flex items-center gap-3" data-testid={`amenity-${item.id}`}>
                      <Icon className="w-5 h-5 text-[#33404f]" />
                      <span className="text-sm text-[#33404f]">{item.label}</span>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AmenitiesDisplay;
