import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

const DOC_PATH = ['settings', 'theme'];

// Paleta por defecto: pensada para un panel de control de obra/seguridad.
// Azul acero (confianza/técnico) + naranja seguridad (alta visibilidad)
// + semáforo claro para estados de personal.
export const DEFAULT_THEME = {
  appName: 'Control de Personal SSO',
  colorPrimary: '#1B3A4B',
  colorPrimaryDark: '#10242F',
  colorPrimaryLight: '#2E5A73',
  colorAccent: '#E8590C',
  colorSuccess: '#2F9E44',
  colorWarning: '#F2B705',
  colorDanger: '#E03131',
  colorSurface: '#F7F8FA',
  colorInk: '#1A1D21',
};

export async function getTheme() {
  const snap = await getDoc(doc(db, ...DOC_PATH));
  return snap.exists() ? { ...DEFAULT_THEME, ...snap.data() } : DEFAULT_THEME;
}

export async function saveTheme(theme) {
  await setDoc(doc(db, ...DOC_PATH), theme, { merge: true });
}

/** Aplica el tema como variables CSS en :root para que Tailwind las use. */
export function applyThemeToDocument(theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--color-primary', theme.colorPrimary);
  root.style.setProperty('--color-primary-dark', theme.colorPrimaryDark);
  root.style.setProperty('--color-primary-light', theme.colorPrimaryLight);
  root.style.setProperty('--color-accent', theme.colorAccent);
  root.style.setProperty('--color-success', theme.colorSuccess);
  root.style.setProperty('--color-warning', theme.colorWarning);
  root.style.setProperty('--color-danger', theme.colorDanger);
  root.style.setProperty('--color-surface', theme.colorSurface);
  root.style.setProperty('--color-ink', theme.colorInk);
}
