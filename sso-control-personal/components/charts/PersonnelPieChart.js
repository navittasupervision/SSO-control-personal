import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const PALETTE = ['#1B3A4B', '#E8590C', '#2F9E44', '#F2B705', '#2E5A73', '#868E96', '#E03131', '#5C7CFA'];

export default function PersonnelPieChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-ink/50 py-12 text-center">No hay datos para mostrar.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={(d) => d.name}>
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
