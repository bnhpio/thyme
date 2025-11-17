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

interface Executable {
  id: Id<'executables'>;
  name: string;
  status: 'active' | 'paused';
  updatedAt: number;
  chain: {
    id: Id<'chains'>;
    chainId: number;
    name: string;
    isMainnet: boolean;
  };
  trigger:
    | {
        type: 'cron';
        schedule: string;
      }
    | {
        type: 'interval';
        interval: number;
        startAt?: number;
      };
}

interface TopExecutablesListProps {
  executables: Executable[];
}

function getStatusBadge(status: Executable['status']) {
  if (status === 'active') {
    return (
      <Badge className="bg-success/10 text-success-foreground hover:bg-success/20">
        Active
      </Badge>
    );
  }
  return (
    <Badge className="bg-warning/10 text-warning-foreground hover:bg-warning/20">
      Paused
    </Badge>
  );
}

export function TopExecutablesList({ executables }: TopExecutablesListProps) {
  if (executables.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Executables</CardTitle>
          <CardDescription>Most recently updated executables</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No executables found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full overflow-hidden min-w-0">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Top Executables</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Most recently updated executables
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6 w-full min-w-0">
        <div className="space-y-3 sm:space-y-4">
          {executables.map((executable, index) => (
            <div
              key={executable.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 text-primary font-medium text-xs sm:text-sm shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Link
                      to="/executables/$executableId"
                      params={{ executableId: executable.id }}
                      className="font-medium text-sm sm:text-base hover:underline truncate"
                    >
                      {executable.name}
                    </Link>
                    {getStatusBadge(executable.status)}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground">
                    <span className="truncate">{executable.chain.name}</span>
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
                    <span>•</span>
                    <span>
                      {executable.trigger.type === 'cron' ? 'Cron' : 'Interval'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                <div className="text-left sm:text-right text-xs sm:text-sm text-muted-foreground">
                  <div className="hidden sm:block">Updated</div>
                  <div className="font-medium">
                    {formatDistanceToNow(new Date(executable.updatedAt), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
                <Link
                  to="/executables/$executableId"
                  params={{ executableId: executable.id }}
                  className="text-primary hover:underline shrink-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
