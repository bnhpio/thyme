import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router';
import { useMutation, useQuery } from 'convex/react';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/../convex/_generated/api';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { convex } from '@/integrations/convex/provider';

export const Route = createFileRoute('/accept-invite')({
  component: AcceptInviteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      token: (search.token as string) || '',
    };
  },
  beforeLoad: async ({ search }) => {
    const isAuthenticated = await convex.query(api.auth.isAuthenticated);
    if (!isAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          redirect: `/accept-invite?token=${search.token || ''}`,
        },
      });
    }
  },
});

function AcceptInviteComponent() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const currentUser = useQuery(api.query.user.getCurrentUser);
  const acceptInvite = useMutation(api.mutation.organizations.acceptInvite);

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link. No token provided.');
      return;
    }

    if (!currentUser) {
      return; // Still loading
    }

    // Auto-accept the invite when component mounts
    const handleAccept = async () => {
      try {
        await acceptInvite({ token });
        setSuccess(true);
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate({ to: '/' });
        }, 2000);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to accept invitation';
        setError(errorMessage);
      }
    };

    handleAccept();
  }, [token, currentUser, acceptInvite, navigate]);

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle>Invitation Accepted!</CardTitle>
            <CardDescription>
              You've successfully joined the organization. Redirecting...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invitation Error</CardTitle>
            <CardDescription>
              There was a problem accepting the invitation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="mt-4">
              <Button
                onClick={() => navigate({ to: '/' })}
                variant="outline"
                className="w-full"
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Loader2 className="h-12 w-12 text-indigo-500 animate-spin" />
          </div>
          <CardTitle>Accepting Invitation...</CardTitle>
          <CardDescription>
            Please wait while we process your invitation
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
