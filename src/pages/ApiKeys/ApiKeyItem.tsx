import { Calendar, Copy, Key, MoreVertical, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ApiKey, Organization } from './types';
import { formatDate, getOrganizationNames } from './utils';

interface ApiKeyItemProps {
  apiKey: ApiKey;
  organizations: Organization[] | undefined;
  onDelete: (keyId: string) => void;
}

export function ApiKeyItem({
  apiKey,
  organizations,
  onDelete,
}: ApiKeyItemProps) {
  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    toast.success('Key hash copied to clipboard');
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">{apiKey.name}</h3>
          {!apiKey.isActive && (
            <span className="text-xs px-2 py-0.5 bg-muted rounded-full">
              Revoked
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Key className="h-3 w-3" />
            <code className="text-xs font-mono">{apiKey.keyHash}</code>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleCopyHash(apiKey.keyHash)}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Expires: {formatDate(apiKey.expiresAt)}</span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Organizations:{' '}
          {getOrganizationNames(apiKey.organizationIds, organizations)}
        </div>
        {apiKey.lastUsedAt && (
          <div className="text-xs text-muted-foreground">
            Last used: {new Date(apiKey.lastUsedAt).toLocaleString()}
          </div>
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            variant="destructive"
            onClick={() => onDelete(apiKey.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
