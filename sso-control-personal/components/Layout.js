import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const ADMIN_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/dashboard/reportes', label: 'Reportes', icon: '🗂️' },
  { href: '/dashboard/empresas', label: 'Empresas', icon: '🏗️' },
  { href: '/dashboard/trabajadores', label: 'Trabajadores', icon: '👷' },
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
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="min-h-screen flex font-body" style={{ backgroundColor: 'var(--color-surface)' }}>
      {/* Barra superior solo en móvil */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 text-white"
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir menú"
          className="p-1.5 -ml-1.5 text-white"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
          </svg>
        </button>
        <p className="font-display font-semibold text-sm">{theme.appName}</p>
        <div className="w-7" />
      </div>

      {/* Fondo oscuro al abrir el menú en móvil */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-black/40" onClick={closeMobile} aria-hidden="true" />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 shrink-0 text-white flex flex-col transform transition-transform duration-200 md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        <div className="px-5 py-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <p className="font-display font-semibold text-lg leading-tight">{theme.appName}</p>
            <p className="text-xs text-white/60 mt-1">{isAdmin ? 'Panel Administrador' : 'Panel Monitor SSO'}</p>
          </div>
          <button onClick={closeMobile} aria-label="Cerrar menú" className="md:hidden text-white/70 p-1">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
          {links.map((l) => {
            const active = router.pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={closeMobile}
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

      <main className="flex-1 min-w-0 overflow-y-auto pt-14 md:pt-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">{children}</div>
      </main>
    </div>
  );
}
