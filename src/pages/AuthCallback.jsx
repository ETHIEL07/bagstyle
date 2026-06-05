import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Callback error:', error);
          toast.error("Erreur de connexion");
          navigate('/connexion');
          return;
        }

        if (data?.session) {
          toast.success('Connexion réussie ! 🎉');
          navigate('/');           // ou '/compte' selon ton app
        } else {
          toast.error("Aucune session trouvée");
          navigate('/connexion');
        }
      } catch (err) {
        console.error(err);
        toast.error("Une erreur est survenue");
        navigate('/connexion');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '18px',
      color: '#666'
    }}>
      Connexion en cours... Veuillez patienter.
    </div>
  );
}