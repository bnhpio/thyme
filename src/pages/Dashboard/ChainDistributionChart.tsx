import { Cell, Pie, PieChart } from 'recharts';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
} from '@/components/ui/chart';

interface ChainData {
  chainId: number;
  chainName: string;
  count: number;
  activeCount: number;
  isMainnet: boolean;
}

interface ChainDistributionChartProps {
  data: ChainData[];
}

export function ChainDistributionChart({ data }: ChainDistributionChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chain Distribution</CardTitle>
          <CardDescription>
            Distribution of executables across chains
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No chain data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Better color palette - more distinct and vibrant colors
  const CHART_COLORS = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
  ];

  const chartData = data.map((chain, index) => ({
    name: chain.chainName,
    value: chain.count,
    active: chain.activeCount,
    inactive: chain.count - chain.activeCount,
    isMainnet: chain.isMainnet,
    fill: CHART_COLORS[index % CHART_COLORS.length],
  }));

  const totalExecutables = data.reduce((sum, chain) => sum + chain.count, 0);

  // Create chart config for shadcn chart
  const chartConfig: ChartConfig = data.reduce((acc, chain, index) => {
    acc[chain.chainName] = {
      label: chain.chainName,
      color: CHART_COLORS[index % CHART_COLORS.length],
    };
    return acc;
  }, {} as ChartConfig);

  return (
    <Card className="w-full overflow-hidden min-w-0">
      <CardHeader>
        <CardTitle>Chain Distribution</CardTitle>
        <CardDescription>
          Distribution of executables across chains
        </CardDescription>
      </CardHeader>
      <CardContent className="px-2 sm:px-4 md:px-6 w-full min-w-0">
        <ChartContainer
          config={chartConfig}
          className="w-full max-w-full min-w-10"
        >
          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <ChartTooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as {
                    name: string;
                    value: number;
                    active: number;
                    inactive: number;
                    isMainnet: boolean;
                  };
                  const percent =
                    totalExecutables > 0
                      ? ((data.value / totalExecutables) * 100).toFixed(1)
                      : '0';
                  return (
                    <div className="rounded-lg border border-border bg-popover p-2 sm:p-3 shadow-lg">
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between gap-2 sm:gap-4">
                          <span className="text-xs sm:text-sm font-medium text-popover-foreground">
                            {data.name}
                          </span>
                          <Badge
                            variant="outline"
                            className={
                              data.isMainnet
                                ? 'border-primary/20'
                                : 'border-muted'
                            }
                          >
                            {data.isMainnet ? 'Mainnet' : 'Testnet'}
                          </Badge>
                        </div>
                        <div className="text-xs sm:text-sm">
                          <div className="flex items-center justify-between gap-2 sm:gap-4">
                            <span className="text-muted-foreground">
                              Total:
                            </span>
                            <span className="font-medium text-popover-foreground">
                              {data.value} ({percent}%)
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2 sm:gap-4">
                            <span className="text-muted-foreground">
                              Active:
                            </span>
                            <span className="font-medium text-success">
                              {data.active}
                            </span>
                          </div>
                          {data.inactive > 0 && (
                            <div className="flex items-center justify-between gap-2 sm:gap-4">
                              <span className="text-muted-foreground">
                                Inactive:
                              </span>
                              <span className="font-medium text-muted-foreground">
                                {data.inactive}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Pie
              data={chartData}
              cx="50%"
              labelLine={false}
              label={false}
              paddingAngle={2}
              dataKey="value"
              innerRadius={50}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} strokeWidth={2} />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="name" />}
              className="mt-2 sm:mt-4"
              verticalAlign="bottom"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
