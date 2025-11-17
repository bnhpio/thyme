import { Eye, Shield, User } from 'lucide-react';

export type Role = 'admin' | 'member' | 'viewer';

export function getRoleIcon(role: string) {
  switch (role) {
    case 'admin':
      return <Shield className="h-4 w-4" />;
    case 'member':
      return <User className="h-4 w-4" />;
    case 'viewer':
      return <Eye className="h-4 w-4" />;
    default:
      return <User className="h-4 w-4" />;
  }
}

export function getRoleBadgeVariant(
  role: string,
): 'default' | 'secondary' | 'outline' {
  switch (role) {
    case 'admin':
      return 'default';
    case 'member':
      return 'secondary';
    case 'viewer':
      return 'outline';
    default:
      return 'secondary';
  }
}
