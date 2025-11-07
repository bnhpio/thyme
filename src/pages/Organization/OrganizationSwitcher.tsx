import { Link } from '@tanstack/react-router';
import { useMutation, useQuery } from 'convex/react';
import { Building2, Check, ChevronDown, Plus } from 'lucide-react';
import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AddOrganizationModal } from './AddOrganizationModal';

export function OrganizationSwitcher() {
  const currentUser = useQuery(api.query.user.getCurrentUser);
  const organizations = useQuery(
    api.query.user.getUserOrganizations,
    currentUser?.id ? { userId: currentUser.id } : 'skip',
  );
  const currentOrganizationId = useQuery(
    api.query.user.getCurrentUserOrganizationId,
  );
  const setCurrentOrganization = useMutation(
    api.mutation.organizations.setUserCurrentOrganization,
  );

  const currentOrganization = organizations?.find(
    (org) => org._id === currentOrganizationId,
  );
  const isLoading = organizations === undefined;

  const handleSetCurrentOrganization = async (orgId: Id<'organizations'>) => {
    try {
      await setCurrentOrganization({ organizationId: orgId });
    } catch (error) {
      console.error('Failed to set current organization:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
        <div className="flex-1">
          <div className="h-4 w-20 bg-muted animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (!currentOrganization && organizations?.length === 0) {
    return (
      <div className="p-2">
        <Button asChild variant="outline" className="w-full justify-start">
          <Link to="/organization-setup">
            <Plus className="h-4 w-4 mr-2" />
            Add organization
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between px-3 py-2 h-auto"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="h-8 w-8 rounded bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                <Building2 className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="font-medium truncate">
                  {currentOrganization?.name || 'No Organization'}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  Organization
                </div>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 shrink-0" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-64">
          <DropdownMenuLabel>Organization</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {organizations?.map((org, index) => (
            <div key={org._id} className="flex items-center">
              <DropdownMenuItem
                onClick={() =>
                  org?._id && handleSetCurrentOrganization(org._id)
                }
                className="flex items-center justify-between flex-1"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="h-6 w-6 rounded bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                    <Building2 className="h-3 w-3 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{org.name}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ⌘{index + 1}
                  </div>
                </div>
                {currentOrganizationId === org._id && (
                  <Check className="h-4 w-4 shrink-0" />
                )}
              </DropdownMenuItem>
              {/* <Link
                                to="/$slug/settings"
                                params={{ slug: org.slug || '' }}
                                className="flex items-center justify-center p-2 hover:bg-accent rounded-sm mx-1"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Settings className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                            </Link> */}
            </div>
          ))}

          <DropdownMenuSeparator />

          <AddOrganizationModal>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Plus className="h-4 w-4 mr-2" />
              Add organization
            </DropdownMenuItem>
          </AddOrganizationModal>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
