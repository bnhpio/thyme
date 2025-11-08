import { useNavigate } from '@tanstack/react-router';
import { useQuery } from 'convex/react';
import { ChevronDown, Filter, Play, Search } from 'lucide-react';
import { useState } from 'react';
import * as viemChains from 'viem/chains';
import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ExecutablesListProps {
  organizationId: Id<'organizations'>;
}

function getChainName(chainId: number): string {
  const chain = Object.values(viemChains).find(
    (c: any) => c.id === chainId,
  ) as any;
  return chain?.name || `Chain ${chainId}`;
}

function isMainnet(chainId: number): boolean {
  const chain = Object.values(viemChains).find(
    (c: any) => c.id === chainId,
  ) as any;
  // viem chains have a `testnet` property that is false for mainnet chains
  // If testnet is undefined or false, it's mainnet
  return chain && chain.testnet !== true;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getNetworkColor(chainId: number): string {
  // Red dot for mainnet, yellow dot for testnet
  return isMainnet(chainId)
    ? 'bg-destructive'
    : 'bg-warning';
}

export function ExecutablesList({ organizationId }: ExecutablesListProps) {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<
    'active' | 'paused' | 'finished' | 'failed' | 'all'
  >('all');
  const [chainFilter, setChainFilter] = useState<Id<'chains'> | 'all'>('all');
  const [profileFilter] = useState<Id<'profiles'> | 'all'>('all');
  const [triggerTypeFilter] = useState<'single' | 'cron' | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const stats = useQuery(api.query.executable.getExecutableStats, {
    organizationId,
  });
  const chains = useQuery(api.query.chain.getAllChains);

  const executables = useQuery(
    api.query.executable.getExecutablesByOrganization,
    {
      organizationId,
      filters: {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        chainId: chainFilter !== 'all' ? chainFilter : undefined,
        profileId: profileFilter !== 'all' ? profileFilter : undefined,
        triggerType:
          triggerTypeFilter !== 'all' ? triggerTypeFilter : undefined,
      },
    },
  );

  const filteredExecutables = executables?.filter((executable) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        executable.name.toLowerCase().includes(query) ||
        executable.profile.alias.toLowerCase().includes(query) ||
        getChainName(executable.chain.chainId).toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                Executables stats & performance
              </CardTitle>
            </div>
            <Button variant="ghost" size="icon">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {stats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Mainnet tasks</p>
                <p className="text-lg font-semibold">{stats.mainnet} active</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Testnet tasks</p>
                <p className="text-lg font-semibold">{stats.testnet} active</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Total executables
                </p>
                <p className="text-lg font-semibold">{stats.total}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-lg font-semibold">{stats.active}</p>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Loading stats...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <div className="min-w-[150px]">
              <Select
                value={chainFilter}
                onValueChange={(value) =>
                  setChainFilter(value as typeof chainFilter)
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Networks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Networks</SelectItem>
                  {chains
                    ?.sort((a, b) => a.chainId - b.chainId)
                    .map((chain) => (
                      <SelectItem key={chain._id} value={chain._id}>
                        {getChainName(chain.chainId)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-[150px]">
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as typeof statusFilter)
                }
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Creation date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="finished">Finished</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="pt-6">
          {filteredExecutables === undefined ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          ) : filteredExecutables.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Play className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                No executables found
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status / Task name</TableHead>
                  <TableHead>Network</TableHead>
                  <TableHead>Throttled</TableHead>
                  <TableHead>Runs</TableHead>
                  <TableHead>Executions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExecutables.map((executable) => (
                  <TableRow
                    key={executable.id}
                    className="cursor-pointer hover:bg-accent/50"
                    onClick={() => {
                      console.log('Navigating to:', executable.id);
                      navigate({
                        to: '/executables/$executableId',
                        params: { executableId: executable.id as string },
                      });
                    }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-2 w-2 rounded-full ${getNetworkColor(executable.chain.chainId)}`}
                        />
                        <span className="font-medium">{executable.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{getChainName(executable.chain.chainId)}</span>
                      </div>
                    </TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>0</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(executable.updatedAt)}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
