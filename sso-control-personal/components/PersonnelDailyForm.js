import { useEffect, useState, useCallback } from 'react';
import { ESTADOS_PERSONAL } from '../lib/catalog';
import { getDailyRecord, saveDailyRecord } from '../lib/records';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function emptyRow() {
  return { id: crypto.randomUUID(), name: '', position: '', status: 'presente', notes: '' };
}

export default function PersonnelDailyForm({ companies, positions, monitorId, monitorName }) {
  const [companyId, setCompanyId] = useState(companies[0]?.id || '');
  const [date, setDate] = useState(todayStr());
  const [rows, setRows] = useState([emptyRow()]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);

  const loadExisting = useCallback(async () => {
    if (!companyId || !date) return;
    setLoading(true);
    setSavedAt(null);
    try {
      const existing = await getDailyRecord(companyId, date);
      if (existing && existing.entries?.length) {
        setRows(existing.entries.map((e) => ({ id: crypto.randomUUID(), ...e })));
      } else {
        setRows([emptyRow()]);
      }
    } finally {
      setLoading(false);
    }
  }, [companyId, date]);

  useEffect(() => {
    loadExisting();
  }, [loadExisting]);

  const updateRow = (id, field, value) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const addRow = () => setRows((rs) => [...rs, emptyRow()]);
  const removeRow = (id) => setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.id !== id) : rs));

  const handleSave = async () => {
    setSaving(true);
    try {
      const company = companies.find((c) => c.id === companyId);
      const entries = rows
        .filter((r) => r.name.trim())
        .map(({ name, position, status, notes }) => ({ name: name.trim(), position, status, notes: notes || '' }));
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
        {loading && <span className="text-sm text-ink/40">Cargando registro…</span>}
      </div>

      <div className="bg-white rounded-card shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-ink/60 text-left">
            <tr>
              <th className="px-4 py-2 font-medium">Nombre</th>
              <th className="px-4 py-2 font-medium">Puesto</th>
              <th className="px-4 py-2 font-medium">Estado</th>
              <th className="px-4 py-2 font-medium">Notas</th>
              <th className="px-2 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t">
                <td className="px-4 py-2">
                  <input
                    value={row.name}
                    onChange={(e) => updateRow(row.id, 'name', e.target.value)}
                    placeholder="Nombre completo"
                    className="w-full border-0 focus:ring-1 focus:ring-primary rounded px-2 py-1 bg-surface/60"
                  />
                </td>
                <td className="px-4 py-2">
                  <select
                    value={row.position}
                    onChange={(e) => updateRow(row.id, 'position', e.target.value)}
                    className="w-full border-0 focus:ring-1 focus:ring-primary rounded px-2 py-1 bg-surface/60"
                  >
                    <option value="">Selecciona…</option>
                    {positions.map((p) => (
                      <option key={p.id} value={p.nombre}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2">
                  <select
                    value={row.status}
                    onChange={(e) => updateRow(row.id, 'status', e.target.value)}
                    className="w-full border-0 focus:ring-1 focus:ring-primary rounded px-2 py-1 bg-surface/60"
                  >
                    {ESTADOS_PERSONAL.map((e) => (
                      <option key={e.valor} value={e.valor}>
                        {e.etiqueta}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-2">
                  <input
                    value={row.notes}
                    onChange={(e) => updateRow(row.id, 'notes', e.target.value)}
                    placeholder="Opcional"
                    className="w-full border-0 focus:ring-1 focus:ring-primary rounded px-2 py-1 bg-surface/60"
                  />
                </td>
                <td className="px-2 py-2 text-center">
                  <button onClick={() => removeRow(row.id)} className="text-ink/30 hover:text-danger">
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={addRow} className="w-full text-sm text-primary font-medium py-3 hover:bg-surface border-t">
          + Agregar persona
        </button>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving || !companyId}
          className="bg-accent text-white px-5 py-2.5 rounded-card font-medium disabled:opacity-40"
        >
          {saving ? 'Guardando…' : 'Guardar registro del día'}
        </button>
        {savedAt && <span className="text-sm text-success">Guardado a las {savedAt.toLocaleTimeString('es-GT')}</span>}
      </div>
    </div>
  );
}
