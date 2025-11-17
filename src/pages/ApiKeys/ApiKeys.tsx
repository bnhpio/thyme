import { useMutation, useQuery } from 'convex/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';
import { ApiKeyList } from './ApiKeyList';
import { CreateApiKeyDialog } from './CreateApiKeyDialog';
import { TokenDisplayModal } from './TokenDisplayModal';
import type { ApiKey } from './types';

export function ApiKeys() {
  const apiKeys = useQuery(api.query.customToken.getCustomTokens) as
    | ApiKey[]
    | undefined;

  const [createdToken, setCreatedToken] = useState<string>('');

  const handleTokenModalClose = () => {
    setCreatedToken('');
  };
  const deleteToken = useMutation(api.mutation.customToken.deleteCustomToken);

  const handleDeleteKey = async (keyId: Id<'userCustomTokens'>) => {
    try {
      await deleteToken({ id: keyId });
      toast.success('API key deleted');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete API key',
      );
    }
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
          onSetCreatedToken={(token) => setCreatedToken(token)}
        />
      </div>

      <ApiKeyList
        onSetCreatedToken={(token) => setCreatedToken(token)}
        apiKeys={apiKeys || []}
        onDelete={handleDeleteKey}
      />
      <TokenDisplayModal
        token={createdToken}
        isOpen={!!createdToken}
        onClose={handleTokenModalClose}
      />
    </div>
  );
}
