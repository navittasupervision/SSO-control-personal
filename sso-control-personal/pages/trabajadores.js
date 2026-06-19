import { useEffect, useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import Layout from '../../components/Layout';
import { listCompanies } from '../../lib/companies';
import { listAllPersonnel, createPersonnel, updatePersonnel, deletePersonnel } from '../../lib/personnel';
import { listPositions } from '../../lib/positions';

function TrabajadoresContent() {
  const [companies, setCompanies] = useState([]);
  const [positions, setPositions] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companyFilter, setCompanyFilter] = useState('all');

  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [saving, setSaving] = useState(false);

  const refresh = () =>
    Promise.all([listCompanies(), listPositions(), listAllPersonnel()]).then(([c, p, w]) => {
      setCompanies(c);
      setPositions(p);
      setWorkers(w);
      if (!companyId && c.length) setCompanyId(c[0].id);
      setLoading(false);
    });

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim() || !companyId) return;
    setSaving(true);
    try {
      await createPersonnel({ name: name.trim(), position, companyId, active: true });
      setName('');
      setPosition('');
      await refresh();
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (w) => {
    await updatePersonnel(w.id, { active: !w.active });
    refresh();
  };

  const handleDelete = async (w) => {
    if (!confirm(`¿Eliminar a "${w.name}" del padrón? Esta acción no se puede deshacer.`)) return;
    await deletePersonnel(w.id);
    refresh();
  };

  const companyName = (id) => companies.find((c) => c.id === id)?.name || '—';

  const filteredWorkers = companyFilter === 'all' ? workers : workers.filter((w) => w.companyId === companyFilter);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-1">Trabajadores</h1>
      <p className="text-ink/50 text-sm mb-6">
        Padrón de personal por empresa. Se registra una sola vez aquí; en la captura diaria los monitores solo
        actualizan el estado de cada uno.
      </p>

      <form onSubmit={handleCreate} className="bg-white rounded-card shadow-card p-5 flex flex-wrap gap-3 items-end mb-6">
        <div>
          <label className="block text-xs font-medium text-ink/60 mb-1">Nombre completo</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border rounded-card px-3 py-2 text-sm min-w-[14rem]"
            placeholder="Ej. Juan Pérez"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink/60 mb-1">Puesto</label>
          <select value={position} onChange={(e) => setPosition(e.target.value)} className="border rounded-card px-3 py-2 text-sm">
            <option value="">Selecciona…</option>
            {positions.map((p) => (
              <option key={p.id} value={p.nombre}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-ink/60 mb-1">Empresa</label>
          <select value={companyId} onChange={(e) => setCompanyId(e.target.value)} className="border rounded-card px-3 py-2 text-sm">
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <button disabled={saving} className="bg-accent text-white px-4 py-2.5 rounded-card font-medium text-sm disabled:opacity-40">
          {saving ? 'Agregando…' : '+ Agregar trabajador'}
        </button>
      </form>

      <div className="flex items-center justify-between mb-3">
        <select value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)} className="border rounded-card px-3 py-2 text-sm">
          <option value="all">Todas las empresas</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <span className="text-sm text-ink/50">{filteredWorkers.length} trabajador(es)</span>
      </div>

      <div className="bg-white rounded-card shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-ink/60 text-left">
            <tr>
              <th className="px-4 py-2 font-medium">Nombre</th>
              <th className="px-4 py-2 font-medium">Puesto</th>
              <th className="px-4 py-2 font-medium">Empresa</th>
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
            {!loading && filteredWorkers.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-ink/40" colSpan={5}>
                  No hay trabajadores registrados todavía.
                </td>
              </tr>
            )}
            {filteredWorkers.map((w) => (
              <tr key={w.id} className="border-t">
                <td className="px-4 py-2.5 font-medium">{w.name}</td>
                <td className="px-4 py-2.5 text-ink/60">{w.position}</td>
                <td className="px-4 py-2.5 text-ink/60">{companyName(w.companyId)}</td>
                <td className="px-4 py-2.5">
                  <button
                    onClick={() => toggleActive(w)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      w.active !== false ? 'bg-success/10 text-success' : 'bg-ink/10 text-ink/50'
                    }`}
                  >
                    {w.active !== false ? 'Activo' : 'De baja'}
                  </button>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button onClick={() => handleDelete(w)} className="text-danger/70 hover:text-danger text-xs">
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

export default function Trabajadores() {
  return (
    <ProtectedRoute requireAdmin>
      <Layout>
        <TrabajadoresContent />
      </Layout>
    </ProtectedRoute>
  );
}
