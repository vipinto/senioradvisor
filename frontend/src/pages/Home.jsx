import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home as HomeIcon, Heart, Brain, Star, MapPin, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import useEmblaCarousel from 'embla-carousel-react';
import api from '@/lib/api';

const Home = () => {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    api.get('/providers?limit=10').then(res => {
      const sorted = res.data.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      setFeatured(sorted);
    }).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-[#00e7ff]/60 pt-16 pb-12 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto" data-testid="hero-section">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#33404f] leading-tight mb-6">
              Encuentra el mejor
              <span className="block text-[#33404f]">cuidado</span>
              para adultos mayores
            </h1>
            <p className="text-sm text-gray-500 max-w-2xl mx-auto mb-10">
              Conectamos familias con <span className="font-bold text-[#33404f]">residencias</span>, <span className="font-bold">cuidado a domicilio</span> y servicios de <span className="font-bold text-[#33404f]">salud mental</span> de confianza.
            </p>
          </div>

          {/* SearchBar - ancho completo */}
          <div className="mb-8">
            <SearchBar />
          </div>
        </div>
      </section>

      {/* Nuestros Servicios */}
      <section className="py-16 bg-white" data-testid="services-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#33404f] mb-2">Nuestros Servicios</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { id: 'residencias', title: 'Residencias', desc: 'Hogares especializados con atención 24/7, actividades recreativas y cuidado médico profesional', Icon: HomeIcon },
              { id: 'cuidado-domicilio', title: 'Cuidado a Domicilio', desc: 'Cuidadores profesionales que van a tu hogar para brindar atención personalizada', Icon: Heart },
              { id: 'salud-mental', title: 'Salud Mental', desc: 'Psicólogos, psiquiatras y terapeutas especializados en adultos mayores', Icon: Brain },
            ].map((service) => (
              <div
                key={service.id}
                onClick={() => navigate(`/search?service=${service.id}`)}
                className="group cursor-pointer bg-white border border-gray-200 rounded-2xl p-8 flex items-center justify-between hover:shadow-lg hover:border-[#00e7ff] transition-all min-h-[200px]"
              >
                <div className="flex-1 pr-6">
                  <h3 className="text-xl font-bold text-[#33404f] mb-2">{service.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{service.desc}</p>
                </div>
                <div className="w-20 h-20 rounded-full bg-[#00e7ff]/10 flex items-center justify-center shrink-0 group-hover:bg-[#00e7ff]/20 transition-colors">
                  <service.Icon className="w-9 h-9 text-[#00e7ff]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Residencias Destacadas */}
      {featured.length > 0 && (
        <FeaturedSlider featured={featured} />
      )}

      {/* Banner de llamado de atencion */}
      <section className="bg-[#00e7ff]" data-testid="cta-banner">
        <div className="flex flex-col md:flex-row items-stretch">
          <div className="md:w-4/12 relative min-h-[350px] md:min-h-0">
            <img
              src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800"
              alt="Adulto mayor feliz"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </div>
          <div className="md:w-8/12 flex items-center px-8 py-14 md:py-16 md:px-12">
              <div className="text-[#33404f] w-full">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
                  El cuidado que merecen nuestros mayores
                </h2>
                <p className="text-lg md:text-xl leading-relaxed mb-10 text-center">
                  En SeniorAdvisor, te ayudamos a encontrar la mejor opción de cuidado. Porque ellos lo merecen:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full border-2 border-[#33404f] bg-[#00e7ff] flex items-center justify-center mb-3">
                      <HomeIcon className="w-9 h-9 text-[#33404f]" />
                    </div>
                    <p className="font-bold text-2xlst mb-1.5">Confort</p>
                    <p className="opacity-85 text-sm leading-relaxed">Espacios diseñados para su bienestar, con todas las comodidades y atención personalizada que necesitan.</p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full border-2 border-[#33404f] bg-[#00e7ff] flex items-center justify-center mb-3">
                      <Heart className="w-9 h-9 text-[#33404f]" />
                    </div>
                    <p className="font-bold text-2xlst mb-1.5">Cariño</p>
                    <p className="opacity-85 text-sm leading-relaxed">Profesionales dedicados que brindan atención con amor y respeto, como parte de la familia.</p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full border-2 border-[#33404f] bg-[#00e7ff] flex items-center justify-center mb-3">
                      <Brain className="w-9 h-9 text-[#33404f]" />
                    </div>
                    <p className="font-bold text-2xlst mb-1.5">Bienestar</p>
                    <p className="opacity-85 text-sm leading-relaxed">Atención integral que incluye salud física, mental y emocional para una vida plena.</p>
                  </div>
                </div>
                <div className="text-center">
                  <Link to="/search">
                    <Button className="bg-[#33404f] text-white hover:bg-[#4a5568] px-8 py-4 text-base font-bold rounded-xl">
                      Buscar Servicios Ahora
                    </Button>
                  </Link>
                </div>
              </div>
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
              <h2 className="text-4xl font-bold text-[#33404f]">Sobre Nosotros</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed text-lg">
                <p><span className="font-bold text-[#00e7ff]">SeniorAdvisor</span> es una <span className="font-semibold">plataforma innovadora</span> diseñada para ayudar a las familias a encontrar el mejor <span className="font-semibold text-[#00e7ff]">cuidado para adultos mayores</span>.</p>
                <p>Conectamos a familias con <span className="font-semibold">residencias de calidad</span>, <span className="font-semibold text-[#00e7ff]">cuidadores a domicilio</span> y profesionales de <span className="font-semibold">salud mental</span> verificados y confiables.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA for Providers */}
      <section className="py-20 bg-gradient-to-r from-[#00e7ff] to-[#00c4d4]">
        <div className="max-w-7xl mx-auto px-4 text-center text-[#33404f]">
          <h2 className="text-4xl font-bold mb-4">¿Ofreces servicios para adultos mayores?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">Únete a SeniorAdvisor y conecta con miles de familias que buscan servicios de calidad como el tuyo.</p>
          <Link to="/provider/register">
            <Button className="bg-[#33404f] text-white hover:bg-[#4a5568] px-12 py-6 text-lg font-bold rounded-xl">
              Registrar mi Servicio Gratis
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#33404f] py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-white text-sm opacity-80">
          SeniorAdvisor - Todos los derechos reservados
        </div>
      </footer>
    </div>
  );
};

const FeaturedSlider = ({ featured }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: true, 
    align: 'start',
    slidesToScroll: 1,
    containScroll: 'trimSnaps'
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  const FeaturedCard = ({ p }) => (
    <Link
      to={`/provider/${p.provider_id}`}
      className="group block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
      data-testid={`featured-${p.provider_id}`}
    >
      <div className="h-44 bg-gray-200 overflow-hidden">
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
  );

  return (
    <section className="py-16 bg-white" data-testid="featured-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-[#33404f] mb-1">Residencias Destacadas</h2>
            <p className="text-gray-500 text-sm">Los servicios mejor evaluados por las familias</p>
          </div>
          {!showAll && (
            <div className="flex gap-2">
              <button
                onClick={() => emblaApi?.scrollPrev()}
                disabled={!canScrollPrev}
                className="w-10 h-10 rounded-full bg-[#33404f] text-white flex items-center justify-center hover:bg-[#4a5568] disabled:opacity-30 transition-all"
                data-testid="slider-prev"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => emblaApi?.scrollNext()}
                disabled={!canScrollNext}
                className="w-10 h-10 rounded-full bg-[#33404f] text-white flex items-center justify-center hover:bg-[#4a5568] disabled:opacity-30 transition-all"
                data-testid="slider-next"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {showAll ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((p) => (
              <FeaturedCard key={p.provider_id} p={p} />
            ))}
          </div>
        ) : (
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6">
              {featured.map((p) => (
                <div key={p.provider_id} className="flex-[0_0_280px]">
                  <FeaturedCard p={p} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-center mt-10">
          <Button 
            onClick={() => setShowAll(!showAll)}
            className="bg-[#33404f] text-white hover:bg-[#4a5568] px-8 py-4 text-base font-bold rounded-xl"
            data-testid="toggle-all-featured"
          >
            {showAll ? 'Ver Menos' : 'Ver Todas las Destacadas'} 
            <ArrowRight className={`w-5 h-5 ml-2 transition-transform ${showAll ? 'rotate-90' : ''}`} />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Home;
