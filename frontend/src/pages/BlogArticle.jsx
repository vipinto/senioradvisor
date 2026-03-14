import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const ARTICLES = {
  'residencias-chile-vs-espana': {
    title: 'Residencias: Chile versus España',
    image: 'https://images.unsplash.com/photo-1773227060422-ee506b865417?w=1200',
    content: `Chile y España tienen modelos muy diferentes en lo que respecta al cuidado de adultos mayores en residencias. Mientras que en España existe una regulación más estricta y una mayor oferta de residencias públicas, en Chile el sector privado lidera la industria.\n\nEn España, las residencias están reguladas por las comunidades autónomas, con estándares mínimos de personal, espacio e infraestructura. En Chile, la regulación ha avanzado significativamente en los últimos años con la nueva normativa del SENAMA.\n\nAmbos países enfrentan el desafío del envejecimiento poblacional, pero las soluciones y enfoques varían considerablemente. Lo que sí comparten es la importancia de mantener la dignidad y calidad de vida de los residentes.`,
  },
  'app-mayor-celular': {
    title: 'App Mayor: Tu celular más fácil',
    image: 'https://images.unsplash.com/photo-1758612897617-88c9c45ed47a?w=1200',
    content: `La tecnología no tiene por qué ser complicada. Cada vez más aplicaciones están diseñadas pensando en los adultos mayores, con interfaces más grandes, simples e intuitivas.\n\nAplicaciones como "Simple Senior Phone" transforman el celular en un dispositivo fácil de usar con botones grandes, acceso directo a contactos favoritos y funciones de emergencia.\n\nOtras apps útiles incluyen recordatorios de medicamentos, aplicaciones de videollamadas simplificadas y juegos cognitivos que ayudan a mantener la mente activa. La clave está en configurar el dispositivo correctamente y practicar su uso regularmente.`,
  },
  'soledad-adulto-mayor': {
    title: 'Actualidad Adulto Mayor: Soledad no deseada',
    image: 'https://images.unsplash.com/photo-1773227054096-2857c73ef2da?w=1200',
    content: `La soledad no deseada afecta a un gran porcentaje de adultos mayores y tiene consecuencias directas en su salud física y mental. Estudios recientes demuestran que la soledad puede ser tan dañina como fumar 15 cigarrillos al día.\n\nEn Chile, diversas organizaciones trabajan para combatir este problema a través de programas de acompañamiento, centros diurnos y actividades comunitarias.\n\nLas residencias y centros de cuidado juegan un papel fundamental al crear comunidades donde los adultos mayores pueden socializar, participar en actividades y sentirse acompañados. La tecnología también ha abierto nuevas posibilidades de conexión con familiares a distancia.`,
  },
  'subsidio-eleam': {
    title: 'Subsidio ELEAM: Apoyo a los mayores',
    image: 'https://images.unsplash.com/photo-1773227059881-ef8ecf22aac8?w=1200',
    content: `Los Establecimientos de Larga Estadía para Adultos Mayores (ELEAM) son instituciones que brindan cuidado integral a personas mayores que requieren asistencia permanente.\n\nEl Estado de Chile ofrece subsidios para que familias de menores recursos puedan acceder a estos servicios. Los requisitos principales incluyen ser mayor de 60 años, no contar con redes de apoyo suficientes y pertenecer a los tramos más vulnerables del Registro Social de Hogares.\n\nPara postular, es necesario acercarse a la municipalidad correspondiente o al SENAMA. El proceso incluye una evaluación socioeconómica y de dependencia funcional.`,
  },
  'vacaciones-tercera-edad': {
    title: 'Vacaciones tercera edad con Sernatur',
    image: 'https://images.unsplash.com/photo-1758798469179-dea5d63257ba?w=1200',
    content: `El programa "Vacaciones Tercera Edad" de Sernatur permite a personas mayores de 60 años acceder a paquetes turísticos a precios preferenciales en distintos destinos de Chile.\n\nEl programa incluye alojamiento, alimentación, traslados y actividades recreativas. Los destinos varían cada temporada e incluyen playas, termas, lagos y ciudades patrimoniales.\n\nPara participar, los adultos mayores deben inscribirse a través de la página de Sernatur o en las oficinas regionales. La selección prioriza a quienes no han viajado antes y a personas de mayor vulnerabilidad socioeconómica.`,
  },
  'envejecer-con-vitalidad': {
    title: 'Envejecer con Vitalidad',
    image: 'https://images.unsplash.com/photo-1764173040171-57f79264b358?w=1200',
    content: `Envejecer con vitalidad es posible cuando se adoptan hábitos saludables de forma constante. El ejercicio regular, aunque sea moderado como caminar 30 minutos al día, tiene beneficios enormes para la salud cardiovascular, ósea y mental.\n\nLa alimentación también juega un papel crucial. Una dieta rica en frutas, verduras, proteínas magras y omega-3 ayuda a mantener la energía y prevenir enfermedades crónicas.\n\nNo menos importante es la salud emocional. Mantener relaciones sociales activas, practicar hobbies y participar en actividades comunitarias contribuyen a una vejez plena y significativa. Los talleres cognitivos y las actividades físicas grupales son excelentes opciones.`,
  },
};

const BlogArticle = () => {
  const { slug } = useParams();
  const article = ARTICLES[slug];

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#33404f] mb-4">Artículo no encontrado</h1>
          <Link to="/blog" className="text-[#00e7ff] font-bold hover:underline">Volver al Blog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link to="/blog" className="inline-flex items-center gap-2 text-[#33404f] hover:text-[#00e7ff] mb-8 font-medium">
          <ArrowLeft className="w-4 h-4" /> Volver a Actualidad Mayor
        </Link>

        <div className="aspect-video rounded-2xl overflow-hidden mb-8">
          <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
        </div>

        <h1 className="text-3xl font-bold text-[#33404f] mb-6">{article.title}</h1>

        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
          {article.content.split('\n\n').map((p, i) => (
            <p key={i} className="mb-4">{p}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogArticle;
