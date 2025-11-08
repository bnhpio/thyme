import { useAuthActions } from '@convex-dev/auth/react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery } from 'convex/react';
import { LogOut, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/../convex/_generated/api';
import { Logo } from '@/components/base/Logo/Logo';
import { LogoSigned } from '@/components/base/Logo/LogoSigned';
import { Button } from '@/components/ui/button';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { SettingsSidebar } from './SettingsSidebar';

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export function SettingsLayout({ children }: SettingsLayoutProps) {
  const { signOut } = useAuthActions();
  const navigate = useNavigate();
  const currentUser = useQuery(api.query.user.getCurrentUser);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      navigate({ to: '/login' });
    } catch {
      toast.error('Logout failed, but you have been signed out');
      navigate({ to: '/login' });
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-svh w-full">
        <SettingsSidebar />

        <SidebarInset>
          {/* Top Header */}
          <header className="border-b bg-background shadow-sm">
            <div className="flex h-14 items-center px-4">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                <div className="flex items-center space-x-2">
                  <div className=" w-20 rounded flex items-center justify-center text-linear-to-b from-primary/50 to-primary">
                    <LogoSigned className=" fill-primary" />
                  </div>
                </div>
              </div>

              <div className="ml-auto flex items-center space-x-4">
                {currentUser && (
                  <span className="text-sm text-muted-foreground hidden sm:block">
                    Welcome, {currentUser.name}
                  </span>
                )}
                <ThemeToggle />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 bg-background p-6 relative">
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-linear-to-b from-primary/50 to-primary" />
            <div className="max-w-7xl mx-auto relative z-10">{children}</div>
          </main>
        </SidebarInset>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}
