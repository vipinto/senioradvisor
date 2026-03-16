import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    category: 'Sobre SeniorAdvisor',
    questions: [
      {
        q: '¿Qué es SeniorAdvisor?',
        a: 'SeniorAdvisor es una plataforma que conecta familias con residencias de adultos mayores, servicios de cuidado a domicilio y profesionales de salud mental verificados en Chile. Puedes buscar, comparar y contactar servicios con la tranquilidad de ver reseñas y perfiles detallados.'
      },
      {
        q: '¿Es gratis usar SeniorAdvisor?',
        a: 'Para familias: buscar y ver perfiles de residencias es completamente gratis. Para residencias y proveedores: registrarse y crear un perfil es gratuito. Existen planes premium opcionales para mayor visibilidad.'
      },
      {
        q: '¿En qué ciudades está disponible?',
        a: 'Actualmente estamos disponibles en todo Chile, con mayor concentración en la Región Metropolitana. Nuestro directorio crece constantemente con nuevas residencias y servicios en todas las regiones del país.'
      },
    ]
  },
  {
    category: 'Buscar Servicios (Familias)',
    questions: [
      {
        q: '¿Cómo encuentro una residencia para un adulto mayor?',
        a: 'Usa nuestro buscador en la página principal. Puedes filtrar por comuna, tipo de servicio (residencias, cuidado a domicilio, salud mental) y calificación. Cada perfil muestra fotos, amenidades, precios y reseñas de otras familias.'
      },
      {
        q: '¿Cómo sé si una residencia es de confianza?',
        a: 'Revisa las reseñas de otras familias, verifica si la residencia tiene el badge de verificación (significa que pasó una revisión de nuestro equipo), y consulta las amenidades y servicios que ofrece. También puedes contactar directamente a la residencia para agendar una visita.'
      },
      {
        q: '¿Puedo visitar una residencia antes de tomar una decisión?',
        a: 'Sí, te recomendamos siempre visitar la residencia en persona antes de tomar una decisión. Puedes contactar directamente a la residencia desde su perfil para coordinar una visita.'
      },
      {
        q: '¿Qué tipos de servicios puedo encontrar?',
        a: 'En SeniorAdvisor encontrarás tres categorías principales: Residencias (estadía permanente con cuidado integral), Cuidado a Domicilio (atención profesional en el hogar del adulto mayor), y Salud Mental (apoyo psicológico, terapias y acompañamiento emocional).'
      },
    ]
  },
  {
    category: 'Para Residencias y Proveedores',
    questions: [
      {
        q: '¿Cómo registro mi residencia en SeniorAdvisor?',
        a: 'Puedes registrar tu residencia de forma gratuita a través de nuestro formulario de registro en 6 sencillos pasos. Completa los datos de tu residencia, servicios, precios y amenidades. Un administrador revisará tu perfil y lo aprobará para que aparezca en el directorio.'
      },
      {
        q: '¿Cuánto tiempo tarda la aprobación de mi registro?',
        a: 'Nuestro equipo revisa los nuevos registros dentro de 24-48 horas hábiles. Te notificaremos por correo electrónico cuando tu residencia sea aprobada y aparezca en el directorio.'
      },
      {
        q: '¿Tengo que pagar para registrar mi residencia?',
        a: 'No, el registro básico es completamente gratuito. Tu residencia aparecerá en el directorio sin costo. Existen planes premium opcionales que ofrecen mayor visibilidad y posicionamiento destacado en las búsquedas.'
      },
      {
        q: '¿Cómo puedo mejorar mi perfil?',
        a: 'Completa toda la información de tu perfil: sube fotos de calidad de las instalaciones, detalla los servicios y amenidades que ofreces, indica precios claros, y anima a las familias satisfechas a dejar reseñas. Los perfiles completos y con buenas reseñas aparecen primero en las búsquedas.'
      },
      {
        q: '¿Puedo editar mi perfil después de registrarme?',
        a: 'Sí, una vez aprobado tu registro, puedes acceder a tu panel de administración donde podrás actualizar fotos, precios, amenidades, datos de contacto y toda la información de tu residencia en cualquier momento.'
      },
    ]
  },
  {
    category: 'Reseñas y Calificaciones',
    questions: [
      {
        q: '¿Cómo funcionan las reseñas?',
        a: 'Las familias que han utilizado los servicios de una residencia pueden dejar una reseña con calificación. SeniorAdvisor utiliza un sistema de evaluación basado en múltiples criterios para ofrecer una visión completa de la calidad del servicio.'
      },
      {
        q: '¿Qué hago si recibo una reseña negativa?',
        a: 'Las reseñas negativas son una oportunidad de mejora. Responde de forma profesional y constructiva, muestra disposición a resolver el problema, y trabaja en mejorar los aspectos señalados. Las buenas reseñas posteriores compensarán una mala experiencia.'
      },
    ]
  },
  {
    category: 'Precios y Pagos',
    questions: [
      {
        q: '¿Cómo se determinan los precios de las residencias?',
        a: 'Cada residencia establece sus propios precios. En SeniorAdvisor puedes comparar precios entre distintas residencias para la misma comuna o tipo de servicio. Los precios mostrados son referenciales y pueden variar según las necesidades específicas del adulto mayor.'
      },
      {
        q: '¿SeniorAdvisor cobra comisiones?',
        a: 'No, SeniorAdvisor no cobra comisiones por los servicios contratados. La negociación y el pago se realizan directamente entre la familia y la residencia o proveedor de servicios.'
      },
    ]
  },
  {
    category: 'Contacto y Soporte',
    questions: [
      {
        q: '¿Cómo me contacto con SeniorAdvisor?',
        a: 'Puedes escribirnos a contacto@senioradvisor.cl para cualquier consulta, sugerencia o problema. Respondemos en un plazo máximo de 24-48 horas hábiles.'
      },
      {
        q: '¿Puedo solicitar un reembolso de mi suscripción?',
        a: 'Los reembolsos se evalúan caso a caso. Si no has utilizado los servicios de la suscripción, puedes solicitar un reembolso dentro de los primeros 7 días escribiendo a contacto@senioradvisor.cl.'
      },
      {
        q: '¿Cómo cancelo mi suscripción?',
        a: 'Puedes cancelar tu suscripción en cualquier momento desde tu panel de usuario o escribiendo a contacto@senioradvisor.cl. Seguirás teniendo acceso a los beneficios hasta que termine el período pagado.'
      },
    ]
  },
];

const FaqItem = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
        data-testid={`faq-item-${question.slice(0, 20).replace(/\s/g, '-').toLowerCase()}`}
      >
        <span className="font-medium text-[#33404f] group-hover:text-[#00e7ff] transition-colors pr-4">{question}</span>
        <ChevronDown className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="pb-5 pr-8">
          <p className="text-gray-600 text-sm leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
};

export default function FAQ() {
  return (
    <div className="min-h-screen bg-gray-50 py-12" data-testid="faq-page">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#33404f] mb-3">Preguntas Frecuentes</h1>
          <p className="text-gray-500 text-lg">Todo lo que necesitas saber sobre SeniorAdvisor</p>
        </div>

        <div className="space-y-8">
          {faqs.map((section) => (
            <div key={section.category} className="bg-white rounded-2xl shadow-sm p-6 sm:p-8" data-testid={`faq-section-${section.category.toLowerCase().replace(/\s/g, '-')}`}>
              <h2 className="text-xl font-bold text-[#00e7ff] mb-2">{section.category}</h2>
              <div>
                {section.questions.map((item) => (
                  <FaqItem key={item.q} question={item.q} answer={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-500">¿No encontraste lo que buscabas?</p>
          <a href="mailto:contacto@senioradvisor.cl" className="text-[#00e7ff] font-semibold hover:underline mt-1 inline-block">Escríbenos a contacto@senioradvisor.cl</a>
        </div>
      </div>
    </div>
  );
}
