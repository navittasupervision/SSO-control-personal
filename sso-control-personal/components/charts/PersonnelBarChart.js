import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function PersonnelBarChart({ data, theme }) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-ink/50 py-12 text-center">No hay datos para mostrar.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9ECEF" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Bar dataKey="presente" name="Presente" fill={theme?.colorSuccess || '#2F9E44'} radius={[4, 4, 0, 0]} />
        <Bar dataKey="ausente" name="Ausente" fill={theme?.colorDanger || '#E03131'} radius={[4, 4, 0, 0]} />
        <Bar dataKey="permiso" name="Permiso" fill={theme?.colorWarning || '#F2B705'} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
