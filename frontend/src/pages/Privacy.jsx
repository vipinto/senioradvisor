import React from 'react';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12" data-testid="privacy-page">
      <div className="max-w-3xl mx-auto px-4">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Política de Privacidad</h1>
          <p className="text-gray-500">Última actualización: Febrero 2026</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-10 space-y-8 text-gray-700 leading-relaxed text-sm">

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Introducción</h2>
            <p>
              En U-CAN nos comprometemos a proteger la privacidad y seguridad de la información personal de nuestros usuarios.
              Esta Política de Privacidad describe cómo recopilamos, utilizamos, almacenamos y protegemos los datos personales
              de quienes utilizan la plataforma.
            </p>
            <p className="mt-2">
              La plataforma U-CAN es operada por COMERCIAL OVNI LIMITADA, empresa constituida conforme a las leyes de la
              República de Chile.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Información que Recopilamos</h2>
            <p>
              Para ofrecer nuestros servicios, podemos recopilar distintos tipos de información personal, incluyendo:
            </p>

            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Nombre y apellido</li>
              <li>Correo electrónico</li>
              <li>Número de teléfono</li>
              <li>Ubicación o dirección aproximada</li>
              <li>Información sobre mascotas (raza, tamaño, salud, comportamiento)</li>
              <li>Fotografía de perfil</li>
            </ul>

            <p className="mt-2">
              En el caso de cuidadores que soliciten verificación, también podemos solicitar:
            </p>

            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Certificado de antecedentes</li>
              <li>Fotografía del carnet de identidad por ambos lados</li>
              <li>Fotografía personal para verificar identidad</li>
            </ul>

          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Uso de la Información</h2>

            <p>La información recopilada se utiliza para:</p>

            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Crear y administrar cuentas de usuario</li>
              <li>Conectar clientes con cuidadores dentro de la plataforma</li>
              <li>Permitir comunicación entre usuarios</li>
              <li>Verificar la identidad de cuidadores</li>
              <li>Mejorar la seguridad de la plataforma</li>
              <li>Procesar suscripciones y pagos</li>
              <li>Brindar soporte y asistencia a usuarios</li>
            </ul>

          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Suscripciones y Pagos</h2>

            <p>
              U-CAN opera bajo un modelo de suscripción mensual que permite a los usuarios acceder a los datos de contacto
              de cuidadores disponibles en la plataforma.
            </p>

            <p className="mt-2">
              Los pagos de suscripción son procesados por proveedores externos de pago como Mercado Pago.
              U-CAN no almacena información completa de tarjetas de crédito o medios de pago.
            </p>

          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Compartir Información</h2>

            <p>
              U-CAN no vende ni comercializa datos personales de sus usuarios.
            </p>

            <p className="mt-2">
              Sin embargo, cierta información puede ser compartida en los siguientes casos:
            </p>

            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Entre clientes y cuidadores para facilitar la prestación del servicio.</li>
              <li>Con proveedores de servicios tecnológicos o de pago.</li>
              <li>Cuando sea requerido por ley o autoridad competente.</li>
            </ul>

          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Seguridad de la Información</h2>

            <p>
              Implementamos medidas razonables de seguridad técnica y organizativa para proteger los datos personales
              contra accesos no autorizados, pérdida o uso indebido.
            </p>

            <p className="mt-2">
              Aun así, ningún sistema de seguridad es completamente infalible, por lo que no podemos garantizar
              seguridad absoluta de la información transmitida por internet.
            </p>

          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Datos de Verificación de Cuidadores</h2>

            <p>
              Los documentos enviados por cuidadores para procesos de verificación (certificado de antecedentes,
              carnet de identidad y fotografía personal) se utilizan exclusivamente para validar identidad
              y aumentar la seguridad dentro de la plataforma.
            </p>

            <p className="mt-2">
              Esta información no se publica públicamente y solo es utilizada por el equipo de U-CAN para
              procesos de verificación interna.
            </p>

          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Derechos del Usuario</h2>

            <p>
              Los usuarios pueden solicitar en cualquier momento:
            </p>

            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Acceder a sus datos personales</li>
              <li>Actualizar o corregir información</li>
              <li>Solicitar eliminación de su cuenta</li>
            </ul>

            <p className="mt-2">
              Estas solicitudes pueden realizarse contactando a nuestro correo oficial.
            </p>

          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Cambios en la Política de Privacidad</h2>

            <p>
              U-CAN se reserva el derecho de modificar esta Política de Privacidad cuando sea necesario.
              Los cambios serán publicados en la plataforma y entrarán en vigencia desde su publicación.
            </p>

          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Contacto</h2>

            <p>
              Si tienes preguntas sobre esta Política de Privacidad o sobre el tratamiento de tus datos personales,
              puedes contactarnos en:
            </p>

            <p className="mt-2 font-medium text-[#E6202E]">
              contacto@u-can.cl
            </p>

          </section>

        </div>
      </div>
    </div>
  );
}
