import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SENIORCLUB_LOGO = "https://customer-assets.emergentagent.com/job_316c0f31-5a86-43b3-bcc3-d5c9be92d49a/artifacts/y9u1s2ae_seniorclub.svg";
const HELP_LOGO = "https://customer-assets.emergentagent.com/job_316c0f31-5a86-43b3-bcc3-d5c9be92d49a/artifacts/tawy0n3k_images-7.png";

const convenios = [
  {
    slug: 'help-rescate',
    name: 'Help Rescate',
    logo: HELP_LOGO,
    description: 'Más de 25 años acompañando a las personas en momentos donde la salud se vuelve una prioridad. Rescate móvil, telemedicina y orientación 24/7.',
    location: 'Valparaíso, Metropolitana y Biobío',
    plans: [
      { name: 'PLAN HOGAR', category: 'Mejoramiento del Hogar', price: '$8.336', uf: '0.22' },
      { name: 'PLAN RESCATE TOTAL', category: 'Emergencias y traslados', price: '$32.152', uf: '0.81' },
    ],
    featured: true,
  },
];

export default function SeniorClubPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-[#33404f]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 text-center">
          <img src={SENIORCLUB_LOGO} alt="SeniorClub" className="h-20 mx-auto mb-6" style={{ filter: 'brightness(0) invert(1)' }} />
          <p className="text-gray-300 text-lg max-w-xl mx-auto">
            Convenios exclusivos para el bienestar de nuestros mayores. Accede a descuentos y servicios preferenciales con nuestros aliados.
          </p>
        </div>
      </div>

      {/* Convenios List */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-bold text-[#33404f] mb-8">Nuestros Convenios</h2>

        <div className="space-y-6">
          {convenios.map(c => (
            <div key={c.slug} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow" data-testid={`convenio-card-${c.slug}`}>
              <div className="flex flex-col lg:flex-row">
                {/* Logo */}
                <div className="lg:w-56 bg-gray-50 flex items-center justify-center p-8 lg:border-r border-b lg:border-b-0 border-gray-100">
                  <img src={c.logo} alt={c.name} className="w-32" />
                </div>
                {/* Content */}
                <div className="flex-1 p-6 lg:p-8">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-bold text-[#33404f]">{c.name}</h3>
                        {c.featured && <span className="bg-[#00e7ff] text-[#33404f] text-xs font-bold px-3 py-1 rounded-full">Destacado</span>}
                      </div>
                      <p className="text-sm text-gray-500 mt-1 max-w-xl">{c.description}</p>
                    </div>
                  </div>
                  {c.location && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-400 mt-2 mb-4">
                      <MapPin className="w-3.5 h-3.5 text-[#00e7ff]" /> {c.location}
                    </div>
                  )}
                  {/* Plans */}
                  <div className="grid sm:grid-cols-2 gap-4 mb-5">
                    {c.plans.map((p, i) => (
                      <div key={i} className="border border-gray-200 rounded-xl p-4 hover:border-[#00e7ff] transition-colors">
                        <p className="font-bold text-[#33404f] text-sm">{p.name}</p>
                        <p className="text-xs text-gray-400 mb-2">{p.category}</p>
                        <p className="font-bold text-lg text-[#33404f]">Desde {p.price}<span className="text-xs font-normal text-gray-400"> /mes</span></p>
                        <p className="text-[11px] text-gray-400">Cobro en UF, Desde {p.uf}</p>
                      </div>
                    ))}
                  </div>
                  <Link to={`/convenio/${c.slug}`}>
                    <Button className="bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f] font-bold" data-testid={`ver-convenio-${c.slug}`}>
                      Ver Detalle <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
