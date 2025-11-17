import { Link, useLocation } from '@tanstack/react-router';
import { useQuery } from 'convex/react';
import { ArrowLeft, Key, Settings, User } from 'lucide-react';
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

export function SettingsSidebar() {
  const location = useLocation();
  const currentUser = useQuery(api.query.user.getCurrentUser);

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
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === '/settings/settings'}
                >
                  <Link to="/settings/settings">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={location.pathname === '/settings/api-keys'}
                >
                  <Link to="/settings/api-keys">
                    <Key className="h-4 w-4" />
                    <span>API Keys</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
