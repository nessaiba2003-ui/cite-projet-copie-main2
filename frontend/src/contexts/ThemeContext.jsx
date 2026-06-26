import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // thème forcé
  const [theme] = useState('light');

  useEffect(() => {
    const root = document.documentElement;
    // retire dark si présent (et si localStorage avait "dark")
    root.classList.remove('dark');
    try {
      localStorage.removeItem('cim-theme');
      localStorage.setItem('cim-theme', 'light');
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo(
    () => ({
      theme: 'light',
      isDark: false,
      // pour compat avec ton code existant
      setTheme: () => {},
      toggleTheme: () => {},
    }),
    [],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}