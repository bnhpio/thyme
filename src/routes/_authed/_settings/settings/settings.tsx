import { createFileRoute } from '@tanstack/react-router';
import { useMutation, useQuery } from 'convex/react';
import { Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/../convex/_generated/api';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const Route = createFileRoute('/_authed/_settings/settings/settings')({
  component: RouteComponent,
});

function RouteComponent() {
  const currentUser = useQuery(api.query.user.getCurrentUser);
  const updateUserName = useMutation(api.mutation.user.updateUserName);

  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form data from current user
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
    }
  }, [currentUser]);

  const hasChanges = name !== (currentUser?.name || '');

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      await updateUserName({ name: name.trim() });
      toast.success('Name updated successfully');
    } catch (error) {
      console.error('Failed to update name:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to update name',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (currentUser) {
      setName(currentUser.name || '');
    }
    toast.info('Changes cancelled');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Manage your account information and preferences.
              </CardDescription>
            </div>
            {hasChanges && (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full sm:w-auto"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              disabled={isSaving}
              autoComplete="name"
              data-1p-ignore
              data-lpignore="true"
              className={hasChanges ? 'border-primary' : ''}
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
        </CardContent>
      </Card>
    </div>
  );
}
