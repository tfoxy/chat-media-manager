export const readFile = async (
  handle: FileSystemDirectoryHandle,
  path: string
): Promise<File> => {
  const parts = path.split("/");
  const filename = parts.pop() ?? "";
  for (const folderName of parts) {
    handle = await handle.getDirectoryHandle(folderName);
  }
  const fileHandle = await handle.getFileHandle(filename);
  return fileHandle.getFile();
};

export const writeFile = async (
  handle: FileSystemDirectoryHandle,
  path: string,
  data: FileSystemWriteChunkType
): Promise<void> => {
  const parts = path.split("/");
  const filename = parts.pop() ?? "";
  for (const folderName of parts) {
    handle = await handle.getDirectoryHandle(folderName, { create: true });
  }
  const fileHandle = await handle.getFileHandle(filename, { create: true });
  if ((await fileHandle.getFile()).size) {
    return;
  }
  const stream = await fileHandle.createWritable();
  await stream.write(data);
  await stream.close();
};

export const mkdir = async (
  handle: FileSystemDirectoryHandle,
  path: string
): Promise<FileSystemDirectoryHandle> => {
  const parts = path.split("/");
  for (const folderName of parts) {
    handle = await handle.getDirectoryHandle(folderName, { create: true });
  }
  return handle;
};

export const exists = async (
  handle: FileSystemDirectoryHandle,
  name: string
): Promise<boolean> => {
  try {
    await handle.getFileHandle(name);
    return true;
  } catch (err) {
    if (
      err instanceof DOMException &&
      err.code === DOMException.NOT_FOUND_ERR
    ) {
      return false;
    }
    throw err;
  }
};
