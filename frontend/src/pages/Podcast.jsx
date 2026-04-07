import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play } from 'lucide-react';
import api from '@/lib/api';

const extractYouTubeId = (url) => {
  if (!url) return '';
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([^?&\s]+)/);
  return match ? match[1] : '';
};

const PodcastCategory = ({ category, episodes }) => {
  const [activeId, setActiveId] = useState(null);
  const latest = episodes[0];
  const rest = episodes.slice(1);
  const active = activeId ? episodes.find(e => e.episode_id === activeId) || latest : latest;
  const activeYtId = extractYouTubeId(active?.youtube_url);

  if (!latest) return null;

  return (
    <section className="mb-14" data-testid={`podcast-section-${category.category_id}`}>
      <div className="flex items-center gap-4 mb-1">
        {category.logo && <img src={category.logo} alt={category.name} className="w-12 h-12 rounded-lg object-cover" />}
        <h2 className="text-2xl font-bold text-[#33404f]">{category.name}</h2>
      </div>
      {category.description && <p className="text-sm text-gray-400 mb-5">{category.description}</p>}

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Main video */}
        <div className="flex-1">
          <div className="relative w-full rounded-xl overflow-hidden bg-black aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${activeYtId}?autoplay=0`}
              title={active.title}
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <h3 className="font-bold text-[#33404f] mt-3 text-lg">{active.title}</h3>
          {active.description && <p className="text-sm text-gray-500 mt-1">{active.description}</p>}
        </div>

        {/* Episode list */}
        {rest.length > 0 && (
          <div className="lg:w-[340px] flex-shrink-0 space-y-3 max-h-[480px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
            {rest.map(ep => {
              const ytId = extractYouTubeId(ep.youtube_url);
              return (
                <button
                  key={ep.episode_id}
                  onClick={() => setActiveId(ep.episode_id)}
                  className={`w-full flex gap-3 p-2 rounded-lg text-left transition-colors ${activeId === ep.episode_id ? 'bg-[#00e7ff]/10' : 'hover:bg-gray-50'}`}
                  data-testid={`ep-${ep.episode_id}`}
                >
                  <div className="relative w-[140px] h-[80px] rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                    <img src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-7 h-7 bg-black/60 rounded-full flex items-center justify-center">
                        <Play className="w-3 h-3 text-white ml-0.5" fill="white" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-[#33404f] line-clamp-2 leading-tight">{ep.title}</h4>
                    {ep.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{ep.description}</p>}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

const Podcast = () => {
  const [categories, setCategories] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/podcast/categories').catch(() => ({ data: [] })),
      api.get('/podcast/episodes').catch(() => ({ data: [] })),
    ]).then(([catRes, epRes]) => {
      setCategories(catRes.data);
      setEpisodes(epRes.data);
    }).finally(() => setLoading(false));
  }, []);

  const episodesByCategory = {};
  categories.forEach(c => { episodesByCategory[c.category_id] = []; });
  episodes.forEach(ep => {
    if (ep.category && episodesByCategory[ep.category]) {
      episodesByCategory[ep.category].push(ep);
    }
  });

  return (
    <div className="min-h-screen bg-white" data-testid="podcast-page">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 text-sm">
            <ArrowLeft className="w-4 h-4" /> Volver al Inicio
          </Link>
          <div className="flex items-center gap-4">
            <img src="/logo-senior-podcast.svg" alt="SeniorPodcast" className="h-14" />
          </div>
          <p className="text-gray-400 mt-3 max-w-xl">Escucha conversaciones sobre bienestar, actualidad y recomendaciones para adultos mayores.</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="text-center py-20 text-gray-400">Cargando podcast...</div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20 text-gray-400">Pronto habran episodios disponibles.</div>
        ) : (
          categories.map(c => (
            <PodcastCategory
              key={c.category_id}
              category={c}
              episodes={episodesByCategory[c.category_id] || []}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Podcast;
