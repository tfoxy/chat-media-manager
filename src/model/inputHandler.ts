import { isNotNullable } from "./assertions";
import electronAPI from "./electronAPI";
import { fetchMediaFileList } from "./electronAPIUtils";
import { RowMessageMedia, transformMedia } from "./mediaTransformer";
import { getContactMap, getMediaList } from "./query";
import { Contact, createDatabase } from "./sql";

export async function loadContactMapFromWaFile(
  waFileBuffer: ArrayBuffer
): Promise<Map<string, Contact>> {
  const db = await createDatabase(new Uint8Array(waFileBuffer));
  return getContactMap(db);
}

async function loadRawMediaFromKey(keyFileBuffer: ArrayBuffer) {
  const msgStoreUrl = await electronAPI.fetchMediaMsgStore(keyFileBuffer);
  const response = await fetch(msgStoreUrl);
  const buffer = await response.arrayBuffer();
  const db = await createDatabase(new Uint8Array(buffer));
  return getMediaList(db);
}

export async function loadMediaFromKey(
  keyFileBuffer: ArrayBuffer,
  contactMap: Map<string, Contact>
): Promise<RowMessageMedia[]> {
  const [rawMediaList, fileSizeMap] = await Promise.all([
    loadRawMediaFromKey(keyFileBuffer),
    fetchMediaFileList(),
  ]);
  return rawMediaList
    .map((m) => transformMedia(m, contactMap, fileSizeMap))
    .filter((m) => isNotNullable(m.realFileSize));
}
