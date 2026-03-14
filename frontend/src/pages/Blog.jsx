import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const ARTICLES = [
  { slug: 'residencias-chile-vs-espana', title: 'Residencias: Chile versus España', image: 'https://images.unsplash.com/photo-1773227060422-ee506b865417?w=800', excerpt: 'Un análisis comparativo de los modelos de residencias para adultos mayores en Chile y España, diferencias en regulación, costos y calidad de atención.' },
  { slug: 'app-mayor-celular', title: 'App Mayor: Tu celular más fácil', image: 'https://images.unsplash.com/photo-1758612897617-88c9c45ed47a?w=800', excerpt: 'Descubre las mejores aplicaciones diseñadas para adultos mayores que facilitan el uso del celular con interfaces simplificadas y accesibles.' },
  { slug: 'soledad-adulto-mayor', title: 'Actualidad Adulto Mayor: Soledad no deseada', image: 'https://images.unsplash.com/photo-1773227054096-2857c73ef2da?w=800', excerpt: 'La soledad no deseada es uno de los principales desafíos que enfrentan los adultos mayores. Conoce las iniciativas que buscan combatirla.' },
  { slug: 'subsidio-eleam', title: 'Subsidio ELEAM: Apoyo a los mayores', image: 'https://images.unsplash.com/photo-1773227059881-ef8ecf22aac8?w=800', excerpt: 'Todo lo que necesitas saber sobre el subsidio ELEAM, cómo postular y los requisitos para acceder a este beneficio del Estado para adultos mayores.' },
  { slug: 'vacaciones-tercera-edad', title: 'Vacaciones tercera edad con Sernatur', image: 'https://images.unsplash.com/photo-1758798469179-dea5d63257ba?w=800', excerpt: 'Sernatur ofrece programas de vacaciones especiales para personas mayores. Conoce los destinos disponibles y cómo inscribirte.' },
  { slug: 'envejecer-con-vitalidad', title: 'Envejecer con Vitalidad', image: 'https://images.unsplash.com/photo-1764173040171-57f79264b358?w=800', excerpt: 'Consejos prácticos de ejercicio, alimentación y bienestar emocional para vivir la tercera edad con energía y plenitud.' },
];

const Blog = () => {
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

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ARTICLES.map((article) => (
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
      </div>
    </div>
  );
};

export default Blog;
