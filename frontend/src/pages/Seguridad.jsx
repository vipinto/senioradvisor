import React from 'react';

export default function Seguridad() {
  return (
    <div className="min-h-screen bg-gray-50 py-12" data-testid="security-page">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Seguridad en U-CAN</h1>
          <p className="text-gray-500">Última actualización: Febrero 2026</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-10 space-y-8 text-gray-700 leading-relaxed text-sm">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Nuestro enfoque de seguridad</h2>
            <p>
              En U-CAN nos tomamos la seguridad muy en serio. Nuestro objetivo es ayudarte a tomar decisiones informadas al momento
              de contactar cuidadores y contratar servicios para tu mascota. U-CAN es una plataforma de intermediación operada por
              COMERCIAL OVNI LIMITADA, y los servicios son prestados por cuidadores independientes.
            </p>
            <p className="mt-2">
              Esta página resume las medidas disponibles dentro de la plataforma y recomendaciones prácticas para clientes y cuidadores.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Cuidadores verificados</h2>
            <p>
              U-CAN cuenta con un sistema de cuidadores verificados para aumentar la confianza dentro de la comunidad. Para optar a la
              verificación, los cuidadores deben enviar documentación que permita validar su identidad.
            </p>
            <p className="mt-2">El proceso de verificación puede incluir:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Certificado de antecedentes.</li>
              <li>Fotografía del carnet de identidad por ambos lados.</li>
              <li>Fotografía personal o foto de perfil.</li>
            </ul>
            <p className="mt-2">
              La verificación busca confirmar identidad y coherencia de datos. Sin embargo, no es una garantía absoluta de conducta futura
              ni de calidad del servicio. Recomendamos siempre conversar previamente y acordar condiciones claras antes de contratar.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Botón SOS veterinario</h2>
            <p>
              Durante un servicio, si ocurre un percance o un problema de salud con la mascota, el cuidador puede utilizar el botón SOS
              (cuando esté disponible) para contactar directamente a un veterinario y recibir orientación profesional.
            </p>
            <p className="mt-2">
              El botón SOS es una herramienta de apoyo y orientación. No reemplaza la atención veterinaria presencial ni constituye garantía
              de resultado. En emergencias graves, se debe acudir de inmediato a un centro veterinario y contactar a los servicios de emergencia
              pertinentes si corresponde.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Sistema de calificaciones y reseñas</h2>
            <p>
              U-CAN puede habilitar calificaciones y reseñas para ayudar a la comunidad a tomar mejores decisiones. Las reseñas reflejan la
              experiencia de otros usuarios y son un insumo útil al momento de elegir con quién trabajar.
            </p>
            <p className="mt-2">
              U-CAN puede moderar o eliminar contenido ofensivo, falso o que incumpla las políticas de la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Recomendaciones para clientes</h2>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Revisa si el cuidador está verificado y revisa su perfil y calificaciones.</li>
              <li>Conversa antes de contratar: rutina, horarios, cuidados, medicación, conducta y necesidades especiales.</li>
              <li>Entrega información completa de tu mascota (vacunas, alergias, historial, reactividad, escapes, etc.).</li>
              <li>Deja un contacto de emergencia y una autorización clara en caso de veterinario.</li>
              <li>Define por escrito (por chat) el acuerdo: precio, horarios, lugar, entregas y devoluciones.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Recomendaciones para cuidadores</h2>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Solicita información completa de la mascota antes de aceptar el servicio.</li>
              <li>Confirma conducta, salud, vacunas, necesidades especiales y contactos de emergencia.</li>
              <li>Usa siempre correa en paseos y aplica medidas de seguridad razonables.</li>
              <li>Mantén comunicación oportuna con el cliente durante el servicio.</li>
              <li>Ante una emergencia, utiliza el botón SOS (si está disponible) y coordina con el cliente.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Fraude, suplantación y conductas indebidas</h2>
            <p>
              U-CAN puede suspender o eliminar cuentas ante sospechas de fraude, suplantación, información falsa, acoso, amenazas o cualquier
              conducta que ponga en riesgo a la comunidad. Si detectas una situación sospechosa, recomendamos dejar registro por escrito y
              reportarla.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Limitación importante</h2>
            <p>
              U-CAN es una plataforma de intermediación. Los servicios son prestados por cuidadores independientes y la contratación ocurre
              directamente entre cliente y cuidador. Aunque trabajamos para mejorar la seguridad, ningún mecanismo elimina completamente los riesgos
              asociados al cuidado de mascotas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Contacto</h2>
            <p>Si necesitas ayuda o quieres reportar un caso, puedes contactarnos en:</p>
            <p className="mt-2 font-medium text-[#E6202E]">contacto@u-can.cl</p>
          </section>
        </div>
      </div>
    </div>
  );
}
