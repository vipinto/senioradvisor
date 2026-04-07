import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, Play } from 'lucide-react';
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
      className="group flex-shrink-0 w-[280px] bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100"
      data-testid={`blog-card-${article.slug}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {thumb ? (
          <img src={thumb} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#00e7ff]/20 to-gray-100">
            <span className="text-4xl font-bold text-[#00e7ff]/40">{article.title?.[0]}</span>
          </div>
        )}
        {ytId && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-black/70 rounded-full flex items-center justify-center group-hover:bg-red-600 transition-colors">
              <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
            </div>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-[#33404f] text-sm leading-tight group-hover:text-[#00e7ff] transition-colors line-clamp-2 uppercase">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-xs text-gray-400 mt-2 line-clamp-2">{article.excerpt}</p>
        )}
      </div>
    </Link>
  );
};

const CategorySection = ({ name, articles, id }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) el.addEventListener('scroll', checkScroll);
    return () => el?.removeEventListener('scroll', checkScroll);
  }, [articles]);

  const scroll = (dir) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 600, behavior: 'smooth' });
  };

  if (!articles.length) return null;

  return (
    <section id={id} className="py-10" data-testid={`blog-section-${id}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#33404f]">{name}</h2>
        <span className="text-sm text-gray-400">{articles.length} articulo{articles.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="relative group/carousel">
        {canScrollLeft && (
          <button
            onClick={() => scroll(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors -ml-3"
            data-testid={`scroll-left-${id}`}
          >
            <ChevronLeft className="w-5 h-5 text-[#33404f]" />
          </button>
        )}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {articles.map(a => <ArticleCard key={a.article_id} article={a} />)}
        </div>
        {canScrollRight && (
          <button
            onClick={() => scroll(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors -mr-3"
            data-testid={`scroll-right-${id}`}
          >
            <ChevronRight className="w-5 h-5 text-[#33404f]" />
          </button>
        )}
      </div>
    </section>
  );
};

const Blog = () => {
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/blog/articles').catch(() => ({ data: [] })),
      api.get('/blog/categories').catch(() => ({ data: [] })),
    ]).then(([artRes, catRes]) => {
      setArticles(artRes.data);
      setCategories(catRes.data);
      if (catRes.data.length > 0) setActiveSection(catRes.data[0].name);
    }).finally(() => setLoading(false));
  }, []);

  const scrollToSection = (name) => {
    setActiveSection(name);
    const id = `cat-${name.toLowerCase().replace(/\s+/g, '-')}`;
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const catId = (name) => `cat-${name.toLowerCase().replace(/\s+/g, '-')}`;

  // Group articles by category
  const articlesByCategory = {};
  categories.forEach(c => { articlesByCategory[c.name] = []; });
  const uncategorized = [];
  articles.forEach(a => {
    if (a.category && articlesByCategory[a.category]) {
      articlesByCategory[a.category].push(a);
    } else {
      uncategorized.push(a);
    }
  });

  return (
    <div className="min-h-screen bg-white" data-testid="blog-page">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-50 to-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
          <Link to="/" className="inline-flex items-center gap-2 text-[#33404f] hover:text-[#00e7ff] mb-6 font-medium text-sm">
            <ArrowLeft className="w-4 h-4" /> Volver al Inicio
          </Link>
          <h1 className="text-4xl font-bold text-[#33404f] mb-1" data-testid="blog-title">Actualidad Senior</h1>
          <p className="text-gray-500">Noticias, beneficios y recomendaciones para adultos mayores</p>
        </div>
      </div>

      {/* Jump to section menu */}
      {categories.length > 0 && (
        <div className="sticky top-0 z-30 bg-white border-b shadow-sm" data-testid="blog-category-nav">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-1 overflow-x-auto py-3" style={{ scrollbarWidth: 'none' }}>
              <span className="text-xs text-gray-400 font-medium uppercase tracking-wider mr-3 flex-shrink-0">Ir a seccion:</span>
              {categories.map(c => (
                <button
                  key={c.name}
                  onClick={() => scrollToSection(c.name)}
                  className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all ${
                    activeSection === c.name
                      ? 'bg-[#33404f] text-white'
                      : 'text-[#33404f] hover:bg-gray-100'
                  }`}
                  data-testid={`nav-${catId(c.name)}`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="text-center py-20 text-gray-400">Cargando articulos...</div>
        ) : articles.length === 0 ? (
          <div className="text-center py-20 text-gray-400">No hay articulos publicados</div>
        ) : (
          <>
            {categories.map(c => (
              <CategorySection
                key={c.name}
                name={c.name}
                id={catId(c.name)}
                articles={articlesByCategory[c.name] || []}
              />
            ))}
            {uncategorized.length > 0 && (
              <CategorySection
                name="Otros"
                id="cat-otros"
                articles={uncategorized}
              />
            )}
          </>
        )}
      </div>

      {/* Spacer */}
      <div className="h-16" />
    </div>
  );
};

export default Blog;
