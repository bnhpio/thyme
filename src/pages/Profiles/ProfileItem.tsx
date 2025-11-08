import {
  Calendar,
  Check,
  Copy,
  MoreVertical,
  Network,
  Trash2,
  User,
  Wallet,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { Id } from '@/../convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Profile {
  _id: Id<'profiles'>;
  _creationTime: number;
  organizationId: Id<'organizations'>;
  alias: string;
  address: string;
  createdBy: Id<'users'>;
  chain: Id<'chains'>;
  chainId?: number;
}

interface ProfileItemProps {
  profile: Profile;
  onDelete: (profileId: Id<'profiles'>) => void;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatAddress(address: string): string {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function ProfileItem({ profile, onDelete }: ProfileItemProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(profile.address);
    setCopied(true);
    toast.success('Address copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium">{profile.alias}</h3>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Wallet className="size-4" />
            <code className="text-xs font-mono ">
              {formatAddress(profile.address)}
            </code>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="size-4 shrink-0 p-0"
            >
              {copied ? (
                <Check className="size-3 text-success" />
              ) : (
                <Copy className="size-3 cursor-pointer" />
              )}
            </Button>
          </div>
          {profile.chainId !== undefined && (
            <div className="flex items-center gap-1">
              <Network className="size-4" />
              <span>Chain: {profile.chainId}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="size-4" />
            <span>Created: {formatDate(profile._creationTime)}</span>
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
            onClick={() => onDelete(profile._id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
