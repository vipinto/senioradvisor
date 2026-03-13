import React from 'react';
import { AMENITIES_CONFIG } from './AmenitiesDisplay';

const AmenitiesToggle = ({ amenities = [], onChange }) => {
  const toggleAmenity = (id) => {
    const updated = amenities.includes(id)
      ? amenities.filter(a => a !== id)
      : [...amenities, id];
    onChange(updated);
  };

  return (
    <div className="space-y-6" data-testid="amenities-toggle-panel">
      {Object.entries(AMENITIES_CONFIG).map(([key, category]) => (
        <div key={key}>
          <h3 className="font-bold text-[#33404f] mb-3 text-base">{category.label}</h3>
          <div className="grid grid-cols-2 gap-2">
            {category.items.map(item => {
              const Icon = item.icon;
              const active = amenities.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleAmenity(item.id)}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-left ${
                    active
                      ? 'border-[#00e7ff] bg-[#00e7ff]/5 text-[#33404f]'
                      : 'border-gray-200 text-gray-400 hover:border-gray-300'
                  }`}
                  data-testid={`toggle-amenity-${item.id}`}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-[#00e7ff]' : 'text-gray-300'}`} />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AmenitiesToggle;
