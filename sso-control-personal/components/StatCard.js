export default function StatCard({ label, value, accent }) {
  return (
    <div className="bg-white rounded-card shadow-card p-5 border-l-4" style={{ borderColor: accent || 'var(--color-primary)' }}>
      <p className="text-xs uppercase tracking-wide text-ink/50 font-medium">{label}</p>
      <p className="text-3xl font-display font-semibold mt-1">{value}</p>
    </div>
  );
}
