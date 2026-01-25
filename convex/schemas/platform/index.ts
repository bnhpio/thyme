import globalChainTable from './globalChain';
import organizationChainTable from './organizationChain';
import platformConfigTable from './platformConfig';

export const platformSchema = {
  globalChains: globalChainTable,
  organizationChains: organizationChainTable,
  platformConfig: platformConfigTable,
};
