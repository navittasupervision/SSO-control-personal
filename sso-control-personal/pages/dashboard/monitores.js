import { useEffect, useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import Layout from '../../components/Layout';
import { listCompanies } from '../../lib/companies';
import { listMonitors, createMonitor, updateMonitor, deleteMonitor } from '../../lib/monitors';
import { isValidPin } from '../../lib/auth';

function MonitoresContent() {
  const [companies, setCompanies] = useState([]);
  const [monitors, setMonitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [role, setRole] = useState('monitor');
  const [companyIds, setCompanyIds] = useState([]);

  const refresh = () =>
    Promise.all([listCompanies(), listMonitors()]).then(([c, m]) => {
      setCompanies(c);
      setMonitors(m);
      setLoading(false);
    });

  useEffect(() => {
    refresh();
  }, []);

  const toggleCompanyId = (id) => {
    setCompanyIds((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Escribe el nombre completo.');
      return;
    }
    if (!isValidPin(pin)) {
      setError('El PIN debe tener entre 4 y 6 dígitos numéricos.');
      return;
    }
    setSaving(true);
    try {
      const created = await createMonitor({ name: name.trim(), pin, role, companyIds, active: true });
      setName('');
      setPin('');
      setRole('monitor');
      setCompanyIds([]);
      await refresh();
      alert(`Usuario creado. Nombre de usuario interno: ${created.username} (no necesita escribirlo, solo aparece en la lista de login).`);
    } catch (err) {
      console.error(err);
      setError('No se pudo crear el usuario. ' + (err?.message || ''));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (m) => {
    await updateMonitor(m.id, { active: !m.active });
    refresh();
  };

  const handleDelete = async (m) => {
    if (!confirm(`¿Eliminar a "${m.name}" del sistema?`)) return;
    await deleteMonitor(m.id);
    refresh();
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-1">Monitores SSO</h1>
      <p className="text-ink/50 text-sm mb-6">Crea usuarios, asígnales un PIN de acceso y las empresas que les corresponde capturar.</p>

      <form onSubmit={handleCreate} className="bg-white rounded-card shadow-card p-5 space-y-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <div>
            <label className="block text-xs font-medium text-ink/60 mb-1">Nombre completo</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border rounded-card px-3 py-2 text-sm min-w-[14rem]"
              placeholder="Ej. Carlos Méndez"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink/60 mb-1">PIN (4 a 6 dígitos)</label>
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              inputMode="numeric"
              className="border rounded-card px-3 py-2 text-sm w-32"
              placeholder="••••"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink/60 mb-1">Rol</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="border rounded-card px-3 py-2 text-sm">
              <option value="monitor">Monitor SSO</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
        </div>

        {role === 'monitor' && (
          <div>
            <label className="block text-xs font-medium text-ink/60 mb-2">Empresas asignadas</label>
            <div className="flex flex-wrap gap-2">
              {companies.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => toggleCompanyId(c.id)}
                  className={`px-3 py-1.5 rounded-full text-xs border ${
                    companyIds.includes(c.id) ? 'bg-primary text-white border-primary' : 'border-ink/20 text-ink/60'
                  }`}
                >
                  {c.name}
                </button>
              ))}
              {companies.length === 0 && <p className="text-xs text-ink/40">Primero agrega empresas en la sección Empresas.</p>}
            </div>
          </div>
        )}

        {error && <p className="text-danger text-sm">{error}</p>}

        <button disabled={saving} className="bg-accent text-white px-4 py-2.5 rounded-card font-medium text-sm disabled:opacity-40">
          {saving ? 'Creando…' : '+ Crear usuario'}
        </button>
      </form>

      <div className="bg-white rounded-card shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-ink/60 text-left">
            <tr>
              <th className="px-4 py-2 font-medium">Nombre</th>
              <th className="px-4 py-2 font-medium">Rol</th>
              <th className="px-4 py-2 font-medium">Empresas</th>
              <th className="px-4 py-2 font-medium">Estado</th>
              <th className="px-4 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-4 py-4 text-ink/40" colSpan={5}>
                  Cargando…
                </td>
              </tr>
            )}
            {monitors.map((m) => (
              <tr key={m.id} className="border-t">
                <td className="px-4 py-2.5 font-medium">{m.name}</td>
                <td className="px-4 py-2.5 text-ink/60">{m.role === 'admin' ? 'Administrador' : 'Monitor SSO'}</td>
                <td className="px-4 py-2.5 text-ink/60 text-xs">
                  {m.role === 'admin'
                    ? 'Todas'
                    : (m.companyIds || [])
                        .map((id) => companies.find((c) => c.id === id)?.name)
                        .filter(Boolean)
                        .join(', ') || '—'}
                </td>
                <td className="px-4 py-2.5">
                  <button
                    onClick={() => toggleActive(m)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      m.active !== false ? 'bg-success/10 text-success' : 'bg-ink/10 text-ink/50'
                    }`}
                  >
                    {m.active !== false ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button onClick={() => handleDelete(m)} className="text-danger/70 hover:text-danger text-xs">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function Monitores() {
  return (
    <ProtectedRoute requireAdmin>
      <Layout>
        <MonitoresContent />
      </Layout>
    </ProtectedRoute>
  );
}
