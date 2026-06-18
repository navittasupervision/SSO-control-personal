import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { DEFAULT_THEME, getTheme, saveTheme, applyThemeToDocument } from '../lib/theme';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    applyThemeToDocument(DEFAULT_THEME); // evita "flash" sin estilo mientras carga
    getTheme()
      .then((t) => {
        setTheme(t);
        applyThemeToDocument(t);
      })
      .catch((err) => console.error('No se pudo cargar el tema', err))
      .finally(() => setLoading(false));
  }, []);

  const updateTheme = useCallback(async (partial) => {
    const next = { ...theme, ...partial };
    setTheme(next);
    applyThemeToDocument(next);
    await saveTheme(next);
    return next;
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, loading, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme debe usarse dentro de <ThemeProvider>');
  return ctx;
}
