import { decompressTask as sdkDecompressTask } from '@thyme-sh/sdk';

export interface DecompressedTask {
  source: string;
  bundle: string;
}

/**
 * Decompress ZIP archive and extract source and bundle files
 * Uses SDK's decompression function with fflate
 */
export function decompressTask(zipBuffer: ArrayBuffer): DecompressedTask {
  return sdkDecompressTask(zipBuffer);
}
