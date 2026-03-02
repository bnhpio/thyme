import { Plus } from 'lucide-react';
import { useModal } from '@/hooks/use-modal';
import { OrganizationForm } from './OrganizationForm';

interface AddOrganizationModalProps {
  children?: React.ReactNode;
}

// Internal form component
function AddOrganizationForm({
  onSuccess,
  onCancel,
}: {
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  return (
    <OrganizationForm
      onSuccess={onSuccess}
      onCancel={onCancel}
      showPendingInvites={false}
      isModal={true}
    />
  );
}

// Modal content wrapper using useModal
export function AddOrganizationModalContent({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const { close } = useModal();

  return (
    <AddOrganizationForm
      onSuccess={() => {
        onSuccess?.();
        close();
      }}
      onCancel={close}
    />
  );
}

// Trigger component for backward compatibility
export function AddOrganizationModal({ children }: AddOrganizationModalProps) {
  const { open } = useModal();

  const handleClick = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    open({
      title: 'Add New Organization',
      description:
        'Create a new organization to manage your projects and collaborate with your team.',
      content: <AddOrganizationModalContent />,
      className: 'max-w-2xl max-h-[90vh] overflow-y-auto',
    });
  };

  if (children) {
    return (
      <div onClick={handleClick} onMouseDown={handleClick} className="w-full">
        {children}
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer"
    >
      <Plus className="h-4 w-4" />
      Add organization
    </div>
  );
}
