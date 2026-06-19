import { useEffect, useState, useCallback } from 'react';
import { ESTADOS_PERSONAL } from '../lib/catalog';
import { getDailyRecord, saveDailyRecord } from '../lib/records';
import { listPersonnelByCompany, createPersonnel, updatePersonnel } from '../lib/personnel';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function PersonnelDailyForm({ companies, positions, monitorId, monitorName }) {
  const [companyId, setCompanyId] = useState(companies[0]?.id || '');
  const [date, setDate] = useState(todayStr());
  const [rows, setRows] = useState([]); // [{ workerId, name, position, status }]
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  const [showAddWorker, setShowAddWorker] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPosition, setNewPosition] = useState('');
  const [addingWorker, setAddingWorker] = useState(false);

  const loadData = useCallback(async () => {
    if (!companyId || !date) return;
    setLoading(true);
    setSavedAt(null);
    try {
      const [roster, existing] = await Promise.all([
        listPersonnelByCompany(companyId),
        getDailyRecord(companyId, date),
      ]);
      const activeRoster = roster.filter((w) => w.active !== false);
      const existingByWorkerId = {};
      (existing?.entries || []).forEach((e) => {
        if (e.workerId) existingByWorkerId[e.workerId] = e.status;
      });
      const builtRows = activeRoster.map((w) => ({
        workerId: w.id,
        name: w.name,
        position: w.position,
        status: existingByWorkerId[w.id] || 'presente',
      }));
      setRows(builtRows);
    } finally {
      setLoading(false);
    }
  }, [companyId, date]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateStatus = (workerId, status) => {
    setRows((rs) => rs.map((r) => (r.workerId === workerId ? { ...r, status } : r)));
  };

  const handleDeactivate = async (workerId, name) => {
    if (!confirm(`¿Dar de baja a "${name}" de la lista de esta empresa? Ya no aparecerá en la captura diaria.`)) return;
    await updatePersonnel(workerId, { active: false });
    setRows((rs) => rs.filter((r) => r.workerId !== workerId));
  };

  const handleAddWorker = async () => {
    if (!newName.trim()) return;
    setAddingWorker(true);
    try {
      const created = await createPersonnel({ name: newName.trim(), position: newPosition, companyId });
      setRows((rs) =>
        [...rs, { workerId: created.id, name: created.name, position: created.position, status: 'presente' }].sort(
          (a, b) => a.name.localeCompare(b.name)
        )
      );
      setNewName('');
      setNewPosition('');
      setShowAddWorker(false);
    } finally {
      setAddingWorker(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const company = companies.find((c) => c.id === companyId);
      const entries = rows.map(({ workerId, name, position, status }) => ({ workerId, name, position, status }));
      await saveDailyRecord({
        companyId,
        companyName: company?.name || '',
        date,
        entries,
        monitorId,
        monitorName,
      });
      setSavedAt(new Date());
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-ink/60 mb-1">Empresa</label>
          <select
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            className="border rounded-card px-3 py-2 text-sm min-w-[14rem]"
          >
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-ink/60 mb-1">Fecha</label>
          <input
            type="date"
            value={date}
            max={todayStr()}
            onChange={(e) => setDate(e.target.value)}
            className="border rounded-card px-3 py-2 text-sm"
          />
        </div>
        {loading && <span className="text-sm text-ink/40">Cargando lista de trabajadores…</span>}
      </div>

      {!loading && rows.length === 0 && (
        <p className="text-ink/50 text-sm">
          Esta empresa todavía no tiene trabajadores registrados. Agrega el primero abajo.
        </p>
      )}

      {rows.length > 0 && (
        <div className="bg-white rounded-card shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface text-ink/60 text-left">
              <tr>
                <th className="px-4 py-2 font-medium">Nombre</th>
                <th className="px-4 py-2 font-medium">Puesto</th>
                <th className="px-4 py-2 font-medium">Estado</th>
                <th className="px-2 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.workerId} className="border-t">
                  <td className="px-4 py-2 font-medium">{row.name}</td>
                  <td className="px-4 py-2 text-ink/60">{row.position}</td>
                  <td className="px-4 py-2">
                    <select
                      value={row.status}
                      onChange={(e) => updateStatus(row.workerId, e.target.value)}
                      className="border-0 focus:ring-1 focus:ring-primary rounded px-2 py-1 bg-surface/60"
                    >
                      {ESTADOS_PERSONAL.map((e) => (
                        <option key={e.valor} value={e.valor}>
                          {e.etiqueta}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2 text-center">
                    <button
                      onClick={() => handleDeactivate(row.workerId, row.name)}
                      title="Dar de baja de la lista"
                      className="text-ink/30 hover:text-danger text-xs"
                    >
                      Dar de baja
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Agregar trabajador nuevo al padrón de esta empresa */}
      <div className="bg-white rounded-card shadow-card p-4">
        {!showAddWorker ? (
          <button onClick={() => setShowAddWorker(true)} className="text-sm text-primary font-medium">
            + Agregar trabajador nuevo a esta empresa
          </button>
        ) : (
          <div className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-ink/60 mb-1">Nombre completo</label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="border rounded-card px-3 py-2 text-sm min-w-[14rem]"
                placeholder="Ej. Juan Pérez"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink/60 mb-1">Puesto</label>
              <select
                value={newPosition}
                onChange={(e) => setNewPosition(e.target.value)}
                className="border rounded-card px-3 py-2 text-sm"
              >
                <option value="">Selecciona…</option>
                {positions.map((p) => (
                  <option key={p.id} value={p.nombre}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleAddWorker}
              disabled={addingWorker || !newName.trim()}
              className="bg-accent text-white px-4 py-2.5 rounded-card font-medium text-sm disabled:opacity-40"
            >
              {addingWorker ? 'Agregando…' : '+ Agregar a la lista'}
            </button>
            <button onClick={() => setShowAddWorker(false)} className="text-sm text-ink/50">
              Cancelar
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving || !companyId || rows.length === 0}
          className="bg-accent text-white px-5 py-2.5 rounded-card font-medium disabled:opacity-40"
        >
          {saving ? 'Guardando…' : 'Guardar registro del día'}
        </button>
        {savedAt && <span className="text-sm text-success">Guardado a las {savedAt.toLocaleTimeString('es-GT')}</span>}
      </div>
    </div>
  );
}
