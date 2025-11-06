import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface TokenDisplayModalProps {
  token: string;
  isOpen: boolean;
  onClose: () => void;
}

export function TokenDisplayModal({
  token,
  isOpen,
  onClose,
}: TokenDisplayModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    toast.success('Token copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-500" />
            API Key Created Successfully
          </DialogTitle>
          <DialogDescription>
            Your API key has been created. Make sure to copy it now as you won't
            be able to see it again.
          </DialogDescription>
        </DialogHeader>
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
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-2">
              ⚠️ Important Security Notice
            </p>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 list-disc list-inside">
              <li>
                This is the only time you'll be able to see the full token
              </li>
              <li>Store it securely and never share it publicly</li>
              <li>If you lose it, you'll need to create a new key</li>
            </ul>
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose}>I've Saved My Token</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
