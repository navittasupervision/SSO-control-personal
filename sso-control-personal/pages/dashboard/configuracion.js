import { useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import Layout from '../../components/Layout';
import { useTheme } from '../../context/ThemeContext';
import { DEFAULT_THEME } from '../../lib/theme';

const COLOR_FIELDS = [
  { key: 'colorPrimary', label: 'Color primario (sidebar, encabezados)' },
  { key: 'colorAccent', label: 'Color de acento (botones principales)' },
  { key: 'colorSuccess', label: 'Color de éxito / presente' },
  { key: 'colorWarning', label: 'Color de advertencia / permiso' },
  { key: 'colorDanger', label: 'Color de peligro / ausente' },
];

function ConfiguracionContent() {
  const { theme, updateTheme } = useTheme();
  const [form, setForm] = useState(theme);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  const handleChange = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateTheme(form);
      setSavedAt(new Date());
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => setForm(DEFAULT_THEME);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-1">Configuración</h1>
      <p className="text-ink/50 text-sm mb-6">Personaliza el nombre y los colores de la aplicación.</p>

      <div className="bg-white rounded-card shadow-card p-6 max-w-xl space-y-5">
        <div>
          <label className="block text-xs font-medium text-ink/60 mb-1">Nombre de la aplicación</label>
          <input
            value={form.appName}
            onChange={(e) => handleChange('appName', e.target.value)}
            className="border rounded-card px-3 py-2 text-sm w-full"
          />
        </div>

        {COLOR_FIELDS.map((f) => (
          <div key={f.key} className="flex items-center justify-between">
            <label className="text-sm">{f.label}</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form[f.key]}
                onChange={(e) => handleChange(f.key, e.target.value)}
                className="w-10 h-10 rounded border cursor-pointer"
              />
              <span className="text-xs text-ink/40 font-mono">{form[f.key]}</span>
            </div>
          </div>
        ))}

        <div className="flex items-center gap-3 pt-2">
          <button onClick={handleSave} disabled={saving} className="bg-accent text-white px-5 py-2.5 rounded-card font-medium text-sm disabled:opacity-40">
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
          <button onClick={handleReset} className="text-sm text-ink/50 hover:text-ink">
            Restaurar colores por defecto
          </button>
          {savedAt && <span className="text-sm text-success">Guardado a las {savedAt.toLocaleTimeString('es-GT')}</span>}
        </div>
      </div>

      <div className="mt-6 max-w-xl bg-white rounded-card shadow-card p-5 text-sm text-ink/60">
        <p className="font-medium text-ink mb-1">Vista previa</p>
        <div className="flex gap-2 mt-2">
          {COLOR_FIELDS.map((f) => (
            <div key={f.key} className="w-12 h-12 rounded-card" style={{ backgroundColor: form[f.key] }} title={f.label} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Configuracion() {
  return (
    <ProtectedRoute requireAdmin>
      <Layout>
        <ConfiguracionContent />
      </Layout>
    </ProtectedRoute>
  );
}
