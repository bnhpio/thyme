import { AlertTriangle, Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useModal } from '@/hooks/use-modal';

interface TokenDisplayFormProps {
  token: string;
  onClose?: () => void;
}

// Internal form component
function TokenDisplayForm({ token, onClose }: TokenDisplayFormProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    toast.success('Token copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <p className="text-sm font-medium">Your API Key</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-4 py-3 bg-muted rounded-lg font-mono text-sm break-all">
              {token}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopy}
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <Alert variant="warning">
          <AlertTriangle />
          <AlertTitle>Important Security Notice</AlertTitle>
          <AlertDescription>
            <ul className="space-y-1 list-disc list-inside">
              <li>
                This is the only time you'll be able to see the full token
              </li>
              <li>Store it securely and never share it publicly</li>
              <li>If you lose it, you'll need to create a new key</li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>
      <div className="flex justify-end">
        <Button onClick={onClose}>I've Saved My Token</Button>
      </div>
    </>
  );
}

// Modal content wrapper using useModal
export function TokenDisplayModalContent({ token }: { token: string }) {
  const { close } = useModal();

  return <TokenDisplayForm token={token} onClose={close} />;
}

// Legacy controlled component for backward compatibility
// This is now handled by CreateApiKeyModalContent, but keeping for backward compatibility
interface TokenDisplayModalProps {
  token: string;
  isOpen: boolean;
  onClose: () => void;
}

export function TokenDisplayModal(_props: TokenDisplayModalProps) {
  // This should not be used anymore - token display is handled internally
  return null;
}
