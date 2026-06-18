import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const ADMIN_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/dashboard/reportes', label: 'Reportes', icon: '🗂️' },
  { href: '/dashboard/empresas', label: 'Empresas', icon: '🏗️' },
  { href: '/dashboard/monitores', label: 'Monitores SSO', icon: '🧑‍💼' },
  { href: '/dashboard/puestos', label: 'Catálogo de puestos', icon: '🛠️' },
  { href: '/dashboard/configuracion', label: 'Configuración', icon: '⚙️' },
];

const MONITOR_LINKS = [{ href: '/captura', label: 'Captura diaria', icon: '📝' }];

export default function Layout({ children }) {
  const { profile, isAdmin, logout } = useAuth();
  const { theme } = useTheme();
  const router = useRouter();
  const links = isAdmin ? ADMIN_LINKS : MONITOR_LINKS;

  return (
    <div className="min-h-screen flex font-body" style={{ backgroundColor: 'var(--color-surface)' }}>
      <aside className="w-64 shrink-0 text-white flex flex-col" style={{ backgroundColor: 'var(--color-primary)' }}>
        <div className="px-5 py-6 border-b border-white/10">
          <p className="font-display font-semibold text-lg leading-tight">{theme.appName}</p>
          <p className="text-xs text-white/60 mt-1">{isAdmin ? 'Panel Administrador' : 'Panel Monitor SSO'}</p>
        </div>
        <nav className="flex-1 py-4 space-y-1">
          {links.map((l) => {
            const active = router.pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-colors ${
                  active ? 'bg-white/15 font-medium' : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <span>{l.icon}</span>
                <span>{l.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="px-5 py-4 border-t border-white/10">
          <p className="text-sm font-medium">{profile?.name}</p>
          <button onClick={logout} className="text-xs text-white/60 hover:text-white mt-1">
            Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
