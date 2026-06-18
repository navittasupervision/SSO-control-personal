import { useEffect, useState } from 'react';
import ProtectedRoute from '../components/ProtectedRoute';
import Layout from '../components/Layout';
import PersonnelDailyForm from '../components/PersonnelDailyForm';
import { useAuth } from '../context/AuthContext';
import { listCompanies } from '../lib/companies';
import { listPositions } from '../lib/positions';

function CapturaContent() {
  const { profile, isAdmin } = useAuth();
  const [companies, setCompanies] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([listCompanies(), listPositions()])
      .then(([allCompanies, allPositions]) => {
        const assigned =
          isAdmin || !profile?.companyIds?.length
            ? allCompanies
            : allCompanies.filter((c) => profile.companyIds.includes(c.id));
        setCompanies(assigned.filter((c) => c.active !== false));
        setPositions(allPositions);
      })
      .finally(() => setLoading(false));
  }, [profile, isAdmin]);

  if (loading) return <p className="text-ink/50">Cargando…</p>;

  if (companies.length === 0) {
    return (
      <p className="text-ink/50">
        No tienes ninguna empresa asignada todavía. Pide al administrador que te asigne una en{' '}
        <strong>Monitores SSO</strong>.
      </p>
    );
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-1">Captura diaria de personal</h1>
      <p className="text-ink/50 text-sm mb-6">Registra quién está en obra hoy, por empresa.</p>
      <PersonnelDailyForm companies={companies} positions={positions} monitorId={profile.id} monitorName={profile.name} />
    </div>
  );
}

export default function Captura() {
  return (
    <ProtectedRoute>
      <Layout>
        <CapturaContent />
      </Layout>
    </ProtectedRoute>
  );
}
