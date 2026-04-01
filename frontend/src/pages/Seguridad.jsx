import React from 'react';
import { Shield, UserCheck, Star, AlertTriangle, FileText, Mail } from 'lucide-react';

export default function Seguridad() {
  return (
    <div className="min-h-screen bg-gray-50 py-12" data-testid="seguridad-page">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#33404f] mb-3">Seguridad en SeniorAdvisor</h1>
          <p className="text-gray-500 text-lg">Tu tranquilidad es nuestra prioridad</p>
        </div>

        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-6 h-6 text-[#00e7ff]" />
              <h2 className="text-xl font-bold text-[#33404f]">Compromiso con la Seguridad</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              En SeniorAdvisor nos tomamos la seguridad muy en serio. Nuestro objetivo es ayudarte a tomar decisiones informadas al momento
              de buscar servicios de cuidado para adultos mayores. SeniorAdvisor es una plataforma de intermediación operada por
              COMERCIAL OVNI LIMITADA, que facilita la conexión entre familias y proveedores de servicios de cuidado senior.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <UserCheck className="w-6 h-6 text-[#00e7ff]" />
              <h2 className="text-xl font-bold text-[#33404f]">Verificación de Residencias</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              SeniorAdvisor cuenta con un sistema de residencias verificadas para aumentar la confianza dentro de la comunidad. Para optar a la
              verificación, cada residencia pasa por un proceso de revisión que incluye validación de datos de contacto,
              verificación de la existencia física de la residencia, y revisión de la información proporcionada.
              Las residencias verificadas se destacan con un badge especial en su perfil.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Star className="w-6 h-6 text-[#00e7ff]" />
              <h2 className="text-xl font-bold text-[#33404f]">Sistema de Reseñas</h2>
            </div>
            <p className="text-gray-600 leading-relaxed mb-3">
              SeniorAdvisor cuenta con un sistema de calificaciones y reseñas para ayudar a la comunidad a tomar mejores decisiones. Las reseñas reflejan la
              experiencia real de las familias con los servicios recibidos.
            </p>
            <p className="text-gray-600 leading-relaxed">
              SeniorAdvisor puede moderar o eliminar contenido ofensivo, falso o que incumpla las políticas de la plataforma.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-[#00e7ff]" />
              <h2 className="text-xl font-bold text-[#33404f]">Moderación y Seguridad</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              SeniorAdvisor puede suspender o eliminar cuentas ante sospechas de fraude, suplantación, información falsa, acoso, amenazas o cualquier
              conducta que ponga en riesgo a la comunidad. Si detectas algo sospechoso, repórtalo inmediatamente.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-[#00e7ff]" />
              <h2 className="text-xl font-bold text-[#33404f]">Limitación de Responsabilidad</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              SeniorAdvisor es una plataforma de intermediación. Los servicios son prestados por las residencias y proveedores independientes y la contratación ocurre
              directamente entre las familias y estos proveedores. SeniorAdvisor no garantiza la calidad, seguridad o resultado de los servicios prestados por terceros.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="w-6 h-6 text-[#00e7ff]" />
              <h2 className="text-xl font-bold text-[#33404f]">Contacto</h2>
            </div>
            <p className="text-gray-600">Si tienes preguntas o necesitas reportar un problema de seguridad, contáctanos:</p>
            <p className="mt-2 font-medium text-[#00e7ff]">hola@senioradvisor.cl</p>
          </div>
        </div>
      </div>
    </div>
  );
}
