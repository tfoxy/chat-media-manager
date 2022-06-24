const { mkdir, readFile, writeFile } = require("fs/promises");
const { dirname } = require("path");
const { resolve } = require("path/posix");
const adb = require("./adb");
const decrypt14 = require("./decrypt");
const { exists } = require("./fs");
const { getTempPath, getTempUrl } = require("./tmp");

function shellEscape(string) {
  return `'${string.replace("'", "'\"'\"'")}'`;
}

/**
 * @param {string} remotePath
 */
function getAbsoluteRemotePath(remotePath) {
  return resolve(
    "/storage/emulated/0/Android/media/com.whatsapp/WhatsApp",
    remotePath
  );
}

/**
 * @param {string} remotePath
 */
function getLocalRemotePath(remotePath) {
  const absRemotePath = getAbsoluteRemotePath(remotePath);
  return getTempPath("remote", absRemotePath);
}

function getRemoteUrl(remotePath) {
  const absRemotePath = getAbsoluteRemotePath(remotePath);
  return getTempUrl("remote", absRemotePath);
}

/**
 * @returns {Promise<string>}
 */
function fetchAdbContacts() {
  return adb([
    "shell",
    "content",
    "query",
    "--uri content://com.android.contacts/data",
    "--projection",
    "display_name:data1",
    "--where",
    'account_type=\\"com.whatsapp\\"\\ AND\\ data1\\ LIKE\\ \\"%@s.whatsapp.net\\"',
  ]);
}

function fetchMediaFileList() {
  return adb([
    "shell",
    "find",
    shellEscape(getAbsoluteRemotePath("")),
    "-type",
    "f",
    "-printf",
    '"%P\\t%s\\n"',
  ]);
}

async function fetchMedia(remotePath, realPath = false) {
  const localPath = getLocalRemotePath(remotePath);
  if (!(await exists(localPath))) {
    await mkdir(dirname(localPath), { recursive: true });
    await adb(["pull", "-a", getAbsoluteRemotePath(remotePath), localPath]);
  }
  return realPath ? localPath : getRemoteUrl(remotePath);
}

/**
 * @param {ArrayBuffer} keyBuffer
 */
async function fetchMediaMsgStore(keyArrayBuffer) {
  const cryptLocalPath = await fetchMedia(
    "Databases/msgstore.db.crypt14",
    true
  );
  const dataBuffer = await readFile(cryptLocalPath);
  const keyBuffer = Buffer.from(keyArrayBuffer);
  const decryptedBuffer = await decrypt14(dataBuffer, keyBuffer);
  const localPath = getTempPath("msgstore.db");
  await writeFile(localPath, decryptedBuffer);
  return getTempUrl("msgstore.db");
}

function fetchRootMsgStore() {
  return fetchMedia("/data/data/com.whatsapp/databases/msgstore.db");
}

function fetchRootContactStore() {
  return fetchMedia("/data/data/com.whatsapp/databases/wa.db");
}

function fetchRootKey() {
  return fetchMedia("/data/data/com.whatsapp/files/key");
}

/**
 * @param {string} remotePath
 */
async function deleteMedia(remotePath) {
  await adb(["shell", "rm", shellEscape(getAbsoluteRemotePath(remotePath))]);
}

async function recoverMedia(remotePath) {
  await adb([
    "push",
    getLocalRemotePath(remotePath),
    getAbsoluteRemotePath(remotePath),
  ]);
}

const api = {
  fetchAdbContacts,
  fetchMedia,
  fetchMediaFileList,
  fetchMediaMsgStore,
  fetchRootContactStore,
  fetchRootKey,
  fetchRootMsgStore,
  deleteMedia,
  recoverMedia,
};

module.exports = api;
