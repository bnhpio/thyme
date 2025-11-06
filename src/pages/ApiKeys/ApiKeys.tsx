import { useQuery } from 'convex/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/../convex/_generated/api';
import { Button } from '@/components/ui/button';
import type { ApiKey, Organization } from './types';
import { ApiKeyList } from './ApiKeyList';
import { CreateApiKeyDialog } from './CreateApiKeyDialog';

// Mock API keys - will be replaced with real data from Convex later
const getMockApiKeys = (): ApiKey[] => {
  return [];
};

export function ApiKeys() {
  const currentUser = useQuery(api.query.user.getCurrentUser);
  const organizations = useQuery(
    api.query.user.getUserOrganizations,
    currentUser?.id ? { userId: currentUser.id } : 'skip',
  ) as Organization[] | undefined;

  const [apiKeys, setApiKeys] = useState<ApiKey[]>(getMockApiKeys());

  const handleCreateKey = (newKey: ApiKey) => {
    setApiKeys([...apiKeys, newKey]);
  };

  const handleDeleteKey = (keyId: string) => {
    setApiKeys(apiKeys.filter((key) => key.id !== keyId));
    toast.success('API key deleted');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Keys</h1>
          <p className="text-muted-foreground mt-1">
            Manage your API keys for accessing the platform
          </p>
        </div>
        <CreateApiKeyDialog
          organizations={organizations}
          onCreateKey={handleCreateKey}
        />
      </div>

      <ApiKeyList
        apiKeys={apiKeys}
        organizations={organizations}
        onDelete={handleDeleteKey}
        onCreate={handleCreateKey}
      />
    </div>
  );
}

