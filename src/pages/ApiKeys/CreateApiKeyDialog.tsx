import { useAction } from 'convex/react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useModal } from '@/hooks/use-modal';
import { TokenDisplayModalContent } from './TokenDisplayModal';
import { calculateExpirationDate } from './utils';

interface CreateApiKeyFormProps {
  onSuccess?: (token: string) => void;
  onCancel?: () => void;
}

// Internal form component
function CreateApiKeyForm({ onSuccess, onCancel }: CreateApiKeyFormProps) {
  const generateToken = useAction(api.action.auth.generateCustomToken);
  const [name, setName] = useState('');
  const [expiration, setExpiration] = useState<string>('7weeks');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Please enter a name for the API key');
      return;
    }

    setIsCreating(true);
    try {
      const expiresAt = calculateExpirationDate(expiration);
      const token = await generateToken({
        name: name.trim(),
        expiresAt,
      });

      setName('');
      setExpiration('7weeks');
      onSuccess?.(token);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to create API key',
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setName('');
    setExpiration('7weeks');
    onCancel?.();
  };

  return (
    <>
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
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={handleCancel} disabled={isCreating}>
          Cancel
        </Button>
        <Button onClick={handleCreate} disabled={isCreating}>
          {isCreating ? 'Creating...' : 'Create Key'}
        </Button>
      </div>
    </>
  );
}

// Modal content wrapper using useModal
export function CreateApiKeyModalContent({
  onSetCreatedToken,
}: {
  onSetCreatedToken: (token: string) => void;
}) {
  const { close, open } = useModal();

  const handleSuccess = (token: string) => {
    close();
    // Open token display modal
    open({
      title: (
        <div className="flex items-center gap-2">
          <span className="text-success">✓</span>
          API Key Created Successfully
        </div>
      ),
      description:
        "Your API key has been created. Make sure to copy it now as you won't be able to see it again.",
      content: <TokenDisplayModalContent token={token} />,
      className: 'sm:max-w-[600px]',
      preventClose: true,
    });
    onSetCreatedToken(token);
  };

  return <CreateApiKeyForm onSuccess={handleSuccess} onCancel={close} />;
}

// Trigger component for backward compatibility
interface CreateApiKeyDialogProps {
  trigger?: React.ReactNode;
  onSetCreatedToken: (token: string) => void;
}

export function CreateApiKeyDialog({
  trigger,
  onSetCreatedToken,
}: CreateApiKeyDialogProps) {
  const { open } = useModal();

  const handleClick = () => {
    open({
      title: 'Create New API Key',
      description:
        'Create a new API key to authenticate requests to the platform.',
      content: (
        <CreateApiKeyModalContent onSetCreatedToken={onSetCreatedToken} />
      ),
      className: 'sm:max-w-[520px]',
    });
  };

  if (trigger) {
    return <div onClick={handleClick}>{trigger}</div>;
  }

  return (
    <Button onClick={handleClick}>
      <Plus className="h-4 w-4 mr-2" />
      Create API Key
    </Button>
  );
}
