import type { Id } from '@/../convex/_generated/dataModel';

export type ApiKey = {
  id: string;
  name: string;
  keyHash: string;
  organizationIds: Id<'organizations'>[];
  expiresAt: number | null;
  createdAt: number;
  lastUsedAt: number | null;
  isActive: boolean;
};

export type Organization = {
  _id: Id<'organizations'>;
  name: string;
};

