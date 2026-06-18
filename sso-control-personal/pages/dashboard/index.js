import { useEffect, useMemo, useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import Layout from '../../components/Layout';
import StatCard from '../../components/StatCard';
import PersonnelBarChart from '../../components/charts/PersonnelBarChart';
import PersonnelTrendChart from '../../components/charts/PersonnelTrendChart';
import PersonnelPieChart from '../../components/charts/PersonnelPieChart';
import { useTheme } from '../../context/ThemeContext';
import { listCompanies } from '../../lib/companies';
import { listRecordsByDate, listRecordsByRange } from '../../lib/records';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoStr(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function DashboardContent() {
  const { theme } = useTheme();
  const [companies, setCompanies] = useState([]);
  const [companyFilter, setCompanyFilter] = useState('all');
  const [date, setDate] = useState(todayStr());
  const [recordsToday, setRecordsToday] = useState([]);
  const [recordsRange, setRecordsRange] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listCompanies().then(setCompanies);
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([listRecordsByDate(date), listRecordsByRange(daysAgoStr(13), date)])
      .then(([byDate, byRange]) => {
        setRecordsToday(byDate);
        setRecordsRange(byRange);
      })
      .finally(() => setLoading(false));
  }, [date]);

  const filteredToday = useMemo(
    () => (companyFilter === 'all' ? recordsToday : recordsToday.filter((r) => r.companyId === companyFilter)),
    [recordsToday, companyFilter]
  );

  const filteredRange = useMemo(
    () => (companyFilter === 'all' ? recordsRange : recordsRange.filter((r) => r.companyId === companyFilter)),
    [recordsRange, companyFilter]
  );

  const totals = useMemo(() => {
    return filteredToday.reduce(
      (acc, r) => {
        acc.total += r.totals?.total || 0;
        acc.presente += r.totals?.presente || 0;
        acc.ausente += r.totals?.ausente || 0;
        acc.permiso += r.totals?.permiso || 0;
        return acc;
      },
      { total: 0, presente: 0, ausente: 0, permiso: 0 }
    );
  }, [filteredToday]);

  const barData = useMemo(
    () =>
      filteredToday.map((r) => ({
        name: r.companyName,
        presente: r.totals?.presente || 0,
        ausente: r.totals?.ausente || 0,
        permiso: r.totals?.permiso || 0,
      })),
    [filteredToday]
  );

  const trendData = useMemo(() => {
    const byDate = {};
    filteredRange.forEach((r) => {
      if (!byDate[r.date]) byDate[r.date] = { date: r.date.slice(5), presente: 0, total: 0 };
      byDate[r.date].presente += r.totals?.presente || 0;
      byDate[r.date].total += r.totals?.total || 0;
    });
    return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredRange]);

  const pieData = useMemo(() => {
    const byPosition = {};
    filteredToday.forEach((r) => {
      (r.entries || []).forEach((e) => {
        if (e.status !== 'presente') return;
        byPosition[e.position] = (byPosition[e.position] || 0) + 1;
      });
    });
    return Object.entries(byPosition).map(([name, value]) => ({ name, value }));
  }, [filteredToday]);

  const asistencia = totals.total > 0 ? Math.round((totals.presente / totals.total) * 100) : 0;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
          <p className="text-ink/50 text-sm">Monitoreo diario de personal en obra.</p>
        </div>
        <div className="flex gap-3">
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="border rounded-card px-3 py-2 text-sm"
          >
            <option value="all">Todas las empresas</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={date}
            max={todayStr()}
            onChange={(e) => setDate(e.target.value)}
            className="border rounded-card px-3 py-2 text-sm"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-ink/40">Cargando datos…</p>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard label="Personal total hoy" value={totals.total} accent={theme.colorPrimary} />
            <StatCard label="Presente" value={totals.presente} accent={theme.colorSuccess} />
            <StatCard label="Ausente" value={totals.ausente} accent={theme.colorDanger} />
            <StatCard label="% Asistencia" value={`${asistencia}%`} accent={theme.colorAccent} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-card shadow-card p-5">
              <h2 className="font-medium mb-3">Personal por empresa — {date}</h2>
              <PersonnelBarChart data={barData} theme={theme} />
            </div>
            <div className="bg-white rounded-card shadow-card p-5">
              <h2 className="font-medium mb-3">Distribución por puesto (presentes)</h2>
              <PersonnelPieChart data={pieData} />
            </div>
          </div>

          <div className="bg-white rounded-card shadow-card p-5">
            <h2 className="font-medium mb-3">Tendencia — últimos 14 días</h2>
            <PersonnelTrendChart data={trendData} theme={theme} />
          </div>
        </>
      )}
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute requireAdmin>
      <Layout>
        <DashboardContent />
      </Layout>
    </ProtectedRoute>
  );
}
