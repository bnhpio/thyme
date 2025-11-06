import { Plus } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { OrganizationForm } from './OrganizationForm';

interface AddOrganizationModalProps {
  children?: React.ReactNode;
}

export function AddOrganizationModal({ children }: AddOrganizationModalProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer">
            <Plus className="h-4 w-4" />
            Add organization
          </div>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Organization</DialogTitle>
          <DialogDescription>
            Create a new organization to manage your projects and collaborate
            with your team.
          </DialogDescription>
        </DialogHeader>
        <OrganizationForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          showPendingInvites={false}
          isModal={true}
        />
      </DialogContent>
    </Dialog>
  );
}
