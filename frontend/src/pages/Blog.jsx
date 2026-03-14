import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '@/lib/api';

const Blog = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/blog/articles').then(res => {
      setArticles(res.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-[#33404f] hover:text-[#00e7ff] mb-8 font-medium">
          <ArrowLeft className="w-4 h-4" /> Volver al Inicio
        </Link>

        <div className="mb-10">
          <h1 className="text-4xl font-bold text-[#33404f] mb-2">Actualidad Mayor</h1>
          <p className="text-gray-500">Noticias, beneficios y recomendaciones para inspirarte</p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400">Cargando artículos...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link
                key={article.slug}
                to={`/blog/${article.slug}`}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                data-testid={`blog-card-${article.slug}`}
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-5">
                  <h2 className="font-bold text-[#33404f] text-lg mb-2 group-hover:text-[#00e7ff] transition-colors">{article.title}</h2>
                  <p className="text-sm text-gray-500 line-clamp-2">{article.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
