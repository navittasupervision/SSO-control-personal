import { ESTADOS_PERSONAL } from '../lib/catalog';

const COLOR_CLASSES = {
  success: 'bg-success/10 text-success',
  danger: 'bg-danger/10 text-danger',
  warning: 'bg-warning/10 text-[#8a6300]',
  primary: 'bg-primary/10 text-primary',
};

export default function StatusBadge({ status }) {
  const estado = ESTADOS_PERSONAL.find((e) => e.valor === status);
  if (!estado) return <span className="text-xs text-ink/50">{status}</span>;
  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${COLOR_CLASSES[estado.color]}`}>
      {estado.etiqueta}
    </span>
  );
}
