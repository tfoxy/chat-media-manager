const { app } = require("electron");
const { join, normalize } = require("path");
const { join: posixJoin } = require("path/posix");

const TMP_PROTOCOL = "tmp";
const REMOTE_PROTOCOL = "remote";

const tempPath = join(app.getPath("temp"), "chat-media-manager");

/**
 * @param  {...string} paths
 */
function getTempPath(...paths) {
  const fullPath = join(tempPath, normalize(join(...paths)));
  if (!fullPath.startsWith(tempPath)) {
    throw new Error(
      `Cannot read files outside tmp folder. Path: "${fullPath}". tmp folder: "${tempPath}"`
    );
  }
  return fullPath;
}

/**
 * @param  {...string} paths
 */
function getTempUrl(...paths) {
  return new URL(posixJoin(...paths), `${TMP_PROTOCOL}://`).href;
}

module.exports = { TMP_PROTOCOL, REMOTE_PROTOCOL, getTempPath, getTempUrl };
