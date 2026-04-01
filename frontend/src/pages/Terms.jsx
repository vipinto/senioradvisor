import React from 'react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50 py-12" data-testid="terms-page">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#33404f] mb-3">Términos y Condiciones</h1>
          <p className="text-gray-500">Última actualización: Marzo 2026</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-[#33404f] mb-3">1. Aceptación de los Términos</h2>
            <p className="text-gray-600 leading-relaxed">Al acceder y utilizar la plataforma SeniorAdvisor, aceptas cumplir con estos Términos y Condiciones. Si no estás de acuerdo con alguno de estos términos, te pedimos que no utilices nuestros servicios.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#33404f] mb-3">2. Descripción del Servicio</h2>
            <p className="text-gray-600 leading-relaxed">SeniorAdvisor es una plataforma que conecta familias con residencias de adultos mayores, servicios de cuidado a domicilio y profesionales de salud mental. SeniorAdvisor actúa únicamente como intermediario y no es responsable directo de los servicios prestados por los proveedores.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#33404f] mb-3">3. Registro y Cuentas</h2>
            <p className="text-gray-600 leading-relaxed">Para utilizar ciertos servicios de SeniorAdvisor, debes crear una cuenta proporcionando información veraz y actualizada. Eres responsable de mantener la confidencialidad de tu cuenta y contraseña.</p>
            <ul className="list-disc pl-5 text-gray-600 space-y-1 mt-2">
              <li>Las residencias y proveedores pueden registrarse a través del formulario público de registro.</li>
              <li>Todo nuevo registro de residencia será revisado y aprobado por un administrador antes de aparecer en el directorio.</li>
              <li>SeniorAdvisor se reserva el derecho de rechazar registros que no cumplan con los estándares de calidad.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#33404f] mb-3">4. Suscripciones</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li>Los proveedores pueden acceder a planes premium para mayor visibilidad.</li>
              <li>Las suscripciones se renuevan automáticamente hasta que sean canceladas.</li>
              <li>SeniorAdvisor se reserva el derecho de modificar los precios con previo aviso.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#33404f] mb-3">5. Reseñas y Calificaciones</h2>
            <p className="text-gray-600 leading-relaxed">SeniorAdvisor utiliza un sistema de calificación para ayudar a las familias a tomar decisiones informadas:</p>
            <ul className="list-disc pl-5 text-gray-600 space-y-1 mt-2">
              <li>Las reseñas deben reflejar experiencias reales y verificables.</li>
              <li>SeniorAdvisor se reserva el derecho de moderar y eliminar reseñas que incumplan nuestras políticas.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#33404f] mb-3">6. Verificación</h2>
            <p className="text-gray-600 leading-relaxed">SeniorAdvisor ofrece un sistema de verificación para residencias y proveedores. Las entidades verificadas han pasado por un proceso de revisión. Sin embargo, la verificación no constituye una garantía absoluta y las familias deben ejercer su propio criterio.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#33404f] mb-3">7. Limitación de Responsabilidad</h2>
            <p className="text-gray-600 leading-relaxed">SeniorAdvisor es una plataforma de intermediación y no se hace responsable de:</p>
            <ul className="list-disc pl-5 text-gray-600 space-y-1 mt-2">
              <li>La calidad o resultado de los servicios prestados por los proveedores.</li>
              <li>Daños derivados del uso de la plataforma.</li>
              <li>La veracidad de la información proporcionada por los usuarios.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#33404f] mb-3">8. Protección de Datos</h2>
            <p className="text-gray-600 leading-relaxed">SeniorAdvisor se compromete a proteger la privacidad de sus usuarios. Para más información, consulta nuestra Política de Privacidad.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#33404f] mb-3">9. Modificaciones</h2>
            <p className="text-gray-600 leading-relaxed">SeniorAdvisor se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. Los cambios serán notificados a través de la plataforma y entrarán en vigencia desde su publicación.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#33404f] mb-3">10. Contacto</h2>
            <p className="text-gray-600">Para consultas sobre estos términos, escríbenos a:</p>
            <p className="mt-2 font-medium text-[#00e7ff]">hola@senioradvisor.cl</p>
          </section>
        </div>
      </div>
    </div>
  );
}
