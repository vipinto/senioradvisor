import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Zap, Leaf, Scale } from 'lucide-react';
import SearchBar from '@/components/SearchBar';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-50 via-white to-red-50 pt-20 pb-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto" data-testid="hero-section">
            <h1 className="font-montserrat text-5xl lg:text-6xl font-extrabold text-gray-900 uppercase tracking-wide leading-tight mb-6">
              Dale el mejor
              <span className="block text-[#E6202E]">cuidado</span>
              a tu mascota
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto mb-10">
              Facilitamos el cuidado y el paseo de <span className="font-semibold text-[#E6202E]">perros</span>, conectando a dueños de mascotas con <span className="font-semibold">cuidadores y paseadores confiables</span> en su área.
            </p>

            {/* SearchBar - Full Width */}
            <div className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-100 mb-8">
              <SearchBar />
            </div>
          </div>
        </div>
      </section>

      {/* Banner de llamado de atencion */}
      <section className="bg-[#E6202E]" data-testid="cta-banner">
        <div className="flex flex-col md:flex-row items-stretch">
          <div className="md:w-4/12 relative min-h-[300px] md:min-h-0">
            <img
              src="https://customer-assets.emergentagent.com/job_65d8ccc2-c80e-4fb0-abb5-2ad57b86462f/artifacts/sl5o6d4t_french-bulldog-sitting-ground-park.jpg"
              alt="Persona con mascota"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </div>
          <div className="md:w-8/12 flex items-center px-8 py-12 md:py-14 md:px-12">
              <div className="text-white w-full">
                <h2 className="font-montserrat text-4xl font-bold uppercase tracking-wide mb-2 text-center">
                  El buen cuidado es vital para su felicidad
                </h2>
                <p className="text-base md:text-lg opacity-90 leading-relaxed mb-8 text-center">
                  En U-Can, transformamos la rutina en bienestar. Dale a tu perro lo que realmente necesita:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full border-2 border-white bg-white flex items-center justify-center mb-3">
                      <Zap className="w-9 h-9 text-[#E6202E]" />
                    </div>
                    <p className="font-bold text-2xl uppercase tracking-widest mb-1.5">Vitalidad</p>
                    <p className="opacity-85 text-sm leading-relaxed">Un perro activo es un perro sano. El ejercicio diario canaliza su energia, evita el sedentarismo y mejora su calidad de vida.</p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full border-2 border-white bg-white flex items-center justify-center mb-3">
                      <Leaf className="w-9 h-9 text-[#E6202E]" />
                    </div>
                    <p className="font-bold text-2xl uppercase tracking-widest mb-1.5">Armonia</p>
                    <p className="opacity-85 text-sm leading-relaxed">Explorar nuevos entornos y olores reduce el estres y la ansiedad, mejorando su comportamiento y su confianza ante el mundo.</p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full border-2 border-white bg-white flex items-center justify-center mb-3">
                      <Scale className="w-9 h-9 text-[#E6202E]" />
                    </div>
                    <p className="font-bold text-2xl uppercase tracking-widest mb-1.5">Equilibrio</p>
                    <p className="opacity-85 text-sm leading-relaxed">La constancia es la clave de una buena relacion con tu perro. Una rutina establecida potencia su inteligencia y le brinda la estabilidad emocional que merece.</p>
                  </div>
                </div>
                <div className="text-center">
                  <Link to="/search">
                    <Button className="bg-white text-[#E6202E] hover:bg-gray-100 px-8 py-4 text-base font-bold rounded-xl">
                      Buscar Cuidadores Ahora
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white" data-testid="services-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-montserrat text-4xl font-bold text-gray-900 uppercase tracking-wide mb-4">Servicios</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { id: 'paseo', title: 'Paseo', desc: 'Retiro de los perros en la casa de sus dueños, paseo, ejercicio y devolución', icon: (
                <svg className="w-16 h-16 text-[#E6202E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="8" cy="14" r="1.5" fill="currentColor"/>
                  <circle cx="16" cy="14" r="1.5" fill="currentColor"/>
                  <circle cx="12" cy="17" r="2" fill="currentColor"/>
                  <circle cx="10" cy="11" r="1" fill="currentColor"/>
                  <circle cx="14" cy="11" r="1" fill="currentColor"/>
                </svg>
              )},
              { id: 'cuidado', title: 'Cuidado', desc: 'Cuidado de perros en tu propia casa mientras sus dueños se van de viaje algunos días', icon: (
                <svg className="w-16 h-16 text-[#E6202E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 15.5l-1.5-1.32c-.98-.86-1.5-1.53-1.5-2.18 0-.65.53-1.18 1.18-1.18.37 0 .72.17.95.45.23-.28.58-.45.95-.45.65 0 1.18.53 1.18 1.18 0 .65-.52 1.32-1.5 2.18L12 15.5z" fill="currentColor" stroke="none"/>
                </svg>
              )},
              { id: 'daycare', title: 'Daycare', desc: 'Cuidado de perros durante el día mientras sus dueños se van a trabajar', icon: (
                <svg className="w-16 h-16 text-[#E6202E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18.84 12.25c0 .75-.21 1.46-.58 2.06" strokeLinecap="round"/>
                  <path d="M12 6V3M12 6a6 6 0 016 6" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 6a6 6 0 00-6 6c0 2.22 1.21 4.16 3 5.2" strokeLinecap="round"/>
                  <path d="M12 15c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" fill="currentColor"/>
                  <path d="M9 18h6M10.5 21h3" strokeLinecap="round"/>
                  <circle cx="12" cy="13" r="1" fill="currentColor"/>
                </svg>
              )}
            ].map((service, index) => (
              <div key={index} className="text-center group cursor-pointer" onClick={() => navigate(`/search?service=${service.id}`)}>
                <div className="flex justify-center mb-6">
                  <div className="w-32 h-32 rounded-full border-4 border-[#E6202E] flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 bg-red-50">
                    {service.icon}
                  </div>
                </div>
                <h3 className="font-montserrat text-2xl font-bold text-gray-900 uppercase tracking-wide">{service.title}</h3>
                <p className="text-gray-500 mt-2">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Phone Mockup */}
            <div className="flex justify-center">
              <div className="relative mx-auto" style={{ maxWidth: '380px' }}>
                <img
                  src="/phone-ucan.png"
                  alt="U-CAN App"
                  className="w-full h-auto"
                />
              </div>
            </div>
            {/* Text Content */}
            <div className="space-y-6">
              <h2 className="font-montserrat text-4xl font-bold text-gray-900 uppercase tracking-wide">Nosotros</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed text-lg">
                <p><span className="font-bold text-[#E6202E]">U-CAN</span> es una <span className="font-semibold">aplicación innovadora</span> diseñada para facilitar el cuidado y paseo de <span className="font-semibold text-[#E6202E]">perros</span>, conectando a dueños de mascotas con <span className="font-semibold">cuidadores y paseadores confiables</span> en su área.</p>
                <p>La plataforma ofrece una interfaz sencilla, servicios personalizados y garantizando <span className="font-semibold text-[#E6202E]">bienestar y seguridad para las mascotas</span>.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA for Providers */}
      <section className="py-20 bg-gradient-to-r from-[#E6202E] to-[#D31522]">
        <div className="max-w-7xl mx-auto px-4 text-center text-white">
          <h2 className="font-montserrat text-4xl font-bold mb-4">¿Ofreces servicios para mascotas?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">Únete a U-CAN y conecta con miles de dueños de mascotas que buscan cuidadores como tú.</p>
          <Link to="/provider/register">
            <Button className="bg-white text-[#E6202E] hover:bg-gray-100 px-12 py-6 text-lg font-bold rounded-xl">
              Registrar mi Perfil Gratis
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#E6202E] py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-white text-sm opacity-80">
          U-CAN - Todos los derechos reservados
        </div>
      </footer>
    </div>
  );
};

export default Home;
