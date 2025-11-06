import type { Id } from '@/../convex/_generated/dataModel';
import type { Organization } from './types';

export const formatDate = (timestamp: number | null): string => {
  if (!timestamp) return 'Never';
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const getOrganizationNames = (
  orgIds: Id<'organizations'>[],
  organizations: Organization[] | undefined,
): string => {
  if (!organizations) return '';
  return orgIds
    .map(
      (id) => organizations.find((org) => org._id === id)?.name,
    )
    .filter(Boolean)
    .join(', ');
};

export const calculateExpirationDate = (
  expiration: string,
): number | null => {
  const now = Date.now();
  if (expiration === '7weeks') {
    return now + 7 * 7 * 24 * 60 * 60 * 1000;
  } else if (expiration === '30days') {
    return now + 30 * 24 * 60 * 60 * 1000;
  } else if (expiration === '90days') {
    return now + 90 * 24 * 60 * 60 * 1000;
  }
  return null;
};

export const generateMockKeyHash = (): string => {
  const prefix = Math.random() > 0.5 ? 'sk_live_' : 'sk_dev_';
  const randomHash = Array.from(
    { length: 40 },
    () => Math.random().toString(36)[2],
  ).join('');
  return `${prefix}${randomHash}`;
};

