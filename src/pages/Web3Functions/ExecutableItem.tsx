import { Calendar, Clock, Copy, Play, User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { Id } from '@/../convex/_generated/dataModel';
import { Button } from '@/components/ui/button';

interface Executable {
  id: Id<'executables'>;
  taskId: Id<'tasks'>;
  name: string;
  updatedAt: number;
  createdAt: number;
  createdBy?: {
    id: Id<'users'>;
    name: string;
  };
  status: 'active' | 'paused' | 'finished' | 'failed';
  chain: {
    id: Id<'chains'>;
    chainId: number;
  };
  args: string;
  profile: {
    id: Id<'profiles'>;
    alias: string;
  };
  trigger:
    | {
        type: 'cron';
        schedule: string;
        withRetry: boolean;
        until?: number;
      }
    | {
        type: 'single';
        timestamp: number;
        withRetry: boolean;
      };
}

interface ExecutableItemProps {
  executable: Executable;
}

function getChainName(chainId: number): string {
  const chainNames: Record<number, string> = {
    1: 'Ethereum Mainnet',
    5: 'Goerli',
    11155111: 'Sepolia',
    137: 'Polygon',
    80001: 'Mumbai',
    42161: 'Arbitrum One',
    421613: 'Arbitrum Goerli',
    10: 'Optimism',
    420: 'Optimism Goerli',
    8453: 'Base',
    84531: 'Base Goerli',
    56: 'BNB Chain',
    97: 'BNB Testnet',
    43114: 'Avalanche',
    43113: 'Avalanche Fuji',
    250: 'Fantom',
    4002: 'Fantom Testnet',
  };
  return chainNames[chainId] || `Chain ${chainId}`;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'active':
      return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950';
    case 'paused':
      return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-950';
    case 'finished':
      return 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-950';
    case 'failed':
      return 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950';
    default:
      return 'text-muted-foreground bg-muted';
  }
}

export function ExecutableItem({ executable }: ExecutableItemProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(executable.id);
    setCopied(true);
    toast.success('Executable ID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Play className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium text-sm">{executable.name}</h3>
          <span className="text-xs text-muted-foreground font-mono">
            ({executable.id})
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="h-4 w-4 shrink-0 p-0"
          >
            {copied ? (
              <Copy className="h-2.5 w-2.5 text-green-500" />
            ) : (
              <Copy className="h-2.5 w-2.5" />
            )}
          </Button>
          <span
            className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(executable.status)}`}
          >
            {executable.status}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {executable.createdBy && (
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{executable.createdBy.name}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <span>Chain: {getChainName(executable.chain.chainId)}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>Profile: {executable.profile.alias}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>
              Type:{' '}
              {executable.trigger.type === 'single' ? 'Single Run' : 'Cron'}
            </span>
          </div>
          {executable.trigger.type === 'single' ? (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Runs: {formatDate(executable.trigger.timestamp)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>Cron: {executable.trigger.schedule}</span>
              {executable.trigger.until && (
                <span className="ml-2">
                  Until: {formatDate(executable.trigger.until)}
                </span>
              )}
            </div>
          )}
          {executable.trigger.withRetry && (
            <span className="text-xs bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">
              Retry enabled
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          Created: {formatDate(executable.createdAt)} • Updated:{' '}
          {formatDate(executable.updatedAt)}
        </div>
      </div>
    </div>
  );
}
