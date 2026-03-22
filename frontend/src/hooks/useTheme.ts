import { useEffect, useMemo, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type ResolvedTheme = 'light' | 'dark';

function detectSystemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useTheme() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const hasAuth = !!(localStorage.getItem('authToken') || sessionStorage.getItem('authToken'));
    const saved = localStorage.getItem('themeMode') as ThemeMode | null;
    return hasAuth ? (saved || 'light') : 'light';
  });

  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => detectSystemTheme());

  const resolvedTheme: ResolvedTheme = useMemo(() => {
    return themeMode === 'auto' ? systemTheme : themeMode;
  }, [themeMode, systemTheme]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setSystemTheme(detectSystemTheme());
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);

    document.documentElement.classList.remove('theme-light', 'theme-dark');
    document.documentElement.classList.add(resolvedTheme === 'dark' ? 'theme-dark' : 'theme-light');
    document.documentElement.setAttribute('data-theme', resolvedTheme);
  }, [themeMode, resolvedTheme]);

  useEffect(() => {
    const onStorage = () => {
      const hasAuth = !!(localStorage.getItem('authToken') || sessionStorage.getItem('authToken'));
      if (!hasAuth) {
        setThemeMode('light');
        return;
      }
      const saved = localStorage.getItem('themeMode') as ThemeMode | null;
      if (saved) {
        setThemeMode(saved);
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggleTheme = () => {
    setThemeMode((prev) => {
      if (prev === 'auto') return 'light';
      return prev === 'light' ? 'dark' : 'light';
    });
  };

  return {
    themeMode,
    resolvedTheme,
    setThemeMode,
    toggleTheme,
    isDark: resolvedTheme === 'dark',
  };
}
