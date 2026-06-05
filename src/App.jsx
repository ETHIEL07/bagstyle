import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Suspense, lazy } from 'react'

import Navbar    from '@/components/layout/Navbar'
import BottomNav from '@/components/layout/BottomNav'
import Footer    from '@/components/layout/Footer'

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

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/"              element={<Home />} />
          <Route path="/search"        element={<Search />} />
          <Route path="/produit/:id"   element={<ProductDetail />} />
          <Route path="/panier"        element={<Cart />} />
          <Route path="/connexion"     element={<Auth />} />
          <Route path="/inscription"   element={<Auth />} />
          <Route path="/favoris"       element={<Favorites />} />
          <Route path="/boutiques"     element={<Boutiques />} />
          <Route path="/boutique/:slug" element={<Boutiques />} />
          <Route path="/compte"        element={<Compte />} />
          <Route path="/promotions"    element={<Promotions />} />
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
