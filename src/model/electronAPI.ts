declare global {
  var _electronAPI: GlobalElectronAPI | undefined;
}

interface GlobalElectronAPI {
  exists: true;
  invoke<T>(name: string, ...args: unknown[]): Promise<T>;
  on(name: string, callback: (...args: never[]) => void): () => void;
}

function createElectronAPI(api: GlobalElectronAPI) {
  return {
    fetchAdbContacts: () => api.invoke<string>("fetchAdbContacts"),
    fetchMedia: (remotePath: string) =>
      api.invoke<string>("fetchMedia", remotePath),
    fetchMediaFileList: () => api.invoke<string>("fetchMediaFileList"),
    fetchMediaMsgStore: (keyBuffer: ArrayBuffer) =>
      api.invoke<string>("fetchMediaMsgStore", keyBuffer),
    fetchRootContactStore: () => api.invoke<string>("fetchRootContactStore"),
    fetchRootKey: () => api.invoke<string>("fetchRootKey"),
    fetchRootMsgStore: () => api.invoke<string>("fetchRootMsgStore"),
    deleteMedia: (remotePath: string) =>
      api.invoke<void>("deleteMedia", remotePath),
    onAdbOutput: (callback: (output: string) => void) =>
      api.on("adbOutput", callback),
    recoverMedia: (remotePath: string) =>
      api.invoke<void>("recoverMedia", remotePath),
  };
}

export type ElectronAPI = ReturnType<typeof createElectronAPI>;

// export default self._electronAPI?.exists
//   ? createElectronAPI(self._electronAPI)
//   : undefined;
export default createElectronAPI(self._electronAPI!);
