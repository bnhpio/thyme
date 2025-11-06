import { Link } from '@tanstack/react-router';
import { useQuery } from 'convex/react';
import { Building2, Home, Settings } from 'lucide-react';
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
//import { OrganizationSwitcher } from './OrganizationSwitcher';

export function AppSidebar() {
  const currentUser = useQuery(api.query.user.getCurrentUser);
  const userOrganizations = useQuery(
    api.query.user.getUserOrganizations,
    currentUser?.id ? { userId: currentUser.id } : 'skip',
  );

  const currentOrg = userOrganizations?.[0]; // Get first organization for now

  return (
    <Sidebar>
      <SidebarHeader>
        <OrganizationSwitcher />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/">
                    <Home className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {currentOrg && (
          <SidebarGroup>
            <SidebarGroupLabel>Tools</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link to="/web3-functions">
                      <Building2 className="h-4 w-4" />
                      <span>Functions</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <div className="p-2">
          <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm">
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
            <Link
              to="/settings"
              className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent transition-colors"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
