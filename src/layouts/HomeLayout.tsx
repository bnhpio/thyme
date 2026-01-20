import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { LogoSigned } from '@/components/base/Logo/LogoSigned';
import { Button } from '@/components/ui/button';
import { useIsAuthenticated } from '@/lib/tanstack-auth';

interface HomeLayoutProps {
  children: React.ReactNode;
}

export function HomeLayout({ children }: HomeLayoutProps) {
  const [scrollY, setScrollY] = useState(0);
  const isAuthenticated = useIsAuthenticated();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-20 left-10 w-96 h-96 rounded-full blur-3xl animate-float bg-primary/20" />
        <div
          className="absolute top-40 right-20 w-80 h-80 rounded-full blur-3xl animate-float-slow bg-accent-secondary/20"
          style={{ animationDelay: '2s' }}
        />
        <div
          className="absolute bottom-40 left-1/4 w-72 h-72 rounded-full blur-3xl animate-float bg-accent/20"
          style={{ animationDelay: '4s' }}
        />
        <div
          className="absolute bottom-20 right-1/3 w-96 h-96 rounded-full blur-3xl animate-float-slow bg-accent-tertiary/15"
          style={{ animationDelay: '1s' }}
        />
      </div>

      {/* Navigation */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-sm transition-all duration-300"
        style={{
          boxShadow: scrollY > 50 ? '0 4px 20px rgba(0,0,0,0.1)' : 'none',
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <LogoSigned className="w-20 fill-current text-primary transition-all duration-300 hover:scale-110 logo-typewriter" />
            </Link>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button
                    size="sm"
                    className="bg-linear-to-r from-primary to-accent hover:from-primary-dark hover:to-accent-dark"
                  >
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to="/login">
                  <Button
                    size="sm"
                    className="bg-linear-to-r from-primary to-accent hover:from-primary-dark hover:to-accent-dark"
                  >
                    Start Building
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      {children}

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <LogoSigned className="w-20 text-foreground fill-current" />
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a
                href="https://docs.thyme.sh/getting-started"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                Documentation
              </a>
              <Link
                to="/privacy-policy"
                className="hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                to="/support"
                className="hover:text-foreground transition-colors"
              >
                Support
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © 2025 Thyme. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
