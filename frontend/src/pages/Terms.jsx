import React from 'react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50 py-12" data-testid="terms-page">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#33404f] mb-3">Términos y Condiciones</h1>
          <p className="text-gray-500">Última actualización: Febrero 2026</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-10 space-y-8 text-gray-700 leading-relaxed text-sm">

          <section>
            <h2 className="text-xl font-bold text-[#33404f] mb-3">1. Aceptación de los Términos</h2>
            <p>Al acceder y utilizar la plataforma U-CAN, aceptas cumplir con estos Términos y Condiciones. Si no estás de acuerdo con alguno de estos términos, te pedimos que no utilices nuestros servicios.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#33404f] mb-3">2. Descripción del Servicio</h2>
            <p>U-CAN es una plataforma que conecta dueños de mascotas con cuidadores independientes. U-CAN actúa únicamente como intermediario y no es responsable directo de los servicios prestados por los cuidadores.</p>
            <p className="mt-2">Los servicios disponibles incluyen:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Paseo de perros</li>
              <li>Cuidado (mientras sus dueños viajan)</li>
              <li>Daycare (cuidado diurno)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#33404f] mb-3">3. Registro y Cuentas</h2>
            <p>Para utilizar ciertos servicios de U-CAN, debes crear una cuenta proporcionando información veraz y actualizada. Eres responsable de mantener la confidencialidad de tu cuenta y contraseña.</p>
            <p className="mt-2">Existen dos tipos de cuentas:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Cliente:</strong> Personas que buscan servicios de cuidado para sus mascotas.</li>
              <li><strong>Cuidador:</strong> Personas que ofrecen servicios de cuidado de mascotas.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#33404f] mb-3">4. Suscripciones y Pagos</h2>
            <p>Para acceder a los datos de contacto de los cuidadores y comunicarse con ellos, los clientes deben adquirir una suscripción. Los pagos se procesan a través de Mercado Pago.</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Los precios de las suscripciones se muestran en la sección de Planes.</li>
              <li>Las suscripciones se renuevan según el período contratado.</li>
              <li>U-CAN se reserva el derecho de modificar los precios con previo aviso.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#33404f] mb-3">5. Responsabilidades del Cuidador</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Proporcionar información veraz en su perfil.</li>
              <li>Cumplir con los servicios acordados con el cliente.</li>
              <li>Cuidar responsablemente de las mascotas a su cargo.</li>
              <li>Utilizar el botón SOS de emergencia en caso de problemas de salud de la mascota.</li>
              <li>Mantener una comunicación clara y oportuna con los clientes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#33404f] mb-3">6. Responsabilidades del Cliente</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Proporcionar información veraz sobre sus mascotas (raza, tamaño, comportamiento, salud).</li>
              <li>Informar al cuidador sobre cualquier necesidad especial de la mascota.</li>
              <li>Cumplir con los horarios y acuerdos establecidos con el cuidador.</li>
              <li>Respetar las condiciones y reglas del cuidador.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#33404f] mb-3">7. Sistema de Calificaciones</h2>
            <p>U-CAN utiliza un sistema de calificación bidireccional y ciego:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Tanto clientes como cuidadores pueden calificarse mutuamente después de cada servicio.</li>
              <li>Las calificaciones permanecen ocultas hasta que ambas partes hayan enviado su evaluación, o hasta que transcurran 7 días.</li>
              <li>Este sistema garantiza reseñas honestas e imparciales.</li>
              <li>U-CAN se reserva el derecho de moderar y eliminar reseñas que incumplan nuestras políticas.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#33404f] mb-3">8. Verificación de Cuidadores</h2>
            <p>U-CAN ofrece un sistema de verificación para cuidadores. Los cuidadores verificados han pasado por un proceso de revisión de antecedentes. Sin embargo, la verificación no constituye una garantía absoluta y los clientes deben ejercer su propio criterio.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#33404f] mb-3">9. Limitación de Responsabilidad</h2>
            <p>U-CAN es una plataforma de intermediación y no se hace responsable de:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Daños, lesiones o pérdidas que puedan ocurrir durante la prestación de servicios entre usuarios.</li>
              <li>La calidad de los servicios prestados por los cuidadores.</li>
              <li>Disputas entre clientes y cuidadores.</li>
            </ul>
            <p className="mt-2">Recomendamos a los usuarios tomar las precauciones necesarias y verificar la información de los cuidadores antes de contratar sus servicios.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#33404f] mb-3">10. Privacidad y Datos Personales</h2>
            <p>U-CAN se compromete a proteger la privacidad de sus usuarios. Los datos personales de los cuidadores (nombre completo, teléfono, dirección) solo son visibles para usuarios con suscripción activa. Para más información, consulta nuestra Política de Privacidad.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#33404f] mb-3">11. Modificaciones</h2>
            <p>U-CAN se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. Los cambios serán notificados a través de la plataforma y entrarán en vigencia desde su publicación.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#33404f] mb-3">12. Contacto</h2>
            <p>Para consultas sobre estos Términos y Condiciones, puedes contactarnos en:</p>
            <p className="mt-2 font-medium text-[#00e7ff]">contacto@u-can.cl</p>
          </section>

        </div>
      </div>
    </div>
  );
}
