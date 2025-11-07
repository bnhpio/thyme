import { useAction } from 'convex/react';
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
import { OrganizationSelector } from './OrganizationSelector';
import { TokenDisplayModal } from './TokenDisplayModal';
import type { Organization } from './types';
import { calculateExpirationDate } from './utils';

interface CreateApiKeyDialogProps {
  organizations: Organization[] | undefined;
  onSuccess: () => void;
  trigger?: React.ReactNode;
}

export function CreateApiKeyDialog({
  organizations,
  onSuccess,
  trigger,
}: CreateApiKeyDialogProps) {
  const generateToken = useAction(api.action.auth.generateCustomToken);
  const [isOpen, setIsOpen] = useState(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [createdToken, setCreatedToken] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [expiration, setExpiration] = useState<string>('7weeks');
  const [selectedOrgs, setSelectedOrgs] = useState<Id<'organizations'>[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isTokenCreated, setIsTokenCreated] = useState(false);

  const handleToggleOrg = (orgId: Id<'organizations'>) => {
    if (selectedOrgs.includes(orgId)) {
      setSelectedOrgs(selectedOrgs.filter((id) => id !== orgId));
    } else {
      setSelectedOrgs([...selectedOrgs, orgId]);
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Please enter a name for the API key');
      return;
    }

    if (selectedOrgs.length === 0) {
      toast.error('Please select at least one organization');
      return;
    }

    setIsCreating(true);
    try {
      const expiresAt = calculateExpirationDate(expiration);
      const token = await generateToken({
        name: name.trim(),
        organizations: selectedOrgs,
        expiresAt,
      });

      // Show the token in a modal
      setIsTokenCreated(true);
      setCreatedToken(token);
      setIsOpen(false);
      // Use setTimeout to ensure the create dialog closes before opening token modal
      setTimeout(() => {
        setIsTokenModalOpen(true);
      }, 100);
      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create API key',
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open && !isTokenCreated) {
      // Reset form when closing (but only if token wasn't just created)
      setName('');
      setExpiration('7weeks');
      setSelectedOrgs([]);
    }
  };

  const handleTokenModalClose = () => {
    setIsTokenModalOpen(false);
    setCreatedToken(null);
    setIsTokenCreated(false);
    // Reset form after token modal is closed
    setName('');
    setExpiration('7weeks');
    setSelectedOrgs([]);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          {trigger || (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create API Key
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Create New API Key</DialogTitle>
            <DialogDescription>
              Create a new API key to authenticate requests to the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2.5">
              <Label className="text-sm font-medium">Name</Label>
              <Input
                placeholder="e.g., Production Key"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10"
              />
            </div>
            <div className="space-y-2.5">
              <Label className="text-sm font-medium">Expiration</Label>
              <Select value={expiration} onValueChange={setExpiration}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7weeks">7 weeks</SelectItem>
                  <SelectItem value="30days">30 days</SelectItem>
                  <SelectItem value="90days">90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <OrganizationSelector
              organizations={organizations}
              selectedOrgs={selectedOrgs}
              onSelectionChange={handleToggleOrg}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Key'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {createdToken && (
        <TokenDisplayModal
          token={createdToken}
          isOpen={isTokenModalOpen}
          onClose={handleTokenModalClose}
        />
      )}
    </>
  );
}
