import electronAPI from "./electronAPI";

/**
 * @returns map of file path as key and file size as value
 */
export async function fetchMediaFileList(): Promise<Map<string, number>> {
  const fileList = await electronAPI.fetchMediaFileList();
  const fileSizeMap = new Map<string, number>();
  for (const line of fileList.split("\n")) {
    const match = line.match(/^(.+)\t(\d+)$/);
    if (!match) continue;
    const [, fileName, fileSize] = match;
    fileSizeMap.set(fileName, Number(fileSize));
  }
  return fileSizeMap;
}
