import type { Product, ProductItem } from 'autumn-js';

import { type ProductDetails, usePricingTable } from 'autumn-js/react';
import { Loader2 } from 'lucide-react';
import type React from 'react';
import { createContext, useContext, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export default function PricingTableView({
  productDetails,
}: {
  productDetails?: ProductDetails[];
}) {
  const [isAnnual, setIsAnnual] = useState(false);
  const { products, isLoading, error } = usePricingTable({ productDetails });

  if (isLoading) {
    return (
      <div className="w-full h-full flex justify-center items-center min-h-[300px]">
        <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-muted-foreground">
        Something went wrong...
      </div>
    );
  }

  const intervals = Array.from(
    new Set(
      products?.map((p) => p.properties?.interval_group).filter((i) => !!i),
    ),
  );

  const multiInterval = intervals.length > 1;

  const intervalFilter = (product: Product) => {
    if (!product.properties?.interval_group) {
      return true;
    }

    if (multiInterval) {
      if (isAnnual) {
        return product.properties?.interval_group === 'year';
      }
      return product.properties?.interval_group === 'month';
    }

    return true;
  };

  return (
    <div className={cn('root')}>
      {products && (
        <PricingTableContainer
          products={products}
          isAnnualToggle={isAnnual}
          setIsAnnualToggle={setIsAnnual}
          multiInterval={multiInterval}
        >
          {products.filter(intervalFilter).map((product, index) => (
            <PricingCardView key={index} productId={product.id} />
          ))}
        </PricingTableContainer>
      )}
    </div>
  );
}

const PricingTableContext = createContext<{
  isAnnualToggle: boolean;
  setIsAnnualToggle: (isAnnual: boolean) => void;
  products: Product[];
  showFeatures: boolean;
}>({
  isAnnualToggle: false,
  setIsAnnualToggle: () => {},
  products: [],
  showFeatures: true,
});

export const usePricingTableContext = (componentName: string) => {
  const context = useContext(PricingTableContext);

  if (context === undefined) {
    throw new Error(
      `${componentName} must be used within <PricingTableView />`,
    );
  }

  return context;
};

export const PricingTableContainer = ({
  children,
  products,
  showFeatures = true,
  className,
  isAnnualToggle,
  setIsAnnualToggle,
  multiInterval,
}: {
  children?: React.ReactNode;
  products?: Product[];
  showFeatures?: boolean;
  className?: string;
  isAnnualToggle: boolean;
  setIsAnnualToggle: (isAnnual: boolean) => void;
  multiInterval: boolean;
}) => {
  if (!products) {
    throw new Error('products is required in <PricingTableView />');
  }

  if (products.length === 0) {
    return null;
  }

  const hasRecommended = products?.some((p) => p.display?.recommend_text);
  return (
    <PricingTableContext.Provider
      value={{ isAnnualToggle, setIsAnnualToggle, products, showFeatures }}
    >
      <div
        className={cn('flex items-center flex-col', hasRecommended && 'py-10!')}
      >
        {multiInterval && (
          <div
            className={cn(
              products.some((p) => p.display?.recommend_text) && 'mb-8',
            )}
          >
            <AnnualSwitch
              isAnnualToggle={isAnnualToggle}
              setIsAnnualToggle={setIsAnnualToggle}
            />
          </div>
        )}
        <div
          className={cn(
            'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] w-full gap-6',
            className,
          )}
        >
          {children}
        </div>
      </div>
    </PricingTableContext.Provider>
  );
};

interface PricingCardViewProps {
  productId: string;
  showFeatures?: boolean;
  className?: string;
}

export const PricingCardView = ({
  productId,
  className,
}: PricingCardViewProps) => {
  const { products, showFeatures } = usePricingTableContext('PricingCardView');

  const product = products.find((p) => p.id === productId);

  if (!product) {
    throw new Error(`Product with id ${productId} not found`);
  }

  const { name, display: productDisplay } = product;

  const isRecommended = productDisplay?.recommend_text;
  const mainPriceDisplay = product.properties?.is_free
    ? {
        primary_text: 'Free',
      }
    : product.items[0].display;

  const featureItems = product.properties?.is_free
    ? product.items
    : product.items.slice(1);

  return (
    <div
      className={cn(
        'group relative w-full h-full py-6 bg-card text-card-foreground border border-border rounded-xl shadow-sm transition-all duration-300 hover:shadow-lg hover:scale-[1.02] max-w-xl',
        isRecommended &&
          'lg:-translate-y-6 lg:shadow-xl lg:h-[calc(100%+48px)] bg-card-secondary border-primary/30 hover:border-primary/50 hover:shadow-[0_20px_25px_-5px_rgb(var(--primary)/0.2)]',
        className,
      )}
    >
      {productDisplay?.recommend_text && (
        <RecommendedBadge recommended={productDisplay?.recommend_text} />
      )}
      <div
        className={cn(
          'flex flex-col h-full grow',
          isRecommended && 'lg:translate-y-6',
        )}
      >
        <div className="h-full">
          <div className="flex flex-col">
            <div className="pb-4">
              <h2 className="text-2xl font-semibold px-6 truncate">
                {productDisplay?.name || name}
              </h2>
              {productDisplay?.description && (
                <div className="text-sm text-muted-foreground px-6 mt-2">
                  <p className="line-clamp-2">{productDisplay?.description}</p>
                </div>
              )}
            </div>
            <div className="mb-4">
              <h3 className="font-semibold h-16 flex px-6 items-center border-y border-border mb-4 bg-muted/50">
                <div className="line-clamp-2">
                  {mainPriceDisplay?.primary_text}{' '}
                  {mainPriceDisplay?.secondary_text && (
                    <span className="font-normal text-muted-foreground mt-1">
                      {mainPriceDisplay?.secondary_text}
                    </span>
                  )}
                </div>
              </h3>
            </div>
          </div>
          {showFeatures && featureItems.length > 0 && (
            <div className="grow px-6">
              <PricingFeatureList
                items={featureItems}
                everythingFrom={product.display?.everything_from}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Pricing Feature List
export const PricingFeatureList = ({
  items,
  everythingFrom,
  className,
}: {
  items: ProductItem[];
  everythingFrom?: string;
  className?: string;
}) => {
  return (
    <div className={cn('grow', className)}>
      {everythingFrom && (
        <p className="text-sm mb-4">Everything from {everythingFrom}, plus:</p>
      )}
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-start gap-2 text-sm">
            <div className="flex flex-col">
              <span>{item.display?.primary_text}</span>
              {item.display?.secondary_text && (
                <span className="text-sm text-muted-foreground">
                  {item.display?.secondary_text}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Annual Switch
export const AnnualSwitch = ({
  isAnnualToggle,
  setIsAnnualToggle,
}: {
  isAnnualToggle: boolean;
  setIsAnnualToggle: (isAnnual: boolean) => void;
}) => {
  return (
    <div className="flex items-center space-x-2 mb-4">
      <span className="text-sm text-muted-foreground">Monthly</span>
      <Switch checked={isAnnualToggle} onCheckedChange={setIsAnnualToggle} />
      <span className="text-sm text-muted-foreground">Annual</span>
    </div>
  );
};

export const RecommendedBadge = ({ recommended }: { recommended: string }) => {
  return (
    <div className="absolute bg-primary text-primary-foreground border border-primary-border text-sm font-medium lg:rounded-full px-3 lg:py-0.5 lg:top-4 lg:right-4 -top-px -right-px rounded-bl-lg shadow-sm">
      {recommended}
    </div>
  );
};
