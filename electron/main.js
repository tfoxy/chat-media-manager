// try {
//   require("electron-reloader")(module);
// } catch {}

const path = require("path");
const {
  app,
  BrowserWindow,
  ipcMain,
  session,
  protocol,
  webFrame,
} = require("electron");
const api = require("./api");
const { setMainWindow } = require("./mainWindow");
const { TMP_PROTOCOL, getTempPath, REMOTE_PROTOCOL } = require("./tmp");
const { fetchMedia } = require("./api");

const isDev = process.env.IS_DEV === "true";

configureApp();

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 640,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      sandbox: true,
    },
    icon: path.resolve(__dirname, "../public/favicon.svg"),
  });
  setMainWindow(mainWindow);

  if (isDev) {
    mainWindow.loadURL("http://localhost:3000");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile("index.html");
  }
}

function configureSession() {
  // See https://www.electronjs.org/docs/latest/tutorial/security#7-define-a-content-security-policy
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        // unsafe-eval is for WebAssembly. unsafe-inline for hot-reloaded inline css
        "Content-Security-Policy": isDev
          ? [
              `default-src 'self' localhost:8098 ws://localhost:8098 'unsafe-inline' 'unsafe-eval' ${TMP_PROTOCOL}: ${REMOTE_PROTOCOL}:`,
            ]
          : ["default-src 'none'"],
      },
    });
  });
}

function preconfigureProtocol() {
  protocol.registerSchemesAsPrivileged([
    { scheme: TMP_PROTOCOL, privileges: { supportFetchAPI: true } },
  ]);
}

function configureProtocol() {
  protocol.registerFileProtocol(TMP_PROTOCOL, (request, callback) => {
    const url = request.url.slice(TMP_PROTOCOL.length + 3);
    const tempPath = getTempPath(url);
    callback(tempPath);
  });
  protocol.registerFileProtocol(REMOTE_PROTOCOL, async (request, callback) => {
    try {
      const url = request.url.slice(REMOTE_PROTOCOL.length + 3);
      const tempPath = await fetchMedia(url, true);
      callback(tempPath);
    } catch (error) {
      callback({
        statusCode: 404,
        headers: { "x-error-message": error?.message ?? error },
      });
    }
  });
}

function configureIpc() {
  // TODO validate name
  ipcMain.handle("invoke", (event, name, ...args) => api[name](...args));
}

function configureApp() {
  preconfigureProtocol();
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.whenReady().then(() => {
    configureSession();
    configureProtocol();
    configureIpc();
    createWindow();
    app.on("activate", () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
}
