import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("✅ AuthCallback chargé"); // Pour debug

    const handleCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        console.log("Session data:", data); // Pour debug

        if (error) throw error;

        if (data?.session) {
          window.location.href = '/';   // Redirection forcée simple
        } else {
          window.location.href = '/connexion';
        }
      } catch (err) {
        console.error("Callback error:", err);
        window.location.href = '/connexion';
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      background: '#f8f9fa'
    }}>
      Connexion en cours... Merci de patienter.
    </div>
  );
}