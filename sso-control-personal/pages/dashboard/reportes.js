import { useEffect, useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import Layout from '../../components/Layout';
import StatusBadge from '../../components/StatusBadge';
import PdfReportButton from '../../components/PdfReportButton';
import { useTheme } from '../../context/ThemeContext';
import { listCompanies } from '../../lib/companies';
import { listRecordsByCompanyAndRange } from '../../lib/records';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoStr(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function ReportesContent() {
  const { theme } = useTheme();
  const [companies, setCompanies] = useState([]);
  const [companyId, setCompanyId] = useState('');
  const [startDate, setStartDate] = useState(daysAgoStr(6));
  const [endDate, setEndDate] = useState(todayStr());
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    listCompanies().then((list) => {
      setCompanies(list);
      if (list.length) setCompanyId(list[0].id);
    });
  }, []);

  const handleSearch = async () => {
    if (!companyId) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await listRecordsByCompanyAndRange(companyId, startDate, endDate);
      setRecords(data);
    } finally {
      setLoading(false);
    }
  };

  const companyName = companies.find((c) => c.id === companyId)?.name || '';

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-1">Reportes</h1>
      <p className="text-ink/50 text-sm mb-6">Consulta el historial por empresa y período, y descarga el PDF.</p>

      <div className="bg-white rounded-card shadow-card p-5 flex flex-wrap gap-3 items-end mb-6">
        <div>
          <label className="block text-xs font-medium text-ink/60 mb-1">Empresa</label>
          <select value={companyId} onChange={(e) => setCompanyId(e.target.value)} className="border rounded-card px-3 py-2 text-sm min-w-[14rem]">
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-ink/60 mb-1">Desde</label>
          <input type="date" value={startDate} max={endDate} onChange={(e) => setStartDate(e.target.value)} className="border rounded-card px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink/60 mb-1">Hasta</label>
          <input type="date" value={endDate} max={todayStr()} onChange={(e) => setEndDate(e.target.value)} className="border rounded-card px-3 py-2 text-sm" />
        </div>
        <button onClick={handleSearch} disabled={loading || !companyId} className="bg-primary text-white px-4 py-2.5 rounded-card font-medium text-sm disabled:opacity-40">
          {loading ? 'Buscando…' : 'Buscar'}
        </button>
        <PdfReportButton companyName={companyName} startDate={startDate} endDate={endDate} records={records} theme={theme} />
      </div>

      {!searched && <p className="text-ink/40">Elige una empresa y un período, luego presiona &quot;Buscar&quot;.</p>}

      {searched && !loading && records.length === 0 && <p className="text-ink/40">No hay registros en ese período.</p>}

      {records.map((r) => (
        <div key={r.id} className="bg-white rounded-card shadow-card p-5 mb-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-medium">{r.date}</h2>
            <span className="text-xs text-ink/50">
              Total: {r.totals?.total ?? r.entries?.length ?? 0} · Presente: {r.totals?.presente ?? 0} · Ausente: {r.totals?.ausente ?? 0}
            </span>
          </div>
          <table className="w-full text-sm">
            <thead className="text-ink/50 text-left">
              <tr>
                <th className="py-1 font-medium">Nombre</th>
                <th className="py-1 font-medium">Puesto</th>
                <th className="py-1 font-medium">Estado</th>
                <th className="py-1 font-medium">Notas</th>
              </tr>
            </thead>
            <tbody>
              {(r.entries || []).map((e, idx) => (
                <tr key={idx} className="border-t">
                  <td className="py-1.5">{e.name}</td>
                  <td className="py-1.5 text-ink/60">{e.position}</td>
                  <td className="py-1.5">
                    <StatusBadge status={e.status} />
                  </td>
                  <td className="py-1.5 text-ink/50">{e.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default function Reportes() {
  return (
    <ProtectedRoute requireAdmin>
      <Layout>
        <ReportesContent />
      </Layout>
    </ProtectedRoute>
  );
}
