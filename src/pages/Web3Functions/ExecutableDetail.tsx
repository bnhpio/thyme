import { Link, useNavigate } from '@tanstack/react-router';
import { useAction, useQuery } from 'convex/react';
import cronstrue from 'cronstrue';
import { format } from 'date-fns';
import {
  Activity,
  Calendar,
  CheckCircle,
  ChevronLeft,
  Clock,
  Copy,
  ExternalLink,
  Pause,
  Pencil,
  Play,
  Repeat,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';
import { zeroAddress } from 'viem';
import * as viemChains from 'viem/chains';
import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  type BundledLanguage,
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockFilename,
  CodeBlockFiles,
  CodeBlockHeader,
  CodeBlockItem,
} from '@/components/ui/shadcn-io/code-block';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { parseOpenAPISchema, type SchemaField } from './schema-utils';

function getChainConfig(chainId: number): any {
  return Object.values(viemChains).find((chain: any) => chain.id === chainId);
}

function getChainName(chainId: number): string {
  const chain = getChainConfig(chainId);
  return chain?.name || `Chain ${chainId}`;
}

function getStatusBadgeVariant(
  status: 'active' | 'paused',
): 'default' | 'secondary' {
  return status === 'active' ? 'default' : 'secondary';
}

function formatCronSchedule(schedule: string): string {
  try {
    return cronstrue.toString(schedule, {
      throwExceptionOnParseError: false,
      verbose: false,
      use24HourTimeFormat: false,
    });
  } catch {
    // Fallback to original schedule if parsing fails
    return schedule;
  }
}

function getHistoryLabel(change: 'register' | 'pause' | 'resume'): string {
  if (change === 'register') return 'Created';
  if (change === 'pause') return 'Paused';
  return 'Resumed';
}

interface ExecutableDetailProps {
  executableId: string;
}

export function ExecutableDetail({ executableId }: ExecutableDetailProps) {
  const navigate = useNavigate();
  const executableIdTyped = executableId as Id<'executables'>;
  const executable = useQuery(api.query.executable.getExecutableById, {
    executableId: executableIdTyped,
  });
  const logs = useQuery(api.query.executable.getExecutableLogs, {
    executableId: executableIdTyped,
  });
  const history = useQuery(api.query.executable.getExecutableHistory, {
    executableId: executableIdTyped,
  });
  const executions = useQuery(
    api.query.executable.getExecutionsByExecutableId,
    {
      executableId: executableIdTyped,
    },
  );
  const taskCode = useAction(api.action.task.getTaskCode);
  const taskSchema = useAction(api.action.task.getTaskSchema);
  const [code, setCode] = useState<string | null>(null);
  const [schemaFields, setSchemaFields] = useState<SchemaField[]>([]);
  const [isLoadingCode, setIsLoadingCode] = useState(false);
  const [isLoadingSchema, setIsLoadingSchema] = useState(false);
  const terminateExecutable = useAction(
    api.action.executable.terminateExecutable,
  );
  const pauseExecutableMutation = useAction(
    api.action.executable.pauseExecutable,
  );
  const resumeExecutableMutation = useAction(
    api.action.executable.resumeExecutable,
  );
  const renameExecutableMutation = useAction(
    api.action.executable.renameExecutable,
  );

  const [showTerminateDialog, setShowTerminateDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [newName, setNewName] = useState('');
  const [isTerminating, setIsTerminating] = useState(false);
  const [isPausing, setIsPausing] = useState(false);
  const [isResuming, setIsResuming] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [, setCopiedId] = useState(false);
  const [, setCopiedArgs] = useState(false);
  const [, setCopiedTaskId] = useState(false);

  // Load code when executable is available
  useEffect(() => {
    if (executable?.taskStorageId && !code && !isLoadingCode) {
      setIsLoadingCode(true);
      taskCode({ storageId: executable.taskStorageId })
        .then((result) => {
          setCode(result);
          setIsLoadingCode(false);
        })
        .catch((error) => {
          console.error('Failed to load code:', error);
          setIsLoadingCode(false);
        });
    }
  }, [executable?.taskStorageId, code, isLoadingCode, taskCode]);

  // Load schema when executable is available
  useEffect(() => {
    if (
      executable?.taskStorageId &&
      schemaFields.length === 0 &&
      !isLoadingSchema
    ) {
      setIsLoadingSchema(true);
      taskSchema({ storageId: executable.taskStorageId })
        .then((schemaJson) => {
          if (schemaJson) {
            const fields = parseOpenAPISchema(schemaJson);
            setSchemaFields(fields);
          }
          setIsLoadingSchema(false);
        })
        .catch((error) => {
          console.error('Failed to load schema:', error);
          setIsLoadingSchema(false);
        });
    }
  }, [
    executable?.taskStorageId,
    schemaFields.length,
    isLoadingSchema,
    taskSchema,
  ]);

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

  const handlePause = async () => {
    if (!executable) return;
    setIsPausing(true);
    try {
      await pauseExecutableMutation({ executableId: executable.id });
      toast.success('Executable paused');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to pause executable',
      );
    } finally {
      setIsPausing(false);
    }
  };

  const handleResume = async () => {
    if (!executable) return;
    setIsResuming(true);
    try {
      await resumeExecutableMutation({ executableId: executable.id });
      toast.success('Executable resumed');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to resume executable',
      );
    } finally {
      setIsResuming(false);
    }
  };

  const handleRename = async () => {
    if (!executable || !newName.trim()) return;
    setIsRenaming(true);
    try {
      await renameExecutableMutation({
        executableId: executable.id,
        name: newName.trim(),
      });
      toast.success('Executable renamed');
      setShowRenameDialog(false);
      setNewName('');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to rename executable',
      );
    } finally {
      setIsRenaming(false);
    }
  };

  const handleTerminate = async () => {
    if (!executable) return;
    if (executable.status !== 'paused') {
      toast.error('Pause this executable before terminating it');
      setShowTerminateDialog(false);
      return;
    }
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
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                  {getChainName(executable.chain.chainId)[0]}
                </div>
                <h1 className="text-2xl font-bold">{executable.name}</h1>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant={getStatusBadgeVariant(executable.status)}
            className="capitalize"
          >
            {executable.status}
          </Badge>
          {executable.status === 'active' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePause}
              disabled={isPausing || isResuming}
            >
              <Pause className="h-4 w-4 mr-2" />
              {isPausing ? 'Pausing...' : 'Pause'}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResume}
              disabled={isPausing || isResuming}
            >
              <Play className="h-4 w-4 mr-2" />
              {isResuming ? 'Resuming...' : 'Resume'}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setNewName(executable.name);
              setShowRenameDialog(true);
            }}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Rename
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTerminateDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Terminate
          </Button>
        </div>
      </div>

      {/* Statistics */}
      {executions && executions.length > 0 && (
        <ExecutionsStatistics executions={executions} />
      )}

      {/* Trigger */}
      <Card>
        <CardHeader>
          <CardTitle>Trigger</CardTitle>
        </CardHeader>
        <CardContent>
          {executable.trigger.type === 'cron' ? (
            <div className="flex items-start gap-4 p-4 rounded-lg border bg-muted/30">
              <div className="shrink-0 mt-0.5">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono text-xs">
                    Cron Schedule
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <code className="px-2 py-1 rounded bg-background border text-sm font-mono">
                      {executable.trigger.schedule}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => {
                        const schedule =
                          executable.trigger.type === 'cron'
                            ? executable.trigger.schedule
                            : '';
                        navigator.clipboard.writeText(schedule);
                        toast.success('Cron schedule copied');
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatCronSchedule(executable.trigger.schedule)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-4 p-4 rounded-lg border bg-muted/30">
              <div className="shrink-0 mt-0.5">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Repeat className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="font-mono text-xs">
                    Interval
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-base font-semibold">
                        Every {executable.trigger.interval} seconds
                      </span>
                    </div>
                  </div>
                  {executable.trigger.startAt && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        Starts{' '}
                        {format(new Date(executable.trigger.startAt), 'PPP p')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
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
              <span className="text-sm text-muted-foreground">Profile</span>
              <span className="font-medium">{executable.profile.alias}</span>
            </div>
            {executable.profile.address && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Profile Address
                </span>
                <div className="flex items-center gap-2">
                  {(() => {
                    const addressUrl = getAddressUrl(
                      executable.chain.explorerUrl,
                      executable.profile.address,
                    );
                    return addressUrl ? (
                      <a
                        href={addressUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        {formatAddress(executable.profile.address)}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="font-mono text-sm">
                        {formatAddress(executable.profile.address)}
                      </span>
                    );
                  })()}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        executable.profile.address ?? zeroAddress,
                      );
                      toast.success('Address copied to clipboard');
                    }}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
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
        <TabsList className="flex flex-row gap-2">
          <TabsTrigger value="executions">Executions</TabsTrigger>
          <TabsTrigger value="logs">Task Logs</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
          <TabsTrigger value="args">Args</TabsTrigger>
        </TabsList>
        <TabsContent value="executions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Executions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {executions && executions.length > 0 ? (
                  <ExecutionsChart executions={executions} />
                ) : (
                  <div className="h-48 flex items-center justify-center border rounded-lg bg-muted/30">
                    <p className="text-sm text-muted-foreground">
                      No execution data available for chart
                    </p>
                  </div>
                )}
                {executions === undefined ? (
                  <p className="text-sm text-muted-foreground">
                    Loading executions...
                  </p>
                ) : executions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No executions recorded yet
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[140px]">Status</TableHead>
                          <TableHead>Transaction</TableHead>
                          <TableHead>Started</TableHead>
                          <TableHead>Updated</TableHead>
                          <TableHead>Duration</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {executions.map((execution) => (
                          <TableRow key={execution.id}>
                            <TableCell className="w-[140px]">
                              <Badge
                                className="w-full justify-center"
                                variant={getExecutionStatusBadgeVariant(
                                  execution.status,
                                )}
                              >
                                {getExecutionStatusLabel(execution.status)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {execution.transactionHashes.length > 0 ? (
                                <div className="flex flex-col gap-1">
                                  {execution.transactionHashes.map((hash) => {
                                    const txUrl = getTransactionUrl(
                                      executable.chain.explorerUrl,
                                      hash,
                                    );
                                    return (
                                      <div
                                        key={hash}
                                        className="flex items-center gap-2"
                                      >
                                        {txUrl ? (
                                          <a
                                            href={txUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="font-mono text-sm text-primary hover:underline flex items-center gap-1"
                                          >
                                            {formatTransactionHash(hash)}
                                            <ExternalLink className="h-3 w-3" />
                                          </a>
                                        ) : (
                                          <span className="font-mono text-sm">
                                            {formatTransactionHash(hash)}
                                          </span>
                                        )}
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6"
                                          onClick={() => {
                                            navigator.clipboard.writeText(hash);
                                            toast.success(
                                              'Transaction hash copied',
                                            );
                                          }}
                                        >
                                          <Copy className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  —
                                </span>
                              )}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {format(new Date(execution.startedAt), 'PPpp')}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {format(new Date(execution.updatedAt), 'PPpp')}
                            </TableCell>
                            <TableCell className="text-sm font-mono">
                              <ExecutionDuration
                                startedAt={execution.startedAt}
                                finishedAt={execution.finishedAt}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
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
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Type</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead className="w-[180px]">Timestamp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {flattenLogs(logs).map((log) => (
                        <TableRow key={log.id}>
                          <TableCell>
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
                          </TableCell>
                          <TableCell>
                            <pre className="text-sm whitespace-pre-wrap wrap-break-word font-mono max-w-2xl">
                              {log.message}
                            </pre>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(log.createdAt), 'PPpp')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>History</CardTitle>
            </CardHeader>
            <CardContent>
              {history === undefined ? (
                <p className="text-sm text-muted-foreground">
                  Loading history...
                </p>
              ) : history.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No history recorded yet
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Timestamp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {history.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="font-medium">
                            {getHistoryLabel(entry.change)}
                          </TableCell>
                          <TableCell>
                            {entry.user?.name ?? 'Unknown user'}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(entry.timestamp), 'PPpp')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
              {isLoadingCode ? (
                <p className="text-sm text-muted-foreground">Loading code...</p>
              ) : code ? (
                <div className="rounded-lg border overflow-hidden">
                  <CodeBlock
                    data={[
                      {
                        language: 'typescript' as BundledLanguage,
                        filename: 'source.ts',
                        code,
                      },
                    ]}
                    defaultValue="typescript"
                    className="flex h-full min-h-0 flex-col"
                  >
                    <CodeBlockHeader>
                      <CodeBlockFiles>
                        {(item) => (
                          <CodeBlockFilename
                            key={item.language}
                            value={item.language}
                          >
                            {item.filename}
                          </CodeBlockFilename>
                        )}
                      </CodeBlockFiles>
                      <div className="ml-auto" />
                      <CodeBlockCopyButton />
                    </CodeBlockHeader>
                    <CodeBlockBody className="flex-1 min-h-0 overflow-hidden">
                      {(item) => (
                        <CodeBlockItem
                          key={item.language}
                          value={item.language}
                          className="h-full overflow-auto"
                        >
                          <CodeBlockContent
                            language={item.language as BundledLanguage}
                          >
                            {item.code}
                          </CodeBlockContent>
                        </CodeBlockItem>
                      )}
                    </CodeBlockBody>
                  </CodeBlock>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No code available
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="args">
          <Card>
            <CardHeader>
              <CardTitle>Arguments</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingSchema ? (
                <p className="text-sm text-muted-foreground">
                  Loading schema...
                </p>
              ) : schemaFields.length > 0 ? (
                <div className="space-y-6">
                  {(() => {
                    let parsedArgs: Record<string, unknown> = {};
                    try {
                      parsedArgs = JSON.parse(executable.args);
                    } catch {
                      parsedArgs = {};
                    }
                    return schemaFields.map((field) => (
                      <div key={field.name} className="space-y-2">
                        <Label className="text-sm font-medium">
                          {field.name}
                          {field.required && (
                            <span className="text-destructive ml-1">*</span>
                          )}
                        </Label>
                        {field.description && (
                          <p className="text-xs text-muted-foreground">
                            {field.description}
                          </p>
                        )}
                        {renderReadonlySchemaField(
                          field,
                          parsedArgs[field.name],
                        )}
                      </div>
                    ));
                  })()}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <pre className="text-sm font-mono overflow-x-auto">
                      {executable.args}
                    </pre>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    No schema available. Showing raw JSON.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        {/* <TabsContent value="storage">
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
        </TabsContent> */}
        {/* <TabsContent value="secrets">
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
        </TabsContent> */}
      </Tabs>

      {/* Terminate Confirmation Dialog */}
      <Dialog open={showTerminateDialog} onOpenChange={setShowTerminateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terminate Executable</DialogTitle>
            <DialogDescription>
              {executable?.status !== 'paused'
                ? 'Pause the executable before terminating it. Termination is only allowed for paused executables.'
                : 'Are you sure you want to terminate this executable? This will stop the cron job (if running) and permanently delete the executable. This action cannot be undone.'}
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
              disabled={isTerminating || executable?.status !== 'paused'}
            >
              {isTerminating ? 'Terminating...' : 'Terminate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Executable</DialogTitle>
            <DialogDescription>
              Enter a new name for this executable task.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter task name"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newName.trim()) {
                  handleRename();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRenameDialog(false);
                setNewName('');
              }}
              disabled={isRenaming}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              disabled={isRenaming || !newName.trim()}
            >
              {isRenaming ? 'Renaming...' : 'Rename'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ExecutionDuration({ startedAt, finishedAt }: ExecutionDurationProps) {
  if (!finishedAt) return <LiveExecutionDuration startedAt={startedAt} />;
  return <span>{formatExecutionDuration(startedAt, finishedAt)}</span>;
}

function LiveExecutionDuration({ startedAt }: LiveExecutionDurationProps) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 50);
    return () => clearInterval(interval);
  }, []);

  return <span>{formatDurationMs(Math.max(now - startedAt, 0))}</span>;
}

type ExecutionStatus =
  | 'pending'
  | 'simulation_pending'
  | 'simulation_failed'
  | 'sending'
  | 'success'
  | 'validating'
  | 'sending_failed'
  | 'failed'
  | 'skipped';

const executionStatusContent: Record<
  ExecutionStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' }
> = {
  pending: { label: 'Pending', variant: 'secondary' },
  simulation_pending: { label: 'Simulation Pending', variant: 'secondary' },
  simulation_failed: { label: 'Simulation Failed', variant: 'destructive' },
  sending: { label: 'Broadcasting', variant: 'default' },
  success: { label: 'Success', variant: 'default' },
  sending_failed: { label: 'Broadcast Failed', variant: 'destructive' },
  failed: { label: 'Failed', variant: 'destructive' },
  validating: { label: 'Validating', variant: 'default' },
  skipped: { label: 'Skipped', variant: 'secondary' },
};

function getExecutionStatusLabel(status: ExecutionStatus): string {
  return executionStatusContent[status]?.label ?? status;
}

function getExecutionStatusBadgeVariant(
  status: ExecutionStatus,
): 'default' | 'secondary' | 'destructive' {
  return executionStatusContent[status]?.variant ?? 'secondary';
}

function formatTransactionHash(hash: string): string {
  if (!hash) return '—';
  if (hash.length <= 12) return hash;
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

function formatAddress(address: string): string {
  if (!address) return '—';
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getAddressUrl(
  explorerUrl: string | undefined,
  address: string,
): string | null {
  if (!explorerUrl || !address) return null;
  const baseUrl = explorerUrl.replace(/\/$/, '');
  return `${baseUrl}/address/${address}`;
}

function getTransactionUrl(
  explorerUrl: string | undefined,
  txHash: string,
): string | null {
  if (!explorerUrl || !txHash) return null;
  // Remove trailing slash if present
  const baseUrl = explorerUrl.replace(/\/$/, '');
  // Most explorers use /tx/ or /transaction/ for transaction URLs
  // Common patterns: /tx/{hash}, /transaction/{hash}, /txs/{hash}
  return `${baseUrl}/tx/${txHash}`;
}

function formatExecutionDuration(
  startedAt: number,
  finishedAt?: number,
): string {
  if (!finishedAt) return '—';
  const durationMs = Math.max(finishedAt - startedAt, 0);
  return formatDurationMs(durationMs);
}

function formatDurationMs(durationMs: number): string {
  if (durationMs < 1000) return `${durationMs} ms`;
  return `${(durationMs / 1000).toFixed(2)} s`;
}

interface LogEntryObject {
  type: 'info' | 'warn' | 'error';
  message: string;
}

function isLogEntryObject(entry: unknown): entry is LogEntryObject {
  return (
    typeof entry === 'object' &&
    entry !== null &&
    'type' in entry &&
    'message' in entry &&
    typeof (entry as LogEntryObject).message === 'string' &&
    ['info', 'warn', 'error'].includes((entry as LogEntryObject).type)
  );
}

function parseLogEntry(entry: string | LogEntryObject): LogEntryObject {
  // Handle structured log objects (new format from SDK logger)
  if (isLogEntryObject(entry)) {
    return entry;
  }

  // Handle string entries (legacy format)
  if (typeof entry === 'string') {
    const logMatch = entry.match(/^\[LOG\]\s*(.*)$/i);
    const infoMatch = entry.match(/^\[INFO\]\s*(.*)$/i);
    const warnMatch = entry.match(/^\[WARN\]\s*(.*)$/i);
    const errorMatch = entry.match(/^\[ERROR\]\s*(.*)$/i);

    if (errorMatch) {
      return { type: 'error', message: errorMatch[1] };
    }
    if (warnMatch) {
      return { type: 'warn', message: warnMatch[1] };
    }
    if (logMatch) {
      return { type: 'info', message: logMatch[1] };
    }
    if (infoMatch) {
      return { type: 'info', message: infoMatch[1] };
    }

    return { type: 'info', message: entry };
  }

  return { type: 'info', message: String(entry) };
}

function flattenLogs(
  logs: Array<{ id: string; log: unknown; createdAt: number }>,
): Array<{
  id: string;
  type: 'info' | 'warn' | 'error';
  message: string;
  createdAt: number;
}> {
  const flattened: Array<{
    id: string;
    type: 'info' | 'warn' | 'error';
    message: string;
    createdAt: number;
  }> = [];

  logs.forEach((log) => {
    if (Array.isArray(log.log)) {
      log.log.forEach((entry: unknown) => {
        const parsed = parseLogEntry(entry as string | LogEntryObject);
        flattened.push({
          id: `${log.id}-${flattened.length}`,
          type: parsed.type,
          message: parsed.message,
          createdAt: log.createdAt,
        });
      });
    } else if (isLogEntryObject(log.log)) {
      flattened.push({
        id: log.id,
        type: log.log.type,
        message: log.log.message,
        createdAt: log.createdAt,
      });
    } else if (typeof log.log === 'string') {
      const parsed = parseLogEntry(log.log);
      flattened.push({
        id: log.id,
        type: parsed.type,
        message: parsed.message,
        createdAt: log.createdAt,
      });
    } else {
      flattened.push({
        id: log.id,
        type: 'info',
        message: JSON.stringify(log.log, null, 2),
        createdAt: log.createdAt,
      });
    }
  });

  return flattened;
}

function renderReadonlySchemaField(
  field: SchemaField,
  value: unknown,
): React.ReactNode {
  const fieldValue = value ?? field.default ?? '';

  switch (field.type) {
    case 'boolean':
      return (
        <div className="flex items-center space-x-2">
          <Switch checked={Boolean(fieldValue)} disabled />
          <Label className="text-sm font-normal">
            {fieldValue ? 'Yes' : 'No'}
          </Label>
        </div>
      );

    case 'integer':
    case 'number':
      return (
        <Input
          type="number"
          value={String(fieldValue)}
          disabled
          className="h-10 bg-muted"
        />
      );

    case 'array':
      return (
        <Textarea
          value={
            Array.isArray(fieldValue)
              ? JSON.stringify(fieldValue, null, 2)
              : String(fieldValue)
          }
          disabled
          className="min-h-20 font-mono text-sm bg-muted"
        />
      );

    case 'object':
      return (
        <Textarea
          value={
            typeof fieldValue === 'object' && fieldValue !== null
              ? JSON.stringify(fieldValue, null, 2)
              : String(fieldValue)
          }
          disabled
          className="min-h-24 font-mono text-sm bg-muted"
        />
      );

    default:
      if (field.enum) {
        return (
          <Select value={String(fieldValue)} disabled>
            <SelectTrigger className="h-10 bg-muted">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {field.enum.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }

      if (
        field.format === 'textarea' ||
        (field.maxLength && field.maxLength > 100)
      ) {
        return (
          <Textarea
            value={String(fieldValue)}
            disabled
            className="min-h-20 bg-muted"
          />
        );
      }

      return (
        <Input
          type={field.format === 'email' ? 'email' : 'text'}
          value={String(fieldValue)}
          disabled
          className="h-10 bg-muted"
        />
      );
  }
}

interface ExecutionDurationProps {
  startedAt: number;
  finishedAt?: number;
}

interface LiveExecutionDurationProps {
  startedAt: number;
}

interface ExecutionsChartProps {
  executions: Array<{
    id: string;
    startedAt: number;
    status: string;
  }>;
}

interface ExecutionsStatisticsProps {
  executions: Array<{
    id: string;
    startedAt: number;
    status: string;
    cost: {
      price: string;
    };
  }>;
}

function ExecutionsStatistics({ executions }: ExecutionsStatisticsProps) {
  const now = Date.now();
  const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

  // Filter executions from last 24 hours
  const last24HoursExecutions = executions.filter(
    (execution) => execution.startedAt >= twentyFourHoursAgo,
  );

  // Calculate metrics
  const executionsCount = last24HoursExecutions.length;

  // Count successful executions
  const successfulExecutions = last24HoursExecutions.filter(
    (execution) => execution.status === 'success',
  ).length;

  // Count failed executions
  const failedExecutions = last24HoursExecutions.filter(
    (execution) =>
      execution.status === 'failed' ||
      execution.status === 'sending_failed' ||
      execution.status === 'simulation_failed',
  ).length;

  // Calculate success rate
  const successRate =
    executionsCount > 0
      ? ((successfulExecutions / executionsCount) * 100).toFixed(1)
      : '0.0';

  const stats = [
    {
      title: 'Executions (24h)',
      value: executionsCount,
      description: 'Total executions in last 24 hours',
      icon: Activity,
      className: 'border-primary/20',
    },
    {
      title: 'Success Rate',
      value: `${successRate}%`,
      description: `${successfulExecutions} successful out of ${executionsCount} total`,
      icon: CheckCircle,
      className: 'border-success/20 bg-success/5',
      valueClassName: 'text-success',
    },
    {
      title: 'Successful',
      value: successfulExecutions,
      description: 'Executions completed successfully',
      icon: CheckCircle,
      className: 'border-success/20 bg-success/5',
      valueClassName: 'text-success',
    },
    {
      title: 'Failed',
      value: failedExecutions,
      description: 'Executions that failed',
      icon: XCircle,
      className: 'border-success/20 bg-success/5',
      valueClassName: 'text-destructive',
    },
  ];

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full min-w-0">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.title}
            className={`${stat.className} w-full overflow-hidden min-w-0`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-xl sm:text-2xl font-bold ${stat.valueClassName || ''}`}
              >
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function ExecutionsChart({ executions }: ExecutionsChartProps) {
  // Group executions by hour
  const hourlyData = executions.reduce(
    (acc, execution) => {
      const date = new Date(execution.startedAt);
      const hourKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;

      if (!acc[hourKey]) {
        acc[hourKey] = 0;
      }
      acc[hourKey]++;
      return acc;
    },
    {} as Record<string, number>,
  );

  // Convert to array and sort by time
  const chartData = Object.entries(hourlyData)
    .map(([hour, count]) => ({
      hour,
      count,
    }))
    .sort((a, b) => a.hour.localeCompare(b.hour));

  // Format hour labels for display
  const formattedChartData = chartData.map((item) => {
    const date = new Date(item.hour);
    return {
      hour: format(date, 'MMM dd, HH:mm'),
      hourFull: item.hour,
      count: item.count,
    };
  });

  const chartConfig: ChartConfig = {
    count: {
      label: 'Executions',
      color: 'var(--chart-2)',
    },
  };

  if (formattedChartData.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center border rounded-lg bg-muted/30">
        <p className="text-sm text-muted-foreground">
          No execution data available for chart
        </p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ChartContainer config={chartConfig} className="h-full w-full">
        <BarChart
          data={formattedChartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis
            dataKey="hour"
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
            angle={-45}
            textAnchor="end"
            height={80}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            tickLine={{ stroke: 'hsl(var(--muted-foreground))' }}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => [
                  `${value} execution${Number(value) !== 1 ? 's' : ''}`,
                  'Count',
                ]}
              />
            }
          />
          <Bar
            dataKey="count"
            fill="var(--color-count)"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
