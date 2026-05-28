import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play } from 'lucide-react';
import api from '@/lib/api';

const extractYouTubeId = (url) => {
  if (!url) return '';
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([^?&\s]+)/);
  return match ? match[1] : '';
};

const ArticleCard = ({ article }) => {
  const ytId = extractYouTubeId(article.youtube_url);
  const thumb = article.image || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '');

  return (
    <Link
      to={`/blog/${article.slug}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
      data-testid={`editorial-card-${article.slug}`}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
        {thumb ? (
          <img src={thumb} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-5xl font-bold text-gray-300">{article.title?.[0]}</span>
          </div>
        )}
        {ytId && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 bg-black/70 rounded-full flex items-center justify-center group-hover:bg-red-600 transition-colors">
              <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
            </div>
          </div>
        )}
      </div>
      <div className="p-6">
        <h3 className="font-bold text-[#33404f] text-lg leading-tight group-hover:text-[#00e7ff] transition-colors line-clamp-2">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-sm text-gray-500 mt-3 line-clamp-3 leading-relaxed">{article.excerpt}</p>
        )}
        <span className="inline-block mt-4 text-sm font-bold text-[#00e7ff] group-hover:translate-x-1 transition-transform">
          Leer más →
        </span>
      </div>
    </Link>
  );
};

const Editorial = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/blog/articles').then(res => {
      const editorials = (res.data || []).filter(a => a.category === 'Editorial');
      setArticles(editorials);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-white" data-testid="editorial-page">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10">
          <Link to="/" className="inline-flex items-center gap-2 text-[#33404f] hover:text-[#00e7ff] mb-6 font-medium text-sm">
            <ArrowLeft className="w-4 h-4" /> Volver al Inicio
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-[#33404f] mb-3" data-testid="editorial-title">Editorial</h1>
          <p className="text-gray-500 text-lg max-w-2xl">
            Conoce los lineamientos que guían a SeniorAdvisor, donde abordamos problemáticas actuales de las personas mayores.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-20 text-gray-400">Cargando artículos...</div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No hay artículos editoriales publicados</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map(a => <ArticleCard key={a.article_id} article={a} />)}
          </div>
        )}
      </div>

      <div className="h-16" />
    </div>
  );
};

export default Editorial;
