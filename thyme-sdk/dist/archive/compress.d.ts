import type { CompressOptions, FileEntry } from './';
/**
 * Compresses multiple files into a single gzipped archive
 * Uses a more robust format with JSON manifest and base64-encoded content
 */
export declare function compressFiles(files: FileEntry[], options?: CompressOptions): Promise<Uint8Array>;
