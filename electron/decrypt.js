const { createDecipheriv } = require("crypto");
const { unzip } = require("zlib");

/**
 * @param {Buffer} dataBuffer Buffer from `msgstore.db.crypt14` file
 * @param {Buffer} keyBuffer Buffer from `key` file
 * @returns {Promise<Buffer>} Unencrypted/Unzipped content of `msgstore.db.crypt14` (`msgstore.db`)
 */
module.exports = function decrypt14(dataBuffer, keyBuffer) {
  return new Promise((resolve, reject) => {
    const key = keyBuffer.slice(126);
    const data = dataBuffer.slice(191);
    const iv = dataBuffer.slice(67, 83);

    const decipher = createDecipheriv("aes-256-gcm", key, iv);
    const zippedData = decipher.update(data);

    unzip(zippedData, (err, buffer) => {
      if (err) {
        reject(err);
      } else {
        resolve(buffer);
      }
    });
  });
};
