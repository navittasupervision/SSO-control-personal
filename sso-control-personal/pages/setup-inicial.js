import { useState } from 'react';
import { useRouter } from 'next/router';
import { createMonitor } from '../lib/monitors';
import { isValidPin } from '../lib/auth';

export default function SetupInicial() {
  const router = useRouter();
  const [setupKey, setSetupKey] = useState('');
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (setupKey !== process.env.NEXT_PUBLIC_SETUP_KEY) {
      setError('Clave de configuración incorrecta.');
      return;
    }
    if (!name.trim()) {
      setError('Escribe el nombre del administrador.');
      return;
    }
    if (!isValidPin(pin)) {
      setError('El PIN debe tener entre 4 y 6 dígitos numéricos.');
      return;
    }

    setSubmitting(true);
    try {
      await createMonitor({ name: name.trim(), pin, role: 'admin', companyIds: [], active: true });
      setSuccess(true);
      setTimeout(() => router.replace('/login'), 2000);
    } catch (err) {
      console.error(err);
      setError('No se pudo crear el administrador. Revisa la consola para más detalles.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary p-6">
      <form onSubmit={handleSubmit} className="bg-white rounded-card shadow-card w-full max-w-sm p-8 space-y-4">
        <h1 className="font-display text-lg font-semibold">Configuración inicial</h1>
        <p className="text-sm text-ink/50">
          Crea la cuenta del primer administrador. Esta página solo debe usarse una vez.
        </p>

        {success ? (
          <p className="text-success text-sm">¡Administrador creado! Redirigiendo al login…</p>
        ) : (
          <>
            <div>
              <label className="block text-xs font-medium text-ink/60 mb-1">Clave de configuración</label>
              <input
                type="password"
                value={setupKey}
                onChange={(e) => setSetupKey(e.target.value)}
                className="w-full border rounded-card px-3 py-2 text-sm"
                placeholder="NEXT_PUBLIC_SETUP_KEY"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink/60 mb-1">Nombre del administrador</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border rounded-card px-3 py-2 text-sm"
                placeholder="Ej. María López"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink/60 mb-1">PIN (4 a 6 dígitos)</label>
              <input
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                inputMode="numeric"
                className="w-full border rounded-card px-3 py-2 text-sm"
                placeholder="••••"
              />
            </div>
            {error && <p className="text-danger text-sm">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-accent text-white py-2.5 rounded-card font-medium disabled:opacity-40"
            >
              {submitting ? 'Creando…' : 'Crear administrador'}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
