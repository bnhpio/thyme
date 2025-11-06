import { useAuthActions } from '@convex-dev/auth/react';
import { useRouter } from '@tanstack/react-router';
import { useConvexAuth } from 'convex/react';
import { Github } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function Login() {
  const { signIn } = useAuthActions();
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { navigate } = useRouter();
  const handleGitHubSignIn = () => {
    signIn('github');
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate({
        to: '/',
      });
    }
  }, [isAuthenticated, navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return <div>Redirecting to home...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleGitHubSignIn}
            disabled={isLoading}
            variant="outline"
            className="w-full h-12 text-base font-medium"
          >
            <Github className="mr-2 h-5 w-5" />
            Continue with GitHub
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
