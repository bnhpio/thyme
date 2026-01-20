import { api } from 'convex/_generated/api';
import { useQuery } from 'convex/react';
import { createContext, useContext, useEffect } from 'react';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  theme: Theme;
};

type ThemeProviderState = {
  theme: Theme;
};

const initialState: ThemeProviderState = {
  theme: 'dark',
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({ children, theme }: ThemeProviderProps) {
  const userTheme = useQuery(api.query.user.getUserTheme);
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(userTheme || 'dark');
  }, [userTheme]);
  return (
    <ThemeProviderContext.Provider
      value={{ theme: theme || userTheme || 'dark' }}
    >
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
