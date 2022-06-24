/**
 * @type {import("electron").BrowserWindow | undefined}
 */
let win;

exports.getMainWindow = function getMainWindow() {
  return win;
};

/**
 * @param {import("electron").BrowserWindow} mainWindow
 */
exports.setMainWindow = function setMainWindow(mainWindow) {
  win = mainWindow;
};
