import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, profile, loading, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (requireAdmin && !isAdmin) {
      router.replace('/captura');
    }
  }, [loading, user, isAdmin, requireAdmin, router]);

  if (loading || !user || (requireAdmin && !isAdmin)) {
    return (
      <div className="flex h-screen items-center justify-center text-ink/60 font-body">
        Cargando…
      </div>
    );
  }

  return children;
}
