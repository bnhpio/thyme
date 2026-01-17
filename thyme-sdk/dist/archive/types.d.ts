export interface FileEntry {
    /** Unique identifier for the file */
    id: string;
    /** File path or name */
    path: string;
    /** File content as string */
    content: string;
    /** Optional metadata */
    metadata?: Record<string, unknown>;
}
export interface ArchiveManifest {
    /** Version of the archive format */
    version: string;
    /** Timestamp when archive was created */
    createdAt: string;
    /** Total number of files */
    fileCount: number;
    /** List of file entries with their metadata */
    files: Array<{
        id: string;
        path: string;
        contentLength: number;
        metadata?: Record<string, unknown>;
    }>;
}
export interface CompressOptions {
    /** Compression level (1-9, default: 6) */
    level?: number;
    /** Include file metadata in archive */
    includeMetadata?: boolean;
    /** Custom archive version */
    version?: string;
}
export interface DecompressResult {
    /** Extracted files */
    files: FileEntry[];
    /** Archive manifest */
    manifest: ArchiveManifest;
}
