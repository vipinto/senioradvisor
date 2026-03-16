import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RegistroExitoso() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-white flex items-center justify-center py-12 px-4" data-testid="registro-exitoso-page">
      <div className="max-w-md w-full text-center">
        <Link to="/">
          <img src="/logo-senior.svg" alt="SeniorAdvisor" className="h-14 mx-auto mb-6" />
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-[#33404f]" data-testid="success-title">Registro Enviado</h1>

          <p className="text-gray-600">
            Tu solicitud de registro ha sido recibida correctamente. Un administrador revisará la información proporcionada.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 text-left">
              <strong>¿Qué sigue?</strong> Recibirás una notificación cuando tu residencia sea aprobada y aparecerá en el directorio.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link to="/login">
              <Button className="w-full bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f] py-5 rounded-xl font-bold" data-testid="go-login-btn">
                Ir a Iniciar Sesión <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="w-full py-5 rounded-xl mt-2" data-testid="go-home-btn">
                Volver al Inicio
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
