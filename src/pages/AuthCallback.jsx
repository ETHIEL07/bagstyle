import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    console.log("🔥 AuthCallback démarré");

    const handle = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        console.log("📌 Session récupérée :", data);

        if (error) {
          console.error("Erreur session:", error);
          window.location.href = '/connexion';
          return;
        }

        if (data?.session) {
          console.log("✅ Connexion réussie");
          window.location.href = '/';
        } else {
          console.log("❌ Pas de session");
          window.location.href = '/connexion';
        }
      } catch (err) {
        console.error("💥 Erreur grave:", err);
        window.location.href = '/connexion';
      }
    };

    handle();
  }, []);

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "22px",
      backgroundColor: "#f8f9fa",
      color: "#333"
    }}>
      Connexion en cours...
    </div>
  );
}