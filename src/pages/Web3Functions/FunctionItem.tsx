import { useMutation } from 'convex/react';
import { Check, Code2, Copy, FileCode, Play, Trash2, User } from 'lucide-react';
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
import { CodeViewDialog } from './CodeViewDialog';
import { CreateExecutableDialog } from './CreateExecutableDialog';

interface Task {
  _id: Id<'tasks'>;
  hash: Id<'_storage'>;
  checkSum: string;
  creator: {
    id: Id<'users'>;
    name: string | null;
    email: string | null;
  } | null;
  _creationTime: number;
  executableCount: number;
}

interface FunctionItemProps {
  task: Task;
  organizationId: Id<'organizations'>;
  onExecutableCreated?: () => void;
  /** When true, hides action buttons and makes the entire item clickable */
  selectionMode?: boolean;
  /** Called when item is clicked in selection mode */
  onSelect?: () => void;
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function FunctionItem({
  task,
  organizationId,
  onExecutableCreated,
  selectionMode = false,
  onSelect,
}: FunctionItemProps) {
  const [copied, setCopied] = useState(false);
  const [isExecutableDialogOpen, setIsExecutableDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const deleteTask = useMutation(api.mutation.task.deleteTask);

  const handleCopy = () => {
    navigator.clipboard.writeText(task._id);
    setCopied(true);
    toast.success('Function ID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    try {
      await deleteTask({ taskId: task._id });
      toast.success('Task deleted successfully');
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete task',
      );
    }
  };

  const canDelete = task.executableCount === 0;

  return (
    <>
      <div
        className={`flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors ${selectionMode ? 'cursor-pointer' : ''}`}
        onClick={selectionMode ? onSelect : undefined}
      >
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <FileCode className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-medium font-mono text-sm break-all">
              {task._id}
            </h3>
            {!selectionMode && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                className="h-4 w-4 shrink-0 p-0"
              >
                {copied ? (
                  <Check className="h-2.5 w-2.5 text-success" />
                ) : (
                  <Copy className="h-2.5 w-2.5" />
                )}
              </Button>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {task.creator && (
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>
                  {task.creator.name || task.creator.email || 'Unknown'}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <span>Created: {formatDate(task._creationTime)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>
                {task.executableCount === 0
                  ? 'No executables'
                  : `${task.executableCount} executable${task.executableCount === 1 ? '' : 's'}`}
              </span>
            </div>
          </div>
        </div>
        {!selectionMode && (
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsExecutableDialogOpen(true)}
            >
              <Play className="h-4 w-4 mr-2" />
              Create Executable
            </Button>
            <CodeViewDialog
              storageId={task.hash}
              title="View Code"
              trigger={
                <Button variant="outline" size="sm">
                  <Code2 className="h-4 w-4 mr-2" />
                  Code
                </Button>
              }
            />
            <CodeViewDialog
              storageId={task.hash}
              title="View Schema"
              mode="schema"
              trigger={
                <Button variant="outline" size="sm">
                  <FileCode className="h-4 w-4 mr-2" />
                  Schema
                </Button>
              }
            />
            <Dialog
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!canDelete}
                  className={!canDelete ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Task</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this task? This action
                    cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleDelete}>
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
      {!selectionMode && (
        <CreateExecutableDialog
          taskId={task._id}
          storageId={task.hash}
          organizationId={organizationId}
          isOpen={isExecutableDialogOpen}
          onOpenChange={setIsExecutableDialogOpen}
          onSuccess={() => {
            onExecutableCreated?.();
          }}
        />
      )}
    </>
  );
}
