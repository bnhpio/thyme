import { useCustomer } from 'autumn-js/react';
import { BarChart3, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';

interface FeatureUsage {
  balance: number;
  id: string;
  included_usage: number;
  interval: string;
  interval_count: number;
  name: string;
  next_reset_at: number | null;
  overage_allowed: boolean;
  type: string;
  unlimited: boolean;
  usage: number;
}

export function UsageCard() {
  const { customer, isLoading, error } = useCustomer({
    errorOnNotFound: false,
  });

  // Extract features from customer.features object
  const features: FeatureUsage[] = customer?.features
    ? Object.values(customer.features as Record<string, FeatureUsage>)
    : [];

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return null;
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getIntervalLabel = (interval: string, intervalCount: number) => {
    if (interval === 'lifetime') return 'Lifetime';
    if (interval === 'month') {
      return intervalCount === 1 ? 'Monthly' : `Every ${intervalCount} months`;
    }
    if (interval === 'year') {
      return intervalCount === 1 ? 'Yearly' : `Every ${intervalCount} years`;
    }
    return interval;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Usage & Limits</CardTitle>
          <CardDescription>Unable to load usage information</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            Something went wrong. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Usage & Limits</CardTitle>
            <CardDescription>
              Track your current usage and remaining limits for your plan
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {features.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              No usage data available. Usage tracking will appear once you have
              an active plan with features.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {features.map((feature) => {
              const limit = feature.unlimited
                ? Number.POSITIVE_INFINITY
                : feature.included_usage;
              const used = feature.usage;
              const remaining = feature.balance;
              const percentage =
                feature.unlimited || limit === 0
                  ? 0
                  : Math.min((used / limit) * 100, 100);

              return (
                <div key={feature.id} className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {feature.name}
                        </span>
                        {feature.unlimited && (
                          <Badge variant="secondary" className="text-xs">
                            Unlimited
                          </Badge>
                        )}
                        {feature.type === 'continuous_use' && (
                          <Badge variant="outline" className="text-xs">
                            Continuous
                          </Badge>
                        )}
                      </div>
                      {feature.next_reset_at && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            Resets: {formatDate(feature.next_reset_at)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {feature.unlimited ? (
                          <span className="text-muted-foreground">
                            {used.toLocaleString()} used
                          </span>
                        ) : (
                          <>
                            {used.toLocaleString()} / {limit.toLocaleString()}
                          </>
                        )}
                      </div>
                      {!feature.unlimited && (
                        <div className="text-xs text-muted-foreground">
                          {remaining.toLocaleString()} remaining
                        </div>
                      )}
                    </div>
                  </div>

                  {!feature.unlimited && (
                    <>
                      <Progress value={percentage} className="h-2" />
                      <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>{percentage.toFixed(1)}% used</span>
                        <span>
                          {getIntervalLabel(
                            feature.interval,
                            feature.interval_count,
                          )}
                        </span>
                      </div>
                    </>
                  )}

                  {feature.overage_allowed && (
                    <div className="text-xs text-muted-foreground italic">
                      Overage allowed beyond limit
                    </div>
                  )}
                </div>
              );
            })}

            <div className="pt-4 border-t text-xs text-muted-foreground">
              <p>
                Usage metrics are updated in real-time. Limits reset according
                to your plan's billing cycle.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
