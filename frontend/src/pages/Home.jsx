import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home as HomeIcon, Heart, Brain, Star, MapPin, ArrowRight, ChevronLeft, ChevronRight, MessageSquareText, Users } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import useEmblaCarousel from 'embla-carousel-react';
import api from '@/lib/api';

const Home = () => {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [blogArticles, setBlogArticles] = useState([]);

  useEffect(() => {
    api.get('/providers?featured=true').then(res => {
      const sorted = res.data.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      setFeatured(sorted);
    }).catch(() => {});
    api.get('/blog/articles?limit=6').then(res => {
      setBlogArticles(res.data);
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
      <section className="py-12 bg-white" data-testid="services-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { id: 'residencias', title: 'Residencias', Icon: HomeIcon },
              { id: 'cuidado-domicilio', title: 'Cuidado a Domicilio', Icon: Heart },
              { id: 'salud-mental', title: 'Salud Mental', Icon: Brain },
            ].map((service) => (
              <div
                key={service.id}
                onClick={() => navigate(`/search?service=${service.id}`)}
                className="group cursor-pointer bg-white border border-gray-200 rounded-xl px-5 py-3 flex items-center gap-4 hover:shadow-lg hover:border-[#00e7ff] transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-[#00e7ff] flex items-center justify-center shrink-0">
                  <service.Icon className="w-5 h-5 text-[#33404f]" />
                </div>
                <h3 className="text-base font-bold text-[#33404f] flex-1">{service.title}</h3>
                <ChevronRight className="w-5 h-5 text-gray-400 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Residencias Destacadas */}
      {featured.length > 0 && (
        <FeaturedSlider featured={featured} />
      )}

      {/* Como usar SeniorAdvisor */}
      <section className="py-20 bg-white" data-testid="how-to-use-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Steps */}
            <div>
              <h2 className="text-4xl sm:text-5xl font-extrabold text-[#33404f] mb-14 leading-tight">
                ¿Cómo usar<br />SeniorAdvisor?
              </h2>
              <div className="space-y-10">
                <div className="flex items-start gap-5">
                  <div className="w-16 h-16 rounded-full bg-[#00e7ff] flex items-center justify-center shrink-0">
                    <MapPin className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-[#33404f] mb-1">Busca un servicio</h3>
                    <p className="text-gray-500 leading-relaxed">Explora los distintos servicios, y ayúdanos a filtrar los mejores.</p>
                  </div>
                </div>
                <div className="flex items-start gap-5">
                  <div className="w-16 h-16 rounded-full bg-[#00e7ff] flex items-center justify-center shrink-0">
                    <MessageSquareText className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-[#33404f] mb-1">Deja tu reseña</h3>
                    <p className="text-gray-500 leading-relaxed">Escribe tu experiencia y otorga una valoración con estrellas.</p>
                  </div>
                </div>
                <div className="flex items-start gap-5">
                  <div className="w-16 h-16 rounded-full bg-[#00e7ff] flex items-center justify-center shrink-0">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-[#33404f] mb-1">Ayuda a otros</h3>
                    <p className="text-gray-500 leading-relaxed">Tu opinión orienta a más personas a tomar una mejor decisión.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Phone Mockup */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                {/* Phone frame */}
                <div className="w-[280px] sm:w-[300px] rounded-[2.5rem] border-[10px] border-[#33404f] bg-[#33404f] shadow-2xl overflow-hidden">
                  {/* Status bar */}
                  <div className="bg-white px-4 py-2 flex items-center justify-between text-xs text-gray-600">
                    <span className="font-medium">12:36</span>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 border border-gray-400 rounded-sm relative"><div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gray-600 rounded-sm" /></div>
                    </div>
                  </div>
                  {/* App header */}
                  <div className="bg-white px-4 py-2 flex items-center justify-between border-b border-gray-100">
                    <span className="font-bold text-[#33404f] text-sm tracking-tight">SeniorAdvisor.</span>
                    <div className="flex flex-col gap-[3px]">
                      <div className="w-4 h-[2px] bg-[#33404f] rounded" />
                      <div className="w-4 h-[2px] bg-[#33404f] rounded" />
                      <div className="w-4 h-[2px] bg-[#33404f] rounded" />
                    </div>
                  </div>
                  {/* Map content */}
                  <div className="relative bg-[#e8e4da] h-[400px] sm:h-[440px] overflow-hidden">
                    {/* Map background using embedded iframe-like view */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#e8e4da] to-[#d4d0c6]">
                      {/* Simulated streets */}
                      <div className="absolute inset-0">
                        <div className="absolute top-[20%] left-0 right-0 h-[2px] bg-white/80" />
                        <div className="absolute top-[40%] left-0 right-0 h-[2px] bg-white/80" />
                        <div className="absolute top-[60%] left-0 right-0 h-[3px] bg-white/90" />
                        <div className="absolute top-[80%] left-0 right-0 h-[2px] bg-white/80" />
                        <div className="absolute top-0 bottom-0 left-[25%] w-[2px] bg-white/80" />
                        <div className="absolute top-0 bottom-0 left-[50%] w-[3px] bg-white/90" />
                        <div className="absolute top-0 bottom-0 left-[75%] w-[2px] bg-white/80" />
                        {/* Diagonal streets */}
                        <div className="absolute top-0 left-0 w-[140%] h-[2px] bg-white/70 origin-top-left rotate-[25deg]" />
                        <div className="absolute bottom-[10%] left-0 w-[140%] h-[2px] bg-white/70 origin-bottom-left -rotate-[15deg]" />
                      </div>
                      {/* Map pins */}
                      {[
                        { top: '15%', left: '30%' },
                        { top: '35%', left: '55%' },
                        { top: '25%', left: '70%' },
                        { top: '50%', left: '40%' },
                        { top: '65%', left: '20%' },
                        { top: '55%', left: '65%' },
                        { top: '75%', left: '50%' },
                      ].map((pos, i) => (
                        <div key={i} className="absolute" style={{ top: pos.top, left: pos.left }}>
                          <div className="w-5 h-5 bg-[#00e7ff] rounded-full border-2 border-white shadow-md" />
                        </div>
                      ))}
                    </div>
                    {/* Info card overlay */}
                    <div className="absolute top-4 right-3 bg-white rounded-xl shadow-lg p-3 w-[140px]">
                      <div className="w-full h-14 bg-gray-200 rounded-lg mb-2 overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=200" alt="" className="w-full h-full object-cover" />
                      </div>
                      <p className="text-[10px] font-bold text-[#33404f] leading-tight">Casa Senior - Decombe</p>
                      <p className="text-[8px] text-gray-400 mt-0.5">Residencia de Adultos Mayores</p>
                    </div>
                    {/* Bottom search bar */}
                    <div className="absolute bottom-0 left-0 right-0 bg-[#33404f] px-4 py-3">
                      <div className="flex items-center justify-between">
                        <span className="text-white text-xs font-medium">Buscar Residencia</span>
                        <ChevronRight className="w-4 h-4 text-white/60" />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Decorative cyan shape behind phone */}
                <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-[#00e7ff]/20 rounded-full -z-10 blur-xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Video */}
            <div className="flex justify-center">
              <div className="relative w-full" style={{ maxWidth: '500px' }}>
                <div className="aspect-video rounded-2xl shadow-lg overflow-hidden">
                  <iframe
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                    title="SeniorAdvisor"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
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

      {/* Actualidad Mayor - Blog */}
      {blogArticles.length > 0 && (
        <section className="py-16 bg-white" data-testid="blog-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-[#33404f] mb-2">Actualidad Mayor</h2>
              <p className="text-gray-500 text-sm">Noticias, beneficios y recomendaciones para inspirarte</p>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {blogArticles.slice(0, 6).map((article) => (
                <Link
                  key={article.slug}
                  to={`/blog/${article.slug}`}
                  className="group relative aspect-[4/3] rounded-2xl overflow-hidden"
                  data-testid={`blog-${article.slug}`}
                >
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-white font-bold text-lg leading-tight">{article.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to="/blog">
                <Button className="bg-[#33404f] text-white hover:bg-[#4a5568] px-8 py-4 text-base font-bold rounded-xl">
                  Ver Toda la Actualidad <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

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
