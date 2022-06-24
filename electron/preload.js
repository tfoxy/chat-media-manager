const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("_electronAPI", {
  exists: true,
  invoke: (name, ...args) => ipcRenderer.invoke("invoke", name, ...args),
  on: (name, callback) => {
    const _callback = (event, _name, ...args) => {
      if (_name === name) {
        callback(...args);
      }
    };
    ipcRenderer.on("event", _callback);
    return () => ipcRenderer.off("event", _callback);
  },
});
