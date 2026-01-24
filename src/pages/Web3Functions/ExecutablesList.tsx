import { useQuery } from 'convex/react';
import { useState } from 'react';
import * as viemChains from 'viem/chains';
import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  ExecutablesFilters,
  type ExecutablesFiltersState,
} from './ExecutablesFilters';
import { ExecutablesTable } from './ExecutablesTable';

interface ExecutablesListProps {
  organizationId: Id<'organizations'>;
}

function getChainName(chainId: number): string {
  const chain = Object.values(viemChains).find((c: any) => c.id === chainId);
  return chain?.name || `Chain ${chainId}`;
}

export function ExecutablesList({ organizationId }: ExecutablesListProps) {
  const [filters, setFilters] = useState<ExecutablesFiltersState>({
    status: 'all',
    chain: 'all',
    profile: 'all',
    triggerType: 'all',
    searchQuery: '',
  });

  const executables = useQuery(
    api.query.executable.getExecutablesByOrganization,
    {
      organizationId,
      filters: {
        status: filters.status !== 'all' ? filters.status : undefined,
        chainId: filters.chain !== 'all' ? filters.chain : undefined,
        profileId: filters.profile !== 'all' ? filters.profile : undefined,
        triggerType:
          filters.triggerType !== 'all' ? filters.triggerType : undefined,
      },
    },
  );

  const filteredExecutables = executables?.filter((executable) => {
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      return (
        executable.name.toLowerCase().includes(query) ||
        executable.profile.alias.toLowerCase().includes(query) ||
        getChainName(executable.chain.chainId).toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Executables</CardTitle>
        <CardDescription>Search and filter your executables</CardDescription>
        <Separator className="my-2" />
        <ExecutablesFilters filters={filters} onFiltersChange={setFilters} />
      </CardHeader>
      <CardContent className="px-0">
        <ExecutablesTable executables={filteredExecutables} />
      </CardContent>
    </Card>
  );
}
