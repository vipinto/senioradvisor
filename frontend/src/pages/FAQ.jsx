import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    category: 'Servicio de Paseos',
    questions: [
      {
        q: '¿En qué consiste el trabajo de paseador de perros?',
        a: 'El paseador de perros se encarga de recoger a la mascota en el domicilio del cliente, llevarla a pasear por un tiempo determinado (generalmente entre 30 minutos y 1 hora), asegurarse de que haga ejercicio, sus necesidades, y devolverla sana y salva. Es importante mantener una comunicación constante con el dueño.'
      },
      {
        q: '¿Cuáles son los horarios de paseos?',
        a: 'Los horarios los defines tú como cuidador en tu perfil. Puedes establecer tu disponibilidad según tu agenda. Los clientes verán tus horarios disponibles y podrán reservar en función de estos. Recomendamos ser flexible y ofrecer horarios variados para atraer más clientes.'
      },
      {
        q: '¿Cuánto tiene que durar cada paseo?',
        a: 'La duración del paseo depende del acuerdo entre el cuidador y el cliente. Generalmente, los paseos varían entre 30 minutos y 1 hora. Un paseo de 30 minutos es ideal para perros pequeños o mayores, mientras que razas más activas pueden necesitar paseos de 45-60 minutos.'
      },
      {
        q: '¿Qué hago si el cliente me pide un paseo de prueba?',
        a: 'Los paseos de prueba son una excelente forma de generar confianza. Puedes ofrecer un primer paseo más corto o con un descuento especial para que el cliente vea cómo trabajas. Esto te ayudará a conseguir reseñas positivas y clientes recurrentes.'
      },
    ]
  },
  {
    category: 'Servicio de Cuidado o PetSitter',
    questions: [
      {
        q: '¿En qué consiste el trabajo de cuidado de perros?',
        a: 'El servicio de cuidado incluye recibir a la mascota en tu hogar o ir al domicilio del cliente para cuidarla. Debes alimentarla, darle agua fresca, sacarla a pasear, jugar con ella y asegurarte de que esté cómoda y segura. También incluye administrar medicamentos si es necesario y mantener comunicación con el dueño.'
      },
    ]
  },
  {
    category: 'Tu Perfil de Cuidador',
    questions: [
      {
        q: '¿Tengo que pagar para registrarme como paseador o cuidador?',
        a: 'No, registrarte como cuidador en U-CAN es completamente gratuito. Puedes crear tu perfil, agregar tus servicios y precios sin ningún costo. U-CAN no cobra comisiones por los servicios que realices.'
      },
      {
        q: '¿Cuáles son los requisitos para que aprueben mi perfil?',
        a: 'Para ser aprobado como cuidador necesitas: completar toda la información de tu perfil (nombre, dirección, teléfono), agregar al menos un servicio con precio, subir una foto de perfil clara. Para ser verificado adicionalmente, debes subir tu carnet de identidad (frente y dorso), una selfie y opcionalmente tu certificado de antecedentes.'
      },
      {
        q: 'Consejos para tener una buena Galería de Fotos en tu perfil',
        a: 'Incluye fotos de alta calidad donde se vea claramente tu rostro y tu espacio de trabajo. Agrega fotos con mascotas que hayas cuidado (con permiso de los dueños), fotos del área donde realizas los paseos o del espacio donde cuidas mascotas. Las fotos profesionales y bien iluminadas generan más confianza.'
      },
      {
        q: 'Consejos para escribir una buena Presentación Personal en tu perfil',
        a: 'Sé auténtico y cercano. Menciona tu experiencia con mascotas, por qué te apasiona este trabajo, qué tipo de mascotas prefieres cuidar, y cualquier formación relevante (cursos de primeros auxilios para mascotas, etc.). Incluye detalles sobre tu hogar si ofreces alojamiento.'
      },
      {
        q: '¿Qué es y cómo se hace la validación de documento y domicilio?',
        a: 'La validación de identidad consiste en subir fotos de tu carnet de identidad (frente y dorso) junto con una selfie para verificar que eres quien dices ser. La validación de domicilio se hace mediante la dirección que registras en tu perfil. Un administrador revisará tus documentos y aprobará tu verificación.'
      },
      {
        q: '¿Cómo hago para desactivar, eliminar o dar de baja mi cuenta o perfil?',
        a: 'Puedes desactivar temporalmente tu perfil desde tu panel de cuidador cambiando tu disponibilidad. Si deseas eliminar tu cuenta permanentemente, puedes contactarnos a contacto@u-can.cl y procesaremos tu solicitud de eliminación de datos.'
      },
    ]
  },
  {
    category: 'Contratación del Servicio',
    questions: [
      {
        q: '¿Qué debe hacer el cliente para contactarme?',
        a: 'El cliente debe tener una suscripción activa en U-CAN para poder ver tu información de contacto completa (teléfono, WhatsApp, dirección). Una vez suscrito, puede contactarte directamente o enviarte una solicitud de reserva a través de la plataforma.'
      },
      {
        q: '¿Qué hago si el cliente me quiere conocer en persona?',
        a: 'Es muy recomendable tener una reunión previa con el cliente y su mascota. Esto te permite conocer al perro, entender sus necesidades, y generar confianza con el dueño. Puedes acordar una visita corta en un lugar público o en el domicilio del cliente.'
      },
      {
        q: '¿Puedo compartir mis datos de contacto con los clientes?',
        a: 'Sí, una vez que el cliente te contacta a través de U-CAN, puedes compartir tus datos para comunicación directa. Recomendamos mantener la comunicación inicial por la plataforma para tener un registro de los acuerdos.'
      },
      {
        q: '¿Qué hago si un cliente me califica negativamente?',
        a: 'U-CAN utiliza un sistema de reseñas "ciego", lo que significa que no verás la reseña del cliente hasta que ambos hayan calificado o pasen 7 días. Si recibes una crítica negativa, responde de forma profesional, aprende de la retroalimentación y mejora tu servicio. Las buenas reseñas posteriores compensarán.'
      },
      {
        q: '¿Cómo puedo lograr que un cliente me califique positivamente?',
        a: 'Ofrece un servicio excepcional: sé puntual, mantén comunicación constante (envía fotos y actualizaciones), cuida a la mascota como si fuera tuya, y ve más allá de las expectativas. Los pequeños detalles como enviar fotos del paseo o un informe del cuidado generan clientes felices.'
      },
    ]
  },
  {
    category: 'Mensajes entre Clientes y Cuidadores',
    questions: [
      {
        q: '¿Cómo me contactan los clientes?',
        a: 'Los clientes con suscripción activa pueden ver tu teléfono y WhatsApp en tu perfil. También pueden enviarte mensajes a través del chat interno de U-CAN o solicitar una reserva directamente desde tu perfil.'
      },
      {
        q: '¿Qué debo hacer cuando recibo un mensaje de un cliente?',
        a: 'Responde lo antes posible, idealmente dentro de las primeras horas. Preséntate, agradece su interés, y pregunta los detalles del servicio que necesita (fechas, tipo de mascota, necesidades especiales). La rapidez en responder aumenta tus posibilidades de ser contratado.'
      },
      {
        q: 'Consejos para responder mensajes e invitaciones',
        a: 'Sé amable y profesional. Responde todas las preguntas del cliente, ofrece información adicional sobre tu experiencia, y muestra interés genuino en cuidar a su mascota. Si no puedes aceptar el servicio, sugiere fechas alternativas o recomienda a otro cuidador.'
      },
      {
        q: '¿Qué debería escribir en una propuesta que envío a un cliente?',
        a: 'Incluye: un saludo personalizado, tu experiencia relevante, qué harás específicamente durante el servicio, tu disponibilidad, el precio, y una invitación a conocerse. Personaliza cada mensaje según las necesidades del cliente.'
      },
      {
        q: '¿Qué hago si un cliente no responde a mis mensajes?',
        a: 'Dale tiempo, algunos clientes están ocupados. Puedes enviar un mensaje de seguimiento después de 24-48 horas. Si no hay respuesta, no insistas más. Enfócate en otros clientes potenciales.'
      },
    ]
  },
  {
    category: 'Precios, Pagos y Cobranza',
    questions: [
      {
        q: '¿Cuánto puedo cobrar por mis servicios de cuidado o paseo?',
        a: 'Tú defines tus propios precios en U-CAN. Investiga los precios del mercado en tu zona. En Chile, los paseos suelen costar entre $5.000 y $15.000 dependiendo de la duración. El cuidado diario puede variar entre $15.000 y $40.000. El alojamiento nocturno entre $20.000 y $50.000.'
      },
      {
        q: '¿Cómo me paga el cliente?',
        a: 'El pago es directo entre tú y el cliente. Pueden acordar el método que prefieran: efectivo, transferencia bancaria, o cualquier otro medio. U-CAN no procesa los pagos de los servicios entre cuidadores y clientes.'
      },
      {
        q: '¿Cómo puedo hacer un descuento a un cliente?',
        a: 'Puedes ofrecer descuentos acordándolo directamente con el cliente. Por ejemplo, puedes dar descuentos por servicios recurrentes, múltiples mascotas, o clientes de largo plazo. Simplemente ajusta el precio al momento de acordar el servicio.'
      },
      {
        q: '¿Cómo cobro por los servicios que brindo?',
        a: 'Una vez completado el servicio, solicita el pago según lo acordado. Recomendamos acordar las condiciones de pago antes del servicio (pago anticipado, al finalizar, o 50/50). Mantén un registro de los servicios y pagos.'
      },
      {
        q: '¿Cuánto voy a ganar como paseador o cuidador?',
        a: 'Tus ganancias dependen de cuántos clientes consigas y tus tarifas. Un cuidador activo con buenas reseñas puede generar ingresos significativos. U-CAN no cobra comisiones, así que todo lo que cobras es tuyo.'
      },
      {
        q: '¿Cómo aumento el precio de mis servicios?',
        a: 'Puedes actualizar tus precios en cualquier momento desde tu panel de cuidador, en la sección de servicios. Los nuevos precios se mostrarán inmediatamente en tu perfil. Avisa a tus clientes recurrentes antes de aumentar precios.'
      },
      {
        q: '¿Cobran comisiones por los clientes que consigo?',
        a: 'No, U-CAN no cobra comisiones por los servicios que realizas. Tu única inversión es la suscripción si deseas acceder a funciones premium. Todo lo que cobres a tus clientes es 100% tuyo.'
      },
    ]
  },
  {
    category: 'Información Adicional',
    questions: [
      {
        q: '¿Cómo aumento mis posibilidades de conseguir clientes?',
        a: 'Completa tu perfil al 100%, sube fotos de calidad, escribe una descripción atractiva, obtén la verificación de identidad, ofrece precios competitivos, responde rápido a los mensajes, y acumula reseñas positivas. Los cuidadores verificados y con buenas reseñas aparecen primero en las búsquedas.'
      },
      {
        q: '¿Necesito alguna autorización o permiso para cuidar o pasear perros?',
        a: 'En Chile no se requiere una licencia específica para ser paseador o cuidador de mascotas. Sin embargo, recomendamos tener conocimientos básicos sobre el cuidado de animales y primeros auxilios para mascotas. Un curso de cuidado animal puede diferenciarte de la competencia.'
      },
      {
        q: '¿Cómo me contacto con U-CAN?',
        a: 'Puedes escribirnos a contacto@u-can.cl para cualquier consulta, sugerencia o problema. También puedes usar el chat de soporte dentro de la plataforma. Respondemos en un plazo máximo de 24-48 horas hábiles.'
      },
    ]
  },
  {
    category: 'Suscripción Premium (Clientes)',
    questions: [
      {
        q: '¿Puedo solicitar un reembolso de mi suscripción?',
        a: 'Los reembolsos se evalúan caso a caso. Si no has utilizado los servicios de la suscripción, puedes solicitar un reembolso dentro de los primeros 7 días escribiendo a contacto@u-can.cl. Después de este período, la suscripción no es reembolsable.'
      },
      {
        q: '¿Qué beneficios tiene la suscripción premium?',
        a: 'Con la suscripción puedes: ver los datos de contacto completos de todos los cuidadores (teléfono, WhatsApp, dirección), enviar mensajes ilimitados, hacer reservas, y acceder a cuidadores verificados. Sin suscripción, solo puedes ver información básica de los perfiles.'
      },
      {
        q: '¿Cómo cancelo mi suscripción?',
        a: 'Puedes cancelar tu suscripción en cualquier momento desde tu panel de usuario o escribiendo a contacto@u-can.cl. Seguirás teniendo acceso a los beneficios hasta que termine el período pagado.'
      },
    ]
  },
  {
    category: 'General',
    questions: [
      {
        q: '¿Qué es U-CAN?',
        a: 'U-CAN es una plataforma que conecta dueños de mascotas con cuidadores verificados en Chile. Puedes encontrar servicios de alojamiento, PetSitter y paseo para tu mascota, con la tranquilidad de ver reseñas y perfiles verificados.'
      },
      {
        q: '¿Es gratis usar U-CAN?',
        a: 'Para cuidadores: registrarse y crear un perfil es 100% gratis. Para clientes: puedes buscar y ver perfiles de cuidadores gratis. Para ver los datos de contacto completos y comunicarte con ellos, necesitas una suscripción activa.'
      },
      {
        q: '¿En qué ciudades está disponible?',
        a: 'Actualmente estamos disponibles en Santiago de Chile y sus comunas. Pronto nos expandiremos a otras regiones del país.'
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
        <span className="font-medium text-gray-900 group-hover:text-[#E6202E] transition-colors pr-4">{question}</span>
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
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Preguntas Frecuentes</h1>
          <p className="text-gray-500 text-lg">Todo lo que necesitas saber sobre U-CAN</p>
        </div>

        <div className="space-y-8">
          {faqs.map((section) => (
            <div key={section.category} className="bg-white rounded-2xl shadow-sm p-6 sm:p-8" data-testid={`faq-section-${section.category.toLowerCase().replace(/\s/g, '-')}`}>
              <h2 className="text-xl font-bold text-[#E6202E] mb-2">{section.category}</h2>
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
          <a href="mailto:contacto@u-can.cl" className="text-[#E6202E] font-semibold hover:underline mt-1 inline-block">Escríbenos a contacto@u-can.cl</a>
        </div>
      </div>
    </div>
  );
}
