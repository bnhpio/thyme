import {
  ARBITRUM_LOGO,
  BASE_LOGO,
  BNB_LOGO,
  ETHEREUM_LOGO,
  OPTIMISM_LOGO,
  POLYGON_LOGO,
} from '@/assets';

export interface ChainData {
  name: string;
  logo: string;
  chainId?: number;
}

export const CHAINS: ChainData[] = [
  { name: 'Ethereum', logo: ETHEREUM_LOGO },
  { name: 'Polygon', logo: POLYGON_LOGO },
  { name: 'Arbitrum', logo: ARBITRUM_LOGO },
  { name: 'Optimism', logo: OPTIMISM_LOGO },
  { name: 'Base', logo: BASE_LOGO },
  { name: 'BNB Chain', logo: BNB_LOGO },
  // Note: Avalanche and zkSync logos are not available in assets yet
  // { name: 'Avalanche', logo: AVALANCHE_LOGO },
  // { name: 'zkSync', logo: ZKSYNC_LOGO },
];
