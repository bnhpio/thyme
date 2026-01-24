import { createContext, useCallback, useContext, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ModalConfig {
  title: React.ReactNode;
  content: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

interface ModalInstance {
  id: string;
  config: ModalConfig;
  isOpen: boolean;
}

interface ModalContextValue {
  open: (config: ModalConfig) => () => void;
  close: (id?: string) => void;
}

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

export function useModalContext() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within ModalProvider');
  }
  return context;
}

function ModalItem({
  modal,
  onClose,
  zIndex,
}: {
  modal: ModalInstance;
  onClose: () => void;
  zIndex: number;
}) {
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onClose();
      }
    },
    [onClose],
  );

  return (
    <Dialog open={modal.isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className={cn(`!z-[${zIndex}]`, modal.config.className)}>
        <DialogHeader>
          <DialogTitle>{modal.config.title}</DialogTitle>
        </DialogHeader>
        <div>{modal.config.content}</div>
        {modal.config.actions && (
          <DialogFooter>{modal.config.actions}</DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ModalRenderer({
  modals,
  closeModal,
}: {
  modals: ModalInstance[];
  closeModal: (id: string) => void;
}) {
  return (
    <>
      {modals.map((modal, index) => (
        <ModalItem
          key={modal.id}
          modal={modal}
          onClose={() => closeModal(modal.id)}
          zIndex={50 + index}
        />
      ))}
    </>
  );
}

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modals, setModals] = useState<Map<string, ModalInstance>>(new Map());

  const generateId = useCallback(() => {
    return uuidv4();
  }, []);

  const closeModal = useCallback((id: string) => {
    setModals((prev) => {
      const next = new Map(prev);
      const modal = next.get(id);
      if (modal) {
        // Mark as closing for animation
        next.set(id, { ...modal, isOpen: false });
        // Remove after animation completes
        setTimeout(() => {
          setModals((current) => {
            const updated = new Map(current);
            updated.delete(id);
            return updated;
          });
        }, 200);
      }
      return next;
    });
  }, []);

  const open = useCallback(
    (config: ModalConfig): (() => void) => {
      const id = generateId();
      const modal: ModalInstance = {
        id,
        config,
        isOpen: true,
      };

      setModals((prev) => {
        const next = new Map(prev);
        next.set(id, modal);
        return next;
      });

      // Return close function for this specific modal
      return () => closeModal(id);
    },
    [generateId, closeModal],
  );

  const close = useCallback(
    (id?: string) => {
      if (id) {
        closeModal(id);
      } else {
        // Close all modals if no ID provided
        for (const modal of modals.values()) {
          closeModal(modal.id);
        }
      }
    },
    [modals, closeModal],
  );

  return (
    <ModalContext.Provider value={{ open, close }}>
      {children}
      <ModalRenderer
        modals={Array.from(modals.values())}
        closeModal={closeModal}
      />
    </ModalContext.Provider>
  );
}
