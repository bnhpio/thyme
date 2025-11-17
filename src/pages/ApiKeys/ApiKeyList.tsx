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
import type { ApiKey } from './types';

interface ApiKeyListProps {
  apiKeys: ApiKey[];
  onDelete: (keyId: ApiKey['id']) => void;
  onRefresh?: () => void;
  onSetCreatedToken: (token: string) => void;
}

export function ApiKeyList({
  apiKeys,
  onDelete,
  onSetCreatedToken,
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
              onSetCreatedToken={onSetCreatedToken}
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
              <ApiKeyItem key={apiKey.id} apiKey={apiKey} onDelete={onDelete} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
