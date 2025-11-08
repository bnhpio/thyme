import { Link, useLocation } from '@tanstack/react-router';
import { ArrowLeft, Settings, Users } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
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

  return (
    <Sidebar>
      <SidebarHeader>
        <OrganizationSwitcher />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/">
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
