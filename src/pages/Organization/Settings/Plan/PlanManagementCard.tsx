import type { Id } from '@/../convex/_generated/dataModel';
import PricingTable from '@/components/autumn/pricing-table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface PlanManagementCardProps {
  organizationId: Id<'organizations'>;
}

export function PlanManagementCard({
  organizationId,
}: PlanManagementCardProps) {
  // organizationId will be used when needed
  void organizationId;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Plans</CardTitle>
        <CardDescription>
          Choose a plan that fits your organization's needs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PricingTable />
      </CardContent>
    </Card>
  );
}
