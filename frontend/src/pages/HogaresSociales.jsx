import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, Globe, MapPin, Search } from 'lucide-react';

const hogares = [
  { name: "Union Arabe De Beneficiarios", address: "Lo Ovalle 1671", phone: "(2)25236021 - 25210201", email: "contacto@unionarabe.cl", web: "www.unionarabe.cl" },
  { name: "Sor Teresa", address: "Sexta Avenida 1570", phone: "(2)25172878", email: "", web: "" },
  { name: "Santa Elena", address: "Buenos Aires 606", phone: "(2)28585098", email: "casasantaelena@hotmail.com", web: "" },
  { name: "San Pio", address: "Avda. Diego De Almagro 2483", phone: "(2)22253678", email: "mreyes@asonuevo.cl", web: "" },
  { name: "San Enrique", address: "Avda. El Parron 751", phone: "(2)24595197", email: "hogarderepososanenrique@hotmail.com", web: "" },
  { name: "Sagrado Corazon De Jesus", address: "Santo Domingo 1944", phone: "(2)26725275", email: "hogar2@flrosas.cl", web: "www.fundacionlasrosas.cl" },
  { name: "Residencia Mi Hogar Recoleta", address: "Samuel Escobar 390", phone: "(2)26211940", email: "hogarrecoleta@hogardecristo.cl", web: "www.hogardecristo.cl" },
  { name: "Nuestra Senora De La Merced", address: "Colon 2046", phone: "(2)27771272", email: "", web: "www.fundacionlasrosas.cl" },
  { name: "Miguel Frank Vega", address: "Puerto Rico 8133", phone: "(2)26432823", email: "loprado@conapran.cl", web: "www.conapran.cl" },
  { name: "Maria Auxiliadora", address: "La Marqueza 115", phone: "(2)22325697", email: "", web: "" },
  { name: "Hogar Nuestra Senora De Los Angeles", address: "Camino San Juan De Pirque", phone: "(2)28546334", email: "hogar32@flrosas.cl", web: "www.fundacionlasrosas.cl" },
  { name: "Hogar Santa Bernardita", address: "Calle Residencial 466", phone: "(2)27372881", email: "", web: "" },
  { name: "Hogar Nuestra Senora De Loreto", address: "Jose Arrieta 8220", phone: "(2)22792868", email: "hogar10@flrosas.cl", web: "www.fundacionlasrosas.cl" },
  { name: "Hogar Nuestra Senora De La Paz", address: "Pedro Torres 831", phone: "(2)22253854", email: "hogar5@flrosas.cl", web: "www.fundacionlasrosas.cl" },
  { name: "Hogar La Reina", address: "Caliboro 9037", phone: "(2)22737421", email: "lareina@conapran.tie.cl", web: "www.conapran.cl" },
  { name: "Hogar Espanol", address: "Alcantara 1320", phone: "(2)22289725", email: "cguajardo@hogarespanol.cl", web: "www.hogarespanol.cl" },
  { name: "Hogar De Ancianos Temuco", address: "Temuco 1340", phone: "(2)27796491 - 27649688", email: "estucitapi@hotmail.com", web: "" },
];

const HogaresSociales = () => {
  const [search, setSearch] = useState('');

  const filtered = hogares.filter(h =>
    h.name.toLowerCase().includes(search.toLowerCase()) ||
    h.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50" data-testid="hogares-sociales-page">
      {/* Header */}
      <div className="bg-[#33404f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 text-sm">
            <ArrowLeft className="w-4 h-4" /> Volver al Inicio
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-white" data-testid="hogares-title">Hogares Sociales</h1>
          <p className="text-gray-400 mt-2 max-w-2xl">Directorio de hogares sociales para adultos mayores en Chile. Informacion de contacto y ubicacion.</p>

          {/* Search */}
          <div className="relative mt-6 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre o direccion..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#00e7ff] focus:border-transparent"
              data-testid="hogares-search"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p className="text-sm text-gray-500 mb-6">{filtered.length} hogares encontrados</p>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((h, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow"
              data-testid={`hogar-card-${i}`}
            >
              <h3 className="font-bold text-[#33404f] text-sm mb-3">{h.name}</h3>

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#00e7ff] mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-gray-600">{h.address}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#00e7ff] flex-shrink-0" />
                  <a href={`tel:${h.phone.replace(/[^0-9+]/g, '')}`} className="text-xs text-gray-600 hover:text-[#00e7ff]">{h.phone}</a>
                </div>

                {h.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#00e7ff] flex-shrink-0" />
                    <a href={`mailto:${h.email}`} className="text-xs text-gray-600 hover:text-[#00e7ff] break-all">{h.email}</a>
                  </div>
                )}

                {h.web && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#00e7ff] flex-shrink-0" />
                    <a href={`https://${h.web}`} target="_blank" rel="noreferrer" className="text-xs text-[#00e7ff] hover:underline">{h.web}</a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">No se encontraron hogares con esa busqueda.</div>
        )}
      </div>
    </div>
  );
};

export default HogaresSociales;
