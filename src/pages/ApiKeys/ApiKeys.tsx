import { useQuery } from 'convex/react';
import { toast } from 'sonner';
import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';
import { ApiKeyList } from './ApiKeyList';
import { CreateApiKeyDialog } from './CreateApiKeyDialog';
import type { ApiKey, Organization } from './types';

export function ApiKeys() {
  const currentUser = useQuery(api.query.user.getCurrentUser);
  const organizations = useQuery(
    api.query.user.getUserOrganizations,
    currentUser?.id ? { userId: currentUser.id } : 'skip',
  ) as Organization[] | undefined;

  const apiKeys = useQuery(api.query.customToken.getCustomTokens) as
    | ApiKey[]
    | undefined;

  const handleDeleteKey = async (_: Id<'userCustomTokens'>) => {
    // TODO: Implement delete mutation when available
    toast.success('API key deleted');
  };

  const handleRefresh = () => {
    // Query will automatically refresh
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
          onSuccess={handleRefresh}
        />
      </div>

      <ApiKeyList
        apiKeys={apiKeys || []}
        organizations={organizations}
        onDelete={handleDeleteKey}
        onRefresh={handleRefresh}
      />
    </div>
  );
}
