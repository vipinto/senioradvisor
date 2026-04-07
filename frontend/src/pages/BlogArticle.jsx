import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '@/lib/api';

const extractYouTubeId = (url) => {
  if (!url) return '';
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/))([^?&\s]+)/);
  return match ? match[1] : '';
};

const BlogArticle = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/blog/articles/${slug}`).then(res => {
      setArticle(res.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Cargando...</div>;
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#33404f] mb-4">Articulo no encontrado</h1>
          <Link to="/blog" className="text-[#00e7ff] font-bold hover:underline">Volver al Blog</Link>
        </div>
      </div>
    );
  }

  const ytId = extractYouTubeId(article.youtube_url);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link to="/blog" className="inline-flex items-center gap-2 text-[#33404f] hover:text-[#00e7ff] mb-8 font-medium">
          <ArrowLeft className="w-4 h-4" /> Volver a Actualidad Senior
        </Link>

        {article.category && (
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-[#00e7ff] bg-[#00e7ff]/10 px-3 py-1 rounded-full mb-4" data-testid="article-category">
            {article.category}
          </span>
        )}

        {article.image && (
          <div className="aspect-video rounded-2xl overflow-hidden mb-6">
            <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
          </div>
        )}

        {ytId && (
          <div className="relative w-full rounded-2xl overflow-hidden shadow-lg mb-6" data-testid="article-youtube">
            <div className="relative w-full aspect-[16/9]">
              <iframe
                src={`https://www.youtube.com/embed/${ytId}`}
                title={article.title}
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        <h1 className="text-3xl font-bold text-[#33404f] mb-6" data-testid="article-title">{article.title}</h1>

        <div className="text-gray-700 leading-relaxed">
          {article.content.split('\n\n').map((p, i) => (
            <p key={i} className="mb-4">{p}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogArticle;
