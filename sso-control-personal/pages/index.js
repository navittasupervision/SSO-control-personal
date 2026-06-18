import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login');
    else if (isAdmin) router.replace('/dashboard');
    else router.replace('/captura');
  }, [loading, user, isAdmin, router]);

  return <div className="flex h-screen items-center justify-center text-ink/50">Cargando…</div>;
}
