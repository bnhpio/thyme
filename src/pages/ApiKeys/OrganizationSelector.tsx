import { X } from 'lucide-react';
import type { Id } from '@/../convex/_generated/dataModel';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { Organization } from './types';

interface OrganizationSelectorProps {
  organizations: Organization[] | undefined;
  selectedOrgs: Id<'organizations'>[];
  onSelectionChange: (orgId: Id<'organizations'>) => void;
}

export function OrganizationSelector({
  organizations,
  selectedOrgs,
  onSelectionChange,
}: OrganizationSelectorProps) {
  if (!organizations || organizations.length === 0) {
    return (
      <div className="space-y-2">
        <Label>Organizations</Label>
        <div className="text-sm text-muted-foreground p-4 border rounded-lg bg-muted/30 border-dashed">
          <p>No organizations available.</p>
          <p className="text-xs mt-1">
            Create an organization first to assign it to API keys.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 ">
      <Label>Organizations</Label>
      <div className="flex flex-wrap gap-2 border rounded-lg p-3.5 min-h-12 max-h-48 overflow-y-auto  ">
        {organizations.map((org) => {
          const isSelected = selectedOrgs.includes(org._id);
          return (
            <button
              key={org._id}
              type="button"
              onClick={() => onSelectionChange(org._id)}
              className={cn(
                'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 shadow-sm',
                isSelected
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md scale-105'
                  : 'bg-muted/50 text-foreground hover:bg-muted hover:border-primary/20 border border-border/50',
              )}
            >
              <span className="leading-none">{org.name}</span>
              {isSelected && (
                <X
                  className="h-3.5 w-3.5 opacity-80 hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectionChange(org._id);
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
      {selectedOrgs.length > 0 && (
        <p className="text-xs text-muted-foreground mt-1">
          {selectedOrgs.length} organization
          {selectedOrgs.length > 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  );
}
