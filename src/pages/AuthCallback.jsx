import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handle = async () => {
      try {
        // Supabase gère automatiquement le token dans l'URL hash/query
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Erreur session:', error);
          navigate('/connexion', { replace: true });
          return;
        }

        if (data?.session) {
          navigate('/accueil', { replace: true });
        } else {
          navigate('/connexion', { replace: true });
        }
      } catch (err) {
        console.error('Erreur AuthCallback:', err);
        navigate('/connexion', { replace: true });
      }
    };

    handle();
  }, [navigate]);

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '16px',
      backgroundColor: '#f8f9fa',
      color: '#333',
      fontFamily: 'DM Sans, sans-serif',
    }}>
      <div style={{
        width: 40,
        height: 40,
        border: '3px solid #d4537e',
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ fontSize: 16, color: '#666' }}>Connexion en cours...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}