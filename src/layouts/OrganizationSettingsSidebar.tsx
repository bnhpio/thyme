import { Link, useLocation } from '@tanstack/react-router';
import { useQuery } from 'convex/react';
import { ArrowLeft, CreditCard, Settings, Users } from 'lucide-react';
import { api } from '@/../convex/_generated/api';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { OrganizationSwitcher } from '@/pages/Organization/OrganizationSwitcher';

interface OrganizationSettingsSidebarProps {
  slug?: string;
}

export function OrganizationSettingsSidebar({
  slug = '',
}: OrganizationSettingsSidebarProps) {
  const location = useLocation();
  const currentUser = useQuery(api.query.user.getCurrentUser);
  const organizations = useQuery(
    api.query.user.getUserOrganizations,
    currentUser?.id
      ? {
          userId: currentUser?.id,
        }
      : 'skip',
  );

  const organization = organizations?.find((org) => org.slug === slug);
  const membership = useQuery(
    api.query.organization.getOrganizationMembership,
    organization?._id && currentUser?.id
      ? {
          organizationId: organization._id,
          userId: currentUser.id,
        }
      : 'skip',
  );

  const isAdmin = membership?.role === 'admin';

  return (
    <Sidebar>
      <SidebarHeader>
        <OrganizationSwitcher />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Organization</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={
                    location.pathname.includes('/organization/') &&
                    location.pathname.includes('/settings')
                  }
                >
                  <Link to="/organization/$slug/settings" params={{ slug }}>
                    <Settings className="h-4 w-4" />
                    <span>General</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={
                    location.pathname.includes('/organization/') &&
                    location.pathname.includes('/members')
                  }
                >
                  <Link to="/organization/$slug/members" params={{ slug }}>
                    <Users className="h-4 w-4" />
                    <span>Members</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      location.pathname.includes('/organization/') &&
                      location.pathname.includes('/plan')
                    }
                  >
                    <Link to="/organization/$slug/plan" params={{ slug }}>
                      <CreditCard className="h-4 w-4" />
                      <span>Plan</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-2">
          <Link
            to="/settings/settings"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              <span className="text-xs font-medium">
                {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">
                {currentUser?.name || 'User'}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {currentUser?.email || ''}
              </span>
            </div>
            <Settings className="h-4 w-4 shrink-0" />
          </Link>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
