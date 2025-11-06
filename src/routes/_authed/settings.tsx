import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SettingsLayout } from '@/layouts/SettingsLayout';

export const Route = createFileRoute('/_authed/settings')({
  component: RouteComponent,
});

function RouteComponent() {
  const currentUser = useQuery(api.query.user.getCurrentUser);

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Manage your account information and preferences.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={currentUser?.name || ''}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={currentUser?.email || ''}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="pt-4">
              <Button variant="outline" disabled>
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </SettingsLayout>
  );
}
