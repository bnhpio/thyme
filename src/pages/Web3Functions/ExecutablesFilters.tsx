import { useQuery } from 'convex/react';
import { Filter, Search } from 'lucide-react';
import * as viemChains from 'viem/chains';
import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface ExecutablesFiltersState {
  status: 'active' | 'paused' | 'all';
  chain: Id<'chains'> | 'all';
  profile: Id<'profiles'> | 'all';
  triggerType: 'interval' | 'cron' | 'all';
  searchQuery: string;
}

interface ExecutablesFiltersProps {
  filters: ExecutablesFiltersState;
  onFiltersChange: (filters: ExecutablesFiltersState) => void;
}

function getChainName(chainId: number): string {
  const chain = Object.values(viemChains).find((c: any) => c.id === chainId);
  return chain?.name || `Chain ${chainId}`;
}

export function ExecutablesFilters({
  filters,
  onFiltersChange,
}: ExecutablesFiltersProps) {
  const chains = useQuery(api.query.chain.getAllChains);

  const updateFilter = <K extends keyof ExecutablesFiltersState>(
    key: K,
    value: ExecutablesFiltersState[K],
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex-1 min-w-[200px]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            value={filters.searchQuery}
            onChange={(e) => updateFilter('searchQuery', e.target.value)}
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
          value={filters.chain}
          onValueChange={(value: Id<'chains'> | 'all') =>
            updateFilter('chain', value)
          }
          disabled={!chains}
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
          value={filters.status}
          onValueChange={(value: 'active' | 'paused' | 'all') =>
            updateFilter('status', value)
          }
        >
          <SelectTrigger className="h-9">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
