import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home as HomeIcon, Heart, Brain, Star, MapPin, ArrowRight, ChevronLeft, ChevronRight, MessageSquareText, Users, Handshake, Play } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import useEmblaCarousel from 'embla-carousel-react';
import api from '@/lib/api';

const Home = () => {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [blogArticles, setBlogArticles] = useState([]);
  const [podcastCategories, setPodcastCategories] = useState([]);
  const [podcastEpisodes, setPodcastEpisodes] = useState([]);

  useEffect(() => {
    api.get('/providers?featured=true').then(res => {
      const data = res.data.results || res.data;
      const sorted = Array.isArray(data) ? data.sort((a, b) => (b.rating || 0) - (a.rating || 0)) : [];
      setFeatured(sorted);
    }).catch(() => {});
    api.get('/blog/articles?limit=6').then(res => {
      setBlogArticles(res.data);
    }).catch(() => {});
    api.get('/podcast/categories').then(res => setPodcastCategories(res.data)).catch(() => {});
    api.get('/podcast/episodes').then(res => setPodcastEpisodes(res.data)).catch(() => {});
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

      {/* SeniorClub - Banner CTA */}
      <section className="py-12 bg-white" data-testid="senior-club-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/seniorclub" className="block">
            <div className="bg-[#33404f] rounded-2xl hover:bg-[#3a4a5c] transition-colors cursor-pointer group overflow-hidden">
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 px-8 py-8 md:py-6">
                <div className="shrink-0">
                  <img
                    src="https://customer-assets.emergentagent.com/job_316c0f31-5a86-43b3-bcc3-d5c9be92d49a/artifacts/y9u1s2ae_seniorclub.svg"
                    alt="SeniorClub"
                    className="h-16 md:h-20"
                    style={{ filter: 'brightness(0) invert(1)' }}
                  />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-white text-xl md:text-2xl font-bold mb-1">Convenios exclusivos para el bienestar de nuestros mayores</h3>
                  <p className="text-gray-300 text-sm">Accede a descuentos y servicios preferenciales con nuestros aliados</p>
                </div>
                <div className="shrink-0">
                  <div className="bg-[#00e7ff] hover:bg-[#00d4e8] text-[#33404f] font-bold px-6 py-3 rounded-xl text-sm group-hover:scale-105 transition-transform flex items-center gap-2">
                    Ver Convenios <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Residencias Destacadas */}
      {featured.length > 0 && (
        <FeaturedSlider featured={featured} />
      )}

      {/* Como usar SeniorAdvisor */}
      <section className="bg-white" data-testid="cta-banner">
        <div className="flex flex-col md:flex-row items-stretch">
          <div className="md:w-4/12 relative min-h-[350px] md:min-h-0">
            <img
              src="https://SeniorAdvisor.cl/como-usar-senior.jpeg"
              alt="Cómo usar SeniorAdvisor"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </div>
          <div className="md:w-8/12 flex items-center px-8 py-14 md:py-16 md:px-12">
              <div className="text-[#33404f] w-full">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
                  ¿Cómo usar SeniorAdvisor?
                </h2>
                <p className="text-lg md:text-xl leading-relaxed mb-10 text-center">
                  Encuentra, evalúa y comparte tu experiencia en simples pasos:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full border-2 border-[#33404f] bg-white flex items-center justify-center mb-3">
                      <MapPin className="w-9 h-9 text-[#33404f]" />
                    </div>
                    <p className="font-bold text-2xl md:text-3xl mb-2">Busca un servicio</p>
                    <p className="opacity-85 text-base md:text-lg leading-relaxed">Explora los distintos servicios, y ayúdanos a filtrar los mejores.</p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full border-2 border-[#33404f] bg-white flex items-center justify-center mb-3">
                      <MessageSquareText className="w-9 h-9 text-[#33404f]" />
                    </div>
                    <p className="font-bold text-2xl md:text-3xl mb-2">Deja tu reseña</p>
                    <p className="opacity-85 text-base md:text-lg leading-relaxed">Escribe tu experiencia y otorga una valoración con estrellas.</p>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full border-2 border-[#33404f] bg-white flex items-center justify-center mb-3">
                      <Users className="w-9 h-9 text-[#33404f]" />
                    </div>
                    <p className="font-bold text-2xl md:text-3xl mb-2">Ayuda a otros</p>
                    <p className="opacity-85 text-base md:text-lg leading-relaxed">Tu opinión orienta a más personas a tomar una mejor decisión.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
      </section>

      {/* SeniorPodcast Banner + Preview */}
      {podcastCategories.length > 0 && podcastEpisodes.length > 0 && (
        <section className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] py-14" data-testid="podcast-home-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Banner */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-10">
              <div className="flex items-center gap-5 mb-4 md:mb-0">
                <img src="/logo-senior-podcast.svg" alt="SeniorPodcast" className="h-12" />
                <div>
                  <p className="text-white/70 text-sm">Escucha conversaciones sobre bienestar y actualidad para adultos mayores.</p>
                </div>
              </div>
              <Link to="/podcast" className="px-6 py-3 bg-[#00e7ff] text-[#1a1a2e] font-bold rounded-xl hover:bg-[#00d4ea] transition-colors text-sm">
                Ver Podcast <ArrowRight className="inline w-4 h-4 ml-1" />
              </Link>
            </div>

            {/* Podcast categories preview */}
            {podcastCategories.map(cat => {
              const catEps = podcastEpisodes.filter(e => e.category === cat.category_id);
              if (catEps.length === 0) return null;
              const latest = catEps[0];
              const rest = catEps.slice(1, 4);
              const latestYtId = latest.youtube_url?.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([^?&\s]+)/)?.[1] || '';
              return (
                <div key={cat.category_id} className="mb-10 last:mb-0">
                  <h3 className="text-lg font-bold text-white mb-1">{cat.name}</h3>
                  {cat.description && <p className="text-white/40 text-xs mb-4">{cat.description}</p>}
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Main */}
                    <div className="flex-1">
                      <div className="relative w-full rounded-xl overflow-hidden bg-black aspect-video">
                        <iframe src={`https://www.youtube.com/embed/${latestYtId}`} title={latest.title} className="absolute inset-0 w-full h-full" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                      </div>
                      <h4 className="font-bold text-white mt-3">{latest.title}</h4>
                      {latest.description && <p className="text-white/50 text-sm mt-1">{latest.description}</p>}
                    </div>
                    {/* Side list */}
                    {rest.length > 0 && (
                      <div className="lg:w-[300px] flex-shrink-0 space-y-3">
                        {rest.map(ep => {
                          const ytId = ep.youtube_url?.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([^?&\s]+)/)?.[1] || '';
                          return (
                            <Link to="/podcast" key={ep.episode_id} className="flex gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                              <div className="relative w-[120px] h-[68px] rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
                                <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt="" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-6 h-6 bg-black/60 rounded-full flex items-center justify-center"><Play className="w-3 h-3 text-white ml-0.5" fill="white" /></div>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="text-sm font-bold text-white line-clamp-2 leading-tight">{ep.title}</h5>
                                {ep.description && <p className="text-xs text-white/40 mt-1 line-clamp-1">{ep.description}</p>}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* About Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Video */}
            <div className="flex justify-center">
              <div className="relative w-full" style={{ maxWidth: '500px' }}>
                <div className="aspect-video rounded-2xl shadow-lg overflow-hidden">
                  <iframe
                    src="https://www.youtube.com/embed/2kU-gj4jHtc?si=fvILhF75aJ-EARqc"
                    title="SeniorAdvisor"
                    className="w-full h-full"
                    loading="lazy"
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
                <p>Conectamos a familias con <span className="font-semibold">residencias de calidad</span>, <span className="font-semibold text-[#00e7ff]">cuidado a domicilio</span> y profesionales de <span className="font-semibold">salud mental</span> verificados y confiables.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Actualidad Senior - Blog */}
      {blogArticles.length > 0 && (
        <section className="py-16 bg-white" data-testid="blog-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <h2 className="text-4xl font-bold text-[#33404f] mb-2">Actualidad Senior</h2>
              <p className="text-gray-500 text-lg">Noticias, beneficios y recomendaciones para inspirarte</p>
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
    <section className="py-16 bg-[#00e7ff]" data-testid="featured-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-4xl font-bold text-[#33404f] mb-1">Residencias Destacadas</h2>
            <p className="text-gray-500 text-lg">Los servicios mejor evaluados por las familias</p>
          </div>
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
        </div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {featured.map((p) => (
              <div key={p.provider_id} className="flex-[0_0_280px]">
                <FeaturedCard p={p} />
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-10">
          <Link to="/destacados">
            <Button 
              className="bg-[#33404f] text-white hover:bg-[#4a5568] px-8 py-4 text-base font-bold rounded-xl"
              data-testid="toggle-all-featured"
            >
              Ver Todas las Destacadas
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Home;
