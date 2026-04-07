import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';

export default function Destacados() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/providers?featured=true&limit=100').then(res => {
      const data = res.data.results || res.data;
      const sorted = Array.isArray(data) ? data.sort((a, b) => (b.rating || 0) - (a.rating || 0)) : [];
      setFeatured(sorted);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-16 h-16 border-4 border-[#00e7ff] border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#00e7ff] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-2 text-[#33404f] hover:text-[#33404f]/70 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Volver al inicio</span>
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-[#33404f]" data-testid="destacados-title">Residencias y Cuidados Domiciliarios Destacados</h1>
          <p className="text-[#33404f]/70 text-lg mt-2">Los servicios mejor evaluados por las familias</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {featured.length === 0 ? (
          <p className="text-center text-gray-500 py-16">No hay residencias destacadas por el momento.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="destacados-grid">
            {featured.map((p) => (
              <Link
                key={p.provider_id}
                to={`/provider/${p.provider_id}`}
                className="group block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
                data-testid={`destacado-${p.provider_id}`}
              >
                <div className="h-48 bg-gray-200 overflow-hidden">
                  <img
                    src={p.photos?.[0] || p.gallery?.[0]?.url || ''}
                    alt={p.business_name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-1 mb-1.5">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(p.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                    <span className="text-sm font-bold text-[#33404f] ml-1">{p.rating?.toFixed(1)}</span>
                  </div>
                  <h3 className="font-bold text-[#33404f] text-base mb-1 group-hover:text-[#00e7ff] transition-colors">{p.business_name}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {p.comuna}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
