import { createFileRoute } from '@tanstack/react-router';
import { Key, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { SettingsLayout } from '@/layouts/SettingsLayout';

export const Route = createFileRoute('/_authed/settings/api-keys')({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">API Keys</h1>
            <p className="text-muted-foreground mt-1">
              Manage your API keys for accessing the platform
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create API Key
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>
              Your API keys are used to authenticate requests to the API. Keep
              them secure and never share them publicly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Key className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                No API keys found. Create your first API key to get started.
              </p>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create API Key
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </SettingsLayout>
  );
}
