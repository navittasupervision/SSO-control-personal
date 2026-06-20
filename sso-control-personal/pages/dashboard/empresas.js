import { useEffect, useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import Layout from '../../components/Layout';
import { ESPECIALIDADES_EMPRESA } from '../../lib/catalog';
import { listCompanies, createCompany, updateCompany, deleteCompany } from '../../lib/companies';

function EmpresasContent() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState(ESPECIALIDADES_EMPRESA[0]);
  const [saving, setSaving] = useState(false);

  const refresh = () => listCompanies().then(setCompanies).finally(() => setLoading(false));

  useEffect(() => {
    refresh();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await createCompany({ name: name.trim(), specialty, active: true });
      setName('');
      await refresh();
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (c) => {
    await updateCompany(c.id, { active: !c.active });
    refresh();
  };

  const handleDelete = async (c) => {
    if (!confirm(`¿Eliminar la empresa "${c.name}"? Esta acción no se puede deshacer.`)) return;
    await deleteCompany(c.id);
    refresh();
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-1">Empresas</h1>
      <p className="text-ink/50 text-sm mb-6">Agrega y administra las empresas/subcontratistas en obra.</p>

      <form onSubmit={handleCreate} className="bg-white rounded-card shadow-card p-5 flex flex-wrap gap-3 items-end mb-6">
        <div className="w-full sm:w-auto">
          <label className="block text-xs font-medium text-ink/60 mb-1">Nombre de la empresa</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Construcciones del Valle S.A."
            className="border rounded-card px-3 py-2 text-sm w-full sm:min-w-[16rem]"
          />
        </div>
        <div className="w-full sm:w-auto">
          <label className="block text-xs font-medium text-ink/60 mb-1">Especialidad</label>
          <select
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            className="border rounded-card px-3 py-2 text-sm w-full"
          >
            {ESPECIALIDADES_EMPRESA.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <button disabled={saving} className="bg-accent text-white px-4 py-2.5 rounded-card font-medium text-sm disabled:opacity-40 w-full sm:w-auto">
          {saving ? 'Agregando…' : '+ Agregar empresa'}
        </button>
      </form>

      <div className="bg-white rounded-card shadow-card overflow-x-auto">
        <table className="w-full text-sm min-w-[480px]">
          <thead className="bg-surface text-ink/60 text-left">
            <tr>
              <th className="px-4 py-2 font-medium">Empresa</th>
              <th className="px-4 py-2 font-medium">Especialidad</th>
              <th className="px-4 py-2 font-medium">Estado</th>
              <th className="px-4 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td className="px-4 py-4 text-ink/40" colSpan={4}>
                  Cargando…
                </td>
              </tr>
            )}
            {!loading && companies.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-ink/40" colSpan={4}>
                  Aún no hay empresas registradas.
                </td>
              </tr>
            )}
            {companies.map((c) => (
              <tr key={c.id} className="border-t">
                <td className="px-4 py-2.5 font-medium">{c.name}</td>
                <td className="px-4 py-2.5 text-ink/60">{c.specialty}</td>
                <td className="px-4 py-2.5">
                  <button
                    onClick={() => toggleActive(c)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      c.active !== false ? 'bg-success/10 text-success' : 'bg-ink/10 text-ink/50'
                    }`}
                  >
                    {c.active !== false ? 'Activa' : 'Inactiva'}
                  </button>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button onClick={() => handleDelete(c)} className="text-danger/70 hover:text-danger text-xs">
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

export default function Empresas() {
  return (
    <ProtectedRoute requireAdmin>
      <Layout>
        <EmpresasContent />
      </Layout>
    </ProtectedRoute>
  );
}
