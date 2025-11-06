import { Key, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ApiKeyItem } from './ApiKeyItem';
import { CreateApiKeyDialog } from './CreateApiKeyDialog';
import type { ApiKey, Organization } from './types';

interface ApiKeyListProps {
  apiKeys: ApiKey[];
  organizations: Organization[] | undefined;
  onDelete: (keyId: ApiKey['id']) => void;
  onRefresh?: () => void;
}

export function ApiKeyList({
  apiKeys,
  organizations,
  onDelete,
  onRefresh,
}: ApiKeyListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>API Keys</CardTitle>
        <CardDescription>
          Your API keys are used to authenticate requests to the API. Keep them
          secure and never share them publicly.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {apiKeys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Key className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              No API keys found. Create your first API key to get started.
            </p>
            <CreateApiKeyDialog
              organizations={organizations}
              onSuccess={onRefresh || (() => {})}
              trigger={
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create API Key
                </Button>
              }
            />
          </div>
        ) : (
          <div className="space-y-4">
            {apiKeys.map((apiKey) => (
              <ApiKeyItem
                key={apiKey.id}
                apiKey={apiKey}
                organizations={organizations}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
