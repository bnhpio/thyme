import { Link, useNavigate } from '@tanstack/react-router';
import { useMutation, useQuery } from 'convex/react';
import { format } from 'date-fns';
import {
  Calendar,
  ChevronLeft,
  Clock,
  Copy,
  MoreVertical,
  Pause,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import * as viemChains from 'viem/chains';
import { api } from '@/../convex/_generated/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function getChainName(chainId: number): string {
  const chain = Object.values(viemChains).find(
    (c: any) => c.id === chainId,
  ) as any;
  return chain?.name || `Chain ${chainId}`;
}

function getStatusBadgeVariant(
  status: string,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'active':
      return 'default';
    case 'paused':
      return 'secondary';
    case 'finished':
      return 'outline';
    case 'failed':
      return 'destructive';
    default:
      return 'secondary';
  }
}

function formatCronSchedule(schedule: string): string {
  // Basic cron schedule description
  // This is a simplified version - you might want to use a library like cron-parser
  const parts = schedule.split(' ');
  if (parts.length === 5) {
    const [minute, hour, day, month, weekday] = parts;
    if (
      minute.includes('-') &&
      hour === '12' &&
      day === '*' &&
      month === '*' &&
      weekday === '1'
    ) {
      const [startMin, endMin] = minute.split('-');
      return `Every minute between 12:${startMin} PM and 12:${endMin} PM, only on Monday - in UTC`;
    }
    return schedule;
  }
  return schedule;
}

interface ExecutableDetailProps {
  executableId: string;
}

export function ExecutableDetail({ executableId }: ExecutableDetailProps) {
  const navigate = useNavigate();
  const executable = useQuery(api.query.executable.getExecutableById, {
    executableId: executableId as any,
  });
  const logs = useQuery(api.query.executable.getExecutableLogs, {
    executableId: executableId as any,
  });
  const terminateExecutable = useMutation(
    api.mutation.executable.terminateExecutable,
  );

  const [showTerminateDialog, setShowTerminateDialog] = useState(false);
  const [isTerminating, setIsTerminating] = useState(false);
  const [, setCopiedId] = useState(false);
  const [, setCopiedArgs] = useState(false);
  const [, setCopiedTaskId] = useState(false);

  const handleCopy = (text: string, type: 'id' | 'args' | 'taskId') => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
    if (type === 'id') setCopiedId(true);
    if (type === 'args') setCopiedArgs(true);
    if (type === 'taskId') setCopiedTaskId(true);
    setTimeout(() => {
      if (type === 'id') setCopiedId(false);
      if (type === 'args') setCopiedArgs(false);
      if (type === 'taskId') setCopiedTaskId(false);
    }, 2000);
  };

  const handleTerminate = async () => {
    if (!executable) return;
    setIsTerminating(true);
    try {
      await terminateExecutable({ executableId: executable.id });
      toast.success('Executable terminated successfully');
      navigate({ to: '/executables' });
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to terminate executable',
      );
    } finally {
      setIsTerminating(false);
      setShowTerminateDialog(false);
    }
  };

  if (executable === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (executable === null) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-lg font-semibold mb-2">Executable not found</p>
        <p className="text-sm text-muted-foreground mb-4">
          The executable you're looking for doesn't exist or has been deleted.
        </p>
        <Link to="/executables">
          <Button variant="outline">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Executables
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Link to="/executables">
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                {getChainName(executable.chain.chainId)[0]}
              </div>
              <h1 className="text-2xl font-bold">{executable.name}</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground ml-12">
            <div className="flex items-center gap-1">
              <span>{getChainName(executable.chain.chainId)}</span>
            </div>
            {executable.createdBy && (
              <div className="flex items-center gap-1">
                <span>Created by:</span>
                <span className="font-mono text-xs">
                  {executable.createdBy.name.slice(0, 6)}...
                  {executable.createdBy.name.slice(-8)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4"
                  onClick={() =>
                    handleCopy(executable?.createdBy?.name ?? '', 'id')
                  }
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            )}
            <div className="flex items-center gap-1">
              <span>{format(new Date(executable.createdAt), 'PPP p')}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>Task ID</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4"
                onClick={() => handleCopy(executable.taskId, 'taskId')}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge variant={getStatusBadgeVariant(executable.status)}>
            {executable.status}
          </Badge>
          <div className="flex items-center gap-2">
            {executable.status === 'active' && (
              <Button variant="outline" size="sm">
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setShowTerminateDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Terminate Executable
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">
                GU used this month
              </p>
              <p className="text-2xl font-bold">0</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Average GU per run
              </p>
              <p className="text-2xl font-bold">0</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Runs this month</p>
              <p className="text-2xl font-bold">0</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Throttled runs this month
              </p>
              <p className="text-2xl font-bold">0</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Success rate</p>
              <p className="text-2xl font-bold">100.00%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Executions</p>
              <p className="text-2xl font-bold">0</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trigger */}
      <Card>
        <CardHeader>
          <CardTitle>Trigger</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Trigger</span>
              <div className="flex items-center gap-2">
                {executable.trigger.type === 'cron' ? (
                  <span className="font-medium">
                    Cron: {executable.trigger.schedule}
                  </span>
                ) : (
                  <>
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">
                      Single Run:{' '}
                      {format(new Date(executable.trigger.timestamp), 'PPP p')}
                    </span>
                  </>
                )}
              </div>
            </div>
            {executable.trigger.type === 'cron' && (
              <>
                <p className="text-sm text-muted-foreground">
                  {formatCronSchedule(executable.trigger.schedule)}
                </p>
                {executable.trigger.until && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Until:{' '}
                      {format(new Date(executable.trigger.until), 'PPP p')}
                    </span>
                  </div>
                )}
              </>
            )}
            {executable.trigger.withRetry && (
              <div className="flex items-center gap-2">
                <span className="text-xs bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded">
                  Retry enabled (max 5 attempts)
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Function Details */}
      <Card>
        <CardHeader>
          <CardTitle>Function</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Task ID</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">{executable.taskId}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleCopy(executable.taskId, 'taskId')}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Arguments</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm max-w-md truncate">
                  {executable.args}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleCopy(executable.args, 'args')}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Profile</span>
              <span className="font-medium">{executable.profile.alias}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Chain</span>
              <span className="font-medium">
                {getChainName(executable.chain.chainId)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="executions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="executions">Executions</TabsTrigger>
          <TabsTrigger value="logs">Task Logs</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
          <TabsTrigger value="storage">Storage</TabsTrigger>
          <TabsTrigger value="secrets">Secrets</TabsTrigger>
        </TabsList>
        <TabsContent value="executions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Executions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-48 flex items-center justify-center border rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground">
                    Execution chart will be displayed here
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    No executions yet
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Task Logs</CardTitle>
            </CardHeader>
            <CardContent>
              {logs === undefined ? (
                <p className="text-sm text-muted-foreground">Loading logs...</p>
              ) : logs.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No logs available
                </p>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {logs.map((log) => {
                    const logColor =
                      log.type === 'error'
                        ? 'bg-red-50 dark:bg-red-950/20 border-red-200 text-red-900 dark:text-red-200'
                        : log.type === 'warn'
                          ? 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 text-yellow-900 dark:text-yellow-200'
                          : 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 text-blue-900 dark:text-blue-200';
                    return (
                      <div
                        key={log.id}
                        className={`p-3 rounded-lg border ${logColor}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                variant={
                                  log.type === 'error'
                                    ? 'destructive'
                                    : log.type === 'warn'
                                      ? 'secondary'
                                      : 'default'
                                }
                                className="text-xs"
                              >
                                {log.type.toUpperCase()}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(log.createdAt), 'PPpp')}
                              </span>
                            </div>
                            <pre className="text-sm whitespace-pre-wrap break-words font-mono">
                              {typeof log.log === 'string'
                                ? log.log
                                : JSON.stringify(log.log, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="code">
          <Card>
            <CardHeader>
              <CardTitle>Code</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Code view coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="storage">
          <Card>
            <CardHeader>
              <CardTitle>Storage</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Storage view coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="secrets">
          <Card>
            <CardHeader>
              <CardTitle>Secrets</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Secrets view coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Terminate Confirmation Dialog */}
      <Dialog open={showTerminateDialog} onOpenChange={setShowTerminateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terminate Executable</DialogTitle>
            <DialogDescription>
              Are you sure you want to terminate this executable? This will stop
              the cron job (if running) and permanently delete the executable.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTerminateDialog(false)}
              disabled={isTerminating}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleTerminate}
              disabled={isTerminating}
            >
              {isTerminating ? 'Terminating...' : 'Terminate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
