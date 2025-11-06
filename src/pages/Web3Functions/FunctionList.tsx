import { FileCode } from 'lucide-react';
import type { Id } from '@/../convex/_generated/dataModel';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { FunctionItem } from './FunctionItem';

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
}

interface FunctionListProps {
  tasks: Task[];
}

export function FunctionList({ tasks }: FunctionListProps) {
  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Functions</CardTitle>
          <CardDescription>
            Uploaded Web3 functions will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileCode className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              No functions found. Upload your first function to get started.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Functions</CardTitle>
        <CardDescription>
          View and manage your uploaded Web3 functions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks.map((task) => (
            <FunctionItem key={task._id} task={task} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
