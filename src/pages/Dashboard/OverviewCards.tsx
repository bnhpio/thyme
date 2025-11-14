import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock,
  Pause,
  Play,
  XCircle,
} from 'lucide-react';
import type { Id } from '@/../convex/_generated/dataModel';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface OverviewCardsProps {
  data: {
    totalExecutables: number;
    activeExecutables: number;
    pausedExecutables: number;
    finishedExecutables: number;
    failedExecutables: number;
    recentlyCreated: number;
    recentlyUpdated: number;
  };
  organizationId: Id<'organizations'>;
}

export function OverviewCards({ data }: OverviewCardsProps) {
  const cards = [
    {
      title: 'Total Executables',
      value: data.totalExecutables,
      description: 'All executables in your organization',
      icon: Activity,
      className: 'border-primary/20',
    },
    {
      title: 'Active',
      value: data.activeExecutables,
      description: 'Currently running executables',
      icon: Play,
      className: 'border-success/20 bg-success/5',
      valueClassName: 'text-success',
    },
    {
      title: 'Paused',
      value: data.pausedExecutables,
      description: 'Paused executables',
      icon: Pause,
      className: 'border-warning/20 bg-warning/5',
      valueClassName: 'text-warning',
    },
    {
      title: 'Finished',
      value: data.finishedExecutables,
      description: 'Completed executables',
      icon: CheckCircle2,
      className: 'border-muted',
      valueClassName: 'text-muted-foreground',
    },
    {
      title: 'Failed',
      value: data.failedExecutables,
      description: 'Failed executables',
      icon: XCircle,
      className:
        data.failedExecutables > 0
          ? 'border-destructive/20 bg-destructive/5'
          : 'border-muted',
      valueClassName:
        data.failedExecutables > 0 ? 'text-destructive' : 'text-muted-foreground',
    },
    {
      title: 'Recently Created',
      value: data.recentlyCreated,
      description: 'Created in the last 7 days',
      icon: Clock,
      className: 'border-primary/20',
    },
  ];

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full min-w-0">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className={`${card.className} w-full overflow-hidden min-w-0`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">
                {card.title}
              </CardTitle>
              <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-xl sm:text-2xl font-bold ${card.valueClassName || ''}`}
              >
                {card.value}
              </div>
              <CardDescription className="text-xs mt-1">
                {card.description}
              </CardDescription>
              {card.title === 'Failed' && data.failedExecutables > 0 && (
                <div className="mt-2 flex items-center gap-1 text-xs text-destructive">
                  <AlertCircle className="h-3 w-3" />
                  <span>Action required</span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

