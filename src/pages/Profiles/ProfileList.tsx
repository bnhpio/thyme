import { Plus, User } from 'lucide-react';
import { useState } from 'react';
import type { Id } from '@/../convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CreateProfileDialog } from './CreateProfileDialog';
import { ProfileItem } from './ProfileItem';

interface Profile {
  _id: Id<'profiles'>;
  _creationTime: number;
  organizationId: Id<'organizations'>;
  alias: string;
  address: string;
  createdBy: Id<'users'>;
  chain: Id<'chains'>;
  chainId?: number;
  customRpcUrl?: string;
}

interface ProfileListProps {
  profiles: Profile[];
  onDelete: (profileId: Id<'profiles'>) => void;
  onUpdate: (
    profileId: Id<'profiles'>,
    customRpcUrl: string | undefined,
  ) => void;
  onRefresh?: () => void;
  organizationId?: Id<'organizations'>;
}

function getChainName(chainId: number): string {
  const chainNames: Record<number, string> = {
    1: 'Ethereum Mainnet',
    5: 'Goerli',
    11155111: 'Sepolia',
    137: 'Polygon',
    80001: 'Mumbai',
    42161: 'Arbitrum One',
    421613: 'Arbitrum Goerli',
    10: 'Optimism',
    420: 'Optimism Goerli',
    8453: 'Base',
    84531: 'Base Goerli',
    56: 'BNB Chain',
    97: 'BNB Testnet',
    43114: 'Avalanche',
    43113: 'Avalanche Fuji',
    250: 'Fantom',
    4002: 'Fantom Testnet',
  };
  return chainNames[chainId] || `Chain ${chainId}`;
}

export function ProfileList({
  profiles,
  onDelete,
  onUpdate,
  onRefresh,
  organizationId,
}: ProfileListProps) {
  const [selectedChainId, setSelectedChainId] = useState<number | 'all'>('all');

  // Get unique chain IDs from profiles
  const availableChainIds = Array.from(
    new Set(
      profiles
        .map((p) => p.chainId)
        .filter((id): id is number => id !== undefined),
    ),
  ).sort((a, b) => a - b);

  // Filter profiles by selected chain
  const filteredProfiles =
    selectedChainId === 'all'
      ? profiles
      : profiles.filter((p) => p.chainId === selectedChainId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profiles</CardTitle>
        <CardDescription>
          Manage your organization profiles. Each profile has its own wallet
          address and private key.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              No profiles found. Create your first profile to get started.
            </p>
            {organizationId && (
              <CreateProfileDialog
                organizationId={organizationId}
                onSuccess={onRefresh || (() => {})}
                trigger={
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Profile
                  </Button>
                }
              />
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {availableChainIds.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Filter by Chain</Label>
                <Select
                  value={
                    selectedChainId === 'all'
                      ? 'all'
                      : selectedChainId.toString()
                  }
                  onValueChange={(value) =>
                    setSelectedChainId(value === 'all' ? 'all' : Number(value))
                  }
                >
                  <SelectTrigger className="w-full sm:w-[250px]">
                    <SelectValue placeholder="All chains" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All chains</SelectItem>
                    {availableChainIds.map((chainId) => (
                      <SelectItem key={chainId} value={chainId.toString()}>
                        {getChainName(chainId)} ({chainId})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {filteredProfiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No profiles found for the selected chain.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProfiles.map((profile) => (
                  <ProfileItem
                    key={profile._id}
                    profile={profile}
                    onDelete={onDelete}
                    onUpdate={onUpdate}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
