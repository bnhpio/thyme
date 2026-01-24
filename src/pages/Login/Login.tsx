import { Link } from '@tanstack/react-router';
import { Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuthActions } from '@/lib/tanstack-auth';

export function Login() {
  const { signIn } = useAuthActions();
  const handleGitHubSignIn = () => {
    signIn('github');
  };

  // useEffect(() => {
  //   if (isAuthenticated) {
  //     navigate({
  //       to: '/dashboard',
  //     });
  //   }
  // }, [isAuthenticated, navigate]);

  // if (isAuthenticated) {
  //   return <div>Redirecting to home...</div>;
  // }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={handleGitHubSignIn}
            variant="outline"
            className="w-full h-12 text-base font-medium"
          >
            <Github className="mr-2 h-5 w-5" />
            Continue with GitHub
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            <Link to="/" className="hover:underline">
              ← Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
