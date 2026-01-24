import { useNavigate } from '@tanstack/react-router';
import { type ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { InfinityIcon } from 'lucide-react';
import * as viemChains from 'viem/chains';
import type { Id } from '@/../convex/_generated/dataModel';
import { DataTable } from '@/components/data-table';
import { cn } from '@/lib/utils';

interface Executable {
  id: Id<'executables'>;
  name: string;
  status: 'active' | 'paused';
  chain: {
    chainId: number;
  };
  profile: {
    alias: string;
  };
  trigger: {
    type: 'cron' | 'interval';
    schedule?: string;
    interval?: number;
  };
  updatedAt: number;
  createdAt: number;
  runs: number;
  executions: number;
}

interface ExecutablesTableProps {
  executables: Executable[] | undefined;
}

function getChainName(chainId: number): string {
  const chain = Object.values(viemChains).find((c: any) => c.id === chainId);
  return chain?.name || `Chain ${chainId}`;
}

const columnHelper = createColumnHelper<Executable>();

export function ExecutablesTable({ executables }: ExecutablesTableProps) {
  const navigate = useNavigate();

  const columns: ColumnDef<Executable, any>[] = [
    columnHelper.accessor('name', {
      header: 'Task name',
      meta: {
        headerClassName: 'px-6',
        className: 'px-6 h-16',
      },
      cell: (info) => {
        const executable = info.row.original;
        if (!executable) return null;
        return <span>{executable.name}</span>;
      },
      enableSorting: true,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => {
        const status = info.getValue();
        return (
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'size-2 rounded-full',
                status === 'active' ? 'bg-success' : 'bg-warning',
              )}
            />
            <span className="text-sm capitalize">{status}</span>
          </div>
        );
      },
      enableSorting: true,
    }),
    columnHelper.accessor('chain', {
      header: 'Networks',
      cell: (info) => {
        const chain = info.getValue();
        if (!chain) return <span className="text-sm">-</span>;
        const chainId = chain.chainId;
        return (
          <div className="flex items-center gap-2">
            <InfinityIcon className="h-4 w-4 text-purple-500" />
            <span className="text-sm">{getChainName(chainId)}</span>
          </div>
        );
      },
      enableSorting: true,
    }),
    columnHelper.accessor('runs', {
      header: 'Runs',
      cell: (info) => {
        const runs = info.getValue();
        return (
          <span className="text-sm font-medium">{runs.toLocaleString()}</span>
        );
      },
      enableSorting: true,
    }),
    columnHelper.accessor('executions', {
      header: 'Executions',
      cell: (info) => {
        const executions = info.getValue();
        return (
          <span className="text-sm font-medium">
            {executions.toLocaleString()}
          </span>
        );
      },
      enableSorting: true,
    }),
  ];

  if (executables === undefined) {
    return (
      <div className="rounded-md border">
        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (executables.length === 0) {
    return (
      <div className="rounded-md border">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-muted-foreground">No executables found</p>
        </div>
      </div>
    );
  }

  function handleOnClick(executable: Executable) {
    navigate({
      to: '/executables/$executableId',
      params: { executableId: executable.id as string },
    });
  }

  return (
    <DataTable
      columns={columns}
      data={executables}
      onRowClick={handleOnClick}
      enablePagination
    />
  );
}
