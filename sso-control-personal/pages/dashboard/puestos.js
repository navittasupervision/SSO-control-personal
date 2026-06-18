import { useEffect, useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import Layout from '../../components/Layout';
import { listPositions, createPosition, updatePosition, deletePosition, seedDefaultPositions } from '../../lib/positions';

function PuestosContent() {
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nombre, setNombre] = useState('');
  const [categoria, setCategoria] = useState('');
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const refresh = () => listPositions().then(setPositions).finally(() => setLoading(false));

  useEffect(() => {
    refresh();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    setSaving(true);
    try {
      await createPosition({ nombre: nombre.trim(), categoria: categoria.trim() || 'Otros' });
      setNombre('');
      setCategoria('');
      await refresh();
    } finally {
      setSaving(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await seedDefaultPositions();
      if (res.skipped) alert('El catálogo ya tiene puestos cargados; no se duplicó nada.');
      await refresh();
    } finally {
      setSeeding(false);
    }
  };

  const handleDelete = async (p) => {
    if (!confirm(`¿Eliminar el puesto "${p.nombre}"?`)) return;
    await deletePosition(p.id);
    refresh();
  };

  const grouped = positions.reduce((acc, p) => {
    acc[p.categoria] = acc[p.categoria] || [];
    acc[p.categoria].push(p);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex flex-wrap justify-between items-end gap-3 mb-1">
        <h1 className="font-display text-2xl font-semibold">Catálogo de puestos</h1>
        {positions.length === 0 && !loading && (
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="text-sm text-primary border border-primary rounded-card px-3 py-1.5 disabled:opacity-40"
          >
            {seeding ? 'Cargando…' : 'Cargar catálogo sugerido'}
          </button>
        )}
      </div>
      <p className="text-ink/50 text-sm mb-6">Estos son los puestos disponibles al capturar el personal diario.</p>

      <form onSubmit={handleCreate} className="bg-white rounded-card shadow-card p-5 flex flex-wrap gap-3 items-end mb-6">
        <div>
          <label className="block text-xs font-medium text-ink/60 mb-1">Nombre del puesto</label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="border rounded-card px-3 py-2 text-sm min-w-[14rem]"
            placeholder="Ej. Ayudante de Topografía"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink/60 mb-1">Categoría</label>
          <input
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="border rounded-card px-3 py-2 text-sm min-w-[12rem]"
            placeholder="Ej. Topografía y Control de Calidad"
          />
        </div>
        <button disabled={saving} className="bg-accent text-white px-4 py-2.5 rounded-card font-medium text-sm disabled:opacity-40">
          {saving ? 'Agregando…' : '+ Agregar puesto'}
        </button>
      </form>

      {loading && <p className="text-ink/40">Cargando…</p>}

      {!loading && positions.length === 0 && (
        <p className="text-ink/40">No hay puestos cargados todavía. Usa el botón &quot;Cargar catálogo sugerido&quot; arriba.</p>
      )}

      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat} className="bg-white rounded-card shadow-card p-5 mb-4">
          <h2 className="font-medium text-sm text-ink/60 mb-3">{cat}</h2>
          <div className="flex flex-wrap gap-2">
            {items.map((p) => (
              <span key={p.id} className="inline-flex items-center gap-2 bg-surface px-3 py-1.5 rounded-full text-sm">
                {p.nombre}
                <button onClick={() => handleDelete(p)} className="text-ink/30 hover:text-danger">
                  ✕
                </button>
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Puestos() {
  return (
    <ProtectedRoute requireAdmin>
      <Layout>
        <PuestosContent />
      </Layout>
    </ProtectedRoute>
  );
}
