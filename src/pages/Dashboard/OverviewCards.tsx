import { Activity, Pause, Play } from 'lucide-react';
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
  ];

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full min-w-0">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.title}
            className={`${card.className} w-full overflow-hidden min-w-0`}
          >
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
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
