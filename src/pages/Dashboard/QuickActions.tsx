import { Link } from '@tanstack/react-router';
import { Key, Play, Plus, User, Webhook } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function QuickActions() {
  const actions = [
    {
      title: 'Create Executable',
      description: 'Create a new executable to run your Web3 functions',
      icon: Plus,
      link: '/web3-functions',
      className: 'border-primary/20 hover:bg-primary/5',
    },
    {
      title: 'View All Executables',
      description: 'Manage all your executables',
      icon: Play,
      link: '/executables',
      className: 'hover:bg-accent/50',
    },
    {
      title: 'View Profiles',
      description: 'Manage your Web3 wallet profiles',
      icon: User,
      link: '/profiles',
      className: 'hover:bg-accent/50',
    },
    {
      title: 'View API Keys',
      description: 'Manage your API keys for programmatic access',
      icon: Key,
      link: '/settings/api-keys',
      className: 'hover:bg-accent/50',
    },
    {
      title: 'View Functions',
      description: 'View and manage your Web3 functions',
      icon: Webhook,
      link: '/web3-functions',
      className: 'hover:bg-accent/50',
    },
  ];

  return (
    <Card className="w-full overflow-hidden min-w-0">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Common actions and shortcuts
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-6 w-full min-w-0">
        <div className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 min-w-0">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.title} to={action.link} className="block">
                <div
                  className={`flex items-start gap-2 sm:gap-3 p-3 sm:p-4 border rounded-lg transition-colors ${action.className}`}
                >
                  <div className="p-1.5 sm:p-2 rounded-md bg-primary/10 shrink-0">
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-xs sm:text-sm mb-0.5 sm:mb-1">
                      {action.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
