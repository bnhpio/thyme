export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const calculateExpirationDate = (expiration: string): number => {
  const now = Date.now();
  if (expiration === '7weeks') {
    return now + 7 * 7 * 24 * 60 * 60 * 1000;
  }
  if (expiration === '30days') {
    return now + 30 * 24 * 60 * 60 * 1000;
  }
  if (expiration === '90days') {
    return now + 90 * 24 * 60 * 60 * 1000;
  }
  return now;
};
