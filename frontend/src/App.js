import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Toaster } from 'sonner';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import SearchSimple from '@/pages/SearchSimple';
import Plans from '@/pages/Plans';
import ProviderProfile from '@/pages/ProviderProfile';
import Favorites from '@/pages/Favorites';
import Chat from '@/pages/Chat';
import ProviderDashboard from '@/pages/ProviderDashboard';
import ProviderAccount from '@/pages/ProviderAccount';
import ClientAccount from '@/pages/ClientAccount';
import AdminPanel from '@/pages/AdminPanel';
import Dashboard from '@/pages/Dashboard';
import PaymentResult from '@/pages/PaymentResult';
import RegisterProvider from '@/pages/RegisterProvider';
import RegistroExitoso from '@/pages/RegistroExitoso';
import GoogleCallback from '@/pages/GoogleCallback';
import PetSetup from '@/pages/PetSetup';
import Blog from '@/pages/Blog';
import BlogArticle from '@/pages/BlogArticle';
import HelpRescatePage from '@/pages/HelpRescatePage';
import SeniorClubPage from '@/pages/SeniorClubPage';
import FAQ from '@/pages/FAQ';
import Terms from '@/pages/Terms';
import Privacy from '@/pages/Privacy';
import Seguridad from '@/pages/Seguridad';
import HogaresSociales from '@/pages/HogaresSociales';
import MyBookings from '@/pages/MyBookings';
import ServiceHistory from '@/pages/ServiceHistory';
import SelectRole from '@/pages/SelectRole';
import Footer from '@/components/Footer';
import CookieConsent from '@/components/CookieConsent';
import '@/App.css';
import GoogleAuthSuccess from '@/pages/GoogleAuthSuccess';
import Destacados from '@/pages/Destacados';

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

const authPages = ['/login', '/register', '/forgot-password', '/reset-password', '/auth/google/callback', '/auth/google-success', '/mis-mascotas/nueva', '/registrar-residencia', '/registro-exitoso'];

function AppRouter() {
  const location = useLocation();
  const hideNavbar = authPages.some(p => location.pathname.startsWith(p));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/select-role" element={<SelectRole />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/google/callback" element={<GoogleCallback />} />
        <Route path="/auth/google-success" element={<GoogleAuthSuccess />} />
        <Route path="/search" element={<SearchSimple />} />
        <Route path="/destacados" element={<Destacados />} />
        <Route path="/planes" element={<Plans />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogArticle />} />
        <Route path="/convenio/help-rescate" element={<HelpRescatePage />} />
        <Route path="/seniorclub" element={<SeniorClubPage />} />
        <Route path="/provider/:providerId" element={<ProviderProfile />} />
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/client/dashboard" element={
  <ProtectedRoute><Dashboard /></ProtectedRoute>
} />
        <Route path="/account" element={
          <ProtectedRoute><ClientAccount /></ProtectedRoute>
        } />
        <Route path="/favoritos" element={
          <ProtectedRoute><Favorites /></ProtectedRoute>
        } />
        <Route path="/chat" element={
          <ProtectedRoute><Chat /></ProtectedRoute>
        } />
        <Route path="/provider/dashboard" element={
          <ProtectedRoute><ProviderDashboard /></ProtectedRoute>
        } />
        <Route path="/provider/account" element={
          <ProtectedRoute><ProviderAccount /></ProtectedRoute>
        } />
        <Route path="/registrar-residencia" element={<RegisterProvider />} />
        <Route path="/registro-exitoso" element={<RegistroExitoso />} />
        <Route path="/provider/register" element={<RegisterProvider />} />
        <Route path="/mis-mascotas/nueva" element={
          <ProtectedRoute><PetSetup /></ProtectedRoute>
        } />
        <Route path="/mis-reservas" element={
          <ProtectedRoute><MyBookings /></ProtectedRoute>
        } />
        <Route path="/historial" element={
          <ProtectedRoute><ServiceHistory /></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute><AdminPanel /></ProtectedRoute>
        } />
        <Route path="/payment/success" element={<PaymentResult status="success" />} />
        <Route path="/payment/failure" element={<PaymentResult status="failure" />} />
        <Route path="/payment/pending" element={<PaymentResult status="pending" />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/terminos" element={<Terms />} />
        <Route path="/privacidad" element={<Privacy />} />
        <Route path="/seguridad" element={<Seguridad />} />
        <Route path="/hogares-sociales" element={<HogaresSociales />} />
      </Routes>
      {!hideNavbar && <Footer />}
      <Toaster position="top-right" richColors />
    </>
  );
}

function App() {
  return (
    <div className="App">
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <BrowserRouter basename={process.env.PUBLIC_URL || '/'}>
          <AppRouter />
          <CookieConsent />
        </BrowserRouter>
      </GoogleOAuthProvider>
    </div>
  );
}

export default App;
