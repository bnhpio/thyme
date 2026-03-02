import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useModal } from './use-modal';

interface ConfirmOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
}

export function useConfirm(): (options: ConfirmOptions) => Promise<boolean> {
  const { open } = useModal();

  return useCallback(
    (options: ConfirmOptions): Promise<boolean> => {
      return new Promise((resolve) => {
        const {
          title,
          description,
          confirmText = 'Confirm',
          cancelText = 'Cancel',
          variant = 'default',
        } = options;

        let resolved = false;

        const closeModal = open({
          title,
          description,
          content: null,
          actions: (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  if (!resolved) {
                    resolved = true;
                    closeModal();
                    resolve(false);
                  }
                }}
              >
                {cancelText}
              </Button>
              <Button
                variant={variant === 'destructive' ? 'destructive' : 'default'}
                onClick={() => {
                  if (!resolved) {
                    resolved = true;
                    closeModal();
                    resolve(true);
                  }
                }}
              >
                {confirmText}
              </Button>
            </>
          ),
          preventClose: true,
        });
      });
    },
    [open],
  );
}
