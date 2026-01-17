import {
  Calendar,
  Check,
  Copy,
  Link2,
  MoreVertical,
  Network,
  Pencil,
  Trash2,
  User,
  Wallet,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { Id } from '@/../convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Profile {
  _id: Id<'profiles'>;
  _creationTime: number;
  organizationId: Id<'organizations'>;
  alias: string;
  address: string;
  createdBy: Id<'users'>;
  chain: Id<'chains'>;
  chainId?: number;
  customRpcUrl?: string;
}

interface ProfileItemProps {
  profile: Profile;
  onDelete: (profileId: Id<'profiles'>) => void;
  onUpdate: (
    profileId: Id<'profiles'>,
    customRpcUrl: string | undefined,
  ) => void;
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

export function ProfileItem({ profile, onDelete, onUpdate }: ProfileItemProps) {
  const [copied, setCopied] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editRpcUrl, setEditRpcUrl] = useState(profile.customRpcUrl || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(profile.address);
    setCopied(true);
    toast.success('Address copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdateRpc = async () => {
    // Validate RPC URL if provided
    if (editRpcUrl.trim()) {
      try {
        new URL(editRpcUrl.trim());
      } catch {
        toast.error('Please enter a valid RPC URL');
        return;
      }
    }

    setIsUpdating(true);
    try {
      await onUpdate(profile._id, editRpcUrl.trim() || undefined);
      setIsEditDialogOpen(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to update profile',
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenEditDialog = () => {
    setEditRpcUrl(profile.customRpcUrl || '');
    setIsEditDialogOpen(true);
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium">{profile.alias}</h3>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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
            {profile.customRpcUrl && (
              <div className="flex items-center gap-1">
                <Link2 className="size-4" />
                <span className="font-mono text-xs truncate max-w-[200px]">
                  {profile.customRpcUrl}
                </span>
              </div>
            )}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleOpenEditDialog}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit RPC
            </DropdownMenuItem>
            <DropdownMenuSeparator />
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Edit Profile RPC</DialogTitle>
            <DialogDescription>
              Update the custom RPC URL for "{profile.alias}". This RPC will be
              used for sandbox execution and simulation.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2.5">
              <Label className="text-sm font-medium">
                Custom RPC URL{' '}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Input
                placeholder="https://eth-mainnet.g.alchemy.com/v2/..."
                value={editRpcUrl}
                onChange={(e) => setEditRpcUrl(e.target.value)}
                className="h-10 font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Custom RPC URL for sandbox execution and simulation. Leave empty
                to use the default chain RPC.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateRpc} disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update RPC'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
