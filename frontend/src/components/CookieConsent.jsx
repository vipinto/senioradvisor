import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const COOKIE_CONSENT_KEY = 'SeniorAdvisor_cookie_consent';

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setVisible(false);
  };

  const reject = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] p-4 animate-in slide-in-from-bottom duration-500"
      data-testid="cookie-consent-banner"
    >
      <div className="max-w-4xl mx-auto bg-gray-900 text-white rounded-2xl shadow-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Cookie className="w-8 h-8 text-yellow-400 flex-shrink-0 hidden sm:block" />
        <div className="flex-1 min-w-0">
          <p className="text-sm leading-relaxed">
            Usamos cookies para mejorar tu experiencia, analizar el uso del sitio y personalizar contenido.
            Al continuar navegando, aceptas nuestro uso de cookies.{' '}
            <Link to="/privacy" className="text-[#00e7ff] hover:underline font-medium">
              Politica de Privacidad
            </Link>
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={reject}
            className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white text-xs"
            data-testid="cookie-reject-btn"
          >
            Solo esenciales
          </Button>
          <Button
            size="sm"
            onClick={accept}
            className="bg-[#00e7ff] hover:bg-[#00c4d4] text-[#33404f] text-xs"
            data-testid="cookie-accept-btn"
          >
            Aceptar todas
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
