import { useQuery } from 'convex/react';
import { FileCode } from 'lucide-react';
import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';
import { FunctionItem } from './FunctionItem';

interface FunctionSelectionModalContentProps {
  organizationId: Id<'organizations'>;
  onFunctionSelect: (taskId: Id<'tasks'>, storageId: Id<'_storage'>) => void;
}

export function FunctionSelectionModalContent({
  organizationId,
  onFunctionSelect,
}: FunctionSelectionModalContentProps) {
  const tasks = useQuery(api.query.task.getTasksByOrganization, {
    organizationId,
  });

  if (tasks === undefined) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-muted-foreground">Loading functions...</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileCode className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">
          No functions found. Upload your first function to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto">
      {tasks.map((task) => (
        <FunctionItem
          key={task._id}
          task={task}
          organizationId={organizationId}
          selectionMode
          onSelect={() => onFunctionSelect(task._id, task.hash)}
        />
      ))}
    </div>
  );
}
