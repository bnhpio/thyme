import { useCustomer, usePricingTable } from 'autumn-js/react';
import { Calendar, CreditCard } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import type { Id } from '@/../convex/_generated/dataModel';

interface CurrentPlanCardProps {
  organizationId: Id<'organizations'>;
}

export function CurrentPlanCard({ organizationId }: CurrentPlanCardProps) {
  // organizationId will be used when needed
  void organizationId;

  const { customer, isLoading: customerLoading, error: customerError } =
    useCustomer({
      errorOnNotFound: false,
    });
  const { products, isLoading: productsLoading, error: productsError } =
    usePricingTable({});

  const isLoading = customerLoading || productsLoading;
  const error = customerError || productsError;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Unable to load plan information</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            Something went wrong. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Check for active subscription (paid plan) from customer subscriptions
  const subscriptions =
    customer && 'subscriptions' in customer
      ? (customer.subscriptions as any[])
      : [];
  const hasActivePaidSubscription = subscriptions.length > 0;
  const activeSubscription = hasActivePaidSubscription ? subscriptions[0] : null;

  // Check for active plan from pricing table (both free and paid)
  // The pricing table shows the current plan with scenario === 'active'
  const activePlanFromPricing = products?.find(
    (product) => product.scenario === 'active',
  );

  // Determine current plan priority:
  // 1. Active subscription from customer (most reliable)
  // 2. Active plan from pricing table (paid or free)
  const currentPlan = activeSubscription
    ? {
        type: 'paid' as const,
        data: activeSubscription,
        source: 'subscription' as const,
      }
    : activePlanFromPricing
      ? {
          type: (activePlanFromPricing.properties?.is_free === true
            ? 'free'
            : 'paid') as 'free' | 'paid',
          data: activePlanFromPricing,
          source: 'pricing_table' as const,
        }
      : null;

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount / 100);
  };

  const formatDate = (date: string | number | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Plan</CardTitle>
        <CardDescription>
          View your organization's current subscription details
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!currentPlan ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No Plan Found</p>
            <p className="text-sm text-muted-foreground">
              Unable to determine your current plan. Please contact support if
              this persists.
            </p>
          </div>
        ) : currentPlan.type === 'free' ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">
                    {currentPlan.data.name || 'Free Plan'}
                  </h3>
                  <Badge variant="secondary">Free</Badge>
                </div>
                {(currentPlan.data as any)?.display?.description && (
                  <p className="text-sm text-muted-foreground">
                    {(currentPlan.data as any).display.description}
                  </p>
                )}
              </div>
            </div>
            <Separator />
            <div className="rounded-lg bg-muted/50 border p-4">
              <p className="text-sm text-muted-foreground">
                You're currently on the free plan. Upgrade to unlock more
                features and higher limits.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">
                    {currentPlan.source === 'pricing_table'
                      ? currentPlan.data.name
                      : (currentPlan.data as any)?.product?.name ||
                          (currentPlan.data as any)?.name || 'Unknown Plan'}
                  </h3>
                  {currentPlan.source === 'pricing_table' ? (
                    <Badge variant="default">Active</Badge>
                  ) : (currentPlan.data as any)?.status ? (
                    <Badge
                      variant={
                        (currentPlan.data as any).status === 'active'
                          ? 'default'
                          : (currentPlan.data as any).status === 'trialing'
                            ? 'secondary'
                            : 'outline'
                      }
                    >
                      {(currentPlan.data as any).status}
                    </Badge>
                  ) : null}
                </div>
                {currentPlan.source === 'pricing_table'
                  ? (currentPlan.data as any)?.display?.description && (
                      <p className="text-sm text-muted-foreground">
                        {(currentPlan.data as any).display.description}
                      </p>
                    )
                  : ((currentPlan.data as any)?.product?.description ||
                      (currentPlan.data as any)?.description ||
                      (currentPlan.data as any)?.display?.description) && (
                      <p className="text-sm text-muted-foreground">
                        {(currentPlan.data as any)?.product?.description ||
                          (currentPlan.data as any)?.description ||
                          (currentPlan.data as any)?.display?.description}
                      </p>
                    )}
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentPlan.source === 'pricing_table'
                ? (currentPlan.data as any)?.items?.[0]?.display && (
                    <div className="flex items-start gap-3">
                      <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Current Price</p>
                        <p className="text-sm text-muted-foreground">
                          {(currentPlan.data as any).items[0].display
                            .primary_text || 'Free'}{' '}
                          {(currentPlan.data as any).items[0].display
                            .secondary_text &&
                            (currentPlan.data as any).items[0].display
                              .secondary_text}
                        </p>
                      </div>
                    </div>
                  )
                : (currentPlan.data as any)?.current_period_end && (
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Next Billing Date</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(
                            (currentPlan.data as any).current_period_end,
                          )}
                        </p>
                      </div>
                    </div>
                  )}

              {currentPlan.source === 'subscription' &&
                (currentPlan.data as any)?.items?.[0]?.price && (
                  <div className="flex items-start gap-3">
                    <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Current Price</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(
                          (currentPlan.data as any).items[0].price
                            .unit_amount || 0,
                          (currentPlan.data as any).items[0].price.currency ||
                            'USD',
                        )}{' '}
                        {(currentPlan.data as any).items[0].price.recurring
                          ?.interval &&
                          `per ${
                            (currentPlan.data as any).items[0].price.recurring
                              .interval
                          }`}
                      </p>
                    </div>
                  </div>
                )}
            </div>

            {(currentPlan.data as any)?.cancel_at_period_end && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                <p className="text-sm text-destructive font-medium">
                  Plan will cancel on{' '}
                  {(currentPlan.data as any)?.current_period_end
                    ? formatDate(
                        (currentPlan.data as any).current_period_end,
                      )
                    : 'end of billing period'}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

