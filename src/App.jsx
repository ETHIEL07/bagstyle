import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect, useState } from 'react'

// Imports importants
import AuthCallback from '@/pages/AuthCallback'
import { supabase } from '@/lib/supabase'

import Navbar    from '@/components/layout/Navbar'
import BottomNav from '@/components/layout/BottomNav'
import Footer    from '@/components/layout/Footer'

// Import normal de toutes les pages (plus stable)
import Home          from '@/pages/Home'
import Search        from '@/pages/Search'
import ProductDetail from '@/pages/ProductDetail'
import Cart          from '@/pages/Cart'
import Auth          from '@/pages/Auth'
import Favorites     from '@/pages/Favorites'
import Boutiques     from '@/pages/Boutiques'
import Compte        from '@/pages/compte'
import Promotions    from '@/pages/Promotions'

function Loading() {
  return <div style={{ paddingTop: 80, textAlign: 'center' }}>Chargement...</div>
}

// Redirection : si pas connecté → /connexion
function HomeRedirect() {
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
  }, []);

  if (isLoading) return <Loading />;
  
  return isAuthenticated ? <Home /> : <Navigate to="/connexion" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        
        <Route path="/search"        element={<Search />} />
        <Route path="/produit/:id"   element={<ProductDetail />} />
        <Route path="/panier"        element={<Cart />} />
        <Route path="/boutiques"     element={<Boutiques />} />
        <Route path="/boutique/:slug" element={<Boutiques />} />
        <Route path="/promotions"    element={<Promotions />} />

        {/* Auth */}
        <Route path="/connexion"     element={<Auth />} />
        <Route path="/inscription"   element={<Auth />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        <Route path="/favoris"       element={<Favorites />} />
        <Route path="/compte"        element={<Compte />} />
      </Routes>

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