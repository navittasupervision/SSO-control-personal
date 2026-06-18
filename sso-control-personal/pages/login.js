import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { listMonitors } from '../lib/monitors';
import PinPad from '../components/PinPad';

export default function Login() {
  const { user, loginWithUsernamePin } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const [monitors, setMonitors] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingList, setLoadingList] = useState(true);

  useEffect(() => {
    if (user) router.replace('/');
  }, [user, router]);

  useEffect(() => {
    listMonitors()
      .then((list) => setMonitors(list.filter((m) => m.active !== false)))
      .catch((err) => console.error(err))
      .finally(() => setLoadingList(false));
  }, []);

  const handlePinSubmit = async (pin) => {
    setSubmitting(true);
    setError('');
    try {
      await loginWithUsernamePin(selected.username, pin);
      router.replace('/');
    } catch (err) {
      console.error(err);
      setError('PIN incorrecto. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ backgroundColor: 'var(--color-primary)' }}>
      <div className="bg-white rounded-card shadow-card w-full max-w-md p-8">
        <h1 className="font-display text-xl font-semibold text-center">{theme.appName}</h1>
        <p className="text-sm text-ink/50 text-center mt-1 mb-6">
          {selected ? `Ingresa el PIN de ${selected.name}` : 'Selecciona tu usuario para continuar'}
        </p>

        {!selected && (
          <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto">
            {loadingList && <p className="col-span-2 text-center text-sm text-ink/40">Cargando usuarios…</p>}
            {!loadingList && monitors.length === 0 && (
              <p className="col-span-2 text-center text-sm text-ink/40">
                Aún no hay usuarios creados.{' '}
                <a href="/setup-inicial" className="text-primary underline">
                  Crear el primer administrador
                </a>
              </p>
            )}
            {monitors.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setSelected(m);
                  setError('');
                }}
                className="border rounded-card py-4 px-2 text-sm font-medium hover:border-primary hover:bg-surface transition text-center"
              >
                {m.name}
              </button>
            ))}
          </div>
        )}

        {selected && (
          <div className="flex flex-col items-center gap-4">
            <PinPad onSubmit={handlePinSubmit} submitting={submitting} error={error} />
            <button onClick={() => setSelected(null)} className="text-sm text-ink/50 hover:text-ink">
              ← Elegir otro usuario
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
