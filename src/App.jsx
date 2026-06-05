import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';

import AuthCallback from '@/pages/AuthCallback';
import { supabase } from '@/lib/supabase';

import Navbar from '@/components/layout/Navbar';
import BottomNav from '@/components/layout/BottomNav';
import Footer from '@/components/layout/Footer';

import Home from '@/pages/Home';
import Search from '@/pages/Search';
import ProductDetail from '@/pages/ProductDetail';
import Cart from '@/pages/Cart';
import Auth from '@/pages/Auth';
import Favorites from '@/pages/Favorites';
import Boutiques from '@/pages/Boutiques';
import Compte from '@/pages/compte';
import Promotions from '@/pages/Promotions';

// Pages où on ne veut PAS afficher Navbar / Footer / BottomNav
const AUTH_PATHS = ['/connexion', '/inscription', '/auth/callback'];

function Loading() {
  return <div style={{ paddingTop: 80, textAlign: 'center' }}>Chargement...</div>;
}

// Garde : redirige vers /connexion si non connecté
function PrivateRoute({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();

    // Écouter les changements de session (ex : après Google OAuth)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (isLoading) return <Loading />;
  return isAuthenticated ? children : <Navigate to="/connexion" replace />;
}

// Layout principal avec affichage conditionnel
function AppLayout() {
  const location = useLocation();
  const isAuthPage = AUTH_PATHS.includes(location.pathname);

  return (
    <>
      {!isAuthPage && <Navbar />}

      <Routes>
        {/* La racine redirige vers /connexion — la page Auth gère la redirection si déjà connecté */}
        <Route path="/" element={<Navigate to="/connexion" replace />} />

        {/* Pages publiques (auth) */}
        <Route path="/connexion"     element={<Auth />} />
        <Route path="/inscription"   element={<Auth />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Pages protégées */}
        <Route path="/accueil"         element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/search"          element={<PrivateRoute><Search /></PrivateRoute>} />
        <Route path="/produit/:id"     element={<PrivateRoute><ProductDetail /></PrivateRoute>} />
        <Route path="/panier"          element={<PrivateRoute><Cart /></PrivateRoute>} />
        <Route path="/boutiques"       element={<PrivateRoute><Boutiques /></PrivateRoute>} />
        <Route path="/boutique/:slug"  element={<PrivateRoute><Boutiques /></PrivateRoute>} />
        <Route path="/promotions"      element={<PrivateRoute><Promotions /></PrivateRoute>} />
        <Route path="/favoris"         element={<PrivateRoute><Favorites /></PrivateRoute>} />
        <Route path="/compte"          element={<PrivateRoute><Compte /></PrivateRoute>} />
      </Routes>

      {!isAuthPage && <Footer />}
      {!isAuthPage && <BottomNav />}

      <Toaster
        position="bottom-center"
        toastOptions={{
          style: { fontFamily: 'DM Sans, sans-serif', fontSize: '14px', borderRadius: '12px' },
          success: { iconTheme: { primary: '#d4537e', secondary: '#fff' } },
        }}
      />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}