import type { Id } from '@/../convex/_generated/dataModel';

export type ApiKey = {
  id: Id<'userCustomTokens'>;
  name: string;
  expiresAt: number;
  organzations: Id<'organizations'>[]; // Note: typo in schema
};

export type Organization = {
  _id: Id<'organizations'>;
  name: string;
};
