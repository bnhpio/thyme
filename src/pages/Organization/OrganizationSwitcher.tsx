import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import { useAction, useMutation, useQuery } from 'convex/react';
import {
  Building2,
  Check,
  ChevronDown,
  Mail,
  Plus,
  Settings,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/../convex/_generated/api';
import type { Id } from '@/../convex/_generated/dataModel';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getErrorMessage } from '@/lib/utils';
import { AddOrganizationModal } from './AddOrganizationModal';

export function OrganizationSwitcher() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = useQuery(api.query.user.getCurrentUser);
  const organizations = useQuery(
    api.query.user.getUserOrganizations,
    currentUser?.id ? { userId: currentUser.id } : 'skip',
  );
  const currentOrganizationId = useQuery(
    api.query.user.getCurrentUserOrganizationId,
  );
  const pendingInvites = useQuery(
    api.query.user.getUserPendingInvites,
    currentUser?.email ? { email: currentUser.email } : 'skip',
  );
  const setCurrentOrganization = useMutation(
    api.mutation.organizations.setUserCurrentOrganization,
  );
  const acceptInvite = useMutation(api.mutation.organizations.acceptInvite);
  const declineInvite = useAction(api.action.organizations.declineInvite);
  const [declineInviteId, setDeclineInviteId] =
    useState<Id<'organizationInvites'> | null>(null);

  const currentOrganization = organizations?.find(
    (org) => org._id === currentOrganizationId,
  );
  const isLoading = organizations === undefined;

  // Check if we're on an organization settings page
  const isOnOrganizationSettingsPage =
    location.pathname.includes('/organization/') &&
    location.pathname.endsWith('/settings');

  const handleSetCurrentOrganization = useCallback(
    async (orgId: Id<'organizations'>) => {
      try {
        await setCurrentOrganization({ organizationId: orgId });
      } catch (error) {
        console.error('Failed to set current organization:', error);
      }
    },
    [setCurrentOrganization],
  );

  const handleAcceptInvite = useCallback(
    async (token: string) => {
      try {
        await acceptInvite({ token });
        toast.success('Invitation accepted successfully');
        // The query will automatically refetch after mutation
      } catch (error) {
        console.error('Failed to accept invite:', error);
        toast.error(
          getErrorMessage(
            error,
            'Failed to accept invitation. Please try again.',
          ),
        );
      }
    },
    [acceptInvite],
  );

  const handleDeclineInvite = useCallback(
    async (inviteId: Id<'organizationInvites'>) => {
      try {
        await declineInvite({ inviteId });
        // Tracking happens automatically on the backend via scheduler
        setDeclineInviteId(null);
        toast.success('Invitation declined');
        // The query will automatically refetch after mutation
      } catch (error) {
        console.error('Failed to decline invite:', error);
        toast.error(
          getErrorMessage(
            error,
            'Failed to decline invitation. Please try again.',
          ),
        );
      }
    },
    [declineInvite],
  );

  // Auto-select first org if current org is invalid but orgs exist
  useEffect(() => {
    if (
      !isLoading &&
      !currentOrganization &&
      organizations &&
      organizations.length > 0
    ) {
      const firstOrg = organizations[0];
      if (firstOrg?._id) {
        handleSetCurrentOrganization(firstOrg._id);
      }
    }
  }, [
    isLoading,
    currentOrganization,
    organizations,
    handleSetCurrentOrganization,
  ]);

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

  return (
    <div className="p-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between px-3 py-2 h-auto"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="h-8 w-8 rounded flex items-center justify-center shrink-0 bg-muted">
                <Building2 className="h-4 w-4 text-muted-foreground" />
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

          {/* Pending Invitations */}
          {pendingInvites && pendingInvites.length > 0 && (
            <>
              {pendingInvites.map((invite) => (
                <div key={invite._id} className="px-2 py-1.5">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate text-sm">
                          {invite.organization?.name || 'Unknown Organization'}
                        </span>
                        <Badge variant="secondary" className="text-xs shrink-0">
                          Invite
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {invite.inviter?.email ||
                          invite.inviter?.name ||
                          'Unknown'}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptInvite(invite.token);
                        }}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeclineInviteId(invite._id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              <DropdownMenuSeparator />
            </>
          )}

          {/* Decline Invite Confirmation Dialog */}
          <AlertDialog
            open={declineInviteId !== null}
            onOpenChange={(open) => {
              if (!open) {
                setDeclineInviteId(null);
              }
            }}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Decline Invitation?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to decline this invitation? You can be
                  invited again later if needed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    if (declineInviteId) {
                      handleDeclineInvite(declineInviteId);
                    }
                  }}
                  className="bg-destructive  hover:bg-destructive/90"
                >
                  Decline
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {organizations?.map((org, index) => (
            <div key={org._id} className="flex items-center group">
              <DropdownMenuItem
                onClick={async () => {
                  if (org?._id) {
                    await handleSetCurrentOrganization(org._id);
                    // If we're on organization settings page, navigate to the new org's settings
                    if (isOnOrganizationSettingsPage && org.slug) {
                      navigate({
                        to: '/organization/$slug/settings',
                        params: { slug: org.slug },
                      });
                    }
                  }
                }}
                className="flex items-center justify-between flex-1"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="h-6 w-6 rounded flex items-center justify-center shrink-0">
                    <Building2 className="h-3 w-3  text-foreground" />
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
              <Link
                to="/organization/$slug/settings"
                params={{ slug: org.slug || '' }}
                className="flex items-center justify-center p-2 hover:bg-accent rounded-sm mx-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={async (e) => {
                  e.stopPropagation();
                  if (org?._id) {
                    await handleSetCurrentOrganization(org._id);
                  }
                }}
              >
                <Settings className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </Link>
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
