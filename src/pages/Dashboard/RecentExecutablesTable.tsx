import { Link } from '@tanstack/react-router';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink } from 'lucide-react';
import type { Id } from '@/../convex/_generated/dataModel';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Executable {
  id: Id<'executables'>;
  name: string;
  status: 'active' | 'paused' | 'finished' | 'failed';
  updatedAt: number;
  createdAt: number;
  chain: {
    id: Id<'chains'>;
    chainId: number;
    name: string;
    isMainnet: boolean;
  };
  profile: {
    id: Id<'profiles'>;
    alias: string;
  };
  trigger:
    | {
        type: 'cron';
        schedule: string;
        withRetry: boolean;
        until?: number;
      }
    | {
        type: 'single';
        timestamp: number;
        withRetry: boolean;
      };
}

interface RecentExecutablesTableProps {
  executables: Executable[];
}

function getStatusBadge(status: Executable['status']) {
  switch (status) {
    case 'active':
      return (
        <Badge className="bg-success/10 text-success-foreground hover:bg-success/20">
          Active
        </Badge>
      );
    case 'paused':
      return (
        <Badge className="bg-warning/10 text-warning-foreground hover:bg-warning/20">
          Paused
        </Badge>
      );
    case 'finished':
      return (
        <Badge variant="secondary" className="bg-muted">
          Finished
        </Badge>
      );
    case 'failed':
      return (
        <Badge className="bg-destructive/10 text-destructive-foreground hover:bg-destructive/20">
          Failed
        </Badge>
      );
  }
}

export function RecentExecutablesTable({
  executables,
}: RecentExecutablesTableProps) {
  if (executables.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Executables</CardTitle>
          <CardDescription>
            Executables sorted by most recently updated
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No executables found</p>
            <p className="text-sm mt-2">
              Create your first executable to get started
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full overflow-hidden min-w-0">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Recent Executables</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Executables sorted by most recently updated
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 sm:p-6 overflow-hidden min-w-0">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto w-full max-w-full">
          <Table className="w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Chain</TableHead>
                <TableHead>Trigger Type</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {executables.map((executable) => (
                <TableRow key={executable.id}>
                  <TableCell className="font-medium">{executable.name}</TableCell>
                  <TableCell>{getStatusBadge(executable.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{executable.chain.name}</span>
                      <Badge
                        variant="outline"
                        className={
                          executable.chain.isMainnet
                            ? 'border-primary/20'
                            : 'border-muted'
                        }
                      >
                        {executable.chain.isMainnet ? 'Mainnet' : 'Testnet'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {executable.trigger.type === 'cron' ? 'Cron' : 'Single'}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(executable.updatedAt), {
                      addSuffix: true,
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      to="/executables/$executableId"
                      params={{ executableId: executable.id }}
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      View
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile/Tablet Card View */}
        <div className="md:hidden space-y-3 p-4">
          {executables.map((executable) => (
            <div
              key={executable.id}
              className="border rounded-lg p-4 space-y-3 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <Link
                    to="/executables/$executableId"
                    params={{ executableId: executable.id }}
                    className="font-medium text-sm hover:underline block truncate"
                  >
                    {executable.name}
                  </Link>
                </div>
                {getStatusBadge(executable.status)}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>{executable.chain.name}</span>
                  <Badge
                    variant="outline"
                    className={
                      executable.chain.isMainnet
                        ? 'border-primary/20'
                        : 'border-muted'
                    }
                  >
                    {executable.chain.isMainnet ? 'Mainnet' : 'Testnet'}
                  </Badge>
                </div>
                <span>•</span>
                <span>
                  {executable.trigger.type === 'cron' ? 'Cron' : 'Single'}
                </span>
                <span>•</span>
                <span>
                  {formatDistanceToNow(new Date(executable.updatedAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <div className="flex justify-end">
                <Link
                  to="/executables/$executableId"
                  params={{ executableId: executable.id }}
                  className="inline-flex items-center gap-1 text-xs sm:text-sm text-primary hover:underline"
                >
                  View Details
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

