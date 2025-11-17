import { Calendar, Key, MoreVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ApiKey } from './types';
import { formatDate } from './utils';

interface ApiKeyItemProps {
  apiKey: ApiKey;
  onDelete: (keyId: ApiKey['id']) => void;
}

export function ApiKeyItem({ apiKey, onDelete }: ApiKeyItemProps) {
  const isExpired = apiKey.expiresAt < Date.now();

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted transition-colors">
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <h3 className="font-medium flex items-center gap-2">
            {' '}
            <Key className="h-3 w-3" />
            {apiKey.name}
          </h3>
          {isExpired && (
            <span className="text-xs px-2 py-0.5 bg-muted rounded-full">
              Expired
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Expires: {formatDate(apiKey.expiresAt)}</span>
          </div>
        </div>
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
