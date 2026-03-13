import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home as HomeIcon, Heart, Brain } from 'lucide-react';
import SearchBar from '@/components/SearchBar';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-blue-50 pt-20 pb-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto" data-testid="hero-section">
            <h1 className="font-montserrat text-5xl lg:text-6xl font-extrabold text-gray-900 uppercase tracking-wide leading-tight mb-6">
              Encuentra el mejor
              <span className="block text-[#2B547E]">cuidado</span>
              para adultos mayores
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto mb-10">
              Conectamos familias con <span className="font-semibold text-[#2B547E]">residencias</span>, <span className="font-semibold">cuidado a domicilio</span> y servicios de <span className="font-semibold text-[#2B547E]">salud mental</span> de confianza.
            </p>

            {/* SearchBar - Full Width */}
            <div className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-100 mb-8">
              <SearchBar />
            </div>
          </div>
        </div>
      </section>

      {/* Banner de llamado de atencion */}
      <section className="bg-[#2B547E]" data-testid="cta-banner">
        <div className="flex flex-col md:flex-row items-stretch">
          <div className="md:w-4/12 relative min-h-[300px] md:min-h-0">
            <img
              src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800"
              alt="Adulto mayor feliz"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </div>
          <div className="md:w-8/12 flex items-center px-8 py-12 md:py-14 md:px-12">
              <div className="text-white w-full">
                <h2 className="font-montserrat text-4xl font-bold uppercase tracking-wide mb-2 text-center">
                  El cuidado que merecen nuestros mayores
                </h2>
                <p className="text-base md:text-lg opacity-90 leading-relaxed mb-8 text-center">
                  En SeniorAdvisor, te ayudamos a encontrar la mejor opción de cuidado. Porque ellos lo merecen:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full border-2 border-white bg-white flex items-center justify-center mb-3">
                      <HomeIcon className="w-9 h-9 text-[#2B547E]" />
                    </div>
                    <p className="font-bold text-2xl uppercase tracking-widest mb-1.5">Confort</p>
                    <p className="opacity-85 text-sm leading-relaxed">Espacios diseñados para su bienestar, con todas las comodidades y atención personalizada que necesitan.</p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full border-2 border-white bg-white flex items-center justify-center mb-3">
                      <Heart className="w-9 h-9 text-[#2B547E]" />
                    </div>
                    <p className="font-bold text-2xl uppercase tracking-widest mb-1.5">Cariño</p>
                    <p className="opacity-85 text-sm leading-relaxed">Profesionales dedicados que brindan atención con amor y respeto, como parte de la familia.</p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full border-2 border-white bg-white flex items-center justify-center mb-3">
                      <Brain className="w-9 h-9 text-[#2B547E]" />
                    </div>
                    <p className="font-bold text-2xl uppercase tracking-widest mb-1.5">Bienestar</p>
                    <p className="opacity-85 text-sm leading-relaxed">Atención integral que incluye salud física, mental y emocional para una vida plena.</p>
                  </div>
                </div>
                <div className="text-center">
                  <Link to="/search">
                    <Button className="bg-white text-[#2B547E] hover:bg-gray-100 px-8 py-4 text-base font-bold rounded-xl">
                      Buscar Servicios Ahora
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
            <h2 className="font-montserrat text-4xl font-bold text-gray-900 uppercase tracking-wide mb-4">Nuestros Servicios</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { id: 'residencias', title: 'Residencias', desc: 'Hogares especializados con atención 24/7, actividades recreativas y cuidado médico profesional', icon: (
                <svg className="w-16 h-16 text-[#2B547E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 22V12h6v10" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )},
              { id: 'cuidado-domicilio', title: 'Cuidado a Domicilio', desc: 'Cuidadores profesionales que van a tu hogar para brindar atención personalizada', icon: (
                <svg className="w-16 h-16 text-[#2B547E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )},
              { id: 'salud-mental', title: 'Salud Mental', desc: 'Psicólogos, psiquiatras y terapeutas especializados en adultos mayores', icon: (
                <svg className="w-16 h-16 text-[#2B547E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2a8 8 0 0 1 8 8c0 5.33-8 12-8 12S4 15.33 4 10a8 8 0 0 1 8-8z" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="10" r="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            ].map((service, index) => (
              <div key={index} className="text-center group cursor-pointer" onClick={() => navigate(`/search?service=${service.id}`)}>
                <div className="flex justify-center mb-6">
                  <div className="w-32 h-32 rounded-full border-4 border-[#2B547E] flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 bg-blue-50">
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
            {/* Image */}
            <div className="flex justify-center">
              <div className="relative mx-auto" style={{ maxWidth: '500px' }}>
                <img
                  src="https://images.unsplash.com/photo-1447069387593-a5de0862481e?w=800"
                  alt="Familia feliz con adulto mayor"
                  className="w-full h-auto rounded-2xl shadow-lg"
                />
              </div>
            </div>
            {/* Text Content */}
            <div className="space-y-6">
              <h2 className="font-montserrat text-4xl font-bold text-gray-900 uppercase tracking-wide">Sobre Nosotros</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed text-lg">
                <p><span className="font-bold text-[#2B547E]">SeniorAdvisor</span> es una <span className="font-semibold">plataforma innovadora</span> diseñada para ayudar a las familias a encontrar el mejor <span className="font-semibold text-[#2B547E]">cuidado para adultos mayores</span>.</p>
                <p>Conectamos a familias con <span className="font-semibold">residencias de calidad</span>, <span className="font-semibold text-[#2B547E]">cuidadores a domicilio</span> y profesionales de <span className="font-semibold">salud mental</span> verificados y confiables.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA for Providers */}
      <section className="py-20 bg-gradient-to-r from-[#2B547E] to-[#1E3A5F]">
        <div className="max-w-7xl mx-auto px-4 text-center text-white">
          <h2 className="font-montserrat text-4xl font-bold mb-4">¿Ofreces servicios para adultos mayores?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">Únete a SeniorAdvisor y conecta con miles de familias que buscan servicios de calidad como el tuyo.</p>
          <Link to="/provider/register">
            <Button className="bg-white text-[#2B547E] hover:bg-gray-100 px-12 py-6 text-lg font-bold rounded-xl">
              Registrar mi Servicio Gratis
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#2B547E] py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-white text-sm opacity-80">
          SeniorAdvisor - Todos los derechos reservados
        </div>
      </footer>
    </div>
  );
};

export default Home;
