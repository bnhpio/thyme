import { useAction, useQuery } from 'convex/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CreateProfileDialogProps {
  organizationId: Id<'organizations'>;
  onSuccess: () => void;
  trigger?: React.ReactNode;
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

export function CreateProfileDialog({
  organizationId,
  onSuccess,
  trigger,
}: CreateProfileDialogProps) {
  const createProfile = useAction(api.action.profile.createProfile);
  const chains = useQuery(api.query.chain.getAllChains);
  const [isOpen, setIsOpen] = useState(false);
  const [alias, setAlias] = useState('');
  const [selectedChainId, setSelectedChainId] = useState<Id<'chains'> | ''>('');
  const [customRpcUrl, setCustomRpcUrl] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!alias.trim()) {
      toast.error('Please enter an alias for the profile');
      return;
    }

    if (!selectedChainId) {
      toast.error('Please select a chain');
      return;
    }

    // Validate RPC URL if provided
    if (customRpcUrl.trim()) {
      try {
        new URL(customRpcUrl.trim());
      } catch {
        toast.error('Please enter a valid RPC URL');
        return;
      }
    }

    setIsCreating(true);
    try {
      await createProfile({
        organizationId,
        alias: alias.trim(),
        chain: selectedChainId as Id<'chains'>,
        customRpcUrl: customRpcUrl.trim() || undefined,
      });
      setIsOpen(false);
      setAlias('');
      setSelectedChainId('');
      setCustomRpcUrl('');
      toast.success('Profile created successfully');
      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create profile',
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setAlias('');
      setSelectedChainId('');
      setCustomRpcUrl('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Profile
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Create New Profile</DialogTitle>
          <DialogDescription>
            Create a new profile with a unique alias. A new wallet address will
            be generated for this profile.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 py-4">
          <div className="space-y-2.5">
            <Label className="text-sm font-medium">Alias</Label>
            <Input
              placeholder="e.g., Main Profile, Trading Profile"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              className="h-10"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isCreating) {
                  handleCreate();
                }
              }}
            />
          </div>
          <div className="space-y-2.5">
            <Label className="text-sm font-medium">Chain</Label>
            {chains === undefined ? (
              <div className="h-10 flex items-center text-sm text-muted-foreground">
                Loading chains...
              </div>
            ) : chains.length === 0 ? (
              <div className="h-10 flex items-center text-sm text-muted-foreground">
                No chains available
              </div>
            ) : (
              <Select
                value={selectedChainId}
                onValueChange={(value) =>
                  setSelectedChainId(value as Id<'chains'>)
                }
              >
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="Select a chain" />
                </SelectTrigger>
                <SelectContent>
                  {chains
                    .sort((a, b) => a.chainId - b.chainId)
                    .map((chain) => (
                      <SelectItem key={chain._id} value={chain._id}>
                        {getChainName(chain.chainId)} ({chain.chainId})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="space-y-2.5">
            <Label className="text-sm font-medium">
              Custom RPC URL{' '}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Input
              placeholder="https://eth-mainnet.g.alchemy.com/v2/..."
              value={customRpcUrl}
              onChange={(e) => setCustomRpcUrl(e.target.value)}
              className="h-10 font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Custom RPC URL for sandbox execution and simulation. Leave empty
              to use the default chain RPC.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isCreating || !alias.trim() || !selectedChainId}
          >
            {isCreating ? 'Creating...' : 'Create Profile'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
