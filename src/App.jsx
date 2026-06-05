import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Suspense, lazy, useEffect, useState } from 'react'

// Imports importants
import AuthCallback from '@/pages/AuthCallback'
import { supabase } from '@/lib/supabase'

import Navbar    from '@/components/layout/Navbar'
import BottomNav from '@/components/layout/BottomNav'
import Footer    from '@/components/layout/Footer'

// Lazy loading
const Home          = lazy(() => import('@/pages/Home'))
const Search        = lazy(() => import('@/pages/Search'))
const ProductDetail = lazy(() => import('@/pages/ProductDetail'))
const Cart          = lazy(() => import('@/pages/Cart'))
const Auth          = lazy(() => import('@/pages/Auth'))
const Favorites     = lazy(() => import('@/pages/Favorites'))
const Boutiques     = lazy(() => import('@/pages/Boutiques'))
const Compte        = lazy(() => import('@/pages/compte'))
const Promotions    = lazy(() => import('@/pages/Promotions'))

function Loading() {
  return <div style={{ paddingTop: 80 }}><div className="spinner" /></div>
}

// Redirection automatique : si pas connecté → page connexion
function HomeRedirect() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  if (isLoading) return <Loading />;
  
  // Si connecté → page d'accueil, sinon → connexion
  return isAuthenticated ? <Home /> : <Navigate to="/connexion" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          
          <Route path="/search"        element={<Search />} />
          <Route path="/produit/:id"   element={<ProductDetail />} />
          <Route path="/panier"        element={<Cart />} />
          <Route path="/boutiques"     element={<Boutiques />} />
          <Route path="/boutique/:slug" element={<Boutiques />} />
          <Route path="/promotions"    element={<Promotions />} />

          {/* Pages Auth */}
          <Route path="/connexion"     element={<Auth />} />
          <Route path="/inscription"   element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          <Route path="/favoris"       element={<Favorites />} />
          <Route path="/compte"        element={<Compte />} />
        </Routes>
      </Suspense>

      <Footer />
      <BottomNav />

      <Toaster
        position="bottom-center"
        toastOptions={{
          style: { fontFamily: 'DM Sans, sans-serif', fontSize: '14px', borderRadius: '12px' },
          success: { iconTheme: { primary: '#d4537e', secondary: '#fff' } },
        }}
      />
    </BrowserRouter>
  )
}