import type { DecompressResult } from './';
/**
 * Decompresses a gzipped archive containing multiple files
 * Returns both the extracted files and the archive manifest
 */
export declare function decompressFiles(compressedData: Uint8Array): Promise<DecompressResult>;
