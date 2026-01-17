import { gunzipSync, gzipSync } from "zlib";
async function compressFiles(files, options = {}) {
    try {
        const { level = 6, includeMetadata = true, version = '1.0.0' } = options;
        const manifest = {
            version,
            createdAt: new Date().toISOString(),
            fileCount: files.length,
            files: files.map((file)=>({
                    id: file.id,
                    path: file.path,
                    contentLength: file.content.length,
                    metadata: includeMetadata ? file.metadata : void 0
                }))
        };
        const archiveData = {
            manifest,
            files: files.map((file)=>({
                    id: file.id,
                    path: file.path,
                    content: file.content,
                    metadata: includeMetadata ? file.metadata : void 0
                }))
        };
        const jsonString = JSON.stringify(archiveData, null, 0);
        const data = Buffer.from(jsonString, 'utf8');
        const compressed = gzipSync(data, {
            level: Math.max(1, Math.min(9, level))
        });
        return new Uint8Array(compressed);
    } catch (error) {
        throw new Error(`Failed to compress files: ${error}`);
    }
}
async function decompressFiles(compressedData) {
    try {
        const decompressed = gunzipSync(Buffer.from(compressedData));
        const jsonString = decompressed.toString('utf8');
        const archiveData = JSON.parse(jsonString);
        if (!archiveData.manifest || !archiveData.files) throw new Error('Invalid archive format: missing manifest or files');
        const files = archiveData.files.map((file)=>({
                id: file.id,
                path: file.path,
                content: file.content,
                metadata: file.metadata
            }));
        return {
            files,
            manifest: archiveData.manifest
        };
    } catch (error) {
        throw new Error(`Failed to decompress files: ${error}`);
    }
}
export { compressFiles, decompressFiles };
