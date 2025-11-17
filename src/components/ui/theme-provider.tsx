import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'vite-ui-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return defaultTheme;
    try {
      const stored = localStorage.getItem(storageKey) as Theme | null;
      return stored && ['dark', 'light', 'system'].includes(stored)
        ? stored
        : defaultTheme;
    } catch {
      return defaultTheme;
    }
  });

  // Apply theme immediately on mount
  useEffect(() => {
    const root = window.document.documentElement;
    const targetTheme =
      theme === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : theme;

    // Only update if different to avoid unnecessary reflows
    const hasTarget = root.classList.contains(targetTheme);
    if (!hasTarget) {
      root.classList.remove('light', 'dark');
      root.classList.add(targetTheme);
    }
  }, [theme]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      // Only write to localStorage on client-side
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, newTheme);
      }
      setTheme(newTheme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};
