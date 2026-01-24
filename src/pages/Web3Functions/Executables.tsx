import { useQuery } from 'convex/react';
import { PlusIcon } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useModal } from '@/hooks/use-modal';
import { CreateExecutableModalContent } from './CreateExecutableDialog';
import { ExecutablesList } from './ExecutablesList';
import { FunctionSelectionModalContent } from './FunctionSelectionModal';

export function Executables() {
  const { open } = useModal();
  const currentOrgId = useQuery(api.query.user.getCurrentUserOrganizationId);

  const handleNewClick = () => {
    if (!currentOrgId) {
      toast.error('Please select an organization first');
      return;
    }

    const closeSelectionModal = open({
      title: 'Select a Function',
      className: 'sm:max-w-[800px]',
      content: (
        <FunctionSelectionModalContent
          organizationId={currentOrgId}
          onFunctionSelect={(taskId, storageId) => {
            closeSelectionModal();

            open({
              title: 'Create Executable Task',
              className: 'sm:max-w-[700px] max-h-[90vh] overflow-y-auto',
              content: (
                <CreateExecutableModalContent
                  taskId={taskId}
                  storageId={storageId}
                  organizationId={currentOrgId}
                  onSuccess={() => {
                    toast.success('Executable created successfully');
                  }}
                />
              ),
            });
          }}
        />
      ),
    });
  };

  if (!currentOrgId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Executable Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Please select an organization to view executable tasks
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Executable Tasks</h1>
        <Button onClick={handleNewClick}>
          <PlusIcon className="size-4" />
          New
        </Button>
      </div>
      <Separator />
      <ExecutablesList organizationId={currentOrgId} />
    </div>
  );
}
