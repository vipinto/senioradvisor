import React from 'react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12" data-testid="privacy-page">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#33404f] mb-3">Política de Privacidad</h1>
          <p className="text-gray-500">Última actualización: Marzo 2026</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-[#33404f] mb-3">1. Información General</h2>
            <p className="text-gray-600 leading-relaxed">
              En SeniorAdvisor nos comprometemos a proteger la privacidad y seguridad de la información personal de nuestros usuarios.
              Esta política describe cómo recopilamos, usamos y protegemos tus datos.
            </p>
            <p className="text-gray-600 leading-relaxed mt-3">
              La plataforma SeniorAdvisor es operada por COMERCIAL OVNI LIMITADA, empresa constituida conforme a las leyes de la
              República de Chile, en conformidad con la Ley N° 19.628 sobre Protección de la Vida Privada.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#33404f] mb-3">2. Datos que Recopilamos</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li><strong>Datos de registro:</strong> Nombre, correo electrónico, teléfono, dirección.</li>
              <li><strong>Datos de residencia (proveedores):</strong> Nombre de la residencia, dirección, comuna, región, servicios, precios, fotos, amenidades.</li>
              <li><strong>Datos de navegación:</strong> Información técnica como IP, navegador, páginas visitadas.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#33404f] mb-3">3. Uso de la Información</h2>
            <p className="text-gray-600 leading-relaxed">
              La información recopilada se utiliza para: facilitar la conexión entre familias y residencias, mejorar nuestros servicios,
              enviar comunicaciones relevantes, y garantizar la seguridad de la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#33404f] mb-3">4. Suscripción y Pagos</h2>
            <p className="text-gray-600 leading-relaxed">
              SeniorAdvisor opera bajo un modelo de suscripción opcional para proveedores que deseen mayor visibilidad.
              SeniorAdvisor no almacena información completa de tarjetas de crédito o medios de pago; estos datos son procesados por nuestro proveedor de pagos certificado.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#33404f] mb-3">5. Compartición de Datos</h2>
            <p className="text-gray-600 leading-relaxed">
              SeniorAdvisor no vende ni comercializa datos personales de sus usuarios.
              La información de contacto de las residencias se muestra en sus perfiles públicos para que las familias puedan contactarlas directamente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#33404f] mb-3">6. Verificación de Identidad</h2>
            <p className="text-gray-600 leading-relaxed">
              Para el proceso de verificación de residencias, podemos solicitar documentación adicional.
              Esta información no se publica públicamente y solo es utilizada por el equipo de SeniorAdvisor para
              verificar la autenticidad de los proveedores.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#33404f] mb-3">7. Derechos del Usuario</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>Derecho a acceder a tus datos personales.</li>
              <li>Derecho a rectificar información incorrecta.</li>
              <li>Derecho a solicitar la eliminación de tus datos.</li>
              <li>Derecho a oponerte al procesamiento de tus datos.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#33404f] mb-3">8. Modificaciones</h2>
            <p className="text-gray-600 leading-relaxed">
              SeniorAdvisor se reserva el derecho de modificar esta Política de Privacidad cuando sea necesario.
              Los cambios serán notificados a través de la plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#33404f] mb-3">9. Contacto</h2>
            <p className="text-gray-600">Para consultas sobre privacidad, escríbenos a:</p>
            <p className="font-medium text-[#00e7ff] mt-1">contacto@senioradvisor.cl</p>
          </section>
        </div>
      </div>
    </div>
  );
}
