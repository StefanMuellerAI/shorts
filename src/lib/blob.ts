export function getBlobDisplayUrl(blobUrl: string): string {
  if (!blobUrl) return "";
  if (blobUrl.includes(".private.blob.vercel-storage.com")) {
    return `/api/blob?url=${encodeURIComponent(blobUrl)}`;
  }
  return blobUrl;
}
